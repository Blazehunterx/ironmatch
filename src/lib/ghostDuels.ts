import { User } from '../types/database';
import { Duel, DuelType } from './gamification';
import { RankTier, rankFor } from '../components/profile/RankBadge';

export interface GhostLifter {
    id: string;
    name: string;
    avatarUrl: string;
    rankTier: RankTier;
    rankName: string;
    weightKg: number;
    big4: { bench: number; squat: number; deadlift: number; ohp: number };
    city: string;
    quote: string;
    activeChallenge: {
        exercise: string;
        target: string;
        type: DuelType;
        progressText: string;
        simulatedProgress: number;
        targetNumber: number;
        xpReward: number;
    };
}

export const GHOST_LIFTERS_CATALOG: GhostLifter[] = [
    // --- FRESHMAN (Steel, 0 - 200 kg) ---
    {
        id: 'ghost-freshman-1',
        name: 'Alex Cadence',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        rankTier: 'freshman',
        rankName: 'Freshman',
        weightKg: 70,
        big4: { bench: 55, squat: 70, deadlift: 85, ohp: 35 }, // 245 kg
        city: 'Austin, TX',
        quote: 'Dialing in neurological motor recruitment first.',
        activeChallenge: {
            exercise: 'Push-ups',
            target: '150 total reps',
            type: 'reps',
            progressText: '110 / 150 completed',
            simulatedProgress: 110,
            targetNumber: 150,
            xpReward: 120
        }
    },
    {
        id: 'ghost-freshman-2',
        name: 'Elena Vance',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        rankTier: 'freshman',
        rankName: 'Freshman',
        weightKg: 58,
        big4: { bench: 45, squat: 65, deadlift: 75, ohp: 30 },
        city: 'Berlin, DE',
        quote: 'Linear progressive overload week over week.',
        activeChallenge: {
            exercise: 'Barbell Squat',
            target: '60kg × 5 reps',
            type: 'weight',
            progressText: '55kg × 5 completed',
            simulatedProgress: 55,
            targetNumber: 60,
            xpReward: 130
        }
    },

    // --- GRINDER (Bronze, 200 - 350 kg) ---
    {
        id: 'ghost-grinder-1',
        name: 'Marcus Thorne',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        rankTier: 'grinder',
        rankName: 'Grinder',
        weightKg: 78,
        big4: { bench: 85, squat: 115, deadlift: 140, ohp: 55 }, // 395 kg
        city: 'Manchester, UK',
        quote: 'Chasing the 3-plate milestone with strict depth.',
        activeChallenge: {
            exercise: 'Barbell Bench Press',
            target: '85kg × 6 reps',
            type: 'weight',
            progressText: '85kg × 5 completed',
            simulatedProgress: 5,
            targetNumber: 6,
            xpReward: 150
        }
    },
    {
        id: 'ghost-grinder-2',
        name: 'Chloe IronPulse',
        avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
        rankTier: 'grinder',
        rankName: 'Grinder',
        weightKg: 64,
        big4: { bench: 60, squat: 95, deadlift: 120, ohp: 40 },
        city: 'Vancouver, CA',
        quote: 'Velocity-based execution with zero momentum bounce.',
        activeChallenge: {
            exercise: 'Pull-ups',
            target: '75 total reps',
            type: 'reps',
            progressText: '62 / 75 completed',
            simulatedProgress: 62,
            targetNumber: 75,
            xpReward: 160
        }
    },

    // --- CONTENDER (Cobalt, 350 - 475 kg) ---
    {
        id: 'ghost-contender-1',
        name: 'Dmitri Volkov',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        rankTier: 'contender',
        rankName: 'Contender',
        weightKg: 85,
        big4: { bench: 115, squat: 155, deadlift: 190, ohp: 70 }, // 530 kg
        city: 'Warsaw, PL',
        quote: 'Deadlifts solve everything. Lockout to the ceiling.',
        activeChallenge: {
            exercise: 'Conventional Deadlift',
            target: '180kg × 3 reps',
            type: 'weight',
            progressText: '175kg × 3 verified',
            simulatedProgress: 175,
            targetNumber: 180,
            xpReward: 200
        }
    },
    {
        id: 'ghost-contender-2',
        name: 'Sora Takahashi',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        rankTier: 'contender',
        rankName: 'Contender',
        weightKg: 73,
        big4: { bench: 105, squat: 145, deadlift: 175, ohp: 65 },
        city: 'Osaka, JP',
        quote: 'Bar speed never lies. Explosive concentric drive.',
        activeChallenge: {
            exercise: 'Barbell Bench Press',
            target: '100kg × 8 reps',
            type: 'weight',
            progressText: '100kg × 7 completed',
            simulatedProgress: 7,
            targetNumber: 8,
            xpReward: 210
        }
    },

    // --- ATHLETE (Lime, 475 - 600 kg) ---
    {
        id: 'ghost-athlete-1',
        name: 'Jaxson Viper',
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        rankTier: 'athlete',
        rankName: 'Athlete',
        weightKg: 88,
        big4: { bench: 135, squat: 180, deadlift: 220, ohp: 85 }, // 620 kg
        city: 'Dallas, TX',
        quote: 'Grind through the sticking point. No half-reps allowed.',
        activeChallenge: {
            exercise: 'Barbell Squat',
            target: '160kg × 5 reps',
            type: 'weight',
            progressText: '160kg × 4 completed',
            simulatedProgress: 4,
            targetNumber: 5,
            xpReward: 250
        }
    },
    {
        id: 'ghost-athlete-2',
        name: 'Aria Valkyrie Lind',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        rankTier: 'athlete',
        rankName: 'Athlete',
        weightKg: 69,
        big4: { bench: 100, squat: 160, deadlift: 195, ohp: 60 },
        city: 'Stockholm, SE',
        quote: 'Biomechanical precision beats raw ego every time.',
        activeChallenge: {
            exercise: 'Overhead Press',
            target: '65kg × 5 reps',
            type: 'weight',
            progressText: '62.5kg × 5 verified',
            simulatedProgress: 62.5,
            targetNumber: 65,
            xpReward: 240
        }
    },

    // --- BEAST (Gold, 600 - 725 kg) ---
    {
        id: 'ghost-beast-1',
        name: 'Tariq Titan',
        avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
        rankTier: 'beast',
        rankName: 'Beast',
        weightKg: 102,
        big4: { bench: 165, squat: 220, deadlift: 260, ohp: 100 }, // 745 kg
        city: 'Dubai, UAE',
        quote: 'Sub-maximal heavy triples build bulletproof power.',
        activeChallenge: {
            exercise: 'Conventional Deadlift',
            target: '240kg × 3 reps',
            type: 'weight',
            progressText: '240kg × 2 completed',
            simulatedProgress: 2,
            targetNumber: 3,
            xpReward: 300
        }
    },

    // --- LEGEND (Purple, 725+ kg) ---
    {
        id: 'ghost-legend-1',
        name: 'Gunnar Apex Stone',
        avatarUrl: 'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=150&auto=format&fit=crop&q=80',
        rankTier: 'legend',
        rankName: 'Legend',
        weightKg: 112,
        big4: { bench: 195, squat: 270, deadlift: 310, ohp: 115 }, // 890 kg
        city: 'Reykjavik, IS',
        quote: 'Fear no calibrated plate. The bar bows to willpower.',
        activeChallenge: {
            exercise: 'Barbell Bench Press',
            target: '180kg × 3 reps',
            type: 'weight',
            progressText: '180kg × 2 verified',
            simulatedProgress: 2,
            targetNumber: 3,
            xpReward: 500
        }
    }
];

