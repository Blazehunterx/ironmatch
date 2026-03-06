import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockUsers } from '../lib/mock';
import { useAuth } from '../context/AuthContext';
import { useConversations } from '../context/ConversationContext';
import { Check, X, Dumbbell, Bell, MessageSquare, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { User } from '../types/database';

interface Notification {
    id: string;
    type: 'workout_request' | 'request_accepted' | 'duel_challenge' | 'quest_complete';
    from: User;
    message?: string;
    time: string;
    handled: boolean;
}

export default function Notifications() {
    const { user } = useAuth();
    const { addConversation } = useConversations();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState<Notification[]>(() => {
        const others = mockUsers.filter(u => u.id !== user?.id);
        return [
            {
                id: 'n1',
                type: 'workout_request' as const,
                from: others[0],
                message: `Hey, want to hit legs together at 6 PM?`,
                time: '2 min ago',
                handled: false
            },
            {
                id: 'n2',
                type: 'workout_request' as const,
                from: others[2],
                message: `Looking for a spotter for bench. Are you free tomorrow?`,
                time: '1 hour ago',
                handled: false
            },
            {
                id: 'n3',
                type: 'duel_challenge' as const,
                from: others[1],
                message: 'Challenged you to a Pull-up Duel! 💪',
                time: '3 hours ago',
                handled: false
            },
            {
                id: 'n4',
                type: 'request_accepted' as const,
                from: others[1],
                time: 'Yesterday',
                handled: true
            },
        ].filter(n => n.from);
    });

    const handleAccept = (id: string) => {
        const notif = notifications.find(n => n.id === id);
        if (notif) {
            addConversation(notif.from, true);
        }
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, handled: true, type: 'request_accepted' as const } : n));
    };

    const handleDecline = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleGoToChat = () => {
        navigate('/messages');
    };

    const pending = notifications.filter(n => !n.handled && (n.type === 'workout_request' || n.type === 'duel_challenge'));
    const past = notifications.filter(n => n.type === 'request_accepted' || n.handled);

    return (
        <div className="flex flex-col min-h-screen px-4 py-6 pb-24">
            <h2 className="text-3xl font-bold text-white mb-6">Notifications</h2>

            {notifications.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 px-6 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-20 h-20 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mb-6"
                    >
                        <Bell size={32} className="text-gray-700" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">Inbox Zero! ⚡</h3>
                    <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                        No new alerts yet. Why not find a training partner or challenge someone in the Arena?
                    </p>

                    <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
                        <button
                            onClick={() => navigate('/search')}
                            className="flex items-center justify-between p-4 rounded-2xl bg-gray-900 border border-gray-800 hover:border-lime/50 transition-all group active:scale-95"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-lime/10 rounded-lg">
                                    <MessageSquare size={18} className="text-lime" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white">Find Partners</p>
                                    <p className="text-[10px] text-gray-600">Match with local lifters</p>
                                </div>
                            </div>
                            <ArrowRight size={16} className="text-gray-700 group-hover:text-lime transition-colors" />
                        </button>

                        <button
                            onClick={() => navigate('/arena')}
                            className="flex items-center justify-between p-4 rounded-2xl bg-gray-900 border border-gray-800 hover:border-orange-500/50 transition-all group active:scale-95"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/10 rounded-lg">
                                    <Zap size={18} className="text-orange-500" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white">Enter Arena</p>
                                    <p className="text-[10px] text-gray-600">Start a FairDuel challenge</p>
                                </div>
                            </div>
                            <ArrowRight size={16} className="text-gray-700 group-hover:text-orange-500 transition-colors" />
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {pending.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Pending Requests</h3>
                            <div className="space-y-3">
                                {pending.map((notif, idx) => (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.07 }}
                                        className="bg-gray-900 border border-gray-800 rounded-2xl p-4"
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <img src={notif.from.profile_image_url} alt={notif.from.name} className="w-12 h-12 rounded-full border border-gray-700 object-cover shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-white text-sm">{notif.from.name}</h4>
                                                    <span className="text-[10px] text-gray-600 shrink-0">{notif.time}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    {notif.type === 'duel_challenge' ? (
                                                        <>
                                                            <span className="text-[10px]">⚔️</span>
                                                            <span className="text-[10px] text-orange-400 font-semibold">Duel Challenge</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Dumbbell size={11} className="text-lime" />
                                                            <span className="text-[10px] text-lime font-semibold">Workout Request</span>
                                                        </>
                                                    )}
                                                </div>
                                                {notif.message && (
                                                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">"{notif.message}"</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDecline(notif.id)}
                                                className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-400 text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-700 active:scale-[0.98] transition-all"
                                            >
                                                <X size={14} /> Decline
                                            </button>
                                            <button
                                                onClick={() => handleAccept(notif.id)}
                                                className="flex-[2] py-2.5 rounded-xl bg-lime text-oled text-xs font-bold flex items-center justify-center gap-1 hover:bg-lime/90 active:scale-[0.98] transition-all"
                                            >
                                                <Check size={14} /> Accept
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {past.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Earlier</h3>
                            <div className="space-y-2">
                                {past.map((notif, idx) => (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => handleGoToChat()}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-900/50 cursor-pointer transition-colors"
                                    >
                                        <img src={notif.from.profile_image_url} alt={notif.from.name} className="w-10 h-10 rounded-full border border-gray-800 object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-400">
                                                <span className="text-white font-semibold">{notif.from.name}</span> accepted your workout request
                                            </p>
                                            <span className="text-[10px] text-gray-600">{notif.time}</span>
                                        </div>
                                        <MessageSquare size={16} className="text-lime shrink-0" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

const ArrowRight = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);
