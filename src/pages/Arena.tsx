import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGyms } from '../context/GymContext';
import {
    getActiveWeeklyQuests, HIDDEN_QUESTS, HIDDEN_QUEST_REVEALS,
    Duel, GymWarEntry
} from '../lib/gamification';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { safeStorage } from '../lib/safeStorage';
import { User, GymMilestone, WorkoutLog } from '../types/database';
import { getSavedGhostDuels } from '../lib/ghostDuels';

// Modular Components
import ArenaHeader from '../components/arena/ArenaHeader';
import ArenaTabNavigation, { ArenaTab } from '../components/arena/ArenaTabNavigation';
import GymLeaderboard from '../components/arena/GymLeaderboard';
import DuelList from '../components/arena/DuelList';
import QuestSection from '../components/arena/QuestSection';
import DuelCreator from '../components/arena/DuelCreator';
import RemoteWhatsAppDuel from '../components/arena/RemoteWhatsAppDuel';
import FamilyCircle from '../components/arena/FamilyCircle';
import PlacementMatchModal from '../components/placement/PlacementMatchModal';
import SquadCard from '../components/squads/SquadCard';
import NationalWhiteboard from '../components/squads/NationalWhiteboard';
import CreateJoinSquadModal from '../components/squads/CreateJoinSquadModal';
import { getUserSquad, leaveSquad } from '../lib/squads';
import { GymSquad } from '../types/database';
import { Trophy, Lock, Shield } from 'lucide-react';

type Tab = ArenaTab;

