import React from 'react';
import { Flame, Target, Zap } from 'lucide-react';
import { User } from '../../types/database';
import { getBig4Total } from '../../lib/gamification';

interface ProfileStatsProps {
    user: User;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ user }) => {
    return (
        <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-3xl text-center">
                <Flame className="text-orange-500 mx-auto mb-1" size={20} />
                <p className="text-[10px] text-gray-500 uppercase font-bold">Streak</p>
                <p className="text-xl font-black text-white">{user.reliability_streak}d</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-3xl text-center">
                <Target className="text-lime mx-auto mb-1" size={20} />
                <p className="text-[10px] text-gray-500 uppercase font-bold">Total</p>
                <p className="text-xl font-black text-white">
                    {getBig4Total(user.big4 || { bench: 0, squat: 0, deadlift: 0, ohp: 0 })}
                </p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-3xl text-center">
                <Zap className="text-yellow-400 mx-auto mb-1" size={20} />
                <p className="text-[10px] text-gray-500 uppercase font-bold">XP</p>
                <p className="text-xl font-black text-white">{user.xp || 0}</p>
            </div>
        </div>
    );
};

export default ProfileStats;
