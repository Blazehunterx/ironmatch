import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { FitnessLevel } from '../../types/database';

interface FitnessLevelStepProps {
    fitnessLevel: FitnessLevel;
    onSetFitnessLevel: (level: FitnessLevel) => void;
}

const FitnessLevelStep: React.FC<FitnessLevelStepProps> = ({ fitnessLevel, onSetFitnessLevel }) => {
    const levels: { level: FitnessLevel; desc: string; icon: string; subtitle: string }[] = [
        { level: 'Beginner', desc: 'New to the gym or training less than 1 year', icon: '🌱', subtitle: '0–1 years' },
        { level: 'Intermediate', desc: 'Consistent training with solid form', icon: '⚡', subtitle: '1–4 years' },
        { level: 'Professional', desc: 'Advanced lifter or competitive athlete', icon: '🏆', subtitle: '4+ years' },
    ];

    return (
        <div className="flex-1 flex flex-col">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <h2 className="text-2xl font-black text-white mb-1">Experience Level</h2>
                <p className="text-sm text-gray-500 mb-6">How long have you been training?</p>
            </motion.div>

            <div className="space-y-3">
                {levels.map((item, idx) => (
                    <motion.button key={item.level} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => onSetFitnessLevel(item.level)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${fitnessLevel === item.level
                            ? 'bg-lime/10 border-lime/40' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}>
                        <span className="text-3xl">{item.icon}</span>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <p className={`font-bold ${fitnessLevel === item.level ? 'text-lime' : 'text-white'}`}>{item.level}</p>
                                <span className="text-[10px] text-gray-500">{item.subtitle}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                        {fitnessLevel === item.level && <Check size={18} className="text-lime shrink-0" />}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default FitnessLevelStep;
