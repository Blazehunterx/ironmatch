import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConversations } from '../context/ConversationContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Check, X, Dumbbell, Bell, MessageSquare } from 'lucide-react';
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

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRealNotifications = useCallback(async () => {
        if (!user || !isSupabaseConfigured) {
            setIsLoading(false);
            return;
        }

        try {
            // 1. Fetch pending duels
            const { data: duelsData } = await supabase
                .from('duels')
                .select('*, challenger:profiles!duels_challenger_id_fkey(*)')
                .eq('opponent_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            const duelNotifs: Notification[] = (duelsData || [])
                .filter((d: any) => d.challenger)
                .map((d: any) => ({
                    id: d.id,
                    type: 'duel_challenge',
                    from: d.challenger,
                    message: `Challenged you to a ${d.exercise_name} (${d.target_value}${d.target_unit}) duel!`,
                    time: new Date(d.created_at).toLocaleDateString(),
                    handled: d.status !== 'pending'
                }));

            // 2. Fetch matches / requests if present
            const { data: matchesData } = await supabase
                .from('matches')
                .select('*, requester:profiles!matches_requester_id_fkey(*)')
                .eq('recipient_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            const matchNotifs: Notification[] = (matchesData || [])
                .filter((m: any) => m.requester)
                .map((m: any) => ({
                    id: m.id,
                    type: 'workout_request',
                    from: m.requester,
                    message: m.message || 'Wants to hit a workout together!',
                    time: new Date(m.created_at).toLocaleDateString(),
                    handled: m.status !== 'pending'
                }));

            setNotifications([...duelNotifs, ...matchNotifs]);
        } catch (err) {
            console.warn('Failed to load notifications:', err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchRealNotifications();
    }, [fetchRealNotifications]);

    const handleAccept = async (id: string) => {
        const notif = notifications.find(n => n.id === id);
        if (notif) {
            addConversation(notif.from, true);
        }
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, handled: true, type: 'request_accepted' as const } : n));

        if (isSupabaseConfigured) {
            try {
                await supabase.from('duels').update({ status: 'active' }).eq('id', id);
                await supabase.from('matches').update({ status: 'accepted' }).eq('id', id);
            } catch {}
        }
    };

    const handleDecline = async (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (isSupabaseConfigured) {
            try {
                await supabase.from('duels').update({ status: 'declined' }).eq('id', id);
                await supabase.from('matches').update({ status: 'declined' }).eq('id', id);
            } catch {}
        }
    };

    const handleGoToChat = () => {
        navigate('/messages');
    };

    const unhandled = notifications.filter(n => !n.handled);
    const past = notifications.filter(n => n.handled);

    return (
        <div className="flex flex-col min-h-screen px-4 pt-8 pb-24 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        Activity <span className="text-lime">Alerts</span>
                    </h1>
                    <p className="text-xs text-gray-500 font-medium">Duels, partner requests, & challenges</p>
                </div>
                {unhandled.length > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-lime/10 border border-lime/30 text-lime text-xs font-black">
                        {unhandled.length} new
                    </span>
                )}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin" />
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-gray-900 border border-gray-800 flex items-center justify-center text-lime mb-4 shadow-xl">
                        <Bell size={28} />
                    </div>
                    <h3 className="text-lg font-black text-white italic uppercase mb-1">All Caught Up</h3>
                    <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                        Zero unread notifications. Challenge a lifter in the Arena or log a session to trigger community alerts.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {unhandled.length > 0 && (
                        <div>
                            <h3 className="text-xs font-black text-lime uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-lime animate-pulse" /> Action Required
                            </h3>
                            <div className="space-y-3">
                                {unhandled.map((notif, idx) => (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-xl"
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <img
                                                src={notif.from.profile_image_url || 'https://i.pravatar.cc/100'}
                                                alt={notif.from.name}
                                                className="w-11 h-11 rounded-full border border-gray-700 object-cover shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1">
                                                    <h4 className="font-bold text-white text-sm truncate">{notif.from.name}</h4>
                                                    <span className="text-[10px] text-gray-600 shrink-0 font-mono">{notif.time}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    {notif.type === 'duel_challenge' ? (
                                                        <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">
                                                            ⚔️ Duel Challenge
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-lime font-bold uppercase tracking-wider flex items-center gap-1">
                                                            <Dumbbell size={11} /> Workout Request
                                                        </span>
                                                    )}
                                                </div>
                                                {notif.message && (
                                                    <p className="text-xs text-gray-300 mt-1.5 leading-relaxed bg-black/40 p-2 rounded-xl border border-gray-800">
                                                        "{notif.message}"
                                                    </p>
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
                                                className="flex-[2] py-2.5 rounded-xl bg-lime text-oled text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-lime/90 active:scale-[0.98] transition-all shadow-[0_0_12px_rgba(50,255,50,0.2)]"
                                            >
                                                <Check size={14} /> Accept Challenge
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
                                        className="flex items-center gap-3 p-3 rounded-2xl bg-gray-900/40 border border-gray-800 hover:bg-gray-900 cursor-pointer transition-colors"
                                    >
                                        <img
                                            src={notif.from.profile_image_url || 'https://i.pravatar.cc/100'}
                                            alt={notif.from.name}
                                            className="w-10 h-10 rounded-full border border-gray-800 object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-300">
                                                <span className="text-white font-bold">{notif.from.name}</span> · {notif.message || 'Connected'}
                                            </p>
                                            <span className="text-[10px] text-gray-600 font-mono">{notif.time}</span>
                                        </div>
                                        <MessageSquare size={16} className="text-lime shrink-0" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
