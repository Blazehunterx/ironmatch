import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Bell, X } from 'lucide-react';

interface RestTimerOverlayProps {
    durationSeconds: number;
    isOpen: boolean;
    onClose: () => void;
    onFinished?: () => void;
}

export default function RestTimerOverlay({
    durationSeconds = 90,
    isOpen,
    onClose,
    onFinished
}: RestTimerOverlayProps) {
    const [timeLeft, setTimeLeft] = useState<number>(durationSeconds);
    const [totalDuration, setTotalDuration] = useState<number>(durationSeconds);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const endTimeRef = useState<{ current: number }>({ current: Date.now() + durationSeconds * 1000 })[0];

    useEffect(() => {
        if (isOpen) {
            setTimeLeft(durationSeconds);
            setTotalDuration(durationSeconds);
            setIsPaused(false);
            endTimeRef.current = Date.now() + durationSeconds * 1000;
        }
    }, [isOpen, durationSeconds]);

    // Resilient Audio & Haptic Chime
    const playChime = () => {
        try {
            if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200, 100, 400]);
            }
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const frequencies = [440, 554.37, 659.25, 880]; // A major triumphant chime
            frequencies.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
                gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + idx * 0.08);
                osc.stop(ctx.currentTime + 1.2);
            });
        } catch {}
    };

    useEffect(() => {
        if (!isOpen || isPaused) return;

        // Wall-clock calculation guarantees accurate countdown even if mobile OS suspends JS
        const interval = setInterval(() => {
            const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(interval);
                playChime();
                if (onFinished) onFinished();
            }
        }, 500);

        return () => clearInterval(interval);
    }, [isOpen, isPaused]);

    if (!isOpen) return null;

    const progress = totalDuration > 0 ? (timeLeft / totalDuration) : 0;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    const adjustTime = (delta: number) => {
        setTimeLeft(prev => {
            const updated = Math.max(0, prev + delta);
            if (updated > totalDuration) setTotalDuration(updated);
            return updated;
        });
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                className="fixed bottom-20 left-4 right-4 z-[250] max-w-md mx-auto"
            >
                <div className="bg-oled/95 backdrop-blur-xl border border-lime/30 rounded-[28px] p-4 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(50,255,50,0.15)] flex items-center justify-between gap-3">
                    {/* Circular Timer Visual */}
                    <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-white/10"
                                strokeWidth="3"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="text-lime transition-all duration-300"
                                strokeDasharray={`${progress * 100}, 100`}
                                strokeLinecap="round"
                                strokeWidth="3"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Bell size={16} className={`transition ${timeLeft === 0 ? 'text-lime animate-bounce' : 'text-gray-400'}`} />
                        </div>
                    </div>

                    {/* Middle: Digital Time & Label */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-lime">
                                {timeLeft === 0 ? 'Rest Complete!' : 'Resting'}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                        </div>
                        <div className="text-2xl font-black italic tracking-tight text-white tabular-nums">
                            {formatted}
                        </div>
                    </div>

                    {/* Controls: +/- 30s & Play/Pause */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => adjustTime(-30)}
                            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-gray-300 font-bold text-xs active:scale-95 transition"
                            title="-30s"
                        >
                            -30
                        </button>
                        <button
                            onClick={() => adjustTime(30)}
                            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-gray-300 font-bold text-xs active:scale-95 transition"
                            title="+30s"
                        >
                            +30
                        </button>
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className="w-10 h-10 rounded-xl bg-lime/20 border border-lime/40 text-lime flex items-center justify-center active:scale-95 transition shadow-[0_0_10px_rgba(50,255,50,0.2)]"
                        >
                            {isPaused ? <Play size={16} /> : <Pause size={16} />}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white active:scale-95 transition"
                            title="Dismiss"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
