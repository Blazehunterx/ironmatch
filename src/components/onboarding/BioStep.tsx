import React from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon } from 'lucide-react';
import { Goal, FitnessLevel, User } from '../../types/database';
import { Rank } from '../../lib/gamification';

const goalEmoji: Record<string, string> = {
    'Workout Buddy': '🤝', 'Socialize': '💬', 'Get Pushed': '🔥', 'Learn': '📚',
    'Train for Competition': '🏋️', 'Lose Weight': '💪', 'Recovery Partner': '🧘', 'Cardio Partner': '🏃',
};

interface BioStepProps {
    bio: string;
    onSetBio: (bio: string) => void;
    profileImage: string;
    currentUser: User | null;
    rank: Rank;
    fitnessLevel: FitnessLevel;
    goals: Goal[];
    weightKg: number;
    heightCm: number;
    hasAnyLift: boolean;
}

const BioStep: React.FC<BioStepProps> = ({
    bio, onSetBio, profileImage, currentUser, rank, fitnessLevel, goals, weightKg, heightCm, hasAnyLift
}) => {
    return (
        <div className="flex-1 flex flex-col">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <h2 className="text-2xl font-black text-white mb-1">Almost Done!</h2>
                <p className="text-sm text-gray-500 mb-6">Write a short bio to let others know what you're about</p>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
                <textarea value={bio} onChange={e => onSetBio(e.target.value)}
                    placeholder="Tell others about your training style..."
                    rows={4} maxLength={200}
                    className="w-full bg-transparent text-white text-sm leading-relaxed focus:outline-none resize-none placeholder:text-gray-600" />
                <p className="text-right text-[10px] text-gray-600 mt-1">{bio.length}/200</p>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-800 rounded-2xl p-4">
                <p className="text-[10px] text-gray-500 font-bold mb-3 uppercase tracking-wider">Your Profile Preview</p>
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden border-2 border-gray-700 shrink-0">
                        {profileImage ? (
                            <img src={profileImage} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center"><UserIcon size={20} className="text-gray-600" /></div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">{currentUser?.name || 'You'}</p>
                        <div className="flex items-center gap-2">
                            {hasAnyLift && <span className="text-xs" style={{ color: rank.color }}>{rank.icon} {rank.name}</span>}
                            <span className="text-[9px] text-gray-500">{fitnessLevel}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                    {goals.map(g => <span key={g} className="text-[9px] bg-lime/10 text-lime px-2 py-0.5 rounded-full font-bold">{goalEmoji[g]} {g}</span>)}
                </div>
                {weightKg > 0 && <p className="text-[10px] text-gray-500">{weightKg}kg · {heightCm}cm</p>}
            </motion.div>
        </div>
    );
};

export default BioStep;
