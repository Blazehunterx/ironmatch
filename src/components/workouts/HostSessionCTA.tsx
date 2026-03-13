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
            className="w-full mb-6 group p-5 rounded-3xl bg-gradient-to-br from-purple-500/20 via-purple-500/5 to-oled border border-purple-500/20 flex items-center gap-5 text-left relative overflow-hidden shadow-xl active:scale-[0.98] transition-all"
        >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                <Users size={120} className="text-purple-500" />
            </div>
            <div className="p-4 bg-purple-600 rounded-2xl text-white shadow-2xl group-hover:rotate-6 transition-transform relative z-10">
                <Users size={28} />
            </div>
            <div className="relative z-10">
                <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] leading-none mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> Live Now
                </h4>
                <p className="text-lg font-black text-white leading-tight">Host Group Workout</p>
                <p className="text-[11px] text-gray-500 font-medium mt-1">Lounge a live session for your clients</p>
            </div>
        </motion.button>
    );
}
