import React from 'react';
import { motion } from 'framer-motion';
import { Big4Lifts, Rank } from '../../lib/gamification';

interface Big4StepProps {
    lifts: Big4Lifts;
    unitPref: 'lbs' | 'kg';
    rank: Rank;
    hasAnyLift: boolean;
    onSetLifts: (lifts: Big4Lifts) => void;
}

const Big4Step: React.FC<Big4StepProps> = ({
    lifts, unitPref, rank, hasAnyLift, onSetLifts
}) => {
    const liftConfigs = [
        { key: 'bench' as const, label: 'Bench Press', icon: '🪑' },
        { key: 'squat' as const, label: 'Squat', icon: '🏋️' },
        { key: 'deadlift' as const, label: 'Deadlift', icon: '⬆️' },
        { key: 'ohp' as const, label: 'Overhead Press', icon: '🙌' },
    ];

    const handleLiftChange = (key: keyof Big4Lifts, value: number) => {
        onSetLifts({ ...lifts, [key]: value });
    };

    return (
        <div className="flex-1 flex flex-col">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <h2 className="text-2xl font-black text-white mb-1">Your Big 4</h2>
                <p className="text-sm text-gray-500 mb-2">Enter your 1 rep max (1RM) for each lift. This determines your rank.</p>
                {hasAnyLift && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 mb-4">
                        <span className="text-xl">{rank.icon}</span>
                        <span className="text-sm font-bold" style={{ color: rank.color }}>{rank.name}</span>
                        <span className="text-[10px] text-gray-500 ml-auto">{lifts.bench + lifts.squat + lifts.deadlift + lifts.ohp} {unitPref} total</span>
                    </motion.div>
                )}
            </motion.div>

            <div className="space-y-3">
                {liftConfigs.map((lift, idx) => (
                    <motion.div key={lift.key} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.08 }}
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4">
                        <span className="text-2xl">{lift.icon}</span>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-white">{lift.label}</p>
                            <p className="text-[9px] text-gray-500">1 rep max</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="number" value={lifts[lift.key] || ''}
                                onChange={e => handleLiftChange(lift.key, Number(e.target.value) || 0)}
                                placeholder="0"
                                className="w-20 bg-oled border border-gray-700 text-white text-sm font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-lime text-center" />
                            <span className="text-[10px] text-gray-500">{unitPref}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {!hasAnyLift && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="text-[10px] text-gray-600 text-center mt-4">
                    Don't know your 1RM? No problem — skip this and add it later from your profile.
                </motion.p>
            )}
        </div>
    );
};

export default Big4Step;
