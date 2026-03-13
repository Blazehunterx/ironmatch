import React from 'react';
import { motion } from 'framer-motion';
import { Ruler } from 'lucide-react';

interface BodyStatsStepProps {
    weightKg: number;
    heightCm: number;
    unitPref: 'lbs' | 'kg';
    onSetWeight: (w: number) => void;
    onSetHeight: (h: number) => void;
    onSetUnitPref: (u: 'lbs' | 'kg') => void;
}

const BodyStatsStep: React.FC<BodyStatsStepProps> = ({
    weightKg, heightCm, unitPref, onSetWeight, onSetHeight, onSetUnitPref
}) => {
    return (
        <div className="flex-1 flex flex-col">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <h2 className="text-2xl font-black text-white mb-1">Body Stats</h2>
                <p className="text-sm text-gray-500 mb-6">Used for fair duel matchups and relative scoring</p>
            </motion.div>

            <div className="space-y-4">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                            <Ruler size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Weight</p>
                            <p className="text-[10px] text-gray-500">Your current bodyweight in kg</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="number" value={weightKg || ''} onChange={e => onSetWeight(Number(e.target.value) || 0)}
                            placeholder="80" className="flex-1 bg-oled border border-gray-700 text-white text-lg font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-lime text-center" />
                        <span className="text-sm text-gray-500 w-8">kg</span>
                    </div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                            <Ruler size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Height</p>
                            <p className="text-[10px] text-gray-500">Your height in cm</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="number" value={heightCm || ''} onChange={e => onSetHeight(Number(e.target.value) || 0)}
                            placeholder="180" className="flex-1 bg-oled border border-gray-700 text-white text-lg font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-lime text-center" />
                        <span className="text-sm text-gray-500 w-8">cm</span>
                    </div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                    <p className="text-sm font-bold text-white mb-3">Preferred Unit</p>
                    <div className="flex gap-2">
                        {(['lbs', 'kg'] as const).map(u => (
                            <button key={u} onClick={() => onSetUnitPref(u)}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${unitPref === u
                                    ? 'bg-lime text-oled' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'}`}>
                                {u.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BodyStatsStep;
