/**
 * IronMatch Autoregulation & Progressive Overload Engine
 * Calibrates load targets, estimated 1RM, and fatigue management based on RPE / RIR.
 */

export interface RPETier {
    value: number;
    label: string;
    rir: number; // Reps In Reserve
    description: string;
    badgeColor: string;
}

export const RPE_SCALE: RPETier[] = [
    { value: 6.0, label: '@6.0', rir: 4, description: 'Warm-up / High speed (4+ RIR)', badgeColor: 'text-gray-400 border-gray-700 bg-gray-900' },
    { value: 7.0, label: '@7.0', rir: 3, description: 'Explosive / Moderate effort (3 RIR)', badgeColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30' },
    { value: 7.5, label: '@7.5', rir: 2.5, description: 'Comfortable working pace (~2-3 RIR)', badgeColor: 'text-teal-400 border-teal-500/40 bg-teal-950/30' },
    { value: 8.0, label: '@8.0', rir: 2, description: 'Optimal Hypertrophy Zone (2 RIR)', badgeColor: 'text-lime border-lime/50 bg-lime/10' },
    { value: 8.5, label: '@8.5', rir: 1.5, description: 'Heavy & Demanding (~1-2 RIR)', badgeColor: 'text-amber-400 border-amber-500/40 bg-amber-950/30' },
    { value: 9.0, label: '@9.0', rir: 1, description: 'Near Max / 1 Rep Left (1 RIR)', badgeColor: 'text-orange-400 border-orange-500/40 bg-orange-950/30' },
    { value: 9.5, label: '@9.5', rir: 0.5, description: 'Grind / Could not do more reps', badgeColor: 'text-rose-400 border-rose-500/40 bg-rose-950/30' },
    { value: 10.0, label: '@10.0', rir: 0, description: 'Absolute Failure / PR Peak (0 RIR)', badgeColor: 'text-red-500 border-red-500 bg-red-950/40' },
];

/**
 * Calculates Estimated 1RM using Epley formula with RPE/RIR adjustment
 */
export function calculateEstimated1RM(weight: number, reps: number, rpe: number = 8.0): number {
    if (weight <= 0 || reps <= 0) return 0;
    const rir = Math.max(0, 10 - rpe);
    const effectiveReps = reps + rir;
    // Epley formula: w * (1 + r / 30)
    const e1rm = weight * (1 + effectiveReps / 30);
    return Math.round(e1rm * 10) / 10;
}

export interface OverloadRecommendation {
    nextWeight: number;
    difference: number;
    action: 'increase' | 'maintain' | 'microload' | 'deload';
    reason: string;
    recommendedRestSeconds: number;
    e1RM: number;
}

/**
 * Calculates next load progression recommendation based on logged RPE and performance
 */
export function calculateOverloadRecommendation(
    currentWeight: number,
    reps: number,
    targetReps: number = reps,
    rpe: number = 8.0,
    unit: 'kg' | 'lbs' = 'kg'
): OverloadRecommendation {
    const e1RM = calculateEstimated1RM(currentWeight, reps, rpe);
    const step = unit === 'kg' ? 2.5 : 5.0;
    const microStep = unit === 'kg' ? 1.0 : 2.5;

    // Case 1: Bodyweight or zero weight exercise
    if (currentWeight <= 0) {
        return {
            nextWeight: 0,
            difference: 0,
            action: reps >= targetReps ? 'increase' : 'maintain',
            reason: reps >= targetReps 
                ? 'Target reps achieved with bodyweight. Try adding +2 reps or +5kg weighted vest.'
                : 'Continue building baseline reps.',
            recommendedRestSeconds: 60,
            e1RM: 0
        };
    }

    // Case 2: Lifter crushed it at low RPE (RPE <= 7.0, >= 3 RIR)
    if (rpe <= 7.0 && reps >= targetReps) {
        return {
            nextWeight: currentWeight + step,
            difference: step,
            action: 'increase',
            reason: `High explosive bar speed (≥3 reps in reserve). Ready for +${step}${unit} progression.`,
            recommendedRestSeconds: 90,
            e1RM
        };
    }

    // Case 3: In the sweet spot (RPE 7.5 - 8.0)
    if (rpe <= 8.0 && reps >= targetReps) {
        return {
            nextWeight: currentWeight + microStep,
            difference: microStep,
            action: 'microload',
            reason: `Optimal hypertrophy stimulus (2 RIR). Progressive overload of +${microStep}${unit} recommended.`,
            recommendedRestSeconds: 120,
            e1RM
        };
    }

    // Case 4: Heavy threshold (RPE 8.5 - 9.0)
    if (rpe <= 9.0) {
        return {
            nextWeight: currentWeight,
            difference: 0,
            action: 'maintain',
            reason: `Threshold peak reached (1 RIR). Maintain ${currentWeight}${unit} to solidify form next session.`,
            recommendedRestSeconds: 180,
            e1RM
        };
    }

    // Case 5: Near or at failure (RPE 9.5 - 10.0)
    const deloadWeight = Math.max(0, Math.round((currentWeight * 0.95) / (unit === 'kg' ? 2.5 : 5.0)) * (unit === 'kg' ? 2.5 : 5.0));
    return {
        nextWeight: deloadWeight,
        difference: -(currentWeight - deloadWeight),
        action: 'deload',
        reason: `Maximum physical strain detected (0 RIR). Drop ~5% on back-off sets to prevent fatigue accumulation.`,
        recommendedRestSeconds: 210,
        e1RM
    };
}
