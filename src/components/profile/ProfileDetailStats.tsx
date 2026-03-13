import { Zap, Flame, Award } from 'lucide-react';
import { User, Gym } from '../../types/database';

interface ProfileDetailStatsProps {
    user: User;
    gym: Gym | undefined;
}

export default function ProfileDetailStats({ user, gym }: ProfileDetailStatsProps) {
    return (
        <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
                <Zap size={18} className="text-lime mx-auto mb-1" />
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Level</div>
                <div className="font-bold text-white text-sm">{user.fitness_level}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
                <Flame size={18} className="text-orange-500 mx-auto mb-1" />
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Streak</div>
                <div className="font-bold text-white text-sm">{user.reliability_streak} wks</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
                <Award size={18} className="text-purple-400 mx-auto mb-1" />
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Gym</div>
                <div className="font-bold text-white text-sm truncate">{gym?.name}</div>
            </div>
        </div>
    );
}
