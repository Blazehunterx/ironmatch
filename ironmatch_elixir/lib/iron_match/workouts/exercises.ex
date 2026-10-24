defmodule IronMatch.Workouts.Exercises do
  @moduledoc """
  Canonical Exercise & Biomechanical Tendon Database for IronMatch.
  Includes modality classification, default loading increments, timed hold detection,
  and strict Big 4 PR verification.
  """

  @exercises [
    %{
      id: "barbell-bench-press",
      name: "Barbell Bench Press",
      category: "Chest",
      modality: :barbell,
      default_increment: 2.5,
      timed_hold: false,
      description: "Flat Olympic barbell bench press. Arch slightly, retract scapulae, drive through heels."
    },
    %{
      id: "incline-barbell-bench-press",
      name: "Incline Barbell Bench Press",
      category: "Chest",
      modality: :barbell,
      default_increment: 2.5,
      timed_hold: false,
      description: "30-degree incline barbell press targeting clavicular pectorals and anterior delts."
    },
    %{
      id: "incline-dumbbell-press",
      name: "Incline Dumbbell Press (Neutral Grip)",
      category: "Chest",
      modality: :dumbbell,
      default_increment: 2.0,
      timed_hold: false,
      description: "Neutral or 45-degree grip incline press to spare the anterior shoulder capsule."
    },
    %{
      id: "standing-barbell-ohp",
      name: "Standing Barbell Overhead Press",
      category: "Shoulders",
      modality: :barbell,
      default_increment: 2.5,
      timed_hold: false,
      description: "Strict military press from clavicles to full overhead lockout."
    },
    %{
      id: "seated-dumbbell-shoulder-press",
      name: "Seated Dumbbell Shoulder Press",
      category: "Shoulders",
      modality: :dumbbell,
      default_increment: 2.0,
      timed_hold: false,
      description: "Scapular-plane overhead dumbbell press for joint-friendly deltoid loading."
    },
    %{
      id: "cable-external-rotation",
      name: "Cable Rotator Cuff External Rotation",
      category: "Shoulders",
      modality: :cable,
      default_increment: 1.25,
      timed_hold: false,
      description: "Elbow pinned to ribcage; externally rotate cable to prime infraspinatus & teres minor."
    },
    %{
      id: "serratus-wall-slide",
      name: "Serratus Wall Slide (Foam Roller)",
      category: "Shoulders",
      modality: :bodyweight,
      default_increment: 0.0,
      timed_hold: false,
      description: "Protract scapulae against wall while sliding forearms upward to open subacromial space."
    },
    %{
      id: "lu-raise",
      name: "Lu Lateral Raise (Full ROM)",
      category: "Shoulders",
      modality: :dumbbell,
      default_increment: 1.0,
      timed_hold: false,
      description: "Full overhead range-of-motion lateral raise strengthening supraspinatus and upward rotation."
    },
    %{
      id: "jm-press",
      name: "JM Press (Barbell Elbow Armor)",
      category: "Arms",
      modality: :barbell,
      default_increment: 2.5,
      timed_hold: false,
      description: "Hybrid close-grip press and tricep extension for dense distal tricep tendon armor."
    },
    %{
      id: "cable-tricep-pushdown",
      name: "Cable Rope Tricep Pushdown",
      category: "Arms",
      modality: :cable,
      default_increment: 2.5,
      timed_hold: false,
      description: "Constant cable tension tricep extension with zero olecranon shear."
    },
    %{
      id: "cable-chest-fly",
      name: "Seated Cable Chest Fly",
      category: "Chest",
      modality: :cable,
      default_increment: 2.5,
      timed_hold: false,
      description: "Loaded stretch and peak adduction squeeze across the sternal pectorals."
    },
    %{
      id: "dips-chest",
      name: "Weighted Parallel Bar Dips",
      category: "Chest",
      modality: :bodyweight,
      default_increment: 2.5,
      timed_hold: false,
      description: "Controlled forward-lean dip for lower chest and tricep lockout."
    },
    %{
      id: "barbell-back-squat",
      name: "Barbell Back Squat",
      category: "Legs",
      modality: :barbell,
      default_increment: 2.5,
      timed_hold: false,
      description: "Competition depth high-bar or low-bar back squat."
    },
    %{
      id: "spanish-squat-isometric",
      name: "Spanish Squat Isometric Hold",
      category: "Legs",
      modality: :bodyweight,
      default_increment: 0.0,
      timed_hold: true,
      description: "45-second isometric hold with heavy band behind knees to trigger patellar tendon analgesia (Rio et al.)."
    },
    %{
      id: "tibialis-wall-raise",
      name: "Tibialis Anterior Wall Raise",
      category: "Legs",
      modality: :bodyweight,
      default_increment: 0.0,
      timed_hold: false,
      description: "Ankle dorsiflexion against wall to decelerate ground reaction force and shield the knee."
    },
    %{
      id: "poliquin-step-down",
      name: "Poliquin Slant-Board Step Down",
      category: "Legs",
      modality: :dumbbell,
      default_increment: 2.0,
      timed_hold: false,
      description: "Controlled knee-over-toes step-down targeting the VMO teardrop and patellar tendon."
    },
    %{
      id: "bulgarian-split-squat",
      name: "Dumbbell Bulgarian Split Squat",
      category: "Legs",
      modality: :dumbbell,
      default_increment: 2.0,
      timed_hold: false,
      description: "Rear-foot elevated split squat for unilateral quad and glute hypertrophy without spinal compression."
    },
    %{
      id: "copenhagen-plank",
      name: "Copenhagen Adductor Plank Hold",
      category: "Core",
      modality: :bodyweight,
      default_increment: 0.0,
      timed_hold: true,
      description: "30-second isometric adductor hold for pelvic stability out of the hole."
    },
    %{
      id: "seated-soleus-raise",
      name: "Seated Soleus Calf Raise",
      category: "Legs",
      modality: :machine,
      default_increment: 2.5,
      timed_hold: false,
      description: "Bent-knee calf raise with 3s bottom pause to load the Achilles tendon and soleus."
    },
    %{
      id: "standing-calf-raise",
      name: "Standing Pause Calf Raise",
      category: "Legs",
      modality: :dumbbell,
      default_increment: 2.5,
      timed_hold: false,
      description: "Straight-leg gastrocnemius & Achilles tendon loading with 3s stretch."
    },
    %{
      id: "barbell-row",
      name: "Pendlay / Bent-Over Barbell Row",
      category: "Back",
      modality: :barbell,
      default_increment: 2.5,
      timed_hold: false,
      description: "Strict horizontal barbell pull for upper-back thickness and erector spinae resilience."
    },
    %{
      id: "single-arm-dumbbell-row",
      name: "Chest-Supported / Single-Arm DB Row",
      category: "Back",
      modality: :dumbbell,
      default_increment: 2.0,
      timed_hold: false,
      description: "Bench-supported unilateral row eliminating lower-back shear."
    },
    %{
      id: "pull-ups",
      name: "Strict Wide-Grip Pull-Ups",
      category: "Back",
      modality: :bodyweight,
      default_increment: 2.5,
      timed_hold: false,
      description: "Dead-hang to chest vertical pull for latissimus width and shoulder decompression."
    },
    %{
      id: "lat-pulldown",
      name: "Wide-Grip Cable Lat Pulldown",
      category: "Back",
      modality: :cable,
      default_increment: 2.5,
      timed_hold: false,
      description: "Controlled vertical cable pull with depressed scapulae."
    },
    %{
      id: "cable-face-pull",
      name: "High-Pulley Rope Face Pull",
      category: "Shoulders",
      modality: :cable,
      default_increment: 2.5,
      timed_hold: false,
      description: "External rotation pull to forehead for rear delts and external rotators."
    },
    %{
      id: "zottman-curl",
      name: "Eccentric Zottman Curl",
      category: "Arms",
      modality: :dumbbell,
      default_increment: 1.0,
      timed_hold: false,
      description: "Supinated concentric curl with 3s pronated eccentric lower to remodel lateral epicondyle tendons."
    },
    %{
      id: "hammer-curl",
      name: "Neutral-Grip Dumbbell Hammer Curl",
      category: "Arms",
      modality: :dumbbell,
      default_increment: 2.0,
      timed_hold: false,
      description: "Neutral grip targeting brachialis and brachioradialis."
    },
    %{
      id: "neck-flexion-extension",
      name: "4-Way Cervical Neck Harness / Isometric",
      category: "Core",
      modality: :bodyweight,
      default_increment: 0.0,
      timed_hold: false,
      description: "Controlled cervical flexion and extension for combat & contact posture."
    },
    %{
      id: "conventional-deadlift",
      name: "Conventional Barbell Deadlift",
      category: "Full Body",
      modality: :barbell,
      default_increment: 2.5,
      timed_hold: false,
      description: "Full posterior chain pull from the floor. Brace lats, wedge hips, drive floor away."
    },
    %{
      id: "romanian-deadlift",
      name: "Barbell Romanian Deadlift (RDL)",
      category: "Legs",
      modality: :barbell,
      default_increment: 2.5,
      timed_hold: false,
      description: "Controlled hip hinge loading hamstrings and glutes under deep stretch."
    },
    %{
      id: "barbell-hip-thrust",
      name: "Barbell Glute Hip Thrust",
      category: "Legs",
      modality: :barbell,
      default_increment: 5.0,
      timed_hold: false,
      description: "Zero-axial-load posterior chain builder for glute max lockout."
    },
    %{
      id: "jefferson-curl",
      name: "Light Segmental Jefferson Curl",
      category: "Back",
      modality: :dumbbell,
      default_increment: 2.0,
      timed_hold: false,
      description: "Slow, light vertebra-by-vertebra flexion to hydrate intervertebral discs and thoracolumbar fascia."
    },
    %{
      id: "farmers-walk-heavy",
      name: "Heavy Farmers Walk Carry (45s)",
      category: "Full Body",
      modality: :dumbbell,
      default_increment: 2.5,
      timed_hold: true,
      description: "45-second heavy loaded carry for grip crush, upper traps, and core bracing."
    },
    %{
      id: "hanging-leg-raise",
      name: "Strict Hanging Leg Raise",
      category: "Core",
      modality: :bodyweight,
      default_increment: 0.0,
      timed_hold: false,
      description: "Decompresses lumbar spine while strengthening lower rectus abdominis and hip flexors."
    }
  ]

  def all, do: @exercises

  def find_by_id(id) do
    Enum.find(@exercises, &(&1.id == id))
  end

  def search(query \\ "", category \\ "All") do
    q = String.downcase(String.trim(query || ""))

    Enum.filter(@exercises, fn ex ->
      cat_match = category in ["All", "", nil] or ex.category == category
      q_match = q == "" or String.contains?(String.downcase(ex.name), q)
      cat_match and q_match
    end)
  end

  @doc """
  Returns true if the exercise uses seconds (`Hold (sec)`) rather than reps.
  """
  def timed_exercise?(%{timed_hold: true}), do: true

  def timed_exercise?(%{name: name} = ex) do
    notes = Map.get(ex, :notes, "") || ""
    Regex.match?(~r/isometric|hold|plank|walk|carry|45s|30s/i, "#{name} #{notes}")
  end

  def timed_exercise?(_), do: false

  @doc """
  Strictly matches only the true competition Barbell Big 4 lifts so isolation/prehab
  movements never corrupt the athlete's 1RM records.
  """
  def get_strict_big4_key(exercise_name) when is_binary(exercise_name) do
    n = String.downcase(String.trim(exercise_name))

    cond do
      Regex.match?(~r/dumbbell|cable|machine|smith|incline|decline|close|jm|fly|pushup|dip|band/i, n) ->
        nil

      n in ["barbell bench press", "bench press", "flat barbell bench press"] ->
        :bench

      n in ["barbell back squat", "back squat", "squat"] ->
        :squat

      n in ["conventional barbell deadlift", "conventional deadlift", "barbell deadlift", "deadlift"] ->
        :deadlift

      n in ["standing barbell overhead press", "overhead press", "barbell overhead press", "military press"] ->
        :ohp

      true ->
        nil
    end
  end

  def get_strict_big4_key(_), do: nil
end
