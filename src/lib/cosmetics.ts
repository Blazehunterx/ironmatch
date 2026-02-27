export interface CosmeticItem {
    id: string;
    name: string;
    type: 'frame' | 'color';
    description: string;
    xpRequirement: number;
    levelRequirement?: string;
    previewValue: string; // CSS value or gradient
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
