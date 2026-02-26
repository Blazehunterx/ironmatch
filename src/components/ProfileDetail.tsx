import { User, ALL_TIME_BLOCKS } from '../types/database';
import { mockGyms } from '../lib/mock';
import {
    X, Dumbbell, MapPin, Zap, GraduationCap, Flame,
    Award, CalendarDays, Target, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileDetailProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onRequest: (user: User) => void;
}

const goalEmoji: Record<string, string> = {
    'Workout Buddy': '🤝', 'Socialize': '💬', 'Get Pushed': '🔥', 'Learn': '📚',
    'Train for Competition': '🏋️', 'Lose Weight': '💪', 'Recovery Partner': '🧘', 'Cardio Partner': '🏃',
};

export default function ProfileDetail({ user, isOpen, onClose, onRequest }: ProfileDetailProps) {
    if (!user) return null;
    const gym = mockGyms.find(g => g.id === user.home_gym);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/85 backdrop-blur-md z-50"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-oled rounded-t-3xl max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header Image */}
                        <div className="relative h-56">
                            <img
                                src={user.profile_image_url}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-oled via-oled/40 to-transparent" />

                            {/* Close */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors"
                            >
                                <X size={20} />
                            </button>

                            {/* Trainer Badge */}
                            {user.is_trainer && (
                                <div className="absolute top-4 left-4 bg-lime text-oled text-xs font-black px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-lg">
                                    <GraduationCap size={14} /> PERSONAL TRAINER
                                </div>
                            )}

                            {/* Name at bottom of image */}
                            <div className="absolute bottom-4 left-5 right-5">
                                <h2 className="text-2xl font-extrabold text-white">{user.name}</h2>
                                {gym && (
                                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                                        <MapPin size={12} /> {gym.name} · {gym.location}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-5 pb-8 space-y-5 pt-2">
                            {/* Stats Row */}
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

                            {/* Bio */}
                            {user.bio && (
                                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <MessageSquare size={12} /> About
                                    </h4>
                                    <p className="text-sm text-gray-300 leading-relaxed">{user.bio}</p>
                                </div>
                            )}

                            {/* Goals */}
                            {user.goals && user.goals.length > 0 && (
                                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                                        <Target size={12} /> Goals
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {user.goals.map(g => (
                                            <span key={g} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-lime/10 text-lime border border-lime/20">
                                                {goalEmoji[g]} {g}
                                            </span>
                                        ))}
                                    </div>
                                    {user.sub_goals && user.sub_goals.length > 0 && (
                                        <p className="text-xs text-gray-500 mt-3">
                                            Focus areas: <span className="text-gray-400">{user.sub_goals.join(' · ')}</span>
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Availability */}
                            {user.availability && user.availability.length > 0 && (
                                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                                        <CalendarDays size={12} /> Availability
                                    </h4>
                                    <div className="space-y-1.5">
                                        {user.availability.map(slot => (
                                            <div key={slot.day} className="flex items-center gap-3">
                                                <span className="w-8 text-xs font-bold text-white">{slot.day}</span>
                                                <div className="flex gap-1">
                                                    {ALL_TIME_BLOCKS.map(block => (
                                                        <span
                                                            key={block}
                                                            className={`text-[9px] font-semibold px-2 py-0.5 rounded ${slot.blocks.includes(block)
                                                                ? 'bg-lime/15 text-lime border border-lime/25'
                                                                : 'bg-gray-800/50 text-gray-700 border border-gray-800'
                                                                }`}
                                                        >
                                                            {block}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            <button
                                onClick={() => { onClose(); onRequest(user); }}
                                className="w-full py-4 rounded-xl bg-lime text-oled font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-lime/90 active:scale-[0.98] transition-all shadow-[0_0_30px_-5px_rgba(50,255,50,0.3)]"
                            >
                                <Dumbbell size={18} /> Request Workout with {user.name.split(' ')[0]}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
