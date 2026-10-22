import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Crown, Flame } from 'lucide-react';
import { User, GymMilestone } from '../../types/database';
import { GymWarEntry } from '../../lib/gamification';
import CollectiveMilestones from '../CollectiveMilestones';

interface GymLeaderboardProps {
    gymWars: GymWarEntry[];
    user: User | null;
    milestones: GymMilestone[];
}

const GymLeaderboard: React.FC<GymLeaderboardProps> = ({ gymWars, user, milestones }) => {
    const userGym = gymWars.find(g => g.gymId === user?.home_gym);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-black text-white text-xs uppercase tracking-wider flex items-center gap-2">
                    <Shield size={15} className="text-lime" /> Weekly Gym Wars Leaderboard
                </h3>
                <span className="text-[9px] bg-lime/10 text-lime border border-lime/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                    Resets Mon
                </span>
            </div>
            {gymWars.map((gym, idx) => {
                const isMyGym = gym.gymId === user?.home_gym;
                const isChampion = idx === 0;
                return (
                    <motion.div key={gym.gymId} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                            isChampion
                                ? 'bg-[#0D0D0D] border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.12)]'
                                : isMyGym 
                                    ? 'bg-[#0D0D0D] border-lime/50 shadow-[0_0_15px_rgba(50,255,50,0.1)]' 
                                    : 'bg-[#0D0D0D] border-white/5'
                        }`}
                    >
                        <div className="text-xl w-7 text-center shrink-0">
                            {idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : <span className="text-xs font-black text-gray-500 font-mono">#{gym.rank}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <h4 className={`font-black text-sm truncate ${isChampion ? 'text-amber-300' : isMyGym ? 'text-lime' : 'text-white'}`}>{gym.gymName}</h4>
                                {isMyGym && <span className="text-[8px] bg-lime/20 text-lime px-1.5 py-0.2 rounded font-black shrink-0">YOU</span>}
                            </div>
                            <p className="text-[10px] text-gray-400 truncate">{gym.location} · {gym.memberCount} members</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-sm font-black text-white">{gym.totalWorkouts.toLocaleString()}</p>
                            <p className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">lifts</p>
                        </div>
                        {isChampion ? (
                            <div className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 shrink-0">
                                <Crown size={12} className="text-amber-400 fill-current" />
                                <span className="text-[8px] font-black text-amber-300 uppercase">#1 CHAMP</span>
                            </div>
                        ) : gym.king && idx < 3 ? (
                            <div className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl bg-white/5 border border-white/10 shrink-0">
                                <span className="text-[8px] font-mono font-bold text-gray-400 uppercase">MVP</span>
                                <span className="text-[8px] font-black text-gray-300 uppercase truncate max-w-[45px]">{gym.king.name.split(' ')[0]}</span>
                            </div>
                        ) : null}
                        <div className="flex items-center gap-0.5 text-orange-400 shrink-0">
                            <Flame size={11} /><span className="text-[10px] font-black">{gym.streak}d</span>
                        </div>
                    </motion.div>
                );
            })}
            {userGym && (
                <div className="mt-4 bg-[#0D0D0D] border border-lime/30 rounded-2xl p-4 text-center shadow-lg">
                    <p className="text-xs text-gray-400 mb-0.5 uppercase tracking-wider font-bold">Your gym standing</p>
                    <p className="text-3xl font-black text-white">#{userGym.rank}</p>
                    <p className="text-xs text-gray-400 mt-1">Every rep logged earns points for <span className="text-lime font-black">{userGym.gymName}</span></p>
                </div>
            )}

            {/* Collective Milestones Section */}
            <div className="mt-6 pt-6 border-t border-gray-800">
                <CollectiveMilestones milestones={milestones} />
            </div>
        </motion.div>
    );
};

export default GymLeaderboard;
