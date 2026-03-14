import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { WorkoutPlan, WorkoutLog, GroupSession } from '../types/database';

import LevelUpOverlay from '../components/LevelUpOverlay';
import JoinSessionModal from '../components/JoinSessionModal';
import LiveGroupSession from '../components/LiveGroupSession';
import ActiveWorkout from '../components/ActiveWorkout';
import AIWorkoutGenerator from '../components/AIWorkoutGenerator';
import GroupWorkoutModal from '../components/GroupWorkoutModal';
import WorkoutTabNavigation from '../components/workouts/WorkoutTabNavigation';
import EmpireShop from '../components/EmpireShop';
import WorkoutPlanCreator from '../components/workouts/WorkoutPlanCreator';
import StarterTemplateCard from '../components/workouts/StarterTemplateCard';
import { STARTER_TEMPLATES } from '../constants/starterTemplates';

// Modular Components
import WorkoutsHeader from '../components/workouts/WorkoutsHeader';
import AICoachCTA from '../components/workouts/AICoachCTA';
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
                <WorkoutsHeader 
                    onJoinSession={() => setShowJoinModal(true)}
                    onCreatePlan={() => setShowCreator(true)}
                />

                {plans.length < 3 && (
                    <AICoachCTA onClick={() => setShowAI(true)} />
                )}

                {user?.is_trainer && user?.verification_status === 'verified' && (
                    <HostSessionCTA onClick={() => setShowGroupModal(true)} />
                )}

                <WorkoutTabNavigation activeTab={tab} onTabChange={setTab} />
            </div>

            {/* Modals & Overlays */}
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
