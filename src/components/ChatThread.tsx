import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Mic, MicOff, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { User } from '../types/database';

interface Message {
    from: string;
    text: string;
    time: string;
    isVoice?: boolean;
}

interface ChatThreadProps {
    conversation: {
        user: User;
        accepted: boolean;
        messages: Message[];
    };
    currentUserId: string;
    onBack: () => void;
    onSend: (text: string, isVoice?: boolean) => void;
    canSendMore: boolean;
}

export default function ChatThread({ conversation, currentUserId, onBack, onSend, canSendMore }: ChatThreadProps) {
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user, accepted, messages } = conversation;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || !canSendMore) return;
        onSend(input.trim());
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleVoiceMemo = () => {
        if (!canSendMore) return;
        setIsRecording(true);
        // Simulate recording for 2 seconds
        setTimeout(() => {
            setIsRecording(false);
            onSend('🎤 Voice memo — "Hey, just checking if we\'re still on for today. Looking forward to it!"', true);
        }, 2000);
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-0 z-[60] flex flex-col bg-oled"
        >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-900/80 border-b border-gray-800 backdrop-blur-sm sticky top-0 z-10">
                <button onClick={onBack} className="p-1.5 -ml-1 text-gray-400 hover:text-white rounded-lg transition-colors">
                    <ArrowLeft size={22} />
                </button>
                <img src={user.profile_image_url} alt={user.name} className="w-10 h-10 rounded-full border border-gray-700 object-cover" />
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">{user.name}</h3>
                    <p className="text-[10px] text-gray-500">
                        {accepted ? 'Workout accepted ✓' : 'Pending workout request'}
                    </p>
                </div>
                {user.is_trainer && (
                    <span className="text-[9px] bg-lime/20 text-lime px-2 py-0.5 rounded font-bold border border-lime/30">TRAINER</span>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {!accepted && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 mb-4 text-center">
                        <Lock size={14} className="text-orange-400 mx-auto mb-1" />
                        <p className="text-xs text-orange-400">Workout request pending. You can send 1 message before it's accepted.</p>
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const isMe = msg.from === currentUserId;
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isMe
                                ? 'bg-lime text-oled rounded-br-md'
                                : 'bg-gray-900 border border-gray-800 text-white rounded-bl-md'
                                }`}>
                                {msg.isVoice && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <Mic size={12} className={isMe ? 'text-oled/60' : 'text-lime'} />
                                        <div className="flex gap-0.5">
                                            {[...Array(12)].map((_, i) => (
                                                <div key={i} className={`w-1 rounded-full ${isMe ? 'bg-oled/30' : 'bg-lime/40'}`} style={{ height: `${Math.random() * 12 + 4}px` }} />
                                            ))}
                                        </div>
                                        <span className={`text-[10px] ${isMe ? 'text-oled/50' : 'text-gray-500'}`}>0:04</span>
                                    </div>
                                )}
                                <p className={`text-sm leading-relaxed ${msg.isVoice && !isMe ? 'text-gray-400 italic text-xs' : ''}`}>
                                    {msg.isVoice ? msg.text.replace('🎤 Voice memo — ', 'Transcript: ') : msg.text}
                                </p>
                                <p className={`text-[9px] mt-1 ${isMe ? 'text-oled/50' : 'text-gray-600'}`}>{msg.time}</p>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="sticky bottom-0 px-4 py-3 bg-gray-900 border-t border-gray-800 pb-safe">
                {!canSendMore ? (
                    <div className="flex items-center justify-center gap-2 py-3 text-gray-500 text-xs">
                        <Lock size={12} /> Waiting for {user.name.split(' ')[0]} to accept your request
                    </div>
                ) : (
                    <div className="flex items-end gap-2">
                        <button
                            onClick={handleVoiceMemo}
                            disabled={isRecording}
                            className={`p-2.5 rounded-xl shrink-0 transition-all ${isRecording
                                ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/30'
                                : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                                }`}
                        >
                            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                className="w-full bg-oled border border-gray-700 text-white rounded-xl py-2.5 px-4 pr-10 focus:outline-none focus:border-lime text-sm"
                            />
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="p-2.5 rounded-xl bg-lime text-oled shrink-0 disabled:opacity-30 hover:bg-lime/90 active:scale-95 transition-all"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
