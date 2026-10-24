defmodule IronMatch.Physio.CombatPhysio do
  @moduledoc """
  In-Workout Combat Physio Biomechanical Triage & 45s Isometric Tendon Analgesia Engine.
  """

  @protocols %{
    shoulder: %{
      key: :shoulder,
      label: "Shoulder",
      condition: "Anterior Subacromial Pinch / Rotator Cuff",
      root_cause: "Humeral head superior migration during pressing before external rotators and serratus anterior are activated.",
      coaching_cue: "⚡ Pin scapulae down and back; switch to 30-45° neutral-grip dumbbell pressing.",
      analgesia_title: "45s External Rotation Isometric Hold",
      analgesia_instructions: "Anchor band or cable at elbow height. Pin elbow to ribs at 90° and hold firm external tension for 45 seconds.",
      hold_seconds: 45,
      swap_exercise: %{
        name: "Incline Dumbbell Press (Neutral Grip)",
        modality: :dumbbell,
        notes: "🛡️ COMBAT PHYSIO SWAP: Neutral grip aligns humerus in the scapular plane, eliminating acromion impingement."
      }
    },
    knee: %{
      key: :knee,
      label: "Knee Tendon",
      condition: "Patellar Knee Shear / Tendonitis",
      root_cause: "Excessive anterior knee translation under deep quadriceps load before patellar tendon is warmed.",
      coaching_cue: "⚡ Hamstring Curls FIRST on every leg session to lubricate the joint + 3s eccentric cadence.",
      analgesia_title: "45s Spanish Squat Isometric Hold",
      analgesia_instructions: "Loop a heavy resistance band behind knees anchored to rig. Sit back to 70-80° knee flexion with vertical shins. Hold firm.",
      hold_seconds: 45,
      swap_exercise: %{
        name: "Poliquin Slant-Board Step Down",
        modality: :dumbbell,
        notes: "🛡️ COMBAT PHYSIO SWAP: Controlled VMO & patellar tendon collagen remodeling without heavy axial rebound."
      }
    },
    back: %{
      key: :back,
      label: "Lower Back",
      condition: "Lumbar Shear / Erector Spasm",
      root_cause: "Loss of 360-degree intra-abdominal pressure and pelvic anterior tilt under axial barbell load.",
      coaching_cue: "⚡ Switch bilateral axial pulls/squats to chest-supported or unilateral split-stance loading today.",
      analgesia_title: "45s Copenhagen & Dead-Bug Bracing Hold",
      analgesia_instructions: "Press lower ribs into floor, exhale fully to lock obliques, and hold isometric pelvic neutralization for 45 seconds.",
      hold_seconds: 45,
      swap_exercise: %{
        name: "Barbell Glute Hip Thrust",
        modality: :barbell,
        notes: "🛡️ COMBAT PHYSIO SWAP: Zero lumbar shear while preserving maximal posterior chain mechanical tension."
      }
    },
    elbow_wrist: %{
      key: :elbow_wrist,
      label: "Elbow & Wrist",
      condition: "Medial / Lateral Epicondylitis (Golfer's / Tennis Elbow)",
      root_cause: "Rigid straight-bar supination/pronation torque exceeding common extensor/flexor tendon capacity.",
      coaching_cue: "⚡ Abandon straight bars today; use neutral-grip dumbbells or dual-rope attachments exclusively.",
      analgesia_title: "45s Pronated Wrist Extensor Isometric Hold",
      analgesia_instructions: "Support forearm on bench with palm facing down; hold a light dumbbell horizontally at neutral wrist extension for 45 seconds.",
      hold_seconds: 45,
      swap_exercise: %{
        name: "Eccentric Zottman Curl",
        modality: :dumbbell,
        notes: "🛡️ COMBAT PHYSIO SWAP: 3-second pronated eccentric lowering remodels lateral epicondyle collagen fibers."
      }
    }
  }

  def all_protocols, do: @protocols

  def get_protocol(joint_key) when is_atom(joint_key) do
    Map.get(@protocols, joint_key, @protocols.knee)
  end

  def get_protocol(joint_key) when is_binary(joint_key) do
    key =
      case joint_key do
        "shoulder" -> :shoulder
        "knee" -> :knee
        "back" -> :back
        "elbow_wrist" -> :elbow_wrist
        _ -> :knee
      end

    get_protocol(key)
  end
end
