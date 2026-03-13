import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AICoachCTAProps {
    onClick: () => void;
}

export default function AICoachCTA({ onClick }: AICoachCTAProps) {
    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onClick}
            className="w-full mb-6 group p-5 rounded-3xl bg-gradient-to-br from-lime/20 via-lime/5 to-oled border border-lime/20 flex items-center gap-5 text-left relative overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)] active:scale-[0.98] transition-all"
        >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                <Sparkles size={120} className="text-lime" />
            </div>
            <div className="p-4 bg-lime rounded-2xl text-oled shadow-2xl group-hover:rotate-6 transition-transform relative z-10">
                <Sparkles size={28} />
            </div>
            <div className="relative z-10">
                <h4 className="text-[10px] font-black text-lime uppercase tracking-[0.2em] leading-none mb-1.5">Coach Antigravity</h4>
                <p className="text-lg font-black text-white leading-tight">AI Workout Builder</p>
                <p className="text-[11px] text-gray-500 font-medium mt-1 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-lime animate-pulse" /> Custom plans for beginners
                </p>
            </div>
        </motion.button>
    );
}
