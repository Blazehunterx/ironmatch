import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockGyms } from '../lib/mock';
import {
    LogOut, Settings, Award, Flame, Activity, Edit2, Check, X, Camera,
    Target, CalendarDays, Dumbbell, Ruler, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Goal, BodyPart, DayOfWeek, TimeBlock,
    ALL_GOALS, ALL_BODY_PARTS, ALL_DAYS, ALL_TIME_BLOCKS
} from '../types/database';
import { getRankFromLifts, getBig4Total, Big4Lifts } from '../lib/gamification';

const goalEmoji: Record<string, string> = {
    'Workout Buddy': '🤝', 'Socialize': '💬', 'Get Pushed': '🔥', 'Learn': '📚',
    'Train for Competition': '🏋️', 'Lose Weight': '💪', 'Recovery Partner': '🧘', 'Cardio Partner': '🏃',
};

export default function Profile() {
    const { user, logout, updateUser } = useAuth();

    // Bio editing
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [editBioText, setEditBioText] = useState('');

    // Settings
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isTrainer, setIsTrainer] = useState(user?.is_trainer || false);
    const [fitnessLevel, setFitnessLevel] = useState(user?.fitness_level || 'Beginner');
    const [unitPref, setUnitPref] = useState<'lbs' | 'kg'>(user?.unit_preference || 'lbs');
    const toDisplay = (lbs: number) => unitPref === 'kg' ? Math.round(lbs * 0.453592) : lbs;
    const unitLabel = unitPref;

    // Image
    const [isEditingImage, setIsEditingImage] = useState(false);
    const [editImageUrl, setEditImageUrl] = useState('');

    // Goals editing
    const [isEditingGoals, setIsEditingGoals] = useState(false);
    const [editGoals, setEditGoals] = useState<Goal[]>(user?.goals || []);
    const [editSubGoals, setEditSubGoals] = useState<BodyPart[]>(user?.sub_goals || []);

    // Availability editing
    const [isEditingAvailability, setIsEditingAvailability] = useState(false);

    // Big 4 / Body stats editing
    const [isEditingPRs, setIsEditingPRs] = useState(false);
    const [tempLifts, setTempLifts] = useState<Big4Lifts>(user?.big4 || { bench: 0, squat: 0, deadlift: 0, ohp: 0 });
    const [tempWeight, setTempWeight] = useState(user?.weight_kg || 0);
    const [tempHeight, setTempHeight] = useState(user?.height_cm || 0);

    if (!user) return null;
    const homeGym = mockGyms.find(g => g.id === user.home_gym);

    const handleSaveBio = () => {
        setIsEditingBio(false);
        updateUser({ bio: editBioText });
    };

    const handleSaveTrainer = (newVal: boolean) => {
        setIsTrainer(newVal);
        updateUser({ is_trainer: newVal });
    };

    const handleSaveFitnessLevel = (newVal: any) => {
        setFitnessLevel(newVal);
        updateUser({ fitness_level: newVal });
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Goal toggling (max 2)
    const toggleGoal = (goal: Goal) => {
        setEditGoals(prev => {
            if (prev.includes(goal)) return prev.filter(g => g !== goal);
            if (prev.length >= 2) return prev;
            return [...prev, goal];
        });
    };

    const toggleSubGoal = (bp: BodyPart) => {
        setEditSubGoals(prev =>
            prev.includes(bp) ? prev.filter(b => b !== bp) : [...prev, bp]
        );
    };

    const handleSaveGoals = () => {
        setIsEditingGoals(false);
        updateUser({ goals: editGoals, sub_goals: editSubGoals });
    };

    // Availability toggling
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
        <div className="flex flex-col min-h-screen px-4 pt-8 pb-24 relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">Profile</h2>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 text-gray-400 hover:text-white rounded-full bg-gray-900 border border-gray-800 active:scale-95 transition-all"
                >
                    <Settings size={20} />
                </button>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center mb-8">
                <div className="relative mb-4 group">
                    <img
                        src={user.profile_image_url}
                        alt={user.name}
                        className="w-28 h-28 rounded-full border-4 border-gray-900 shadow-xl object-cover bg-gray-800 transition-opacity group-hover:opacity-80"
                    />
                    <div className="absolute bottom-0 right-0 p-1.5 bg-lime rounded-full text-oled border-2 border-oled">
                        <Activity size={16} />
                    </div>
                    <button
                        onClick={() => { setEditImageUrl(user.profile_image_url); setIsEditingImage(true); }}
                        className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-4 border-transparent hover:border-lime/50"
                    >
                        <Camera className="text-white mb-1" size={24} />
                        <span className="text-[10px] font-semibold text-white">Edit</span>
                    </button>
                </div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    {user.name}
                    {user.is_trainer && (
                        <span className="text-xs bg-lime/20 text-lime px-2 py-0.5 rounded-full border border-lime/30 tracking-wide">TRAINER</span>
                    )}
                    {user.discipline && user.discipline !== 'General Fitness' && (
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">{user.discipline}</span>
                    )}
                </h3>
                <p className="text-gray-400 mt-1 flex items-center gap-1">
                    {homeGym?.name} • {homeGym?.location}
                </p>
                {/* Rank Badge */}
                {user.big4 && (
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-lg">{getRankFromLifts(user.big4).icon}</span>
                        <span className="text-sm font-bold" style={{ color: getRankFromLifts(user.big4).color }}>
                            {getRankFromLifts(user.big4).name}
                        </span>
                        <span className="text-[10px] text-gray-500">{toDisplay(getBig4Total(user.big4))}{unitLabel} total</span>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                    <Award size={20} className="text-lime mb-1" />
                    <div className="text-[10px] text-gray-400">Level</div>
                    <div className="text-xs font-bold text-white">{user.fitness_level}</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                    <Flame size={20} className="text-orange-500 mb-1" />
                    <div className="text-[10px] text-gray-400">Streak</div>
                    <div className="text-xs font-bold text-white">{user.reliability_streak || 1}w</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                    <Ruler size={20} className="text-blue-400 mb-1" />
                    <div className="text-[10px] text-gray-400">Body</div>
                    <div className="text-xs font-bold text-white">{user.weight_kg || '?'}kg • {user.height_cm || '?'}cm</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                    <Zap size={20} className="text-yellow-400 mb-1" />
                    <div className="text-[10px] text-gray-400">XP</div>
                    <div className="text-xs font-bold text-yellow-400">{(user.xp || 0).toLocaleString()}</div>
                </div>
            </div>

            {/* Big 4 PRs */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                        <Dumbbell size={16} className="text-lime" /> Big 4 PRs
                    </h4>
                    <button
                        onClick={() => {
                            setTempLifts(user.big4 || { bench: 0, squat: 0, deadlift: 0, ohp: 0 });
                            setTempWeight(user.weight_kg || 0);
                            setTempHeight(user.height_cm || 0);
                            setIsEditingPRs(!isEditingPRs);
                        }}
                        className="text-gray-500 hover:text-lime transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                </div>

                {isEditingPRs ? (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] text-gray-500 mb-1 block">Weight (kg)</label>
                                <input type="number" value={tempWeight || ''}
                                    onChange={e => setTempWeight(Number(e.target.value) || 0)}
                                    className="w-full bg-oled border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-lime text-center"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 mb-1 block">Height (cm)</label>
                                <input type="number" value={tempHeight || ''}
                                    onChange={e => setTempHeight(Number(e.target.value) || 0)}
                                    className="w-full bg-oled border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-lime text-center"
                                />
                            </div>
                        </div>
                        {(['bench', 'squat', 'deadlift', 'ohp'] as const).map(lift => (
                            <div key={lift} className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 w-20 capitalize">{lift === 'ohp' ? 'OHP' : lift}</span>
                                <input type="number" value={tempLifts[lift] || ''}
                                    onChange={e => setTempLifts(prev => ({ ...prev, [lift]: Number(e.target.value) || 0 }))}
                                    className="flex-1 bg-oled border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-lime text-center"
                                />
                                <span className="text-[10px] text-gray-500">{unitLabel}</span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-gray-500">New rank: <span className="font-bold" style={{ color: getRankFromLifts(tempLifts).color }}>{getRankFromLifts(tempLifts).icon} {getRankFromLifts(tempLifts).name}</span></span>
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditingPRs(false)} className="p-2 text-gray-400 hover:text-white rounded-lg"><X size={18} /></button>
                                <button onClick={() => {
                                    updateUser({ big4: tempLifts, weight_kg: tempWeight, height_cm: tempHeight });
                                    setIsEditingPRs(false);
                                }} className="p-2 text-lime hover:bg-lime/20 rounded-lg"><Check size={18} /></button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { label: 'Bench', value: toDisplay(user.big4?.bench || 0), icon: '🪑' },
                            { label: 'Squat', value: toDisplay(user.big4?.squat || 0), icon: '🏋️' },
                            { label: 'Dead', value: toDisplay(user.big4?.deadlift || 0), icon: '⬆️' },
                            { label: 'OHP', value: toDisplay(user.big4?.ohp || 0), icon: '🙌' },
                        ].map(l => (
                            <div key={l.label} className="bg-gray-800/50 rounded-xl p-2.5 text-center">
                                <span className="text-sm">{l.icon}</span>
                                <p className="text-lg font-black text-white">{l.value}</p>
                                <p className="text-[8px] text-gray-500">{l.label} ({unitLabel})</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bio */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4 group">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-white">Bio</h4>
                    {!isEditingBio && (
                        <button
                            onClick={() => { setEditBioText(user.bio); setIsEditingBio(true); }}
                            className="text-gray-500 hover:text-lime transition-colors"
                        >
                            <Edit2 size={16} />
                        </button>
                    )}
                </div>
                {isEditingBio ? (
                    <div className="space-y-3">
                        <textarea
                            value={editBioText}
                            onChange={(e) => setEditBioText(e.target.value)}
                            className="w-full bg-oled border border-gray-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-lime resize-none"
                            rows={3}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsEditingBio(false)} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"><X size={18} /></button>
                            <button onClick={handleSaveBio} className="p-2 text-lime hover:bg-lime/20 rounded-lg transition-colors"><Check size={18} /></button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {user.bio || "No bio added yet. Tell others about your workout style!"}
                    </p>
                )}
            </div>

            {/* Goals Section */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-white flex items-center gap-2"><Target size={16} className="text-lime" /> Goals</h4>
                    <button
                        onClick={() => { setEditGoals(user.goals || []); setEditSubGoals(user.sub_goals || []); setIsEditingGoals(true); }}
                        className="text-gray-500 hover:text-lime transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                </div>

                {isEditingGoals ? (
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-gray-400 mb-2">Pick up to 2 goals:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {ALL_GOALS.map(g => (
                                    <button
                                        key={g}
                                        onClick={() => toggleGoal(g)}
                                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${editGoals.includes(g)
                                            ? 'bg-lime/20 border-lime/50 text-lime'
                                            : editGoals.length >= 2
                                                ? 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'
                                                : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
                                            }`}
                                        disabled={!editGoals.includes(g) && editGoals.length >= 2}
                                    >
                                        {goalEmoji[g]} {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400 mb-2">Body parts to grow:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {ALL_BODY_PARTS.map(bp => (
                                    <button
                                        key={bp}
                                        onClick={() => toggleSubGoal(bp)}
                                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${editSubGoals.includes(bp)
                                            ? 'bg-lime/20 border-lime/50 text-lime'
                                            : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
                                            }`}
                                    >
                                        {bp}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setIsEditingGoals(false)} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"><X size={18} /></button>
                            <button onClick={handleSaveGoals} className="p-2 text-lime hover:bg-lime/20 rounded-lg transition-colors"><Check size={18} /></button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {user.goals && user.goals.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {user.goals.map(g => (
                                    <span key={g} className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-800 text-gray-300 border border-gray-700/50">
                                        {goalEmoji[g]} {g}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No goals set. Tap edit to add yours!</p>
                        )}
                        {user.sub_goals && user.sub_goals.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">Focus: {user.sub_goals.join(' · ')}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Recent Workout History */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4">
                <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
                    <Dumbbell size={16} className="text-lime" /> Recent Workouts
                </h4>
                <div className="space-y-2">
                    {[
                        { name: 'Push Day Destroyer', target: 'Chest', duration: 62, completed: 3, total: 4, date: '2 days ago' },
                        { name: 'Leg Day', target: 'Legs', duration: 55, completed: 5, total: 5, date: '4 days ago' },
                        { name: 'Pull Day', target: 'Back', duration: 48, completed: 4, total: 5, date: '6 days ago' },
                    ].map((w, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-800/50 border border-gray-800">
                            <div className="w-10 h-10 rounded-xl bg-lime/10 border border-lime/20 flex items-center justify-center shrink-0">
                                <Dumbbell size={16} className="text-lime" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{w.name}</p>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                    <span>{w.target}</span>
                                    <span>•</span>
                                    <span>{w.duration}min</span>
                                    <span>•</span>
                                    <span className="text-lime">{w.completed}/{w.total} done</span>
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-600 shrink-0">{w.date}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-white flex items-center gap-2"><CalendarDays size={16} className="text-lime" /> Availability</h4>
                    <button
                        onClick={() => setIsEditingAvailability(!isEditingAvailability)}
                        className="text-gray-500 hover:text-lime transition-colors"
                    >
                        {isEditingAvailability ? <Check size={16} /> : <Edit2 size={16} />}
                    </button>
                </div>

                {isEditingAvailability ? (
                    <div className="space-y-1">
                        <div className="grid grid-cols-[60px_repeat(3,1fr)] gap-1 text-center">
                            <div />
                            {ALL_TIME_BLOCKS.map(b => (
                                <div key={b} className="text-[9px] font-bold text-gray-500 uppercase tracking-wider py-1">{b}</div>
                            ))}
                            {ALL_DAYS.map(day => (
                                <>
                                    <div key={`label-${day}`} className="text-xs font-bold text-gray-400 flex items-center">{day}</div>
                                    {ALL_TIME_BLOCKS.map(block => (
                                        <button
                                            key={`${day}-${block}`}
                                            onClick={() => toggleAvailBlock(day, block)}
                                            className={`py-2 rounded-lg text-[10px] font-bold border transition-all active:scale-95 ${isDayBlockActive(day, block)
                                                ? 'bg-lime/20 border-lime/40 text-lime'
                                                : 'bg-gray-800/50 border-gray-800 text-gray-600 hover:border-gray-600'
                                                }`}
                                        >
                                            {isDayBlockActive(day, block) ? '✓' : '–'}
                                        </button>
                                    ))}
                                </>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-600 mt-2">Tap slots to toggle when you're open to work out.</p>
                    </div>
                ) : (
                    <div>
                        {user.availability && user.availability.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {user.availability.map(slot => (
                                    <div key={slot.day} className="text-xs bg-gray-800 border border-gray-700/50 rounded-lg px-2 py-1.5">
                                        <span className="font-bold text-white">{slot.day}</span>
                                        <span className="text-gray-400 ml-1">{slot.blocks.join(', ')}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No schedule set. Tap edit to add your availability!</p>
                        )}
                    </div>
                )}
            </div>

            {/* Sign Out */}
            <div className="space-y-3 mt-auto pt-4">
                <button
                    onClick={logout}
                    className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                >
                    <LogOut size={18} /> Sign Out
                </button>
            </div>

            {/* Settings Modal */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-4 border-b border-gray-800">
                                <h3 className="font-bold text-lg text-white">Settings</h3>
                                <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h4 className="font-semibold text-white">Personal Trainer Mode</h4>
                                        <p className="text-xs text-gray-400 mt-1">Show a badge on your profile and let others know you offer lessons or guidance.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                                        <input type="checkbox" className="sr-only peer" checked={isTrainer} onChange={(e) => handleSaveTrainer(e.target.checked)} />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime"></div>
                                    </label>
                                </div>
                                <div className="flex flex-col gap-2 pt-4 border-t border-gray-800">
                                    <div>
                                        <h4 className="font-semibold text-white">Fitness Level</h4>
                                        <p className="text-xs text-gray-400 mt-1">Update your experience level.</p>
                                    </div>
                                    <select
                                        value={fitnessLevel}
                                        onChange={(e) => handleSaveFitnessLevel(e.target.value)}
                                        className="w-full bg-oled border border-gray-700 text-white rounded-lg px-3 py-2 mt-2 focus:outline-none focus:border-lime"
                                    >
                                        <option value="Beginner">Beginner (0-1 years)</option>
                                        <option value="Intermediate">Intermediate (1-4 years)</option>
                                        <option value="Professional">Professional (4+ years)</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2 pt-4 border-t border-gray-800">
                                    <div>
                                        <h4 className="font-semibold text-white">Weight Unit</h4>
                                        <p className="text-xs text-gray-400 mt-1">Choose how your Big 4 lifts are displayed.</p>
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        {(['lbs', 'kg'] as const).map(u => (
                                            <button key={u} onClick={() => { setUnitPref(u); updateUser({ unit_preference: u }); }}
                                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${unitPref === u
                                                    ? 'bg-lime text-oled' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                                                {u.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Image Edit Modal */}
            <AnimatePresence>
                {isEditingImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6"
                        >
                            <h3 className="font-bold text-lg text-white mb-4">Update Profile Picture</h3>
                            <div className="flex justify-center mb-6">
                                <img src={editImageUrl || 'https://i.pravatar.cc/150'} className="w-24 h-24 rounded-full border-2 border-gray-700 object-cover" />
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-3 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-700 active:scale-[0.98] transition-all mb-3"
                            >
                                <Camera size={18} /> Choose from Device
                            </button>
                            <div className="flex gap-3">
                                <button onClick={() => setIsEditingImage(false)} className="flex-1 py-2 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-700 transition">Cancel</button>
                                <button onClick={handleSaveImage} disabled={!editImageUrl} className="flex-1 py-2 rounded-lg bg-lime text-oled font-bold hover:bg-lime/90 transition disabled:opacity-30">Save</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
