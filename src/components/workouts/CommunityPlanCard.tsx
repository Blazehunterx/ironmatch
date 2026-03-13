import React from 'react';
import { motion } from 'framer-motion';
import { Users, Plus } from 'lucide-react';
import { WorkoutPlan } from '../../types/database';

interface CommunityPlan extends WorkoutPlan {
    profiles?: {
        name: string;
        profile_image_url: string;
    };
}

interface CommunityPlanCardProps {
    plan: CommunityPlan;
    index: number;
    onAdd: (plan: WorkoutPlan) => void;
}

const CommunityPlanCard: React.FC<CommunityPlanCardProps> = ({ plan, index, onAdd }) => {
    return (
        <motion.div
            key={plan.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 overflow-hidden relative group"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden">
                    {plan.profiles?.profile_image_url ? (
                        <img src={plan.profiles.profile_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <Users size={14} className="text-gray-500" />
                    )}
                </div>
                <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{plan.profiles?.name || 'Trainer'}</p>
                    <h4 className="font-bold text-white text-sm">{plan.name}</h4>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold uppercase">{plan.target}</span>
                <span className="text-[9px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-bold uppercase">{plan.exercises.length} Exercises</span>
            </div>

            <button
                onClick={() => onAdd(plan)}
                className="w-full py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-500/20 active:scale-[0.98] transition-all"
            >
                <Plus size={14} /> Add to My Plans
            </button>
        </motion.div>
    );
};

export default CommunityPlanCard;
