import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Trash2, Play } from 'lucide-react';
import { WorkoutPlan } from '../../types/database';

interface WorkoutPlanCardProps {
    plan: WorkoutPlan;
    index: number;
    isTrainer: boolean;
    onStart: (plan: WorkoutPlan) => void;
    onDelete: (id: string) => void;
    onToggleShare: (id: string) => void;
}

const WorkoutPlanCard: React.FC<WorkoutPlanCardProps> = ({
    plan,
    index,
    isTrainer,
    onStart,
    onDelete,
    onToggleShare
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-4"
        >
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h4 className="font-bold text-white text-sm">{plan.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-lime/10 text-lime px-2 py-0.5 rounded border border-lime/20 font-semibold">{plan.target}</span>
                        <span className="text-[10px] text-gray-500">{plan.exercises.length} exercises</span>
                    </div>
                </div>
                <div className="flex gap-1.5">
                    {isTrainer && (
                        <button
                            onClick={() => onToggleShare(plan.id)}
                            className={`p-2 rounded-lg border transition-all ${plan.shared
                                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-white'
                                }`}
                            title={plan.shared ? 'Shared with clients' : 'Share with clients'}
                        >
                            <Share2 size={14} />
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(plan.id)}
                        className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-500 hover:text-red-400 transition-all"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Exercise preview */}
            <div className="space-y-1 mb-3">
                {plan.exercises.slice(0, 3).map((ex, i) => (
                    <div key={ex.id} className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="text-[9px] text-lime bg-lime/10 w-4 h-4 rounded flex items-center justify-center font-bold">{i + 1}</span>
                        <span className="flex-1 truncate">{ex.name}</span>
                        <span className="text-gray-600">{ex.sets}×{ex.reps}{ex.weight ? ` · ${ex.weight}lbs` : ''}</span>
                    </div>
                ))}
                {plan.exercises.length > 3 && (
                    <span className="text-[10px] text-gray-600 pl-6">+{plan.exercises.length - 3} more</span>
                )}
            </div>

            {/* Start Workout */}
            <button
                onClick={() => onStart(plan)}
                className="w-full py-2.5 rounded-xl bg-lime/10 border border-lime/30 text-lime text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-lime/20 active:scale-[0.98] transition-all"
            >
                <Play size={14} /> Start Workout
            </button>

            {plan.shared && (
                <p className="text-[10px] text-blue-400 mt-2 text-center flex items-center justify-center gap-1">
                    <Share2 size={10} /> Shared with your clients
                </p>
            )}
        </motion.div>
    );
};

export default WorkoutPlanCard;
