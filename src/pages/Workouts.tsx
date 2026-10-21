import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { WorkoutPlan, WorkoutLog, GroupSession } from '../types/database';
import { Sparkles, ShieldAlert } from 'lucide-react';

import LevelUpOverlay from '../components/LevelUpOverlay';
import JoinSessionModal from '../components/JoinSessionModal';
import LiveGroupSession from '../components/LiveGroupSession';
import ActiveWorkout from '../components/ActiveWorkout';
import AIWorkoutGenerator from '../components/AIWorkoutGenerator';
import CombatPhysioModal from '../components/CombatPhysioModal';
import GroupWorkoutModal from '../components/GroupWorkoutModal';
import WorkoutTabNavigation from '../components/workouts/WorkoutTabNavigation';
import EmpireShop from '../components/EmpireShop';
import WorkoutPlanCreator from '../components/workouts/WorkoutPlanCreator';
import StarterTemplateCard from '../components/workouts/StarterTemplateCard';
import { BarbellVisualizer } from '../components/workouts/BarbellVisualizer';
import { STARTER_TEMPLATES } from '../constants/starterTemplates';

// Modular Components
import WorkoutsHeader from '../components/workouts/WorkoutsHeader';
import HostSessionCTA from '../components/workouts/HostSessionCTA';
import WorkoutPlansTab from '../components/workouts/WorkoutPlansTab';
import CommunityPlansTab from '../components/workouts/CommunityPlansTab';
import MarketplaceTab from '../components/workouts/MarketplaceTab';
import HistoryTab from '../components/workouts/HistoryTab';
import ProgramsTab from '../components/workouts/ProgramsTab';
import InsightsTab from '../components/workouts/InsightsTab';

type Tab = 'plans' | 'community' | 'programs' | 'marketplace' | 'templates' | 'history' | 'insights';

