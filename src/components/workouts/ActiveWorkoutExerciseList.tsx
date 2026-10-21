import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Dumbbell, ShieldAlert, Sparkles, Plus, Minus, CheckCircle2, Zap, TrendingUp, History } from 'lucide-react';
import { WorkoutExercise, SetDetail } from '../../types/database';
import { RPE_SCALE, calculateOverloadRecommendation } from '../../lib/autoregulation';
import { getModalityForExercise } from '../../lib/exercises';

interface ActiveWorkoutExerciseListProps {
    exercises: WorkoutExercise[];
    currentIdx: number;
    setCurrentIdx: (idx: number) => void;
    toggleComplete: (id: string) => void;
    onUpdateExercise?: (updated: WorkoutExercise) => void;
    onOpenSwap?: (exercise: WorkoutExercise) => void;
    onOpenPlateCalc?: (weight: number) => void;
    onTriggerRest?: (seconds?: number) => void;
    unit?: 'kg' | 'lbs';
}

export default function ActiveWorkoutExerciseList({
    exercises,
    currentIdx,
    setCurrentIdx,
    toggleComplete,
    onUpdateExercise,
    onOpenSwap,
    onOpenPlateCalc,
    onTriggerRest,
    unit = 'kg'
}: ActiveWorkoutExerciseListProps) {
    const [selectedSetIdx, setSelectedSetIdx] = useState<number>(0);

    const playClickTone = () => {
        try {
            if ('vibrate' in navigator) {
                navigator.vibrate(12);
            }
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, ctx.currentTime);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } catch {}
    };

    const getSets = (ex: WorkoutExercise): SetDetail[] => {
        if (ex.setDetails && ex.setDetails.length > 0) {
            return ex.setDetails;
        }
        return Array.from({ length: Math.max(1, ex.sets) }, (_, i) => ({
            setNumber: i + 1,
            reps: ex.reps,
            weight: ex.weight || 0,
            completed: !!ex.completed
        }));
    };

    const updateSet = (ex: WorkoutExercise, setIdx: number, updates: Partial<SetDetail>) => {
        playClickTone();
        const currentSets = [...getSets(ex)];
        if (!currentSets[setIdx]) return;

        currentSets[setIdx] = { ...currentSets[setIdx], ...updates };
        const allCompleted = currentSets.every(s => s.completed);

        if (updates.completed) {
            try {
                if ('vibrate' in navigator) navigator.vibrate([20, 50, 25]);
            } catch {}

            // Auto-advance to the next incomplete set in this exercise
            const nextIncompleteIdx = currentSets.findIndex((s, i) => i > setIdx && !s.completed);
            if (nextIncompleteIdx !== -1) {
                setSelectedSetIdx(nextIncompleteIdx);
            }

            if (onTriggerRest) {
                const rec = calculateOverloadRecommendation(
                    currentSets[setIdx].weight || 0,
                    currentSets[setIdx].reps,
                    ex.reps,
                    currentSets[setIdx].rpe || 8.0,
                    unit
                );
                onTriggerRest(rec.recommendedRestSeconds || 90);
            }
        }

        if (onUpdateExercise) {
            onUpdateExercise({
                ...ex,
                sets: currentSets.length,
                setDetails: currentSets,
                completed: allCompleted ? true : ex.completed
            });
        }
    };

    const handleAddSet = (ex: WorkoutExercise) => {
        playClickTone();
        const currentSets = [...getSets(ex)];
        const lastSet = currentSets[currentSets.length - 1] || { reps: ex.reps, weight: ex.weight || 0 };
        currentSets.push({
            setNumber: currentSets.length + 1,
            reps: lastSet.reps,
            weight: lastSet.weight,
            completed: false
        });

        setSelectedSetIdx(currentSets.length - 1);

        if (onUpdateExercise) {
            onUpdateExercise({
                ...ex,
                sets: currentSets.length,
                setDetails: currentSets
            });
        }
    };

    const handleRemoveSet = (ex: WorkoutExercise) => {
        playClickTone();
        const currentSets = [...getSets(ex)];
        if (currentSets.length <= 1) return;
        currentSets.pop();

        setSelectedSetIdx(Math.min(selectedSetIdx, currentSets.length - 1));

        if (onUpdateExercise) {
            onUpdateExercise({
                ...ex,
                sets: currentSets.length,
                setDetails: currentSets
            });
        }
    };

    return (
        <div className="flex-1 px-4 py-4 space-y-3">
            {exercises.map((ex, idx) => {
                const isCurrent = currentIdx === idx;
                const sets = getSets(ex);
                const activeSetIndex = Math.min(selectedSetIdx, sets.length - 1);
                const activeSet = sets[activeSetIndex] || sets[0];

                return (
                    <motion.div
                        key={ex.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => {
                            if (currentIdx !== idx) {
                                setCurrentIdx(idx);
                                setSelectedSetIdx(0);
                            }
                        }}
                        className={`rounded-2xl border p-4 transition-all cursor-pointer ${
                            isCurrent
                                ? 'bg-gray-900 border-lime/40 shadow-[0_0_20px_-4px_rgba(50,255,50,0.15)]'
                                : ex.completed
                                    ? 'bg-gray-900/50 border-gray-800/50 opacity-60'
                                    : 'bg-gray-900 border-gray-800'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleComplete(ex.id); }}
                                className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${
                                    ex.completed
                                        ? 'bg-lime border-lime text-oled shadow-[0_0_10px_rgba(50,255,50,0.4)]'
                                        : 'border-gray-700 text-transparent hover:border-lime/50'
                                }`}
                            >
                                <Check size={16} />
                            </button>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <h4 className={`font-bold text-sm truncate ${ex.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                                            {ex.name}
                                        </h4>
                                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-white/10 text-gray-400 font-mono shrink-0">
                                            {ex.modality || getModalityForExercise(ex.name)}
                                        </span>
                                    </div>
                                    {onOpenSwap && !ex.completed && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onOpenSwap(ex); }}
                                            className="text-[10px] flex items-center gap-1 text-lime/80 hover:text-lime bg-lime/10 px-2 py-0.5 rounded-lg border border-lime/20 font-bold shrink-0 transition-colors"
                                        >
                                            <ShieldAlert size={11} /> Swap
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5 flex-wrap">
                                    <span>{sets.length} sets</span>
                                    <span>·</span>
                                    <span>{ex.reps} target reps</span>
                                    {ex.previousPerformance && (
                                        <>
                                            <span>·</span>
                                            <span className="text-gray-300 font-mono flex items-center gap-1">
                                                <History size={10} className="text-lime" />
                                                Last: {ex.previousPerformance.weight}{unit} × {ex.previousPerformance.reps}
                                            </span>
                                        </>
                                    )}
                                    {ex.weight ? (
                                        <>
                                            <span>·</span>
                                            <span className="text-lime font-bold">{ex.weight} {unit}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>·</span>
                                            <span>Bodyweight</span>
                                        </>
                                    )}
                                </div>
                                {ex.notes && (
                                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 italic">
                                        <Sparkles size={10} className="text-lime shrink-0" /> {ex.notes}
                                    </p>
                                )}
                            </div>
                            {isCurrent && !ex.completed && (
                                <Dumbbell size={18} className="text-lime animate-pulse shrink-0" />
                            )}
                        </div>

                        {/* Interactive In-Set Rep & Weight Tracker */}
                        {isCurrent && !ex.completed && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="mt-3 pt-3 border-t border-gray-800/60 space-y-3"
                            >
                                {/* Set Selector Pills */}
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                        Tap set to edit actual reps/weight:
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleRemoveSet(ex); }}
                                            disabled={sets.length <= 1}
                                            className="p-1 text-gray-500 hover:text-red-400 disabled:opacity-30 rounded"
                                            title="Remove Set"
                                        >
                                            <Minus size={13} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleAddSet(ex); }}
                                            className="p-1 text-lime hover:text-white rounded"
                                            title="Add Set"
                                        >
                                            <Plus size={13} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                    {sets.map((s, si) => {
                                        const isSelected = activeSetIndex === si;
                                        return (
                                            <button
                                                type="button"
                                                key={si}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedSetIdx(si);
                                                }}
                                                className={`flex-1 min-w-[62px] rounded-xl p-2 text-center transition-all border ${
                                                    isSelected
                                                        ? 'bg-lime/10 border-lime shadow-[0_0_12px_rgba(50,255,50,0.25)]'
                                                        : s.completed
                                                            ? 'bg-gray-900 border-lime/40 text-gray-300'
                                                            : 'bg-oled border-gray-800 hover:border-gray-700'
                                                }`}
                                            >
                                                <div className="flex items-center justify-center gap-1 mb-0.5">
                                                    <span className={`text-[9px] uppercase font-bold ${isSelected ? 'text-lime' : 'text-gray-500'}`}>
                                                        S{s.setNumber}
                                                    </span>
                                                    {s.completed && <CheckCircle2 size={10} className="text-lime" />}
                                                </div>
                                                <span className="text-xs font-black text-white block">{s.reps}r</span>
                                                <span className="text-[9px] text-lime font-mono block font-bold">
                                                    {s.weight ? `${s.weight}${unit}` : 'BW'}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Active Set Stepper Controls */}
                                {activeSet && (
                                    <div className="p-3 bg-oled rounded-2xl border border-gray-800/80 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black text-white uppercase italic">
                                                Set {activeSet.setNumber} Calibration
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateSet(ex, activeSetIndex, { completed: !activeSet.completed });
                                                }}
                                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                                                    activeSet.completed
                                                        ? 'bg-lime text-oled shadow-sm'
                                                        : 'bg-gray-800 text-gray-300 hover:text-white'
                                                }`}
                                            >
                                                <Check size={11} /> {activeSet.completed ? 'Set Done' : 'Mark Set Done'}
                                            </button>
                                        </div>

                                        {/* Ghost Previous History Banner */}
                                        {ex.previousPerformance && (
                                            <div className="flex items-center justify-between text-[11px] bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
                                                <span className="text-gray-400 flex items-center gap-1.5">
                                                    <History size={12} className="text-lime" />
                                                    Previous: <strong className="text-white font-mono">{ex.previousPerformance.weight}{unit} × {ex.previousPerformance.reps}</strong> {ex.previousPerformance.rpe ? `@ RPE ${ex.previousPerformance.rpe}` : ''}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateSet(ex, activeSetIndex, {
                                                            weight: ex.previousPerformance!.weight,
                                                            reps: ex.previousPerformance!.reps
                                                        });
                                                    }}
                                                    className="text-[10px] font-black text-lime uppercase tracking-wider bg-lime/10 px-2 py-0.5 rounded border border-lime/20 hover:bg-lime/20 transition-colors"
                                                >
                                                    Match
                                                </button>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-2">
                                            {/* Reps Stepper */}
                                            <div className="p-2 bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-between">
                                                <div>
                                                    <span className="text-[8px] text-gray-500 uppercase font-black block">Reps</span>
                                                    <span className="text-base font-black text-white font-mono">{activeSet.reps}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateSet(ex, activeSetIndex, { reps: Math.max(1, activeSet.reps - 1) });
                                                        }}
                                                        className="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 text-white font-bold flex items-center justify-center active:scale-95 text-xs"
                                                    >
                                                        -
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateSet(ex, activeSetIndex, { reps: activeSet.reps + 1 });
                                                        }}
                                                        className="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 text-white font-bold flex items-center justify-center active:scale-95 text-xs"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Weight Stepper */}
                                            {(() => {
                                                const modality = ex.modality || getModalityForExercise(ex.name);
                                                const stepInc = modality === 'dumbbell' ? 2.0 : modality === 'barbell' ? 2.5 : modality === 'bodyweight' ? 2.5 : 5.0;
                                                return (
                                                    <div className="p-2 bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <div>
                                                                <span className="text-[8px] text-gray-500 uppercase font-black block">
                                                                    {modality === 'bodyweight' ? `+ Extra (${unit})` : `Weight (${unit})`}
                                                                </span>
                                                                <span className="text-base font-black text-lime font-mono">{activeSet.weight || 0}</span>
                                                            </div>
                                                            {modality === 'barbell' && onOpenPlateCalc && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onOpenPlateCalc(activeSet.weight || 100);
                                                                    }}
                                                                    className="p-1 rounded-lg bg-lime/10 border border-lime/20 text-lime hover:bg-lime/20 transition active:scale-95 ml-1"
                                                                    title="Barbell Plate Calculator"
                                                                >
                                                                    <Dumbbell size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateSet(ex, activeSetIndex, { weight: Math.max(0, Math.round(((activeSet.weight || 0) - stepInc) * 10) / 10) });
                                                                }}
                                                                className="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 text-white font-bold flex items-center justify-center active:scale-95 text-xs"
                                                            >
                                                                -
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateSet(ex, activeSetIndex, { weight: Math.round(((activeSet.weight || 0) + stepInc) * 10) / 10 });
                                                                }}
                                                                className="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 text-white font-bold flex items-center justify-center active:scale-95 text-xs"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* RPE & Autoregulation Overload Engine */}
                                        <div className="pt-2 border-t border-gray-800/60 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
                                                    <Zap size={11} className="text-lime" /> RPE & Fatigue Calibration:
                                                </span>
                                                <span className="text-[9px] font-mono font-bold text-lime">
                                                    {activeSet.rpe ? `@${activeSet.rpe.toFixed(1)}` : '@8.0 (Target)'}
                                                </span>
                                            </div>

                                            {/* RPE Scale Selector Chips */}
                                            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                                                {RPE_SCALE.map((tier) => {
                                                    const isSelected = (activeSet.rpe || 8.0) === tier.value;
                                                    return (
                                                        <button
                                                            key={tier.value}
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateSet(ex, activeSetIndex, { rpe: tier.value });
                                                            }}
                                                            className={`px-2 py-1 rounded-lg text-[9px] font-mono font-bold whitespace-nowrap transition-all border ${
                                                                isSelected
                                                                    ? 'bg-lime text-black border-lime shadow-[0_0_10px_rgba(50,255,50,0.3)]'
                                                                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                                                            }`}
                                                            title={tier.description}
                                                        >
                                                            {tier.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Overload Calculation Card */}
                                            {(() => {
                                                const rec = calculateOverloadRecommendation(
                                                    activeSet.weight || 0,
                                                    activeSet.reps,
                                                    ex.reps,
                                                    activeSet.rpe || 8.0,
                                                    unit
                                                );
                                                return (
                                                    <div className="p-2.5 rounded-xl bg-gray-950 border border-gray-800/80 flex items-center justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                                <TrendingUp size={12} className={rec.action === 'increase' ? 'text-lime' : rec.action === 'microload' ? 'text-teal-400' : rec.action === 'deload' ? 'text-rose-400' : 'text-amber-400'} />
                                                                <span className="text-[10px] font-black uppercase tracking-wider text-white">
                                                                    {rec.action === 'increase' ? `Next Session: +${rec.difference}${unit}` :
                                                                     rec.action === 'microload' ? `Next Session: +${rec.difference}${unit}` :
                                                                     rec.action === 'deload' ? `Deload: ${rec.difference}${unit}` :
                                                                     `Maintain ${activeSet.weight || 0}${unit}`}
                                                                </span>
                                                                {rec.e1RM > 0 && (
                                                                    <span className="text-[9px] text-gray-500 font-mono">
                                                                        (e1RM: {rec.e1RM}{unit})
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[9px] text-gray-400 truncate">
                                                                {rec.reason}
                                                            </p>
                                                        </div>

                                                        <div className="text-right shrink-0">
                                                            <span className="text-[8px] text-gray-500 uppercase font-black block">Target Load</span>
                                                            <span className="text-xs font-mono font-black text-lime">
                                                                {rec.nextWeight > 0 ? `${rec.nextWeight}${unit}` : 'BW'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleComplete(ex.id);
                                        setCurrentIdx(Math.min(idx + 1, exercises.length - 1));
                                        setSelectedSetIdx(0);
                                    }}
                                    className="w-full py-2.5 rounded-xl bg-lime/10 border border-lime/30 text-lime text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-[0.98] transition hover:bg-lime/20"
                                >
                                    <Check size={14} /> Mark Entire Exercise Complete
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}
