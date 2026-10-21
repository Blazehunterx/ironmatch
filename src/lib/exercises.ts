import { BodyPart } from '../types/database';
import { Muscle } from './muscles';

export type ExerciseModality = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'smith';

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: BodyPart;
  modality: ExerciseModality;
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  defaultIncrement: number; // kg increment
  isWeightedBodyweight?: boolean;
  jointImpact?: 'high' | 'moderate' | 'low';
  description?: string;
}

export const EXERCISE_DATABASE: ExerciseDefinition[] = [
  // --- CHEST ---
  {
    id: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    category: 'Chest',
    modality: 'barbell',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    defaultIncrement: 2.5,
    jointImpact: 'high',
    description: 'Flat Olympic barbell bench press. Arch slightly, retract scapulae, drive through heels.'
  },
  {
    id: 'incline-barbell-bench-press',
    name: 'Incline Barbell Bench Press',
    category: 'Chest',
    modality: 'barbell',
    primaryMuscles: ['chest', 'shoulders'],
    secondaryMuscles: ['triceps'],
    defaultIncrement: 2.5,
    jointImpact: 'high',
    description: '30-degree incline targeting clavicular pec fibers.'
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    category: 'Chest',
    modality: 'dumbbell',
    primaryMuscles: ['chest', 'shoulders'],
    secondaryMuscles: ['triceps'],
    defaultIncrement: 2.0,
    jointImpact: 'moderate',
    description: 'Neutral or 45-degree flared grip, deep chest stretch at the bottom.'
  },
  {
    id: 'flat-dumbbell-press',
    name: 'Flat Dumbbell Press',
    category: 'Chest',
    modality: 'dumbbell',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    defaultIncrement: 2.0,
    jointImpact: 'moderate',
    description: 'Independent unilateral pectoral loading with converging contraction.'
  },
  {
    id: 'cable-chest-fly',
    name: 'Cable Chest Fly',
    category: 'Chest',
    modality: 'cable',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders'],
    defaultIncrement: 2.5,
    jointImpact: 'low',
    description: 'Constant tension throughout full range. Squeeze pecs hard at peak crossing.'
  },
  {
    id: 'high-to-low-cable-fly',
    name: 'High-to-Low Cable Fly',
    category: 'Chest',
    modality: 'cable',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders'],
    defaultIncrement: 2.5,
    jointImpact: 'low',
    description: 'Targets sternal/lower chest fibers with descending arc.'
  },
  {
    id: 'pec-deck-fly',
    name: 'Pec Deck Machine',
    category: 'Chest',
    modality: 'machine',
    primaryMuscles: ['chest'],
    secondaryMuscles: [],
    defaultIncrement: 5.0,
    jointImpact: 'low',
    description: 'Fixed-axis pure pectoral isolation. Keep elbows high and soft.'
  },
  {
    id: 'chest-press-machine',
    name: 'Chest Press Machine',
    category: 'Chest',
    modality: 'machine',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps'],
    defaultIncrement: 5.0,
    jointImpact: 'low',
    description: 'Safe high-load mechanical drop set platform.'
  },
  {
    id: 'dips-chest',
    name: 'Chest Dips',
    category: 'Chest',
    modality: 'bodyweight',
    primaryMuscles: ['chest', 'triceps'],
    secondaryMuscles: ['shoulders'],
    defaultIncrement: 2.5,
    isWeightedBodyweight: true,
    jointImpact: 'high',
    description: 'Forward torso lean with wide flare for lower pectoral sweep.'
  },
  {
    id: 'smith-machine-incline-press',
    name: 'Smith Machine Incline Press',
    category: 'Chest',
    modality: 'smith',
    primaryMuscles: ['chest', 'shoulders'],
    secondaryMuscles: ['triceps'],
    defaultIncrement: 2.5,
    jointImpact: 'moderate',
    description: 'Fixed bar path for zero stabilization fatigue and maximum pec tension.'
  },

  // --- BACK ---
  {
    id: 'conventional-deadlift',
    name: 'Conventional Barbell Deadlift',
    category: 'Back',
    modality: 'barbell',
    primaryMuscles: ['upperBack', 'glutes', 'hamstrings'],
    secondaryMuscles: ['lats', 'abs'],
    defaultIncrement: 5.0,
    jointImpact: 'high',
    description: 'King of raw posterior chain power. Wedge hips, pull slack out of bar.'
  },
  {
    id: 'barbell-row',
    name: 'Barbell Bent-Over Row',
    category: 'Back',
    modality: 'barbell',
    primaryMuscles: ['upperBack', 'lats'],
    secondaryMuscles: ['biceps'],
    defaultIncrement: 2.5,
    jointImpact: 'moderate',
    description: 'Torso at 45 degrees, pull bar to lower sternum leading with elbows.'
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown (Wide Grip)',
    category: 'Back',
    modality: 'cable',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'upperBack'],
    defaultIncrement: 5.0,
    jointImpact: 'low',
    description: 'Drive elbows down into pockets. Depress scapulae before pulling.'
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    category: 'Back',
    modality: 'cable',
    primaryMuscles: ['upperBack', 'lats'],
    secondaryMuscles: ['biceps'],
    defaultIncrement: 5.0,
    jointImpact: 'low',
    description: 'Neutral or wide grip. Retract mid-back at full contraction.'
  },
  {
    id: 'chest-supported-t-bar-row',
    name: 'Chest-Supported T-Bar Row',
    category: 'Back',
    modality: 'machine',
    primaryMuscles: ['upperBack', 'lats'],
    secondaryMuscles: ['biceps'],
    defaultIncrement: 2.5,
    jointImpact: 'low',
    description: 'Removes lower back shear entirely to isolate upper back and lats.'
  },
  {
    id: 'pull-ups',
    name: 'Pull-Ups',
    category: 'Back',
    modality: 'bodyweight',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'upperBack'],
    defaultIncrement: 2.5,
    isWeightedBodyweight: true,
    jointImpact: 'moderate',
    description: 'Dead hang to chin over bar. Full vertical pulling mastery.'
  },
  {
    id: 'single-arm-dumbbell-row',
    name: 'Single-Arm Dumbbell Row',
    category: 'Back',
    modality: 'dumbbell',
    primaryMuscles: ['lats', 'upperBack'],
    secondaryMuscles: ['biceps'],
    defaultIncrement: 2.0,
    jointImpact: 'low',
    description: 'Huge unilateral lat stretch and deep elbow drive.'
  },

  // --- SHOULDERS ---
  {
    id: 'standing-barbell-ohp',
    name: 'Standing Barbell Overhead Press',
    category: 'Shoulders',
    modality: 'barbell',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'abs'],
    defaultIncrement: 2.5,
    jointImpact: 'high',
    description: 'Strict military press. Squeeze glutes and abs, bar travels in vertical groove.'
  },
  {
    id: 'seated-dumbbell-shoulder-press',
    name: 'Seated Dumbbell Shoulder Press',
    category: 'Shoulders',
    modality: 'dumbbell',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps'],
    defaultIncrement: 2.0,
    jointImpact: 'moderate',
    description: 'Slightly tucked elbows (scapular plane) to prevent subacromial impingement.'
  },
  {
    id: 'dumbbell-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    category: 'Shoulders',
    modality: 'dumbbell',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: [],
    defaultIncrement: 1.0,
    jointImpact: 'low',
    description: 'Lead with elbows in the scapular plane for lateral delt capping.'
  },
  {
    id: 'cable-lateral-raise',
    name: 'Cable Lateral Raise',
    category: 'Shoulders',
    modality: 'cable',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: [],
    defaultIncrement: 1.25,
    jointImpact: 'low',
    description: 'Constant resistance at bottom of movement where dumbbells offer zero tension.'
  },
  {
    id: 'cable-face-pull',
    name: 'Cable Face Pull',
    category: 'Shoulders',
    modality: 'cable',
    primaryMuscles: ['shoulders', 'upperBack'],
    secondaryMuscles: [],
    defaultIncrement: 2.5,
    jointImpact: 'low',
    description: 'External rotation to eye level. Essential bulletproofing for rotators and rear delts.'
  },

  // --- LEGS ---
  {
    id: 'barbell-back-squat',
    name: 'Barbell Back Squat',
    category: 'Legs',
    modality: 'barbell',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'abs'],
    defaultIncrement: 5.0,
    jointImpact: 'high',
    description: 'High-bar or low-bar below parallel squat. Braced 360 abdominal pressure.'
  },
  {
    id: 'leg-press-45',
    name: '45-Degree Leg Press',
    category: 'Legs',
    modality: 'machine',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['calves'],
    defaultIncrement: 10.0,
    jointImpact: 'moderate',
    description: 'High tonnage quad overload without spinal axial compressive loading.'
  },
  {
    id: 'hack-squat-machine',
    name: 'Hack Squat Machine',
    category: 'Legs',
    modality: 'machine',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes'],
    defaultIncrement: 5.0,
    jointImpact: 'moderate',
    description: 'Deep knee flexion with stabilized lumbar support for extreme quad tear.'
  },
  {
    id: 'romanian-deadlift',
    name: 'Barbell Romanian Deadlift (RDL)',
    category: 'Legs',
    modality: 'barbell',
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['upperBack'],
    defaultIncrement: 2.5,
    jointImpact: 'moderate',
    description: 'Pure hip hinge with soft knees. Stretch hamstrings to shin height and drive hips.'
  },
  {
    id: 'seated-leg-curl',
    name: 'Seated Leg Curl Machine',
    category: 'Legs',
    modality: 'machine',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: [],
    defaultIncrement: 5.0,
    jointImpact: 'low',
    description: 'Loads hamstrings in hip-flexed lengthened state for optimal hypertrophy.'
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension Machine',
    category: 'Legs',
    modality: 'machine',
    primaryMuscles: ['quads'],
    secondaryMuscles: [],
    defaultIncrement: 5.0,
    jointImpact: 'low',
    description: 'Direct rectus femoris isolation with pause at top contraction.'
  },
  {
    id: 'standing-calf-raise',
    name: 'Standing Calf Raise',
    category: 'Legs',
    modality: 'machine',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    defaultIncrement: 5.0,
    jointImpact: 'low',
    description: 'Deep 3-second stretch at bottom with full planter flexion squeeze.'
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Dumbbell Bulgarian Split Squat',
    category: 'Legs',
    modality: 'dumbbell',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings'],
    defaultIncrement: 2.0,
    jointImpact: 'moderate',
    description: 'Rear foot elevated unilateral leg destroyer. Levels out left/right discrepancies.'
  },

  // --- ARMS ---
  {
    id: 'barbell-bicep-curl',
    name: 'Barbell / EZ-Bar Bicep Curl',
    category: 'Arms',
    modality: 'barbell',
    primaryMuscles: ['biceps'],
    secondaryMuscles: [],
    defaultIncrement: 2.5,
    jointImpact: 'low',
    description: 'Strict curl with minimal torso swing.'
  },
  {
    id: 'incline-dumbbell-curl',
    name: 'Incline Dumbbell Curl',
    category: 'Arms',
    modality: 'dumbbell',
    primaryMuscles: ['biceps'],
    secondaryMuscles: [],
    defaultIncrement: 1.0,
    jointImpact: 'low',
    description: 'Loads long head of biceps in full shoulder extension stretch.'
  },
  {
    id: 'cable-tricep-pushdown',
    name: 'Cable Tricep Pushdown (Rope)',
    category: 'Arms',
    modality: 'cable',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    defaultIncrement: 2.5,
    jointImpact: 'low',
    description: 'Spread rope handles outward at bottom lock.'
  },
  {
    id: 'skull-crushers',
    name: 'Barbell / EZ-Bar Skull Crushers',
    category: 'Arms',
    modality: 'barbell',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    defaultIncrement: 2.5,
    jointImpact: 'moderate',
    description: 'Lower bar to crown of head for heavy tricep long-head recruitment.'
  },
  {
    id: 'hammer-curl',
    name: 'Dumbbell Hammer Curl',
    category: 'Arms',
    modality: 'dumbbell',
    primaryMuscles: ['biceps'],
    secondaryMuscles: [],
    defaultIncrement: 2.0,
    jointImpact: 'low',
    description: 'Neutral grip targeting brachialis and brachioradialis for forearm thickness.'
  },

  // --- CORE & GLUTES ---
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    category: 'Core',
    modality: 'bodyweight',
    primaryMuscles: ['abs'],
    secondaryMuscles: [],
    defaultIncrement: 1.0,
    jointImpact: 'low',
    description: 'Posterior pelvic tilt curled toward chin, not just hip swinging.'
  },
  {
    id: 'cable-woodchopper',
    name: 'Cable Woodchopper',
    category: 'Core',
    modality: 'cable',
    primaryMuscles: ['abs'],
    secondaryMuscles: [],
    defaultIncrement: 2.5,
    jointImpact: 'low',
    description: 'Rotational abdominal power through core oblique stabilization.'
  },
  {
    id: 'barbell-hip-thrust',
    name: 'Barbell Hip Thrust',
    category: 'Glutes',
    modality: 'barbell',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings'],
    defaultIncrement: 5.0,
    jointImpact: 'low',
    description: 'Upper back on bench, barbell on padded hips, lockout to 90 degree knees.'
  }
];

export function findExercise(idOrName: string): ExerciseDefinition | undefined {
  const norm = idOrName.toLowerCase().trim();
  return EXERCISE_DATABASE.find(e => e.id === norm || e.name.toLowerCase() === norm)
    || EXERCISE_DATABASE.find(e => norm.includes(e.name.toLowerCase()) || e.name.toLowerCase().includes(norm));
}

export function getModalityForExercise(name: string): ExerciseModality {
  const ex = findExercise(name);
  if (ex) return ex.modality;
  const n = name.toLowerCase();
  if (n.includes('dumbbell') || n.includes(' db')) return 'dumbbell';
  if (n.includes('cable') || n.includes('pulldown') || n.includes('pushdown')) return 'cable';
  if (n.includes('machine') || n.includes('press machine') || n.includes('leg press') || n.includes('pec deck')) return 'machine';
  if (n.includes('pull-up') || n.includes('dip') || n.includes('push-up') || n.includes('plank')) return 'bodyweight';
  if (n.includes('smith')) return 'smith';
  return 'barbell';
}
