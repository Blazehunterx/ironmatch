import { useState, useEffect } from 'react';
import { WorkoutPlan, WorkoutExercise, WorkoutLog } from '../types/database';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useGyms } from '../context/GymContext';
import { verifyGymPresence } from '../lib/location';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import PRCelebration from './PRCelebration';

// Modular Components
import ActiveWorkoutHeader from './workouts/ActiveWorkoutHeader';
import ActiveWorkoutExerciseList from './workouts/ActiveWorkoutExerciseList';
import ActiveWorkoutSummary from './workouts/ActiveWorkoutSummary';
import GeofenceToggle from './workouts/GeofenceToggle';

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
    const { findGym, getActiveWar } = useGyms();
    const [activePR, setActivePR] = useState<{ exercise: string; newWeight: number; oldWeight: number } | null>(null);
    const [verifyLocation, setVerifyLocation] = useState(true);

    // Persistence: Hydrate from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(`active_workout_${plan.id}`);
        if (saved) {
            try {
                const { exercises: savedEx, elapsed: savedElapsed, currentIdx: savedIdx } = JSON.parse(saved);
                setExercises(savedEx);
                setElapsed(savedElapsed);
                setCurrentIdx(savedIdx);
            } catch (e) {
                console.error('Failed to hydrate workout:', e);
            }
        }
    }, [plan.id]);

    // Persistence: Save to localStorage on change
    useEffect(() => {
        if (finished) {
            localStorage.removeItem(`active_workout_${plan.id}`);
            return;
        }
        const state = { exercises, elapsed, currentIdx };
        localStorage.setItem(`active_workout_${plan.id}`, JSON.stringify(state));
    }, [exercises, elapsed, currentIdx, finished, plan.id]);

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

                setActivePR({ exercise: exercise.name, newWeight, oldWeight });

                updateUser({
                    big4: { ...user.big4, [prKey]: newWeight },
                    xp: (user.xp || 0) + 500
                });
            }
        }
    };

    const completeAll = exercises.every(e => e.completed);
    const completedCount = exercises.filter(e => e.completed).length;

    const handleFinish = async () => {
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

        if (isSupabaseConfigured && user) {
            await supabase.from('workout_logs').insert({
                user_id: user.id,
                plan_id: plan.id,
                exercises: exercises,
                started_at: startTime,
                completed_at: new Date().toISOString(),
                duration_min: Math.round(elapsed / 60),
                gym_id: user.home_gym || null
            });

            if (user.home_gym) {
                const activeWar = await getActiveWar(user.home_gym);
                const gym = findGym(user.home_gym);

                let isVerifiedLocation = false;
                if (verifyLocation && gym) {
                    isVerifiedLocation = await verifyGymPresence(gym.lat, gym.lng);
                    if (!isVerifiedLocation) {
                        alert('Anti-Cheat Active: You are not within 200m of the gym. Workout logged without verification bonus.');
                    } else {
                        updateUser({ xp: (user.xp || 0) + 150 });
                    }
                }

                const totalVolume = exercises.reduce((acc, ex) =>
                    acc + (ex.completed ? (ex.sets * ex.reps * (ex.weight || 0)) : 0), 0
                );

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
        }

        setTimeout(() => onComplete(log), 2500);
    };

    if (finished) {
        return (
            <ActiveWorkoutSummary 
                planName={plan.name}
                completedCount={completedCount}
                totalCount={exercises.length}
                elapsed={elapsed}
                shared={shared}
                onShare={() => setShared(true)}
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
                onCancel={onCancel}
                onFinish={handleFinish}
                canFinish={completeAll}
            />

            <ActiveWorkoutExerciseList 
                exercises={exercises}
                currentIdx={currentIdx}
                setCurrentIdx={setCurrentIdx}
                toggleComplete={toggleComplete}
            />

            <div className="px-4">
                <GeofenceToggle 
                    verifyLocation={verifyLocation}
                    setVerifyLocation={setVerifyLocation}
                />
            </div>

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