export function getGhostChallengers(userTotalKg: number, count = 3): GhostLifter[] {
    const userRank = rankFor(userTotalKg);
    const tierOrder: RankTier[] = ['freshman', 'grinder', 'contender', 'athlete', 'beast', 'legend'];
    const curIdx = tierOrder.indexOf(userRank.tier);

    // Pick 1 at user's tier, 1 below (if possible) and 1 above (if possible)
    const candidates: GhostLifter[] = [];

    // Current tier lifters
    const sameTier = GHOST_LIFTERS_CATALOG.filter(g => g.rankTier === userRank.tier);
    if (sameTier.length > 0) {
        candidates.push(sameTier[0]);
    }

    // Tier above
    const aboveTier = tierOrder[Math.min(tierOrder.length - 1, curIdx + 1)];
    const higherLifters = GHOST_LIFTERS_CATALOG.filter(g => g.rankTier === aboveTier && !candidates.includes(g));
    if (higherLifters.length > 0) {
        candidates.push(higherLifters[0]);
    }

    // Tier below
    const belowTier = tierOrder[Math.max(0, curIdx - 1)];
    const lowerLifters = GHOST_LIFTERS_CATALOG.filter(g => g.rankTier === belowTier && !candidates.includes(g));
    if (lowerLifters.length > 0) {
        candidates.push(lowerLifters[0]);
    }

    // Fill remaining up to count
    for (const g of GHOST_LIFTERS_CATALOG) {
        if (candidates.length >= count) break;
        if (!candidates.find(c => c.id === g.id)) {
            candidates.push(g);
        }
    }

    return candidates.slice(0, count);
}

export function convertGhostToUser(ghost: GhostLifter): User {
    return {
        id: ghost.id,
        email: `${ghost.id}@ironmatch.ai`,
        name: ghost.name,
        profile_image_url: ghost.avatarUrl,
        fitness_level: ghost.rankName,
        weight_kg: ghost.weightKg,
        unit_preference: 'kg',
        xp: 14500,
        streak_count: 14,
        big4: ghost.big4,
        created_at: new Date().toISOString(),
        home_gym: '',
        reliability_streak: 5,
        bio: ghost.quote
    } as unknown as User;
}

const GHOST_DUELS_STORAGE_KEY = 'ironmatch_saved_ghost_duels';

export function getSavedGhostDuels(): Duel[] {
    try {
        const raw = localStorage.getItem(GHOST_DUELS_STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export function saveGhostDuel(duel: Duel): void {
    try {
        const existing = getSavedGhostDuels();
        const updated = [duel, ...existing.filter(d => d.id !== duel.id)];
        localStorage.setItem(GHOST_DUELS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error('Failed to save ghost duel', e);
    }
}

export function createDuelFromGhost(user: User | null, ghost: GhostLifter): Duel {
    const duel: Duel = {
        id: `duel-ghost-${ghost.id}-${Date.now()}`,
        challengerId: ghost.id,
        challengerName: ghost.name,
        challengerAvatar: ghost.avatarUrl,
        opponentId: user?.id || 'guest-lifter',
        opponentName: user?.name || 'You',
        opponentAvatar: user?.profile_image_url || '',
        type: ghost.activeChallenge.type,
        exercise: ghost.activeChallenge.exercise,
        target: ghost.activeChallenge.target,
        status: 'active',
        challengerProgress: ghost.activeChallenge.simulatedProgress,
        opponentProgress: 0,
        createdAt: new Date().toISOString(),
        endsAt: '6 days left',
        xpReward: ghost.activeChallenge.xpReward
    };

    saveGhostDuel(duel);
    return duel;
}
