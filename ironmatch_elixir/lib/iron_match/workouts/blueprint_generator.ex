defmodule IronMatch.Workouts.BlueprintGenerator do
  @moduledoc """
  8-Week Tendon & Strength Masterplan Generator in pure Elixir.

  Generates 4 distinct daily microcycle splits:
  - Day 1: Upper Push & Shoulder Tendon Armor
  - Day 2: Lower Squat & Patellar Knee Armor
  - Day 3: Upper Pull, Back & Elbow Armor
  - Day 4: Posterior Chain, Deadlift & Spinal Armor

  Respects:
  - Beginner safety: When Big 4 is uncalibrated (`0`) or `fitness_level == :beginner`,
    prescribes empty Olympic bar (`20kg` / `45lb`) and `2.5kg` prehab cables instead of
    dangerous bodyweight multipliers.
  - Equipment Realm: `:commercial`, `:cable`, `:home`
  - Joint Scars / Weak Links: `:knee`, `:shoulder`, `:back`, `:elbow_wrist`
  - Unit Preference: `:kg` and `:lbs` (`5 lb` compound rounding, `2.5 lb` isolation rounding)
  """

  alias IronMatch.Workouts.Exercises

  @split_days [
    %{day: 1, short_label: "Upper Push", title: "Upper Push & Shoulder Tendon Armor", category: "Chest"},
    %{day: 2, short_label: "Lower Squat", title: "Lower Squat & Patellar Knee Armor", category: "Legs"},
    %{day: 3, short_label: "Upper Pull", title: "Upper Pull, Back & Elbow Armor", category: "Back"},
    %{day: 4, short_label: "Posterior Hinge", title: "Posterior Chain, Deadlift & Spinal Armor", category: "Full Body"}
  ]

  @eight_week_curriculum [
    %{week: 1, phase_name: "Phase 1: Tendon Priming", intensity_mul: 0.70, label: "70% 1RM · @7.5 RPE (2.5 RIR)"},
    %{week: 2, phase_name: "Phase 1: Tendon Priming", intensity_mul: 0.75, label: "75% 1RM · @8.0 RPE (2 RIR)"},
    %{week: 3, phase_name: "Phase 2: Mechanical Tension", intensity_mul: 0.80, label: "80% 1RM · @8.0 RPE (2 RIR)"},
    %{week: 4, phase_name: "Phase 2: Mechanical Tension", intensity_mul: 0.825, label: "82.5% 1RM · @8.5 RPE (1.5 RIR)"},
    %{week: 5, phase_name: "Phase 2: Mechanical Tension", intensity_mul: 0.85, label: "85% 1RM · @8.5 RPE (1.5 RIR)"},
    %{week: 6, phase_name: "Phase 3: Structural Deload", intensity_mul: 0.60, label: "60% 1RM · @6.0 RPE (4+ RIR)"},
    %{week: 7, phase_name: "Phase 4: Peak Strength Realization", intensity_mul: 0.90, label: "90% 1RM · @9.0 RPE (1 RIR)"},
    %{week: 8, phase_name: "Phase 4: Peak PR Testing", intensity_mul: 0.95, label: "95% 1RM · @9.5 RPE (Peak PR)"}
  ]

  def split_days, do: @split_days
  def curriculum, do: @eight_week_curriculum

  @doc """
  Generates a complete workout plan map for the requested `week_number` (1..8) and `day_number` (1..4).
  """
  def generate(opts \\ %{}) do
    user = Map.get(opts, :user, %{})
    doctrine = Map.get(opts, :doctrine, :strength_tendon)
    weak_links = Map.get(opts, :weak_links, [])
    realm = Map.get(opts, :realm, :commercial)
    days_per_week = Map.get(opts, :days_per_week, 4)
    week_number = opts |> Map.get(:week_number, 1) |> max(1) |> min(8)
    active_day = opts |> Map.get(:day_number, 1) |> max(1) |> min(4)

    split_info = Enum.at(@split_days, active_day - 1)
    week_info = Enum.at(@eight_week_curriculum, week_number - 1)
    intensity_mul = week_info.intensity_mul

    unit = Map.get(user, :unit_preference, Map.get(user, "unit_preference", :kg))
    is_lbs = unit in [:lbs, "lbs"]
    raw_bw_kg = Map.get(user, :weight_kg, Map.get(user, "weight_kg", 75)) || 75
    bw = if is_lbs, do: round(raw_bw_kg * 2.20462), else: raw_bw_kg

    big4 = Map.get(user, :big4, Map.get(user, "big4", %{})) || %{}
    bench_val = Map.get(big4, :bench, Map.get(big4, "bench", 0)) || 0
    squat_val = Map.get(big4, :squat, Map.get(big4, "squat", 0)) || 0
    deadlift_val = Map.get(big4, :deadlift, Map.get(big4, "deadlift", 0)) || 0
    ohp_val = Map.get(big4, :ohp, Map.get(big4, "ohp", 0)) || 0

    has_calibrated_big4 = bench_val + squat_val + deadlift_val + ohp_val > 0
    fitness_level = Map.get(user, :fitness_level, Map.get(user, "fitness_level", :intermediate))
    is_beginner = fitness_level in [:beginner, "Beginner"] or not has_calibrated_big4

    bench_1rm = if bench_val > 0, do: bench_val, else: if(is_beginner, do: if(is_lbs, do: 65, else: 30), else: round(bw * 1.0))
    squat_1rm = if squat_val > 0, do: squat_val, else: if(is_beginner, do: if(is_lbs, do: 85, else: 40), else: round(bw * 1.3))
    deadlift_1rm = if deadlift_val > 0, do: deadlift_val, else: if(is_beginner, do: if(is_lbs, do: 115, else: 50), else: round(bw * 1.6))
    ohp_1rm = if ohp_val > 0, do: ohp_val, else: if(is_beginner, do: if(is_lbs, do: 45, else: 20), else: round(bw * 0.6))

    has_knee = :knee in weak_links or "knee" in weak_links or doctrine == :longevity_rehab
    has_shoulder = :shoulder in weak_links or "shoulder" in weak_links or doctrine == :longevity_rehab
    has_back = :back in weak_links or "back" in weak_links or doctrine == :longevity_rehab
    has_elbow = :elbow_wrist in weak_links or "elbow_wrist" in weak_links or doctrine == :longevity_rehab

    plan_id = "blueprint-8w-w#{week_number}-d#{active_day}-#{System.unique_integer([:positive])}"

    ctx = %{
      plan_id: plan_id,
      is_lbs: is_lbs,
      bw: bw,
      bench_1rm: bench_1rm,
      squat_1rm: squat_1rm,
      deadlift_1rm: deadlift_1rm,
      ohp_1rm: ohp_1rm,
      intensity_mul: intensity_mul,
      week_info: week_info,
      doctrine: doctrine,
      realm: realm,
      has_knee: has_knee,
      has_shoulder: has_shoulder,
      has_back: has_back,
      has_elbow: has_elbow
    }

    exercises =
      active_day
      |> build_day_exercises(ctx)
      |> Enum.with_index(1)
      |> Enum.map(fn {ex, idx} -> Map.put(ex, :id, "#{plan_id}-#{idx}") end)

    doctrine_label =
      case doctrine do
        :aesthetic_armor -> "Dense Aesthetic Armor"
        :longevity_rehab -> "Bulletproof Longevity"
        _ -> "Strength & Tendon Armor"
      end

    %{
      id: plan_id,
      name: "W#{week_number} • Day #{active_day}: #{split_info.short_label} (#{doctrine_label}) · #{days_per_week}d/wk",
      target: split_info.category,
      week_number: week_number,
      day_number: active_day,
      phase: week_info.phase_name,
      doctrine: doctrine,
      unit: if(is_lbs, do: :lbs, else: :kg),
      exercises: exercises
    }
  end

  defp build_day_exercises(1, ctx) do
    ext_rot_load = min(if(ctx.is_lbs, do: 15.0, else: 7.5), max(if(ctx.is_lbs, do: 5.0, else: 2.5), ctx.ohp_1rm * 0.08))
    lu_raise_load = min(if(ctx.is_lbs, do: 20.0, else: 10.0), max(if(ctx.is_lbs, do: 5.0, else: 2.5), ctx.ohp_1rm * 0.08))

    layer1 =
      if ctx.has_shoulder or ctx.realm == :home do
        [build_ex("serratus-wall-slide", 2, 12, 0, ctx.is_lbs, "⚡ LAYER 1 TENDON PRIMER: Scapular protraction eliminates subacromial pinch")]
      else
        [build_ex("cable-external-rotation", 2, 15, ext_rot_load, ctx.is_lbs, "⚡ LAYER 1 TENDON PRIMER: Anchors infraspinatus before heavy pressing")]
      end ++
        [build_ex("lu-raise", 3, 15, lu_raise_load, ctx.is_lbs, "⚡ LAYER 1 ARMOR: Full overhead ROM targets lateral delts and upward scapular rotation")]

    layer2 =
      cond do
        ctx.has_shoulder or ctx.realm == :cable ->
          [
            build_ex("incline-dumbbell-press", 4, 8, ctx.bench_1rm * 0.35, ctx.is_lbs, "⚡ LAYER 2 MAIN ANCHOR: Neutral grip · Spares anterior capsule · #{ctx.week_info.label}"),
            build_ex("seated-dumbbell-shoulder-press", 3, 10, ctx.ohp_1rm * 0.35, ctx.is_lbs, "⚡ LAYER 2 ANCHOR: Scapular plane pressing")
          ]

        ctx.doctrine == :aesthetic_armor ->
          [
            build_ex("incline-barbell-bench-press", 4, 8, ctx.bench_1rm * (ctx.intensity_mul * 0.9), ctx.is_lbs, "⚡ LAYER 2 MAIN ANCHOR: 30° Clavicular upper chest shelf · #{ctx.week_info.label}"),
            build_ex("standing-barbell-ohp", 3, 8, ctx.ohp_1rm * ctx.intensity_mul, ctx.is_lbs, "⚡ LAYER 2 ANCHOR: Strict overhead lockout")
          ]

        true ->
          [
            build_ex("barbell-bench-press", 4, 6, ctx.bench_1rm * ctx.intensity_mul, ctx.is_lbs, "⚡ LAYER 2 MAIN ANCHOR: Paused on chest · #{ctx.week_info.label}"),
            build_ex("standing-barbell-ohp", 3, 6, ctx.ohp_1rm * ctx.intensity_mul, ctx.is_lbs, "⚡ LAYER 2 ANCHOR: Strict vertical drive · #{ctx.week_info.label}")
          ]
      end

    layer3_tricep =
      if ctx.has_elbow or ctx.realm == :cable do
        build_ex("cable-tricep-pushdown", 3, 12, ctx.bench_1rm * 0.25, ctx.is_lbs, "🛡️ LAYER 3 ARMOR: Constant cable tension with zero elbow joint shear")
      else
        build_ex("jm-press", 3, 8, ctx.bench_1rm * 0.50, ctx.is_lbs, "🛡️ LAYER 3 ARMOR: Powerlifter secret for bulletproof elbow tendons and bench lockout")
      end

    layer3_chest =
      if ctx.realm == :home do
        build_ex("dips-chest", 3, 10, 0, ctx.is_lbs, "🛡️ LAYER 3 ARMOR: Deep sternal stretch & lockout")
      else
        build_ex("cable-chest-fly", 3, 12, ctx.bench_1rm * 0.20, ctx.is_lbs, "🛡️ LAYER 3 ARMOR: Peak adduction pectoral squeeze")
      end

    layer1 ++ layer2 ++ [layer3_tricep, layer3_chest]
  end

  defp build_day_exercises(2, ctx) do
    layer1 = [
      build_ex("spanish-squat-isometric", 2, 45, 0, ctx.is_lbs, "⚡ LAYER 1 TENDON PRIMER: 45s hold triggers patellar tendon analgesia (Rio et al. protocol)"),
      build_ex("tibialis-wall-raise", 3, 15, 0, ctx.is_lbs, "⚡ LAYER 1 TENDON PRIMER: Decelerates ground reaction force; shields knee joint")
    ]

    layer2 =
      if ctx.has_knee or ctx.realm == :cable do
        [
          build_ex("poliquin-step-down", 4, 10, ctx.squat_1rm * 0.25, ctx.is_lbs, "⚡ LAYER 2 MAIN ANCHOR: Knee-over-toes VMO recruitment · #{ctx.week_info.label}"),
          build_ex("bulgarian-split-squat", 3, 10, ctx.squat_1rm * 0.22, ctx.is_lbs, "⚡ LAYER 2 ANCHOR: Unilateral quad & glute stability")
        ]
      else
        [
          build_ex("barbell-back-squat", 4, 6, ctx.squat_1rm * ctx.intensity_mul, ctx.is_lbs, "⚡ LAYER 2 MAIN ANCHOR: Competition depth · #{ctx.week_info.label}"),
          build_ex("poliquin-step-down", 3, 10, ctx.squat_1rm * 0.25, ctx.is_lbs, "⚡ LAYER 2 ANCHOR: Slant board VMO teardrop armor")
        ]
      end

    calf_ex =
      if ctx.realm == :home do
        build_ex("standing-calf-raise", 4, 15, ctx.bw * 0.50, ctx.is_lbs, "🛡️ LAYER 3 ARMOR: 3s bottom pause Achilles tendon loading")
      else
        build_ex("seated-soleus-raise", 4, 15, ctx.bw * 0.60, ctx.is_lbs, "🛡️ LAYER 3 ARMOR: Bent-knee 3s stretch for deep soleus density (8x BW force)")
      end

    layer1 ++
      layer2 ++
      [
        build_ex("copenhagen-plank", 3, 30, 0, ctx.is_lbs, "🛡️ LAYER 3 ARMOR: 30s adductor hold for deep squat pelvic stability & groin protection"),
        calf_ex
      ]
  end

  defp build_day_exercises(3, ctx) do
    primer =
      if ctx.realm == :home do
        build_ex("serratus-wall-slide", 2, 12, 0, ctx.is_lbs, "⚡ LAYER 1 TENDON PRIMER: Scapular upward rotation & ribcage lock")
      else
        build_ex("cable-face-pull", 3, 15, min(if(ctx.is_lbs, do: 35.0, else: 17.5), max(if(ctx.is_lbs, do: 15.0, else: 7.5), ctx.ohp_1rm * 0.25)), ctx.is_lbs, "⚡ LAYER 1 TENDON PRIMER: External rotation to eye level for rear delts & cuff")
      end

    anchors =
      if ctx.has_back or ctx.realm == :cable do
        [
          build_ex("single-arm-dumbbell-row", 4, 10, ctx.bench_1rm * 0.35, ctx.is_lbs, "⚡ LAYER 2 MAIN ANCHOR: Supported unilateral lat drive · #{ctx.week_info.label}"),
          build_ex("lat-pulldown", 4, 10, ctx.bw * 0.75, ctx.is_lbs, "⚡ LAYER 2 ANCHOR: Wide-grip scapular depression")
        ]
      else
        [
          build_ex("barbell-row", 4, 8, ctx.bench_1rm * (ctx.intensity_mul * 0.9), ctx.is_lbs, "⚡ LAYER 2 MAIN ANCHOR: Strict pendlay/bent row · #{ctx.week_info.label}"),
          build_ex("pull-ups", 4, 8, 0, ctx.is_lbs, "⚡ LAYER 2 ANCHOR: Dead-hang to chest vertical pull")
        ]
      end

    [primer | anchors] ++
      [
        build_ex("zottman-curl", 3, 12, max(if(ctx.is_lbs, do: 10.0, else: 5.0), ctx.bench_1rm * 0.15), ctx.is_lbs, "🛡️ LAYER 3 ARMOR: Pronated 3s negative to remodel elbow extensors & brachioradialis"),
        build_ex("hammer-curl", 3, 10, max(if(ctx.is_lbs, do: 15.0, else: 6.0), ctx.bench_1rm * 0.18), ctx.is_lbs, "🛡️ LAYER 3 ARMOR: Neutral-grip brachialis & forearm thickness"),
        build_ex("neck-flexion-extension", 3, 20, 0, ctx.is_lbs, "🛡️ LAYER 3 ARMOR: Cervical spine armor & athletic collar density")
      ]
  end

  defp build_day_exercises(4, ctx) do
    primers = [
      build_ex("copenhagen-plank", 2, 30, 0, ctx.is_lbs, "⚡ LAYER 1 TENDON PRIMER: 30s pelvic & adductor lock before hip hinging"),
      build_ex("tibialis-wall-raise", 2, 15, 0, ctx.is_lbs, "⚡ LAYER 1 TENDON PRIMER: Lower-leg ankle dorsiflexion primer")
    ]

    anchors =
      cond do
        ctx.has_back ->
          [
            build_ex("barbell-hip-thrust", 4, 8, ctx.deadlift_1rm * 0.65, ctx.is_lbs, "⚡ LAYER 2 MAIN ANCHOR: Zero spinal shear glute & hamstring loading · #{ctx.week_info.label}"),
            build_ex("bulgarian-split-squat", 3, 10, ctx.squat_1rm * 0.22, ctx.is_lbs, "⚡ LAYER 2 ANCHOR: Unilateral hip drive without lumbar compression")
          ]

        ctx.realm == :cable ->
          [
            build_ex("romanian-deadlift", 4, 8, ctx.deadlift_1rm * 0.65, ctx.is_lbs, "⚡ LAYER 2 MAIN ANCHOR: Deep hamstring lengthen-under-load · #{ctx.week_info.label}"),
            build_ex("bulgarian-split-squat", 3, 10, ctx.squat_1rm * 0.22, ctx.is_lbs, "⚡ LAYER 2 ANCHOR: Unilateral posterior & quad balance")
          ]

        true ->
          [
            build_ex("conventional-deadlift", 4, 5, ctx.deadlift_1rm * ctx.intensity_mul, ctx.is_lbs, "⚡ LAYER 2 MAIN ANCHOR: Raw posterior chain power · #{ctx.week_info.label}"),
            build_ex("romanian-deadlift", 3, 8, ctx.deadlift_1rm * 0.60, ctx.is_lbs, "⚡ LAYER 2 ANCHOR: Controlled eccentric hamstring stretch")
          ]
      end

    jefferson =
      if ctx.has_back do
        []
      else
        [build_ex("jefferson-curl", 3, 8, min(if(ctx.is_lbs, do: 35.0, else: 15.0), ctx.deadlift_1rm * 0.15), ctx.is_lbs, "🛡️ LAYER 3 ARMOR: Segmental spinal flexion loading for permanent back resilience")]
      end

    primers ++
      anchors ++
      jefferson ++
      [
        build_ex("farmers-walk-heavy", 3, 45, ctx.bw * 0.45, ctx.is_lbs, "🛡️ LAYER 3 ARMOR: 45s heavy carry for decompressed spinal grip & trap armor"),
        build_ex("hanging-leg-raise", 3, 12, 0, ctx.is_lbs, "🛡️ LAYER 3 ARMOR: Posterior pelvic tilt abdominal & lumbar decompression")
      ]
  end

  defp build_ex(exercise_id, sets, reps, raw_weight, is_lbs, notes) do
    found = Exercises.find_by_id(exercise_id)
    base_inc = found.default_increment

    inc =
      cond do
        base_inc == 0.0 -> 0.0
        is_lbs and base_inc >= 2.5 -> 5.0
        is_lbs -> 2.5
        true -> base_inc
      end

    final_weight =
      if inc > 0.0 and raw_weight > 0 do
        Float.round(round(raw_weight / inc) * inc * 1.0, 1)
      else
        0.0
      end

    set_details =
      for s <- 1..sets do
        %{
          set_number: s,
          reps: reps,
          weight: final_weight,
          rpe: 8.0,
          completed: false
        }
      end

    %{
      exercise_id: found.id,
      name: found.name,
      sets: sets,
      reps: reps,
      weight: final_weight,
      modality: found.modality,
      timed_hold: found.timed_hold,
      notes: notes || found.description,
      completed: false,
      set_details: set_details
    }
  end
end
