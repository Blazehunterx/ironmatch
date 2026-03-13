import { motion } from 'framer-motion';
import { Trophy, Check, Share2 } from 'lucide-react';

interface ActiveWorkoutSummaryProps {
    planName: string;
    completedCount: number;
    totalCount: number;
    elapsed: number;
    shared: boolean;
    onShare: () => void;
}

export default function ActiveWorkoutSummary({
    planName, completedCount, totalCount, elapsed, shared, onShare
}: ActiveWorkoutSummaryProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-oled px-6">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
            >
                <Trophy size={80} className="text-lime mb-4" />
            </motion.div>
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-extrabold text-white mb-2"
            >
                Workout Complete!
            </motion.h2>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-400 text-center space-y-1"
            >
                <p>{completedCount}/{totalCount} exercises done</p>
                <p>{Math.round(elapsed / 60)} minutes</p>
                <p className="text-lime font-bold mt-2">{planName}</p>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6"
            >
                {shared ? (
                    <div className="flex items-center gap-2 text-lime text-sm font-semibold">
                        <Check size={16} /> Posted to Explore feed!
                    </div>
                ) : (
                    <button
                        onClick={onShare}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-bold hover:bg-blue-500/20 active:scale-95 transition-all"
                    >
                        <Share2 size={16} /> Share to Feed
                    </button>
                )}
            </motion.div>
        </div>
    );
}
