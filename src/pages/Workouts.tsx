import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { WorkoutPlan, WorkoutLog, GroupSession } from '../types/database';
import { Sparkles, ShieldAlert, Play } from 'lucide-react';
import { safeStorage } from '../lib/safeStorage';

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
import { MuscleHeatmap } from '../components/workouts/MuscleHeatmap';
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

interface BlueprintProgress {
    completedCount: number;
    currentWeek: number;
    currentDay: number;
    lastCompletedAt?: string;
}

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
    const [showPlateLoader, setShowPlateLoader] = useState(false);
    const [activeGroupSession, setActiveGroupSession] = useState<GroupSession | null>(null);

    const [plans, setPlans] = useState<WorkoutPlan[]>([]);
    const [communityPlans, setCommunityPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<WorkoutLog[]>([]);
    const [blueprintProg, setBlueprintProg] = useState<BlueprintProgress>(() => {
        try {
            const raw = safeStorage.getItem(`ironmatch_blueprint_prog_${user?.id || 'guest'}`);
            return raw ? JSON.parse(raw) : { completedCount: 0, currentWeek: 1, currentDay: 1 };
        } catch {
            return { completedCount: 0, currentWeek: 1, currentDay: 1 };
        }
    });

    const fetchPlans = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const localPlansRaw = safeStorage.getItem('ironmatch_plans');
            const localPlans: WorkoutPlan[] = localPlansRaw ? JSON.parse(localPlansRaw) : [];

            const { data } = await supabase
                .from('workout_plans')
                .select('*')
                .eq('author_id', user.id)
                .order('created_at', { ascending: false });

            const combined = [...localPlans, ...(data || [])];
            const seen = new Set<string>();
            const uniquePlans = combined.filter(p => {
                if (seen.has(p.id)) return false;
                seen.add(p.id);
                return true;
            });
            if (uniquePlans.length > 0) setPlans(uniquePlans);

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

        // Auto-advance Blueprint progression
        setBlueprintProg(prev => {
            const nextCount = (prev.completedCount || 0) + 1;
            const nextDay = ((prev.currentDay || 1) % 4) + 1;
            const nextWeek = nextDay === 1 ? Math.min(8, (prev.currentWeek || 1) + 1) : (prev.currentWeek || 1);
            const updated = {
                completedCount: nextCount,
                currentWeek: nextWeek,
                currentDay: nextDay,
                lastCompletedAt: new Date().toISOString()
            };
            safeStorage.setItem(`ironmatch_blueprint_prog_${user?.id || 'guest'}`, JSON.stringify(updated));
            return updated;
        });

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

    const active8WeekPlan = plans.find(p => p.weeks && p.weeks > 0) || (plans.length > 0 ? plans[0] : null);

    return (
        <div className="flex flex-col min-h-screen pb-24 max-w-md mx-auto">
            <div className="px-4 pt-6 pb-4">
                <WorkoutsHeader 
                    onJoinSession={() => setShowJoinModal(true)}
                    onCreatePlan={() => setShowCreator(true)}
                    onOpenPlateLoader={() => setShowPlateLoader(true)}
                    totalKg={((user?.big4?.bench || 0) + (user?.big4?.squat || 0) + (user?.big4?.deadlift || 0) + (user?.big4?.ohp || 0)) || 380}
                    isPro={user?.is_pro || false}
                />

                {/* 8-Week Masterplan Curriculum & Dynamic Day Continuation */}
                <div className="mb-5 p-4 rounded-3xl bg-gradient-to-br from-lime/15 via-gray-950 to-oled border border-lime/30 shadow-[0_0_25px_rgba(50,255,50,0.12)]">
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-lime text-oled text-[9px] font-black uppercase tracking-wider">
                                Week {blueprintProg.currentWeek} of 8
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                {blueprintProg.currentWeek <= 2 
                                    ? 'Phase 1: Tendon Priming' 
                                    : blueprintProg.currentWeek <= 5 
                                        ? 'Phase 2: Mechanical Tension' 
                                        : blueprintProg.currentWeek === 6 
                                            ? 'Phase 3: Deload' 
                                            : 'Phase 4: Peak PRs'}
                            </span>
                        </div>
                        <span className="text-[11px] font-mono text-lime font-black">
                            {blueprintProg.completedCount} Done
                        </span>
                    </div>

                    {/* 4-Day Microcycle Indicator Pills */}
                    <div className="grid grid-cols-4 gap-2 mb-3.5">
                        {[1, 2, 3, 4].map(dayNum => {
                            const isCompleted = dayNum < blueprintProg.currentDay;
                            const isCurrent = dayNum === blueprintProg.currentDay;
                            return (
                                <div
                                    key={dayNum}
                                    className={`py-2 px-1 rounded-xl text-center border transition-all ${
                                        isCompleted
                                            ? 'bg-lime/20 border-lime/50 text-lime'
                                            : isCurrent
                                                ? 'bg-white/10 border-lime text-white ring-1 ring-lime/40'
                                                : 'bg-black/30 border-gray-800 text-gray-500'
                                    }`}
                                >
                                    <div className="text-[9px] font-bold uppercase">Day {dayNum}</div>
                                    <div className="text-[10px] font-black mt-0.5">
                                        {isCompleted ? '✓ Done' : isCurrent ? 'Next' : 'Rest'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => {
                            if (active8WeekPlan) {
                                setActiveWorkout(active8WeekPlan);
                            } else {
                                setActiveWorkout({
                                    id: `blueprint-w${blueprintProg.currentWeek}-d${blueprintProg.currentDay}`,
                                    name: `Week ${blueprintProg.currentWeek} • Day ${blueprintProg.currentDay}: Tendon & Compound Split`,
                                    author_id: user?.id || '',
                                    target: 'Full Body',
                                    exercises: [
                                        { id: 'b1', name: 'Spanish Squat Isometric Hold', sets: 2, reps: 45, weight: 0, notes: '45s hold tendon analgesia' },
                                        { id: 'b2', name: 'Barbell Back Squat', sets: 4, reps: 6, weight: Math.round(((user?.big4?.squat || 100) * 0.75) / 2.5) * 2.5 },
                                        { id: 'b3', name: 'Barbell Bench Press', sets: 4, reps: 6, weight: Math.round(((user?.big4?.bench || 80) * 0.75) / 2.5) * 2.5 },
                                        { id: 'b4', name: 'Poliquin Step Down', sets: 3, reps: 12, weight: 0 },
                                        { id: 'b5', name: 'Zottman Curl', sets: 3, reps: 10, weight: 12.5 }
                                    ],
                                    shared: false,
                                    created_at: new Date().toISOString()
                                });
                            }
                        }}
                        className="w-full py-3.5 px-4 rounded-2xl bg-lime text-oled font-black text-xs uppercase tracking-wider flex items-center justify-between shadow-[0_0_20px_rgba(50,255,50,0.25)] hover:brightness-105 active:scale-[0.99] transition"
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-oled flex items-center justify-center text-lime shrink-0">
                                <Play size={14} fill="currentColor" />
                            </div>
                            <span className="truncate">
                                Start Week {blueprintProg.currentWeek} • Day {blueprintProg.currentDay}
                            </span>
                        </div>
                        <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded-full font-mono text-black font-extrabold shrink-0">
                            LAUNCH ⚡
                        </span>
                    </button>
                </div>

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

                {/* Interactive Anatomy Volume Heatmap (all exercise modalities) */}
                <div className="mb-5">
                    <MuscleHeatmap logs={logs} />
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
                                    logs={logs}
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

            {/* On-Demand Barbell Plate Calculator Drawer */}
            <AnimatePresence>
                {showPlateLoader && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPlateLoader(false)}
                            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-oled rounded-t-3xl border-t border-gray-800 max-h-[92vh] overflow-y-auto p-4 pb-28 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-lime">Barbell Utility</p>
                                    <h3 className="text-base font-bold text-white">Plate Loader & Breakdown</h3>
                                </div>
                                <button
                                    onClick={() => setShowPlateLoader(false)}
                                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                            <BarbellVisualizer />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

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
