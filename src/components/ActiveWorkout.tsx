import { useState, useEffect } from 'react';
import { WorkoutPlan, WorkoutExercise, WorkoutLog } from '../types/database';
import { X, Check, Timer, Trophy, Dumbbell, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import PRCelebration from './PRCelebration';

interface ActiveWorkoutProps {
    plan: WorkoutPlan;
    userId: string;
    onComplete: (log: WorkoutLog) => void;
    onCancel: () => void;
}

export default function ActiveWorkout({ plan, userId, onComplete, onCancel }: ActiveWorkoutProps) {
    const [exercises, setExercises] = useState<WorkoutExercise[]>(
        plan.exercises.map(e => ({ ...e, completed: false }))
    );
    const [currentIdx, setCurrentIdx] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [startTime] = useState(new Date().toISOString());
    const [finished, setFinished] = useState(false);
    const [shared, setShared] = useState(false);
    const { user, updateUser } = useAuth();
    const [activePR, setActivePR] = useState<{ exercise: string; newWeight: number; oldWeight: number } | null>(null);

    // Timer
    useEffect(() => {
        if (finished) return;
        const interval = setInterval(() => setElapsed(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, [finished]);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const toggleComplete = (id: string) => {
        const exercise = exercises.find(e => e.id === id);
        if (!exercise) return;

        const isMarkingComplete = !exercise.completed;

        setExercises(prev => prev.map(e =>
            e.id === id ? { ...e, completed: isMarkingComplete } : e
        ));

        // PR Detection
        if (isMarkingComplete && exercise.weight && user?.big4) {
            const name = exercise.name.toLowerCase();
            let prKey: 'bench' | 'squat' | 'deadlift' | 'ohp' | null = null;

            if (name.includes('bench')) prKey = 'bench';
            else if (name.includes('squat')) prKey = 'squat';
            else if (name.includes('deadlift')) prKey = 'deadlift';
            else if (name.includes('overhead press') || name.includes('ohp')) prKey = 'ohp';

            if (prKey && exercise.weight > (user.big4[prKey] || 0)) {
                const oldWeight = user.big4[prKey] || 0;
                const newWeight = exercise.weight;

                setActivePR({
                    exercise: exercise.name,
                    newWeight,
                    oldWeight
                });

                // Update user PR and XP
                updateUser({
                    big4: { ...user.big4, [prKey]: newWeight },
                    xp: (user.xp || 0) + 500 // PR Reward
                });
            }
        }
    };

    const completeAll = exercises.every(e => e.completed);
    const completedCount = exercises.filter(e => e.completed).length;

    const handleFinish = () => {
        setFinished(true);
        const log: WorkoutLog = {
            id: `wl-${Date.now()}`,
            plan_id: plan.id,
            user_id: userId,
            exercises,
            started_at: startTime,
            completed_at: new Date().toISOString(),
            duration_min: Math.round(elapsed / 60)
        };
        setTimeout(() => onComplete(log), 2500);
    };

    if (finished) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-oled px-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                >
                    <Trophy size={80} className="text-lime mb-4" />
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-extrabold text-white mb-2"
                >
                    Workout Complete!
                </motion.h2>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-400 text-center space-y-1"
                >
                    <p>{completedCount}/{exercises.length} exercises done</p>
                    <p>{Math.round(elapsed / 60)} minutes</p>
                    <p className="text-lime font-bold mt-2">{plan.name}</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6"
                >
                    {shared ? (
                        <div className="flex items-center gap-2 text-lime text-sm font-semibold">
                            <Check size={16} /> Posted to Explore feed!
                        </div>
                    ) : (
                        <button
                            onClick={() => setShared(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-bold hover:bg-blue-500/20 active:scale-95 transition-all"
                        >
                            <Share2 size={16} /> Share to Feed
                        </button>
                    )}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-oled pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-oled/90 backdrop-blur-sm border-b border-gray-800 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                    <button onClick={onCancel} className="p-1.5 text-gray-500 hover:text-white rounded-lg transition">
                        <X size={22} />
                    </button>
                    <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5">
                        <Timer size={14} className="text-lime" />
                        <span className="font-mono text-sm font-bold text-white">{formatTime(elapsed)}</span>
                    </div>
                    <button
                        onClick={handleFinish}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${completeAll
                            ? 'bg-lime text-oled hover:bg-lime/90'
                            : 'bg-gray-800 text-gray-400 hover:text-white'
                            }`}
                    >
                        Finish
                    </button>
                </div>
                <h3 className="font-bold text-white text-center">{plan.name}</h3>
                <div className="w-full h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
                    <motion.div
                        className="h-full bg-lime rounded-full"
                        animate={{ width: `${(completedCount / exercises.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Exercises */}
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

            {/* PR Celebration Overlay */}
            <AnimatePresence>
                {activePR && (
                    <PRCelebration
                        exercise={activePR.exercise}
                        newWeight={activePR.newWeight}
                        oldWeight={activePR.oldWeight}
                        unit={user?.unit_preference || 'lbs'}
                        onClose={() => setActivePR(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
