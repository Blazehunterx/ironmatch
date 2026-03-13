import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Dumbbell } from 'lucide-react';
import { BodyPart, ALL_BODY_PARTS, EXERCISE_LIBRARY, WorkoutExercise } from '../../types/database';
import { PlanExerciseItem } from './PlanExerciseItem';

interface WorkoutPlanCreatorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, target: BodyPart, exercises: WorkoutExercise[], isPremium?: boolean, priceDisplay?: string) => Promise<void>;
    isTrainer?: boolean;
}

const WorkoutPlanCreator: React.FC<WorkoutPlanCreatorProps> = ({ isOpen, onClose, onSave, isTrainer }) => {
    const [planName, setPlanName] = useState('');
    const [planTarget, setPlanTarget] = useState<BodyPart>('Chest');
    const [planExercises, setPlanExercises] = useState<WorkoutExercise[]>([]);
    const [showExercisePicker, setShowExercisePicker] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [price, setPrice] = useState('9.99');

    const addExercise = (name: string) => {
        setPlanExercises(prev => [...prev, {
            id: `ne-${Date.now()}-${Math.random()}`,
            name,
            sets: 3,
            reps: 10,
        }]);
        setShowExercisePicker(false);
    };

    const updateExercise = (id: string, field: string, value: number) => {
        setPlanExercises(prev => prev.map(e =>
            e.id === id ? { ...e, [field]: value } : e
        ));
    };

    const removeExercise = (id: string) => {
        setPlanExercises(prev => prev.filter(e => e.id !== id));
    };

    const handleSave = async () => {
        if (!planName.trim() || planExercises.length === 0) return;
        await onSave(planName, planTarget, planExercises, isPremium, `$${price}`);
        setPlanName('');
        setPlanExercises([]);
        setIsPremium(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/85 backdrop-blur-md z-50"
                    />
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-oled rounded-t-3xl max-h-[92vh] overflow-y-auto scrollbar-hide"
                    >
                        <div className="px-5 pt-6 pb-32 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">New Workout Plan</h3>
                                <button onClick={onClose} className="p-2 text-gray-500 hover:text-white rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>

                            <input
                                type="text"
                                value={planName}
                                onChange={(e) => setPlanName(e.target.value)}
                                placeholder="Plan name (e.g. Push Day Destroyer)"
                                className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-lime"
                            />

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Target</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {ALL_BODY_PARTS.map(bp => (
                                        <button
                                            key={bp}
                                            onClick={() => setPlanTarget(bp)}
                                            className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${planTarget === bp
                                                ? 'bg-lime/20 border-lime/50 text-lime'
                                                : 'bg-gray-900 border-gray-800 text-gray-400'
                                                }`}
                                        >
                                            {bp}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                                    Exercises ({planExercises.length})
                                </label>
                                <div className="space-y-2">
                                    {planExercises.map((ex, idx) => (
                                        <PlanExerciseItem
                                            key={ex.id}
                                            exercise={ex}
                                            index={idx}
                                            onUpdate={updateExercise}
                                            onRemove={removeExercise}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={() => setShowExercisePicker(true)}
                                    className="w-full mt-2 py-2.5 rounded-xl bg-gray-900 border border-gray-800 border-dashed text-gray-500 text-xs font-medium hover:border-lime/30 hover:text-gray-400 transition-colors flex items-center justify-center gap-1"
                                >
                                    <Plus size={14} /> Add Exercise
                                </button>

                                <AnimatePresence>
                                    {showExercisePicker && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-2 bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800 max-h-48 overflow-y-auto">
                                                {EXERCISE_LIBRARY[planTarget].map(name => (
                                                    <button
                                                        key={name}
                                                        onClick={() => addExercise(name)}
                                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-lime/5 hover:text-lime transition-colors flex items-center justify-between"
                                                    >
                                                        {name}
                                                        <Plus size={14} className="text-gray-600" />
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {isTrainer && (
                                <div className="p-5 bg-gray-900 border-2 border-dashed border-gray-800 rounded-3xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xs font-black text-white italic uppercase">Monetize this Plan</h4>
                                            <p className="text-[10px] text-gray-500 font-medium">List on the Empire Marketplace</p>
                                        </div>
                                        <button 
                                            onClick={() => setIsPremium(!isPremium)}
                                            className={`w-12 h-6 rounded-full transition-all relative ${isPremium ? 'bg-lime' : 'bg-gray-800'}`}
                                        >
                                            <motion.div 
                                                animate={{ x: isPremium ? 24 : 4 }}
                                                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                                            />
                                        </button>
                                    </div>

                                    {isPremium && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-4 pt-2"
                                        >
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest block mb-2">Price ($ USD)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-bold">$</span>
                                                        <input
                                                            type="text"
                                                            value={price}
                                                            onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                                                            className="w-full bg-oled border border-gray-800 text-white rounded-xl py-3 pl-8 pr-4 text-sm focus:outline-none focus:border-lime font-bold"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest block mb-2">Your Share (80%)</label>
                                                    <div className="w-full bg-lime/10 border border-lime/20 text-lime rounded-xl py-3 px-4 text-sm font-black italic">
                                                        ${(parseFloat(price || '0') * 0.8).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-[9px] text-gray-600 font-medium leading-relaxed">
                                                * IronMatch takes a 20% commission to handle hosting, distribution, and Google Play compliance.
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={handleSave}
                                disabled={!planName.trim() || planExercises.length === 0}
                                className="w-full py-4 rounded-xl bg-lime text-oled font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-lime/90 active:scale-[0.98] transition-all disabled:opacity-30 shadow-[0_0_30px_-5px_rgba(50,255,50,0.3)]"
                            >
                                <Dumbbell size={18} /> Save {isPremium ? 'Premium' : ''} Workout Plan
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default WorkoutPlanCreator;
