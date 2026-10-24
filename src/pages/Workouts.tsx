import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { WorkoutPlan, WorkoutLog, GroupSession } from '../types/database';
import { Sparkles, ShieldAlert, Play, Plus, Crown } from 'lucide-react';
import { safeStorage } from '../lib/safeStorage';
import { generate8WeekTendonBlueprint, BLUEPRINT_SPLIT_DAYS } from '../lib/blueprintGenerator';

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
import IronPassModal from '../components/monetization/IronPassModal';

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
    const [showAnatomyRadar, setShowAnatomyRadar] = useState(false);
    const [showProModal, setShowProModal] = useState(false);
    const [activeGroupSession, setActiveGroupSession] = useState<GroupSession | null>(null);
    const hasProAccess = !!(user?.is_pro || user?.is_admin);
    const freeAiKey = `ironmatch_free_ai_used_${user?.id || 'guest'}`;
    const hasFreeAiTrial = !safeStorage.getItem(freeAiKey);

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
        let localLogs: WorkoutLog[] = [];
        try {
            const raw = safeStorage.getItem(`ironmatch_workout_logs_${user.id}`);
            if (raw) localLogs = JSON.parse(raw);
        } catch {}

        try {
            const { data } = await supabase
                .from('workout_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            const merged = [...localLogs, ...(data || [])];
            const seen = new Set<string>();
            const unique = merged.filter(l => {
                const key = l.id || `${l.started_at}-${l.plan_id}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
            setLogs(unique);
        } catch {
            if (localLogs.length > 0) setLogs(localLogs);
        }
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
        // ActiveWorkout.tsx already persists the completed workout log to Supabase & local storage
        setLogs(prev => [log, ...prev]);

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

    const rawBig4Total = ((user?.big4?.bench || 0) + (user?.big4?.squat || 0) + (user?.big4?.deadlift || 0) + (user?.big4?.ohp || 0)) || 380;
    const totalKg = user?.unit_preference === 'lbs' ? Math.round(rawBig4Total / 2.20462) : rawBig4Total;
    const activeDaySplit = BLUEPRINT_SPLIT_DAYS[(blueprintProg.currentDay || 1) - 1] || BLUEPRINT_SPLIT_DAYS[0];

    const launchBlueprintDay = (dayNum: number) => {
        let savedConfig: any = {};
        try {
            const raw = safeStorage.getItem(`ironmatch_blueprint_config_${user?.id || 'guest'}`);
            if (raw) savedConfig = JSON.parse(raw);
        } catch {}
        const generated = generate8WeekTendonBlueprint({
            user,
            doctrine: savedConfig.doctrine || 'strength_tendon',
            weakLinks: savedConfig.weakLinks || ['none'],
            realm: savedConfig.realm || 'commercial',
            daysPerWeek: savedConfig.daysPerWeek || 4,
            weekNumber: blueprintProg.currentWeek || 1,
            dayNumber: dayNum
        });
        setActiveWorkout(generated);
    };

    return (
        <div className="flex flex-col min-h-screen pb-24 max-w-md mx-auto">
            <div className="px-4 pt-6 pb-4">
                <WorkoutsHeader 
                    onJoinSession={() => setShowJoinModal(true)}
                    onCreatePlan={() => setShowCreator(true)}
                    onOpenPlateLoader={() => setShowPlateLoader(true)}
                    totalKg={totalKg}
                    isPro={user?.is_pro || false}
                />

                {/* 8-Week Masterplan Curriculum & Dynamic Day Continuation */}
                <div className="mb-5 p-4 rounded-3xl bg-[#0D0D0D] border border-white/10 shadow-xl">
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-lime text-black text-[9px] font-black uppercase tracking-wider">
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

                    {/* 4-Day Interactive Microcycle Split Selector */}
                    <div className="grid grid-cols-4 gap-2 mb-3.5">
                        {BLUEPRINT_SPLIT_DAYS.map(split => {
                            const dayNum = split.day;
                            const isCompleted = dayNum < blueprintProg.currentDay;
                            const isCurrent = dayNum === blueprintProg.currentDay;
                            return (
                                <button
                                    key={dayNum}
                                    type="button"
                                    onClick={() => {
                                        setBlueprintProg(prev => {
                                            const updated = { ...prev, currentDay: dayNum };
                                            safeStorage.setItem(`ironmatch_blueprint_prog_${user?.id || 'guest'}`, JSON.stringify(updated));
                                            return updated;
                                        });
                                    }}
                                    className={`py-2 px-1 rounded-xl text-center border transition-all active:scale-95 ${
                                        isCurrent
                                            ? 'bg-white/10 border-lime text-white ring-1 ring-lime/40 font-bold'
                                            : isCompleted
                                                ? 'bg-lime/15 border-lime/40 text-lime font-bold'
                                                : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20 font-medium'
                                    }`}
                                >
                                    <div className="text-[9px] font-bold uppercase">Day {dayNum}</div>
                                    <div className="text-[10px] font-black mt-0.5 truncate px-0.5">
                                        {split.shortLabel.split(' ')[1] || split.shortLabel}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={() => launchBlueprintDay(blueprintProg.currentDay || 1)}
                            className="w-full py-3.5 px-4 rounded-2xl bg-lime text-black font-black text-xs uppercase tracking-wider flex items-center justify-between shadow-[0_0_20px_rgba(50,255,50,0.25)] hover:bg-lime/90 active:scale-[0.99] transition"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center text-lime shrink-0">
                                    <Play size={13} fill="currentColor" />
                                </div>
                                <span className="truncate">
                                    Start W{blueprintProg.currentWeek} • Day {blueprintProg.currentDay} ({activeDaySplit.shortLabel.split(' ')[1] || activeDaySplit.shortLabel})
                                </span>
                            </div>
                            <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-mono text-black font-black shrink-0">
                                LAUNCH ⚡
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setActiveWorkout({
                                    id: `freestyle-${Date.now()}`,
                                    name: 'Freestyle Gym Session',
                                    author_id: user?.id || '',
                                    target: 'Full Body',
                                    exercises: [],
                                    shared: false,
                                    created_at: new Date().toISOString()
                                })
                            }
                            className="w-full py-2.5 px-4 rounded-xl bg-black/60 hover:bg-white/[0.04] border border-white/10 hover:border-lime/40 text-gray-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99]"
                        >
                            <Plus size={14} className="text-lime" /> Start Empty Freestyle Workout
                        </button>
                    </div>
                </div>

                {/* Dual AI Brain Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <button
                        onClick={() => {
                            if (!hasProAccess && !hasFreeAiTrial) {
                                setShowProModal(true);
                                return;
                            }
                            setShowAI(true);
                        }}
                        className="p-3 bg-[#0D0D0D] border border-white/10 hover:border-lime/40 rounded-2xl text-left flex items-center gap-2.5 hover:bg-white/[0.02] transition-all active:scale-[0.98] shadow-sm"
                    >
                        <div className="p-2 bg-lime text-black rounded-xl font-black shrink-0 shadow-sm">
                            <Sparkles size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-black uppercase text-lime tracking-wider flex items-center gap-1">
                                AI Coach {!hasProAccess && (hasFreeAiTrial ? <span className="text-[8px] bg-lime/20 text-lime px-1 rounded">1 Free</span> : <Crown size={10} className="text-amber-400" />)}
                            </p>
                            <p className="text-xs font-bold text-white truncate">Generate Split</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setShowCombatPhysio(true)}
                        className="p-3 bg-[#0D0D0D] border border-white/10 hover:border-red-500/40 rounded-2xl text-left flex items-center gap-2.5 hover:bg-white/[0.02] transition-all active:scale-[0.98] shadow-sm"
                    >
                        <div className="p-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-black shrink-0">
                            <ShieldAlert size={16} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase text-red-400 tracking-wider">Physio</p>
                            <p className="text-xs font-bold text-white truncate">Joint Triage</p>
                        </div>
                    </button>
                </div>

                {user?.is_trainer && user?.verification_status === 'verified' && (
                    <HostSessionCTA onClick={() => setShowGroupModal(true)} />
                )}

                {/* Collapsible Anatomy Volume Heatmap */}
                <div className="mb-5 bg-[#0D0D0D] border border-white/10 rounded-2xl overflow-hidden transition-all shadow-md">
                    <button
                        type="button"
                        onClick={() => setShowAnatomyRadar(!showAnatomyRadar)}
                        className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/[0.02] transition"
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-lime block">
                                    7-Day Volume Radar
                                </span>
                                <span className="text-xs font-bold text-white">
                                    Anatomy Stimulus & Fatigue Map
                                </span>
                            </div>
                        </div>
                        <span className="text-[11px] text-gray-400 font-bold px-2.5 py-1 rounded-xl bg-white/5 border border-white/5">
                            {showAnatomyRadar ? 'Hide ▲' : 'View ▼'}
                        </span>
                    </button>
                    {showAnatomyRadar && (
                        <div className="p-3 pt-0 border-t border-white/5">
                            <MuscleHeatmap logs={logs} />
                        </div>
                    )}
                </div>

                <WorkoutTabNavigation
                    activeTab={tab}
                    onTabChange={(nextTab) => {
                        if (nextTab === 'insights' && !hasProAccess) {
                            setShowProModal(true);
                            return;
                        }
                        setTab(nextTab);
                    }}
                />
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
                                        safeStorage.setItem(freeAiKey, 'true');
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
                            <BarbellVisualizer initialUnit={user?.unit_preference || 'kg'} />
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

            <IronPassModal
                isOpen={showProModal}
                onClose={() => setShowProModal(false)}
            />

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
