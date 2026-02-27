import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { User } from '../types/database';

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
}

export default function RequestModal({ isOpen, onClose, user }: RequestModalProps) {
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const MAX_CHARS = 300;

    useEffect(() => {
        if (isOpen) {
            setMessage(`Hey ${user.name.split(' ')[0]}, saw we both train at the same gym. Want to hit a session sometime?`);
            setStatus('idle');
            // Background Scroll Lock
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, user]);

    const handleSend = () => {
        setStatus('sending');
        setTimeout(() => {
            // Mock network request
            setStatus('success');
            setTimeout(() => {
                onClose();
            }, 1500);
        }, 1000);
    };

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
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity"
                    />

                    {/* Bottom Sheet Modal */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 rounded-t-2xl z-50 p-6 shadow-2xl pb-safe pb-8 overflow-y-auto max-h-[95vh]"
                    >
                        {status === 'success' ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <CheckCircle2 size={64} className="text-lime" />
                                <h3 className="text-2xl font-bold text-white">Request Sent!</h3>
                                <p className="text-gray-400 text-center">We'll let you know when {user.name.split(' ')[0]} responds.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white">Workout Request</h3>
                                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <img src={user.profile_image_url} alt={user.name} className="w-12 h-12 rounded-full border border-gray-700" />
                                    <div>
                                        <h4 className="font-medium text-white">To: {user.name}</h4>
                                        <span className="text-xs text-lime bg-lime/10 px-2 py-0.5 rounded border border-lime/20">{user.fitness_level}</span>
                                    </div>
                                </div>

                                <div className="relative mb-6">
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        maxLength={MAX_CHARS}
                                        rows={4}
                                        className="w-full px-4 py-3 text-white bg-oled border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime resize-none placeholder:text-gray-600 transition-all"
                                        placeholder="Add a personalized message..."
                                    />
                                    <div className={`absolute bottom-3 right-3 text-xs ${message.length >= MAX_CHARS ? 'text-red-500' : 'text-gray-500'}`}>
                                        {message.length}/{MAX_CHARS}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        disabled={status === 'sending'}
                                        className="flex-1 py-3.5 px-4 font-semibold text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSend}
                                        disabled={status === 'sending' || message.trim().length === 0}
                                        className="flex-[2] flex items-center justify-center gap-2 py-3.5 px-4 font-bold text-oled bg-lime hover:bg-lime/90 rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        {status === 'sending' ? 'Sending...' : (
                                            <>
                                                Send Request <Send size={16} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
