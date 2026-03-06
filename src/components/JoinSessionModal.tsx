import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, X, Info, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface JoinSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onJoined: (session: any) => void;
}

export default function JoinSessionModal({ isOpen, onClose, userId, onJoined }: JoinSessionModalProps) {
    const [joinCode, setJoinCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleJoin = async () => {
        if (!joinCode.trim()) return;
        setIsLoading(true);
        setError(null);

        // 1. Find session by code
        const { data: session, error: sessionError } = await supabase
            .from('group_sessions')
            .select('*')
            .eq('join_code', joinCode.toUpperCase())
            .eq('status', 'active')
            .single();

        if (sessionError || !session) {
            setError('Invalid or expired join code.');
            setIsLoading(false);
            return;
        }

        // 2. Join session
        const { error: joinError } = await supabase
            .from('session_participants')
            .insert({
                session_id: session.id,
                user_id: userId
            });

        if (joinError && joinError.code !== '23505') { // Ignore duplicate join
            console.error('Error joining session:', joinError);
            setError('Failed to join session. Try again.');
            setIsLoading(false);
        } else {
            onJoined(session);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-oled border border-gray-800 w-full max-w-sm rounded-3xl overflow-hidden z-10 relative shadow-2xl"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-lime/20 rounded-xl text-lime">
                                <Zap size={20} />
                            </div>
                            <h2 className="text-xl font-black text-white">Join Session</h2>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Enter Session Code</label>
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="E.G. AB12CD"
                                maxLength={6}
                                className="w-full bg-gray-900 border border-gray-800 text-white rounded-2xl py-4 px-4 text-center text-2xl font-black tracking-[0.2em] focus:outline-none focus:border-lime transition-all uppercase font-mono"
                            />
                            {error && <p className="text-[10px] text-red-500 font-bold mt-2 text-center uppercase tracking-wider">{error}</p>}
                        </div>

                        <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 flex items-start gap-3">
                            <Info size={16} className="text-lime shrink-0 mt-0.5" />
                            <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                                Group sessions are hosted by verified trainers. You'll join a live leaderboard and track your workout alongside others.
                            </p>
                        </div>

                        <button
                            onClick={handleJoin}
                            disabled={joinCode.length < 4 || isLoading}
                            className="w-full py-4 rounded-2xl bg-lime text-oled font-black text-sm flex items-center justify-center gap-2 hover:bg-lime/90 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-lime/20"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-oled/30 border-t-oled rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Users size={18} className="fill-current" /> JOIN COMMUNITY
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
