import { useState, useRef } from 'react';
import { mockUsers } from '../lib/mock';
import { useGyms } from '../context/GymContext';
import { useAuth } from '../context/AuthContext';
import {
    getRankFromLifts, getNextRank, getRankProgress, getBig4Total,
    getActiveWeeklyQuests, DUEL_TEMPLATES, HIDDEN_QUESTS, HIDDEN_QUEST_REVEALS,
    checkDuelFairness,
    Duel, GymWarEntry, Big4Lifts
} from '../lib/gamification';
import {
    Swords, Target, Shield, Flame,
    Plus, Check, X, Zap, Timer, Users, Lock, Image, Upload,
    ChevronUp, ChevronDown, Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'wars' | 'duels' | 'quests';

export default function Arena() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('wars');
    const [showDuelCreator, setShowDuelCreator] = useState(false);
    const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null);
    const [selectedDuelTemplate, setSelectedDuelTemplate] = useState<number | null>(null);
    const [questTab, setQuestTab] = useState<'weekly' | 'hidden'>('weekly');
    const proofInputRef = useRef<HTMLInputElement>(null);
    const [customExercise, setCustomExercise] = useState('');
    const [customTarget, setCustomTarget] = useState('');
    const [useCustomDuel, setUseCustomDuel] = useState(false);

    // Read Big 4 from user profile
    const lifts: Big4Lifts = user?.big4 || { bench: 0, squat: 0, deadlift: 0, ohp: 0 };
    const rank = getRankFromLifts(lifts);
    const nextRank = getNextRank(lifts);
    const progress = getRankProgress(lifts);
    const total = getBig4Total(lifts);

    // ═══ QUESTS ═══
    const weeklyQuests = getActiveWeeklyQuests();
    const [questProgress] = useState<Record<string, number>>(() => {
        const p: Record<string, number> = {};
        weeklyQuests.forEach(q => { p[q.id] = Math.floor(Math.random() * (q.target + 1)); });
        return p;
    });
    const [unlockedHidden] = useState<Set<string>>(new Set(['hq1', 'hq4', 'hq7'])); // mock unlocked

    // ═══ GYM WARS ═══
    const { gyms: allGyms } = useGyms();
    const gymWars: GymWarEntry[] = (allGyms.length > 0 ? allGyms : []).slice(0, 6).map((g) => ({
        gymId: g.id, gymName: g.name, location: g.location,
        totalWorkouts: Math.floor(Math.random() * 200) + 50,
        totalXP: Math.floor(Math.random() * 50000) + 10000,
        memberCount: g.member_count, streak: Math.floor(Math.random() * 10) + 1, rank: 0,
    })).sort((a, b) => b.totalWorkouts - a.totalWorkouts).map((g, i) => ({ ...g, rank: i + 1 }));
    const userGym = gymWars.find(g => g.gymId === user?.home_gym);

    // ═══ DUELS ═══
    const [duels, setDuels] = useState<Duel[]>([
        {
            id: 'd1', challengerId: 'u1', challengerName: mockUsers[0]?.name || 'Alex',
            challengerAvatar: mockUsers[0]?.profile_image_url || '', opponentId: user?.id || '',
            opponentName: user?.name || 'You', opponentAvatar: user?.profile_image_url || '',
            type: 'weight', exercise: 'Bench Press', target: 'Heaviest 1RM',
            status: 'active', challengerProgress: 225, opponentProgress: 205,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            endsAt: '5d left', xpReward: 150,
        },
        {
            id: 'd2', challengerId: user?.id || '', challengerName: user?.name || 'You',
            challengerAvatar: user?.profile_image_url || '', opponentId: 'u3',
            opponentName: mockUsers[2]?.name || 'Taylor', opponentAvatar: mockUsers[2]?.profile_image_url || '',
            type: 'reps', exercise: 'Pull-ups', target: '100 total reps',
            status: 'pending', challengerProgress: 0, opponentProgress: 0,
            createdAt: new Date().toISOString(),
            endsAt: '48h to accept', xpReward: 150,
        },
    ]);

    const handleCreateDuel = () => {
        if (selectedOpponent === null || selectedDuelTemplate === null || !user) return;
        const opponent = mockUsers.find(u => u.id === selectedOpponent);
        const template = DUEL_TEMPLATES[selectedDuelTemplate];
        if (!opponent || !template) return;
        setDuels(prev => [{
            id: `d${Date.now()}`, challengerId: user.id, challengerName: user.name,
            challengerAvatar: user.profile_image_url, opponentId: opponent.id,
            opponentName: opponent.name, opponentAvatar: opponent.profile_image_url,
            type: template.type, exercise: template.exercise, target: template.target,
            status: 'pending', challengerProgress: 0, opponentProgress: 0,
            createdAt: new Date().toISOString(), endsAt: '48h to accept', xpReward: 150,
        }, ...prev]);
        setShowDuelCreator(false);
        setSelectedOpponent(null);
        setSelectedDuelTemplate(null);
    };

    const tabs: { key: Tab; icon: typeof Swords; label: string }[] = [
        { key: 'wars', icon: Shield, label: 'Gym Wars' },
        { key: 'duels', icon: Swords, label: 'Duels' },
        { key: 'quests', icon: Target, label: 'Quests' },
    ];

    return (
        <div className="flex flex-col min-h-screen pb-32">
            {/* ═══ HEADER: RANK + STRENGTH ═══ */}
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
                            <p className="text-xl font-black text-white">{total}<span className="text-xs text-gray-500 ml-1">lbs</span></p>
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
                                    {nextRank.icon} {nextRank.name} — need {nextRank.minTotal - total}lbs more
                                </span>
                            </div>
                        </>
                    )}

                    {/* Big 4 Summary (read-only, edit on Profile) */}
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

            {/* Tab Bar */}
            <div className="flex px-4 gap-1.5 mb-4">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab.key
                                ? 'bg-lime/10 border border-lime/40 text-lime'
                                : 'bg-gray-900 border border-gray-800 text-gray-500 hover:text-gray-300'}`}
                        >
                            <Icon size={14} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ═══ GYM WARS ═══ */}
            {activeTab === 'wars' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 space-y-3">
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
                            <motion.div key={gym.gymId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.06 }}
                                className={`flex items-center gap-3 p-3 rounded-2xl border ${isMyGym ? 'bg-lime/5 border-lime/30' : 'bg-gray-900 border-gray-800'}`}
                            >
                                <div className="text-2xl w-8 text-center shrink-0">
                                    {idx < 3 ? medals[idx] : <span className="text-sm font-bold text-gray-600">#{gym.rank}</span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h4 className={`font-bold text-sm truncate ${isMyGym ? 'text-lime' : 'text-white'}`}>{gym.gymName}</h4>
                                        {isMyGym && <span className="text-[8px] bg-lime/20 text-lime px-1.5 py-0.5 rounded font-bold shrink-0">YOU</span>}
                                    </div>
                                    <p className="text-[10px] text-gray-500">{gym.location} · {gym.memberCount} members</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-bold text-white">{gym.totalWorkouts}</p>
                                    <p className="text-[9px] text-gray-500">workouts</p>
                                </div>
                                <div className="flex items-center gap-0.5 text-orange-400 shrink-0">
                                    <Flame size={10} /><span className="text-[10px] font-bold">{gym.streak}d</span>
                                </div>
                            </motion.div>
                        );
                    })}
                    {userGym && (
                        <div className="mt-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-4 text-center">
                            <p className="text-xs text-gray-400 mb-1">Your gym is ranked</p>
                            <p className="text-3xl font-black text-white">#{userGym.rank}</p>
                            <p className="text-xs text-gray-500 mt-1">Workouts you log = points for <span className="text-lime font-bold">{userGym.gymName}</span></p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* ═══ DUELS ═══ */}
            {activeTab === 'duels' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                            <Swords size={16} className="text-red-400" /> Your Duels
                        </h3>
                        <button onClick={() => setShowDuelCreator(true)}
                            className="flex items-center gap-1 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-xl text-[10px] font-bold hover:opacity-80 active:scale-95 transition-all"
                        >
                            <Plus size={12} /> Challenge
                        </button>
                    </div>

                    {/* Duel rules callout */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 text-[10px] text-gray-500 flex items-start gap-2">
                        <Upload size={12} className="text-yellow-500 mt-0.5 shrink-0" />
                        <span>Duels require <span className="text-yellow-400 font-bold">proof</span> — post your lift to validate. 48h to accept, 7 days to complete.</span>
                    </div>

                    {duels.map((duel, idx) => {
                        const isChallenger = duel.challengerId === user?.id;
                        const myProgress = isChallenger ? duel.challengerProgress : duel.opponentProgress;
                        const theirProgress = isChallenger ? duel.opponentProgress : duel.challengerProgress;
                        const theirName = isChallenger ? duel.opponentName : duel.challengerName;
                        const theirAvatar = isChallenger ? duel.opponentAvatar : duel.challengerAvatar;
                        const winning = myProgress > theirProgress;
                        const isPending = duel.status === 'pending';

                        return (
                            <motion.div key={duel.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className={`bg-gray-900 border rounded-2xl p-4 space-y-3 ${isPending ? 'border-yellow-500/20' : 'border-gray-800'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isPending
                                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                            : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                            {duel.status.toUpperCase()}
                                        </span>
                                        <span className="text-xs font-bold text-white">{duel.exercise}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <Timer size={10} /><span className="text-[10px]">{duel.endsAt}</span>
                                    </div>
                                </div>

                                {isPending ? (
                                    <div className="text-center py-2">
                                        <p className="text-xs text-yellow-400 mb-1">⏳ Waiting for {theirName.split(' ')[0]} to accept</p>
                                        <p className="text-[10px] text-gray-500">Challenge expires in 48 hours</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 text-center">
                                            <img src={user?.profile_image_url} className="w-12 h-12 rounded-full border-2 border-lime mx-auto mb-1 object-cover" />
                                            <p className="text-[10px] font-bold text-lime">You</p>
                                            <p className="text-lg font-black text-white">{myProgress}</p>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-lg font-black text-gray-600">VS</span>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-0.5 ${winning
                                                ? 'bg-lime/10 text-lime' : 'bg-red-500/10 text-red-400'}`}>
                                                {winning ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                                {winning ? 'LEADING' : 'BEHIND'}
                                            </span>
                                        </div>
                                        <div className="flex-1 text-center">
                                            <img src={theirAvatar} className="w-12 h-12 rounded-full border-2 border-gray-700 mx-auto mb-1 object-cover" />
                                            <p className="text-[10px] font-bold text-gray-400">{theirName.split(' ')[0]}</p>
                                            <p className="text-lg font-black text-white">{theirProgress}</p>
                                        </div>
                                    </div>
                                )}

                                {!isPending && (
                                    <div className="flex items-center gap-2">
                                        <input ref={proofInputRef} type="file" accept="image/*,video/*" className="hidden" />
                                        <button onClick={() => proofInputRef.current?.click()}
                                            className="flex-1 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-yellow-500/20 active:scale-95 transition-all"
                                        >
                                            <Image size={12} /> Post Proof
                                        </button>
                                        <p className="text-[9px] text-gray-500">🏆 {duel.xpReward} XP</p>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {/* ═══ QUESTS ═══ */}
            {activeTab === 'quests' && (
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
                            {HIDDEN_QUESTS.map((quest, idx) => {
                                const isUnlocked = unlockedHidden.has(quest.id);
                                const reveal = HIDDEN_QUEST_REVEALS[quest.id];
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
            )}

            {/* ═══ DUEL CREATOR ═══ */}
            <AnimatePresence>
                {showDuelCreator && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            className="bg-gray-900 border-t border-gray-800 rounded-t-3xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                    <Swords size={20} className="text-red-400" /> New Duel
                                </h3>
                                <button onClick={() => setShowDuelCreator(false)} className="p-2 text-gray-400 hover:text-white rounded-lg"><X size={20} /></button>
                            </div>

                            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 mb-4 text-[10px] text-yellow-400 flex items-start gap-2">
                                <Upload size={12} className="mt-0.5 shrink-0" />
                                <span>Weight duels require <strong>proof</strong>. You must post your lift for it to count. Challenge expires in <strong>48h</strong>, must complete in <strong>7 days</strong>.</span>
                            </div>

                            <div className="mb-5">
                                <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1"><Users size={12} /> Choose Opponent</p>
                                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                    {mockUsers.filter(u => u.id !== user?.id).map(u => {
                                        const opRank = u.big4 ? getRankFromLifts(u.big4) : null;
                                        return (
                                            <button key={u.id} onClick={() => setSelectedOpponent(u.id)}
                                                className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${selectedOpponent === u.id
                                                    ? 'bg-lime/10 border-lime/30' : 'bg-gray-800/50 border-gray-800 hover:border-gray-700'}`}>
                                                <img src={u.profile_image_url} className="w-8 h-8 rounded-full border border-gray-700 object-cover" />
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-bold truncate ${selectedOpponent === u.id ? 'text-lime' : 'text-white'}`}>{u.name}</p>
                                                    <p className="text-[9px] text-gray-500">
                                                        {u.weight_kg || '?'}kg · {opRank ? `${opRank.icon} ${opRank.name}` : u.fitness_level}
                                                    </p>
                                                </div>
                                                {selectedOpponent === u.id && <Check size={14} className="text-lime shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Fairness indicator */}
                            {selectedOpponent && selectedDuelTemplate !== null && DUEL_TEMPLATES[selectedDuelTemplate]?.type === 'weight' && (() => {
                                const opp = mockUsers.find(u => u.id === selectedOpponent);
                                if (!opp?.weight_kg || !user?.weight_kg) return null;
                                const myBig4 = user.big4 || { bench: 0, squat: 0, deadlift: 0, ohp: 0 };
                                const oppBig4 = opp.big4 || { bench: 0, squat: 0, deadlift: 0, ohp: 0 };
                                const fairness = checkDuelFairness(
                                    { liftLbs: getBig4Total(myBig4), bodyweightKg: user.weight_kg },
                                    { liftLbs: getBig4Total(oppBig4), bodyweightKg: opp.weight_kg }
                                );
                                return (
                                    <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ borderColor: fairness.color + '40', backgroundColor: fairness.color + '08' }}>
                                        <Scale size={14} style={{ color: fairness.color }} />
                                        <span className="text-[10px] font-bold" style={{ color: fairness.color }}>{fairness.label}</span>
                                        <span className="text-[9px] text-gray-500 ml-auto">
                                            You: {user.weight_kg}kg · {opp.name.split(' ')[0]}: {opp.weight_kg}kg — BW-adjusted scoring
                                        </span>
                                    </div>
                                );
                            })()}

                            {/* Challenge picker */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-gray-400 flex items-center gap-1"><Swords size={12} /> {useCustomDuel ? 'Custom Challenge' : 'Choose Challenge'}</p>
                                    <button onClick={() => { setUseCustomDuel(!useCustomDuel); setSelectedDuelTemplate(null); }}
                                        className="text-[10px] text-lime font-bold hover:underline">
                                        {useCustomDuel ? 'Use Templates' : 'Create Custom'}
                                    </button>
                                </div>

                                {useCustomDuel ? (
                                    <div className="space-y-2">
                                        <input type="text" value={customExercise} onChange={e => setCustomExercise(e.target.value)}
                                            placeholder="Exercise (e.g. Bench Press 3x8)"
                                            className="w-full bg-oled border border-gray-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-lime" />
                                        <input type="text" value={customTarget} onChange={e => setCustomTarget(e.target.value)}
                                            placeholder="Target (e.g. 225lbs for 8 reps)"
                                            className="w-full bg-oled border border-gray-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-lime" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {DUEL_TEMPLATES.map((t, i) => (
                                            <button key={i} onClick={() => setSelectedDuelTemplate(i)}
                                                className={`p-3 rounded-xl border text-left transition-all ${selectedDuelTemplate === i
                                                    ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-800/50 border-gray-800 hover:border-gray-700'}`}>
                                                <p className={`text-xs font-bold ${selectedDuelTemplate === i ? 'text-red-400' : 'text-white'}`}>{t.exercise}</p>
                                                <p className="text-[9px] text-gray-500 mt-0.5">{t.target}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button onClick={() => {
                                if (useCustomDuel && customExercise.trim() && customTarget.trim() && selectedOpponent && user) {
                                    const opp = mockUsers.find(u => u.id === selectedOpponent);
                                    if (!opp) return;
                                    setDuels(prev => [{
                                        id: `d${Date.now()}`, challengerId: user.id, challengerName: user.name,
                                        challengerAvatar: user.profile_image_url, opponentId: opp.id,
                                        opponentName: opp.name, opponentAvatar: opp.profile_image_url,
                                        type: 'custom', exercise: customExercise.trim(), target: customTarget.trim(),
                                        status: 'pending', challengerProgress: 0, opponentProgress: 0,
                                        createdAt: new Date().toISOString(), endsAt: '48h to accept', xpReward: 150,
                                    }, ...prev]);
                                    setShowDuelCreator(false); setSelectedOpponent(null); setCustomExercise(''); setCustomTarget('');
                                } else {
                                    handleCreateDuel();
                                }
                            }}
                                disabled={selectedOpponent === null || (useCustomDuel ? !customExercise.trim() || !customTarget.trim() : selectedDuelTemplate === null)}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 flex items-center justify-center gap-2">
                                <Swords size={18} /> Send Challenge
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
