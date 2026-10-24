defmodule IronMatch.Workouts.ActiveSessionServer do
  @moduledoc """
  Stateful OTP `GenServer` backing an active solo or multi-user group workout session.

  Handles:
  - Difficulty Dial (`:deload` 0.9x, `:target` 1.0x, `:beast` 1.025x)
  - Set logging, RPE/RIR autoregulation feedback, and strict Big 4 PR detection
  - Mid-workout exercise addition with smart weight pre-fill from previous history
  - In-workout Combat Physio exercise swaps (`swap_exercise/4`)
  - Server-authoritative rest timer ticks broadcast via `Phoenix.PubSub`
  """
  use GenServer, restart: :transient

  alias IronMatch.Gamification
  alias IronMatch.Physio.CombatPhysio
  alias IronMatch.Workouts.{Autoregulation, Exercises}

  @pubsub IronMatch.PubSub

  defstruct [
    :session_id,
    :user_id,
    :title,
    :day_id,
    :started_at,
    difficulty: :target,
    unit: :kg,
    exercises: [],
    prev_history_map: %{},
    user_big4: %{squat: 0, bench: 0, deadlift: 0, ohp: 0},
    new_prs: [],
    autoregulation_banner: nil,
    rest_seconds_remaining: 0,
    rest_timer_active: false,
    participants: []
  ]

  # ============================================================================
  # Client API
  # ============================================================================

  def start_link(attrs) do
    session_id = Map.fetch!(attrs, :session_id)
    GenServer.start_link(__MODULE__, attrs, name: via_tuple(session_id))
  end

  def via_tuple(session_id) do
    {:via, Registry, {IronMatch.SessionRegistry, session_id}}
  end

  def get_state(session_or_pid) do
    GenServer.call(resolve(session_or_pid), :get_state)
  end

  def set_difficulty(session_or_pid, mode) when mode in [:deload, :target, :beast] do
    GenServer.call(resolve(session_or_pid), {:set_difficulty, mode})
  end

  def update_set(session_or_pid, ex_idx, set_idx, field, value) do
    GenServer.call(resolve(session_or_pid), {:update_set, ex_idx, set_idx, field, value})
  end

  def toggle_complete_set(session_or_pid, ex_idx, set_idx) do
    GenServer.call(resolve(session_or_pid), {:toggle_complete_set, ex_idx, set_idx})
  end

  def add_set(session_or_pid, ex_idx) do
    GenServer.call(resolve(session_or_pid), {:add_set, ex_idx})
  end

  def add_exercise(session_or_pid, exercise_name) do
    GenServer.call(resolve(session_or_pid), {:add_exercise, exercise_name})
  end

  def swap_exercise(session_or_pid, ex_idx, zone_id) do
    GenServer.call(resolve(session_or_pid), {:swap_exercise, ex_idx, zone_id})
  end

  def start_rest_timer(session_or_pid, seconds) do
    GenServer.call(resolve(session_or_pid), {:start_rest_timer, seconds})
  end

  def stop_Session(session_or_pid) do
    GenServer.call(resolve(session_or_pid), :finish_workout)
  end

  defp resolve(pid) when is_pid(pid), do: pid
  defp resolve(session_id) when is_binary(session_id), do: via_tuple(session_id)

  # ============================================================================
  # GenServer Callbacks
  # ============================================================================

  @impl true
  def init(attrs) do
    :timer.send_interval(1_000, self(), :tick_rest_timer)

    state = %__MODULE__{
      session_id: attrs[:session_id],
      user_id: attrs[:user_id] || "athlete_1",
      title: attrs[:title] || "Freestyle Session",
      day_id: attrs[:day_id] || "freestyle",
      started_at: System.system_time(:second),
      difficulty: attrs[:difficulty] || :target,
      unit: attrs[:unit] || :kg,
      exercises: normalize_exercises(attrs[:exercises] || []),
      prev_history_map: attrs[:prev_history_map] || %{},
      user_big4: attrs[:user_big4] || %{squat: 100, bench: 80, deadlift: 140, ohp: 50},
      participants: [attrs[:user_id] || "athlete_1"]
    }

    {:ok, state}
  end

  @impl true
  def handle_call(:get_state, _from, state) do
    {:reply, state, state}
  end

  @impl true
  def handle_call({:set_difficulty, mode}, _from, state) do
    multiplier =
      case mode do
        :deload -> 0.90
        :target -> 1.00
        :beast -> 1.025
      end

    step = if state.unit == :lbs, do: 5.0, else: 2.5

    updated_exercises =
      Enum.map(state.exercises, fn ex ->
        sets =
          Enum.map(ex.sets, fn set ->
            if set.completed do
              set
            else
              base = set[:base_weight] || set.weight
              scaled = round_to_step(base * multiplier, step)
              %{set | weight: scaled}
            end
          end)

        %{ex | sets: sets}
      end)

    new_state = %{state | difficulty: mode, exercises: updated_exercises}
    broadcast!(new_state)
    {:reply, {:ok, new_state}, new_state}
  end

  @impl true
  def handle_call({:update_set, ex_idx, set_idx, field, value}, _from, state) do
    updated_exercises =
      List.update_at(state.exercises, ex_idx, fn ex ->
        sets =
          List.update_at(ex.sets, set_idx, fn set ->
            Map.put(set, field, value)
          end)

        %{ex | sets: sets}
      end)

    new_state = %{state | exercises: updated_exercises}
    broadcast!(new_state)
    {:reply, {:ok, new_state}, new_state}
  end

  @impl true
  def handle_call({:toggle_complete_set, ex_idx, set_idx}, _from, state) do
    ex = Enum.at(state.exercises, ex_idx)
    set = Enum.at(ex.sets, set_idx)
    now_completed = !set.completed

    updated_set = %{set | completed: now_completed}

    # Evaluate autoregulation if RPE was logged
    autoreg =
      if now_completed do
        Autoregulation.evaluate_set(updated_set.weight, updated_set.rpe, 8.0, state.unit)
      else
        state.autoregulation_banner
      end

    # Strict Big 4 Epley 1RM PR Detection
    {updated_big4, updated_prs} =
      if now_completed do
        check_big4_pr(ex.name, updated_set.weight, updated_set.reps, state.user_big4, state.new_prs)
      else
        {state.user_big4, state.new_prs}
      end

    updated_exercises =
      List.update_at(state.exercises, ex_idx, fn e ->
        %{e | sets: List.replace_at(e.sets, set_idx, updated_set)}
      end)

    new_state = %{
      state
      | exercises: updated_exercises,
        autoregulation_banner: autoreg,
        user_big4: updated_big4,
        new_prs: updated_prs,
        rest_seconds_remaining: if(now_completed, do: ex.rest_seconds, else: state.rest_seconds_remaining),
        rest_timer_active: if(now_completed, do: true, else: state.rest_timer_active)
    }

    broadcast!(new_state)
    {:reply, {:ok, new_state}, new_state}
  end

  @impl true
  def handle_call({:add_set, ex_idx}, _from, state) do
    updated_exercises =
      List.update_at(state.exercises, ex_idx, fn ex ->
        last_set = List.last(ex.sets) || %{weight: 20.0, base_weight: 20.0, reps: 8, rpe: 8.0}

        new_set = %{
          set_number: length(ex.sets) + 1,
          weight: last_set.weight,
          base_weight: last_set[:base_weight] || last_set.weight,
          reps: last_set.reps,
          rpe: 8.0,
          completed: false
        }

        %{ex | sets: ex.sets ++ [new_set]}
      end)

    new_state = %{state | exercises: updated_exercises}
    broadcast!(new_state)
    {:reply, {:ok, new_state}, new_state}
  end

  @impl true
  def handle_call({:add_exercise, exercise_name}, _from, state) do
    key = String.downcase(String.trim(exercise_name))
    prev = Map.get(state.prev_history_map, key)
    meta = Exercises.find_by_name(exercise_name)

    default_weight =
      cond do
        prev && prev[:weight] && prev[:weight] > 0 ->
          prev[:weight]

        meta && meta.category == :compound ->
          if state.unit == :lbs, do: 95.0, else: 40.0

        true ->
          if state.unit == :lbs, do: 25.0, else: 12.5
      end

    default_reps = if prev && prev[:reps], do: prev[:reps], else: 8

    new_ex = %{
      id: "ex_#{System.unique_integer([:positive])}",
      name: exercise_name,
      category: if(meta, do: meta.category, else: :accessory),
      rest_seconds: if(meta && meta.category == :compound, do: 150, else: 90),
      previous_best: prev,
      sets:
        for idx <- 1..3 do
          %{
            set_number: idx,
            weight: default_weight,
            base_weight: default_weight,
            reps: default_reps,
            rpe: 8.0,
            completed: false
          }
        end
    }

    new_state = %{state | exercises: state.exercises ++ [new_ex]}
    broadcast!(new_state)
    {:reply, {:ok, new_state}, new_state}
  end

  @impl true
  def handle_call({:swap_exercise, ex_idx, zone_id}, _from, state) do
    current_ex = Enum.at(state.exercises, ex_idx)
    {:ok, result} = CombatPhysio.recommend_swap(zone_id, current_ex.name)

    step = if state.unit == :lbs, do: 5.0, else: 2.5

    swapped_ex = %{
      current_ex
      | name: result.replacement_exercise,
        sets:
          Enum.map(current_ex.sets, fn set ->
            scaled = round_to_step(set.weight * result.load_multiplier, step)
            %{set | weight: scaled, base_weight: scaled}
          end)
    }

    updated_exercises = List.replace_at(state.exercises, ex_idx, swapped_ex)
    new_state = %{state | exercises: updated_exercises}
    broadcast!(new_state)
    {:reply, {:ok, new_state, result}, new_state}
  end

  @impl true
  def handle_call({:start_rest_timer, seconds}, _from, state) do
    new_state = %{state | rest_seconds_remaining: seconds, rest_timer_active: true}
    broadcast!(new_state)
    {:reply, {:ok, new_state}, new_state}
  end

  @impl true
  def handle_call(:finish_workout, _from, state) do
    total_tonnage =
      state.exercises
      |> Enum.flat_map(& &1.sets)
      |> Enum.filter(& &1.completed)
      |> Enum.reduce(0.0, fn s, acc -> acc + s.weight * s.reps end)
      |> Float.round(1)

    summary = %{
      session_id: state.session_id,
      user_id: state.user_id,
      title: state.title,
      duration_seconds: max(1, System.system_time(:second) - state.started_at),
      total_tonnage: total_tonnage,
      new_prs: state.new_prs,
      updated_big4: state.user_big4,
      exercises: state.exercises
    }

    Phoenix.PubSub.broadcast(@pubsub, "workout:#{state.session_id}", {:workout_finished, summary})
    {:stop, :normal, {:ok, summary}, state}
  end

  @impl true
  def handle_info(:tick_rest_timer, state) do
    if state.rest_timer_active and state.rest_seconds_remaining > 0 do
      remaining = state.rest_seconds_remaining - 1
      new_state = %{state | rest_seconds_remaining: remaining, rest_timer_active: remaining > 0}
      broadcast!(new_state)
      {:noreply, new_state}
    else
      {:noreply, state}
    end
  end

  # ============================================================================
  # Internal Helpers
  # ============================================================================

  defp normalize_exercises(exercises) do
    Enum.map(exercises, fn ex ->
      sets =
        Enum.map(ex[:sets] || [], fn s ->
          Map.merge(
            %{
              set_number: 1,
              weight: 20.0,
              base_weight: s[:weight] || 20.0,
              reps: 8,
              rpe: 8.0,
              completed: false
            },
            s
          )
        end)

      Map.merge(
        %{
          id: "ex_#{System.unique_integer([:positive])}",
          name: "Barbell Bench Press",
          category: :compound,
          rest_seconds: 120,
          previous_best: nil,
          sets: sets
        },
        ex
      )
    end)
  end

  defp check_big4_pr(exercise_name, weight, reps, user_big4, existing_prs) do
    case Exercises.big4_slot(exercise_name) do
      nil ->
        {user_big4, existing_prs}

      slot ->
        e1rm = round(Gamification.estimate_1rm(weight, reps))
        current_best = Map.get(user_big4, slot, 0)

        if e1rm > current_best and weight > 0 and reps > 0 do
          pr_entry = %{lift: slot, exercise: exercise_name, old_1rm: current_best, new_1rm: e1rm}
          {Map.put(user_big4, slot, e1rm), [pr_entry | existing_prs]}
        else
          {user_big4, existing_prs}
        end
    end
  end

  defp round_to_step(val, step) do
    Float.round(Float.round(val / step) * step, 1)
  end

  defp broadcast!(state) do
    Phoenix.PubSub.broadcast(@pubsub, "workout:#{state.session_id}", {:session_updated, state})
  end
end
