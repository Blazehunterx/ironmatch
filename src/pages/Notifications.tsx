import { useState } from 'react';
import { mockUsers } from '../lib/mock';
import { useAuth } from '../context/AuthContext';
import { Check, X, Dumbbell, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { User } from '../types/database';

interface Notification {
    id: string;
    type: 'workout_request' | 'request_accepted';
    from: User;
    message?: string;
    time: string;
    handled: boolean;
}

export default function Notifications() {
    const { user } = useAuth();

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
                type: 'request_accepted' as const,
                from: others[1],
                time: 'Yesterday',
                handled: true
            },
        ].filter(n => n.from);
    });

    const handleAccept = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, handled: true, type: 'request_accepted' as const } : n));
    };

    const handleDecline = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const pending = notifications.filter(n => n.type === 'workout_request' && !n.handled);
    const past = notifications.filter(n => n.type === 'request_accepted' || n.handled);

    return (
        <div className="flex flex-col min-h-screen px-4 py-6 pb-24">
            <h2 className="text-3xl font-bold text-white mb-6">Notifications</h2>

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
                                            <Dumbbell size={11} className="text-lime" />
                                            <span className="text-[10px] text-lime font-semibold">Workout Request</span>
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
                                        <Check size={14} /> Accept Workout
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
                                className="flex items-center gap-3 p-3 rounded-xl"
                            >
                                <img src={notif.from.profile_image_url} alt={notif.from.name} className="w-10 h-10 rounded-full border border-gray-800 object-cover" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-400">
                                        <span className="text-white font-semibold">{notif.from.name}</span> accepted your workout request
                                    </p>
                                    <span className="text-[10px] text-gray-600">{notif.time}</span>
                                </div>
                                <Check size={16} className="text-lime shrink-0" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center text-gray-500 py-20 gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
                        <Bell size={24} className="text-gray-600" />
                    </div>
                    <p className="text-center font-medium">No notifications yet.</p>
                    <p className="text-sm">You'll see workout requests here!</p>
                </div>
            )}
        </div>
    );
}
