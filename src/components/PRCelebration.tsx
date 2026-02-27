import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PRCelebrationProps {
    exercise: string;
    newWeight: number;
    oldWeight: number;
    unit: string;
    onClose: () => void;
}

export default function PRCelebration({ exercise, newWeight, oldWeight, unit, onClose }: PRCelebrationProps) {
    useEffect(() => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl overflow-hidden"
        >
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lime/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className="relative flex flex-col items-center text-center max-w-sm"
            >
                <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-24 h-24 bg-yellow-400 rounded-3xl flex items-center justify-center text-oled shadow-[0_0_50px_rgba(250,204,21,0.5)] mb-8"
                >
                    <Trophy size={48} />
                </motion.div>

                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">NEW RECORD!</h2>
                <div className="text-xs font-black text-lime uppercase tracking-[0.3em] mb-8">Personal Best Shattered</div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 w-full mb-8 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap size={80} className="text-white" />
                    </div>

                    <div className="text-lg font-bold text-gray-400 mb-1">{exercise}</div>
                    <div className="flex items-end justify-center gap-3">
                        <div className="text-6xl font-black text-white">{newWeight}</div>
                        <div className="text-xl font-bold text-lime mb-2">{unit}</div>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-4 py-3 px-6 bg-white/5 rounded-2xl border border-white/5">
                        <div className="text-xs font-bold text-gray-500 uppercase">Previous</div>
                        <div className="text-lg font-bold text-gray-400">{oldWeight}{unit}</div>
                        <div className="text-xs font-black text-lime">+{Math.round(((newWeight - oldWeight) / oldWeight) * 100)}%</div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="flex flex-col gap-3 w-full"
                >
                    <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold text-sm mb-4">
                        <Zap size={16} className="fill-current" />
                        <span>+500 XP EARNED</span>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-2xl bg-white text-oled font-black text-lg hover:bg-lime transition-colors active:scale-95"
                    >
                        LFG! 🔥
                    </button>
                    <p className="text-[10px] text-gray-600 font-medium tracking-wider uppercase">Tap to continue the grind</p>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
