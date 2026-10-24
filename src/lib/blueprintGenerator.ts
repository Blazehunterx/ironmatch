import { WorkoutPlan, WorkoutExercise, BodyPart, User } from '../types/database';
import { EXERCISE_DATABASE, findExercise } from './exercises';

export type PlanDoctrine = 'strength_tendon' | 'aesthetic_armor' | 'longevity_rehab';
export type WeakLinkArea = 'shoulder' | 'knee' | 'back' | 'elbow_wrist' | 'none';
export type GymRealm = 'commercial' | 'cable' | 'home';

export interface BlueprintOptions {
    user?: User | null;
    doctrine?: PlanDoctrine;
    weakLinks?: WeakLinkArea[];
    realm?: GymRealm;
    daysPerWeek?: number;
    weekNumber?: number; // 1 to 8
    dayNumber?: number; // 1 to 4
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

export const BLUEPRINT_SPLIT_DAYS = [
    { day: 1, shortLabel: 'Upper Push', title: 'Upper Push & Shoulder Tendon Armor', category: 'Chest' as BodyPart },
    { day: 2, shortLabel: 'Lower Squat', title: 'Lower Squat & Patellar Knee Armor', category: 'Legs' as BodyPart },
    { day: 3, shortLabel: 'Upper Pull', title: 'Upper Pull, Back & Elbow Armor', category: 'Back' as BodyPart },
    { day: 4, shortLabel: 'Posterior Hinge', title: 'Posterior Chain, Deadlift & Spinal Armor', category: 'Full Body' as BodyPart },
];

export function generate8WeekTendonBlueprint(options: BlueprintOptions = {}): WorkoutPlan {
    const {
        user,
        doctrine = 'strength_tendon',
        weakLinks = ['none'],
        realm = 'commercial',
        daysPerWeek = 4,
        weekNumber = 1,
        dayNumber = 1
    } = options;

    const activeDay = Math.min(Math.max(dayNumber, 1), 4);
    const splitInfo = BLUEPRINT_SPLIT_DAYS[activeDay - 1];
    const planId = `blueprint-8w-w${weekNumber}-d${activeDay}-${Date.now()}`;
    const bw = user?.weight_kg || 75;
    const bench1RM = user?.big4?.bench || (bw * 1.0);
    const squat1RM = user?.big4?.squat || (bw * 1.3);
    const deadlift1RM = user?.big4?.deadlift || (bw * 1.6);
    const ohp1RM = user?.big4?.ohp || (bw * 0.6);

    const hasKnee = weakLinks.includes('knee') || doctrine === 'longevity_rehab';
    const hasShoulder = weakLinks.includes('shoulder') || doctrine === 'longevity_rehab';
    const hasBack = weakLinks.includes('back') || doctrine === 'longevity_rehab';
    const hasElbow = weakLinks.includes('elbow_wrist') || doctrine === 'longevity_rehab';

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
        const finalWeight = inc > 0 ? Math.max(0, Math.round(calcWeight / inc) * inc) : 0;
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

    const doctrineLabel =
        doctrine === 'aesthetic_armor'
            ? 'Dense Aesthetic Armor'
            : doctrine === 'longevity_rehab'
                ? 'Bulletproof Longevity'
                : 'Strength & Tendon Armor';

    const planTitle = `W${weekNumber} • Day ${activeDay}: ${splitInfo.shortLabel} (${doctrineLabel})`;
    const targetCategory: BodyPart = splitInfo.category;

    if (activeDay === 1) {
        // DAY 1: UPPER PUSH & SHOULDER TENDON ARMOR
        if (hasShoulder || realm === 'home') {
            addEx('serratus-wall-slide', 2, 12, 0, '⚡ LAYER 1 TENDON PRIMER: Scapular protraction eliminates subacromial pinch');
        } else {
            addEx('cable-external-rotation', 2, 15, ohp1RM * 0.15, '⚡ LAYER 1 TENDON PRIMER: Anchors infraspinatus before heavy pressing');
        }
        addEx('lu-raise', 3, 15, ohp1RM * 0.12, '⚡ LAYER 1 ARMOR: Full overhead ROM targets lateral delts and upward scapular rotation');

        if (hasShoulder || realm === 'cable') {
            addEx('incline-dumbbell-press', 4, 8, bench1RM * 0.35, `⚡ LAYER 2 MAIN ANCHOR: Neutral grip · Spares anterior capsule · ${curWeekInfo.compoundTargetIntensity}`);
            addEx('seated-dumbbell-shoulder-press', 3, 10, ohp1RM * 0.35, '⚡ LAYER 2 ANCHOR: Scapular plane pressing');
        } else if (doctrine === 'aesthetic_armor') {
            addEx('incline-barbell-bench-press', 4, 8, bench1RM * (intensityMul * 0.9), `⚡ LAYER 2 MAIN ANCHOR: 30° Clavicular upper chest shelf · ${curWeekInfo.compoundTargetIntensity}`);
            addEx('standing-barbell-ohp', 3, 8, ohp1RM * intensityMul, `⚡ LAYER 2 ANCHOR: Strict overhead lockout`);
        } else {
            addEx('barbell-bench-press', 4, 6, bench1RM * intensityMul, `⚡ LAYER 2 MAIN ANCHOR: Paused on chest · ${curWeekInfo.compoundTargetIntensity}`);
            addEx('standing-barbell-ohp', 3, 6, ohp1RM * intensityMul, `⚡ LAYER 2 ANCHOR: Strict vertical drive · ${curWeekInfo.compoundTargetIntensity}`);
        }

        if (hasElbow || realm === 'cable') {
            addEx('cable-tricep-pushdown', 3, 12, bench1RM * 0.25, '🛡️ LAYER 3 ARMOR: Constant cable tension with zero elbow joint shear');
        } else {
            addEx('jm-press', 3, 8, bench1RM * 0.50, '🛡️ LAYER 3 ARMOR: Powerlifter secret for bulletproof elbow tendons and bench lockout');
        }

        if (realm === 'home') {
            addEx('dips-chest', 3, 10, 0, '🛡️ LAYER 3 ARMOR: Deep sternal stretch & lockout');
        } else {
            addEx('cable-chest-fly', 3, 12, bench1RM * 0.20, '🛡️ LAYER 3 ARMOR: Peak adduction pectoral squeeze');
        }
    } else if (activeDay === 2) {
        // DAY 2: LOWER SQUAT & PATELLAR KNEE ARMOR
        addEx('spanish-squat-isometric', 2, 45, 0, '⚡ LAYER 1 TENDON PRIMER: 45s hold triggers patellar tendon analgesia (Rio et al. protocol)');
        addEx('tibialis-wall-raise', 3, 15, 0, '⚡ LAYER 1 TENDON PRIMER: Decelerates ground reaction force; shields knee joint');

        if (hasKnee || realm === 'cable') {
            addEx('poliquin-step-down', 4, 10, squat1RM * 0.25, `⚡ LAYER 2 MAIN ANCHOR: Knee-over-toes VMO recruitment · ${curWeekInfo.compoundTargetIntensity}`);
            addEx('bulgarian-split-squat', 3, 10, squat1RM * 0.22, '⚡ LAYER 2 ANCHOR: Unilateral quad & glute stability');
        } else {
            addEx('barbell-back-squat', 4, 6, squat1RM * intensityMul, `⚡ LAYER 2 MAIN ANCHOR: Competition depth · ${curWeekInfo.compoundTargetIntensity}`);
            addEx('poliquin-step-down', 3, 10, squat1RM * 0.25, '⚡ LAYER 2 ANCHOR: Slant board VMO teardrop armor');
        }

        addEx('copenhagen-plank', 3, 30, 0, '🛡️ LAYER 3 ARMOR: 30s adductor hold for deep squat pelvic stability & groin protection');
        if (realm === 'home') {
            addEx('standing-calf-raise', 4, 15, bw * 0.5, '🛡️ LAYER 3 ARMOR: 3s bottom pause Achilles tendon loading');
        } else {
            addEx('seated-soleus-raise', 4, 15, bw * 0.60, '🛡️ LAYER 3 ARMOR: Bent-knee 3s stretch for deep soleus density (8x BW force)');
        }
    } else if (activeDay === 3) {
        // DAY 3: UPPER PULL, BACK & ELBOW ARMOR
        if (realm === 'home') {
            addEx('serratus-wall-slide', 2, 12, 0, '⚡ LAYER 1 TENDON PRIMER: Scapular upward rotation & ribcage lock');
        } else {
            addEx('cable-face-pull', 3, 15, ohp1RM * 0.25, '⚡ LAYER 1 TENDON PRIMER: External rotation to eye level for rear delts & cuff');
        }

        if (hasBack || realm === 'cable') {
            addEx('single-arm-dumbbell-row', 4, 10, bench1RM * 0.35, `⚡ LAYER 2 MAIN ANCHOR: Supported unilateral lat drive · ${curWeekInfo.compoundTargetIntensity}`);
            addEx('lat-pulldown', 4, 10, bw * 0.75, '⚡ LAYER 2 ANCHOR: Wide-grip scapular depression');
        } else {
            addEx('barbell-row', 4, 8, bench1RM * (intensityMul * 0.9), `⚡ LAYER 2 MAIN ANCHOR: Strict pendlay/bent row · ${curWeekInfo.compoundTargetIntensity}`);
            addEx('pull-ups', 4, 8, 0, '⚡ LAYER 2 ANCHOR: Dead-hang to chest vertical pull');
        }

        addEx('zottman-curl', 3, 12, bench1RM * 0.18, '🛡️ LAYER 3 ARMOR: Pronated 3s negative to remodel elbow extensors & brachioradialis');
        addEx('hammer-curl', 3, 10, bench1RM * 0.20, '🛡️ LAYER 3 ARMOR: Neutral-grip brachialis & forearm thickness');
        addEx('neck-flexion-extension', 3, 20, 0, '🛡️ LAYER 3 ARMOR: Cervical spine armor & athletic collar density');
    } else {
        // DAY 4: POSTERIOR CHAIN, DEADLIFT & SPINAL ARMOR
        addEx('copenhagen-plank', 2, 30, 0, '⚡ LAYER 1 TENDON PRIMER: 30s pelvic & adductor lock before hip hinging');
        addEx('tibialis-wall-raise', 2, 15, 0, '⚡ LAYER 1 TENDON PRIMER: Lower-leg ankle dorsiflexion primer');

        if (hasBack) {
            addEx('barbell-hip-thrust', 4, 8, deadlift1RM * 0.65, `⚡ LAYER 2 MAIN ANCHOR: Zero spinal shear glute & hamstring loading · ${curWeekInfo.compoundTargetIntensity}`);
            addEx('bulgarian-split-squat', 3, 10, squat1RM * 0.22, '⚡ LAYER 2 ANCHOR: Unilateral hip drive without lumbar compression');
        } else if (realm === 'cable') {
            addEx('romanian-deadlift', 4, 8, deadlift1RM * 0.65, `⚡ LAYER 2 MAIN ANCHOR: Deep hamstring lengthen-under-load · ${curWeekInfo.compoundTargetIntensity}`);
            addEx('bulgarian-split-squat', 3, 10, squat1RM * 0.22, '⚡ LAYER 2 ANCHOR: Unilateral posterior & quad balance');
        } else {
            addEx('conventional-deadlift', 4, 5, deadlift1RM * intensityMul, `⚡ LAYER 2 MAIN ANCHOR: Raw posterior chain power · ${curWeekInfo.compoundTargetIntensity}`);
            addEx('romanian-deadlift', 3, 8, deadlift1RM * 0.60, '⚡ LAYER 2 ANCHOR: Controlled eccentric hamstring stretch');
        }

        if (!hasBack) {
            addEx('jefferson-curl', 3, 8, deadlift1RM * 0.20, '🛡️ LAYER 3 ARMOR: Segmental spinal flexion loading for permanent back resilience');
        }
        addEx('farmers-walk-heavy', 3, 45, bw * 0.45, '🛡️ LAYER 3 ARMOR: 45s heavy carry for decompressed spinal grip & trap armor');
        addEx('hanging-leg-raise', 3, 12, 0, '🛡️ LAYER 3 ARMOR: Posterior pelvic tilt abdominal & lumbar decompression');
    }

    return {
        id: planId,
        name: `${planTitle}${daysPerWeek ? ` · ${daysPerWeek}d/wk` : ''}`,
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
