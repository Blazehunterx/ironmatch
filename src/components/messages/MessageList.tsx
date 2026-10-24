import { motion } from 'framer-motion';
import { MessageSquare, ChevronRight, Zap, Users } from 'lucide-react';
import { User } from '../../types/database';

interface MessageListProps {
    filtered: any[];
    onChatSelect: (userId: string) => void;
    suggestedUsers?: User[];
    onQuickConnect?: (targetUser: User, initialMessage: string) => void;
}

const ICEBREAKERS = [
    'Need a spot on Bench today? 💪',
    'Want to run a Ranked Duel this week? ⚡',
    'Down to hit a heavy session soon?'
];

export default function MessageList({
    filtered,
    onChatSelect,
    suggestedUsers = [],
    onQuickConnect
}: MessageListProps) {
    if (filtered.length === 0) {
        return (
            <div className="space-y-5 py-4">
                <div className="p-6 rounded-3xl bg-[#0D0D0D] border border-white/10 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-lime/10 border border-lime/30 flex items-center justify-center mx-auto text-lime">
                        <MessageSquare size={20} />
                    </div>
                    <h3 className="text-sm font-black uppercase text-white tracking-wider">No Active Threads Yet</h3>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto">
                        Tap a lifter on your floor below to send a 1-click spotter request or training invite.
                    </p>
                </div>

                {suggestedUsers.length > 0 && onQuickConnect && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-lime flex items-center gap-1.5">
                                <Users size={12} /> Active Lifters & Spotters Near You
                            </span>
                            <span className="text-[10px] font-mono text-gray-500">1-Tap Icebreakers</span>
                        </div>

                        {suggestedUsers.slice(0, 4).map((u, idx) => {
                            const icebreaker = ICEBREAKERS[idx % ICEBREAKERS.length];
                            const rawSbd = u.big4 ? ((u.big4.bench || 0) + (u.big4.squat || 0) + (u.big4.deadlift || 0)) : 320;
                            const totalKg = (u.unit_preference === 'lbs' || rawSbd > 850) ? Math.round(rawSbd / 2.20462) : rawSbd;

                            return (
                                <div
                                    key={u.id}
                                    className="p-3.5 rounded-2xl bg-[#0D0D0D] border border-white/10 hover:border-lime/30 transition space-y-3"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={u.profile_image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`}
                                                alt={u.name}
                                                className="w-11 h-11 rounded-xl object-cover bg-gray-900 border border-white/10 shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <h4 className="text-xs font-black text-white truncate">{u.name}</h4>
                                                    {u.is_trainer && (
                                                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-lime/20 text-lime">
                                                            Coach
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-mono truncate">
                                                    {u.discipline || 'Strength'} · {totalKg}kg SBD
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => onQuickConnect(u, icebreaker)}
                                            className="px-3 py-1.5 rounded-xl bg-lime text-black text-[10px] font-black uppercase tracking-wider shrink-0 hover:bg-lime/90 active:scale-95 transition flex items-center gap-1"
                                        >
                                            <Zap size={11} /> Connect
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => onQuickConnect(u, icebreaker)}
                                        className="w-full py-2 px-3 rounded-xl bg-black/60 hover:bg-white/[0.04] border border-white/5 text-left text-[11px] text-gray-300 hover:text-lime transition flex items-center justify-between"
                                    >
                                        <span className="truncate">"{icebreaker}"</span>
                                        <span className="text-[9px] font-black uppercase text-lime shrink-0 ml-2">Send →</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {filtered.map((chat, idx) => (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    key={chat.user.id}
                    onClick={() => onChatSelect(chat.user.id)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-900 transition-colors cursor-pointer active:scale-[0.99]"
                >
                    <div className="relative shrink-0">
                        <img
                            src={chat.user.profile_image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(chat.user.name || 'IL')}`}
                            alt={chat.user.name}
                            className="w-14 h-14 rounded-full border border-gray-800 bg-gray-800 object-cover"
                        />
                        {chat.unread && (
                            <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-lime rounded-full border-2 border-oled"></div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                            <h4 className={`text-base font-semibold truncate ${chat.unread ? 'text-white' : 'text-gray-200'}`}>
                                {chat.user.name}
                            </h4>
                            <span className="text-[10px] text-gray-500 shrink-0 ml-2">{chat.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {!chat.accepted && (
                                <span className="text-[9px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-bold shrink-0">PENDING</span>
                            )}
                            <p className={`text-sm truncate ${chat.unread ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>
                                {chat.lastMessage}
                            </p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-700 shrink-0" />
                </motion.div>
            ))}
        </div>
    );
}
