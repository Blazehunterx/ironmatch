import React, { useState } from 'react';
import { Target, Edit2, Check } from 'lucide-react';
import { Goal, ALL_GOALS } from '../../types/database';

const goalEmoji: Record<string, string> = {
    'Workout Buddy': '🤝', 'Socialize': '💬', 'Get Pushed': '🔥', 'Learn': '📚',
    'Train for Competition': '🏋️', 'Lose Weight': '💪', 'Recovery Partner': '🧘', 'Cardio Partner': '🏃',
};

interface ProfileGoalsProps {
    goals: Goal[];
    onSave: (newGoals: Goal[]) => void;
}

const ProfileGoals: React.FC<ProfileGoalsProps> = ({ goals, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editGoals, setEditGoals] = useState<Goal[]>(goals);

    const toggleGoal = (goal: Goal) => {
        setEditGoals(prev => {
            if (prev.includes(goal)) return prev.filter(g => g !== goal);
            if (prev.length >= 2) return prev;
            return [...prev, goal];
        });
    };

    const handleSave = () => {
        setIsEditing(false);
        onSave(editGoals);
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-white flex items-center gap-2"><Target size={16} className="text-lime" /> Focus</h4>
                <button 
                    onClick={() => {
                        if (isEditing) handleSave();
                        else setIsEditing(true);
                    }} 
                    className="text-gray-500 hover:text-lime"
                >
                    {isEditing ? <Check size={16} /> : <Edit2 size={16} />}
                </button>
            </div>
            {isEditing ? (
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                        {ALL_GOALS.map(goal => (
                            <button
                                key={goal}
                                onClick={() => toggleGoal(goal)}
                                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${editGoals.includes(goal) ? 'bg-lime/20 border-lime/50 text-lime' : 'bg-gray-900 border-gray-800 text-gray-400'}`}
                            >
                                {goalEmoji[goal]} {goal}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleSave} className="w-full py-2 bg-lime text-oled rounded-lg text-xs font-bold">Save Goals</button>
                </div>
            ) : (
                <div className="flex flex-wrap gap-1.5">
                    {goals?.map(g => (
                        <span key={g} className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-800 text-gray-300 border border-gray-700/50">
                            {goalEmoji[g]} {g}
                        </span>
                    )) || <p className="text-sm text-gray-500">No goals set.</p>}
                </div>
            )}
        </div>
    );
};

export default ProfileGoals;
