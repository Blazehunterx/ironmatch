import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Lock, Check } from 'lucide-react';

export interface Quest {
    id: string;
    title: string;
    description: string;
    target: number;
    xpReward: number;
    icon: string;
}

export interface HiddenQuest {
    id: string;
    description: string;
    xpReward: number;
}

export interface HiddenQuestReveal {
    title: string;
    description: string;
    icon: string;
}

interface QuestSectionProps {
    weeklyQuests: Quest[];
    questProgress: Record<string, number>;
    unlockedHidden: Set<string>;
    hiddenQuests: HiddenQuest[];
    hiddenQuestReveals: Record<string, HiddenQuestReveal>;
}

const QuestSection: React.FC<QuestSectionProps> = ({ 
    weeklyQuests, 
    questProgress, 
    unlockedHidden, 
    hiddenQuests, 
    hiddenQuestReveals 
}) => {
    const [questTab, setQuestTab] = useState<'weekly' | 'hidden'>('weekly');

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 space-y-3">
            {/* Sub-tabs */}
            <div className="flex gap-1.5 mb-1">
                <button onClick={() => setQuestTab('weekly')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${questTab === 'weekly'
                        ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400'
                        : 'bg-gray-900 border border-gray-800 text-gray-500'}`}>
                    <Target size={12} className="inline mr-1" />Weekly ({weeklyQuests.length})
                </button>
                <button onClick={() => setQuestTab('hidden')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${questTab === 'hidden'
                        ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
                        : 'bg-gray-900 border border-gray-800 text-gray-500'}`}>
                    <Lock size={12} className="inline mr-1" />Hidden ({unlockedHidden.size}/10)
                </button>
            </div>

            {questTab === 'weekly' && (
                <>
                    <p className="text-[10px] text-gray-500">New quests every Monday. Complete them to earn XP!</p>
                    {weeklyQuests.map((quest, idx) => {
                        const prog = questProgress[quest.id] || 0;
                        const done = prog >= quest.target;
                        const pct = Math.min(100, (prog / quest.target) * 100);
                        return (
                            <motion.div key={quest.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className={`bg-gray-900 border rounded-2xl p-4 ${done ? 'border-lime/30 bg-lime/5' : 'border-gray-800'}`}>
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{quest.icon}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h4 className={`font-bold text-sm ${done ? 'text-lime' : 'text-white'}`}>{quest.title}</h4>
                                            {done && <Check size={14} className="text-lime" />}
                                        </div>
                                        <p className="text-[10px] text-gray-500 mb-2">{quest.description}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                                    transition={{ duration: 0.8, delay: idx * 0.08 }}
                                                    className={`h-full rounded-full ${done ? 'bg-lime' : 'bg-purple-500'}`} />
                                            </div>
                                            <span className={`text-[10px] font-bold ${done ? 'text-lime' : 'text-gray-400'}`}>{prog}/{quest.target}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-yellow-400 shrink-0">+{quest.xpReward}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </>
            )}

            {questTab === 'hidden' && (
                <>
                    <p className="text-[10px] text-gray-500">Hidden quests are revealed when you achieve something special. Shareable when unlocked!</p>
                    {hiddenQuests.map((quest, idx) => {
                        const isUnlocked = unlockedHidden.has(quest.id);
                        const reveal = hiddenQuestReveals[quest.id];
                        return (
                            <motion.div key={quest.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.06 }}
                                className={`bg-gray-900 border rounded-2xl p-4 ${isUnlocked
                                    ? 'border-yellow-500/30 bg-yellow-500/5'
                                    : 'border-gray-800 opacity-60'}`}>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{isUnlocked ? reveal?.icon : '🔒'}</span>
                                    <div className="flex-1">
                                        <h4 className={`font-bold text-sm ${isUnlocked ? 'text-yellow-400' : 'text-gray-600'}`}>
                                            {isUnlocked ? reveal?.title : '???'}
                                        </h4>
                                        <p className="text-[10px] text-gray-500">
                                            {isUnlocked ? reveal?.description : quest.description}
                                        </p>
                                    </div>
                                    {isUnlocked ? (
                                        <span className="text-[10px] font-bold text-yellow-400">+{quest.xpReward} XP ✓</span>
                                    ) : (
                                        <Lock size={14} className="text-gray-600" />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </>
            )}
        </motion.div>
    );
};

export default QuestSection;
