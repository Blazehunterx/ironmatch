import { motion } from 'framer-motion';
import { Users, Zap } from 'lucide-react';

interface BuddyMatchCTAProps {
    xp: number;
    isTrainer: boolean;
    onShowMatch: () => void;
}

export default function BuddyMatchCTA({ xp, isTrainer, onShowMatch }: BuddyMatchCTAProps) {
    if (xp < 50 && !isTrainer) return null;

    return (
        <div className="px-4">
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onShowMatch}
                className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 border-t border-white/20 flex items-center gap-4 relative overflow-hidden group shadow-2xl shadow-blue-900/40"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                    <Users size={80} />
                </div>
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-white shadow-xl">
                    <Zap size={24} className="fill-current" />
                </div>
                <div className="text-left">
                    <h4 className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] leading-none mb-1.5">Alpha Matching</h4>
                    <p className="text-lg font-black text-white leading-tight">Find a Gym Buddy</p>
                    <p className="text-[11px] text-blue-100/60 font-medium">Matches you with active users now</p>
                </div>
            </motion.button>
        </div>
    );
}
