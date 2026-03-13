import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Users, Dumbbell, Sparkles, Clock, CheckCircle2, GraduationCap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { WorkoutPlan, WorkoutLog, GroupSession } from '../types/database';

interface CommunityPlan extends WorkoutPlan {
    profiles?: {
        name: string;
        profile_image_url: string;
    };
}
import LevelUpOverlay from '../components/LevelUpOverlay';
import JoinSessionModal from '../components/JoinSessionModal';
import LiveGroupSession from '../components/LiveGroupSession';
import ActiveWorkout from '../components/ActiveWorkout';
import AIWorkoutGenerator from '../components/AIWorkoutGenerator';
import GroupWorkoutModal from '../components/GroupWorkoutModal';
import WorkoutTabNavigation from '../components/workouts/WorkoutTabNavigation';
import EmpireShop from '../components/EmpireShop';
import WorkoutPlanCreator from '../components/workouts/WorkoutPlanCreator';
import WorkoutPlanCard from '../components/workouts/WorkoutPlanCard';
import CommunityPlanCard from '../components/workouts/CommunityPlanCard';
import StarterTemplateCard from '../components/workouts/StarterTemplateCard';
import { STARTER_TEMPLATES } from '../constants/starterTemplates';
import { SCIENCE_PACKS } from '../constants/sciencePacks';

type Tab = 'plans' | 'community' | 'programs' | 'marketplace' | 'templates' | 'history';

export default function Workouts() {
    const { user } = useAuth();
    const [tab, setTab] = useState<Tab>('plans');
    const [showCreator, setShowCreator] = useState(false);
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [activeWorkout, setActiveWorkout] = useState<WorkoutPlan | null>(null);
    const [showAI, setShowAI] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [activeGroupSession, setActiveGroupSession] = useState<GroupSession | null>(null);

    // Plans & logs stored in state
    const [plans, setPlans] = useState<WorkoutPlan[]>([]);
    const [communityPlans, setCommunityPlans] = useState<CommunityPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<WorkoutLog[]>([]);


    const fetchPlans = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data } = await supabase
                .from('workout_plans')
                .select('*')
                .eq('author_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setPlans(data);

            const { data: cData } = await supabase
                .from('workout_plans')
                .select('*, profiles!workout_plans_author_id_fkey(name, profile_image_url)')
                .eq('shared', true)
                .neq('author_id', user.id);

            if (cData) setCommunityPlans(cData);
        } finally {
            setLoading(false);
        }
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

    const savePlan = async (name: string, target: any, exercises: any[], isPremium?: boolean, priceDisplay?: string) => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('workout_plans')
                .insert([{
                    author_id: user.id,
                    author_name: user.name,
                    name,
                    target,
                    exercises,
                    shared: true,
                    is_premium: isPremium || false,
                    price_display: priceDisplay || '$0.00'
                }])
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setPlans(prev => [data, ...prev]);
                setShowCreator(false);
            }
        } catch (err) {
            console.error('Error saving plan:', err);
            alert('Failed to save plan.');
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

    if (activeGroupSession) {
        const sessionPlan = plans.find(p => p.id === activeGroupSession.workout_plan_id) || STARTER_TEMPLATES[0];
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

                <WorkoutTabNavigation activeTab={tab} onTabChange={setTab} />
            </div>

            {tab === 'programs' && (
                <div className="px-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                            <GraduationCap size={80} className="text-blue-400" />
                        </div>
                        <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Elite Engineering</h4>
                        <h3 className="text-xl font-black text-white mb-2">Jeff Nippard Science Packs</h3>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-[80%]">
                            Evidence-based hypertrophy programs designed for maximum efficiency and scientific precision.
                        </p>
                    </div>
                </div>
            )}

            <WorkoutPlanCreator
                isOpen={showCreator}
                onClose={() => setShowCreator(false)}
                onSave={savePlan}
                isTrainer={user?.is_trainer}
            />

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

            <GroupWorkoutModal
                isOpen={showGroupModal}
                onClose={() => setShowGroupModal(false)}
                trainerId={user?.id || ''}
                homeGymId={user?.home_gym || ''}
                plans={plans}
            />

            <JoinSessionModal
                isOpen={showJoinModal}
                onClose={() => setShowJoinModal(false)}
                userId={user?.id || ''}
                onJoined={(session) => setActiveGroupSession(session)}
            />

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
                                <WorkoutPlanCard
                                    key={plan.id}
                                    plan={plan}
                                    index={idx}
                                    isTrainer={!!user?.is_trainer}
                                    onStart={setActiveWorkout}
                                    onDelete={deletePlan}
                                    onToggleShare={toggleShare}
                                />
                            ))
                        )}
                    </div>
                ) : tab === 'community' ? (
                    <div className="space-y-3">
                        {loading ? (
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
                            communityPlans.map((plan, idx) => (
                                <CommunityPlanCard
                                    key={plan.id}
                                    plan={plan}
                                    index={idx}
                                    onAdd={useTemplate}
                                />
                            ))
                        )}
                    </div>
                ) : tab === 'marketplace' ? (
                    <div className="flex flex-col items-center justify-center text-gray-500 py-32 gap-6 bg-gray-900/50 rounded-3xl border border-dashed border-gray-800">
                        <div className="w-20 h-20 rounded-full bg-lime/10 flex items-center justify-center border border-lime/20 shadow-2xl shadow-lime/10">
                            <Sparkles size={32} className="text-lime" />
                        </div>
                        <div className="text-center px-8">
                            <h4 className="text-lg font-black text-white italic uppercase tracking-tight">The Pro Marketplace</h4>
                            <p className="text-xs text-gray-500 mt-2 font-medium">Discover premium plans from elite trainers or monetize your own expertise.</p>
                        </div>
                        <button 
                            onClick={() => setIsShopOpen(true)}
                            className="px-8 py-4 bg-lime text-oled rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-lime/20 active:scale-95 transition-all"
                        >
                            Enter Empire Shop
                        </button>
                    </div>
                ) : tab === 'templates' ? (
                    <div className="space-y-3">
                        {STARTER_TEMPLATES.map((template, idx) => (
                            <StarterTemplateCard
                                key={template.id}
                                template={template as any}
                                index={idx}
                                onUse={useTemplate}
                            />
                        ))}
                    </div>
                ) : tab === 'programs' ? (
                    <div className="space-y-3">
                        {SCIENCE_PACKS.map((template, idx) => (
                            <StarterTemplateCard
                                key={template.id}
                                template={template as any}
                                index={idx}
                                onUse={useTemplate}
                            />
                        ))}
                    </div>
                ) : (
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

                <AnimatePresence>
                    {showLevelUp && (
                        <LevelUpOverlay level={4} onClose={() => setShowLevelUp(false)} />
                    )}
                </AnimatePresence>
            </div>
            <AnimatePresence>
                {isShopOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsShopOpen(false)} className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100]" />
                        <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 z-[100] bg-oled rounded-t-[3rem] h-[90vh] border-t border-gray-800 overflow-hidden shadow-2xl shadow-lime/5">
                            <EmpireShop onClose={() => setIsShopOpen(false)} initialTab="marketplace" />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
