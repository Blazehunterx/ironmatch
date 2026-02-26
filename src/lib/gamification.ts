// ═══════════════════════════════════════════════════════
// IronMatch Gamification System v2
// Strength-Based Ranks · 50 Quests · Validated Duels
// ═══════════════════════════════════════════════════════

// ═══ STRENGTH-BASED RANKS ═══
// Ranks are determined by your Big 4 total (Bench + Squat + Deadlift + OHP)
// You can ENTER at any rank. You can LOSE rank if you lose strength.

export interface Rank {
    name: string;
    tier: 'below' | 'average' | 'above';
    icon: string;
    color: string;
    minTotal: number; // lbs, sum of Big 4 1RM
    description: string;
}

export const RANKS: Rank[] = [
    { name: 'Freshman', tier: 'below', icon: '🌱', color: '#6B7280', minTotal: 0, description: 'Just getting started' },
    { name: 'Grinder', tier: 'below', icon: '⚙️', color: '#9CA3AF', minTotal: 400, description: 'Building the foundation' },
    { name: 'Contender', tier: 'below', icon: '🥊', color: '#3B82F6', minTotal: 600, description: 'Ready to compete' },
    { name: 'Athlete', tier: 'average', icon: '🏋️', color: '#10B981', minTotal: 800, description: 'Solid all-around lifter' },
    { name: 'Beast', tier: 'above', icon: '🔥', color: '#F59E0B', minTotal: 1000, description: 'Stronger than most' },
    { name: 'Elite', tier: 'above', icon: '💎', color: '#8B5CF6', minTotal: 1200, description: 'Top-tier strength' },
    { name: 'Legend', tier: 'above', icon: '👑', color: '#EF4444', minTotal: 1500, description: 'Peak human performance' },
];

export interface Big4Lifts {
    bench: number;    // lbs
    squat: number;
    deadlift: number;
    ohp: number;      // overhead press
}

export function getBig4Total(lifts: Big4Lifts): number {
    return lifts.bench + lifts.squat + lifts.deadlift + lifts.ohp;
}

export function getRankFromLifts(lifts: Big4Lifts): Rank {
    const total = getBig4Total(lifts);
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (total >= RANKS[i].minTotal) return RANKS[i];
    }
    return RANKS[0];
}

