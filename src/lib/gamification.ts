// ═══════════════════════════════════════════
// IronMatch Gamification System
// XP / Ranks / Gym Wars / Duels / Quests
// ═══════════════════════════════════════════

export interface Rank {
    name: string;
    minXP: number;
    icon: string;
    color: string;
}

export const RANKS: Rank[] = [
    { name: 'Rookie', minXP: 0, icon: '🥉', color: '#9CA3AF' },
    { name: 'Iron', minXP: 500, icon: '🏋️', color: '#6B7280' },
    { name: 'Steel', minXP: 1500, icon: '⚔️', color: '#3B82F6' },
    { name: 'Titanium', minXP: 3000, icon: '💎', color: '#8B5CF6' },
    { name: 'Diamond', minXP: 6000, icon: '👑', color: '#F59E0B' },
    { name: 'Legend', minXP: 10000, icon: '🔥', color: '#EF4444' },
];

export function getRank(xp: number): Rank {
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (xp >= RANKS[i].minXP) return RANKS[i];
    }
    return RANKS[0];
}

export function getNextRank(xp: number): Rank | null {
    const current = getRank(xp);
    const idx = RANKS.indexOf(current);
    return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

export function getXPProgress(xp: number): number {
    const current = getRank(xp);
    const next = getNextRank(xp);
    if (!next) return 100;
    return Math.min(100, ((xp - current.minXP) / (next.minXP - current.minXP)) * 100);
}

// XP rewards
export const XP_REWARDS = {
    COMPLETE_WORKOUT: 100,
    COMPLETE_QUEST: 75,
    WIN_DUEL: 150,
    LOSE_DUEL: 25,      // consolation XP
    POST_COMMUNITY: 10,
    STREAK_BONUS: 50,    // per day of streak
    FIRST_WORKOUT_DAY: 25,
};

// ═══ QUESTS ═══

export type QuestType = 'bodypart' | 'cardio' | 'social' | 'endurance';

export interface Quest {
    id: string;
    title: string;
    description: string;
    type: QuestType;
    icon: string;
    target: number;
    xpReward: number;
    expiresIn: string; // "6d left" etc
}

export const WEEKLY_QUESTS: Quest[] = [
    {
        id: 'q1', title: 'Leg Day Conqueror', description: 'Train legs 3 times this week',
        type: 'bodypart', icon: '🦵', target: 3, xpReward: 75, expiresIn: '5d left'
    },
    {
        id: 'q2', title: 'Cardio Crusher', description: 'Complete 2 cardio sessions',
        type: 'cardio', icon: '🏃', target: 2, xpReward: 75, expiresIn: '5d left'
    },
    {
        id: 'q3', title: 'Social Lifter', description: 'Work out with 2 different partners',
        type: 'social', icon: '🤝', target: 2, xpReward: 100, expiresIn: '5d left'
    },
    {
        id: 'q4', title: 'Iron Arms', description: 'Complete 3 arm workouts',
        type: 'bodypart', icon: '💪', target: 3, xpReward: 75, expiresIn: '5d left'
    },
    {
        id: 'q5', title: 'Marathon Mind', description: 'Work out for a total of 3 hours',
        type: 'endurance', icon: '⏱️', target: 180, xpReward: 100, expiresIn: '5d left'
    },
    {
        id: 'q6', title: 'Back Builder', description: 'Hit back exercises 3 times',
        type: 'bodypart', icon: '🔙', target: 3, xpReward: 75, expiresIn: '5d left'
    },
    {
        id: 'q7', title: 'Core Challenge', description: 'Train abs/core 4 times',
        type: 'bodypart', icon: '🎯', target: 4, xpReward: 75, expiresIn: '5d left'
    },
    {
        id: 'q8', title: 'Shoulder Slayer', description: 'Complete 3 shoulder workouts',
        type: 'bodypart', icon: '⚡', target: 3, xpReward: 75, expiresIn: '5d left'
    },
];

// Pick 3 random quests per week (deterministic based on week number)
export function getActiveQuests(): Quest[] {
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const shuffled = [...WEEKLY_QUESTS].sort((a, b) => {
        const hashA = (weekNumber * 31 + a.id.charCodeAt(1)) % 100;
        const hashB = (weekNumber * 31 + b.id.charCodeAt(1)) % 100;
        return hashA - hashB;
    });
    return shuffled.slice(0, 3);
}

// ═══ DUELS ═══

export type DuelStatus = 'pending' | 'active' | 'completed';
export type DuelType = 'reps' | 'weight' | 'workouts' | 'duration';

export interface Duel {
    id: string;
    challengerId: string;
    challengerName: string;
    challengerAvatar: string;
    opponentId: string;
    opponentName: string;
    opponentAvatar: string;
    type: DuelType;
    exercise: string;
    target: string;
    status: DuelStatus;
    challengerProgress: number;
    opponentProgress: number;
    endsAt: string;
    xpReward: number;
}

export const DUEL_TEMPLATES: { type: DuelType; exercise: string; target: string; description: string }[] = [
    { type: 'reps', exercise: 'Push-ups', target: '200 total reps', description: 'First to 200 push-ups' },
    { type: 'reps', exercise: 'Pull-ups', target: '100 total reps', description: 'First to 100 pull-ups' },
    { type: 'workouts', exercise: 'Gym Sessions', target: '5 sessions', description: 'First to 5 gym sessions this week' },
    { type: 'weight', exercise: 'Bench Press', target: 'Highest 1RM', description: 'Heaviest bench press this week' },
    { type: 'weight', exercise: 'Squat', target: 'Highest 1RM', description: 'Heaviest squat this week' },
    { type: 'weight', exercise: 'Deadlift', target: 'Highest 1RM', description: 'Heaviest deadlift this week' },
    { type: 'duration', exercise: 'Total Gym Time', target: '5 hours', description: 'First to 5 hours total gym time' },
    { type: 'reps', exercise: 'Burpees', target: '150 total reps', description: 'First to 150 burpees' },
];

// ═══ GYM WARS ═══

export interface GymWarEntry {
    gymId: string;
    gymName: string;
    location: string;
    totalWorkouts: number;
    totalXP: number;
    memberCount: number;
    streak: number;
    rank: number;
}
