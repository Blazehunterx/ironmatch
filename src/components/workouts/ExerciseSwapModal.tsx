import { motion } from 'framer-motion';
import { ShieldAlert, X, ArrowRight, Sparkles } from 'lucide-react';
import { WorkoutExercise } from '../../types/database';

interface ExerciseSwapModalProps {
    exercise: WorkoutExercise;
    onSelectSwap: (newExercise: { name: string; notes?: string }) => void;
    onClose: () => void;
}

interface SwapOption {
    name: string;
    reason: string;
    tempo: string;
    jointBenefit: string;
}

export default function ExerciseSwapModal({ exercise, onSelectSwap, onClose }: ExerciseSwapModalProps) {
    const nameLower = exercise.name.toLowerCase();

    let category = 'general';
    if (nameLower.includes('bench') || nameLower.includes('press') || nameLower.includes('fly') || nameLower.includes('push')) {
        category = 'push';
    } else if (nameLower.includes('squat') || nameLower.includes('lunge') || nameLower.includes('leg') || nameLower.includes('quad')) {
        category = 'legs';
    } else if (nameLower.includes('deadlift') || nameLower.includes('row') || nameLower.includes('pull') || nameLower.includes('curl')) {
        category = 'pull';
    }

    const swapPresets: Record<string, SwapOption[]> = {
        push: [
            {
                name: '30° Incline Neutral-Grip DB Press',
                reason: 'Shoulder joint impingement & acromion pinch',
                tempo: '3s eccentric · 1s pause at bottom',
                jointBenefit: 'Tucks elbows 30°, completely removes rotator cuff shearing.'
            },
            {
                name: 'Seated Cable Chest Press (Neutral Wrist)',
                reason: 'Wrist or anterior capsule discomfort',
                tempo: '2s down · Constant tension',
                jointBenefit: 'Continuous resistance curve without compressive joint collapse.'
            },
            {
                name: 'Barbell Floor Press',
                reason: 'Shoulder hyperextension / bench taken',
                tempo: 'Controlled descent to tricep floor touch',
                jointBenefit: 'Floor limits shoulder extension, protecting anterior glenohumeral capsule.'
            }
        ],
        legs: [
            {
                name: 'Seated Hamstring Curls (Pre-Exhaust)',
                reason: 'Patellar tendon knee shear / stiff knees',
                tempo: '3s slow negative · 15 reps',
                jointBenefit: 'Synovial fluid knee lubrication before any squatting mechanics.'
            },
            {
                name: 'Spanish Squat (Banded Shins)',
                reason: 'Quadriceps tendonitis & patellar pain',
                tempo: '45s isometric hold or 3s slow descent',
                jointBenefit: 'Forces 100% vertical shins, reducing patellofemoral shear to zero.'
            },
            {
                name: 'Angled Sled Leg Press (High Foot Placement)',
                reason: 'Lumbar compression / squat rack taken',
                tempo: '2s down · Do not lock knees',
                jointBenefit: 'Posterior pelvic tilt protection; transfers load to glutes & hamstrings.'
            }
        ],
        pull: [
            {
                name: 'Chest-Supported T-Bar Row',
                reason: 'Lower back / spinal tightness',
                tempo: '3s eccentric · 1s strict contraction',
                jointBenefit: 'Eliminates erector spinae shear stress; 100% upper back isolation.'
            },
            {
                name: 'Neutral Close-Grip Lat Pulldown',
                reason: 'Bicep tendonitis or wrist strain',
                tempo: 'Pull to clavicle · 2s controlled stretch',
                jointBenefit: 'Optimal lat line-of-pull without radial wrist torsion.'
            },
            {
                name: 'Heavy Farmers / Suitcase Carry',
                reason: 'Spinal decompression & functional grip',
                tempo: '40s continuous walking pace',
                jointBenefit: 'Strengthens quadratus lumborum & obliques without axial spine compression.'
            }
        ],
        general: [
            {
                name: 'Cable Single-Arm Row / Press',
                reason: 'Equipment taken / unilateral imbalance',
                tempo: '3s eccentric · Squeeze at peak',
                jointBenefit: 'Zero compressive joint load; aligns with natural scapular plane.'
            },
            {
                name: 'Dumbbell Iso-Hold Variant',
                reason: 'Tendon rehabilitation (Rio et al. 2015)',
                tempo: '45s sustained isometric load',
                jointBenefit: 'Provides immediate analgesic tendon pain relief.'
            }
        ]
    };

    const options = swapPresets[category] || swapPresets.general;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="w-full max-w-lg bg-oled border border-gray-800 rounded-t-[32px] sm:rounded-[32px] p-6 space-y-5 max-h-[85vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-lime/10 border border-lime/30 rounded-xl text-lime">
                            <ShieldAlert size={18} />
                        </div>
                        <div>
                            <h3 className="text-white font-black text-sm uppercase tracking-wide">Quen Physio Swap</h3>
                            <p className="text-[11px] text-gray-500">Joint-safe replacement for <span className="text-lime">{exercise.name}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-white rounded-xl">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-3">
                    {options.map((opt, i) => (
                        <div
                            key={i}
                            onClick={() => onSelectSwap({ name: opt.name, notes: `${opt.tempo} · ${opt.jointBenefit}` })}
                            className="bg-gray-900/60 border border-gray-800 hover:border-lime/40 rounded-2xl p-4 transition-all cursor-pointer group active:scale-[0.98]"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h4 className="text-white font-bold text-sm group-hover:text-lime transition-colors flex items-center gap-1.5">
                                        {opt.name}
                                    </h4>
                                    <p className="text-[10px] text-red-400 font-semibold mt-0.5">
                                        For: {opt.reason}
                                    </p>
                                </div>
                                <span className="p-2 rounded-xl bg-gray-800 group-hover:bg-lime group-hover:text-oled text-gray-400 transition-all shrink-0">
                                    <ArrowRight size={14} />
                                </span>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-gray-800/60 text-[11px] space-y-1">
                                <div className="text-gray-400 flex items-center gap-1.5">
                                    <Sparkles size={12} className="text-lime shrink-0" />
                                    <span><strong className="text-gray-300">Tempo:</strong> {opt.tempo}</span>
                                </div>
                                <p className="text-gray-500 text-[10px] pl-4 leading-relaxed">
                                    {opt.jointBenefit}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 font-bold text-xs hover:text-white transition"
                >
                    Keep Original Exercise
                </button>
            </motion.div>
        </div>
    );
}
