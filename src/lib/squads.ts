import { GymSquad, SquadMember, WhiteboardRecord, SpotBeacon, User } from '../types/database';
import { safeStorage } from './safeStorage';

const STORAGE_KEY_SQUADS = 'ironmatch_squads_v2';
const STORAGE_KEY_WHITEBOARD = 'ironmatch_whiteboard_records_v2';
const STORAGE_KEY_BEACONS = 'ironmatch_spot_beacons_v2';

// High-Caliber Multi-Region Seed Squads
export const INITIAL_SQUADS: GymSquad[] = [
    {
        id: 'sq-dutch-titans',
        name: 'Dutch Iron Syndicate',
        tag: 'NL-TITAN',
        join_code: 'AMS777',
        captain_id: 'user-bram',
        captain_name: 'Bram van Dijk',
        primary_country: 'NL',
        rank_tier: 'Legend',
        max_members: 4,
        total_score: 18.2, // Combined BW Multiplier
        total_volume_kg: 84200,
        created_at: '2026-10-10T10:00:00Z',
        members: [
            {
                user_id: 'user-bram',
                name: 'Bram van Dijk',
                avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                country: 'NL',
                gym_name: 'Vondelgym Amsterdam',
                weight_kg: 88,
                big4: { bench: 145, squat: 215, deadlift: 260, ohp: 85 },
                total_kg: 705,
                bw_multiplier: 8.0,
                role: 'captain'
            },
            {
                user_id: 'user-lars',
                name: 'Lars Meijer',
                avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                country: 'NL',
                gym_name: 'Iron House Utrecht',
                weight_kg: 82,
                big4: { bench: 130, squat: 190, deadlift: 240, ohp: 75 },
                total_kg: 635,
                bw_multiplier: 7.7,
                role: 'member'
            },
            {
                user_id: 'user-marcus-cross',
                name: 'Marcus Sterling',
                avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
                country: 'ID',
                gym_name: 'Body Factory Bali',
                weight_kg: 76,
                big4: { bench: 110, squat: 160, deadlift: 200, ohp: 65 },
                total_kg: 535,
                bw_multiplier: 7.0,
                role: 'member'
            }
        ]
    },
    {
        id: 'sq-rotterdam-duo',
        name: 'Rotterdam Heavy Duo',
        tag: 'RDAM-2',
        join_code: 'RDM010',
        captain_id: 'user-sven',
        captain_name: 'Sven Bakker',
        primary_country: 'NL',
        rank_tier: 'Gold',
        max_members: 2,
        total_score: 13.8,
        total_volume_kg: 56100,
        created_at: '2026-10-12T14:00:00Z',
        members: [
            {
                user_id: 'user-sven',
                name: 'Sven Bakker',
                avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
                country: 'NL',
                gym_name: 'David Lloyd Rotterdam',
                weight_kg: 92,
                big4: { bench: 150, squat: 210, deadlift: 250, ohp: 85 },
                total_kg: 695,
                bw_multiplier: 7.5,
                role: 'captain'
            },
            {
                user_id: 'user-daan',
                name: 'Daan Vos',
                avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
                country: 'NL',
                gym_name: 'Basic-Fit Rotterdam',
                weight_kg: 78,
                big4: { bench: 115, squat: 165, deadlift: 210, ohp: 65 },
                total_kg: 555,
                bw_multiplier: 7.1,
                role: 'member'
            }
        ]
    },
    {
        id: 'sq-venice-barbell',
        name: 'Venice Barbell Alliance',
        tag: 'VENICE',
        join_code: 'LAX420',
        captain_id: 'user-colt',
        captain_name: 'Colt Walker',
        primary_country: 'US',
        rank_tier: 'Legend',
        max_members: 4,
        total_score: 22.4,
        total_volume_kg: 104500,
        created_at: '2026-10-08T12:00:00Z',
        members: [
            {
                user_id: 'user-colt',
                name: 'Colt Walker',
                avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
                country: 'US',
                gym_name: "Gold's Gym Venice",
                weight_kg: 100,
                big4: { bench: 180, squat: 250, deadlift: 300, ohp: 105 },
                total_kg: 835,
                bw_multiplier: 8.3,
                role: 'captain'
            },
            {
                user_id: 'user-jax',
                name: 'Jaxson Reed',
                avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
                country: 'US',
                gym_name: "Gold's Gym Venice",
                weight_kg: 85,
                big4: { bench: 140, squat: 200, deadlift: 250, ohp: 80 },
                total_kg: 670,
                bw_multiplier: 7.8,
                role: 'member'
            }
        ]
    },
    {
        id: 'sq-london-reapers',
        name: 'Piccadilly Iron Reapers',
        tag: 'LDN-RIP',
        join_code: 'LON020',
        captain_id: 'user-callum',
        captain_name: 'Callum Wright',
        primary_country: 'GB',
        rank_tier: 'Cobalt',
        max_members: 4,
        total_score: 16.5,
        total_volume_kg: 68900,
        created_at: '2026-10-14T08:00:00Z',
        members: [
            {
                user_id: 'user-callum',
                name: 'Callum Wright',
                avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
                country: 'GB',
                gym_name: 'PureGym Piccadilly',
                weight_kg: 80,
                big4: { bench: 125, squat: 180, deadlift: 220, ohp: 70 },
                total_kg: 595,
                bw_multiplier: 7.4,
                role: 'captain'
            }
        ]
    }
];

