import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Minus, Zap } from 'lucide-react';
import { Big4Lifts } from '../../lib/gamification';
import { TierBadge, rankFor } from '../profile/RankBadge';

export type CalibratedMuscleKey = 
    | 'chest' 
    | 'traps' 
    | 'biceps' 
    | 'triceps' 
    | 'shoulders' 
    | 'lats' 
    | 'quads' 
    | 'hamstrings' 
    | 'calves'
    | 'forearms'
    | 'abs'
    | 'lowerBack';

export interface MuscleExerciseOption {
    id: string;
    name: string;
    modality: 'dumbbell' | 'barbell' | 'cable' | 'machine' | 'bodyweight';
    defaultWeightKg: number;
    defaultReps: number;
    compoundRatio: number;
    compoundTarget: 'bench' | 'squat' | 'deadlift' | 'ohp';
}

export interface CalibratedEntry {
    exerciseName: string;
    weight: number;
    reps: number;
    e1RM: number;
    compoundTarget: 'bench' | 'squat' | 'deadlift' | 'ohp';
}

export const MUSCLE_DEFINITIONS: Record<CalibratedMuscleKey, {
    name: string;
    view: 'front' | 'back';
    category: string;
    icon: string;
    exercises: MuscleExerciseOption[];
}> = {
    chest: {
        name: 'Upper Chest & Pectorals',
        view: 'front',
        category: 'Push / Upper',
        icon: '🪑',
        exercises: [
            { id: 'incline-db', name: 'Incline Dumbbell Press', modality: 'dumbbell', defaultWeightKg: 16, defaultReps: 10, compoundRatio: 2.2, compoundTarget: 'bench' },
            { id: 'bench-barbell', name: 'Barbell Bench Press', modality: 'barbell', defaultWeightKg: 50, defaultReps: 8, compoundRatio: 1.0, compoundTarget: 'bench' },
            { id: 'chest-press-mach', name: 'Chest Press Machine', modality: 'machine', defaultWeightKg: 40, defaultReps: 10, compoundRatio: 0.9, compoundTarget: 'bench' },
            { id: 'cable-fly', name: 'Cable Fly', modality: 'cable', defaultWeightKg: 12, defaultReps: 12, compoundRatio: 1.4, compoundTarget: 'bench' },
        ]
    },
    traps: {
        name: 'Traps & Upper Back',
        view: 'back',
        category: 'Pull / Posture',
        icon: '🦅',
        exercises: [
            { id: 'db-shrug', name: 'Dumbbell Shrugs', modality: 'dumbbell', defaultWeightKg: 22, defaultReps: 12, compoundRatio: 1.8, compoundTarget: 'deadlift' },
            { id: 'barbell-shrug', name: 'Barbell Shrugs', modality: 'barbell', defaultWeightKg: 70, defaultReps: 10, compoundRatio: 0.8, compoundTarget: 'deadlift' },
            { id: 'face-pull', name: 'Cable Face Pulls', modality: 'cable', defaultWeightKg: 25, defaultReps: 15, compoundRatio: 1.2, compoundTarget: 'ohp' },
            { id: 'farmers-walk', name: "Farmer's Walk", modality: 'dumbbell', defaultWeightKg: 24, defaultReps: 10, compoundRatio: 1.9, compoundTarget: 'deadlift' },
        ]
    },
    biceps: {
        name: 'Biceps',
        view: 'front',
        category: 'Pull / Arms',
        icon: '💪',
        exercises: [
            { id: 'db-curl', name: 'Dumbbell Bicep Curl', modality: 'dumbbell', defaultWeightKg: 12, defaultReps: 10, compoundRatio: 1.8, compoundTarget: 'bench' },
            { id: 'hammer-curl', name: 'Hammer Curl', modality: 'dumbbell', defaultWeightKg: 14, defaultReps: 10, compoundRatio: 1.6, compoundTarget: 'bench' },
            { id: 'ez-bar-curl', name: 'Barbell EZ-Bar Curl', modality: 'barbell', defaultWeightKg: 27.5, defaultReps: 8, compoundRatio: 1.1, compoundTarget: 'bench' },
            { id: 'cable-curl', name: 'Cable Curl', modality: 'cable', defaultWeightKg: 20, defaultReps: 12, compoundRatio: 1.3, compoundTarget: 'bench' },
        ]
    },
    triceps: {
        name: 'Triceps',
        view: 'back',
        category: 'Push / Arms',
        icon: '⚡',
        exercises: [
            { id: 'rope-pushdown', name: 'Cable Rope Pushdown', modality: 'cable', defaultWeightKg: 22.5, defaultReps: 12, compoundRatio: 1.4, compoundTarget: 'ohp' },
            { id: 'skull-crushers', name: 'Skull Crushers', modality: 'barbell', defaultWeightKg: 25, defaultReps: 10, compoundRatio: 1.2, compoundTarget: 'bench' },
            { id: 'dips', name: 'Dips', modality: 'bodyweight', defaultWeightKg: 0, defaultReps: 10, compoundRatio: 1.1, compoundTarget: 'bench' },
            { id: 'close-grip-bench', name: 'Close-Grip Bench', modality: 'barbell', defaultWeightKg: 45, defaultReps: 8, compoundRatio: 0.95, compoundTarget: 'bench' },
        ]
    },
    quads: {
        name: 'Quads & Legs',
        view: 'front',
        category: 'Legs / Lower',
        icon: '🏋️',
        exercises: [
            { id: 'leg-press', name: 'Leg Press', modality: 'machine', defaultWeightKg: 120, defaultReps: 10, compoundRatio: 0.45, compoundTarget: 'squat' },
            { id: 'goblet-squat', name: 'Goblet Squat', modality: 'dumbbell', defaultWeightKg: 22, defaultReps: 10, compoundRatio: 1.9, compoundTarget: 'squat' },
            { id: 'barbell-squat', name: 'Barbell Squat', modality: 'barbell', defaultWeightKg: 60, defaultReps: 8, compoundRatio: 1.0, compoundTarget: 'squat' },
            { id: 'leg-ext', name: 'Leg Extension', modality: 'machine', defaultWeightKg: 40, defaultReps: 12, compoundRatio: 0.9, compoundTarget: 'squat' },
        ]
    },
    hamstrings: {
        name: 'Hamstrings & Glutes',
        view: 'back',
        category: 'Legs / Posterior',
        icon: '🍑',
        exercises: [
            { id: 'rdl-dumbbell', name: 'Romanian Deadlift (RDL)', modality: 'dumbbell', defaultWeightKg: 45, defaultReps: 10, compoundRatio: 1.0, compoundTarget: 'deadlift' },
            { id: 'leg-curl', name: 'Leg Curl', modality: 'machine', defaultWeightKg: 35, defaultReps: 10, compoundRatio: 1.1, compoundTarget: 'deadlift' },
            { id: 'barbell-deadlift', name: 'Barbell Deadlift', modality: 'barbell', defaultWeightKg: 75, defaultReps: 6, compoundRatio: 1.0, compoundTarget: 'deadlift' },
            { id: 'hip-thrust', name: 'Hip Thrust', modality: 'barbell', defaultWeightKg: 70, defaultReps: 10, compoundRatio: 0.8, compoundTarget: 'squat' },
        ]
    },
    shoulders: {
        name: 'Shoulders & Delts',
        view: 'front',
        category: 'Push / Upper',
        icon: '🙌',
        exercises: [
            { id: 'lateral-raise', name: 'Dumbbell Lateral Raise', modality: 'dumbbell', defaultWeightKg: 8, defaultReps: 12, compoundRatio: 2.5, compoundTarget: 'ohp' },
            { id: 'db-shoulder-press', name: 'Overhead Dumbbell Press', modality: 'dumbbell', defaultWeightKg: 16, defaultReps: 8, compoundRatio: 1.8, compoundTarget: 'ohp' },
            { id: 'barbell-ohp', name: 'Barbell Overhead Press (OHP)', modality: 'barbell', defaultWeightKg: 35, defaultReps: 6, compoundRatio: 1.0, compoundTarget: 'ohp' },
            { id: 'cable-lat-raise', name: 'Cable Lateral Raise', modality: 'cable', defaultWeightKg: 7.5, defaultReps: 12, compoundRatio: 2.6, compoundTarget: 'ohp' },
        ]
    },
    lats: {
        name: 'Lats & Back',
        view: 'back',
        category: 'Pull / Back',
        icon: '🦇',
        exercises: [
            { id: 'lat-pulldown', name: 'Cable Lat Pulldown', modality: 'cable', defaultWeightKg: 50, defaultReps: 10, compoundRatio: 0.85, compoundTarget: 'deadlift' },
            { id: 'pull-ups', name: 'Pull-ups / Chin-ups', modality: 'bodyweight', defaultWeightKg: 0, defaultReps: 8, compoundRatio: 1.0, compoundTarget: 'deadlift' },
            { id: 'cable-row', name: 'Seated Cable Row', modality: 'cable', defaultWeightKg: 45, defaultReps: 10, compoundRatio: 0.9, compoundTarget: 'deadlift' },
            { id: 'one-arm-db-row', name: 'Single-Arm Dumbbell Row', modality: 'dumbbell', defaultWeightKg: 22, defaultReps: 10, compoundRatio: 1.8, compoundTarget: 'deadlift' },
        ]
    },
    calves: {
        name: 'Calves & Lower Legs',
        view: 'front',
        category: 'Legs / Calves',
        icon: '🦵',
        exercises: [
            { id: 'standing-calf-raise', name: 'Standing Dumbbell Calf Raise', modality: 'dumbbell', defaultWeightKg: 20, defaultReps: 15, compoundRatio: 0.8, compoundTarget: 'squat' },
            { id: 'seated-calf-mach', name: 'Seated Calf Raise Machine', modality: 'machine', defaultWeightKg: 35, defaultReps: 15, compoundRatio: 0.7, compoundTarget: 'squat' },
            { id: 'leg-press-calf', name: 'Leg Press Calf Press', modality: 'machine', defaultWeightKg: 90, defaultReps: 15, compoundRatio: 0.5, compoundTarget: 'squat' },
            { id: 'single-calf-bw', name: 'Single-Leg Bodyweight Calf Raise', modality: 'bodyweight', defaultWeightKg: 0, defaultReps: 20, compoundRatio: 0.8, compoundTarget: 'squat' },
        ]
    },
    forearms: {
        name: 'Forearms & Grip',
        view: 'front',
        category: 'Arms / Grip',
        icon: '✊',
        exercises: [
            { id: 'wrist-curl', name: 'Dumbbell Wrist Curls', modality: 'dumbbell', defaultWeightKg: 10, defaultReps: 15, compoundRatio: 1.1, compoundTarget: 'bench' },
            { id: 'reverse-curl', name: 'Reverse Barbell Curls', modality: 'barbell', defaultWeightKg: 20, defaultReps: 10, compoundRatio: 1.0, compoundTarget: 'bench' },
            { id: 'dead-hang', name: 'Bar Dead Hangs (seconds)', modality: 'bodyweight', defaultWeightKg: 0, defaultReps: 45, compoundRatio: 1.0, compoundTarget: 'deadlift' },
            { id: 'farmer-carry-grip', name: "Farmer's Grip Carry", modality: 'dumbbell', defaultWeightKg: 22, defaultReps: 10, compoundRatio: 1.4, compoundTarget: 'deadlift' },
        ]
    },
    abs: {
        name: 'Abs & Core',
        view: 'front',
        category: 'Core',
        icon: '🧱',
        exercises: [
            { id: 'hanging-knee', name: 'Hanging Knee / Leg Raise', modality: 'bodyweight', defaultWeightKg: 0, defaultReps: 12, compoundRatio: 1.0, compoundTarget: 'squat' },
            { id: 'cable-crunch', name: 'Cable Rope Kneeling Crunch', modality: 'cable', defaultWeightKg: 30, defaultReps: 15, compoundRatio: 0.9, compoundTarget: 'squat' },
            { id: 'plank', name: 'Weighted Plank Hold', modality: 'bodyweight', defaultWeightKg: 10, defaultReps: 45, compoundRatio: 1.0, compoundTarget: 'squat' },
            { id: 'ab-wheel', name: 'Ab Wheel Rollout', modality: 'bodyweight', defaultWeightKg: 0, defaultReps: 10, compoundRatio: 1.0, compoundTarget: 'squat' },
        ]
    },
    lowerBack: {
        name: 'Lower Back & Spine',
        view: 'back',
        category: 'Back / Core',
        icon: '🛡️',
        exercises: [
            { id: 'back-ext', name: 'Back Extensions (Hyperextensions)', modality: 'bodyweight', defaultWeightKg: 10, defaultReps: 12, compoundRatio: 1.3, compoundTarget: 'deadlift' },
            { id: 'good-mornings', name: 'Barbell Good Mornings', modality: 'barbell', defaultWeightKg: 40, defaultReps: 8, compoundRatio: 1.0, compoundTarget: 'deadlift' },
            { id: 'rack-pulls', name: 'Barbell Rack Pulls', modality: 'barbell', defaultWeightKg: 80, defaultReps: 6, compoundRatio: 0.85, compoundTarget: 'deadlift' },
            { id: 'deficit-deadlift', name: 'Deficit Deadlift', modality: 'barbell', defaultWeightKg: 65, defaultReps: 6, compoundRatio: 1.05, compoundTarget: 'deadlift' },
        ]
    }
};

