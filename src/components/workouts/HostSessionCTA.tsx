import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface HostSessionCTAProps {
    onClick: () => void;
}

export default function HostSessionCTA({ onClick }: HostSessionCTAProps) {
    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onClick}
            className="w-full mb-5 group p-4 rounded-2xl bg-[#0D0D0D] border border-white/10 hover:border-lime/40 flex items-center gap-4 text-left relative overflow-hidden shadow-lg active:scale-[0.98] transition-all"
        >
            <div className="p-3 bg-lime/15 border border-lime/30 rounded-xl text-lime shrink-0">
                <Users size={22} />
            </div>
            <div className="relative z-10 min-w-0">
                <h4 className="text-[10px] font-black text-lime uppercase tracking-wider leading-none mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" /> Verified Coach
                </h4>
                <p className="text-sm font-black text-white leading-tight">Host Live Group Workout</p>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">Launch a real-time session for your athletes</p>
            </div>
        </motion.button>
    );
}