export function getNextRank(lifts: Big4Lifts): Rank | null {
    const current = getRankFromLifts(lifts);
    const idx = RANKS.indexOf(current);
    return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

export function getRankProgress(lifts: Big4Lifts): number {
    const total = getBig4Total(lifts);
    const current = getRankFromLifts(lifts);
    const next = getNextRank(lifts);
    if (!next) return 100;
    return Math.min(100, ((total - current.minTotal) / (next.minTotal - current.minTotal)) * 100);
}

// ═══ XP SYSTEM ═══
// XP is a separate currency. It rewards activity but does NOT determine rank.
// Rank = strength milestones only.

export const XP_REWARDS = {
    COMPLETE_WORKOUT: 100,
    HIT_PR: 200,
    WIN_DUEL: 150,
    LOSE_DUEL: 25,
    COMPLETE_QUEST: 75,
    COMPLETE_HIDDEN_QUEST: 200,
    COMMUNITY_POST: 5,
    COMMUNITY_COMMENT: 2,
};

// ═══ BODYWEIGHT-RELATIVE STRENGTH SCORING ═══
// Makes duels fair between people of different sizes.
// A 50kg person lifting 100kg (2.0x BW) scores higher than
// a 120kg person lifting 100kg (0.83x BW).

export function getRelativeStrength(liftLbs: number, bodyweightKg: number): number {
    // Convert lift from lbs to kg, then divide by bodyweight
    const liftKg = liftLbs * 0.453592;
    return Math.round((liftKg / bodyweightKg) * 100) / 100; // ratio like 1.25x
}

/**
 * Compare two lifters fairly using bodyweight ratio.
 * Returns the normalized score (higher = relatively stronger).
 */
export function getDuelScore(liftLbs: number, bodyweightKg: number): number {
    const ratio = getRelativeStrength(liftLbs, bodyweightKg);
    // Score = ratio * 100 (so 1.5x BW = 150 points)
    return Math.round(ratio * 100);
}

/**
 * Check if a duel matchup is fair (within 30% relative strength difference).
 * Returns a fairness rating: 'fair' | 'slight_advantage' | 'unfair'
 */
export function checkDuelFairness(
    challenger: { liftLbs: number; bodyweightKg: number },
    opponent: { liftLbs: number; bodyweightKg: number }
): { fair: boolean; label: string; color: string } {
    const cScore = getDuelScore(challenger.liftLbs, challenger.bodyweightKg);
    const oScore = getDuelScore(opponent.liftLbs, opponent.bodyweightKg);
    const diff = Math.abs(cScore - oScore);
    const avg = (cScore + oScore) / 2;
    const pct = avg > 0 ? diff / avg : 0;

    if (pct < 0.15) return { fair: true, label: 'Fair matchup', color: '#10B981' };
    if (pct < 0.30) return { fair: true, label: 'Slight advantage', color: '#F59E0B' };
    return { fair: false, label: 'Unfair matchup', color: '#EF4444' };
}

// ═══ QUESTS (50 total: 40 public + 10 hidden) ═══

export type QuestCategory = 'bodypart' | 'cardio' | 'social' | 'endurance' | 'pr' | 'variety' | 'gymwar' | 'duel';

export interface Quest {
    id: string;
    title: string;
    description: string;
    category: QuestCategory;
    icon: string;
    target: number;
    xpReward: number;
    hidden: boolean;
}

// 40 PUBLIC QUESTS
export const PUBLIC_QUESTS: Quest[] = [
    // Body Part Focus (12)
    { id: 'pq1', title: 'Leg Day Conqueror', description: 'Train legs 3 times', category: 'bodypart', icon: '🦵', target: 3, xpReward: 75, hidden: false },
    { id: 'pq2', title: 'Back Builder', description: 'Complete 3 back workouts', category: 'bodypart', icon: '🔙', target: 3, xpReward: 75, hidden: false },
    { id: 'pq3', title: 'Iron Arms', description: 'Train arms 3 times', category: 'bodypart', icon: '💪', target: 3, xpReward: 75, hidden: false },
    { id: 'pq4', title: 'Shoulder Slayer', description: 'Complete 3 shoulder sessions', category: 'bodypart', icon: '⚡', target: 3, xpReward: 75, hidden: false },
    { id: 'pq5', title: 'Core Crusher', description: 'Train abs/core 4 times', category: 'bodypart', icon: '🎯', target: 4, xpReward: 75, hidden: false },
    { id: 'pq6', title: 'Chest Champion', description: 'Complete 3 chest workouts', category: 'bodypart', icon: '🏅', target: 3, xpReward: 75, hidden: false },
    { id: 'pq7', title: 'Glute Gains', description: 'Train glutes 3 times', category: 'bodypart', icon: '🍑', target: 3, xpReward: 75, hidden: false },
    { id: 'pq8', title: 'Calf Raiser', description: 'Train calves 5 times', category: 'bodypart', icon: '🦿', target: 5, xpReward: 100, hidden: false },
    { id: 'pq9', title: 'Forearm Freak', description: 'Train forearms/grip 3 times', category: 'bodypart', icon: '✊', target: 3, xpReward: 75, hidden: false },
    { id: 'pq10', title: 'Trap King', description: 'Train traps 3 times', category: 'bodypart', icon: '🏔️', target: 3, xpReward: 75, hidden: false },
    { id: 'pq11', title: 'Full Body Friday', description: 'Do a full-body workout', category: 'bodypart', icon: '🧍', target: 1, xpReward: 50, hidden: false },
    { id: 'pq12', title: 'Never Skip Leg Day', description: 'Train legs 5 times in 2 weeks', category: 'bodypart', icon: '🦵', target: 5, xpReward: 125, hidden: false },

    // Cardio (6)
    { id: 'pq13', title: 'Cardio Crusher', description: 'Complete 2 cardio sessions', category: 'cardio', icon: '🏃', target: 2, xpReward: 75, hidden: false },
    { id: 'pq14', title: 'HIIT Monster', description: 'Do 3 HIIT workouts', category: 'cardio', icon: '💥', target: 3, xpReward: 100, hidden: false },
    { id: 'pq15', title: 'Stairway to Heaven', description: 'Use the stairmaster 3 times', category: 'cardio', icon: '🪜', target: 3, xpReward: 75, hidden: false },
    { id: 'pq16', title: 'Spin Cycle', description: 'Complete 2 cycling sessions', category: 'cardio', icon: '🚴', target: 2, xpReward: 75, hidden: false },
    { id: 'pq17', title: 'Row Your Boat', description: 'Use the rowing machine 3 times', category: 'cardio', icon: '🚣', target: 3, xpReward: 75, hidden: false },
    { id: 'pq18', title: 'Cardio Convert', description: 'Do cardio 5 times (you know you skip it)', category: 'cardio', icon: '❤️‍🔥', target: 5, xpReward: 150, hidden: false },

    // Social (6)
    { id: 'pq19', title: 'Social Lifter', description: 'Work out with 2 different partners', category: 'social', icon: '🤝', target: 2, xpReward: 100, hidden: false },
    { id: 'pq20', title: 'Community Voice', description: 'Post 3 times in the community', category: 'social', icon: '📣', target: 3, xpReward: 50, hidden: false },
    { id: 'pq21', title: 'Hype Machine', description: 'Like 10 community posts', category: 'social', icon: '❤️', target: 10, xpReward: 25, hidden: false },
    { id: 'pq22', title: 'Mentor', description: 'Train with someone below your rank', category: 'social', icon: '🎓', target: 1, xpReward: 100, hidden: false },
    { id: 'pq23', title: 'Team Player', description: 'Accept 3 workout requests', category: 'social', icon: '🤜', target: 3, xpReward: 75, hidden: false },
    { id: 'pq24', title: 'Gym Ambassador', description: 'Work out with 5 different people', category: 'social', icon: '🌟', target: 5, xpReward: 150, hidden: false },

    // PR Challenges (6)
    { id: 'pq25', title: 'PR Breaker', description: 'Hit a new personal record', category: 'pr', icon: '🏆', target: 1, xpReward: 100, hidden: false },
    { id: 'pq26', title: 'Bench Milestone', description: 'Add 10lbs to your bench PR', category: 'pr', icon: '🪑', target: 1, xpReward: 150, hidden: false },
    { id: 'pq27', title: 'Squat Milestone', description: 'Add 10lbs to your squat PR', category: 'pr', icon: '🏋️', target: 1, xpReward: 150, hidden: false },
    { id: 'pq28', title: 'Deadlift Milestone', description: 'Add 10lbs to your deadlift PR', category: 'pr', icon: '⬆️', target: 1, xpReward: 150, hidden: false },
    { id: 'pq29', title: 'OHP Milestone', description: 'Add 5lbs to your OHP PR', category: 'pr', icon: '🙌', target: 1, xpReward: 150, hidden: false },
    { id: 'pq30', title: 'Triple Threat', description: 'Hit 3 PRs in one week', category: 'pr', icon: '🔥', target: 3, xpReward: 250, hidden: false },

    // Endurance / Consistency (5)
    { id: 'pq31', title: '7-Day Warrior', description: 'Work out 7 days in a row', category: 'endurance', icon: '📅', target: 7, xpReward: 150, hidden: false },
    { id: 'pq32', title: 'Iron Month', description: 'Train 20 times in one month', category: 'endurance', icon: '🗓️', target: 20, xpReward: 200, hidden: false },
    { id: 'pq33', title: 'Early Bird', description: 'Work out before 7 AM 3 times', category: 'endurance', icon: '🌅', target: 3, xpReward: 100, hidden: false },
    { id: 'pq34', title: 'Night Owl', description: 'Work out after 9 PM 3 times', category: 'endurance', icon: '🌙', target: 3, xpReward: 100, hidden: false },
    { id: 'pq35', title: 'Weekend Warrior', description: 'Train both Sat and Sun 3 weeks', category: 'endurance', icon: '🎉', target: 3, xpReward: 125, hidden: false },

    // Variety (5)
    { id: 'pq36', title: 'Well Rounded', description: 'Train 5 different body parts', category: 'variety', icon: '🎯', target: 5, xpReward: 100, hidden: false },
    { id: 'pq37', title: 'Exercise Explorer', description: 'Try 10 different exercises', category: 'variety', icon: '🧭', target: 10, xpReward: 100, hidden: false },
    { id: 'pq38', title: 'The Balanced One', description: 'Do push, pull, and legs in 1 week', category: 'variety', icon: '⚖️', target: 3, xpReward: 75, hidden: false },
    { id: 'pq39', title: 'New Gym Explorer', description: 'Filter a gym you have not used', category: 'variety', icon: '🗺️', target: 1, xpReward: 50, hidden: false },
    { id: 'pq40', title: 'Superset Master', description: 'Complete 5 supersets in a workout', category: 'variety', icon: '🔄', target: 5, xpReward: 75, hidden: false },
];

// 10 HIDDEN QUESTS (unlocked through special achievements)
export const HIDDEN_QUESTS: Quest[] = [
    // Gym War linked
    { id: 'hq1', title: '???', description: 'Locked — tied to Gym Wars', category: 'gymwar', icon: '🔒', target: 1, xpReward: 200, hidden: true },
    { id: 'hq2', title: '???', description: 'Locked — tied to Gym Wars', category: 'gymwar', icon: '🔒', target: 1, xpReward: 200, hidden: true },
    { id: 'hq3', title: '???', description: 'Locked — tied to Gym Wars', category: 'gymwar', icon: '🔒', target: 1, xpReward: 300, hidden: true },
    // Duel linked
    { id: 'hq4', title: '???', description: 'Locked — tied to Duels', category: 'duel', icon: '🔒', target: 1, xpReward: 200, hidden: true },
    { id: 'hq5', title: '???', description: 'Locked — tied to Duels', category: 'duel', icon: '🔒', target: 1, xpReward: 200, hidden: true },
    { id: 'hq6', title: '???', description: 'Locked — tied to Duels', category: 'duel', icon: '🔒', target: 1, xpReward: 300, hidden: true },
    // Achievement linked
    { id: 'hq7', title: '???', description: 'Locked — extreme achievement', category: 'pr', icon: '🔒', target: 1, xpReward: 300, hidden: true },
    { id: 'hq8', title: '???', description: 'Locked — extreme achievement', category: 'pr', icon: '🔒', target: 1, xpReward: 300, hidden: true },
    { id: 'hq9', title: '???', description: 'Locked — extreme achievement', category: 'endurance', icon: '🔒', target: 1, xpReward: 300, hidden: true },
    { id: 'hq10', title: '???', description: 'Locked — extreme achievement', category: 'variety', icon: '🔒', target: 1, xpReward: 500, hidden: true },
];

// Revealed names (shown when unlocked)
export const HIDDEN_QUEST_REVEALS: Record<string, { title: string; icon: string; description: string }> = {
    hq1: { title: 'War Hero', icon: '🛡️', description: 'Your gym hits #1 on the leaderboard' },
    hq2: { title: 'Army of One', icon: '⚔️', description: 'Log 10+ workouts for your gym in one week' },
    hq3: { title: 'Dynasty', icon: '🏰', description: 'Your gym holds #1 for 3 weeks straight' },
    hq4: { title: 'Undefeated', icon: '🥇', description: 'Win 5 duels without losing' },
    hq5: { title: 'Duel Master', icon: '⚔️', description: 'Win 10 duels total' },
    hq6: { title: 'David vs Goliath', icon: '🪨', description: 'Beat someone 2+ ranks above you in a duel' },
    hq7: { title: '1000 Club', icon: '🏆', description: 'Bench + Squat + Deadlift total over 1000lbs' },
    hq8: { title: 'Double Bodyweight', icon: '⚡', description: 'Deadlift 2x your bodyweight' },
    hq9: { title: '100 Day Streak', icon: '🔥', description: 'Train for 100 days without missing a week' },
    hq10: { title: 'The Completionist', icon: '🌟', description: 'Unlock all other 9 hidden quests' },
};

export const ALL_QUESTS: Quest[] = [...PUBLIC_QUESTS, ...HIDDEN_QUESTS];

// Get 3 active weekly quests (from public pool, rotated by week)
export function getActiveWeeklyQuests(): Quest[] {
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const shuffled = [...PUBLIC_QUESTS].sort((a, b) => {
        const hashA = (weekNumber * 31 + a.id.charCodeAt(2)) % 100;
        const hashB = (weekNumber * 31 + b.id.charCodeAt(2)) % 100;
        return hashA - hashB;
    });
    return shuffled.slice(0, 5); // 5 active per week
}

// ═══ DUELS ═══

export type DuelStatus = 'pending' | 'active' | 'completed' | 'expired';
export type DuelType = 'reps' | 'weight' | 'workouts' | 'custom';

export interface DuelProof {
    videoUrl?: string;
    imageUrl?: string;
    value: number;
    timestamp: string;
}

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
    challengerProof?: DuelProof;
    opponentProgress: number;
    opponentProof?: DuelProof;
    createdAt: string;           // 48h to accept
    endsAt: string;              // 7 days to complete once accepted
    xpReward: number;
}

