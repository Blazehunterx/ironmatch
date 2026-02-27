import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Zap, Shield, Target, X, MessageSquare } from 'lucide-react';
import { User } from '../types/database';

interface BuddyMatchProps {
    currentUser: User;
    allUsers: User[];
    onClose: () => void;
    onStartChat: (targetUserId: string) => void;
}

export default function BuddyMatch({ currentUser, allUsers, onClose, onStartChat }: BuddyMatchProps) {
    const [isScanning, setIsScanning] = useState(true);
    const [matches, setMatches] = useState<User[]>([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            // Find users in same gym with similar fitness level
            const results = allUsers.filter(u =>
                u.id !== currentUser.id &&
                u.home_gym === currentUser.home_gym &&
                (u.fitness_level === currentUser.fitness_level || u.is_trainer)
            ).slice(0, 3);
            setMatches(results);
            setIsScanning(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, [currentUser, allUsers]);

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Buddy-Up</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Automated Matchmaking</p>
                </div>
                <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            <AnimatePresence mode="wait">
                {isScanning ? (
                    <motion.div
                        key="scanning"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-12 flex flex-col items-center justify-center space-y-6"
                    >
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="w-24 h-24 rounded-full border-2 border-dashed border-lime/30"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <Users size={32} className="text-lime" />
                            </motion.div>
                            <div className="absolute inset-0 bg-lime/10 blur-3xl rounded-full scale-150" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm font-black text-white uppercase tracking-widest animate-pulse">Scanning {currentUser.home_gym}...</p>
                            <p className="text-[10px] text-gray-500 font-medium">Matching skill levels & availability</p>
                        </div>
                    </motion.div>
                ) : matches.length > 0 ? (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-2 px-3 py-2 bg-lime/10 border border-lime/20 rounded-xl mb-4">
                            <Zap size={12} className="text-lime fill-current" />
                            <span className="text-[10px] font-black text-lime uppercase tracking-widest">3 Instant Matches Found</span>
                        </div>

                        <div className="space-y-3">
                            {matches.map((match, idx) => (
                                <motion.div
                                    key={match.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-4 rounded-2xl bg-gray-900 border border-gray-800 flex items-center gap-4 group hover:border-lime/30 transition-all"
                                >
                                    <div className="relative">
                                        <img src={match.profile_image_url} className="w-12 h-12 rounded-full object-cover border border-gray-700" alt="" />
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-lime border-2 border-gray-900 flex items-center justify-center">
                                            <Zap size={8} className="text-oled" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-white truncate">{match.name}</h4>
                                            {match.is_trainer && <Shield size={10} className="text-lime fill-current" />}
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-medium">{match.bio || 'Ready to lift!'}</p>
                                    </div>
                                    <button
                                        onClick={() => onStartChat(match.id)}
                                        className="p-2.5 rounded-xl bg-gray-800 text-gray-400 group-hover:bg-lime group-hover:text-oled transition-all active:scale-95 shadow-lg"
                                    >
                                        <MessageSquare size={16} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-4 mt-6 rounded-2xl border border-gray-800 text-gray-500 font-black uppercase tracking-widest text-xs hover:text-white transition-all"
                        >
                            Back to Feed
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="no-matches"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-12 text-center space-y-4"
                    >
                        <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mx-auto border border-gray-800">
                            <Target size={24} className="text-gray-700" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">No perfect matches right now</p>
                            <p className="text-[10px] text-gray-500">Broadcasting your request to the gym shoutbox...</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full py-4 rounded-2xl bg-lime text-oled font-black uppercase tracking-widest text-xs shadow-lg"
                        >
                            Got It
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
