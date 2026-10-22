import { WorkoutPlan, WorkoutExercise, BodyPart, User } from '../types/database';
import { EXERCISE_DATABASE, findExercise } from './exercises';

export type PlanDoctrine = 'strength_tendon' | 'aesthetic_armor' | 'longevity_rehab';
export type WeakLinkArea = 'shoulder' | 'knee' | 'back' | 'elbow_wrist' | 'none';

export interface BlueprintOptions {
    user?: User | null;
    doctrine?: PlanDoctrine;
    weakLinks?: WeakLinkArea[];
    daysPerWeek?: number;
    weekNumber?: number; // 1 to 8
}

export interface WeekPhaseInfo {
    week: number;
    phaseName: string;
    description: string;
    tendonFocus: string;
    compoundTargetIntensity: string;
}

export const EIGHT_WEEK_CURRICULUM: WeekPhaseInfo[] = [
    {
        week: 1,
        phaseName: 'Phase 1: Tendon Priming & Joint Armor',
        description: 'Awaken dormant stabilizers and trigger connective tissue remodeling.',
        tendonFocus: 'Slow 3-4s eccentrics, isometric tendon holds (patellar & rotator cuff).',
        compoundTargetIntensity: '70% 1RM · RPE @7.0 (3 reps left in tank)'
    },
    {
        week: 2,
        phaseName: 'Phase 1: Tendon Priming & Movement Groove',
        description: 'Reinforce stabilizer firing and groove motor patterns under light resistance.',
        tendonFocus: 'Tibialis shock absorption, Spanish squats, Serratus protraction.',
        compoundTargetIntensity: '75% 1RM · RPE @7.5 (2-3 in tank)'
    },
    {
        week: 3,
        phaseName: 'Phase 2: Progressive Mechanical Tension',
        description: 'Main compound strength loading supported by fortified connective tissue.',
        tendonFocus: 'Heavy Zottman curls, JM press, Copenhagen adductor planks.',
        compoundTargetIntensity: '80% 1RM · RPE @8.0 (2 in tank) · +2.5kg target'
    },
    {
        week: 4,
        phaseName: 'Phase 2: Progressive Mechanical Tension',
        description: 'Pushing main poundages with zero joint friction.',
        tendonFocus: 'Loaded Jefferson curls (spinal resilience) + Lu raises.',
        compoundTargetIntensity: '82.5% 1RM · RPE @8.5 (1-2 in tank)'
    },
    {
        week: 5,
        phaseName: 'Phase 2: Peak Volume Accumulation',
        description: 'Maximum work capacity threshold before scheduled recovery.',
        tendonFocus: 'Isometric farmer holds (grip) + Seated soleus (8x BW force).',
        compoundTargetIntensity: '85% 1RM · RPE @8.5 (1-2 in tank)'
    },
    {
        week: 6,
        phaseName: 'Phase 3: Connective Deload & Tendon Remodeling',
        description: 'Supercompensation phase. High velocity, low joint shear, tendon blood flushing.',
        tendonFocus: 'Isometric Spanish squat holds + bodyweight mobility flushes.',
        compoundTargetIntensity: '60% 1RM · RPE @6.0 (4+ in tank) · Recovery Focus'
    },
    {
        week: 7,
        phaseName: 'Phase 4: Peak Force & Neural Drive',
        description: 'Heavy triples and doubles with primed tendons and rock-solid stabilizers.',
        tendonFocus: 'Pre-lift tendon priming; high-tension neural lockouts.',
        compoundTargetIntensity: '90% 1RM · RPE @9.0 (1 in tank)'
    },
    {
        week: 8,
        phaseName: 'Phase 4: 1RM Test & Gym Floor Whiteboard Domination',
        description: 'Test your new personal records and claim your spot on the gym whiteboard!',
        tendonFocus: 'Full joint integrity check + PR celebration.',
        compoundTargetIntensity: '95-100% 1RM · RPE @10.0 (Max Effort / PR Day)'
    }
];