export const INITIAL_WHITEBOARD_RECORDS: WhiteboardRecord[] = [
    {
        id: 'rec-sq-1',
        exercise: 'squat',
        weight_kg: 260,
        reps: 1,
        lifter_id: 'user-colt',
        lifter_name: 'Colt Walker',
        lifter_avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
        lifter_country: 'US',
        squad_name: 'Venice Barbell Alliance',
        squad_tag: 'VENICE',
        gym_id: 'golds-venice',
        gym_name: "Gold's Gym Venice",
        scope: 'global',
        verified_at: '2026-10-20T17:30:00Z'
    },
    {
        id: 'rec-sq-2',
        exercise: 'squat',
        weight_kg: 225,
        reps: 2,
        lifter_id: 'user-bram',
        lifter_name: 'Bram van Dijk',
        lifter_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        lifter_country: 'NL',
        squad_name: 'Dutch Iron Syndicate',
        squad_tag: 'NL-TITAN',
        gym_id: 'vondelgym-ams',
        gym_name: 'Vondelgym Amsterdam',
        scope: 'national',
        verified_at: '2026-10-21T09:15:00Z'
    },
    {
        id: 'rec-bp-1',
        exercise: 'bench',
        weight_kg: 180,
        reps: 1,
        lifter_id: 'user-colt',
        lifter_name: 'Colt Walker',
        lifter_avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
        lifter_country: 'US',
        squad_name: 'Venice Barbell Alliance',
        squad_tag: 'VENICE',
        gym_name: "Gold's Gym Venice",
        scope: 'global',
        verified_at: '2026-10-19T18:00:00Z'
    },
    {
        id: 'rec-bp-2',
        exercise: 'bench',
        weight_kg: 155,
        reps: 1,
        lifter_id: 'user-sven',
        lifter_name: 'Sven Bakker',
        lifter_avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        lifter_country: 'NL',
        squad_name: 'Rotterdam Heavy Duo',
        squad_tag: 'RDAM-2',
        gym_name: 'David Lloyd Rotterdam',
        scope: 'national',
        verified_at: '2026-10-20T14:20:00Z'
    },
    {
        id: 'rec-dl-1',
        exercise: 'deadlift',
        weight_kg: 300,
        reps: 1,
        lifter_id: 'user-colt',
        lifter_name: 'Colt Walker',
        lifter_avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
        lifter_country: 'US',
        squad_name: 'Venice Barbell Alliance',
        squad_tag: 'VENICE',
        gym_name: "Gold's Gym Venice",
        scope: 'global',
        verified_at: '2026-10-18T16:45:00Z'
    },
    {
        id: 'rec-dl-2',
        exercise: 'deadlift',
        weight_kg: 270,
        reps: 1,
        lifter_id: 'user-bram',
        lifter_name: 'Bram van Dijk',
        lifter_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        lifter_country: 'NL',
        squad_name: 'Dutch Iron Syndicate',
        squad_tag: 'NL-TITAN',
        gym_name: 'Vondelgym Amsterdam',
        scope: 'national',
        verified_at: '2026-10-21T11:00:00Z'
    }
];

