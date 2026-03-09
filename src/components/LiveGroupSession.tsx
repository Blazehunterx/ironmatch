import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, Clock, Check, Heart, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { GroupSession, SessionParticipant, WorkoutPlan } from '../types/database';

interface LiveGroupSessionProps {
    session: GroupSession;
    plan: WorkoutPlan;
    userId: string;
    onClose: () => void;
}

export default function LiveGroupSession({ session, plan, userId, onClose }: LiveGroupSessionProps) {
    const [participants, setParticipants] = useState<SessionParticipant[]>([]);
    const [stats, setStats] = useState<Record<string, number>>({});
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        // Timer
        const timer = setInterval(() => setElapsed(prev => prev + 1), 1000);

        // Fetch participants
        async function fetchParticipants() {
            const { data } = await supabase
                .from('session_participants')
                .select('*, profiles:profiles!session_participants_user_id_fkey(name, profile_image_url)')
                .eq('session_id', session.id);
            if (data) setParticipants(data);
        }

        fetchParticipants();

        // Subscribe to participants & activity_logs
        const channel = supabase.channel(`group-session-${session.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'session_participants',
                filter: `session_id=eq.${session.id}`
            }, () => fetchParticipants())
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'activity_logs',
                filter: `metadata->>session_id=eq.${session.id}`
            }, (payload) => {
                const { user_id, value } = payload.new;
                setStats(prev => ({
                    ...prev,
                    [user_id]: (prev[user_id] || 0) + value
                }));
            })
            .subscribe();

        return () => {
            clearInterval(timer);
            supabase.removeChannel(channel);
        };
    }, [session.id]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const sortedParticipants = [...participants].sort((a, b) =>
        (stats[b.user_id] || 0) - (stats[a.user_id] || 0)
    );

    return (
        <div className="flex flex-col h-full bg-oled text-white">
            {/* Header */}
            <div className="p-6 bg-purple-600/10 border-b border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Live Group Session</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
                        <Clock size={12} className="text-gray-500" />
                        <span className="text-[10px] font-bold text-white tabular-nums">{formatTime(elapsed)}</span>
                    </div>
                </div>
                <h2 className="text-xl font-black text-white">{session.title}</h2>
                <p className="text-xs text-gray-500 mt-1">{plan.name} • {plan.target}</p>
            </div>

            {/* Leaderboard */}
            <div className="flex-1 overflow-hidden flex flex-col p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Trophy size={12} /> Leaderboard
                    </h3>
                    <span className="text-[10px] font-bold text-purple-400">{participants.length} PARTICIPANTS</span>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {sortedParticipants.map((p, i) => (
                        <motion.div
                            key={p.user_id}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${p.user_id === userId
                                ? 'bg-purple-500/10 border-purple-500/30 ring-1 ring-purple-500/20'
                                : 'bg-gray-900 border-gray-800'
                                }`}
                        >
                            <div className="relative">
                                <img src={p.profiles?.profile_image_url} alt="" className="w-10 h-10 rounded-xl object-cover border border-gray-800 shadow-xl" />
                                {i < 3 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-oled rounded-full flex items-center justify-center border-2 border-oled">
                                        <Trophy size={10} className="fill-current" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-white uppercase tracking-wider">{p.profiles?.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (stats[p.user_id] || 0) / 100)}%` }}
                                            className="h-full bg-purple-500"
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-white tabular-nums">{(stats[p.user_id] || 0).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="p-2 bg-gray-800 rounded-lg text-lime">
                                <Zap size={14} className="fill-current" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Session Actions (Encouragement) */}
                <div className="mt-6 flex gap-2">
                    <button className="flex-1 py-3.5 rounded-2xl bg-gray-900 border border-gray-800 text-gray-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95">
                        <Heart size={14} className="text-red-500" /> Cheer Group
                    </button>
                    <button className="flex-1 py-3.5 rounded-2xl bg-gray-900 border border-gray-800 text-gray-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95">
                        <MessageSquare size={14} className="text-blue-400" /> Chat
                    </button>
                </div>
            </div>

            {/* Bottom Panel */}
            <div className="p-6 bg-gray-900/50 border-t border-gray-800">
                <button
                    onClick={onClose}
                    className="w-full py-4 rounded-2xl bg-white text-oled font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-95 transition-all shadow-xl"
                >
                    <Check size={18} /> COMPLETE SESSION
                </button>
            </div>
        </div>
    );
}
