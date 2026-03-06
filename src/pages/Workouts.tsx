import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
    WorkoutPlan, WorkoutExercise, WorkoutLog, BodyPart,
    ALL_BODY_PARTS, EXERCISE_LIBRARY
} from '../types/database';
import {
    Plus, Play, Share2, Trash2, Dumbbell,
    Clock, CheckCircle2, X, Users, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ActiveWorkout from '../components/ActiveWorkout';
import AIWorkoutGenerator from '../components/AIWorkoutGenerator';
import GroupWorkoutModal from '../components/GroupWorkoutModal';
import { Sparkles } from 'lucide-react';
import LevelUpOverlay from '../components/LevelUpOverlay';
import JoinSessionModal from '../components/JoinSessionModal';
import LiveGroupSession from '../components/LiveGroupSession';
import { GroupSession } from '../types/database';

type Tab = 'plans' | 'community' | 'marketplace' | 'templates' | 'history';

export default function Workouts() {
    const { user } = useAuth();
    const [tab, setTab] = useState<Tab>('plans');
    const [showCreator, setShowCreator] = useState(false);
    const [activeWorkout, setActiveWorkout] = useState<WorkoutPlan | null>(null);
    const [showAI, setShowAI] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [activeGroupSession, setActiveGroupSession] = useState<GroupSession | null>(null);

    // Plan creator state
    const [planName, setPlanName] = useState('');
    const [planTarget, setPlanTarget] = useState<BodyPart>('Chest');
    const [planExercises, setPlanExercises] = useState<WorkoutExercise[]>([]);
    const [showExercisePicker, setShowExercisePicker] = useState(false);

    // Plans & logs stored in state (mock persistence)
    const [plans, setPlans] = useState<WorkoutPlan[]>([]);
    const [communityPlans, setCommunityPlans] = useState<WorkoutPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ═══ STARTER TEMPLATES ═══
    const starterTemplates: WorkoutPlan[] = [
        {
            id: 'st1', name: 'Push Day (Chest/Shoulders/Tri)', author_id: 'system', target: 'Chest', exercises: [
                { id: 'st1e1', name: 'Bench Press', sets: 4, reps: 8 },
                { id: 'st1e2', name: 'Overhead Press', sets: 3, reps: 10 },
                { id: 'st1e3', name: 'Incline Dumbbell Press', sets: 3, reps: 10 },
                { id: 'st1e4', name: 'Lateral Raise', sets: 3, reps: 15 },
                { id: 'st1e5', name: 'Tricep Pushdown', sets: 3, reps: 12 },
            ], shared: false, created_at: ''
        },
        {
            id: 'st2', name: 'Pull Day (Back/Biceps)', author_id: 'system', target: 'Back', exercises: [
                { id: 'st2e1', name: 'Deadlift', sets: 3, reps: 5 },
                { id: 'st2e2', name: 'Pull-ups', sets: 4, reps: 8 },
                { id: 'st2e3', name: 'Barbell Row', sets: 3, reps: 10 },
                { id: 'st2e4', name: 'Face Pull', sets: 3, reps: 15 },
                { id: 'st2e5', name: 'Barbell Curl', sets: 3, reps: 12 },
            ], shared: false, created_at: ''
        },
        {
            id: 'st3', name: 'Leg Day', author_id: 'system', target: 'Legs', exercises: [
                { id: 'st3e1', name: 'Squat', sets: 4, reps: 8 },
                { id: 'st3e2', name: 'Romanian Deadlift', sets: 3, reps: 10 },
                { id: 'st3e3', name: 'Leg Press', sets: 3, reps: 12 },
                { id: 'st3e4', name: 'Leg Curl', sets: 3, reps: 12 },
                { id: 'st3e5', name: 'Calf Raise', sets: 4, reps: 15 },
            ], shared: false, created_at: ''
        },
        {
            id: 'st4', name: 'Full Body Beginner', author_id: 'system', target: 'Full Body', exercises: [
                { id: 'st4e1', name: 'Squat', sets: 3, reps: 8 },
                { id: 'st4e2', name: 'Bench Press', sets: 3, reps: 8 },
                { id: 'st4e3', name: 'Barbell Row', sets: 3, reps: 10 },
                { id: 'st4e4', name: 'Overhead Press', sets: 3, reps: 10 },
                { id: 'st4e5', name: 'Plank', sets: 3, reps: 60 },
            ], shared: false, created_at: ''
        },
        {
            id: 'st5', name: 'Upper Body', author_id: 'system', target: 'Chest', exercises: [
                { id: 'st5e1', name: 'Bench Press', sets: 4, reps: 8 },
                { id: 'st5e2', name: 'Pull-ups', sets: 3, reps: 8 },
                { id: 'st5e3', name: 'Overhead Press', sets: 3, reps: 10 },
                { id: 'st5e4', name: 'Cable Row', sets: 3, reps: 12 },
                { id: 'st5e5', name: 'Dips', sets: 3, reps: 12 },
            ], shared: false, created_at: ''
        },
        {
            id: 'st6', name: 'CrossFit Benchmark: Murph', author_id: 'system', target: 'Full Body', exercises: [
                { id: 'st6e1', name: 'Pull-ups', sets: 1, reps: 100 },
                { id: 'st6e2', name: 'Push-ups', sets: 1, reps: 200 },
                { id: 'st6e3', name: 'Squat', sets: 1, reps: 300 },
            ], shared: false, created_at: ''
        },
    ];

    const marketplacePrograms = [
        {
            id: 'mp1',
            name: 'Elite Hypertrophy',
            trainer: 'Marcus Steele',
            duration: '12 Weeks',
            price: '$49.99',
            intensity: 'Expert',
            description: 'Scientific approach to maximum muscle growth using Periodization.',
            reviews: 4.9,
            students: 1240,
            image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60'
        },
        {
            id: 'mp2',
            name: 'Functional Strength',
            trainer: 'Sarah Power',
            duration: '8 Weeks',
            price: '$29.99',
            intensity: 'Advanced',
            description: 'Hybrid training focusing on explosive power and athletic mobility.',
            reviews: 4.8,
            students: 850,
            image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60'
        },
        {
            id: 'mp3',
            name: 'Bodyweight Mastery',
            trainer: 'Alex Chen',
            duration: '6 Weeks',
            price: '$19.99',
            intensity: 'Intermediate',
            description: 'Master your own weight with progressive calisthenics skills.',
            reviews: 4.7,
            students: 2100,
            image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&auto=format&fit=crop&q=60'
        }
    ];

    const [logs, setLogs] = useState<WorkoutLog[]>([]);

    const fetchPlans = async () => {
        if (!user) return;
        setIsLoading(true);
        const { data } = await supabase
            .from('workout_plans')
            .select('*')
            .eq('author_id', user.id);

        if (data) setPlans(data);

        // Fetch shared plans from other verified trainers
        const { data: cData } = await supabase
            .from('workout_plans')
            .select('*, profiles(name, profile_image_url)')
            .eq('shared', true)
            .neq('author_id', user.id);

        if (cData) setCommunityPlans(cData);
        setIsLoading(false);
    };

    const fetchLogs = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('workout_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (data) setLogs(data);
    };

    useEffect(() => {
        fetchPlans();
        fetchLogs();
    }, [user]);

    const useTemplate = async (template: WorkoutPlan) => {
        if (!user) return;
        const { data } = await supabase
            .from('workout_plans')
            .insert({
                author_id: user.id,
                name: template.name,
                target: template.target,
                exercises: template.exercises,
                shared: false
            })
            .select()
            .single();

        if (data) {
            setPlans(prev => [data, ...prev]);
            setTab('plans');
        }
    };

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

    const savePlan = async () => {
        if (!planName.trim() || planExercises.length === 0 || !user) return;

        const { data } = await supabase
            .from('workout_plans')
            .insert({
                author_id: user.id,
                name: planName,
                target: planTarget,
                exercises: planExercises,
                shared: false
            })
            .select()
            .single();

        if (data) {
            setPlans(prev => [data, ...prev]);
            setPlanName('');
            setPlanExercises([]);
            setShowCreator(false);
        }
    };

    const deletePlan = async (id: string) => {
        const { error } = await supabase
            .from('workout_plans')
            .delete()
            .eq('id', id);
        if (!error) setPlans(prev => prev.filter(p => p.id !== id));
    };

    const toggleShare = async (id: string) => {
        const plan = plans.find(p => p.id === id);
        if (!plan) return;

        const { error } = await supabase
            .from('workout_plans')
            .update({ shared: !plan.shared })
            .eq('id', id);

        if (!error) {
            setPlans(prev => prev.map(p =>
                p.id === id ? { ...p, shared: !p.shared } : p
            ));
        }
    };

    const handleCompleteWorkout = async (log: WorkoutLog) => {
        const { data } = await supabase
            .from('workout_logs')
            .insert({
                user_id: user?.id,
                plan_id: log.plan_id,
                exercises: log.exercises,
                started_at: log.started_at,
                completed_at: log.completed_at,
                duration_min: log.duration_min,
                gym_id: user?.home_gym
            })
            .select()
            .single();

        if (data) {
            setLogs(prev => [data, ...prev]);
            setActiveWorkout(null);
            setShowLevelUp(true);
        }
    };

    // If in active workout, show the tracker
    if (activeWorkout) {
        return (
            <ActiveWorkout
                plan={activeWorkout}
                userId={user?.id || ''}
                onComplete={handleCompleteWorkout}
                onCancel={() => setActiveWorkout(null)}
            />
        );
    }

    // If in live group session
    if (activeGroupSession) {
        const sessionPlan = plans.find(p => p.id === activeGroupSession.workout_plan_id) || starterTemplates[0];
        return (
            <LiveGroupSession
                session={activeGroupSession}
                plan={sessionPlan}
                userId={user?.id || ''}
                onClose={() => setActiveGroupSession(null)}
            />
        );
    }

    return (
        <div className="flex flex-col min-h-screen pb-24">
            {/* Header */}
            <div className="px-4 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-bold text-white">Workouts</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-lime hover:bg-gray-800 active:scale-95 transition-all"
                        >
                            <Users size={20} />
                        </button>
                        <button
                            onClick={() => setShowCreator(true)}
                            className="p-2.5 rounded-xl bg-lime text-oled hover:bg-lime/90 active:scale-95 transition-all"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* AI Generator Banner */}
                {plans.length < 3 && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setShowAI(true)}
                        className="w-full mb-6 group p-5 rounded-3xl bg-gradient-to-br from-lime/20 via-lime/5 to-oled border border-lime/20 flex items-center gap-5 text-left relative overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)] active:scale-[0.98] transition-all"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                            <Sparkles size={120} className="text-lime" />
                        </div>
                        <div className="p-4 bg-lime rounded-2xl text-oled shadow-2xl group-hover:rotate-6 transition-transform relative z-10">
                            <Sparkles size={28} />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black text-lime uppercase tracking-[0.2em] leading-none mb-1.5">Coach Antigravity</h4>
                            <p className="text-lg font-black text-white leading-tight">AI Workout Builder</p>
                            <p className="text-[11px] text-gray-500 font-medium mt-1 flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-lime animate-pulse" /> Custom plans for beginners
                            </p>
                        </div>
                    </motion.button>
                )}

                {/* Trainer Group Workout Banner */}
                {user?.is_trainer && user?.verification_status === 'verified' && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setShowGroupModal(true)}
                        className="w-full mb-6 group p-5 rounded-3xl bg-gradient-to-br from-purple-500/20 via-purple-500/5 to-oled border border-purple-500/20 flex items-center gap-5 text-left relative overflow-hidden shadow-xl active:scale-[0.98] transition-all"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                            <Users size={120} className="text-purple-500" />
                        </div>
                        <div className="p-4 bg-purple-600 rounded-2xl text-white shadow-2xl group-hover:rotate-6 transition-transform relative z-10">
                            <Users size={28} />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] leading-none mb-1.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> Live Now
                            </h4>
                            <p className="text-lg font-black text-white leading-tight">Host Group Workout</p>
                            <p className="text-[11px] text-gray-500 font-medium mt-1">Lounge a live session for your clients</p>
                        </div>
                    </motion.button>
                )}

                {/* Tabs */}
                <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-800">
                    {(['plans', 'community', 'templates', 'history'] as Tab[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${tab === t
                                ? 'bg-lime text-oled'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {t === 'plans' ? '📋 Plans' : t === 'community' ? '🤝 Discovery' : t === 'templates' ? '⭐ Starter' : '📊 History'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Plan Creator Modal */}
            <AnimatePresence>
                {showCreator && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowCreator(false)}
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
                                    <button onClick={() => setShowCreator(false)} className="p-2 text-gray-500 hover:text-white rounded-lg">
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Plan Name */}
                                <input
                                    type="text"
                                    value={planName}
                                    onChange={(e) => setPlanName(e.target.value)}
                                    placeholder="Plan name (e.g. Push Day Destroyer)"
                                    className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-lime"
                                />

                                {/* Target Body Part */}
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

                                {/* Exercises */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                                        Exercises ({planExercises.length})
                                    </label>
                                    <div className="space-y-2">
                                        {planExercises.map((ex, idx) => (
                                            <motion.div
                                                key={ex.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="bg-gray-900 border border-gray-800 rounded-xl p-3"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-semibold text-white flex items-center gap-2">
                                                        <span className="text-[10px] text-lime bg-lime/10 w-5 h-5 rounded flex items-center justify-center font-black">{idx + 1}</span>
                                                        {ex.name}
                                                    </span>
                                                    <button onClick={() => removeExercise(ex.id)} className="text-gray-600 hover:text-red-400 transition">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="flex-1">
                                                        <label className="text-[9px] text-gray-600 uppercase block mb-1">Sets</label>
                                                        <input
                                                            type="number"
                                                            value={ex.sets}
                                                            onChange={(e) => updateExercise(ex.id, 'sets', parseInt(e.target.value) || 0)}
                                                            className="w-full bg-oled border border-gray-700 text-white rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:border-lime"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-[9px] text-gray-600 uppercase block mb-1">Reps</label>
                                                        <input
                                                            type="number"
                                                            value={ex.reps}
                                                            onChange={(e) => updateExercise(ex.id, 'reps', parseInt(e.target.value) || 0)}
                                                            className="w-full bg-oled border border-gray-700 text-white rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:border-lime"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-[9px] text-gray-600 uppercase block mb-1">Weight</label>
                                                        <input
                                                            type="number"
                                                            value={ex.weight || ''}
                                                            onChange={(e) => updateExercise(ex.id, 'weight', parseInt(e.target.value) || 0)}
                                                            placeholder="lbs"
                                                            className="w-full bg-oled border border-gray-700 text-white rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:border-lime"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Add Exercise */}
                                    <button
                                        onClick={() => setShowExercisePicker(true)}
                                        className="w-full mt-2 py-2.5 rounded-xl bg-gray-900 border border-gray-800 border-dashed text-gray-500 text-xs font-medium hover:border-lime/30 hover:text-gray-400 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <Plus size={14} /> Add Exercise
                                    </button>

                                    {/* Exercise Picker */}
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

                                {/* Save */}
                                <button
                                    onClick={savePlan}
                                    disabled={!planName.trim() || planExercises.length === 0}
                                    className="w-full py-4 rounded-xl bg-lime text-oled font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-lime/90 active:scale-[0.98] transition-all disabled:opacity-30 shadow-[0_0_30px_-5px_rgba(50,255,50,0.3)]"
                                >
                                    <Dumbbell size={18} /> Save Workout Plan
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* AI Generator Modal */}
            <AnimatePresence>
                {showAI && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowAI(false)}
                            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50"
                        />
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-oled rounded-t-3xl border-t border-gray-800 max-h-[92vh] overflow-y-auto scrollbar-hide"
                        >
                            <div className="pb-32">
                                <AIWorkoutGenerator
                                    onGenerate={(plan) => {
                                        setPlans(prev => [plan, ...prev]);
                                        setShowAI(false);
                                        setTab('plans');
                                    }}
                                    onClose={() => setShowAI(false)}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Group Workout Modal */}
            <GroupWorkoutModal
                isOpen={showGroupModal}
                onClose={() => setShowGroupModal(false)}
                trainerId={user?.id || ''}
                homeGymId={user?.home_gym || ''}
                plans={plans}
            />

            {/* Join Session Modal */}
            <JoinSessionModal
                isOpen={showJoinModal}
                onClose={() => setShowJoinModal(false)}
                userId={user?.id || ''}
                onJoined={(session) => setActiveGroupSession(session)}
            />

            {/* Content */}
            <div className="px-4">
                {tab === 'plans' ? (
                    <div className="space-y-3">
                        {plans.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-gray-500 py-20 gap-4">
                                <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
                                    <Dumbbell size={24} className="text-gray-600" />
                                </div>
                                <p className="text-center font-medium">No workout plans yet.</p>
                                <button onClick={() => setShowCreator(true)} className="text-sm text-lime hover:underline">Create your first plan</button>
                            </div>
                        ) : (
                            plans.map((plan, idx) => (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.06 }}
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
                                            {user?.is_trainer && (
                                                <button
                                                    onClick={() => toggleShare(plan.id)}
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
                                                onClick={() => deletePlan(plan.id)}
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
                                        onClick={() => setActiveWorkout(plan)}
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
                            ))
                        )}
                    </div>
                ) : tab === 'community' ? (
                    /* Discovery Tab */
                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <div className="w-10 h-10 border-2 border-lime/30 border-t-lime rounded-full animate-spin" />
                                <p className="text-xs text-gray-500">Scanning for trainer expertise...</p>
                            </div>
                        ) : communityPlans.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-gray-500 py-20 gap-4">
                                <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
                                    <GraduationCap size={24} className="text-gray-600" />
                                </div>
                                <p className="text-center font-medium">No shared plans found.</p>
                                <p className="text-xs text-center px-8">Follow verified trainers to see their shared workout routines here.</p>
                            </div>
                        ) : (
                            communityPlans.map((plan: any, idx) => (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
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
                                        onClick={() => useTemplate(plan)}
                                        className="w-full py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-500/20 active:scale-[0.98] transition-all"
                                    >
                                        <Plus size={14} /> Add to My Plans
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </div>
                ) : tab === 'marketplace' ? (
                    /* Marketplace Tab */
                    <div className="space-y-4">
                        <div className="bg-lime/10 border border-lime/30 rounded-2xl p-4 flex items-center gap-4">
                            <div className="p-3 bg-lime rounded-xl text-oled">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Marketplace</h4>
                                <p className="text-[10px] text-gray-400">Premium programs from world-class trainers.</p>
                            </div>
                        </div>

                        {marketplacePrograms.map((prog, idx) => (
                            <motion.div
                                key={prog.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden group shadow-2xl"
                            >
                                <div className="h-40 relative">
                                    <img src={prog.image} alt={prog.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className="text-[9px] bg-lime text-oled px-2 py-1 rounded-lg font-black uppercase tracking-wider">{prog.intensity}</span>
                                        <span className="text-[9px] bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-lg font-black uppercase tracking-wider">{prog.duration}</span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                                        <div>
                                            <p className="text-[10px] text-lime font-black uppercase tracking-[0.2em]">{prog.trainer}</p>
                                            <h4 className="text-lg font-black text-white">{prog.name}</h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-white">{prog.price}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-900/50">
                                    <p className="text-xs text-gray-400 leading-relaxed mb-4">{prog.description}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1 text-[10px] text-yellow-500 font-bold">
                                                <Sparkles size={12} /> {prog.reviews}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold">
                                                <Users size={12} /> {prog.students} students
                                            </div>
                                        </div>
                                        <button className="px-5 py-2 rounded-xl bg-white text-black text-[10px] font-black hover:bg-lime transition-all active:scale-95 shadow-xl">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : tab === 'templates' ? (
                    /* Templates Tab */
                    <div className="space-y-3">
                        <p className="text-xs text-gray-500 mb-2">Tap to add a template to your plans instantly</p>
                        {starterTemplates.map((template, idx) => (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-gray-900 border border-gray-800 rounded-2xl p-4"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{template.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-semibold">{template.target}</span>
                                            <span className="text-[10px] text-gray-500">{template.exercises.length} exercises</span>
                                        </div>
                                    </div>
                                    <span className="text-[9px] text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full font-bold border border-yellow-500/20">⭐ Starter</span>
                                </div>
                                <div className="space-y-1 mb-3">
                                    {template.exercises.map((ex, i) => (
                                        <div key={ex.id} className="flex items-center gap-2 text-xs text-gray-400">
                                            <span className="text-[9px] text-purple-400 bg-purple-500/10 w-4 h-4 rounded flex items-center justify-center font-bold">{i + 1}</span>
                                            <span className="flex-1 truncate">{ex.name}</span>
                                            <span className="text-gray-600">{ex.sets}×{ex.reps}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => useTemplate(template)}
                                    className="w-full py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-purple-500/20 active:scale-[0.98] transition-all"
                                >
                                    <Plus size={14} /> Use This Template
                                </button>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    /* History Tab */
                    <div className="space-y-3">
                        {logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-gray-500 py-20 gap-4">
                                <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
                                    <Clock size={24} className="text-gray-600" />
                                </div>
                                <p className="text-center font-medium">No workout history yet.</p>
                                <p className="text-sm">Start a plan to log your first workout!</p>
                            </div>
                        ) : (
                            logs.map((log, idx) => {
                                const plan = plans.find(p => p.id === log.plan_id);
                                const completedCount = log.exercises.filter(e => e.completed).length;
                                return (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.06 }}
                                        className="bg-gray-900 border border-gray-800 rounded-2xl p-4"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-bold text-white text-sm">{plan?.name || 'Workout'}</h4>
                                            <span className="text-[10px] text-gray-500">
                                                {new Date(log.started_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                                            <span className="flex items-center gap-1"><Clock size={11} /> {log.duration_min} min</span>
                                            <span className="flex items-center gap-1"><CheckCircle2 size={11} className="text-lime" /> {completedCount}/{log.exercises.length}</span>
                                            {plan && <span className="text-[10px] bg-lime/10 text-lime px-1.5 py-0.5 rounded">{plan.target}</span>}
                                        </div>
                                        {/* Progress bar */}
                                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-lime rounded-full transition-all"
                                                style={{ width: `${(completedCount / log.exercises.length) * 100}%` }}
                                            />
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Level Up Overlay */}
                <AnimatePresence>
                    {showLevelUp && (
                        <LevelUpOverlay level={4} onClose={() => setShowLevelUp(false)} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
