import React from 'react';
import { motion } from 'framer-motion';
import { Goal, BodyPart, ALL_GOALS, ALL_BODY_PARTS } from '../../types/database';

const goalEmoji: Record<string, string> = {
    'Workout Buddy': '🤝', 'Socialize': '💬', 'Get Pushed': '🔥', 'Learn': '📚',
    'Train for Competition': '🏋️', 'Lose Weight': '💪', 'Recovery Partner': '🧘', 'Cardio Partner': '🏃',
};

interface GoalsStepProps {
    goals: Goal[];
    subGoals: BodyPart[];
    onToggleGoal: (goal: Goal) => void;
    onToggleSubGoal: (bp: BodyPart) => void;
}

const GoalsStep: React.FC<GoalsStepProps> = ({
    goals, subGoals, onToggleGoal, onToggleSubGoal
}) => {
    return (
        <div className="flex-1 flex flex-col">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <h2 className="text-2xl font-black text-white mb-1">Your Goals</h2>
                <p className="text-sm text-gray-500 mb-6">Pick up to 3 goals so we match you with the right people</p>
            </motion.div>

            <div className="grid grid-cols-2 gap-2 mb-6">
                {ALL_GOALS.map((goal, idx) => (
                    <motion.button key={goal} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        onClick={() => onToggleGoal(goal)}
                        className={`p-3 rounded-xl border text-left transition-all ${goals.includes(goal)
                            ? 'bg-lime/10 border-lime/40 scale-[1.02]'
                            : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}>
                        <span className="text-lg">{goalEmoji[goal]}</span>
                        <p className={`text-xs font-bold mt-1 ${goals.includes(goal) ? 'text-lime' : 'text-white'}`}>{goal}</p>
                    </motion.button>
                ))}
            </div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                <p className="text-xs font-bold text-gray-400 mb-2">Focus body parts (optional)</p>
                <div className="flex flex-wrap gap-1.5">
                    {ALL_BODY_PARTS.map(bp => (
                        <button key={bp} onClick={() => onToggleSubGoal(bp)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${subGoals.includes(bp)
                                ? 'bg-lime/10 text-lime border border-lime/30'
                                : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-gray-300'}`}>
                            {bp}
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default GoalsStep;
