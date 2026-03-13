import { motion } from 'framer-motion';
import { Check, Dumbbell } from 'lucide-react';
import { WorkoutExercise } from '../../types/database';

interface ActiveWorkoutExerciseListProps {
    exercises: WorkoutExercise[];
    currentIdx: number;
    setCurrentIdx: (idx: number) => void;
    toggleComplete: (id: string) => void;
}

export default function ActiveWorkoutExerciseList({
    exercises, currentIdx, setCurrentIdx, toggleComplete
}: ActiveWorkoutExerciseListProps) {
    return (
        <div className="flex-1 px-4 py-4 space-y-3">
            {exercises.map((ex, idx) => (
                <motion.div
                    key={ex.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setCurrentIdx(idx)}
                    className={`rounded-2xl border p-4 transition-all cursor-pointer ${currentIdx === idx
                        ? 'bg-gray-900 border-lime/30 shadow-[0_0_20px_-4px_rgba(50,255,50,0.1)]'
                        : ex.completed
                            ? 'bg-gray-900/50 border-gray-800/50 opacity-60'
                            : 'bg-gray-900 border-gray-800'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleComplete(ex.id); }}
                            className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${ex.completed
                                ? 'bg-lime border-lime text-oled'
                                : 'border-gray-700 text-transparent hover:border-lime/50'
                                }`}
                        >
                            <Check size={16} />
                        </button>
                        <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-sm ${ex.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                                {ex.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                                <span>{ex.sets} sets</span>
                                <span>·</span>
                                <span>{ex.reps} reps</span>
                                {ex.weight && <><span>·</span><span>{ex.weight} lbs</span></>}
                            </div>
                        </div>
                        {currentIdx === idx && !ex.completed && (
                            <Dumbbell size={18} className="text-lime animate-pulse shrink-0" />
                        )}
                    </div>

                    {/* Expanded set tracker for current exercise */}
                    {currentIdx === idx && !ex.completed && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-3 pt-3 border-t border-gray-800/50"
                        >
                            <div className="flex gap-2">
                                {Array.from({ length: ex.sets }).map((_, si) => (
                                    <div key={si} className="flex-1 bg-oled border border-gray-700 rounded-lg p-2 text-center">
                                        <span className="text-[9px] text-gray-600 uppercase block">Set {si + 1}</span>
                                        <span className="text-xs font-bold text-white">{ex.reps}</span>
                                        <span className="text-[9px] text-gray-600 block">{ex.weight ? `${ex.weight}lb` : 'BW'}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleComplete(ex.id); setCurrentIdx(Math.min(idx + 1, exercises.length - 1)); }}
                                className="w-full mt-2 py-2 rounded-lg bg-lime/10 border border-lime/30 text-lime text-xs font-bold flex items-center justify-center gap-1 active:scale-[0.98] transition"
                            >
                                <Check size={14} /> Mark Complete
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            ))}
        </div>
    );
}