export default function Workouts() {
    const { user } = useAuth();
    const [tab, setTab] = useState<Tab>('plans');
    const [showCreator, setShowCreator] = useState(false);
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [activeWorkout, setActiveWorkout] = useState<WorkoutPlan | null>(null);
    const [showAI, setShowAI] = useState(false);
    const [showCombatPhysio, setShowCombatPhysio] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [activeGroupSession, setActiveGroupSession] = useState<GroupSession | null>(null);

    const [plans, setPlans] = useState<WorkoutPlan[]>([]);
    const [communityPlans, setCommunityPlans] = useState<any[]>([]);
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
        try {
            const { data, error } = await supabase
                .from('workout_plans')
                .insert([{
                    name: template.name,
                    author_id: user.id,
                    target: template.target,
                    exercises: template.exercises,
                    shared: false
                }])
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setPlans(prev => [data, ...prev]);
                setTab('plans');
            }
        } catch (err) {
            console.error('Error copying template:', err);
            const localPlan: WorkoutPlan = {
                ...template,
                id: `local-${Date.now()}`,
                author_id: user.id,
                shared: false,
                created_at: new Date().toISOString()
            };
            setPlans(prev => [localPlan, ...prev]);
            setTab('plans');
        }
    };

    const savePlan = async (name: string, target: any, exercises: any[], isPremium?: boolean, priceDisplay?: string) => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('workout_plans')
                .insert([{
                    name,
                    author_id: user.id,
                    target,
                    exercises,
                    shared: false,
                    is_premium: isPremium || false,
                    priceDisplay: priceDisplay || '$0.00'
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
            const localPlan: WorkoutPlan = {
                id: `plan-${Date.now()}`,
                name,
                author_id: user.id,
                target,
                exercises,
                shared: false,
                created_at: new Date().toISOString()
            };
            setPlans(prev => [localPlan, ...prev]);
            setShowCreator(false);
        }
    };

    const deletePlan = async (id: string) => {
        const { error } = await supabase
            .from('workout_plans')
            .delete()
            .eq('id', id);
        if (!error) setPlans(prev => prev.filter(p => p.id !== id));
        else setPlans(prev => prev.filter(p => p.id !== id));
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
        try {
            const { data } = await supabase
                .from('workout_logs')
                .insert({
                    user_id: user?.id,
                    plan_id: log.plan_id,
                    exercises: log.exercises,
                    started_at: log.started_at,
                    completed_at: log.completed_at,
                    duration_min: log.duration_min
                })
                .select()
                .single();

            if (data) setLogs(prev => [data, ...prev]);
            else setLogs(prev => [log, ...prev]);
        } catch {
            setLogs(prev => [log, ...prev]);
        }

        setActiveWorkout(null);
        setShowLevelUp(true);
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
        const matchingPlan = plans.find(p => p.id === activeGroupSession.workout_plan_id) || plans[0] || ({
            id: 'default',
            name: 'Session Plan',
            author_id: user?.id || '',
            target: 'Full Body',
            exercises: [],
            shared: false,
            created_at: new Date().toISOString()
        } as WorkoutPlan);

        return (
            <LiveGroupSession
                session={activeGroupSession}
                plan={matchingPlan}
                userId={user?.id || ''}
                onClose={() => setActiveGroupSession(null)}
            />
        );
    }

    return (
        <div className="flex flex-col min-h-screen pb-24 max-w-md mx-auto">
            <div className="px-4 pt-6 pb-4">
                <WorkoutsHeader 
                    onJoinSession={() => setShowJoinModal(true)}
                    onCreatePlan={() => setShowCreator(true)}
                />

                {/* Dual AI Brain Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <button
                        onClick={() => setShowAI(true)}
                        className="p-3.5 bg-gradient-to-br from-lime/15 to-gray-950 border border-lime/30 rounded-2xl text-left flex items-center gap-3 hover:border-lime/60 transition-all active:scale-[0.98] shadow-lg shadow-lime/5"
                    >
                        <div className="p-2.5 bg-lime text-oled rounded-xl font-black shrink-0">
                            <Sparkles size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase text-lime tracking-wider">AI Head Coach</p>
                            <p className="text-xs font-bold text-white truncate">Roll Custom Split</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setShowCombatPhysio(true)}
                        className="p-3.5 bg-gradient-to-br from-red-500/15 to-gray-950 border border-red-500/30 rounded-2xl text-left flex items-center gap-3 hover:border-red-500/60 transition-all active:scale-[0.98] shadow-lg shadow-red-500/5"
                    >
                        <div className="p-2.5 bg-red-500/20 text-red-400 border border-red-500/40 rounded-xl font-black shrink-0">
                            <ShieldAlert size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase text-red-400 tracking-wider">Combat Physio</p>
                            <p className="text-xs font-bold text-white truncate">Pain Triage & 45s</p>
                        </div>
                    </button>
                </div>

                {user?.is_trainer && user?.verification_status === 'verified' && (
                    <HostSessionCTA onClick={() => setShowGroupModal(true)} />
                )}

                <div className="mb-5">
                    <BarbellVisualizer />
                </div>

                <WorkoutTabNavigation activeTab={tab} onTabChange={setTab} />
            </div>

            {/* Modals & Overlays */}
            <WorkoutPlanCreator
                isOpen={showCreator}
                onClose={() => setShowCreator(false)}
                onSave={savePlan}
                isTrainer={user?.is_trainer}
            />

            {/* AI Workout Generator Modal */}
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

            {/* Combat Physio Modal */}
            <CombatPhysioModal
                isOpen={showCombatPhysio}
                onClose={() => setShowCombatPhysio(false)}
            />

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

            {/* Tab Content */}
            <div className="px-4">
                {tab === 'plans' && (
                    <WorkoutPlansTab 
                        plans={plans}
                        isTrainer={!!user?.is_trainer}
                        onStart={setActiveWorkout}
                        onDelete={deletePlan}
                        onToggleShare={toggleShare}
                        onCreateFirst={() => setShowCreator(true)}
                    />
                )}

                {tab === 'community' && (
                    <CommunityPlansTab 
                        loading={loading}
                        communityPlans={communityPlans}
                        onAdd={useTemplate}
                    />
                )}

                {tab === 'marketplace' && (
                    <MarketplaceTab onOpenShop={() => setIsShopOpen(true)} />
                )}

                {tab === 'templates' && (
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
                )}

                {tab === 'programs' && (
                    <ProgramsTab onUseTemplate={useTemplate} />
                )}

                {tab === 'history' && (
                    <HistoryTab logs={logs} plans={plans} />
                )}

                {tab === 'insights' && (
                    <InsightsTab userId={user?.id || ''} />
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
