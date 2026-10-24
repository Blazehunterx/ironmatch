defmodule IronMatch.Gamification do
  @moduledoc """
  Unified SBD & Big 4 Strength Rank Engine, XP Level Progression, and Quest System.
  Automatically normalizes `kg` and `lbs` (`1 kg = 2.20462 lbs`).
  """

  @lbs_per_kg 2.20462

  @ranks [
    %{
      tier: :freshman,
      name: "Freshman",
      min_total_lbs: 0,
      min_total_kg: 0,
      color: "#9CA3AF",
      description: "Stepping onto the iron floor & building tendon baseline"
    },
    %{
      tier: :grinder,
      name: "Grinder",
      min_total_lbs: 500,
      min_total_kg: 225,
      color: "#10B981",
      description: "Consistent compound progression & iron discipline"
    },
    %{
      tier: :contender,
      name: "Contender",
      min_total_lbs: 750,
      min_total_kg: 340,
      color: "#06B6D4",
      color_hex: "#06B6D4",
      description: "Intermediate strength contender on the gym floor"
    },
    %{
      tier: :athlete,
      name: "Athlete",
      min_total_lbs: 1000,
      min_total_kg: 455,
      color: "#3B82F6",
      description: "1,000 lb Club standard & advanced mechanical tension"
    },
    %{
      tier: :beast,
      name: "Beast",
      min_total_lbs: 1250,
      min_total_kg: 565,
      color: "#F59E0B",
      description: "Elite gym floor force & multi-plate dominance"
    },
    %{
      tier: :legend,
      name: "Legend",
      min_total_lbs: 1500,
      min_total_kg: 680,
      color: "#A855F7",
      description: "Peak human performance & hall of fame strength"
    }
  ]

  @weekly_quests [
    %{
      id: "wq_consistency",
      title: "Iron Consistency",
      description: "Complete 3 verified workouts this week",
      target: 3,
      xp_reward: 300,
      category: :consistency
    },
    %{
      id: "wq_tendon_armor",
      title: "Tendon Armor Protocol",
      description: "Log 4 distinct compound or prehab movements",
      target: 4,
      xp_reward: 250,
      category: :variety
    },
    %{
      id: "wq_pr_hunter",
      title: "Calibration Check",
      description: "Record or update a verified Big 4 1RM milestone",
      target: 1,
      xp_reward: 400,
      category: :pr
    }
  ]

  @hidden_quests [
    %{
      id: "hq_1000lb_club",
      title: "The 1,000 LB Club",
      hint: "Reach a combined Squat + Bench + Deadlift total of 1,000 lbs (455 kg)",
      xp_reward: 1000
    },
    %{
      id: "hq_double_bw_deadlift",
      title: "2.0x Bodyweight Puller",
      hint: "Pull at least 2.0x your bodyweight on Conventional Deadlift",
      xp_reward: 750
    },
    %{
      id: "hq_gym_king",
      title: "Facility Vanguard",
      hint: "Represent the #1 ranked facility on the Gym Wars leaderboard",
      xp_reward: 500
    }
  ]

  def ranks, do: @ranks
  def weekly_quests, do: @weekly_quests
  def hidden_quests, do: @hidden_quests

  @doc """
  Computes the sum of Squat + Bench + Deadlift (SBD) normalized to `kg`.
  """
  def sbd_total_kg(big4, unit \\ :kg) when is_map(big4) do
    raw_sbd =
      Map.get(big4, :bench, Map.get(big4, "bench", 0)) +
        Map.get(big4, :squat, Map.get(big4, "squat", 0)) +
        Map.get(big4, :deadlift, Map.get(big4, "deadlift", 0))

    cond do
      unit in [:lbs, "lbs"] or raw_sbd > 850 ->
        Float.round(raw_sbd / @lbs_per_kg, 1)

      true ->
        raw_sbd * 1.0
    end
  end

  @doc """
  Computes the full Big 4 total (Bench + Squat + Deadlift + OHP) in the user's preferred unit.
  """
  def big4_total(big4) when is_map(big4) do
    Map.get(big4, :bench, Map.get(big4, "bench", 0)) +
      Map.get(big4, :squat, Map.get(big4, "squat", 0)) +
      Map.get(big4, :deadlift, Map.get(big4, "deadlift", 0)) +
      Map.get(big4, :ohp, Map.get(big4, "ohp", 0))
  end

  @doc """
  Returns the rank map (`Freshman` -> `Legend`) for the given `big4` map and `unit` (`:kg` or `:lbs`).
  """
  def get_rank_from_lifts(big4, unit \\ :kg) do
    total_raw = big4_total(big4)
    total_lbs = if unit in [:kg, "kg"], do: total_raw * @lbs_per_kg, else: total_raw * 1.0

    @ranks
    |> Enum.reverse()
    |> Enum.find(List.first(@ranks), fn r -> total_lbs >= r.min_total_lbs end)
  end

  @doc """
  Returns the next rank tier above the user's current rank, or `nil` if already `Legend`.
  """
  def get_next_rank(big4, unit \\ :kg) do
    current = get_rank_from_lifts(big4, unit)
    idx = Enum.find_index(@ranks, &(&1.tier == current.tier)) || 0
    Enum.at(@ranks, idx + 1)
  end

  @doc """
  Computes the bodyweight strength ratio (`SBD / bodyweight_kg`), clamped to a realistic max of `9.9`.
  """
  def sbd_bodyweight_ratio(big4, weight_kg, unit \\ :kg) do
    bw_kg = if is_number(weight_kg) and weight_kg > 35, do: weight_kg, else: 75.0
    sbd_kg = sbd_total_kg(big4, unit)
    min(9.9, Float.round(sbd_kg / bw_kg, 1))
  end

  @doc """
  Computes the athlete's dynamic level from total XP (`500 XP` per level).
  """
  def level_from_xp(xp) when is_number(xp) and xp >= 0 do
    div(trunc(xp), 500) + 1
  end

  def level_from_xp(_), do: 1
end
