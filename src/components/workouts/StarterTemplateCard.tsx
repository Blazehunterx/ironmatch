import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { WorkoutPlan } from '../../types/database';

interface StarterTemplateCardProps {
    template: WorkoutPlan;
    index: number;
    onUse: (template: WorkoutPlan) => void;
}

const StarterTemplateCard: React.FC<StarterTemplateCardProps> = ({ template, index, onUse }) => {
    return (
        <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-lime/30 transition-all cursor-pointer overflow-hidden relative"
            onClick={() => onUse(template)}
        >
            <div className="flex items-start justify-between mb-3 relative z-10">
                <div>
                    <h4 className="font-bold text-white text-sm group-hover:text-lime transition-colors">{template.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-semibold">{template.target}</span>
                        <span className="text-[10px] text-gray-500">{template.exercises.length} exercises</span>
                    </div>
                </div>
                <div className="p-2 rounded-lg bg-lime/10 text-lime group-hover:bg-lime group-hover:text-oled transition-all">
                    <Plus size={16} />
                </div>
            </div>

            <div className="space-y-1 relative z-10">
                {template.exercises.slice(0, 2).map((ex, i) => (
                    <p key={i} className="text-[10px] text-gray-500 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-gray-700" /> {ex.name}
                    </p>
                ))}
                {template.exercises.length > 2 && (
                    <p className="text-[10px] text-gray-600 pl-3">+{template.exercises.length - 2} more...</p>
                )}
            </div>
            
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity translate-x-4 -translate-y-4">
                <Plus size={80} className="text-lime" />
            </div>
        </motion.div>
    );
};

export default StarterTemplateCard;
