import { useState, useRef, useEffect } from 'react';
import { useShoutbox } from '../hooks/useShoutbox';
import { useAuth } from '../context/AuthContext';
import { Send, Zap, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface GymShoutboxProps {
    gymId: string;
    gymName: string;
}

export default function GymShoutbox({ gymId, gymName }: GymShoutboxProps) {
    const { messages, loading, sendMessage } = useShoutbox(gymId);
    const { user } = useAuth();
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;
        await sendMessage(input);
        setInput('');
    };

    const quickShouts = [
        "Who's at the gym?",
        "PR today! 🔥",
        "Equipment is packed 📦",
        "Just finished! ✅"
    ];

    const sendSpotRequest = async () => {
        const content = "🚨 NEED A SPOT for my next set! Anyone near the benches/racks?";
        await sendMessage(content);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0; // Recent messages are at top in state or bottom in reverse flex?
            // Actually our hook returns messages descending (recent first), 
            // but we might want to render them in a way that feels like a chat.
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-oled/40 backdrop-blur-xl border border-gray-800/50 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-800/50 flex items-center justify-between bg-gray-900/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-lime/10 flex items-center justify-center border border-lime/20">
                        <MessageSquare size={20} className="text-lime" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-tight">Gym Shoutbox</h3>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{gymName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 bg-lime/10 px-2 py-1 rounded-full border border-lime/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                    <span className="text-[10px] font-bold text-lime uppercase">Live</span>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse custom-scrollbar"
            >
                {loading && messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
                        <Loader2 size={24} className="animate-spin text-lime" />
                        <span className="text-xs font-bold uppercase tracking-widest">Loading Shoutbox...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                        <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mb-4 border border-gray-800">
                            <Zap size={24} className="text-gray-700" />
                        </div>
                        <p className="text-sm font-bold text-gray-400">Silence is Golden...</p>
                        <p className="text-[11px] text-gray-600 mt-1">Be the first to shout and break the ice at {gymName}!</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                layout
                                initial={{ opacity: 0, x: -10, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`flex items-start gap-3 group ${msg.user_id === user?.id ? 'flex-row-reverse' : ''}`}
                            >
                                <div className="shrink-0 relative">
                                    <img
                                        src={msg.user_avatar || 'https://i.pravatar.cc/100'}
                                        className="w-9 h-9 rounded-xl border border-gray-800 object-cover shadow-lg"
                                        alt={msg.user_name}
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-900 rounded-lg flex items-center justify-center border border-gray-800">
                                        <div className="w-1.5 h-1.5 rounded-full bg-lime/50" />
                                    </div>
                                </div>
                                <div className={`flex flex-col max-w-[75%] ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[11px] font-black text-white/90">{msg.user_name}</span>
                                        <span className="text-[9px] text-gray-500 font-bold uppercase">
                                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true }).replace('about ', '')}
                                        </span>
                                    </div>
                                    <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-lg border transition-colors ${msg.user_id === user?.id
                                        ? 'bg-lime text-oled font-bold border-lime/20 selection:bg-black/20'
                                        : 'bg-gray-900/80 text-gray-200 border-gray-800/80 group-hover:border-gray-700'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-900/30 border-t border-gray-800/50 space-y-3">
                {/* Spotter Request & Quick Shouts */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar items-center">
                    <button
                        onClick={sendSpotRequest}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black hover:bg-red-500 hover:text-white transition-all whitespace-nowrap shadow-[0_0_15px_-5px_rgba(255,50,50,0.4)]"
                    >
                        <AlertCircle size={10} className="fill-current" /> NEED A SPOT
                    </button>
                    {quickShouts.map((shout) => (
                        <button
                            key={shout}
                            onClick={() => { setInput(shout); }}
                            className="shrink-0 px-3 py-1.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 text-[10px] font-bold hover:bg-gray-800 hover:text-white hover:border-lime/30 active:scale-95 transition-all whitespace-nowrap"
                        >
                            {shout}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSend} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Shout something..."
                        className="w-full bg-oled/60 border border-gray-800 text-white text-sm rounded-2xl pl-11 pr-14 py-3.5 focus:outline-none focus:border-lime/50 focus:ring-1 focus:ring-lime/20 transition-all placeholder:text-gray-600 font-medium"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                        <Zap size={16} />
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-lime text-oled rounded-xl disabled:opacity-30 disabled:grayscale transition-all hover:scale-105 active:scale-90 shadow-[0_0_20px_-5px_rgba(50,255,50,0.5)]"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(50, 255, 50, 0.2); }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            ` }} />
        </div>
    );
}
