import { User } from '../types/database';
import { useGyms } from '../context/GymContext';
import { Dumbbell, MapPin, Zap, GraduationCap, Flame, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface GridCardProps {
    user: User;
    index: number;
    onRequest: (user: User) => void;
    onViewProfile: (user: User) => void;
}

const goalEmoji: Record<string, string> = {
    'Workout Buddy': '🤝',
    'Socialize': '💬',
    'Get Pushed': '🔥',
    'Learn': '📚',
    'Train for Competition': '🏋️',
    'Lose Weight': '💪',
    'Recovery Partner': '🧘',
    'Cardio Partner': '🏃',
};

export default function GridCard({ user, index, onRequest, onViewProfile }: GridCardProps) {
    const { findGym } = useGyms();
    const gym = findGym(user.home_gym);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className="group relative bg-gray-900/80 border border-gray-800/80 rounded-2xl overflow-hidden hover:border-lime/30 transition-all duration-300"
        >
            <div
                className="flex gap-4 p-4 cursor-pointer"
                onClick={() => onViewProfile(user)}
            >
                {/* Avatar */}
                <div className="relative shrink-0">
                    <img
                        src={user.profile_image_url}
                        alt={user.name}
                        className="w-20 h-20 rounded-xl object-cover border-2 border-gray-800 group-hover:border-lime/30 transition-colors"
                    />
                    {user.is_trainer && (
                        <div className="absolute -top-1.5 -right-1.5 bg-lime text-oled text-[7px] font-black px-1 py-0.5 rounded flex items-center gap-0.5 shadow-md">
                            <GraduationCap size={8} /> PT
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-white truncate">{user.name}</h3>
                        <ChevronRight size={14} className="text-gray-600 shrink-0" />
                    </div>

                    {/* Meta Row */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-lime/10 text-lime rounded border border-lime/20 flex items-center gap-0.5">
                            <Zap size={9} className="fill-current" /> {user.fitness_level}
                        </span>
                        {gym && (
                            <span className="text-[10px] text-gray-500 flex items-center gap-0.5 truncate">
                                <MapPin size={9} /> {gym.name}
                            </span>
                        )}
                        <span className="text-[10px] text-orange-400 flex items-center gap-0.5 shrink-0">
                            <Flame size={9} /> {user.reliability_streak}
                        </span>
                    </div>

                    {/* Goals */}
                    {user.goals && user.goals.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {user.goals.map(goal => (
                                <span
                                    key={goal}
                                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-gray-800/80 text-gray-400 border border-gray-700/50"
                                >
                                    {goalEmoji[goal]} {goal}
                                </span>
                            ))}
                            {user.sub_goals && user.sub_goals.length > 0 && (
                                <span className="text-[9px] text-gray-600 flex items-center">
                                    · {user.sub_goals.slice(0, 2).join(', ')}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom action bar */}
            <div className="px-4 pb-3 pt-0">
                <button
                    onClick={(e) => { e.stopPropagation(); onRequest(user); }}
                    className="w-full py-2.5 rounded-xl bg-lime/10 border border-lime/30 text-lime text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-lime/20 active:scale-[0.98] transition-all duration-200"
                >
                    <Dumbbell size={14} /> Request Workout
                </button>
            </div>
        </motion.div>
    );
}
