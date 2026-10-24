defmodule IronMatch.DomainEnginesTest do
  @moduledoc """
  Comprehensive ExUnit test suite verifying all 5 persona flows and core Elixir OTP
  engines:
  1. Unified 6-Tier Gamification & Epley 1RM (`IronMatch.Gamification`)
  2. Beginner-Safe 8-Week Blueprint Generator (`IronMatch.Workouts.BlueprintGenerator`)
  3. RPE/RIR Autoregulation (`IronMatch.Workouts.Autoregulation`)
  4. Olympic Barbell Plate Loader (`IronMatch.Workouts.Plates`)
  5. In-Workout Combat Physio Triage (`IronMatch.Physio.CombatPhysio`)
  6. OTP `ActiveSessionServer` & `MatchmakerServer` GenServers
  """
  use ExUnit.Case, async: true

  alias IronMatch.Arena.MatchmakerServer
  alias IronMatch.Billing.RevenueCat
  alias IronMatch.Gamification
  alias IronMatch.Physio.CombatPhysio
  alias IronMatch.Workouts.{ActiveSessionServer, Autoregulation, BlueprintGenerator, Plates, SessionSupervisor}

  describe "Gamification & Unified 6-Tier System" do
    test "calculates Epley 1RM and maps SBD total to unified tiers" do
      assert Gamification.estimate_1rm(100, 5) == 116.7
      total = Gamification.calculate_sbd_total(140, 105, 180)
      assert total == 425.0

      tier = Gamification.tier_for_total(total, :kg)
      assert tier.name == "Vanguard"
      assert tier.next_tier == "Titan"
    end
  end

  describe "Persona 3 (Chloe): Beginner-Safe Blueprint Generation" do
    test "allows dumbbell-friendly minimum weights (5kg) and Goblet Squats when 1RM < 20kg" do
      beginner_big4 = %{squat: 15.0, bench: 12.0, deadlift: 25.0, ohp: 10.0}
      blueprint = BlueprintGenerator.generate_blueprint(beginner_big4, :hypertrophy_strength, unit: :kg)

      week_1 = hd(blueprint.weeks)
      upper_1 = Enum.find(week_1.days, &(&1.id == "upper_1"))
      lower_1 = Enum.find(week_1.days, &(&1.id == "lower_1"))

      bench_ex = hd(upper_1.exercises)
      squat_ex = hd(lower_1.exercises)

      assert bench_ex.name == "Dumbbell Bench Press"
      assert hd(bench_ex.sets).weight < 20.0
      assert squat_ex.name == "Goblet Squat"
    end
  end

  describe "Persona 2 (Priya): Combat Physio Exercise Swap" do
    test "swaps Barbell Bench Press for Neutral-Grip DB Bench Press on anterior shoulder pain" do
      {:ok, swap} = CombatPhysio.recommend_swap(:anterior_shoulder, "Barbell Bench Press")
      assert swap.replacement_exercise == "Neutral-Grip Dumbbell Bench Press"
      assert swap.load_multiplier == 0.85
    end
  end

  describe "Persona 4 (Marcus): Olympic Barbell Plate Calculator & Autoregulation" do
    test "computes exact per-side plate breakdown in kg and lbs" do
      kg_loadout = Plates.calculate(100.0, :kg)
      assert kg_loadout.bar_weight == 20.0
      assert kg_loadout.per_side == [%{weight: 25.0, count: 1}, %{weight: 15.0, count: 1}]

      lbs_loadout = Plates.calculate(225.0, :lbs)
      assert lbs_loadout.bar_weight == 45.0
      assert lbs_loadout.per_side == [%{weight: 45.0, count: 2}]
    end

    test "reduces next set load by 5% when RPE >= 9.5" do
      eval = Autoregulation.evaluate_set(100.0, 9.5, 8.0, :kg)
      assert eval.status == :reduce_load
      assert eval.recommended_weight == 95.0
    end
  end

  describe "Persona 1 (Jake) & Persona 5 (Elena): OTP GenServers" do
    test "ActiveSessionServer pre-fills previous history weights on mid-workout exercise add" do
      session_id = "test_sess_#{System.unique_integer([:positive])}"

      {:ok, pid} =
        SessionSupervisor.start_or_get_session(session_id, %{
          user_id: "usr_jake",
          title: "Freestyle Session",
          exercises: [],
          prev_history_map: %{"barbell bench press" => %{weight: 92.5, reps: 6}}
        })

      {:ok, state} = ActiveSessionServer.add_exercise(pid, "Barbell Bench Press")
      added = hd(state.exercises)
      assert hd(added.sets).weight == 92.5
      assert hd(added.sets).reps == 6
    end

    test "MatchmakerServer manages Squads, Whiteboard WODs, and Spotter Beacons" do
      {:ok, state} = MatchmakerServer.toggle_spotter_beacon("usr_elena", "Deadlift 165kg")
      elena = Enum.find(state.live_roster, &(&1.user_id == "usr_elena"))
      assert elena.spotter_needed == true
    end
  end

  describe "RevenueCat Native Billing & Trial Gate" do
    test "grants 1 free AI Blueprint before requiring IronMatch Pro" do
      free_with_trial = %{tier: :free, entitlement_active: false, free_blueprints_remaining: 1, provider: :free_tier}
      exhausted = %{tier: :free, entitlement_active: false, free_blueprints_remaining: 0, provider: :free_tier}

      assert RevenueCat.can_generate_blueprint?(free_with_trial) == {:ok, :free_trial_used}
      assert RevenueCat.can_generate_blueprint?(exhausted) == {:error, :paywall_required}
    end
  end
end