export function generate8WeekTendonBlueprint(options: BlueprintOptions = {}): WorkoutPlan {
    const {
        user,
        doctrine = 'strength_tendon',
        weakLinks = ['none'],
        weekNumber = 1
    } = options;

    const planId = `blueprint-8w-${Date.now()}`;
    const bw = user?.weight_kg || 75;
    const bench1RM = user?.big4?.bench || (bw * 1.0);
    const squat1RM = user?.big4?.squat || (bw * 1.3);
    const deadlift1RM = user?.big4?.deadlift || (bw * 1.6);
    const ohp1RM = user?.big4?.ohp || (bw * 0.6);

    const hasKnee = weakLinks.includes('knee');
    const hasShoulder = weakLinks.includes('shoulder');
    const hasBack = weakLinks.includes('back');
    const hasElbow = weakLinks.includes('elbow_wrist');

    const curWeekInfo = EIGHT_WEEK_CURRICULUM[Math.min(Math.max(weekNumber - 1, 0), 7)];

    // Intensity multiplier based on current week
    let intensityMul = 0.70;
    if (weekNumber === 2) intensityMul = 0.75;
    else if (weekNumber === 3) intensityMul = 0.80;
    else if (weekNumber === 4) intensityMul = 0.825;
    else if (weekNumber === 5) intensityMul = 0.85;
    else if (weekNumber === 6) intensityMul = 0.60;
    else if (weekNumber === 7) intensityMul = 0.90;
    else if (weekNumber === 8) intensityMul = 0.95;

    const exercises: WorkoutExercise[] = [];

    const addEx = (id: string, sets: number, reps: number, calcWeight: number, notes?: string) => {
        const found = findExercise(id) || EXERCISE_DATABASE.find(e => e.id === id);
        if (!found) return;
        const inc = found.defaultIncrement || 2.5;
        const finalWeight = Math.max(0, Math.round(calcWeight / inc) * inc);
        exercises.push({
            id: `${planId}-${exercises.length + 1}`,
            name: found.name,
            sets,
            reps,
            weight: finalWeight,
            modality: found.modality,
            notes: notes || found.description
        });
    };

    let planTitle = '';
    let targetCategory: BodyPart = 'Full Body';

    if (doctrine === 'strength_tendon') {
        planTitle = `8-Week Raw Strength & Tendon Armor (Week ${weekNumber}/8)`;
        targetCategory = 'Full Body';

        // --- LAYER 1: BIOMECHANICAL TENDON PRIMER ---
        addEx('spanish-squat-isometric', 2, 45, 0, '⚡ LAYER 1 TENDON PRIMER: 45s hold triggers patellar tendon analgesia (Rio et al. protocol)');
        addEx('tibialis-wall-raise', 3, 15, 0, '⚡ LAYER 1 TENDON PRIMER: Decelerates 100% of knee force; shields patellar joint');
        if (hasShoulder) {
            addEx('serratus-wall-slide', 2, 12, 0, '⚡ LAYER 1 TENDON PRIMER: Scapular protraction eliminates subacromial pinch');
        } else {
            addEx('cable-external-rotation', 2, 15, ohp1RM * 0.15, '⚡ LAYER 1 TENDON PRIMER: Anchors infraspinatus before heavy pressing');
        }

        // --- LAYER 2: CORE COMPOUND ANCHOR ---
        if (hasKnee) {
            addEx('poliquin-step-down', 4, 8, squat1RM * 0.35, `⚡ LAYER 2 MAIN ANCHOR: Knee-over-toes teardrop VMO recruitment · ${curWeekInfo.compoundTargetIntensity}`);
        } else {
            addEx('barbell-back-squat', 4, 6, squat1RM * intensityMul, `⚡ LAYER 2 MAIN ANCHOR: Competition depth · ${curWeekInfo.compoundTargetIntensity}`);
        }

        if (hasShoulder) {
            addEx('incline-dumbbell-press', 4, 8, bench1RM * 0.35, `⚡ LAYER 2 MAIN ANCHOR: Neutral grip · Spares anterior capsule · ${curWeekInfo.compoundTargetIntensity}`);
        } else {
            addEx('barbell-bench-press', 4, 6, bench1RM * intensityMul, `⚡ LAYER 2 MAIN ANCHOR: Paused on chest · ${curWeekInfo.compoundTargetIntensity}`);
        }

        // --- LAYER 3: THE MISSING LINKS (STRUCTURAL ARMOR) ---
        if (hasElbow) {
            addEx('zottman-curl', 3, 12, bench1RM * 0.20, '🛡️ LAYER 3 ARMOR: Pronated negative to rehabilitate elbow extensors & medial epicondyle');
        } else {
            addEx('jm-press', 3, 8, bench1RM * 0.50, '🛡️ LAYER 3 ARMOR: Powerlifter secret for bulletproof elbow tendons and bench lockout');
        }
        addEx('copenhagen-plank', 3, 30, 0, '🛡️ LAYER 3 ARMOR: 30s adductor hold for deep squat pelvic stability & groin protection');
        if (hasBack) {
            addEx('farmers-walk-heavy', 3, 40, bw * 0.5, '🛡️ LAYER 3 ARMOR: Decompressed spinal grip & massive trap density');
        } else {
            addEx('jefferson-curl', 3, 8, deadlift1RM * 0.25, '🛡️ LAYER 3 ARMOR: Segmental spinal flexion loading for permanent back resilience');
        }

    } else if (doctrine === 'aesthetic_armor') {
        planTitle = `8-Week Dense Aesthetic Armor (Week ${weekNumber}/8)`;
        targetCategory = 'Full Body';

        // Focus on powerhouse muscles normal people skip: Neck, Forearms, VMO, Upper Pec, Serratus
        addEx('lu-raise', 3, 15, ohp1RM * 0.15, '⚡ LAYER 1 ARMOR: Full overhead ROM targets lateral delts and serratus upward rotation');
        addEx('incline-barbell-bench-press', 4, 8, bench1RM * (intensityMul * 0.9), `⚡ LAYER 2 MAIN ANCHOR: 30° Clavicular upper chest shelf · ${curWeekInfo.compoundTargetIntensity}`);
        addEx('poliquin-step-down', 4, 10, squat1RM * 0.30, '⚡ LAYER 2 ANCHOR: Slant board VMO teardrop definition');
        addEx('zottman-curl', 4, 10, bench1RM * 0.20, '🛡️ LAYER 3 ARMOR: Supinated curl with 3s pronated negative for thick outer forearms');
        addEx('seated-soleus-raise', 4, 15, bw * 0.60, '🛡️ LAYER 3 ARMOR: Bent-knee 3s stretch for deep athletic calf density');
        addEx('neck-flexion-extension', 3, 20, 0, '🛡️ LAYER 3 ARMOR: Thick athletic neck collar & cervical spine armor');

    } else {
        // Longevity & Joint Restoration
        planTitle = `8-Week Bulletproof Longevity Protocol (Week ${weekNumber}/8)`;
        targetCategory = 'Full Body';

        addEx('spanish-squat-isometric', 3, 45, 0, '⚡ 45s isometric tendon analgesia hold');
        addEx('serratus-wall-slide', 3, 12, 0, '⚡ Scapular glide and subacromial decompression');
        addEx('poliquin-step-down', 4, 12, squat1RM * 0.25, '⚡ Slow eccentric VMO remodeling');
        addEx('cable-external-rotation', 3, 15, ohp1RM * 0.15, '⚡ Rotator cuff stabilization');
        addEx('copenhagen-plank', 3, 30, 0, '⚡ Adductor groin bulletproofing');
        addEx('farmers-walk-heavy', 3, 45, bw * 0.40, '⚡ Posture, grip, and lumbar decompression');
    }

    return {
        id: planId,
        name: planTitle,
        author_id: user?.id || 'iron-master',
        target: targetCategory,
        exercises,
        shared: false,
        created_at: new Date().toISOString(),
        weeks: 8,
        currentWeek: weekNumber,
        phase: curWeekInfo.phaseName,
        doctrine
    };
}
