import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Flame } from 'lucide-react';
import { User } from '../../types/database';
import { Big4Lifts, getRankFromLifts, getNextRank, getRankProgress, getBig4Total } from '../../lib/gamification';

interface ArenaHeaderProps {
    user: User | null;
}

const ArenaHeader: React.FC<ArenaHeaderProps> = ({ user }) => {
    const lifts: Big4Lifts = user?.big4 || { bench: 0, squat: 0, deadlift: 0, ohp: 0 };
    const unit = user?.unit_preference || 'lbs';
    const rank = getRankFromLifts(lifts, unit);
    const nextRank = getNextRank(lifts, unit);
    const progress = getRankProgress(lifts, unit);
    const total = getBig4Total(lifts);

    const neededToNextRank = nextRank ? Math.max(0, Math.round(
        unit === 'kg' 
            ? (nextRank.minTotal / 2.20462) - total 
            : nextRank.minTotal - total
    )) : 0;
    const currentMinRankDisplay = unit === 'kg' ? Math.round(rank.minTotal / 2.20462) : rank.minTotal;

    return (
        <div className="px-4 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-2">
                        Arena <Zap size={22} className="text-lime" />
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Verified strength milestones & competitive duels</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-[#0D0D0D] border border-white/10 rounded-xl px-3 py-2">
                        <Zap size={13} className="text-lime" />
                        <span className="text-xs font-black text-lime">{(user?.xp || 0).toLocaleString()}</span>
                        <span className="text-[9px] text-gray-400 font-bold">XP</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#0D0D0D] border border-white/10 rounded-xl px-3 py-2">
                        <Flame size={13} className="text-orange-400" />
                        <span className="text-xs font-bold text-white">7d</span>
                    </div>
                </div>
            </div>

            {/* Rank Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-4 shadow-xl"
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{rank.icon}</span>
                        <div>
                            <h3 className="font-black text-lg" style={{ color: rank.color }}>{rank.name}</h3>
                            <p className="text-[10px] text-gray-400">{rank.description}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-black text-white">{Math.round(total)}<span className="text-xs text-gray-400 ml-1">{unit}</span></p>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Big 4 Total</p>
                    </div>
                </div>

                {/* Progress to next rank */}
                {nextRank && (
                    <>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-1.5">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{ background: `linear-gradient(90deg, ${rank.color}, ${nextRank.color})` }}
                            />
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-500">{rank.name} ({currentMinRankDisplay} {unit})</span>
                            <span className="font-bold" style={{ color: nextRank.color }}>
                                {nextRank.icon} {nextRank.name} — {neededToNextRank} {unit} to advance
                            </span>
                        </div>
                    </>
                )}

                {/* Big 4 Summary */}
                <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">YOUR BIG 4 (1RM)</span>
                        <span className="text-[9px] text-gray-500 font-bold">Edit in Profile</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { label: 'Bench', value: lifts.bench, icon: '🪑' },
                            { label: 'Squat', value: lifts.squat, icon: '🏋️' },
                            { label: 'Dead', value: lifts.deadlift, icon: '⬆️' },
                            { label: 'OHP', value: lifts.ohp, icon: '🙌' },
                        ].map(l => (
                            <div key={l.label} className="bg-black/50 border border-white/5 rounded-xl p-2 text-center">
                                <span className="text-sm">{l.icon}</span>
                                <p className="text-sm font-black text-white">{l.value}</p>
                                <p className="text-[8px] text-gray-400 font-bold uppercase">{l.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ArenaHeader;
