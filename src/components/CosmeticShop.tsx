import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, Sparkles, Zap, LayoutGrid, Palette } from 'lucide-react';
import { COSMETIC_ITEMS, CosmeticItem, canUnlock } from '../lib/cosmetics';
import { useAuth } from '../context/AuthContext';

interface CosmeticShopProps {
    onClose: () => void;
}

export default function CosmeticShop({ onClose }: CosmeticShopProps) {
    const { user, updateUser } = useAuth();
    const [selectedTab, setSelectedTab] = useState<'frame' | 'color'>('frame');

    if (!user) return null;

    const userXP = user.xp || 0;
    const userLevel = user.fitness_level || 'Beginner';
    const unlocked = user.unlocked_cosmetics || [];

    const handleEquip = (item: CosmeticItem) => {
        if (item.type === 'frame') {
            updateUser({ active_cosmetic_frame: item.id });
        } else {
            updateUser({ active_cosmetic_color: item.id });
        }
    };

    const handleUnlock = (item: CosmeticItem) => {
        if (canUnlock(item, userXP, userLevel)) {
            const newUnlocked = [...unlocked, item.id];
            updateUser({
                unlocked_cosmetics: newUnlocked,
                xp: userXP - item.xpRequirement // Optional: Spend XP or just requirement?
                // User said "XP currency" in implementation plan implies spending.
            });
        }
    };

    const filteredItems = COSMETIC_ITEMS.filter(item => item.type === selectedTab);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-yellow-400/10 rounded-lg text-yellow-400">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Gear Shop</h3>
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                            <Zap size={10} className="text-yellow-400 fill-yellow-400" />
                            {userXP.toLocaleString()} XP Balance
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-gray-500 hover:text-white rounded-lg transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex px-6 py-4 gap-2">
                <button
                    onClick={() => setSelectedTab('frame')}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border ${selectedTab === 'frame'
                        ? 'bg-lime text-oled border-lime'
                        : 'bg-gray-900 text-gray-500 border-gray-800 hover:border-gray-700'
                        }`}
                >
                    <LayoutGrid size={14} /> Frames
                </button>
                <button
                    onClick={() => setSelectedTab('color')}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border ${selectedTab === 'color'
                        ? 'bg-lime text-oled border-lime'
                        : 'bg-gray-900 text-gray-500 border-gray-800 hover:border-gray-700'
                        }`}
                >
                    <Palette size={14} /> Colors
                </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto px-6 pb-12 space-y-4">
                {filteredItems.map((item, idx) => {
                    const isUnlocked = unlocked.includes(item.id);
                    const isActive = item.type === 'frame'
                        ? user.active_cosmetic_frame === item.id
                        : user.active_cosmetic_color === item.id;
                    const canAfford = canUnlock(item, userXP, userLevel);

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`p-4 rounded-2xl border transition-all ${isActive
                                ? 'bg-lime/10 border-lime'
                                : 'bg-gray-900 border-gray-800'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Preview Circle */}
                                <div className="relative">
                                    <div className={`w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border-2 ${item.type === 'frame' ? item.previewValue : 'border-gray-700'
                                        }`}>
                                        <img src={user.profile_image_url} alt="preview" className="w-full h-full object-cover" />
                                    </div>
                                    {!isUnlocked && (
                                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                            <Lock size={16} className="text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold text-sm ${item.type === 'color' ? item.previewValue : 'text-white'}`}>
                                        {item.name}
                                    </h4>
                                    <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className={`text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 ${canAfford ? 'bg-yellow-400/20 text-yellow-400' : 'bg-red-400/10 text-red-400'
                                            }`}>
                                            <Zap size={8} className="fill-current" />
                                            {item.xpRequirement} XP
                                        </div>
                                        {item.levelRequirement && (
                                            <div className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-400/20 text-blue-400 uppercase">
                                                {item.levelRequirement}+
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isUnlocked ? (
                                    <button
                                        onClick={() => handleEquip(item)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isActive
                                            ? 'bg-lime text-oled'
                                            : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {isActive ? 'Equipped' : 'Equip'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleUnlock(item)}
                                        disabled={!canAfford}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${canAfford
                                            ? 'bg-white text-oled hover:bg-lime hover:scale-105 active:scale-95'
                                            : 'bg-gray-800 text-gray-600 grayscale cursor-not-allowed'
                                            }`}
                                    >
                                        Unlock
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
