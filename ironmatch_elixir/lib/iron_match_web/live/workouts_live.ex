defmodule IronMatchWeb.WorkoutsLive do
  @moduledoc """
  Phoenix LiveView for the Workouts Hub & OTP Active Workout Session.

  Features:
  - 4-Day Tendon & Strength Split + 1-Tap Empty Freestyle Workout Logger
  - OTP `ActiveSessionServer` integration (`:deload`, `:target`, `:beast` Difficulty Dial)
  - In-Workout Combat Physio modal (`IronMatch.Physio.CombatPhysio`)
  - Olympic Barbell Plate Loader visualizer (`IronMatch.Workouts.Plates`)
  - 1RM Epley Analytics Trend SVG Chart & Strict Big 4 PR celebration
  """
  use IronMatchWeb, :live_view

  alias IronMatch.Physio.CombatPhysio
  alias IronMatch.Workouts.{ActiveSessionServer, BlueprintGenerator, Exercises, Plates, SessionSupervisor}

  @impl true
  def mount(_params, _session, socket) do
    user_big4 = %{squat: 140.0, bench: 105.0, deadlift: 180.0, ohp: 65.0}
    unit = :kg
    blueprint = BlueprintGenerator.generate_blueprint(user_big4, :hypertrophy_strength, unit: unit)
    week_1 = hd(blueprint.weeks)

    {:ok,
     assign(socket,
       unit: unit,
       user_big4: user_big4,
       blueprint: blueprint,
       days: week_1.days,
       active_session: nil,
       session_id: nil,
       physio_modal_ex_idx: nil,
       physio_zones: CombatPhysio.list_zones(),
       physio_feedback: nil,
       plate_modal_weight: nil,
       plate_loadout: nil,
       exercise_search: "",
       analytics_lift: :bench,
       workout_summary: nil
     )}
  end

  @impl true
  def handle_event("toggle_unit", _params, socket) do
    new_unit = if socket.assigns.unit == :kg, do: :lbs, else: :kg
    blueprint = BlueprintGenerator.generate_blueprint(socket.assigns.user_big4, :hypertrophy_strength, unit: new_unit)
    {:noreply, assign(socket, unit: new_unit, blueprint: blueprint, days: hd(blueprint.weeks).days)}
  end

  @impl true
  def handle_event("start_day", %{"day_id" => day_id}, socket) do
    day = Enum.find(socket.assigns.days, &(&1.id == day_id))
    session_id = "sess_#{day_id}"

    if connected?(socket) do
      Phoenix.PubSub.subscribe(IronMatch.PubSub, "workout:#{session_id}")
    end

    {:ok, pid} =
      SessionSupervisor.start_or_get_session(session_id, %{
        user_id: "athlete_1",
        title: day.title,
        day_id: day.id,
        unit: socket.assigns.unit,
        exercises: day.exercises,
        user_big4: socket.assigns.user_big4,
        prev_history_map: %{
          "barbell bench press" => %{weight: 90.0, reps: 5},
          "incline dumbbell press" => %{weight: 34.0, reps: 8},
          "barbell back squat" => %{weight: 120.0, reps: 5}
        }
      })

    state = ActiveSessionServer.get_state(pid)
    {:noreply, assign(socket, session_id: session_id, active_session: state, workout_summary: nil)}
  end

  @impl true
  def handle_event("start_freestyle", _params, socket) do
    session_id = "sess_freestyle_#{System.unique_integer([:positive])}"

    if connected?(socket) do
      Phoenix.PubSub.subscribe(IronMatch.PubSub, "workout:#{session_id}")
    end

    {:ok, pid} =
      SessionSupervisor.start_or_get_session(session_id, %{
        user_id: "athlete_1",
        title: "Freestyle Session",
        day_id: "freestyle",
        unit: socket.assigns.unit,
        exercises: [],
        user_big4: socket.assigns.user_big4,
        prev_history_map: %{
          "barbell bench press" => %{weight: 90.0, reps: 5},
          "incline dumbbell press" => %{weight: 34.0, reps: 8}
        }
      })

    state = ActiveSessionServer.get_state(pid)
    {:noreply, assign(socket, session_id: session_id, active_session: state, workout_summary: nil)}
  end

  @impl true
  def handle_event("set_difficulty", %{"mode" => mode_str}, socket) do
    mode = String.to_existing_atom(mode_str)
    {:ok, state} = ActiveSessionServer.set_difficulty(socket.assigns.session_id, mode)
    {:noreply, assign(socket, active_session: state)}
  end

  @impl true
  def handle_event("toggle_set", %{"ex_idx" => ex_str, "set_idx" => set_str}, socket) do
    {:ok, state} =
      ActiveSessionServer.toggle_complete_set(
        socket.assigns.session_id,
        String.to_integer(ex_str),
        String.to_integer(set_str)
      )

    {:noreply, assign(socket, active_session: state)}
  end

  @impl true
  def handle_event("add_set", %{"ex_idx" => ex_str}, socket) do
    {:ok, state} = ActiveSessionServer.add_set(socket.assigns.session_id, String.to_integer(ex_str))
    {:noreply, assign(socket, active_session: state)}
  end

  @impl true
  def handle_event("add_exercise", %{"name" => name}, socket) do
    {:ok, state} = ActiveSessionServer.add_exercise(socket.assigns.session_id, name)
    {:noreply, assign(socket, active_session: state)}
  end

  @impl true
  def handle_event("open_physio", %{"ex_idx" => ex_str}, socket) do
    {:noreply, assign(socket, physio_modal_ex_idx: String.to_integer(ex_str))}
  end

  @impl true
  def handle_event("apply_physio_swap", %{"zone_id" => zone_str}, socket) do
    zone_id = String.to_existing_atom(zone_str)

    {:ok, state, result} =
      ActiveSessionServer.swap_exercise(
        socket.assigns.session_id,
        socket.assigns.physio_modal_ex_idx,
        zone_id
      )

    {:noreply,
     assign(socket,
       active_session: state,
       physio_modal_ex_idx: nil,
       physio_feedback: result
     )}
  end

  @impl true
  def handle_event("open_plates", %{"weight" => weight_str}, socket) do
    {weight, _} = Float.parse(weight_str)
    loadout = Plates.calculate(weight, socket.assigns.unit)
    {:noreply, assign(socket, plate_modal_weight: weight, plate_loadout: loadout)}
  end

  @impl true
  def handle_event("close_modals", _params, socket) do
    {:noreply, assign(socket, physio_modal_ex_idx: nil, plate_modal_weight: nil, plate_loadout: nil)}
  end

  @impl true
  def handle_event("finish_workout", _params, socket) do
    {:ok, summary} = ActiveSessionServer.stop_Session(socket.assigns.session_id)
    {:noreply, assign(socket, active_session: nil, session_id: nil, workout_summary: summary, user_big4: summary.updated_big4)}
  end

  @impl true
  def handle_info({:session_updated, state}, socket) do
    {:noreply, assign(socket, active_session: state)}
  end

  @impl true
  def handle_info({:workout_finished, summary}, socket) do
    {:noreply, assign(socket, active_session: nil, workout_summary: summary)}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="space-y-5">
      <!-- Top Header -->
      <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <span class="text-[10px] font-black uppercase tracking-widest text-[#32FF32]">OTP WORKOUT ENGINE</span>
          <h1 class="text-xl font-black tracking-tight uppercase">TRAINING COMMAND</h1>
        </div>
        <button phx-click="toggle_unit" class="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-black uppercase text-[#32FF32]">
          UNIT: <%= String.upcase(to_string(@unit)) %>
        </button>
      </div>

      <%= if @workout_summary do %>
        <div class="p-4 rounded-xl bg-[#32FF32]/10 border border-[#32FF32] space-y-2">
          <div class="text-xs font-black uppercase text-[#32FF32]">SESSION COMPLETE • PERSISTED</div>
          <div class="text-lg font-black"><%= @workout_summary.title %></div>
          <div class="text-xs text-zinc-300">
            Total Tonnage: <span class="font-bold text-white"><%= @workout_summary.total_tonnage %> <%= @unit %></span>
          </div>
          <%= if @workout_summary.new_prs != [] do %>
            <div class="text-xs font-bold text-[#32FF32]">
              NEW VERIFIED BIG 4 PRs: <%= length(@workout_summary.new_prs) %>
            </div>
          <% end %>
        </div>
      <% end %>

      <%= if @active_session do %>
        <!-- Active OTP Session View -->
        <div class="space-y-4">
          <div class="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
            <div>
              <div class="text-[10px] font-bold uppercase text-[#32FF32]">LIVE OTP GENSERVER • <%= @active_session.session_id %></div>
              <div class="text-base font-black uppercase"><%= @active_session.title %></div>
            </div>
            <%= if @active_session.rest_timer_active do %>
              <div class="px-3 py-1 rounded-lg bg-[#32FF32] text-black font-black text-xs">
                REST <%= @active_session.rest_seconds_remaining %>s
              </div>
            <% end %>
          </div>

          <!-- Difficulty Dial -->
          <div class="grid grid-cols-3 gap-2">
            <%= for {mode, label} <- [deload: "DELOAD 90%", target: "TARGET 100%", beast: "BEAST 102.5%"] do %>
              <button
                phx-click="set_difficulty"
                phx-value-mode={mode}
                class={[
                  "py-2 rounded-lg text-[11px] font-black uppercase border transition",
                  if(@active_session.difficulty == mode,
                    do: "bg-[#32FF32] text-black border-[#32FF32]",
                    else: "bg-zinc-900 text-zinc-400 border-zinc-800"
                  )
                ]}
              >
                <%= label %>
              </button>
            <% end %>
          </div>

          <%= if @physio_feedback do %>
            <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-xs text-amber-200">
              <div class="font-black uppercase">COMBAT PHYSIO SWAP APPLIED: <%= @physio_feedback.replacement_exercise %></div>
              <div class="text-[11px] opacity-90 mt-0.5"><%= @physio_feedback.clinical_rationale %></div>
            </div>
          <% end %>

          <!-- Exercise Cards -->
          <%= for {ex, ex_idx} <- Enum.with_index(@active_session.exercises) do %>
            <div class="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-black text-sm uppercase text-white"><%= ex.name %></h3>
                  <%= if ex.previous_best do %>
                    <span class="text-[10px] text-zinc-400">
                      Prev Best: <%= ex.previous_best.weight %><%= @unit %> × <%= ex.previous_best.reps %>
                    </span>
                  <% end %>
                </div>
                <div class="flex items-center gap-1.5">
                  <button
                    phx-click="open_physio"
                    phx-value-ex_idx={ex_idx}
                    class="px-2 py-1 rounded bg-red-500/15 border border-red-500/40 text-[10px] font-black text-red-300 uppercase"
                  >
                    PHYSIO SWAP
                  </button>
                </div>
              </div>

              <div class="space-y-1.5">
                <%= for {set, set_idx} <- Enum.with_index(ex.sets) do %>
                  <div class="flex items-center justify-between p-2 rounded-lg bg-black/60 border border-zinc-800/80 text-xs">
                    <span class="font-bold text-zinc-400 w-10">S<%= set.set_number %></span>
                    <button
                      phx-click="open_plates"
                      phx-value-weight={"#{set.weight}"}
                      class="font-black text-white hover:text-[#32FF32] underline decoration-zinc-700"
                    >
                      <%= set.weight %> <%= @unit %>
                    </button>
                    <span class="text-zinc-300 font-semibold"><%= set.reps %> reps</span>
                    <span class="text-zinc-500 text-[10px]">RPE <%= set.rpe %></span>
                    <button
                      phx-click="toggle_set"
                      phx-value-ex_idx={ex_idx}
                      phx-value-set_idx={set_idx}
                      class={[
                        "px-2.5 py-1 rounded font-black text-[10px] uppercase",
                        if(set.completed,
                          do: "bg-[#32FF32] text-black",
                          else: "bg-zinc-800 text-zinc-300"
                        )
                      ]}
                    >
                      <%= if set.completed, do: "DONE", else: "LOG" %>
                    </button>
                  </div>
                <% end %>
              </div>

              <button
                phx-click="add_set"
                phx-value-ex_idx={ex_idx}
                class="w-full py-1.5 rounded-lg border border-dashed border-zinc-700 text-[11px] font-bold text-zinc-400 hover:text-white"
              >
                + ADD SET
              </button>
            </div>
          <% end %>

          <!-- Quick Add Exercise -->
          <div class="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
            <div class="text-[10px] font-black uppercase text-zinc-400">ADD EXERCISE MID-WORKOUT (AUTO PRE-FILLS WEIGHT)</div>
            <div class="flex flex-wrap gap-1.5">
              <%= for ex_meta <- Enum.take(Exercises.all(), 5) do %>
                <button
                  phx-click="add_exercise"
                  phx-value-name={ex_meta.name}
                  class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-bold text-zinc-200"
                >
                  + <%= ex_meta.name %>
                </button>
              <% end %>
            </div>
          </div>

          <button
            phx-click="finish_workout"
            class="w-full py-3 rounded-xl bg-[#32FF32] text-black font-black text-sm uppercase tracking-wider"
          >
            FINISH & SAVE WORKOUT
          </button>
        </div>
      <% else %>
        <!-- 1-Tap Freestyle Logger CTA -->
        <div class="p-4 rounded-xl bg-gradient-to-r from-[#32FF32]/15 to-zinc-900 border border-[#32FF32]/40 flex items-center justify-between">
          <div>
            <div class="text-[10px] font-black uppercase text-[#32FF32]">ZERO FRICTION</div>
            <div class="text-sm font-black uppercase">START EMPTY FREESTYLE WORKOUT</div>
            <div class="text-xs text-zinc-400">Build on the fly with smart weight memory</div>
          </div>
          <button
            phx-click="start_freestyle"
            class="px-4 py-2.5 rounded-xl bg-[#32FF32] text-black font-black text-xs uppercase"
          >
            START NOW
          </button>
        </div>

        <!-- 4-Day Tendon & Strength Split -->
        <div class="space-y-2.5">
          <div class="text-xs font-black uppercase tracking-wider text-zinc-400">
            8-WEEK TENDON & STRENGTH SPLIT (WEEK 1)
          </div>
          <%= for day <- @days do %>
            <div class="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
              <div>
                <div class="text-sm font-black uppercase text-white"><%= day.title %></div>
                <div class="text-xs text-zinc-400"><%= day.focus %> • <%= length(day.exercises) %> Exercises</div>
              </div>
              <button
                phx-click="start_day"
                phx-value-day_id={day.id}
                class="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-[#32FF32] hover:text-black text-xs font-black uppercase transition"
              >
                LAUNCH
              </button>
            </div>
          <% end %>
        </div>
      <% end %>

      <!-- Combat Physio Modal -->
      <%= if @physio_modal_ex_idx != nil do %>
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div class="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700 p-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase text-red-400">COMBAT PHYSIO TRIAGE</span>
              <button phx-click="close_modals" class="text-xs text-zinc-400">CLOSE</button>
            </div>
            <p class="text-xs text-zinc-300">Select painful joint/tendon to immediately swap to a biomechanically safe alternative:</p>
            <div class="space-y-1.5">
              <%= for zone <- @physio_zones do %>
                <button
                  phx-click="apply_physio_swap"
                  phx-value-zone_id={zone.id}
                  class="w-full text-left p-2.5 rounded-lg bg-black/60 hover:bg-red-500/15 border border-zinc-800 text-xs font-bold"
                >
                  <%= zone.label %>
                </button>
              <% end %>
            </div>
          </div>
        </div>
      <% end %>

      <!-- Barbell Plate Calculator Modal -->
      <%= if @plate_loadout do %>
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div class="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700 p-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase text-[#32FF32]">OLYMPIC BARBELL PLATE LOADER</span>
              <button phx-click="close_modals" class="text-xs text-zinc-400">CLOSE</button>
            </div>
            <div class="text-sm font-black">Target: <%= @plate_loadout.target_weight %> <%= @unit %> (Bar: <%= @plate_loadout.bar_weight %> <%= @unit %>)</div>
            <div class="text-xs text-zinc-400">Load Per Side:</div>
            <div class="flex flex-wrap gap-2">
              <%= for plate <- @plate_loadout.per_side do %>
                <span class="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-600 font-black text-xs text-[#32FF32]">
                  <%= plate.count %> × <%= plate.weight %> <%= @unit %>
                </span>
              <% end %>
            </div>
          </div>
        </div>
      <% end %>
    </div>
    """
  end
end
