import { useState, useEffect } from 'react';
import { WorkoutPlan, WorkoutExercise, WorkoutLog } from '../types/database';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGyms } from '../context/GymContext';
import { verifyGymPresence } from '../lib/location';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { safeStorage } from '../lib/safeStorage';
import { getModalityForExercise } from '../lib/exercises';
import PRCelebration from './PRCelebration';
import CombatPhysioModal from './CombatPhysioModal';

// Modular Components
import ActiveWorkoutHeader, { DifficultyDial } from './workouts/ActiveWorkoutHeader';
import ActiveWorkoutExerciseList from './workouts/ActiveWorkoutExerciseList';
import ActiveWorkoutSummary from './workouts/ActiveWorkoutSummary';
import GeofenceToggle from './workouts/GeofenceToggle';
import ExerciseSwapModal from './workouts/ExerciseSwapModal';
import PlateCalculatorModal from './workouts/PlateCalculatorModal';
import RestTimerOverlay from './workouts/RestTimerOverlay';

interface ActiveWorkoutProps {
    plan: WorkoutPlan;
    userId: string;
    onComplete: (log: WorkoutLog) => void;
    onCancel: () => void;
}

export default function ActiveWorkout({ plan, userId, onComplete, onCancel }: ActiveWorkoutProps) {
    // Preserve base weights for dynamic difficulty scaling
    const [baseExercises] = useState<WorkoutExercise[]>(
        plan.exercises.map(e => ({ ...e, completed: false }))
    );
    const [exercises, setExercises] = useState<WorkoutExercise[]>(
        plan.exercises.map(e => ({ ...e, completed: false }))
    );
    const [difficulty, setDifficulty] = useState<DifficultyDial>('target');
    const [currentIdx, setCurrentIdx] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [startTime] = useState(new Date().toISOString());
    const [finished, setFinished] = useState(false);
    const [lastCompletedLog, setLastCompletedLog] = useState<WorkoutLog | null>(null);
    const { user, updateUser } = useAuth();
    const { findGym, getActiveWar } = useGyms();
    const [activePR, setActivePR] = useState<{ exercise: string; newWeight: number; oldWeight: number } | null>(null);
    const [prs, setPrs] = useState<{ exercise: string; newWeight: number }[]>([]);
    const [verifyLocation, setVerifyLocation] = useState(true);
    const [swapModalExercise, setSwapModalExercise] = useState<WorkoutExercise | null>(null);
    const [showPlateCalculator, setShowPlateCalculator] = useState(false);
    const [plateCalcWeight, setPlateCalcWeight] = useState(100);
    const [showRestTimer, setShowRestTimer] = useState(false);
    const [restDuration, setRestDuration] = useState(90);
    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
    const [showPhysioModal, setShowPhysioModal] = useState(false);

    const handlePhysioSwap = (oldExName: string, newExName: string) => {
        setExercises(prev => prev.map(ex => {
            const match = ex.name.toLowerCase().includes(oldExName.toLowerCase()) || oldExName.toLowerCase().includes(ex.name.toLowerCase());
            if (match) {
                return {
                    ...ex,
                    name: newExName,
                    modality: getModalityForExercise(newExName),
                    notes: `⚡ Physio Prescribed: Joint-Safe Swap for ${oldExName}`
                };
            }
            return ex;
        }));
        setShowPhysioModal(false);
    };

    const handleConfirmDiscard = () => {
        safeStorage.removeItem(`active_workout_${plan.id}`);
        setShowDiscardConfirm(false);
        onCancel();
    };

    // Keep screen awake during workouts (prevent phone screen sleep in gym)
    useEffect(() => {
        let wakeLock: any = null;
        const acquireWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    wakeLock = await (navigator as any).wakeLock.request('screen');
                }
            } catch (_) {}
        };
        acquireWakeLock();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                acquireWakeLock();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (wakeLock) {
                wakeLock.release().catch(() => {});
            }
        };
    }, []);

    // Persistence: Hydrate from localStorage on mount
    useEffect(() => {
        const saved = safeStorage.getItem(`active_workout_${plan.id}`);
        if (saved) {
            try {
                const { exercises: savedEx, elapsed: savedElapsed, currentIdx: savedIdx, difficulty: savedDiff } = JSON.parse(saved);
                if (savedEx) setExercises(savedEx);
                if (savedElapsed) setElapsed(savedElapsed);
                if (savedIdx !== undefined) setCurrentIdx(savedIdx);
                if (savedDiff) setDifficulty(savedDiff);
            } catch (e) {
                console.error('Failed to hydrate workout:', e);
            }
        }
    }, [plan.id]);

    // Fetch previous exercise performance history from workout_logs
    useEffect(() => {
        const fetchHistory = async () => {
            if (!userId) return;
            try {
                const { data } = await supabase
                    .from('workout_logs')
                    .select('exercises, created_at')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(20);

                const historyMap: Record<string, { weight: number; reps: number; rpe?: number }> = {};
                if (data && data.length > 0) {
                    for (const log of data) {
                        for (const ex of (log.exercises || [])) {
                            const normName = ex.name?.toLowerCase().trim();
                            if (normName && !historyMap[normName]) {
                                let w = ex.weight || 0;
                                let r = ex.reps || 0;
                                let rpe = undefined;
                                if (Array.isArray(ex.setDetails) && ex.setDetails.length > 0) {
                                    const bestSet = ex.setDetails.find((s: any) => s.completed !== false) || ex.setDetails[0];
                                    if (bestSet) {
                                        w = bestSet.weight || w;
                                        r = bestSet.reps || r;
                                        rpe = bestSet.rpe;
                                    }
                                }
                                historyMap[normName] = { weight: w, reps: r, rpe };
                            }
                        }
                    }
                }

                // Attach previous performance & modality
                setExercises(prev => prev.map(e => {
                    const hist = historyMap[e.name.toLowerCase().trim()];
                    const modality = e.modality || getModalityForExercise(e.name);
                    return {
                        ...e,
                        modality,
                        previousPerformance: hist || e.previousPerformance
                    };
                }));
            } catch (err) {
                console.warn('Failed to fetch previous workout history:', err);
            }
        };

        fetchHistory();
    }, [userId]);

    // Handle Difficulty Dial Changes
    const handleDifficultyChange = (newDiff: DifficultyDial) => {
        setDifficulty(newDiff);
        const mult = newDiff === 'deload' ? 0.90 : newDiff === 'beast' ? 1.05 : 1.00;
        setExercises(prev => prev.map((ex, i) => {
            const baseW = baseExercises[i]?.weight || ex.weight || 0;
            if (!baseW) return ex;
            const scaled = Math.max(2.5, Math.round((baseW * mult) / 2.5) * 2.5);
            return { ...ex, weight: scaled };
        }));
    };

    // Persistence: Save to localStorage on change
    useEffect(() => {
        if (finished) {
            safeStorage.removeItem(`active_workout_${plan.id}`);
            return;
        }
        const state = { exercises, elapsed, currentIdx, difficulty };
        safeStorage.setItem(`active_workout_${plan.id}`, JSON.stringify(state));
    }, [exercises, elapsed, currentIdx, difficulty, finished, plan.id]);

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

        setExercises(prev => prev.map(e => {
            if (e.id === id) {
                const updatedSets = e.setDetails ? e.setDetails.map(s => ({ ...s, completed: isMarkingComplete })) : undefined;
                return { ...e, completed: isMarkingComplete, setDetails: updatedSets };
            }
            return e;
        }));

        // PR Detection
        if (isMarkingComplete && user?.big4) {
            const name = exercise.name.toLowerCase();
            let prKey: 'bench' | 'squat' | 'deadlift' | 'ohp' | null = null;

            if (name.includes('bench')) prKey = 'bench';
            else if (name.includes('squat')) prKey = 'squat';
            else if (name.includes('deadlift')) prKey = 'deadlift';
            else if (name.includes('overhead press') || name.includes('ohp')) prKey = 'ohp';

            if (prKey) {
                let maxWeight = exercise.weight || 0;
                if (exercise.setDetails && exercise.setDetails.length > 0) {
                    exercise.setDetails.forEach(s => {
                        if ((s.weight || 0) > maxWeight) maxWeight = s.weight || 0;
                    });
                }

                if (maxWeight > (user.big4[prKey] || 0)) {
                    const oldWeight = user.big4[prKey] || 0;
                    const newWeight = maxWeight;

                    setActivePR({ exercise: exercise.name, newWeight, oldWeight });
                    setPrs(prev => [...prev.filter(p => p.exercise !== exercise.name), { exercise: exercise.name, newWeight }]);

                    updateUser({
                        big4: { ...user.big4, [prKey]: newWeight },
                        xp: (user.xp || 0) + 500
                    });
                }
            }
        }
    };

    const handleSelectSwap = (newEx: { name: string; notes?: string }) => {
        if (!swapModalExercise) return;
        setExercises(prev => prev.map(e =>
            e.id === swapModalExercise.id ? { ...e, name: newEx.name, notes: newEx.notes } : e
        ));
        setSwapModalExercise(null);
    };

    const handleUpdateExercise = (updated: WorkoutExercise) => {
        setExercises(prev => prev.map(e => e.id === updated.id ? updated : e));
    };

    const completeAll = exercises.some(e => e.completed);
    const completedCount = exercises.filter(e => e.completed).length;

    const handleFinish = async () => {
        const log: WorkoutLog = {
            id: `wl-${Date.now()}`,
            plan_id: plan.id,
            user_id: userId,
            exercises,
            started_at: startTime,
            completed_at: new Date().toISOString(),
            duration_min: Math.max(1, Math.round(elapsed / 60))
        };

        setLastCompletedLog(log);
        setFinished(true);

        const totalVolume = exercises.reduce((acc, ex) => {
            if (ex.setDetails && ex.setDetails.length > 0) {
                return acc + ex.setDetails.reduce((sAcc, s) => sAcc + ((s.completed || ex.completed) ? (s.reps * (s.weight || 0)) : 0), 0);
            }
            return acc + (ex.completed ? (ex.sets * ex.reps * (ex.weight || 0)) : 0);
        }, 0);

        // Check for new Big 4 PRs across all completed exercises and sets
        let updatedBig4 = { ...(user?.big4 || { bench: 0, squat: 0, deadlift: 0, ohp: 0 }) };
        const detectedPRs: { exercise: string; newWeight: number }[] = [...prs];
        let bonusPRXP = 0;

        exercises.forEach(ex => {
            const name = ex.name.toLowerCase();
            let prKey: 'bench' | 'squat' | 'deadlift' | 'ohp' | null = null;
            if (name.includes('bench')) prKey = 'bench';
            else if (name.includes('squat')) prKey = 'squat';
            else if (name.includes('deadlift')) prKey = 'deadlift';
            else if (name.includes('overhead press') || name.includes('ohp') || name.includes('military')) prKey = 'ohp';

            if (prKey) {
                let maxLift = 0;
                if (ex.setDetails && ex.setDetails.length > 0) {
                    ex.setDetails.forEach(s => {
                        if ((s.completed || ex.completed) && (s.weight || 0) > maxLift) {
                            maxLift = s.weight || 0;
                        }
                    });
                } else if (ex.completed && ex.weight) {
                    maxLift = ex.weight;
                }

                if (maxLift > (updatedBig4[prKey] || 0)) {
                    updatedBig4[prKey] = maxLift;
                    bonusPRXP += 250;
                    if (!detectedPRs.some(p => p.exercise === ex.name)) {
                        detectedPRs.push({ exercise: ex.name, newWeight: maxLift });
                    }
                }
            }
        });

        if (detectedPRs.length > prs.length) {
            setPrs(detectedPRs);
        }

        // Base XP (+100 XP) + PR bonus
        let xpGained = 100 + bonusPRXP;
        let isVerifiedLocation = false;

        if (user) {
            if (user.home_gym && verifyLocation) {
                const gym = findGym(user.home_gym);
                if (gym) {
                    isVerifiedLocation = await verifyGymPresence(gym.lat, gym.lng);
                    if (isVerifiedLocation) {
                        xpGained += 150;
                    }
                }
            }

            const currentStreak = user.reliability_streak || 0;
            updateUser({
                xp: (user.xp || 0) + xpGained,
                reliability_streak: currentStreak + 1,
                big4: updatedBig4
            });
        }

        if (isSupabaseConfigured && user) {
            try {
                await supabase.from('workout_logs').insert({
                    user_id: user.id,
                    plan_id: plan.id,
                    exercises: exercises,
                    started_at: startTime,
                    completed_at: new Date().toISOString(),
                    duration_min: Math.max(1, Math.round(elapsed / 60)),
                    gym_id: user.home_gym || null
                });

                if (user.home_gym) {
                    const activeWar = await getActiveWar(user.home_gym);

                    await supabase.from('activity_logs').insert({
                        user_id: user.id,
                        gym_id: user.home_gym,
                        type: 'workout',
                        value: totalVolume,
                        metadata: {
                            plan_name: plan.name,
                            is_war_contribution: !!activeWar && isVerifiedLocation,
                            war_id: activeWar?.id,
                            geofenced: isVerifiedLocation
                        }
                    });
                }
            } catch (err) {
                console.warn('Failed to sync workout to cloud:', err);
            }
        }
    };

    const handlePostToFeed = async (postData: { content: string; mediaUrl?: string; totalVolume: number }) => {
        if (isSupabaseConfigured && user) {
            try {
                await supabase.from('posts').insert({
                    author_id: user.id,
                    gym_id: user.home_gym || null,
                    content: postData.content,
                    media_url: postData.mediaUrl,
                    is_auto_generated: true,
                    spots_count: 0
                });
            } catch (err) {
                console.warn('Cloud post failed, saving locally:', err);
            }
        }

        // Cache into local feed so it shows immediately on the social hub
        const localPost = {
            id: `post-${Date.now()}`,
            author_id: user?.id || 'user-local',
            gym_id: user?.home_gym || null,
            content: postData.content,
            media_url: postData.mediaUrl,
            media_type: 'image',
            created_at: new Date().toISOString(),
            spots_count: 1,
            is_auto_generated: true,
            profiles: {
                name: user?.name || 'Iron Lifter',
                profile_image_url: user?.profile_image_url || 'https://i.pravatar.cc/100',
                verification_status: 'verified',
                is_founding_trainer: false,
                big4: user?.big4
            }
        };

        try {
            const cached = safeStorage.getItem('ironmatch_feed_cache');
            const existing = cached ? JSON.parse(cached) : [];
            safeStorage.setItem('ironmatch_feed_cache', JSON.stringify([localPost, ...existing]));
        } catch (e) {
            console.warn('Feed caching issue:', e);
        }
    };

    if (finished) {
        return (
            <ActiveWorkoutSummary
                planName={plan.name}
                exercises={exercises}
                elapsed={elapsed}
                prs={prs}
                onDone={() => onComplete(lastCompletedLog || {
                    id: `wl-${Date.now()}`,
                    plan_id: plan.id,
                    user_id: userId,
                    exercises,
                    started_at: startTime,
                    completed_at: new Date().toISOString(),
                    duration_min: Math.max(1, Math.round(elapsed / 60))
                })}
                onPostToFeed={handlePostToFeed}
            />
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-oled pb-24">
            <ActiveWorkoutHeader
                planName={plan.name}
                elapsed={elapsed}
                formatTime={formatTime}
                completedCount={completedCount}
                totalCount={exercises.length}
                onCancel={() => setShowDiscardConfirm(true)}
                onFinish={handleFinish}
                canFinish={completeAll}
                difficulty={difficulty}
                onDifficultyChange={handleDifficultyChange}
                onOpenPhysio={() => setShowPhysioModal(true)}
            />

            <ActiveWorkoutExerciseList
                exercises={exercises}
                currentIdx={currentIdx}
                setCurrentIdx={setCurrentIdx}
                toggleComplete={toggleComplete}
                onUpdateExercise={handleUpdateExercise}
                onOpenSwap={setSwapModalExercise}
                onOpenPlateCalc={(weight) => {
                    setPlateCalcWeight(weight);
                    setShowPlateCalculator(true);
                }}
                onTriggerRest={(secs) => {
                    if (secs) setRestDuration(secs);
                    setShowRestTimer(true);
                }}
                unit={(user?.unit_preference as any) || 'kg'}
            />

            <div className="px-4">
                <GeofenceToggle
                    verifyLocation={verifyLocation}
                    setVerifyLocation={setVerifyLocation}
                />
            </div>

            <RestTimerOverlay
                durationSeconds={restDuration}
                isOpen={showRestTimer}
                onClose={() => setShowRestTimer(false)}
            />

            <PlateCalculatorModal
                isOpen={showPlateCalculator}
                onClose={() => setShowPlateCalculator(false)}
                initialWeight={plateCalcWeight}
                unit={(user?.unit_preference as any) || 'kg'}
            />

            <AnimatePresence>
                {activePR && (
                    <PRCelebration
                        exercise={activePR.exercise}
                        newWeight={activePR.newWeight}
                        oldWeight={activePR.oldWeight}
                        unit={user?.unit_preference || 'kg'}
                        onClose={() => setActivePR(null)}
                    />
                )}
                {swapModalExercise && (
                    <ExerciseSwapModal
                        exercise={swapModalExercise}
                        onSelectSwap={handleSelectSwap}
                        onClose={() => setSwapModalExercise(null)}
                    />
                )}
                <CombatPhysioModal
                    isOpen={showPhysioModal}
                    onClose={() => setShowPhysioModal(false)}
                    onApplySwap={handlePhysioSwap}
                />
                {showDiscardConfirm && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDiscardConfirm(false)}
                            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            className="relative w-full max-w-sm bg-oled border border-red-500/30 rounded-3xl p-6 z-10 shadow-[0_0_40px_rgba(239,68,68,0.2)] text-center space-y-4"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                                <X size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase text-white tracking-wide">
                                    Discard Workout?
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    All sets logged in this session will be discarded. This cannot be undone.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowDiscardConfirm(false)}
                                    className="py-3 px-4 rounded-xl bg-gray-900 border border-gray-800 text-xs font-black uppercase text-gray-300 hover:text-white transition active:scale-95"
                                >
                                    Keep Lifting
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDiscard}
                                    className="py-3 px-4 rounded-xl bg-red-600 text-xs font-black uppercase text-white hover:bg-red-500 transition active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                >
                                    Discard
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
