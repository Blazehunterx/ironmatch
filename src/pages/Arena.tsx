import { useState, useEffect, useCallback } from 'react';
import { mockUsers } from '../lib/mock';
import { useAuth } from '../context/AuthContext';
import { useGyms } from '../context/GymContext';
import {
    getActiveWeeklyQuests, HIDDEN_QUESTS, HIDDEN_QUEST_REVEALS,
    Duel, GymWarEntry
} from '../lib/gamification';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, GymMilestone } from '../types/database';

// Modular Components
import ArenaHeader from '../components/arena/ArenaHeader';
import ArenaTabNavigation, { ArenaTab } from '../components/arena/ArenaTabNavigation';
import GymLeaderboard from '../components/arena/GymLeaderboard';
import DuelList from '../components/arena/DuelList';
import QuestSection from '../components/arena/QuestSection';
import DuelCreator from '../components/arena/DuelCreator';

type Tab = ArenaTab;

export default function Arena() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('wars');
    const [showDuelCreator, setShowDuelCreator] = useState(false);
    const [loading, setLoading] = useState(true);
    const [allProfiles, setAllProfiles] = useState<User[]>([]);
    const [duels, setDuels] = useState<Duel[]>([]);
    const [milestones, setMilestones] = useState<GymMilestone[]>([]);
    const { gyms: allGyms } = useGyms();

    const fetchProfiles = useCallback(async () => {
        if (!isSupabaseConfigured) {
            setAllProfiles(mockUsers);
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data) {
            setAllProfiles(data);
        }
        setLoading(false);
    }, []);

    const fetchDuels = useCallback(async () => {
        if (!isSupabaseConfigured || !user?.id) {
            setDuels([]);
            return;
        }

        const { data } = await supabase
            .from('duels')
            .select('*')
            .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
            .order('created_at', { ascending: false });

        if (data) {
            setDuels(data.map(d => ({
                id: d.id,
                challengerId: d.challenger_id,
                challengerName: allProfiles.find(p => p.id === d.challenger_id)?.name || 'Lifter',
                challengerAvatar: allProfiles.find(p => p.id === d.challenger_id)?.profile_image_url || 'https://i.pravatar.cc/150',
                opponentId: d.opponent_id,
                opponentName: allProfiles.find(p => p.id === d.opponent_id)?.name || 'Lifter',
                opponentAvatar: allProfiles.find(p => p.id === d.opponent_id)?.profile_image_url || 'https://i.pravatar.cc/150',
                type: d.type,
                exercise: d.exercise_name,
                target: d.target_value,
                status: d.status,
                challengerProgress: d.challenger_progress,
                opponentProgress: d.opponent_progress,
                createdAt: d.created_at,
                endsAt: '7d left',
                xpReward: d.xp_reward
            })));
        }
    }, [user?.id, allProfiles]);

    const fetchMilestones = useCallback(async () => {
        if (!isSupabaseConfigured || !user?.home_gym) {
            setMilestones([]);
            return;
        }
        const { data } = await supabase.from('gym_milestones').select('*').eq('gym_id', user.home_gym);
        if (data) setMilestones(data);
    }, [user?.home_gym]);

    useEffect(() => {
        fetchProfiles();
        fetchMilestones();
    }, [fetchProfiles, fetchMilestones]);

    useEffect(() => {
        if (allProfiles.length > 0) {
            fetchDuels();
        }
    }, [allProfiles, fetchDuels]);

    // Derived State
    const weeklyQuests = getActiveWeeklyQuests();
    const [questProgress] = useState<Record<string, number>>(() => {
        const p: Record<string, number> = {};
        weeklyQuests.forEach(q => { p[q.id] = Math.floor(Math.random() * (q.target + 1)); });
        return p;
    });
    const [unlockedHidden] = useState<Set<string>>(new Set(['hq1', 'hq4', 'hq7']));

    const gymWars: GymWarEntry[] = (allGyms.length > 0 ? allGyms : []).slice(0, 10).map((g) => {
        const gymMembers = allProfiles.filter(p => p.home_gym === g.id);
        const gymXP = gymMembers.reduce((acc, curr) => acc + (curr.xp || 0), 0);
        const topMember = [...gymMembers].sort((a, b) => (b.xp || 0) - (a.xp || 0))[0];

        return {
            gymId: g.id, gymName: g.name, location: g.location,
            totalWorkouts: Math.floor(gymXP / 100) + gymMembers.length * 5,
            totalXP: gymXP,
            memberCount: gymMembers.length || g.member_count,
            streak: Math.max(...gymMembers.map(m => m.reliability_streak || 0), 0) || 1,
            rank: 0,
            king: topMember ? { name: topMember.name, id: topMember.id } : undefined
        };
    }).sort((a, b) => b.totalXP - a.totalXP).map((g, i) => ({ ...g, rank: i + 1 }));

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-10 h-10 border-4 border-lime/30 border-t-lime rounded-full animate-spin" />
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Entering Arena...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen pb-32">
            <ArenaHeader user={user} />

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
                <DuelList 
                    duels={duels} 
                    user={user} 
                    onShowCreator={() => setShowDuelCreator(true)} 
                />
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
                            ...newDuelData,
                            endsAt: '48h to accept'
                        }, ...prev]);
                    }
                    setShowDuelCreator(false);
                    alert('Challenge sent!');
                }}
            />
        </div>
    );
}