// Mirror SVG helper for bilateral anatomy
const mirror = (d: string) => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${200 - Number(x)},${y}`);

const SVG_SHAPES: Record<CalibratedMuscleKey, { front?: string[]; back?: string[] }> = {
    chest: {
        front: [
            "M78,96 C88,92 98,94 99,98 L99,128 C88,132 76,128 70,120 C68,108 72,100 78,96 Z",
            mirror("M78,96 C88,92 98,94 99,98 L99,128 C88,132 76,128 70,120 C68,108 72,100 78,96 Z")
        ]
    },
    traps: {
        back: [
            "M78,90 L122,90 C130,100 128,118 118,128 L82,128 C72,118 70,100 78,90 Z"
        ]
    },
    biceps: {
        front: [
            "M46,128 L64,122 C66,140 62,156 58,164 L44,162 C40,150 42,138 46,128 Z",
            mirror("M46,128 L64,122 C66,140 62,156 58,164 L44,162 C40,150 42,138 46,128 Z")
        ]
    },
    triceps: {
        back: [
            "M46,128 L64,122 C66,140 62,156 58,164 L44,162 C40,150 42,138 46,128 Z",
            mirror("M46,128 L64,122 C66,140 62,156 58,164 L44,162 C40,150 42,138 46,128 Z")
        ]
    },
    forearms: {
        front: [
            "M44,166 L58,166 C56,180 50,196 42,204 L34,196 C38,186 42,176 44,166 Z",
            mirror("M44,166 L58,166 C56,180 50,196 42,204 L34,196 C38,186 42,176 44,166 Z")
        ],
        back: [
            "M44,166 L58,166 C56,180 50,196 42,204 L34,196 C38,186 42,176 44,166 Z",
            mirror("M44,166 L58,166 C56,180 50,196 42,204 L34,196 C38,186 42,176 44,166 Z")
        ]
    },
    shoulders: {
        front: [
            "M62,92 C50,96 44,110 46,124 L66,118 C68,106 70,98 76,94 Z",
            mirror("M62,92 C50,96 44,110 46,124 L66,118 C68,106 70,98 76,94 Z")
        ],
        back: [
            "M62,92 C50,96 44,110 46,124 L66,118 C68,106 70,98 76,94 Z",
            mirror("M62,92 C50,96 44,110 46,124 L66,118 C68,106 70,98 76,94 Z")
        ]
    },
    lats: {
        back: [
            "M70,124 L98,132 L98,188 C86,186 76,172 72,156 C68,144 68,132 70,124 Z",
            mirror("M70,124 L98,132 L98,188 C86,186 76,172 72,156 C68,144 68,132 70,124 Z")
        ]
    },
    lowerBack: {
        back: [
            "M86,188 L114,188 C116,200 114,210 100,214 C86,210 84,200 86,188 Z"
        ]
    },
    quads: {
        front: [
            "M74,214 L98,220 C98,250 96,282 92,300 L76,300 C68,276 66,240 74,214 Z",
            mirror("M74,214 L98,220 C98,250 96,282 92,300 L76,300 C68,276 66,240 74,214 Z")
        ]
    },
    hamstrings: {
        back: [
            "M74,196 L99,198 L99,232 C88,236 76,232 70,222 C68,210 70,202 74,196 Z",
            mirror("M74,196 L99,198 L99,232 C88,236 76,232 70,222 C68,210 70,202 74,196 Z"),
            "M72,238 L98,240 C98,264 96,284 92,300 L76,300 C70,282 68,258 72,238 Z",
            mirror("M72,238 L98,240 C98,264 96,284 92,300 L76,300 C70,282 68,258 72,238 Z")
        ]
    },
    calves: {
        front: [
            "M76,312 L92,312 C94,332 92,352 88,370 L80,370 C74,352 72,332 76,312 Z",
            mirror("M76,312 L92,312 C94,332 92,352 88,370 L80,370 C74,352 72,332 76,312 Z")
        ],
        back: [
            "M76,312 L92,312 C96,330 94,352 88,370 L80,370 C72,352 72,330 76,312 Z",
            mirror("M76,312 L92,312 C96,330 94,352 88,370 L80,370 C72,352 72,330 76,312 Z")
        ]
    },
    abs: {
        front: [
            "M82,134 L118,134 C120,160 118,190 112,206 L88,206 C82,190 80,160 82,134 Z"
        ]
    }
};

const SILHOUETTE_BODY = "M100,20 C112,20 118,30 118,44 C118,58 112,68 106,72 L106,80 C120,84 140,86 150,94 C160,102 160,124 158,140 L156,168 L148,200 L136,198 L142,166 L140,136 L134,190 L130,210 L122,300 L116,372 L100,374 L100,230 L100,374 L84,372 L78,300 L70,210 L66,190 L60,136 L58,166 L64,198 L52,200 L44,168 L42,140 C40,124 40,102 50,94 C60,86 80,84 94,80 L94,72 C88,68 82,58 82,44 C82,30 88,20 100,20 Z";

interface InteractiveBodyCalibrationProps {
    unitPref: 'kg' | 'lbs';
    onCalibratedLiftsChange: (lifts: Big4Lifts) => void;
    currentLifts: Big4Lifts;
}

export default function InteractiveBodyCalibration({
    unitPref,
    onCalibratedLiftsChange,
    currentLifts
}: InteractiveBodyCalibrationProps) {
    const [view, setView] = useState<'front' | 'back'>('front');
    const [activeMuscle, setActiveMuscle] = useState<CalibratedMuscleKey | null>('chest');
    const [calibrations, setCalibrations] = useState<Partial<Record<CalibratedMuscleKey, CalibratedEntry>>>(() => {
        const initial: Partial<Record<CalibratedMuscleKey, CalibratedEntry>> = {};
        if (currentLifts.bench > 0) {
            initial.chest = { exerciseName: 'Barbell Bench Press', weight: currentLifts.bench, reps: 8, e1RM: currentLifts.bench, compoundTarget: 'bench' };
        }
        if (currentLifts.squat > 0) {
            initial.quads = { exerciseName: 'Barbell Squat', weight: currentLifts.squat, reps: 6, e1RM: currentLifts.squat, compoundTarget: 'squat' };
        }
        if (currentLifts.deadlift > 0) {
            initial.hamstrings = { exerciseName: 'Barbell Deadlift', weight: currentLifts.deadlift, reps: 5, e1RM: currentLifts.deadlift, compoundTarget: 'deadlift' };
        }
        if (currentLifts.ohp > 0) {
            initial.shoulders = { exerciseName: 'Barbell Overhead Press (OHP)', weight: currentLifts.ohp, reps: 6, e1RM: currentLifts.ohp, compoundTarget: 'ohp' };
        }
        return initial;
    });

    const [selectedExercise, setSelectedExercise] = useState<MuscleExerciseOption | null>(null);
    const [inputWeight, setInputWeight] = useState<number>(20);
    const [inputReps, setInputReps] = useState<number>(10);

    const openMuscleEditor = (muscleKey: CalibratedMuscleKey) => {
        setActiveMuscle(muscleKey);
        const def = MUSCLE_DEFINITIONS[muscleKey];
        if (def.view !== view) {
            setView(def.view);
        }

        const existing = calibrations[muscleKey];
        if (existing) {
            const matchedEx = def.exercises.find(e => e.name === existing.exerciseName) || def.exercises[0];
            setSelectedExercise(matchedEx);
            setInputWeight(existing.weight);
            setInputReps(existing.reps);
        } else {
            const defaultEx = def.exercises[0];
            setSelectedExercise(defaultEx);
            const w = unitPref === 'lbs' ? Math.round(defaultEx.defaultWeightKg * 2.20462) : defaultEx.defaultWeightKg;
            setInputWeight(w);
            setInputReps(defaultEx.defaultReps);
        }
    };

    const handleSaveActiveMuscle = () => {
        if (!activeMuscle || !selectedExercise) return;

        const calcE1RM = Math.round(inputWeight * (1 + inputReps / 30));

        const updated = {
            ...calibrations,
            [activeMuscle]: {
                exerciseName: selectedExercise.name,
                weight: inputWeight,
                reps: inputReps,
                e1RM: calcE1RM,
                compoundTarget: selectedExercise.compoundTarget
            }
        };

        setCalibrations(updated);
        deriveAndPropagateBig4(updated);
    };

    const deriveAndPropagateBig4 = (calibMap: Partial<Record<CalibratedMuscleKey, CalibratedEntry>>) => {
        let bench = currentLifts.bench || 0;
        if (calibMap.chest) bench = Math.max(bench, Math.round(calibMap.chest.e1RM * 1.0));
        else if (calibMap.biceps || calibMap.triceps || calibMap.forearms) {
            const armPower = (calibMap.biceps?.e1RM || 0) * 1.4 + (calibMap.triceps?.e1RM || 0) * 1.2;
            if (armPower > 0) bench = Math.max(bench, Math.round(armPower));
        }

        let squat = currentLifts.squat || 0;
        if (calibMap.quads) squat = Math.max(squat, Math.round(calibMap.quads.e1RM * 1.0));
        else if (calibMap.hamstrings) squat = Math.max(squat, Math.round(calibMap.hamstrings.e1RM * 0.85));

        let deadlift = currentLifts.deadlift || 0;
        if (calibMap.hamstrings) deadlift = Math.max(deadlift, Math.round(calibMap.hamstrings.e1RM * 1.0));
        else if (calibMap.traps || calibMap.lats || calibMap.lowerBack) {
            const backPower = (calibMap.traps?.e1RM || 0) * 1.1 + (calibMap.lats?.e1RM || 0) * 1.0 + (calibMap.lowerBack?.e1RM || 0) * 1.1;
            if (backPower > 0) deadlift = Math.max(deadlift, Math.round(backPower));
        }

        let ohp = currentLifts.ohp || 0;
        if (calibMap.shoulders) ohp = Math.max(ohp, Math.round(calibMap.shoulders.e1RM * 1.0));
        else if (calibMap.triceps) ohp = Math.max(ohp, Math.round(calibMap.triceps.e1RM * 0.75));

        if (bench > 0 && squat === 0) squat = Math.round(bench * 1.25);
        if (bench > 0 && deadlift === 0) deadlift = Math.round(bench * 1.5);
        if (bench > 0 && ohp === 0) ohp = Math.round(bench * 0.6);

        if (squat > 0 && bench === 0) bench = Math.round(squat * 0.75);
        if (squat > 0 && deadlift === 0) deadlift = Math.round(squat * 1.2);
        if (squat > 0 && ohp === 0) ohp = Math.round(squat * 0.45);

        const newLifts: Big4Lifts = {
            bench: Math.max(bench, unitPref === 'kg' ? 25 : 55),
            squat: Math.max(squat, unitPref === 'kg' ? 35 : 75),
            deadlift: Math.max(deadlift, unitPref === 'kg' ? 45 : 100),
            ohp: Math.max(ohp, unitPref === 'kg' ? 20 : 45)
        };

        onCalibratedLiftsChange(newLifts);
    };

    const handleQuickBeginnerFill = () => {
        const isKg = unitPref === 'kg';
        const starter: Partial<Record<CalibratedMuscleKey, CalibratedEntry>> = {
            chest: { exerciseName: 'Incline Dumbbell Press', weight: isKg ? 14 : 30, reps: 10, e1RM: isKg ? 18 : 40, compoundTarget: 'bench' },
            traps: { exerciseName: 'Dumbbell Shrugs', weight: isKg ? 18 : 40, reps: 12, e1RM: isKg ? 25 : 55, compoundTarget: 'deadlift' },
            biceps: { exerciseName: 'Dumbbell Bicep Curl', weight: isKg ? 10 : 20, reps: 10, e1RM: isKg ? 13 : 26, compoundTarget: 'bench' },
            triceps: { exerciseName: 'Cable Rope Pushdown', weight: isKg ? 17.5 : 40, reps: 12, e1RM: isKg ? 24 : 52, compoundTarget: 'ohp' },
            shoulders: { exerciseName: 'Dumbbell Lateral Raise', weight: isKg ? 7 : 15, reps: 12, e1RM: isKg ? 10 : 20, compoundTarget: 'ohp' },
            lats: { exerciseName: 'Cable Lat Pulldown', weight: isKg ? 40 : 90, reps: 10, e1RM: isKg ? 52 : 115, compoundTarget: 'deadlift' },
            quads: { exerciseName: 'Leg Press', weight: isKg ? 90 : 200, reps: 10, e1RM: isKg ? 120 : 260, compoundTarget: 'squat' },
            hamstrings: { exerciseName: 'Romanian Deadlift (RDL)', weight: isKg ? 35 : 80, reps: 10, e1RM: isKg ? 46 : 105, compoundTarget: 'deadlift' },
            calves: { exerciseName: 'Standing Dumbbell Calf Raise', weight: isKg ? 16 : 35, reps: 15, e1RM: isKg ? 24 : 52, compoundTarget: 'squat' },
            forearms: { exerciseName: 'Dumbbell Wrist Curls', weight: isKg ? 8 : 18, reps: 15, e1RM: isKg ? 12 : 26, compoundTarget: 'bench' },
            abs: { exerciseName: 'Cable Rope Kneeling Crunch', weight: isKg ? 25 : 55, reps: 15, e1RM: isKg ? 37 : 80, compoundTarget: 'squat' },
            lowerBack: { exerciseName: 'Back Extensions (Hyperextensions)', weight: isKg ? 10 : 20, reps: 12, e1RM: isKg ? 14 : 28, compoundTarget: 'deadlift' }
        };
        setCalibrations(starter);
        deriveAndPropagateBig4(starter);
    };

    const calibratedCount = Object.keys(calibrations).length;
    const totalCompoundKg = unitPref === 'lbs'
        ? Math.round((currentLifts.bench + currentLifts.squat + currentLifts.deadlift + currentLifts.ohp) / 2.20462)
        : (currentLifts.bench + currentLifts.squat + currentLifts.deadlift + currentLifts.ohp);
    const estimatedRank = rankFor(totalCompoundKg > 0 ? totalCompoundKg : 150);

    return (
        <div className="space-y-4">
            {/* Header Status & Rank Projection */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-lime/15 via-gray-950 to-oled border border-lime/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <TierBadge tier={estimatedRank.tier} size="sm" />
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black uppercase text-white tracking-wider">
                                {estimatedRank.name} Placement
                            </span>
                            <span className="text-[9px] bg-lime/20 text-lime font-mono px-1.5 py-0.2 rounded font-bold">
                                {calibratedCount}/12 Lit
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-400">
                            Tap any muscle on the physique to configure its lift
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleQuickBeginnerFill}
                    className="px-2.5 py-1.5 rounded-xl bg-lime/10 hover:bg-lime/20 border border-lime/30 text-[10px] font-bold text-lime transition active:scale-95 shrink-0"
                >
                    ⚡ Auto-Fill
                </button>
            </div>

            {/* Front / Back Perspective Switcher */}
            <div className="flex justify-center">
                <div className="inline-flex rounded-full border border-gray-800 p-1 bg-gray-950 shadow-inner">
                    <button
                        type="button"
                        onClick={() => setView('front')}
                        className={`px-5 py-1.5 rounded-full text-xs font-black transition uppercase tracking-wider ${
                            view === 'front' ? 'bg-lime text-oled shadow-[0_0_15px_rgba(50,255,50,0.3)]' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Front View (6 Muscles)
                    </button>
                    <button
                        type="button"
                        onClick={() => setView('back')}
                        className={`px-5 py-1.5 rounded-full text-xs font-black transition uppercase tracking-wider ${
                            view === 'back' ? 'bg-lime text-oled shadow-[0_0_15px_rgba(50,255,50,0.3)]' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Back View (6 Muscles)
                    </button>
                </div>
            </div>

            {/* Interactive Anatomical Silhouette */}
            <div className="relative mx-auto w-full max-w-[260px] h-[340px] flex items-center justify-center bg-black/60 rounded-3xl border border-gray-900 overflow-hidden shadow-2xl">
                <AnimatePresence mode="wait">
                    <motion.svg
                        key={view}
                        viewBox="0 0 200 390"
                        className="h-full w-auto filter drop-shadow-[0_0_12px_rgba(50,255,50,0.15)] select-none"
                        initial={{ opacity: 0, rotateY: 90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: -90 }}
                        transition={{ duration: 0.25 }}
                    >
                        <defs>
                            <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
                                <feGaussianBlur stdDeviation="4" result="glow" />
                                <feMerge>
                                    <feMergeNode in="glow" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Base Human Silhouette Outline */}
                        <path
                            d={SILHOUETTE_BODY}
                            fill="#0A0F14"
                            stroke="#1E293B"
                            strokeWidth="1.5"
                        />

                        {/* Interactive Muscle Layers */}
                        {(Object.keys(MUSCLE_DEFINITIONS) as CalibratedMuscleKey[]).map(muscleKey => {
                            const shape = SVG_SHAPES[muscleKey];
                            const paths = view === 'front' ? shape.front : shape.back;
                            if (!paths) return null;

                            const isCalibrated = !!calibrations[muscleKey];
                            const isCurrentSelected = activeMuscle === muscleKey;

                            return (
                                <g 
                                    key={muscleKey} 
                                    onClick={() => openMuscleEditor(muscleKey)}
                                    className="cursor-pointer transition-all duration-200"
                                >
                                    {paths.map((p, idx) => (
                                        <motion.path
                                            key={`${muscleKey}-${idx}`}
                                            d={p}
                                            fill={
                                                isCalibrated
                                                    ? '#32FF32'
                                                    : isCurrentSelected
                                                    ? '#0E7490'
                                                    : '#111827'
                                            }
                                            fillOpacity={isCalibrated ? 0.85 : isCurrentSelected ? 0.6 : 0.4}
                                            stroke={
                                                isCalibrated
                                                    ? '#32FF32'
                                                    : isCurrentSelected
                                                    ? '#38BDF8'
                                                    : '#374151'
                                            }
                                            strokeWidth={isCalibrated || isCurrentSelected ? 2 : 1}
                                            filter={isCalibrated ? 'url(#neon-glow)' : undefined}
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ duration: 0.15 }}
                                        />
                                    ))}
                                </g>
                            );
                        })}
                    </motion.svg>
                </AnimatePresence>

                {/* Helper prompt overlay on body */}
                <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
                    <span className="text-[9px] font-mono text-gray-500 bg-black/80 px-2 py-0.5 rounded-full border border-gray-800">
                        {view === 'front' ? 'Chest · Biceps · Quads · Shoulders · Abs · Forearms' : 'Traps · Lats · Triceps · Lower Back · Hamstrings · Calves'}
                    </span>
                </div>
            </div>

            {/* Quick Horizontal Muscle Selector Chips for All Muscle Groups */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none px-1">
                {(Object.keys(MUSCLE_DEFINITIONS) as CalibratedMuscleKey[])
                    .filter(k => MUSCLE_DEFINITIONS[k].view === view)
                    .map(k => {
                        const def = MUSCLE_DEFINITIONS[k];
                        const isDone = !!calibrations[k];
                        const isActive = activeMuscle === k;

                        return (
                            <button
                                key={k}
                                type="button"
                                onClick={() => openMuscleEditor(k)}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-all border ${
                                    isActive
                                        ? 'bg-lime text-oled border-lime shadow-[0_0_12px_rgba(50,255,50,0.3)]'
                                        : isDone
                                        ? 'bg-lime/10 text-lime border-lime/40'
                                        : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                                }`}
                            >
                                <span>{def.icon}</span>
                                <span>{def.name.split('&')[0].trim()}</span>
                                {isDone && <Check size={12} className="stroke-[3]" />}
                            </button>
                        );
                    })}
            </div>

            {/* MUSCLE CALIBRATION DRAWER / CARD */}
            {activeMuscle && (
                <motion.div
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-4 rounded-3xl bg-gray-950 border border-lime/40 space-y-3.5 shadow-2xl relative"
                >
                    <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{MUSCLE_DEFINITIONS[activeMuscle].icon}</span>
                            <div>
                                <h3 className="text-xs font-black uppercase text-white tracking-wider">
                                    {MUSCLE_DEFINITIONS[activeMuscle].name}
                                </h3>
                                <p className="text-[10px] text-lime font-mono">
                                    {MUSCLE_DEFINITIONS[activeMuscle].category}
                                </p>
                            </div>
                        </div>

                        {calibrations[activeMuscle] && (
                            <span className="px-2 py-0.5 rounded-full bg-lime/20 text-lime text-[9px] font-bold flex items-center gap-1">
                                <Check size={10} /> Calibrated
                            </span>
                        )}
                    </div>

                    {/* Exercise Selection Chips */}
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">
                            Select Most Common Exercise
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                            {MUSCLE_DEFINITIONS[activeMuscle].exercises.map(ex => {
                                const isSelected = selectedExercise?.id === ex.id;
                                return (
                                    <button
                                        key={ex.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedExercise(ex);
                                            const w = unitPref === 'lbs' ? Math.round(ex.defaultWeightKg * 2.20462) : ex.defaultWeightKg;
                                            setInputWeight(w);
                                            setInputReps(ex.defaultReps);
                                        }}
                                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                                            isSelected
                                                ? 'bg-lime/15 border-lime text-white shadow-[0_0_15px_rgba(50,255,50,0.15)]'
                                                : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-mono text-gray-500 uppercase">{ex.modality}</span>
                                            {isSelected && <Check size={12} className="text-lime" />}
                                        </div>
                                        <p className="text-[11px] font-bold mt-1 line-clamp-1">{ex.name}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Weight & Reps Stepper Fill-In */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                        {/* Working Weight */}
                        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-3">
                            <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">
                                Working Weight ({unitPref})
                            </label>
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setInputWeight(w => Math.max(0, w - (unitPref === 'kg' ? 2.5 : 5)))}
                                    className="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white font-bold"
                                >
                                    <Minus size={14} />
                                </button>
                                <input
                                    type="number"
                                    value={inputWeight}
                                    onChange={e => setInputWeight(Math.max(0, Number(e.target.value) || 0))}
                                    className="w-16 bg-transparent text-center font-mono font-black text-white text-base focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setInputWeight(w => w + (unitPref === 'kg' ? 2.5 : 5))}
                                    className="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white font-bold"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Working Reps */}
                        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-3">
                            <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">
                                Target Reps
                            </label>
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setInputReps(r => Math.max(1, r - 1))}
                                    className="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white font-bold"
                                >
                                    <Minus size={14} />
                                </button>
                                <input
                                    type="number"
                                    value={inputReps}
                                    onChange={e => setInputReps(Math.max(1, Number(e.target.value) || 1))}
                                    className="w-16 bg-transparent text-center font-mono font-black text-white text-base focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setInputReps(r => r + 1)}
                                    className="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white font-bold"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Instant Calculation Feedback */}
                    <div className="flex items-center justify-between px-1 text-[10px]">
                        <span className="text-gray-400">
                            Estimated Max: <strong className="text-white font-mono">{Math.round(inputWeight * (1 + inputReps / 30))} {unitPref}</strong>
                        </span>
                        <span className="text-lime font-mono">
                            Maps to {selectedExercise?.compoundTarget.toUpperCase()} compound
                        </span>
                    </div>

                    {/* Confirm Button */}
                    <button
                        type="button"
                        onClick={handleSaveActiveMuscle}
                        className="w-full py-3 rounded-2xl bg-lime text-oled font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-lime/90 transition shadow-[0_0_20px_rgba(50,255,50,0.3)] active:scale-[0.98]"
                    >
                        <Zap size={14} /> Save & Light Up Muscle ⚡
                    </button>
                </motion.div>
            )}
        </div>
    );
}
