
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, X } from 'lucide-react';
import { CosmeticItem, canUnlock } from '../../lib/cosmetics';

interface ShopGearItemProps {
    item: CosmeticItem;
    idx: number;
    userXP: number;
    userLevel: string;
    unlocked: string[];
    profileImageUrl: string;
    onUnlock: (item: CosmeticItem) => void;
    onSelect: (item: CosmeticItem) => void;
    isActive: boolean;
    isAdmin?: boolean;
}

export const ShopGearItem: React.FC<ShopGearItemProps> = ({ 
    item, idx, userXP, userLevel, unlocked, profileImageUrl, onUnlock, onSelect, isActive, isAdmin 
}) => {
    const isUnlocked = unlocked.includes(item.id);
    const canAfford = canUnlock(item, userXP, userLevel);
    
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-4 flex items-center gap-5 hover:border-lime/30 transition-all group"
        >
            <div className="relative shrink-0">
                <div className={`w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border-2 ${item.type === 'frame' ? item.previewValue : 'border-gray-700'}`}>
                    <img src={profileImageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                {!isUnlocked && <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center"><X size={20} className="text-gray-500" /></div>}
            </div>
            <div className="flex-1">
                <h4 className={`text-sm font-black ${item.type === 'color' ? item.previewValue : 'text-white'} italic uppercase tracking-tight`}>{item.name}</h4>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">{item.description}</p>
                <div className="flex items-center gap-2 mt-2">
                    <div className={`text-[9px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1.5 ${canAfford ? 'bg-yellow-400/10 text-yellow-400' : 'bg-red-500/10 text-red-500'}`}>
                        <Zap size={10} className="fill-current" /> {item.xpRequirement} XP
                    </div>
                </div>
            </div>
            {isUnlocked ? (
                <button
                    onClick={() => onSelect(item)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-lime text-oled' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                    {isActive ? 'Active' : 'Apply'}
                </button>
            ) : (
                <button
                    onClick={() => onUnlock(item)}
                    disabled={!isAdmin && !canAfford}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isAdmin || canAfford ? 'bg-white text-oled hover:bg-lime active:scale-95' : 'bg-gray-800 text-gray-600 grayscale'}`}
                >
                    {isAdmin ? 'Free' : 'Unlock'}
                </button>
            )}
        </motion.div>
    );
};
