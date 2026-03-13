import { motion } from 'framer-motion';
import { X, Timer } from 'lucide-react';

interface ActiveWorkoutHeaderProps {
    planName: string;
    elapsed: number;
    formatTime: (secs: number) => string;
    completedCount: number;
    totalCount: number;
    onCancel: () => void;
    onFinish: () => void;
    canFinish: boolean;
}

export default function ActiveWorkoutHeader({
    planName, elapsed, formatTime, completedCount, totalCount, onCancel, onFinish, canFinish
}: ActiveWorkoutHeaderProps) {
    return (
        <div className="sticky top-0 z-10 bg-oled/90 backdrop-blur-sm border-b border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
                <button onClick={onCancel} className="p-1.5 text-gray-500 hover:text-white rounded-lg transition">
                    <X size={22} />
                </button>
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5">
                    <Timer size={14} className="text-lime" />
                    <span className="font-mono text-sm font-bold text-white">{formatTime(elapsed)}</span>
                </div>
                <button
                    onClick={onFinish}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${canFinish
                        ? 'bg-lime text-oled hover:bg-lime/90'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                >
                    Finish
                </button>
            </div>
            <h3 className="font-bold text-white text-center">{planName}</h3>
            <div className="w-full h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
                <motion.div
                    className="h-full bg-lime rounded-full"
                    animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>
        </div>
    );
}
