import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Trophy, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';

interface FamilyMember {
    id: string;
    name: string;
    flag: string;
    weeklyGoal: number;
    sessionsCompleted: number;
    lastWorkout: string;
    highFives: number;
}

const STORAGE_KEY = 'ironmatch_family_clan_v2';

const DEFAULT_MEMBERS: FamilyMember[] = [
    {
        id: 'fam-dad',
        name: 'Dad',
        flag: '🇳🇱',
        weeklyGoal: 3,
        sessionsCompleted: 2,
        lastWorkout: 'Yesterday',
        highFives: 18,
    },
    {
        id: 'fam-bro',
        name: 'Brother',
        flag: '🇳🇱',
        weeklyGoal: 4,
        sessionsCompleted: 3,
        lastWorkout: 'Today',
        highFives: 24,
    },
    {
        id: 'fam-marvin',
        name: 'Marvin (You)',
        flag: '🇮🇩',
        weeklyGoal: 5,
        sessionsCompleted: 4,
        lastWorkout: 'Today',
        highFives: 35,
    },
];

export default function FamilyCircle() {
    const { showToast } = useToast();
    const [members, setMembers] = useState<FamilyMember[]>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : DEFAULT_MEMBERS;
        } catch {
            return DEFAULT_MEMBERS;
        }
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newFlag, setNewFlag] = useState('🇳🇱');
    const [newGoal, setNewGoal] = useState<number>(3);

    const saveMembers = (updated: FamilyMember[]) => {
        setMembers(updated);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch { /* storage */ }
    };

    const handleHighFive = (id: string, name: string) => {
        if ('vibrate' in navigator) navigator.vibrate(50);
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });

        const updated = members.map(m => {
            if (m.id === id) {
                return { ...m, highFives: m.highFives + 1 };
            }
            return m;
        });
        saveMembers(updated);
        showToast(`🔥 High-Five sent to ${name}!`, 'success');
    };

    const handleLogSession = (id: string, name: string) => {
        const updated = members.map(m => {
            if (m.id === id) {
                const nextCount = Math.min(m.weeklyGoal + 2, m.sessionsCompleted + 1);
                return { ...m, sessionsCompleted: nextCount, lastWorkout: 'Today' };
            }
            return m;
        });
        saveMembers(updated);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        showToast(`Logged workout session for ${name}! 🎉`, 'success');
    };

    const totalCompleted = members.reduce((sum, m) => sum + m.sessionsCompleted, 0);
    const totalGoal = members.reduce((sum, m) => sum + m.weeklyGoal, 0);
    const clanPct = Math.min(100, Math.round((totalCompleted / (totalGoal || 1)) * 100));

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        const newMem: FamilyMember = {
            id: `fam-${Date.now()}`,
            name: newName.trim(),
            flag: newFlag.trim() || '🇳🇱',
            weeklyGoal: newGoal > 0 ? newGoal : 3,
            sessionsCompleted: 0,
            lastWorkout: 'Not yet this week',
            highFives: 0
        };

        const updated = [...members, newMem];
        saveMembers(updated);
        setShowAddModal(false);
        setNewName('');
        showToast(`Added ${newMem.name} to Family Clan!`, 'success');
    };

    return (
        <div className="p-5 bg-gray-950 border border-gray-800 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-xl">
                        <Users size={20} />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-white">Family Clan Accountability</h3>
                        <p className="text-xs text-gray-400">Keep Dad & Brother on track across timezones</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="p-1.5 text-gray-400 hover:text-lime rounded-lg border border-gray-800"
                >
                    <Plus size={16} />
                </button>
            </div>

            {/* Clan Weekly Goal Meter */}
            <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl space-y-2 font-mono">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300 font-bold flex items-center gap-1.5">
                        <Trophy size={14} className="text-lime" /> Shared Clan Weekly Pot
                    </span>
                    <span className="text-lime font-black">
                        {totalCompleted} / {totalGoal} Sessions ({clanPct}%)
                    </span>
                </div>
                <div className="w-full bg-black h-2.5 rounded-full overflow-hidden border border-gray-800">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${clanPct}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-lime shadow-[0_0_10px_#32FF32]"
                    />
                </div>
            </div>

            {/* Members List */}
            <div className="space-y-3">
                {members.map(member => {
                    const pct = Math.min(100, Math.round((member.sessionsCompleted / member.weeklyGoal) * 100));
                    const isComplete = member.sessionsCompleted >= member.weeklyGoal;

                    return (
                        <div
                            key={member.id}
                            className="p-3.5 bg-gray-900/60 border border-gray-800/80 rounded-xl space-y-2.5"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{member.flag}</span>
                                    <div>
                                        <p className="text-sm font-bold text-white flex items-center gap-1.5">
                                            {member.name}
                                            {isComplete && <Sparkles size={12} className="text-lime" />}
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            Worked out: <span className="text-gray-300 font-medium">{member.lastWorkout}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleHighFive(member.id, member.name)}
                                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-mono font-bold flex items-center gap-1 active:scale-95 transition-transform"
                                    >
                                        <span>🔥</span>
                                        <span>{member.highFives}</span>
                                    </button>
                                    <button
                                        onClick={() => handleLogSession(member.id, member.name)}
                                        className="px-2.5 py-1 bg-lime/10 hover:bg-lime/20 text-lime border border-lime/30 rounded-lg text-xs font-bold active:scale-95 transition-transform"
                                    >
                                        + Log
                                    </button>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                                    <span>{member.sessionsCompleted} of {member.weeklyGoal} sessions</span>
                                    <span className={isComplete ? 'text-lime font-bold' : ''}>{pct}%</span>
                                </div>
                                <div className="w-full bg-black h-1.5 rounded-full overflow-hidden">
                                    <div
                                        style={{ width: `${pct}%` }}
                                        className={`h-full rounded-full ${isComplete ? 'bg-lime' : 'bg-blue-400'}`}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal to add family member */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-gray-950 border border-gray-800 rounded-2xl p-5 shadow-2xl space-y-4">
                        <h4 className="text-sm font-bold text-white">Add Family Member</h4>
                        <form onSubmit={handleAddMember} className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Dad, Brother, Mom..."
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    required
                                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-lime"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Flag</label>
                                    <input
                                        type="text"
                                        value={newFlag}
                                        onChange={e => setNewFlag(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-lime"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Weekly Goal (Sessions)</label>
                                    <input
                                        type="number"
                                        value={newGoal}
                                        onChange={e => setNewGoal(Number(e.target.value))}
                                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-lime"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2 text-xs font-bold text-gray-400 bg-gray-900 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 text-xs font-black text-oled bg-lime rounded-xl hover:bg-lime/90"
                                >
                                    Add Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
