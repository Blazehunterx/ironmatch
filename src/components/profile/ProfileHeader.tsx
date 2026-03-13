import React from 'react';
import { Settings, Camera, Activity, Award, ShoppingBag, LayoutGrid } from 'lucide-react';
import { User } from '../../types/database';
import { getRankFromLifts } from '../../lib/gamification';
import { COSMETIC_ITEMS } from '../../lib/cosmetics';

interface ProfileHeaderProps {
    user: User;
    onOpenSettings: () => void;
    onOpenShop: () => void;
    onEditImage: () => void;
    onOpenWardrobe: () => void;
    isSupabaseConfigured: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    user, onOpenSettings, onOpenShop, onEditImage, isSupabaseConfigured, onOpenWardrobe
}) => {
    const rank = getRankFromLifts(user.big4 || { bench: 0, squat: 0, deadlift: 0, ohp: 0 });

    return (
        <>
            <div className="flex justify-between items-center mb-8 shrink-0">
                <h2 className="text-3xl font-bold text-white">Profile</h2>
                <div className="flex gap-2">
                    {((user?.xp || 0) >= 100 || user?.is_trainer) && (
                        <>
                            <button
                                onClick={onOpenShop}
                                className="p-2 text-lime hover:text-white rounded-full bg-lime/10 border border-lime/20 active:scale-95 transition-all shadow-lg shadow-lime/10"
                            >
                                <ShoppingBag size={20} />
                            </button>
                            <button
                                onClick={onOpenWardrobe}
                                className="p-2 text-purple-400 hover:text-white rounded-full bg-purple-400/10 border border-purple-400/20 active:scale-95 transition-all shadow-lg shadow-purple-400/10"
                            >
                                <LayoutGrid size={20} />
                            </button>
                        </>
                    )}
                    <button
                        onClick={onOpenSettings}
                        className="p-2 text-gray-400 hover:text-white rounded-full bg-gray-900 border border-gray-800 active:scale-95 transition-all"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center mb-8 shrink-0">
                <div className="relative mb-4 group">
                    <div className={`p-1 rounded-full transition-all ${user.active_cosmetic_frame
                        ? COSMETIC_ITEMS.find(i => i.id === user.active_cosmetic_frame)?.previewValue
                        : 'border-4 border-gray-900'
                    }`}>
                        <img
                            src={user.profile_image_url}
                            alt={user.name}
                            className="w-28 h-28 rounded-full shadow-xl object-cover bg-gray-800 transition-opacity group-hover:opacity-80"
                        />
                    </div>
                    <div className="absolute bottom-1 right-1 p-1.5 bg-lime rounded-full text-oled border-2 border-oled shadow-lg">
                        <Activity size={16} />
                    </div>
                    <button
                        onClick={onEditImage}
                        className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                        <Camera className="text-white mb-1" size={24} />
                        <span className="text-[10px] font-semibold text-white">Edit</span>
                    </button>
                </div>
                <div className="text-center">
                    <h3 className={`text-2xl font-black flex items-center justify-center gap-2 ${user.active_cosmetic_color || 'text-white'}`}>
                        {user.name}
                        {user.verification_status === 'verified' && <Award size={18} className="text-lime" />}
                    </h3>
                    <p className="text-lime font-bold text-sm uppercase tracking-widest mt-1">
                        Rank: {rank.name}
                    </p>
                </div>
                <p className="text-gray-400 mt-1 flex items-center gap-1">
                    {user.home_gym_name || 'No gym set'}
                </p>
            </div>

            <div className="px-2 pb-6 space-y-4 shrink-0">
                <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your User ID</h4>
                            <p className="text-[10px] text-gray-600">Unique database identifier</p>
                        </div>
                        <button
                            onClick={() => {
                                if (user?.id) {
                                    navigator.clipboard.writeText(user.id);
                                    alert('User ID copied to clipboard!');
                                }
                            }}
                            className="px-3 py-1.5 bg-lime text-oled text-[10px] font-bold rounded-lg active:scale-95 transition-all shadow-lg shadow-lime/20"
                        >
                            Copy ID
                        </button>
                    </div>
                    <div className="bg-oled/60 rounded-xl p-3 border border-gray-800/50">
                        <code className="text-[10px] text-lime font-mono break-all opacity-80">{user?.id}</code>
                    </div>
                </div>

                <div className="flex items-center justify-between px-2 pt-1">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-lime animate-pulse' : 'bg-orange-500'}`} />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {isSupabaseConfigured ? 'Live Database Active' : 'Offline Mode'}
                        </span>
                    </div>
                    <span className="text-[10px] text-gray-700 font-mono">v1.2.5-stable</span>
                </div>
            </div>
        </>
    );
};

export default ProfileHeader;
