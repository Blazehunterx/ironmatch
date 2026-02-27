import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Target, Clock, Dumbbell, X } from 'lucide-react';
import { WorkoutPlan, BodyPart } from '../types/database';

interface AIWorkoutGeneratorProps {
    onGenerate: (plan: WorkoutPlan) => void;
    onClose: () => void;
}

export default function AIWorkoutGenerator({ onGenerate, onClose }: AIWorkoutGeneratorProps) {
    const [step, setStep] = useState(1);
    const [goal, setGoal] = useState<'strength' | 'muscle' | 'lifestyle'>('muscle');
    const [experience, setExperience] = useState<'beginner' | 'intermediate'>('beginner');

    const generatePlan = () => {
        const planId = `ai-${Date.now()}`;
        let name = "AI: ";
        let target: BodyPart = "Full Body";
        const exercises: any[] = [];

        if (goal === 'strength') {
            name += "Strength Foundations";
            exercises.push(
                { id: `${planId}-1`, name: "Squat", sets: 3, reps: 5, weight: 45 },
                { id: `${planId}-2`, name: "Bench Press", sets: 3, reps: 5, weight: 45 },
                { id: `${planId}-3`, name: "Deadlift", sets: 1, reps: 5, weight: 95 }
            );
        } else if (goal === 'muscle') {
            name += "Hypertrophy Push";
            target = "Chest";
            exercises.push(
                { id: `${planId}-1`, name: "Bench Press", sets: 3, reps: 10, weight: 45 },
                { id: `${planId}-2`, name: "Incline Dumbbell Press", sets: 3, reps: 12 },
                { id: `${planId}-3`, name: "Cable Fly", sets: 3, reps: 15 },
                { id: `${planId}-4`, name: "Tricep Pushdown", sets: 3, reps: 12 }
            );
        } else {
            name += "Fat Loss / Lifestyle";
            exercises.push(
                { id: `${planId}-1`, name: "Kettlebell Swing", sets: 4, reps: 20 },
                { id: `${planId}-2`, name: "Goblet Squat", sets: 3, reps: 15 },
                { id: `${planId}-3`, name: "Mountain Climbers", sets: 3, reps: 30 },
                { id: `${planId}-4`, name: "Plank", sets: 3, reps: 60 }
            );
        }

        const newPlan: WorkoutPlan = {
            id: planId,
            name,
            author_id: 'ai-coach',
            target,
            exercises,
            shared: false,
            created_at: new Date().toISOString()
        };

        onGenerate(newPlan);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-lime rounded-xl shadow-[0_0_15px_-5px_#bef264]">
                        <Sparkles size={20} className="text-oled" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">AI Coach</h3>
                </div>
                <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        <p className="text-sm text-gray-400 font-medium">What is your primary focus this month?</p>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: 'strength', label: 'Raw Strength', sub: 'Low reps, heavy compound lifts', icon: Target },
                                { id: 'muscle', label: 'Muscle Building', sub: 'Hypertrophy focused volume', icon: Dumbbell },
                                { id: 'lifestyle', label: 'General Fitness', sub: 'High heart rate, fat loss', icon: Clock },
                            ].map((item: any) => (
                                <button
                                    key={item.id}
                                    onClick={() => setGoal(item.id)}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${goal === item.id
                                        ? 'bg-lime/10 border-lime text-white shadow-[inset_0_0_20px_-10px_#bef264]'
                                        : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700'
                                        }`}
                                >
                                    <div className={`p-2.5 rounded-xl ${goal === item.id ? 'bg-lime text-oled' : 'bg-gray-800 text-gray-400'}`}>
                                        <item.icon size={20} />
                                    </div>
                                    <div>
                                        <span className="block font-black uppercase text-xs tracking-wider">{item.label}</span>
                                        <span className="text-[10px] opacity-60 font-medium">{item.sub}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-4 rounded-2xl bg-white text-oled font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 mt-4 hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] transition-all active:scale-[0.98]"
                        >
                            Next <ArrowRight size={14} />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        <p className="text-sm text-gray-400 font-medium">Your current lifting experience?</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setExperience('beginner')}
                                className={`p-4 rounded-2xl border transition-all text-center ${experience === 'beginner'
                                    ? 'bg-lime/10 border-lime text-white shadow-[inset_0_0_20px_-10px_#bef264]'
                                    : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700'
                                    }`}
                            >
                                <span className="block font-black uppercase text-xs tracking-wider">Beginner</span>
                                <span className="text-[10px] opacity-60">0-6 months</span>
                            </button>
                            <button
                                onClick={() => setExperience('intermediate')}
                                className={`p-4 rounded-2xl border transition-all text-center ${experience === 'intermediate'
                                    ? 'bg-lime/10 border-lime text-white shadow-[inset_0_0_20px_-10px_#bef264]'
                                    : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700'
                                    }`}
                            >
                                <span className="block font-black uppercase text-xs tracking-wider">Intermediate</span>
                                <span className="text-[10px] opacity-60">6+ months</span>
                            </button>
                        </div>

                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4">
                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">AI Recommendation</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                {goal === 'strength' ? "We'll focus on linear progression with low rep ranges to build your central nervous system's capacity." :
                                    goal === 'muscle' ? "Volume is king. We'll target the 8-12 rep range for maximum metabolic stress and muscle growth." :
                                        "Efficiency over rest. Short recovery periods will keep your heart rate high while building functional mobility."}
                            </p>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 py-4 rounded-2xl bg-gray-900 text-gray-500 font-black uppercase tracking-widest text-xs border border-gray-800"
                            >
                                Back
                            </button>
                            <button
                                onClick={generatePlan}
                                className="flex-[2] py-4 rounded-2xl bg-lime text-oled font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[0_0_30px_-10px_#bef264] hover:bg-lime/90 transition-all active:scale-[0.98]"
                            >
                                Generate Plan <Sparkles size={14} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