export const DUEL_TEMPLATES: { type: DuelType; exercise: string; target: string; description: string }[] = [
    { type: 'reps', exercise: 'Push-ups', target: '200 total reps', description: 'First to 200 push-ups' },
    { type: 'reps', exercise: 'Pull-ups', target: '100 total reps', description: 'First to 100 pull-ups' },
    { type: 'workouts', exercise: 'Gym Sessions', target: '5 sessions', description: 'First to 5 gym sessions this week' },
    { type: 'weight', exercise: 'Bench Press', target: 'Best relative lift', description: 'Heaviest bench (BW-adjusted) — post proof!' },
    { type: 'weight', exercise: 'Squat', target: 'Best relative lift', description: 'Heaviest squat (BW-adjusted) — post proof!' },
    { type: 'weight', exercise: 'Deadlift', target: 'Best relative lift', description: 'Heaviest deadlift (BW-adjusted) — post proof!' },
    { type: 'weight', exercise: 'Overhead Press', target: 'Best relative lift', description: 'Heaviest OHP (BW-adjusted) — post proof!' },
    { type: 'reps', exercise: 'Burpees', target: '150 total reps', description: 'First to 150 burpees' },
    { type: 'reps', exercise: 'Dips', target: '200 total reps', description: 'First to 200 dips' },
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
