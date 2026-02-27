import { useEffect } from 'react';
import { User } from '../types/database';
import { useGyms } from '../context/GymContext';
import {
    X, Dumbbell, MapPin, Zap, GraduationCap, Flame,
    Award, CalendarDays, Target, MessageSquare, UserPlus, UserCheck, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFriends } from '../context/FriendsContext';
import { useToast } from '../context/ToastContext';

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
    const { findGym } = useGyms();

    // Background Scroll Lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!user) return null;
    const gym = findGym(user.home_gym);

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
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[999]"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-[1000] bg-oled rounded-t-3xl max-h-[95vh] flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,1)]"
                    >
                        {/* Scrollable Area */}
                        <div className="flex-1 overflow-y-auto pt-2">
                            {/* Header Image */}
                            <div className="relative h-64 shrink-0">
                                <img
                                    src={user.profile_image_url}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-oled via-oled/40 to-transparent" />

                                {/* Close */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors z-10"
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
                                    <h2 className="text-3xl font-black text-white leading-none">{user.name}</h2>
                                    {gym && (
                                        <p className="text-sm text-gray-400 flex items-center gap-1 mt-2">
                                            <MapPin size={12} className="text-lime" /> {gym.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-5 pb-10 space-y-6">
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
                                            <CalendarDays size={12} /> Training Schedule
                                        </h4>
                                        <div className="space-y-3">
                                            {user.availability.map(slot => (
                                                <div key={slot.day} className="flex flex-col gap-1.5">
                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{slot.day}</span>
                                                    <div className="flex gap-1.5 flex-wrap">
                                                        {slot.blocks.map(block => (
                                                            <span
                                                                key={block}
                                                                className="text-[9px] font-bold px-3 py-1 rounded bg-lime/10 text-lime border border-lime/20"
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

                                {/* Strength Stats */}
                                {user.big4 && (
                                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                                            <Trophy size={12} className="text-yellow-500" /> Strength Milestone
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="p-2 bg-oled rounded-lg border border-gray-800">
                                                <span className="text-[8px] text-gray-600 block uppercase">Bench</span>
                                                <span className="text-sm font-black text-white">{user.big4.bench || 0} <span className="text-[8px] text-gray-600">lbs</span></span>
                                            </div>
                                            <div className="p-2 bg-oled rounded-lg border border-gray-800">
                                                <span className="text-[8px] text-gray-600 block uppercase">Squat</span>
                                                <span className="text-sm font-black text-white">{user.big4.squat || 0} <span className="text-[8px] text-gray-600">lbs</span></span>
                                            </div>
                                            <div className="p-2 bg-oled rounded-lg border border-gray-800">
                                                <span className="text-[8px] text-gray-600 block uppercase">Deadlift</span>
                                                <span className="text-sm font-black text-white">{user.big4.deadlift || 0} <span className="text-[8px] text-gray-600">lbs</span></span>
                                            </div>
                                            <div className="p-2 bg-oled rounded-lg border border-gray-800">
                                                <span className="text-[8px] text-gray-600 block uppercase">OHP</span>
                                                <span className="text-sm font-black text-white">{user.big4.ohp || 0} <span className="text-[8px] text-gray-600">lbs</span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Extra Info */}
                                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <GraduationCap size={12} /> Discipline
                                    </h4>
                                    <p className="text-sm text-gray-300">{user.discipline || 'General Fitness'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons - Fixed at bottom of sheet */}
                        <div className="p-6 bg-oled border-t border-gray-900 flex gap-4 shadow-[0_-20px_40px_rgba(0,0,0,0.8)] pb-safe-offset-4 z-30">
                            <FriendButton userId={user.id} />
                            <button
                                onClick={() => { onClose(); onRequest(user); }}
                                className="flex-1 py-4.5 rounded-2xl bg-lime text-oled font-black text-sm flex items-center justify-center gap-2 hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_-5px_rgba(50,255,50,0.4)]"
                            >
                                <Dumbbell size={18} /> Workout
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Friend button sub-component
function FriendButton({ userId }: { userId: string }) {
    const { getFriendStatus, sendFriendRequest, removeFriend } = useFriends();
    const { showToast } = useToast();
    const status = getFriendStatus(userId);

    if (status === 'friends') {
        return (
            <button
                onClick={() => { removeFriend(userId); showToast('Friend removed', 'info'); }}
                className="py-4 px-5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
                <UserCheck size={18} /> Friends
            </button>
        );
    }
    return (
        <button
            onClick={() => { sendFriendRequest(userId); showToast('Friend request sent!'); }}
            className="flex-1 py-4 rounded-2xl bg-blue-500 text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-600 active:scale-[0.98] transition-all shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]"
        >
            <UserPlus size={18} /> Add Friend
        </button>
    );
}
