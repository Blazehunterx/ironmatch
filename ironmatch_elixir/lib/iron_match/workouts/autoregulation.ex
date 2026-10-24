defmodule IronMatch.Workouts.Autoregulation do
  @moduledoc """
  RPE / RIR Autoregulation & Progressive Overload Engine in pure Elixir.
  Computes Estimated 1RM (e1RM) and recommends next-session target loads.
  """

  @rpe_scale [
    %{rpe: 6.0, rir_label: "4+ in tank", description: "Speed / Tendon Warmup"},
    %{rpe: 7.0, rir_label: "3 in tank", description: "Submaximal Control"},
    %{rpe: 7.5, rir_label: "2.5 in tank", description: "Hypertrophy Base"},
    %{rpe: 8.0, rir_label: "2 in tank", description: "Optimal Stimulus"},
    %{rpe: 8.5, rir_label: "1.5 in tank", description: "Heavy Mechanical Tension"},
    %{rpe: 9.0, rir_label: "1 in tank", description: "Near Limit Strength"},
    %{rpe: 9.5, rir_label: "0.5 in tank", description: "Peak Effort"},
    %{rpe: 10.0, rir_label: "0 in tank", description: "True Max / Failure"}
  ]

  def rpe_scale, do: @rpe_scale

  @doc """
  Computes estimated 1-Rep Max (`e1RM`) factoring in actual reps and RPE (`10 - RPE = RIR`).
  """
  def calculate_e1rm(weight, reps, rpe \\ 8.0) when is_number(weight) and is_number(reps) do
    if weight <= 0 or reps <= 0 do
      0.0
    else
      rir = max(0.0, 10.0 - rpe)
      effective_reps = min(reps + rir, 15.0)
      Float.round(weight * (1.0 + effective_reps / 30.0), 1)
    end
  end

  @doc """
  Computes the next-session load recommendation based on current weight, reps, RPE, and unit.
  """
  def recommend_next_load(weight, reps, rpe \\ 8.0, unit \\ :kg, modality \\ :barbell) do
    e1rm = calculate_e1rm(weight, reps, rpe)
    is_lbs = unit in [:lbs, "lbs"]
    small_step = if is_lbs, do: 2.5, else: 1.0
    big_step = if is_lbs, do: 5.0, else: 2.5
    step = if modality in [:dumbbell, :cable], do: small_step, else: big_step
    unit_str = if is_lbs, do: "lbs", else: "kg"

    cond do
      weight <= 0 ->
        %{
          next_weight: 0.0,
          delta_label: "BODYWEIGHT / TIMED",
          e1rm: 0.0,
          rationale: "Focus on strict tempo and full isometric duration."
        }

      rpe <= 7.0 ->
        next_w = Float.round(weight + step * 2, 1)
        %{
          next_weight: next_w,
          delta_label: "+#{step * 2}#{unit_str}",
          e1rm: e1rm,
          rationale: "3+ reps in reserve. Ready for a full double-step jump next session."
        }

      rpe <= 8.5 ->
        next_w = Float.round(weight + step, 1)
        %{
          next_weight: next_w,
          delta_label: "+#{step}#{unit_str}",
          e1rm: e1rm,
          rationale: "Optimal hypertrophy & tendon stimulus (1.5–2 RIR). Progressive micro-load."
        }

      rpe <= 9.5 ->
        %{
          next_weight: Float.round(weight * 1.0, 1),
          delta_label: "HOLD LOAD",
          e1rm: e1rm,
          rationale: "High neural fatigue (@9+ RPE). Consolidate this weight before adding load."
        }

      true ->
        deload_w = Float.round(max(step, round(weight * 0.95 / step) * step), 1)
        %{
          next_weight: deload_w,
          delta_label: "-5% RESET",
          e1rm: e1rm,
          rationale: "True failure (@10 RPE) reached. Slight reset next session to protect tendons."
        }
    end
  end
end