export const INITIAL_BEACONS: SpotBeacon[] = [
    {
        id: 'bc-1',
        user_id: 'user-colt',
        user_name: 'Colt Walker',
        avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
        gym_id: 'golds-venice',
        gym_name: "Gold's Gym Venice",
        exercise: 'Barbell Bench Press',
        current_weight: 140,
        unit: 'kg',
        status: 'need_spot',
        squad_tag: 'VENICE',
        created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString()
    },
    {
        id: 'bc-2',
        user_id: 'user-callum',
        user_name: 'Callum Wright',
        avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
        gym_id: 'puregym-ldn',
        gym_name: 'PureGym Piccadilly',
        exercise: 'Barbell Back Squat',
        current_weight: 180,
        unit: 'kg',
        status: 'working_in',
        squad_tag: 'LDN-RIP',
        created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString()
    }
];

// --- STORAGE ACCESSORS ---

export function getStoredSquads(): GymSquad[] {
    try {
        const raw = safeStorage.getItem(STORAGE_KEY_SQUADS);
        if (raw) return JSON.parse(raw);
    } catch {}
    safeStorage.setItem(STORAGE_KEY_SQUADS, JSON.stringify(INITIAL_SQUADS));
    return INITIAL_SQUADS;
}

export function saveStoredSquads(squads: GymSquad[]) {
    try {
        safeStorage.setItem(STORAGE_KEY_SQUADS, JSON.stringify(squads));
    } catch {}
}

export function getStoredWhiteboard(): WhiteboardRecord[] {
    try {
        const raw = safeStorage.getItem(STORAGE_KEY_WHITEBOARD);
        if (raw) return JSON.parse(raw);
    } catch {}
    safeStorage.setItem(STORAGE_KEY_WHITEBOARD, JSON.stringify(INITIAL_WHITEBOARD_RECORDS));
    return INITIAL_WHITEBOARD_RECORDS;
}

export function saveStoredWhiteboard(records: WhiteboardRecord[]) {
    try {
        safeStorage.setItem(STORAGE_KEY_WHITEBOARD, JSON.stringify(records));
    } catch {}
}

export function getActiveBeacons(gymId?: string): SpotBeacon[] {
    try {
        const raw = safeStorage.getItem(STORAGE_KEY_BEACONS);
        const list: SpotBeacon[] = raw ? JSON.parse(raw) : INITIAL_BEACONS;
        if (gymId) {
            return list.filter(b => b.gym_id === gymId);
        }
        return list;
    } catch {
        return INITIAL_BEACONS;
    }
}

export function broadcastSpotBeacon(beacon: SpotBeacon) {
    const list = getActiveBeacons();
    const updated = [beacon, ...list.filter(b => b.user_id !== beacon.user_id)];
    safeStorage.setItem(STORAGE_KEY_BEACONS, JSON.stringify(updated));
}

export function dismissBeacon(beaconId: string) {
    const list = getActiveBeacons();
    const updated = list.filter(b => b.id !== beaconId);
    safeStorage.setItem(STORAGE_KEY_BEACONS, JSON.stringify(updated));
}

// --- CORE SQUAD ACTIONS ---

export function getUserSquad(userId: string): GymSquad | null {
    const squads = getStoredSquads();
    return squads.find(s => s.members.some(m => m.user_id === userId)) || null;
}

export function createSquad(
    captain: User,
    name: string,
    tag: string,
    maxMembers: number = 4,
    primaryCountry: string = 'NL'
): GymSquad {
    const squads = getStoredSquads();
    const cleanTag = tag.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 8);
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const bwRatio = captain.weight_kg && captain.big4
        ? Math.round(((captain.big4.bench + captain.big4.squat + captain.big4.deadlift + captain.big4.ohp) / captain.weight_kg) * 10) / 10
        : 5.5;

    const newSquad: GymSquad = {
        id: `squad-${Date.now()}`,
        name: name.trim(),
        tag: cleanTag,
        join_code: joinCode,
        captain_id: captain.id,
        captain_name: captain.name,
        primary_country: primaryCountry,
        rank_tier: 'Cobalt',
        max_members: maxMembers,
        total_score: bwRatio,
        total_volume_kg: 0,
        created_at: new Date().toISOString(),
        members: [
            {
                user_id: captain.id,
                name: captain.name,
                avatar_url: captain.profile_image_url || 'https://i.pravatar.cc/150',
                country: primaryCountry,
                gym_name: captain.home_gym_name || 'Home Gym',
                weight_kg: captain.weight_kg || 75,
                big4: captain.big4,
                total_kg: captain.big4 ? (captain.big4.bench + captain.big4.squat + captain.big4.deadlift + captain.big4.ohp) : 400,
                bw_multiplier: bwRatio,
                role: 'captain'
            }
        ]
    };

    saveStoredSquads([newSquad, ...squads]);
    return newSquad;
}

