import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { FitnessDiscipline } from '../../types/database';

export const DISCIPLINES: { value: FitnessDiscipline; icon: string; desc: string }[] = [
    { value: 'Powerlifting', icon: '🏋️', desc: 'Big 4 lifts, maximal strength' },
    { value: 'Bodybuilding', icon: '💪', desc: 'Muscle building, aesthetics' },
    { value: 'CrossFit', icon: '🔥', desc: 'Varied functional fitness, WODs' },
    { value: 'Hyrox', icon: '🏃', desc: 'Hybrid running + functional' },
    { value: 'General Fitness', icon: '⚡', desc: 'Staying active, all-round' },
];

interface DisciplineStepProps {
    discipline: FitnessDiscipline;
    onSetDiscipline: (d: FitnessDiscipline) => void;
}

const DisciplineStep: React.FC<DisciplineStepProps> = ({ discipline, onSetDiscipline }) => {
    return (
        <div className="flex-1 flex flex-col">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <h2 className="text-2xl font-black text-white mb-1">Your Discipline</h2>
                <p className="text-sm text-gray-500 mb-6">What best describes your training style?</p>
            </motion.div>

            <div className="space-y-3">
                {DISCIPLINES.map((d, idx) => (
                    <motion.button key={d.value} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.08 }}
                        onClick={() => onSetDiscipline(d.value)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${discipline === d.value
                            ? 'bg-lime/10 border-lime/40' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}>
                        <span className="text-3xl">{d.icon}</span>
                        <div className="flex-1">
                            <p className={`font-bold ${discipline === d.value ? 'text-lime' : 'text-white'}`}>{d.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{d.desc}</p>
                        </div>
                        {discipline === d.value && <Check size={18} className="text-lime shrink-0" />}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default DisciplineStep;
