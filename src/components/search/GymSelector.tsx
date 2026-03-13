import { MapPin, Users, ChevronDown, Trophy, ShieldAlert, Zap, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { User, Gym } from '../../types/database';

interface GymSelectorProps {
    currentUser: User | null;
    gym: Gym | undefined;
    selectedGym: string;
    showGymPicker: boolean;
    setShowGymPicker: (show: boolean) => void;
    handleJoinGym: (id: string) => void;
    isJoining: boolean;
    viewMode: 'shouts' | 'posts';
    setViewMode: (mode: 'shouts' | 'posts') => void;
    onClaimGym: () => void;
    onStartWar: () => void;
}

export default function GymSelector({
    currentUser, gym, selectedGym, showGymPicker, setShowGymPicker,
    handleJoinGym, isJoining, viewMode, setViewMode, onClaimGym, onStartWar
}: GymSelectorProps) {
    const isHomeGym = currentUser?.home_gym === selectedGym;

    return (
        <div className="px-6 mb-6">
            {!currentUser?.home_gym ? (
                <div className="mb-6 p-6 rounded-[32px] bg-gradient-to-br from-lime to-lime-600 border border-white/20 shadow-2xl shadow-lime/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">Join a Squad</h3>
                        <p className="text-black/70 text-xs font-bold leading-tight mb-4">You haven't joined a gym yet. Select a community to track progress and join Gym Wars.</p>
                        <button
                            onClick={() => setShowGymPicker(true)}
                            className="bg-black text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl"
                        >
                            Find My Gym
                        </button>
                    </div>
                    <MapPin size={120} className="absolute -right-8 -bottom-8 text-black/10 rotate-12" />
                </div>
            ) : (
                <button
                    onClick={() => setShowGymPicker(!showGymPicker)}
                    className="flex items-center gap-3 bg-gray-900 border border-white/5 rounded-[24px] px-5 py-4 hover:border-lime/30 transition-all w-full group shadow-lg"
                >
                    <div className="p-2 bg-lime/10 rounded-xl group-hover:bg-lime/20 transition-colors">
                        <MapPin size={18} className="text-lime" />
                    </div>
                    <div className="flex-1 text-left">
                        <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{gym?.location || 'Nearby'}</h4>
                        <span className="text-sm font-black text-white truncate max-w-[200px] block">{gym?.name || 'Select a Gym'}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1 shrink-0">
                            <Users size={12} /> {gym?.member_count}
                        </span>
                        <ChevronDown size={14} className={`text-gray-500 transition-transform ${showGymPicker ? 'rotate-180' : ''}`} />
                    </div>
                </button>
            )}

            {gym && !gym.owner_id && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-4 rounded-2xl bg-lime/10 border border-lime/20 flex flex-col gap-3"
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-lime/20 rounded-lg shrink-0">
                            <Trophy className="text-lime" size={20} />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Unclaimed Community</h4>
                            <p className="text-[10px] text-gray-400 mt-1">Claim this gym to create events, send free passes, and lead your squad to victory in Gym Wars!</p>
                        </div>
                    </div>
                    <button
                        onClick={onClaimGym}
                        className="w-full py-2.5 bg-lime text-oled rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                    >
                        Claim this Kingdom
                    </button>
                </motion.div>
            )}

            {gym && gym.owner_id === currentUser?.id && gym.is_verified_gym && (
                <div className="mt-3 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ShieldAlert size={16} className="text-blue-400" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Owner Controls</span>
                        </div>
                        <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-black">VERIFIED</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button className="py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-[10px] font-bold text-white hover:border-blue-500/50 transition-all flex items-center justify-center gap-2">
                            <Zap size={14} className="text-blue-400" /> Free Passes
                        </button>
                        <button
                            onClick={onStartWar}
                            className="py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-[10px] font-bold text-white hover:border-red-500/50 transition-all flex items-center justify-center gap-2"
                        >
                            <Trophy size={14} className="text-red-400" /> Start 1v1 War
                        </button>
                    </div>
                </div>
            )}

            {gym && selectedByMeOrOthers(selectedGym) && (
                <div className="mt-4">
                    {!isHomeGym ? (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => handleJoinGym(selectedGym)}
                            disabled={isJoining}
                            className="w-full py-4 bg-lime text-black rounded-[20px] text-xs font-black uppercase tracking-widest shadow-xl shadow-lime/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            {isJoining ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} className="fill-current" />}
                            Join This Community
                        </motion.button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('shouts')}
                                className={`flex-1 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'shouts'
                                    ? 'bg-lime text-black shadow-lg shadow-lime/10'
                                    : 'bg-gray-900 text-gray-400 border border-white/5'}`}
                            >
                                Shouts
                            </button>
                            <button
                                onClick={() => setViewMode('posts')}
                                className={`flex-1 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'posts'
                                    ? 'bg-lime text-black shadow-lg shadow-lime/10'
                                    : 'bg-gray-900 text-gray-400 border border-white/5'}`}
                            >
                                Feed
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function selectedByMeOrOthers(selectedGym: string) {
    return !!selectedGym;
}
