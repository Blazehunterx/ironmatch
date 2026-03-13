import { useEffect } from 'react';
import { User } from '../types/database';
import { useGyms } from '../context/GymContext';
import { Dumbbell, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFriends } from '../context/FriendsContext';

// Modular Components
import ProfileDetailHeader from './profile/ProfileDetailHeader';
import ProfileDetailStats from './profile/ProfileDetailStats';
import ProfileDetailContent from './profile/ProfileDetailContent';
import FollowAction from './profile/FollowAction';
import FriendButton from './profile/FriendButton';

interface ProfileDetailProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onRequest: (user: User) => void;
}

export default function ProfileDetail({ user, isOpen, onClose, onRequest }: ProfileDetailProps) {
    const { findGym } = useGyms();
    const { getFriendStatus } = useFriends();

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
                            <ProfileDetailHeader 
                                user={user} 
                                gym={gym} 
                                onClose={onClose} 
                            />

                            <div className="px-5 space-y-6 mt-6">
                                <ProfileDetailStats 
                                    user={user} 
                                    gym={gym} 
                                />
                                
                                <ProfileDetailContent user={user} />
                            </div>
                        </div>

                        {/* Action Buttons - Fixed at bottom of sheet */}
                        <div className="p-6 bg-oled border-t border-gray-900 flex gap-4 shadow-[0_-20px_40px_rgba(0,0,0,0.8)] pb-safe-offset-4 z-30">
                            <FollowAction targetUserId={user.id} />
                            <FriendButton userId={user.id} />
                            {getFriendStatus(user.id) === 'friends' ? (
                                <button
                                    onClick={() => { onClose(); onRequest(user); }}
                                    className="flex-1 py-4.5 rounded-2xl bg-lime text-oled font-black text-sm flex items-center justify-center gap-2 hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_-5px_rgba(50,255,50,0.4)]"
                                >
                                    <Dumbbell size={18} /> Workout
                                </button>
                            ) : (
                                <div className="flex-1 py-4.5 rounded-2xl bg-gray-900/40 border border-gray-800/40 text-gray-500 font-bold text-xs flex items-center justify-center gap-2 uppercase tracking-widest cursor-default">
                                    <Users size={16} className="opacity-50" /> Buddies
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
