
import React from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { WorkoutExercise } from '../../types/database';

interface PlanExerciseItemProps {
    exercise: WorkoutExercise;
    index: number;
    onUpdate: (id: string, field: string, value: number) => void;
    onRemove: (id: string) => void;
}

export const PlanExerciseItem: React.FC<PlanExerciseItemProps> = ({ 
    exercise, index, onUpdate, onRemove 
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-3"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="text-[10px] text-lime bg-lime/10 w-5 h-5 rounded flex items-center justify-center font-black">{index + 1}</span>
                    {exercise.name}
                </span>
                <button 
                    onClick={() => onRemove(exercise.id)} 
                    className="text-gray-600 hover:text-red-400 transition"
                >
                    <Trash2 size={14} />
                </button>
            </div>
            <div className="flex gap-3">
                <div className="flex-1">
                    <label className="text-[9px] text-gray-600 uppercase block mb-1">Sets</label>
                    <input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => onUpdate(exercise.id, 'sets', parseInt(e.target.value) || 0)}
                        className="w-full bg-oled border border-gray-700 text-white rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:border-lime"
                    />
                </div>
                <div className="flex-1">
                    <label className="text-[9px] text-gray-600 uppercase block mb-1">Reps</label>
                    <input
                        type="number"
                        value={exercise.reps}
                        onChange={(e) => onUpdate(exercise.id, 'reps', parseInt(e.target.value) || 0)}
                        className="w-full bg-oled border border-gray-700 text-white rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:border-lime"
                    />
                </div>
                <div className="flex-1">
                    <label className="text-[9px] text-gray-600 uppercase block mb-1">Weight</label>
                    <input
                        type="number"
                        value={exercise.weight || ''}
                        onChange={(e) => onUpdate(exercise.id, 'weight', parseInt(e.target.value) || 0)}
                        placeholder="lbs"
                        className="w-full bg-oled border border-gray-700 text-white rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:border-lime"
                    />
                </div>
            </div>
        </motion.div>
    );
};
