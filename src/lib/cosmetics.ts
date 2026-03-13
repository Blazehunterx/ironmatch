export interface CosmeticItem {
    id: string;
    name: string;
    type: 'frame' | 'color' | 'graph_skin';
    description: string;
    xpRequirement: number;
    levelRequirement?: string;
    previewValue: string; // CSS value, gradient, or theme key
}

export const COSMETIC_ITEMS: CosmeticItem[] = [
    // Frames
    {
        id: 'f1',
        name: 'Iron Forge Frame',
        type: 'frame',
        description: 'A rugged iron frame for your avatar.',
        xpRequirement: 500,
        previewValue: 'border-gray-500 shadow-[0_0_10px_rgba(107,114,128,0.5)]'
    },
    {
        id: 'f2',
        name: 'Neon Lime Glow',
        type: 'frame',
        description: 'Show off with a high-visibility lime glow.',
        xpRequirement: 1500,
        previewValue: 'border-lime shadow-[0_0_15px_rgba(163,230,53,0.6)] animate-pulse'
    },
    {
        id: 'f3',
        name: 'Cyber Purple',
        type: 'frame',
        description: 'Elite cyberpunk aesthetic.',
        xpRequirement: 3000,
        levelRequirement: 'Intermediate',
        previewValue: 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.7)]'
    },
    {
        id: 'f4',
        name: 'Radiant Red',
        type: 'frame',
        description: 'A pulsing red aura for the legendary.',
        xpRequirement: 5000,
        levelRequirement: 'Professional',
        previewValue: 'border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.8)]'
    },
    {
        id: 'f5',
        name: 'Golden Champion',
        type: 'frame',
        description: 'Reserved for the true leaders of the gym.',
        xpRequirement: 10000,
        previewValue: 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.9)]'
    },

    // Colors
    {
        id: 'c1',
        name: 'Lime Text',
        type: 'color',
        description: 'Bright lime username.',
        xpRequirement: 200,
        previewValue: 'text-lime'
    },
    {
        id: 'c2',
        name: 'Electric Blue',
        type: 'color',
        description: 'Cold as ice blue text.',
        xpRequirement: 800,
        previewValue: 'text-blue-400'
    },
    {
        id: 'c3',
        name: 'Sunset Orange',
        type: 'color',
        description: 'A warm gradient of orange and red.',
        xpRequirement: 2000,
        previewValue: 'bg-gradient-to-r from-orange-400 to-red-500 text-transparent bg-clip-text font-black'
    },

    // Graph Skins
    {
        id: 'gs1',
        name: 'The Grand Line',
        type: 'graph_skin',
        description: 'One Piece theme: Deep ocean blues and Haki gold.',
        xpRequirement: 2500,
        previewValue: 'one_piece'
    },
    {
        id: 'gs2',
        name: 'Super Saiyan Aura',
        type: 'graph_skin',
        description: 'Dragon Ball theme: Electric yellow and energy flares.',
        xpRequirement: 5000,
        previewValue: 'dbz'
    },
    {
        id: 'gs3',
        name: 'Uchiha Legacy',
        type: 'graph_skin',
        description: 'Naruto theme: Sharingan crimson and shadow black.',
        xpRequirement: 7500,
        previewValue: 'naruto'
    },
    {
        id: 'gs4',
        name: 'Wings of Liberty',
        type: 'graph_skin',
        description: 'AoT theme: Military steel and forest green.',
        xpRequirement: 10000,
        previewValue: 'aot'
    },
    {
        id: 'gs5',
        name: 'Soul Reaper',
        type: 'graph_skin',
        description: 'Bleach theme: Spiritual black & white with Getsuga aura.',
        xpRequirement: 12500,
        previewValue: 'bleach'
    },
    {
        id: 'gs6',
        name: 'Water Breathing',
        type: 'graph_skin',
        description: 'Demon Slayer theme: Deep blue water and Nichirin steel.',
        xpRequirement: 15000,
        previewValue: 'demon_slayer'
    },
    {
        id: 'gs7',
        name: 'Infinity Limitless',
        type: 'graph_skin',
        description: 'JJK theme: Void purple and infinite blue.',
        xpRequirement: 17500,
        previewValue: 'jjk'
    },
    {
        id: 'gs8',
        name: 'One For All',
        type: 'graph_skin',
        description: 'MHA theme: Emerald spark and hero green.',
        xpRequirement: 20000,
        previewValue: 'mha'
    },
    {
        id: 'gs9',
        name: 'Hunter Nen',
        type: 'graph_skin',
        description: 'HxH theme: Forest green and Nen aura.',
        xpRequirement: 22500,
        previewValue: 'hxh'
    },
    {
        id: 'gs10',
        name: 'Shadow Monarch',
        type: 'graph_skin',
        description: 'Solo Leveling theme: Dark monarch purple and shadow extraction.',
        xpRequirement: 25000,
        previewValue: 'solo_leveling'
    }
];

export function canUnlock(item: CosmeticItem, xp: number, level: string): boolean {
    if (xp < item.xpRequirement) return false;
    if (item.levelRequirement) {
        const levels = ['Beginner', 'Intermediate', 'Professional'];
        if (levels.indexOf(level) < levels.indexOf(item.levelRequirement)) return false;
    }
    return true;
}
