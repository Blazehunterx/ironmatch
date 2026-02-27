import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LevelUpOverlayProps {
    level: number;
    onClose: () => void;
}

export default function LevelUpOverlay({ level, onClose }: LevelUpOverlayProps) {
    const [audio] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'));

    useEffect(() => {
        audio.play().catch(() => { }); // Play level up sound
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#bef264', '#ffffff', '#22c55e']
        });
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose, audio]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
            <div className="absolute inset-0 bg-oled/80 backdrop-blur-sm pointer-events-auto" onClick={onClose} />

            <motion.div
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="relative bg-gradient-to-br from-gray-900 via-oled to-black p-1 rounded-[2.5rem] shadow-[0_0_100px_-20px_#bef264]"
            >
                <div className="bg-gray-900 rounded-[2.3rem] p-10 flex flex-col items-center space-y-6 border border-lime/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-lime/10 to-transparent" />

                    <motion.div
                        animate={{
                            y: [0, -10, 0],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-32 h-32 rounded-3xl bg-lime flex items-center justify-center shadow-[0_0_40px_-5px_#bef264] relative z-10"
                    >
                        <Trophy size={60} className="text-oled" />
                    </motion.div>

                    <div className="text-center space-y-2 relative z-10">
                        <motion.h4
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xs font-black text-lime uppercase tracking-[0.4em]"
                        >
                            Evolution Complete
                        </motion.h4>
                        <motion.h2
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring' }}
                            className="text-6xl font-black text-white italic tracking-tighter"
                        >
                            LEVEL {level}
                        </motion.h2>
                    </div>

                    <div className="flex gap-4 relative z-10">
                        <div className="flex flex-col items-center p-3 bg-gray-800/50 rounded-2xl border border-gray-700 min-w-[80px]">
                            <Star size={16} className="text-yellow-500 fill-current mb-1" />
                            <span className="text-[10px] font-black text-gray-500 uppercase">Rewards</span>
                            <span className="text-sm font-black text-white">+500 XP</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-gray-800/50 rounded-2xl border border-gray-700 min-w-[80px]">
                            <Zap size={16} className="text-lime fill-current mb-1" />
                            <span className="text-[10px] font-black text-gray-500 uppercase">Bonus</span>
                            <span className="text-sm font-black text-white">X2 Multi</span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 text-gray-600 hover:text-white transition-colors pointer-events-auto"
                    >
                        <X size={20} />
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
