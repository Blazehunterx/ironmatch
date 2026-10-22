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
        <div className="sticky top-0 z-10 bg-oled/95 backdrop-blur-md border-b border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
                <button onClick={onCancel} className="p-1.5 text-gray-500 hover:text-white rounded-lg transition">
                    <X size={22} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5">
                        <Timer size={14} className="text-lime" />
                        <span className="font-mono text-sm font-bold text-white">{formatTime(elapsed)}</span>
                    </div>
                    {onOpenPhysio && (
                        <button
                            type="button"
                            onClick={onOpenPhysio}
                            className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[11px] font-black uppercase tracking-wider flex items-center gap-1 hover:bg-purple-500/30 active:scale-95 transition shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                            title="In-Workout Physio (Pain Relief & Smart Swaps)"
                        >
                            <span>🛡️ Physio</span>
                        </button>
                    )}
                </div>
                <button
                    onClick={onFinish}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${canFinish
                        ? 'bg-lime text-oled hover:bg-lime/90 shadow-[0_0_12px_rgba(50,255,50,0.3)]'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                >
                    Finish
                </button>
            </div>

            <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-bold text-white text-sm truncate">{planName}</h3>
                <span className="text-[10px] text-gray-400 font-mono shrink-0">
                    {completedCount}/{totalCount} sets
                </span>
            </div>

            {/* Difficulty Dial */}
            <div className="flex items-center bg-gray-900/80 p-1 rounded-xl border border-gray-800 mb-2 gap-1">
                <button
                    onClick={() => onDifficultyChange('deload')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                        difficulty === 'deload'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                            : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    <Shield size={11} /> Deload -10%
                </button>
                <button
                    onClick={() => onDifficultyChange('target')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                        difficulty === 'target'
                            ? 'bg-lime text-oled font-black shadow-[0_0_10px_rgba(50,255,50,0.3)]'
                            : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    <Target size={11} /> Target 100%
                </button>
                <button
                    onClick={() => onDifficultyChange('beast')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                        difficulty === 'beast'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                            : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    <Flame size={11} /> Beast +5%
                </button>
            </div>

            <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                <motion.div
                    className="h-full bg-lime rounded-full"
                    animate={{ width: `${(completedCount / Math.max(1, totalCount)) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>
        </div>
    );
}
