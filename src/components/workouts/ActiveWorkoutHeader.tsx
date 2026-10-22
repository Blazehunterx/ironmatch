import { motion } from 'framer-motion';
import { X, Timer, Flame, Shield, Target } from 'lucide-react';

export type DifficultyDial = 'deload' | 'target' | 'beast';

interface ActiveWorkoutHeaderProps {
    planName: string;
    elapsed: number;
    formatTime: (secs: number) => string;
    completedCount: number;
    totalCount: number;
    onCancel: () => void;
    onFinish: () => void;
    canFinish: boolean;
    difficulty: DifficultyDial;
    onDifficultyChange: (d: DifficultyDial) => void;
    onOpenPhysio?: () => void;
}

export default function ActiveWorkoutHeader({
    planName, elapsed, formatTime, completedCount, totalCount, onCancel, onFinish, canFinish,
    difficulty, onDifficultyChange, onOpenPhysio
}: ActiveWorkoutHeaderProps) {
    return (
        <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-md border-b border-white/10 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
                <button onClick={onCancel} className="p-1.5 text-gray-400 hover:text-white rounded-lg transition">
                    <X size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-[#0D0D0D] border border-white/10 rounded-xl px-3 py-1.5">
                        <Timer size={13} className="text-lime" />
                        <span className="font-mono text-sm font-black text-white">{formatTime(elapsed)}</span>
                    </div>
                    {onOpenPhysio && (
                        <button
                            type="button"
                            onClick={onOpenPhysio}
                            className="px-2.5 py-1.5 rounded-xl bg-[#0D0D0D] border border-red-500/30 hover:border-red-500/60 text-red-400 text-[11px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 transition shadow-sm"
                            title="In-Workout Physio (Pain Relief & Smart Swaps)"
                        >
                            <span>🛡️ Physio</span>
                        </button>
                    )}
                </div>
                <button
                    onClick={onFinish}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${canFinish
                        ? 'bg-lime text-black hover:bg-lime/90 shadow-[0_0_12px_rgba(50,255,50,0.3)]'
                        : 'bg-zinc-800 text-gray-400 hover:text-white'
                        }`}
                >
                    Finish
                </button>
            </div>

            <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-black text-white text-sm truncate">{planName}</h3>
                <span className="text-[10px] text-gray-400 font-mono font-bold shrink-0">
                    {completedCount}/{totalCount} sets
                </span>
            </div>

            {/* Difficulty Dial */}
            <div className="flex items-center bg-[#0D0D0D] p-1 rounded-xl border border-white/10 mb-2 gap-1">
                <button
                    onClick={() => onDifficultyChange('deload')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                        difficulty === 'deload'
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                    <Shield size={11} /> Deload -10%
                </button>
                <button
                    onClick={() => onDifficultyChange('target')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                        difficulty === 'target'
                            ? 'bg-lime text-black font-black shadow-[0_0_10px_rgba(50,255,50,0.3)]'
                            : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                    <Target size={11} /> Target 100%
                </button>
                <button
                    onClick={() => onDifficultyChange('beast')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                        difficulty === 'beast'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                            : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                    <Flame size={11} /> Beast +5%
                </button>
            </div>

            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                <motion.div
                    className="h-full bg-lime rounded-full"
                    animate={{ width: `${(completedCount / Math.max(1, totalCount)) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>
        </div>
    );
}
