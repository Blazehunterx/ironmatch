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
            <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Shield size={16} className="text-blue-400" /> Weekly Gym Leaderboard
                </h3>
                <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold">Resets Mon</span>
            </div>
            {gymWars.map((gym, idx) => {
                const isMyGym = gym.gymId === user?.home_gym;
                const medals = ['🥇', '🥈', '🥉'];
                return (
                    <motion.div key={gym.gymId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className={`flex items-center gap-3 p-3 rounded-2xl border ${isMyGym ? 'bg-lime/5 border-lime/30' : 'bg-gray-900 border-gray-800'}`}
                    >
                        <div className="text-2xl w-8 text-center shrink-0">
                            {idx < 3 ? medals[idx] : <span className="text-sm font-bold text-gray-600">#{gym.rank}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <h4 className={`font-bold text-sm truncate ${isMyGym ? 'text-lime' : 'text-white'}`}>{gym.gymName}</h4>
                                {isMyGym && <span className="text-[8px] bg-lime/20 text-lime px-1.5 py-0.5 rounded font-bold shrink-0">YOU</span>}
                            </div>
                            <p className="text-[10px] text-gray-500">{gym.location} · {gym.memberCount} members</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-white">{gym.totalWorkouts}</p>
                            <p className="text-[9px] text-gray-500">workouts</p>
                        </div>
                        {gym.king && (
                            <div className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl bg-yellow-500/10 border border-yellow-500/20 shrink-0">
                                <Crown size={12} className="text-yellow-500 fill-current" />
                                <span className="text-[8px] font-black text-yellow-500 uppercase truncate max-w-[50px]">{gym.king.name.split(' ')[0]}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-0.5 text-orange-400 shrink-0">
                            <Flame size={10} /><span className="text-[10px] font-bold">{gym.streak}d</span>
                        </div>
                    </motion.div>
                );
            })}
            {userGym && (
                <div className="mt-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Your gym is ranked</p>
                    <p className="text-3xl font-black text-white">#{userGym.rank}</p>
                    <p className="text-xs text-gray-500 mt-1">Workouts you log = points for <span className="text-lime font-bold">{userGym.gymName}</span></p>
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
