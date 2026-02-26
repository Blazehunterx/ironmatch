import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    WorkoutPlan, WorkoutExercise, WorkoutLog, BodyPart,
    ALL_BODY_PARTS, EXERCISE_LIBRARY
} from '../types/database';
import {
    Plus, Play, Share2, Trash2, Dumbbell,
    Clock, CheckCircle2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ActiveWorkout from '../components/ActiveWorkout';

type Tab = 'plans' | 'templates' | 'history';

export default function Workouts() {
    const { user } = useAuth();
    const [tab, setTab] = useState<Tab>('plans');
    const [showCreator, setShowCreator] = useState(false);
    const [activeWorkout, setActiveWorkout] = useState<WorkoutPlan | null>(null);

    // Plan creator state
    const [planName, setPlanName] = useState('');
    const [planTarget, setPlanTarget] = useState<BodyPart>('Chest');
    const [planExercises, setPlanExercises] = useState<WorkoutExercise[]>([]);
    const [showExercisePicker, setShowExercisePicker] = useState(false);

    // Plans & logs stored in state (mock persistence)
    const [plans, setPlans] = useState<WorkoutPlan[]>(() => [
        {
            id: 'wp1',
            name: 'Push Day Destroyer',
            author_id: user?.id || '',
            target: 'Chest',
            exercises: [
                { id: 'e1', name: 'Bench Press', sets: 4, reps: 8, weight: 185 },
                { id: 'e2', name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 60 },
                { id: 'e3', name: 'Cable Fly', sets: 3, reps: 12, weight: 30 },
                { id: 'e4', name: 'Dips', sets: 3, reps: 12 },
            ],
            shared: false,
            created_at: new Date().toISOString()
        },
        {
            id: 'wp2',
            name: 'Leg Day',
            author_id: user?.id || '',
            target: 'Legs',
            exercises: [
                { id: 'e5', name: 'Squat', sets: 5, reps: 5, weight: 225 },
                { id: 'e6', name: 'Romanian Deadlift', sets: 3, reps: 10, weight: 155 },
                { id: 'e7', name: 'Leg Press', sets: 4, reps: 12, weight: 360 },
                { id: 'e8', name: 'Leg Curl', sets: 3, reps: 12, weight: 90 },
                { id: 'e9', name: 'Calf Raise', sets: 4, reps: 15, weight: 135 },
            ],
            shared: false,
            created_at: new Date(Date.now() - 86400000).toISOString()
        }
    ]);

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

    const useTemplate = (template: WorkoutPlan) => {
        const plan: WorkoutPlan = {
            ...template,
            id: `wp-${Date.now()}`,
            author_id: user?.id || '',
            created_at: new Date().toISOString(),
            exercises: template.exercises.map(e => ({ ...e, id: `e-${Date.now()}-${Math.random()}` })),
        };
        setPlans(prev => [plan, ...prev]);
        setTab('plans');
    };

    const [logs, setLogs] = useState<WorkoutLog[]>(() => [
        {
            id: 'wl1',
            plan_id: 'wp1',
            user_id: user?.id || '',
            exercises: [
                { id: 'e1', name: 'Bench Press', sets: 4, reps: 8, weight: 185, completed: true },
                { id: 'e2', name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 60, completed: true },
                { id: 'e3', name: 'Cable Fly', sets: 3, reps: 12, weight: 30, completed: true },
                { id: 'e4', name: 'Dips', sets: 3, reps: 12, completed: false },
            ],
            started_at: new Date(Date.now() - 172800000).toISOString(),
            completed_at: new Date(Date.now() - 169200000).toISOString(),
            duration_min: 62
        }
    ]);

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

    const savePlan = () => {
        if (!planName.trim() || planExercises.length === 0) return;
        const plan: WorkoutPlan = {
            id: `wp-${Date.now()}`,
            name: planName,
            author_id: user?.id || '',
            target: planTarget,
            exercises: planExercises,
            shared: false,
            created_at: new Date().toISOString()
        };
        setPlans(prev => [plan, ...prev]);
        setPlanName('');
        setPlanExercises([]);
        setShowCreator(false);
    };

    const deletePlan = (id: string) => {
        setPlans(prev => prev.filter(p => p.id !== id));
    };

    const toggleShare = (id: string) => {
        setPlans(prev => prev.map(p =>
            p.id === id ? { ...p, shared: !p.shared } : p
        ));
    };

    const handleCompleteWorkout = (log: WorkoutLog) => {
        setLogs(prev => [log, ...prev]);
        setActiveWorkout(null);
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

    return (
        <div className="flex flex-col min-h-screen pb-24">
            {/* Header */}
            <div className="px-4 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-bold text-white">Workouts</h2>
                    <button
                        onClick={() => setShowCreator(true)}
                        className="p-2.5 rounded-xl bg-lime text-oled hover:bg-lime/90 active:scale-95 transition-all"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-800">
                    {(['plans', 'templates', 'history'] as Tab[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${tab === t
                                ? 'bg-lime text-oled'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {t === 'plans' ? '📋 Plans' : t === 'templates' ? '⭐ Templates' : '📊 History'}
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
                            className="fixed bottom-0 left-0 right-0 z-50 bg-oled rounded-t-3xl max-h-[85vh] overflow-y-auto"
                        >
                            <div className="px-5 py-6 space-y-4">
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
            </div>
        </div>
    );
}