export default function Arena() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('wars');
    const [showDuelCreator, setShowDuelCreator] = useState(false);
    const [showPlacementModal, setShowPlacementModal] = useState(false);
    const [showSquadModal, setShowSquadModal] = useState(false);
    const [userSquad, setUserSquad] = useState<GymSquad | null>(() => getUserSquad(user?.id || ''));
    const [allProfiles, setAllProfiles] = useState<User[]>([]);
    const [duels, setDuels] = useState<Duel[]>([]);
    const [milestones, setMilestones] = useState<GymMilestone[]>([]);
    const [userLogs, setUserLogs] = useState<WorkoutLog[]>([]);
    const { gyms: allGyms } = useGyms();

    const hasRank = user?.big4 && (user.big4.bench + user.big4.squat + user.big4.deadlift + user.big4.ohp) > 0;

    const fetchProfiles = useCallback(async () => {
        if (!isSupabaseConfigured) {
            setAllProfiles([]);
            return;
        }

        const { data, error } = await supabase.from('profiles').select('*').order('xp', { ascending: false }).limit(50);
        if (!error && data) {
            setAllProfiles(data);
        }
    }, []);

    const fetchDuels = useCallback(async () => {
        const savedGhosts = getSavedGhostDuels();
        if (!isSupabaseConfigured || !user?.id) {
            setDuels(savedGhosts);
            return;
        }

        const { data } = await supabase
            .from('duels')
            .select('*')
            .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
            .order('created_at', { ascending: false });

        if (data) {
            const remoteDuels = data.map(d => {
                const challenger = allProfiles.find(p => p.id === d.challenger_id);
                const opponent = allProfiles.find(p => p.id === d.opponent_id);

                return {
                    id: d.id,
                    challengerId: d.challenger_id,
                    challengerName: d.challenger_id === user.id ? user.name : (challenger?.name || 'Fellow Lifter'),
                    challengerAvatar: d.challenger_id === user.id ? user.profile_image_url || '' : (challenger?.profile_image_url || ''),
                    opponentId: d.opponent_id,
                    opponentName: d.opponent_id === user.id ? user.name : (opponent?.name || 'Fellow Lifter'),
                    opponentAvatar: d.opponent_id === user.id ? user.profile_image_url || '' : (opponent?.profile_image_url || ''),
                    type: d.type || 'weight',
                    exercise: d.exercise_name || d.exercise || 'Bench Press',
                    target: d.target_value || d.target || '100kg',
                    status: d.status,
                    challengerProgress: d.challenger_progress || 0,
                    opponentProgress: d.opponent_progress || 0,
                    createdAt: d.created_at,
                    endsAt: d.ends_at || '7 days left',
                    xpReward: d.xp_reward || 150
                };
            });

            const merged = [...remoteDuels];
            for (const g of savedGhosts) {
                if (!merged.some(d => d.id === g.id)) {
                    merged.push(g);
                }
            }
            setDuels(merged);
        } else {
            setDuels(savedGhosts);
        }
    }, [user, allProfiles]);

    const fetchMilestones = useCallback(async () => {
        if (!isSupabaseConfigured || !user?.home_gym) {
            setMilestones([]);
            return;
        }

        const { data } = await supabase
            .from('gym_milestones')
            .select('*')
            .eq('gym_id', user.home_gym);

        if (data) setMilestones(data);
    }, [user]);

    const fetchUserLogs = useCallback(async () => {
        if (!user?.id) return;
        let localLogs: WorkoutLog[] = [];
        try {
            const raw = safeStorage.getItem(`ironmatch_workout_logs_${user.id}`);
            if (raw) localLogs = JSON.parse(raw);
        } catch {}

        if (!isSupabaseConfigured) {
            setUserLogs(localLogs);
            return;
        }

        try {
            const { data } = await supabase
                .from('workout_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(30);
            const merged = [...localLogs, ...(data || [])];
            const seen = new Set<string>();
            setUserLogs(merged.filter(l => {
                const k = l.id || `${l.started_at}-${l.plan_id}`;
                if (seen.has(k)) return false;
                seen.add(k);
                return true;
            }));
        } catch {
            setUserLogs(localLogs);
        }
    }, [user]);

    useEffect(() => {
        fetchProfiles();
        fetchDuels();
        fetchMilestones();
        fetchUserLogs();

        const params = new URLSearchParams(window.location.search);
        if (params.get('duelId')) {
            setActiveTab('duels');
        }
    }, [fetchProfiles, fetchDuels, fetchMilestones, fetchUserLogs]);

    // Construct & sort Gym Wars descending by totalWorkouts before assigning ranks
    const lifterNames = ['Marcus V.', 'Elena R.', 'Dmitri K.', 'Sarah T.', 'Thor B.', 'Kenji S.', 'Lucas M.'];
    const gymWars: GymWarEntry[] = allGyms
        .map((g, idx) => ({
            gymId: g.id,
            gymName: g.name,
            location: g.location || 'Nearby',
            totalWorkouts: (g.member_count || 1) * 28 + (idx * 5),
            totalXP: (g.member_count || 1) * 14200,
            memberCount: Math.max(1, g.member_count || 1),
            streak: 7 + (idx % 5),
            rank: 0,
            king: { name: lifterNames[idx % lifterNames.length], id: `u-${idx}` }
        }))
        .sort((a, b) => b.totalWorkouts - a.totalWorkouts)
        .map((entry, sortedIdx) => ({
            ...entry,
            rank: sortedIdx + 1
        }));

    const weeklyQuests = getActiveWeeklyQuests();
    const questProgress: Record<string, number> = {};
    const totalSessionsLogged = Math.max(userLogs.length, user?.reliability_streak ? Math.min(user.reliability_streak, 5) : 0);
    const distinctExercisesCount = new Set(
        userLogs.flatMap(l => (l.exercises || []).map(e => e.name?.toLowerCase().trim()).filter(Boolean))
    ).size;

    for (const q of weeklyQuests) {
        if (q.category === 'variety') {
            questProgress[q.id] = Math.min(q.target, Math.max(distinctExercisesCount, totalSessionsLogged));
        } else if (q.category === 'pr') {
            questProgress[q.id] = hasRank ? Math.min(q.target, 1) : 0;
        } else if (q.category === 'endurance') {
            questProgress[q.id] = Math.min(q.target, user?.reliability_streak || totalSessionsLogged);
        } else {
            questProgress[q.id] = Math.min(q.target, totalSessionsLogged);
        }
    }

    const unlockedHidden = new Set<string>();
    if (gymWars[0]?.gymId && user?.home_gym === gymWars[0].gymId) {
        unlockedHidden.add('hq1');
    }
    if (user?.big4) {
        const sbdRaw = (user.big4.bench || 0) + (user.big4.squat || 0) + (user.big4.deadlift || 0);
        const sbdLbs = (user.unit_preference || 'kg') === 'kg' ? sbdRaw * 2.20462 : sbdRaw;
        if (sbdLbs >= 1000) unlockedHidden.add('hq7');

        const dlKg = (user.unit_preference || 'kg') === 'lbs' ? (user.big4.deadlift || 0) / 2.20462 : (user.big4.deadlift || 0);
        if (dlKg >= (user.weight_kg || 75) * 2) unlockedHidden.add('hq8');
    }

    return (
        <div className="pb-24 max-w-md mx-auto">
            <ArenaHeader user={user} />

            {/* Provisional Rank Banner */}
            {!hasRank && (
                <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-r from-lime/20 via-gray-900 to-black border border-lime/40 flex items-center justify-between gap-3 shadow-lg shadow-lime/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-lime text-oled font-black">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-white uppercase italic">Provisional Rank</span>
                                <span className="text-[9px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 px-1.5 py-0.2 rounded font-bold">Unranked</span>
                            </div>
                            <p className="text-[11px] text-gray-400">Complete 1 placement trial to unlock Ranked Duels</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowPlacementModal(true)}
                        className="px-3.5 py-2 rounded-xl bg-lime text-oled font-black text-xs uppercase tracking-wider shrink-0 hover:scale-105 active:scale-95 transition-all shadow-[0_0_12px_rgba(50,255,50,0.3)]"
                    >
                        Start Trial
                    </button>
                </div>
            )}

            <ArenaTabNavigation 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
            />

            {activeTab === 'wars' && (
                <GymLeaderboard 
                    gymWars={gymWars} 
                    user={user} 
                    milestones={milestones} 
                />
            )}

            {activeTab === 'duels' && (
                <div className="space-y-6 px-4">
                    {!hasRank ? (
                        <div className="p-6 rounded-2xl bg-gray-950 border border-gray-800 text-center space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto text-yellow-400">
                                <Lock size={22} />
                            </div>
                            <h4 className="text-white font-black text-sm uppercase">Ranked Duels Locked</h4>
                            <p className="text-xs text-gray-400 max-w-xs mx-auto">
                                Take a 1-second snapshot of your bar or use the digital loader to calibrate your rank and unlock cross-border challenges.
                            </p>
                            <button
                                onClick={() => setShowPlacementModal(true)}
                                className="px-5 py-2.5 rounded-xl bg-lime text-oled font-black text-xs uppercase tracking-wider hover:bg-lime/90 active:scale-95 transition shadow-[0_0_15px_rgba(50,255,50,0.2)]"
                            >
                                Unlock Ranked Duels ⚡
                            </button>
                        </div>
                    ) : (
                        <RemoteWhatsAppDuel user={user} />
                    )}
                    <DuelList 
                        duels={duels} 
                        user={user} 
                        onShowCreator={() => setShowDuelCreator(true)} 
                        onAddDuel={(newDuel) => setDuels(prev => [newDuel, ...prev.filter(d => d.id !== newDuel.id)])}
                    />
                </div>
            )}

            {activeTab === 'family' && (
                <div className="space-y-6 px-4">
                    {/* User's Current Squad or CTA */}
                    {userSquad ? (
                        <SquadCard
                            squad={userSquad}
                            currentUser={user as any}
                            onLeaveSquad={() => {
                                if (user?.id) leaveSquad(user.id);
                                setUserSquad(null);
                            }}
                        />
                    ) : (
                        <div className="p-5 rounded-3xl bg-gradient-to-r from-lime/10 via-gray-950 to-oled border border-lime/40 flex items-center justify-between gap-3 shadow-[0_0_30px_rgba(50,255,50,0.1)]">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-lime/10 border border-lime/30 flex items-center justify-center text-lime font-black shrink-0">
                                    <Shield size={22} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase text-white tracking-wide">
                                        Squad Ranked (2 to 4 Lifters)
                                    </h4>
                                    <p className="text-[10px] text-gray-400">
                                        Team up with your training partners locally or worldwide.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSquadModal(true)}
                                className="px-3.5 py-2 rounded-xl bg-lime text-oled font-black text-xs uppercase tracking-wider shrink-0 hover:scale-105 active:scale-95 transition shadow-[0_0_12px_rgba(50,255,50,0.3)]"
                            >
                                Squad Up ⚡
                            </button>
                        </div>
                    )}

                    {/* National & Global Whiteboard */}
                    <NationalWhiteboard
                        userGymId={user?.home_gym}
                        userGymName={user?.home_gym_name || 'Your Gym'}
                        userCountry={user?.country || 'Global'}
                    />

                    {/* Family & Clan Circle */}
                    <div className="pt-2 border-t border-gray-900">
                        <FamilyCircle />
                    </div>

                    {user && (
                        <CreateJoinSquadModal
                            isOpen={showSquadModal}
                            onClose={() => setShowSquadModal(false)}
                            user={user}
                            onSquadUpdated={(sq) => setUserSquad(sq)}
                        />
                    )}
                </div>
            )}

            {activeTab === 'quests' && (
                <QuestSection 
                    weeklyQuests={weeklyQuests}
                    questProgress={questProgress}
                    unlockedHidden={unlockedHidden}
                    hiddenQuests={HIDDEN_QUESTS}
                    hiddenQuestReveals={HIDDEN_QUEST_REVEALS}
                />
            )}

            <DuelCreator
                isOpen={showDuelCreator}
                onClose={() => setShowDuelCreator(false)}
                user={user}
                allProfiles={allProfiles}
                onSendChallenge={async (newDuelData) => {
                    if (isSupabaseConfigured) {
                        const { error } = await supabase.from('duels').insert(newDuelData);
                        if (error) {
                            console.error('Error creating duel:', error);
                            alert('Failed to send challenge. Please try again.');
                            return;
                        }
                        fetchDuels();
                    } else {
                        // Mock local support
                        setDuels(prev => [{
                            id: `d${Date.now()}`,
                            challengerId: newDuelData.challenger_id,
                            challengerName: user?.name || 'You',
                            challengerAvatar: user?.profile_image_url || '',
                            opponentId: newDuelData.opponent_id,
                            opponentName: allProfiles.find(p => p.id === newDuelData.opponent_id)?.name || 'Opponent',
                            opponentAvatar: allProfiles.find(p => p.id === newDuelData.opponent_id)?.profile_image_url || '',
                            type: newDuelData.type || 'weight',
                            exercise: newDuelData.exercise_name || 'Lift',
                            target: newDuelData.target_value || 'Target',
                            status: 'pending',
                            challengerProgress: 0,
                            opponentProgress: 0,
                            createdAt: new Date().toISOString(),
                            endsAt: '48h to accept',
                            xpReward: 150
                        }, ...prev]);
                    }
                    setShowDuelCreator(false);
                    alert('Challenge sent!');
                }}
            />

            <PlacementMatchModal
                isOpen={showPlacementModal}
                onClose={() => setShowPlacementModal(false)}
                onPlacementComplete={() => setShowPlacementModal(false)}
            />
        </div>
    );
}
