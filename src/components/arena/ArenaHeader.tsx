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
    const rank = getRankFromLifts(lifts, user?.unit_preference);
    const nextRank = getNextRank(lifts, user?.unit_preference);
    const progress = getRankProgress(lifts, user?.unit_preference);
    const total = getBig4Total(lifts);

    return (
        <div className="px-4 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-2">Arena <Zap size={24} className="text-yellow-400" /></h2>
                    <p className="text-xs text-gray-500 mt-0.5">Strength determines rank. Get stronger.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2">
                        <Zap size={14} className="text-yellow-400" />
                        <span className="text-xs font-black text-yellow-400">{(user?.xp || 0).toLocaleString()}</span>
                        <span className="text-[9px] text-gray-500">XP</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2">
                        <Flame size={14} className="text-orange-500" />
                        <span className="text-xs font-bold text-white">7d</span>
                    </div>
                </div>
            </div>

            {/* Rank Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-800 rounded-2xl p-4"
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{rank.icon}</span>
                        <div>
                            <h3 className="font-black text-lg" style={{ color: rank.color }}>{rank.name}</h3>
                            <p className="text-[10px] text-gray-500">{rank.description}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-black text-white">{total}<span className="text-xs text-gray-500 ml-1">{user?.unit_preference || 'lbs'}</span></p>
                        <p className="text-[9px] text-gray-500">Big 4 Total</p>
                    </div>
                </div>

                {/* Progress to next rank */}
                {nextRank && (
                    <>
                        <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden mb-1.5">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{ background: `linear-gradient(90deg, ${rank.color}, ${nextRank.color})` }}
                            />
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[9px] text-gray-600">{rank.name} ({rank.minTotal}lbs)</span>
                            <span className="text-[9px] font-bold" style={{ color: nextRank.color }}>
                                {nextRank.icon} {nextRank.name} — need {nextRank.minTotal - (user?.unit_preference === 'kg' ? total * 2.20462 : total)}lbs more
                            </span>
                        </div>
                    </>
                )}

                {/* Big 4 Summary */}
                <div className="mt-3 pt-3 border-t border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-gray-400">YOUR BIG 4 (1RM)</span>
                        <span className="text-[9px] text-gray-600">Edit in Profile</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { label: 'Bench', value: lifts.bench, icon: '🪑' },
                            { label: 'Squat', value: lifts.squat, icon: '🏋️' },
                            { label: 'Dead', value: lifts.deadlift, icon: '⬆️' },
                            { label: 'OHP', value: lifts.ohp, icon: '🙌' },
                        ].map(l => (
                            <div key={l.label} className="bg-gray-800/50 rounded-xl p-2 text-center">
                                <span className="text-sm">{l.icon}</span>
                                <p className="text-sm font-black text-white">{l.value}</p>
                                <p className="text-[8px] text-gray-500">{l.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ArenaHeader;
