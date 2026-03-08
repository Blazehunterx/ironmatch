import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGyms } from '../context/GymContext';
import {
    LogOut, Settings, Award, Flame, Activity, Edit2, Check, X, Camera,
    Target, CalendarDays, Zap, Users, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFriends } from '../context/FriendsContext';
import {
    Goal, DayOfWeek, TimeBlock,
    ALL_GOALS, ALL_DAYS, ALL_TIME_BLOCKS
} from '../types/database';
import { getRankFromLifts, getBig4Total } from '../lib/gamification';
import { COSMETIC_ITEMS } from '../lib/cosmetics';
import CosmeticShop from '../components/CosmeticShop';
import { isSupabaseConfigured } from '../lib/supabase';
import React from 'react';

const goalEmoji: Record<string, string> = {
    'Workout Buddy': '🤝', 'Socialize': '💬', 'Get Pushed': '🔥', 'Learn': '📚',
    'Train for Competition': '🏋️', 'Lose Weight': '💪', 'Recovery Partner': '🧘', 'Cardio Partner': '🏃',
};

export default function Profile() {
    const { user, logout, updateUser } = useAuth();
    const { findGym } = useGyms();

    // Bio editing
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [editBioText, setEditBioText] = useState('');

    // Settings
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isTrainer, setIsTrainer] = useState(user?.is_trainer || false);
    const [unitPref, setUnitPref] = useState<'lbs' | 'kg'>(user?.unit_preference || 'lbs');
    const [isShopOpen, setIsShopOpen] = useState(false);

    // Image
    const [isEditingImage, setIsEditingImage] = useState(false);
    const [editImageUrl, setEditImageUrl] = useState('');

    // Goals editing
    const [isEditingGoals, setIsEditingGoals] = useState(false);
    const [editGoals, setEditGoals] = useState<Goal[]>(user?.goals || []);

    // Availability editing
    const [isEditingAvailability, setIsEditingAvailability] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!user) return;
        // Logs were here but unused, removed to resolve TS6133
    }, [user?.id]);

    if (!user) return null;
    const homeGym = findGym(user.home_gym);

    const handleSaveBio = () => {
        setIsEditingBio(false);
        updateUser({ bio: editBioText });
    };

    const handleSaveTrainer = (newVal: boolean) => {
        setIsTrainer(newVal);
        updateUser({ is_trainer: newVal });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const result = ev.target?.result as string;
            setEditImageUrl(result);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveImage = () => {
        setIsEditingImage(false);
        if (editImageUrl.trim()) {
            updateUser({ profile_image_url: editImageUrl });
        }
    };

    const toggleGoal = (goal: Goal) => {
        setEditGoals(prev => {
            if (prev.includes(goal)) return prev.filter(g => g !== goal);
            if (prev.length >= 2) return prev;
            return [...prev, goal];
        });
    };

    const handleSaveGoals = () => {
        setIsEditingGoals(false);
        updateUser({ goals: editGoals });
    };

    const toggleAvailBlock = (day: DayOfWeek, block: TimeBlock) => {
        const current = user.availability || [];
        const daySlot = current.find(a => a.day === day);
        let updated;
        if (daySlot) {
            const hasBlock = daySlot.blocks.includes(block);
            const newBlocks = hasBlock ? daySlot.blocks.filter(b => b !== block) : [...daySlot.blocks, block];
            if (newBlocks.length === 0) {
                updated = current.filter(a => a.day !== day);
            } else {
                updated = current.map(a => a.day === day ? { ...a, blocks: newBlocks } : a);
            }
        } else {
            updated = [...current, { day, blocks: [block] }];
        }
        updateUser({ availability: updated });
    };

    const isDayBlockActive = (day: DayOfWeek, block: TimeBlock) => {
        return user.availability?.find(a => a.day === day)?.blocks.includes(block) || false;
    };

    return (
        <div className="flex flex-col min-h-screen px-4 pt-8 pb-24 relative overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 shrink-0">
                <h2 className="text-3xl font-bold text-white">Profile</h2>
                <div className="flex gap-2">
                    {((user?.xp || 0) >= 100 || user?.is_trainer) && (
                        <button
                            onClick={() => setIsShopOpen(true)}
                            className="p-2 text-yellow-400 hover:text-white rounded-full bg-yellow-400/10 border border-yellow-400/20 active:scale-95 transition-all"
                        >
                            <Zap size={20} className="fill-current" />
                        </button>
                    )}
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2 text-gray-400 hover:text-white rounded-full bg-gray-900 border border-gray-800 active:scale-95 transition-all"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8 shrink-0">
                <div className="relative mb-4 group">
                    <div className={`p-1 rounded-full transition-all ${user.active_cosmetic_frame
                        ? COSMETIC_ITEMS.find(i => i.id === user.active_cosmetic_frame)?.previewValue
                        : 'border-4 border-gray-900'
                        }`}>
                        <img
                            src={user.profile_image_url}
                            alt={user.name}
                            className="w-28 h-28 rounded-full shadow-xl object-cover bg-gray-800 transition-opacity group-hover:opacity-80"
                        />
                    </div>
                    <div className="absolute bottom-1 right-1 p-1.5 bg-lime rounded-full text-oled border-2 border-oled shadow-lg">
                        <Activity size={16} />
                    </div>
                    <button
                        onClick={() => { setEditImageUrl(user.profile_image_url); setIsEditingImage(true); }}
                        className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                        <Camera className="text-white mb-1" size={24} />
                        <span className="text-[10px] font-semibold text-white">Edit</span>
                    </button>
                </div>
                <div className="text-center">
                    <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2">
                        {user.name}
                        {user.verification_status === 'verified' && <Award size={18} className="text-lime" />}
                    </h3>
                    <p className="text-lime font-bold text-sm uppercase tracking-widest mt-1">
                        Rank: {getRankFromLifts(user.big4 || { bench: 0, squat: 0, deadlift: 0, ohp: 0 }).name}
                    </p>
                </div>
                <p className="text-gray-400 mt-1 flex items-center gap-1">
                    {homeGym?.name || 'No gym set'}
                </p>
            </div>

            {/* User ID & Status - AT THE TOP FOR VISIBILITY */}
            <div className="px-2 pb-6 space-y-4 shrink-0">
                <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your User ID</h4>
                            <p className="text-[10px] text-gray-600">Unique database identifier</p>
                        </div>
                        <button
                            onClick={() => {
                                if (user?.id) {
                                    navigator.clipboard.writeText(user.id);
                                    alert('User ID copied to clipboard!');
                                }
                            }}
                            className="px-3 py-1.5 bg-lime text-oled text-[10px] font-bold rounded-lg active:scale-95 transition-all shadow-lg shadow-lime/20"
                        >
                            Copy ID
                        </button>
                    </div>
                    <div className="bg-oled/60 rounded-xl p-3 border border-gray-800/50">
                        <code className="text-[10px] text-lime font-mono break-all opacity-80">{user?.id}</code>
                    </div>
                </div>

                <div className="flex items-center justify-between px-2 pt-1">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-lime animate-pulse' : 'bg-orange-500'}`} />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {isSupabaseConfigured ? 'Live Database Active' : 'Offline Mode'}
                        </span>
                    </div>
                    <span className="text-[10px] text-gray-700 font-mono">v1.2.5-stable</span>
                </div>
            </div>

            {/* Content Body */}
            <div className="space-y-4">
                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-3xl text-center">
                        <Flame className="text-orange-500 mx-auto mb-1" size={20} />
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Streak</p>
                        <p className="text-xl font-black text-white">{user.reliability_streak}d</p>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-3xl text-center">
                        <Target className="text-lime mx-auto mb-1" size={20} />
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Total</p>
                        <p className="text-xl font-black text-white">
                            {getBig4Total(user.big4 || { bench: 0, squat: 0, deadlift: 0, ohp: 0 })}
                        </p>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-3xl text-center">
                        <Zap className="text-yellow-400 mx-auto mb-1" size={20} />
                        <p className="text-[10px] text-gray-500 uppercase font-bold">XP</p>
                        <p className="text-xl font-black text-white">{user.xp || 0}</p>
                    </div>
                </div>

                {/* Bio Section */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-white flex items-center gap-2"><Activity size={16} className="text-lime" /> About</h4>
                        <button onClick={() => { setEditBioText(user.bio || ''); setIsEditingBio(!isEditingBio); }} className="text-gray-500 hover:text-lime">
                            {isEditingBio ? <Check size={16} /> : <Edit2 size={16} />}
                        </button>
                    </div>
                    {isEditingBio ? (
                        <div className="space-y-3">
                            <textarea
                                value={editBioText}
                                onChange={(e) => setEditBioText(e.target.value)}
                                className="w-full bg-oled border border-gray-800 rounded-xl p-3 text-sm text-gray-300 focus:outline-none focus:border-lime"
                                rows={3}
                            />
                            <button onClick={handleSaveBio} className="w-full py-2 bg-lime text-oled rounded-lg text-xs font-bold">Save</button>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 leading-relaxed italic">"{user.bio || 'No bio yet.'}"</p>
                    )}
                </div>

                {/* Goals Section */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-white flex items-center gap-2"><Target size={16} className="text-lime" /> Focus</h4>
                        <button onClick={() => setIsEditingGoals(!isEditingGoals)} className="text-gray-500 hover:text-lime">
                            {isEditingGoals ? <Check size={16} /> : <Edit2 size={16} />}
                        </button>
                    </div>
                    {isEditingGoals ? (
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
                            <button onClick={handleSaveGoals} className="w-full py-2 bg-lime text-oled rounded-lg text-xs font-bold">Save Goals</button>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {user.goals?.map(g => (
                                <span key={g} className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-800 text-gray-300 border border-gray-700/50">
                                    {goalEmoji[g]} {g}
                                </span>
                            )) || <p className="text-sm text-gray-500">No goals set.</p>}
                        </div>
                    )}
                </div>

                {/* Friends Section Wrapper */}
                <FriendsSection />

                {/* Availability Section */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-white flex items-center gap-2"><CalendarDays size={16} className="text-lime" /> Schedule</h4>
                        <button onClick={() => setIsEditingAvailability(!isEditingAvailability)} className="text-gray-500 hover:text-lime">
                            {isEditingAvailability ? <Check size={16} /> : <Edit2 size={16} />}
                        </button>
                    </div>
                    {isEditingAvailability ? (
                        <div className="grid grid-cols-4 gap-1">
                            {ALL_DAYS.map(day => (
                                <React.Fragment key={day}>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase flex items-center">{day}</div>
                                    {ALL_TIME_BLOCKS.map(block => (
                                        <button
                                            key={`${day}-${block}`}
                                            onClick={() => toggleAvailBlock(day, block)}
                                            className={`p-1.5 rounded-lg text-[10px] border transition-all ${isDayBlockActive(day, block) ? 'bg-lime/20 border-lime/40 text-lime' : 'bg-gray-800/50 border-gray-800 text-gray-600'}`}
                                        >
                                            {block.charAt(0)}
                                        </button>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {user.availability?.map(slot => (
                                <div key={slot.day} className="text-[10px] bg-gray-800 border border-gray-700/50 rounded-lg px-2 py-1">
                                    <span className="font-bold text-white">{slot.day}:</span> {slot.blocks.join(', ')}
                                </div>
                            )) || <p className="text-sm text-gray-500">No schedule.</p>}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4">
                    {user.is_admin && (
                        <button
                            onClick={() => window.location.href = '/admin'}
                            className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                        >
                            <Settings size={20} /> OPEN ADMIN BACKEND
                        </button>
                    )}
                    <button
                        onClick={logout}
                        className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </div>

            {/* Modals & Overlays */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-sm overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-5 border-b border-gray-800">
                                <h3 className="font-bold text-lg text-white">Settings</h3>
                                <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold text-white">Trainer Mode</h4>
                                        <p className="text-[10px] text-gray-500 mt-1">Unlock pro features and badges.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={isTrainer} onChange={(e) => handleSaveTrainer(e.target.checked)} />
                                        <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-lime after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                                    </label>
                                </div>
                                <div className="pt-4 border-t border-gray-800">
                                    <h4 className="font-semibold text-white mb-2">Units</h4>
                                    <div className="flex gap-2">
                                        {(['lbs', 'kg'] as const).map(u => (
                                            <button key={u} onClick={() => { setUnitPref(u); updateUser({ unit_preference: u }); }}
                                                className={`flex-1 py-2 rounded-xl text-xs font-bold ${unitPref === u ? 'bg-lime text-oled shadow-lg' : 'bg-gray-800 text-gray-500'}`}>{u.toUpperCase()}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-800">
                                    <h4 className="font-semibold text-white mb-2">Sync & Cache</h4>
                                    <button
                                        onClick={() => {
                                            if (confirm('Force refresh app cache?')) {
                                                localStorage.clear();
                                                window.location.reload();
                                            }
                                        }}
                                        className="w-full py-3 bg-gray-800 border border-gray-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw size={14} /> Clear Cache & Refresh
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isEditingImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-sm p-6"
                        >
                            <h3 className="font-bold text-lg text-white mb-4 text-center">Update Picture</h3>
                            <div className="flex justify-center mb-6">
                                <img src={editImageUrl || user.profile_image_url} className="w-24 h-24 rounded-full border-2 border-lime/50 object-cover shadow-2xl" />
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                            <div className="space-y-3">
                                <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-gray-800 border border-gray-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-700 transition-all">
                                    <Camera size={18} /> Take/Choose Photo
                                </button>
                                <div className="flex gap-3">
                                    <button onClick={() => setIsEditingImage(false)} className="flex-1 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 font-bold transition-all">Cancel</button>
                                    <button onClick={handleSaveImage} className="flex-1 py-2 rounded-xl bg-lime text-oled font-bold transition-all">Save</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isShopOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsShopOpen(false)}
                            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60]"
                        />
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 z-[60] bg-oled rounded-t-[2.5rem] h-[85vh] border-t border-gray-800 overflow-hidden"
                        >
                            <CosmeticShop onClose={() => setIsShopOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function FriendsSection() {
    const { friends, pendingReceived, acceptFriend } = useFriends();

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
                <Users size={16} className="text-lime" /> Friends
                <span className="text-xs text-gray-500 font-normal ml-1">{friends.length}</span>
                {pendingReceived.length > 0 && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold border border-red-500/20 ml-auto animate-pulse">
                        {pendingReceived.length} NEW
                    </span>
                )}
            </h4>

            {pendingReceived.length > 0 && (
                <div className="space-y-2 mb-3">
                    {pendingReceived.map(u => (
                        <div key={u.id} className="flex items-center gap-3 p-3 rounded-2xl bg-lime/10 border border-lime/20 shadow-lg shadow-lime/5">
                            <img src={u.profile_image_url} alt={u.name} className="w-10 h-10 rounded-full border-2 border-lime/30 object-cover" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{u.name}</p>
                                <p className="text-[10px] text-lime/70 font-medium">pending request</p>
                            </div>
                            <button
                                onClick={() => acceptFriend(u.id)}
                                className="text-[10px] font-black bg-lime text-oled px-4 py-2 rounded-xl active:scale-95 transition-all shadow-md shadow-lime/20"
                            >
                                ACCEPT
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {friends.length === 0 ? (
                <div className="text-center py-4 bg-gray-800/10 rounded-xl border border-dashed border-gray-800">
                    <p className="text-[10px] text-gray-500 font-medium">No connections yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {friends.map(f => (
                        <div key={f.id} className="flex items-center gap-2 bg-gray-800/40 rounded-2xl p-2 border border-gray-800/60 shadow-sm">
                            <img src={f.profile_image_url} alt={f.name} className="w-8 h-8 rounded-full border border-gray-700 object-cover" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-white truncate">{f.name.split(' ')[0]}</p>
                                <p className="text-[9px] text-gray-500 truncate font-medium">{f.fitness_level}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