export function joinSquadByCode(user: User, code: string): { success: boolean; squad?: GymSquad; error?: string } {
    const squads = getStoredSquads();
    const cleanCode = code.trim().toUpperCase();
    const target = squads.find(s => s.join_code === cleanCode);

    if (!target) {
        return { success: false, error: 'Invalid Squad Join Code. Please verify with your gym bro.' };
    }

    if (target.members.some(m => m.user_id === user.id)) {
        return { success: false, error: 'You are already an active member of this squad.' };
    }

    if (target.members.length >= target.max_members) {
        return { success: false, error: `Squad roster is full (${target.members.length}/${target.max_members}).` };
    }

    const bwRatio = user.weight_kg && user.big4
        ? Math.round(((user.big4.bench + user.big4.squat + user.big4.deadlift + user.big4.ohp) / user.weight_kg) * 10) / 10
        : 5.0;

    const newMember: SquadMember = {
        user_id: user.id,
        name: user.name,
        avatar_url: user.profile_image_url || 'https://i.pravatar.cc/150',
        country: user.country || 'NL',
        gym_name: user.home_gym_name || 'Home Gym',
        weight_kg: user.weight_kg || 75,
        big4: user.big4,
        total_kg: user.big4 ? (user.big4.bench + user.big4.squat + user.big4.deadlift + user.big4.ohp) : 380,
        bw_multiplier: bwRatio,
        role: 'member'
    };

    const updatedMembers = [...target.members, newMember];
    const newTotalScore = Math.round(updatedMembers.reduce((sum, m) => sum + m.bw_multiplier, 0) * 10) / 10;

    const updatedSquad: GymSquad = {
        ...target,
        members: updatedMembers,
        total_score: newTotalScore,
        rank_tier: newTotalScore >= 20 ? 'Legend' : newTotalScore >= 14 ? 'Gold' : 'Cobalt'
    };

    const updatedList = squads.map(s => s.id === updatedSquad.id ? updatedSquad : s);
    saveStoredSquads(updatedList);
    return { success: true, squad: updatedSquad };
}

export function leaveSquad(userId: string): void {
    const squads = getStoredSquads();
    const updated = squads.map(s => {
        if (!s.members.some(m => m.user_id === userId)) return s;
        const newMembers = s.members.filter(m => m.user_id !== userId);
        const newTotalScore = Math.round(newMembers.reduce((sum, m) => sum + m.bw_multiplier, 0) * 10) / 10;
        return {
            ...s,
            members: newMembers,
            total_score: newTotalScore
        };
    }).filter(s => s.members.length > 0); // Disband if empty

    saveStoredSquads(updated);
}

export function getRankedSquads(scope: 'global' | 'national' | 'facility', countryFilter: string = 'NL', gymId?: string): GymSquad[] {
    const squads = getStoredSquads();
    let filtered = [...squads];

    if (scope === 'national') {
        filtered = filtered.filter(s => s.primary_country === countryFilter || s.members.some(m => m.country === countryFilter));
    } else if (scope === 'facility' && gymId) {
        filtered = filtered.filter(s => s.members.some(m => m.gym_name?.toLowerCase().includes(gymId.toLowerCase())));
    }

    return filtered.sort((a, b) => b.total_score - a.total_score);
}

export function getWhiteboardRecords(scope: 'global' | 'national' | 'facility', countryFilter: string = 'NL', gymId?: string): WhiteboardRecord[] {
    const records = getStoredWhiteboard();
    if (scope === 'national') {
        return records.filter(r => r.lifter_country === countryFilter || r.scope === 'global');
    } else if (scope === 'facility' && gymId) {
        return records.filter(r => r.gym_id === gymId || r.scope === 'global');
    }
    return records;
}

export function generateSquadInviteUrl(squad: GymSquad): string {
    const origin =
        typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !window.location.hostname.startsWith('127.')
            ? window.location.origin
            : 'https://ironmatch.app';
    return `${origin}/join?squad=${encodeURIComponent(squad.join_code)}&tag=${encodeURIComponent(squad.tag)}`;
}

export function generateWhatsAppInviteText(squad: GymSquad): string {
    const inviteUrl = generateSquadInviteUrl(squad);
    const squadType = squad.max_members === 2 ? 'Ranked Duo' : '4-Person Squad';
    return `🔥 Join my ${squadType} [${squad.tag}] on IronMatch!\n\nTap this link to join our squad & climb the global strength leaderboard:\n${inviteUrl}`;
}
