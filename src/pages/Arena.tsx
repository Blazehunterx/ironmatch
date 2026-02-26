import { useState } from 'react';
import { mockUsers, mockGyms } from '../lib/mock';
import { useAuth } from '../context/AuthContext';
import {
    getRank, getNextRank, getXPProgress, getActiveQuests,
    DUEL_TEMPLATES, Duel, GymWarEntry
} from '../lib/gamification';
import {
    Trophy, Swords, Target, Shield, Flame,
    Plus, Check, X, Zap, Timer, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'wars' | 'duels' | 'quests';

export default function Arena() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('wars');
    const [showDuelCreator, setShowDuelCreator] = useState(false);
    const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null);
    const [selectedDuelTemplate, setSelectedDuelTemplate] = useState<number | null>(null);

    // Mock XP for current user
    const userXP = 1750;
    const rank = getRank(userXP);
    const nextRank = getNextRank(userXP);
    const xpProgress = getXPProgress(userXP);

    // Mock quest progress
    const quests = getActiveQuests();
    const [questProgress] = useState<Record<string, number>>(() => {
        const progress: Record<string, number> = {};
        quests.forEach(q => {
            progress[q.id] = Math.floor(Math.random() * (q.target + 1));
        });
        return progress;
    });

    // Mock Gym Wars leaderboard
    const gymWars: GymWarEntry[] = mockGyms.slice(0, 6).map((g, i) => ({
        gymId: g.id,
        gymName: g.name,
        location: g.location,
        totalWorkouts: Math.floor(Math.random() * 200) + 50,
        totalXP: Math.floor(Math.random() * 50000) + 10000,
        memberCount: g.member_count,
        streak: Math.floor(Math.random() * 10) + 1,
        rank: i + 1,
    })).sort((a, b) => b.totalWorkouts - a.totalWorkouts).map((g, i) => ({ ...g, rank: i + 1 }));

    const userGym = gymWars.find(g => g.gymId === user?.home_gym);

    // Mock active duels
    const [duels, setDuels] = useState<Duel[]>([
        {
            id: 'd1', challengerId: 'u1', challengerName: mockUsers[0]?.name || 'Alex',
            challengerAvatar: mockUsers[0]?.profile_image_url || '', opponentId: user?.id || '',
            opponentName: user?.name || 'You', opponentAvatar: user?.profile_image_url || '',
            type: 'reps', exercise: 'Push-ups', target: '200 total reps',
            status: 'active', challengerProgress: 145, opponentProgress: 120,
            endsAt: '3d left', xpReward: 150,
        },
        {
            id: 'd2', challengerId: user?.id || '', challengerName: user?.name || 'You',
            challengerAvatar: user?.profile_image_url || '', opponentId: 'u3',
            opponentName: mockUsers[2]?.name || 'Taylor', opponentAvatar: mockUsers[2]?.profile_image_url || '',
            type: 'workouts', exercise: 'Gym Sessions', target: '5 sessions',
            status: 'active', challengerProgress: 3, opponentProgress: 2,
            endsAt: '5d left', xpReward: 150,
        },
    ]);

    const handleCreateDuel = () => {
        if (selectedOpponent === null || selectedDuelTemplate === null) return;
        const opponent = mockUsers.find(u => u.id === selectedOpponent);
        const template = DUEL_TEMPLATES[selectedDuelTemplate];
        if (!opponent || !template || !user) return;

        const newDuel: Duel = {
            id: `d${Date.now()}`,
            challengerId: user.id,
            challengerName: user.name,
            challengerAvatar: user.profile_image_url,
            opponentId: opponent.id,
            opponentName: opponent.name,
            opponentAvatar: opponent.profile_image_url,
            type: template.type,
            exercise: template.exercise,
            target: template.target,
            status: 'pending',
            challengerProgress: 0,
            opponentProgress: 0,
            endsAt: '7d left',
            xpReward: 150,
        };
        setDuels(prev => [newDuel, ...prev]);
        setShowDuelCreator(false);
        setSelectedOpponent(null);
        setSelectedDuelTemplate(null);
    };

    const tabs: { key: Tab; icon: typeof Trophy; label: string }[] = [
        { key: 'wars', icon: Shield, label: 'Gym Wars' },
        { key: 'duels', icon: Swords, label: 'Duels' },
        { key: 'quests', icon: Target, label: 'Quests' },
    ];

    return (
        <div className="flex flex-col min-h-screen pb-32">
            {/* Header + XP Bar */}
            <div className="px-4 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                            Arena <Zap size={24} className="text-yellow-400" />
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">Compete. Rise. Dominate.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2">
                        <Flame size={16} className="text-orange-500" />
                        <span className="text-xs font-bold text-white">7d streak</span>
                    </div>
                </div>

                {/* XP Progress Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-800 rounded-2xl p-4"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{rank.icon}</span>
                            <div>
                                <h3 className="font-bold text-white text-sm" style={{ color: rank.color }}>
                                    {rank.name} Rank
                                </h3>
                                <p className="text-[10px] text-gray-500">{userXP.toLocaleString()} XP total</p>
                            </div>
                        </div>
                        {nextRank && (
                            <div className="text-right">
                                <p className="text-[9px] text-gray-500">Next: {nextRank.icon} {nextRank.name}</p>
                                <p className="text-[10px] font-bold" style={{ color: nextRank.color }}>
                                    {(nextRank.minXP - userXP).toLocaleString()} XP to go
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${xpProgress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${rank.color}, ${nextRank?.color || rank.color})` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1.5">
                        <span className="text-[9px] text-gray-600">{rank.minXP} XP</span>
                        <span className="text-[9px] text-gray-600">{nextRank?.minXP.toLocaleString() || 'MAX'} XP</span>
                    </div>
                </motion.div>
            </div>

            {/* Tab Bar */}
            <div className="flex px-4 gap-1.5 mb-4">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab.key
                                ? 'bg-lime/10 border border-lime/40 text-lime'
                                : 'bg-gray-900 border border-gray-800 text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <Icon size={14} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ═══ GYM WARS TAB ═══ */}
            {activeTab === 'wars' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 space-y-3"
                >
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                            <Shield size={16} className="text-blue-400" /> Weekly Gym Leaderboard
                        </h3>
                        <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold">Resets Mon</span>
                    </div>

                    {gymWars.map((gym, idx) => {
                        const isMyGym = gym.gymId === user?.home_gym;
                        const medals = ['🥇', '🥈', '🥉'];
                        return (
                            <motion.div
                                key={gym.gymId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${isMyGym
                                    ? 'bg-lime/5 border-lime/30'
                                    : 'bg-gray-900 border-gray-800'
                                    }`}
                            >
                                <div className="text-2xl w-8 text-center shrink-0">
                                    {idx < 3 ? medals[idx] : <span className="text-sm font-bold text-gray-600">#{gym.rank}</span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h4 className={`font-bold text-sm truncate ${isMyGym ? 'text-lime' : 'text-white'}`}>
                                            {gym.gymName}
                                        </h4>
                                        {isMyGym && (
                                            <span className="text-[8px] bg-lime/20 text-lime px-1.5 py-0.5 rounded font-bold shrink-0">YOU</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-500">{gym.location} · {gym.memberCount} members</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-bold text-white">{gym.totalWorkouts}</p>
                                    <p className="text-[9px] text-gray-500">workouts</p>
                                </div>
                                <div className="flex items-center gap-0.5 text-orange-400 shrink-0">
                                    <Flame size={10} />
                                    <span className="text-[10px] font-bold">{gym.streak}d</span>
                                </div>
                            </motion.div>
                        );
                    })}

                    {userGym && (
                        <div className="mt-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-4 text-center">
                            <p className="text-xs text-gray-400 mb-1">Your gym is ranked</p>
                            <p className="text-3xl font-black text-white">#{userGym.rank}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Every workout you log earns points for <span className="text-lime font-bold">{userGym.gymName}</span>
                            </p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* ═══ DUELS TAB ═══ */}
            {activeTab === 'duels' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 space-y-3"
                >
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                            <Swords size={16} className="text-red-400" /> Active Duels
                        </h3>
                        <button
                            onClick={() => setShowDuelCreator(true)}
                            className="flex items-center gap-1 bg-lime/10 border border-lime/30 text-lime px-3 py-1.5 rounded-xl text-[10px] font-bold hover:bg-lime/20 active:scale-95 transition-all"
                        >
                            <Plus size={12} /> Challenge
                        </button>
                    </div>

                    {duels.length === 0 ? (
                        <div className="text-center py-12 text-gray-600">
                            <Swords size={32} className="mx-auto mb-3 text-gray-700" />
                            <p className="font-medium">No active duels</p>
                            <p className="text-xs mt-1">Challenge someone to earn bonus XP!</p>
                        </div>
                    ) : (
                        duels.map((duel, idx) => {
                            const isChallenger = duel.challengerId === user?.id;
                            const myProgress = isChallenger ? duel.challengerProgress : duel.opponentProgress;
                            const theirProgress = isChallenger ? duel.opponentProgress : duel.challengerProgress;
                            const theirName = isChallenger ? duel.opponentName : duel.challengerName;
                            const theirAvatar = isChallenger ? duel.opponentAvatar : duel.challengerAvatar;
                            const winning = myProgress > theirProgress;

                            return (
                                <motion.div
                                    key={duel.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3"
                                >
                                    {/* Duel header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${duel.status === 'active'
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                }`}>{duel.status.toUpperCase()}</span>
                                            <span className="text-xs font-bold text-white">{duel.exercise}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <Timer size={10} />
                                            <span className="text-[10px]">{duel.endsAt}</span>
                                        </div>
                                    </div>

                                    {/* VS display */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 text-center">
                                            <img src={user?.profile_image_url} className="w-12 h-12 rounded-full border-2 border-lime mx-auto mb-1 object-cover" />
                                            <p className="text-[10px] font-bold text-lime">You</p>
                                            <p className="text-lg font-black text-white">{myProgress}</p>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-lg font-black text-gray-600">VS</span>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${winning
                                                ? 'bg-lime/10 text-lime'
                                                : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                {winning ? '⬆ LEADING' : '⬇ BEHIND'}
                                            </span>
                                        </div>
                                        <div className="flex-1 text-center">
                                            <img src={theirAvatar} className="w-12 h-12 rounded-full border-2 border-gray-700 mx-auto mb-1 object-cover" />
                                            <p className="text-[10px] font-bold text-gray-400">{theirName.split(' ')[0]}</p>
                                            <p className="text-lg font-black text-white">{theirProgress}</p>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-500">Target: {duel.target} · 🏆 {duel.xpReward} XP</p>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </motion.div>
            )}

            {/* ═══ QUESTS TAB ═══ */}
            {activeTab === 'quests' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 space-y-3"
                >
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                            <Target size={16} className="text-purple-400" /> Weekly Quests
                        </h3>
                        <span className="text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full font-bold">
                            {quests[0]?.expiresIn}
                        </span>
                    </div>

                    <p className="text-[10px] text-gray-500 -mt-1 mb-2">
                        Complete quests to earn bonus XP. New quests every Monday!
                    </p>

                    {quests.map((quest, idx) => {
                        const progress = questProgress[quest.id] || 0;
                        const completed = progress >= quest.target;
                        const pct = Math.min(100, (progress / quest.target) * 100);
                        return (
                            <motion.div
                                key={quest.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`bg-gray-900 border rounded-2xl p-4 transition-all ${completed
                                    ? 'border-lime/30 bg-lime/5'
                                    : 'border-gray-800'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{quest.icon}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h4 className={`font-bold text-sm ${completed ? 'text-lime' : 'text-white'}`}>
                                                {quest.title}
                                            </h4>
                                            {completed && <Check size={14} className="text-lime" />}
                                        </div>
                                        <p className="text-[10px] text-gray-500 mb-2">{quest.description}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                                                    className={`h-full rounded-full ${completed ? 'bg-lime' : 'bg-purple-500'}`}
                                                />
                                            </div>
                                            <span className={`text-[10px] font-bold ${completed ? 'text-lime' : 'text-gray-400'}`}>
                                                {progress}/{quest.target}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-[10px] font-bold text-yellow-400">+{quest.xpReward} XP</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* XP Summary */}
                    <div className="mt-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-white">Quest Rewards</p>
                                <p className="text-[10px] text-gray-500">
                                    {quests.filter(q => (questProgress[q.id] || 0) >= q.target).length}/{quests.length} completed
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black text-yellow-400">
                                    +{quests.filter(q => (questProgress[q.id] || 0) >= q.target).reduce((sum, q) => sum + q.xpReward, 0)} XP
                                </p>
                                <p className="text-[9px] text-gray-500">earned this week</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ═══ DUEL CREATOR MODAL ═══ */}
            <AnimatePresence>
                {showDuelCreator && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            className="bg-gray-900 border-t border-gray-800 rounded-t-3xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                    <Swords size={20} className="text-red-400" /> New Duel
                                </h3>
                                <button onClick={() => setShowDuelCreator(false)} className="p-2 text-gray-400 hover:text-white rounded-lg"><X size={20} /></button>
                            </div>

                            {/* Step 1: Pick opponent */}
                            <div className="mb-5">
                                <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1"><Users size={12} /> Choose Opponent</p>
                                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                    {mockUsers.filter(u => u.id !== user?.id).map(u => (
                                        <button
                                            key={u.id}
                                            onClick={() => setSelectedOpponent(u.id)}
                                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${selectedOpponent === u.id
                                                ? 'bg-lime/10 border-lime/30'
                                                : 'bg-gray-800/50 border-gray-800 hover:border-gray-700'
                                                }`}
                                        >
                                            <img src={u.profile_image_url} className="w-8 h-8 rounded-full border border-gray-700 object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-bold truncate ${selectedOpponent === u.id ? 'text-lime' : 'text-white'}`}>{u.name}</p>
                                                <p className="text-[9px] text-gray-500">{u.fitness_level}</p>
                                            </div>
                                            {selectedOpponent === u.id && <Check size={14} className="text-lime shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Step 2: Pick challenge */}
                            <div className="mb-5">
                                <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1"><Swords size={12} /> Choose Challenge</p>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {DUEL_TEMPLATES.map((t, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedDuelTemplate(i)}
                                            className={`p-3 rounded-xl border text-left transition-all ${selectedDuelTemplate === i
                                                ? 'bg-red-500/10 border-red-500/30'
                                                : 'bg-gray-800/50 border-gray-800 hover:border-gray-700'
                                                }`}
                                        >
                                            <p className={`text-xs font-bold ${selectedDuelTemplate === i ? 'text-red-400' : 'text-white'}`}>{t.exercise}</p>
                                            <p className="text-[9px] text-gray-500 mt-0.5">{t.target}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Create Button */}
                            <button
                                onClick={handleCreateDuel}
                                disabled={selectedOpponent === null || selectedDuelTemplate === null}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Swords size={18} /> Send Challenge
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
