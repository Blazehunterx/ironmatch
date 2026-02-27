import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ArrowRight, ArrowLeft, Camera, Ruler,
    Zap, User as UserIcon, Check, MapPin, Search
} from 'lucide-react';
import { useGyms } from '../context/GymContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Goal, BodyPart, ALL_GOALS, ALL_BODY_PARTS, FitnessLevel, FitnessDiscipline } from '../types/database';
import { getRankFromLifts, Big4Lifts } from '../lib/gamification';

const goalEmoji: Record<string, string> = {
    'Workout Buddy': '🤝', 'Socialize': '💬', 'Get Pushed': '🔥', 'Learn': '📚',
    'Train for Competition': '🏋️', 'Lose Weight': '💪', 'Recovery Partner': '🧘', 'Cardio Partner': '🏃',
};

const TOTAL_STEPS = 8;

const DISCIPLINES: { value: FitnessDiscipline; icon: string; desc: string }[] = [
    { value: 'Powerlifting', icon: '🏋️', desc: 'Big 4 lifts, maximal strength' },
    { value: 'Bodybuilding', icon: '💪', desc: 'Muscle building, aesthetics' },
    { value: 'CrossFit', icon: '🔥', desc: 'Varied functional fitness, WODs' },
    { value: 'Hyrox', icon: '🏃', desc: 'Hybrid running + functional' },
    { value: 'General Fitness', icon: '⚡', desc: 'Staying active, all-round' },
];

export default function Onboarding() {
    const { user, updateUser, signup } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);

    // Step 0: Photo
    const [profileImage, setProfileImage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Step 1: Home Gym
    const { gyms: allGyms, isLoadingGyms, addCustomGym, locationStatus, refreshGyms } = useGyms();
    const [homeGym, setHomeGym] = useState('');
    const [searchGymQuery, setSearchGymQuery] = useState('');

    // Step 2: Discipline
    const [discipline, setDiscipline] = useState<FitnessDiscipline>('General Fitness');

    // Step 2: Body stats
    const [weightKg, setWeightKg] = useState(0);
    const [heightCm, setHeightCm] = useState(0);
    const [unitPref, setUnitPref] = useState<'lbs' | 'kg'>('lbs');

    // Step 3: Big 4
    const [lifts, setLifts] = useState<Big4Lifts>({ bench: 0, squat: 0, deadlift: 0, ohp: 0 });

    // Step 4: Goals
    const [goals, setGoals] = useState<Goal[]>([]);
    const [subGoals, setSubGoals] = useState<BodyPart[]>([]);
    const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('Beginner');

    // Step 5: Bio
    const [bio, setBio] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setProfileImage(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const toggleGoal = (goal: Goal) => {
        setGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : prev.length >= 3 ? prev : [...prev, goal]);
    };

    const toggleSubGoal = (bp: BodyPart) => {
        setSubGoals(prev => prev.includes(bp) ? prev.filter(b => b !== bp) : [...prev, bp]);
    };

    const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
    const back = () => setStep(s => Math.max(s - 1, 0));

    const finish = async () => {
        const hg = allGyms.find(g => g.id === homeGym);

        const data = {
            profile_image_url: profileImage || 'https://i.pravatar.cc/300',
            home_gym: homeGym || undefined,
            home_gym_name: hg?.name || undefined,
            weight_kg: weightKg || undefined,
            height_cm: heightCm || undefined,
            unit_preference: unitPref,
            discipline,
            big4: lifts.bench || lifts.squat || lifts.deadlift || lifts.ohp ? lifts : undefined,
            goals,
            sub_goals: subGoals,
            fitness_level: fitnessLevel,
            bio,
        };
        if (user) {
            updateUser(data);
        } else {
            await signup(data);
        }
        navigate('/');
    };

    const rank = getRankFromLifts(lifts, unitPref);
    const hasAnyLift = lifts.bench > 0 || lifts.squat > 0 || lifts.deadlift > 0 || lifts.ohp > 0;

    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
    };

    const [direction, setDirection] = useState(1);
    const goNext = () => { setDirection(1); next(); };
    const goBack = () => { setDirection(-1); back(); };

    return (
        <div className="fixed inset-0 bg-oled flex flex-col overflow-hidden">
            {/* Progress bar */}
            <div className="px-6 pt-6 pb-2">
                <div className="flex items-center justify-between mb-3">
                    {step > 0 ? (
                        <button onClick={goBack} className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors -ml-1.5">
                            <ArrowLeft size={20} />
                        </button>
                    ) : <div className="w-8" />}
                    <span className="text-[10px] text-gray-500 font-bold">{step + 1} / {TOTAL_STEPS}</span>
                    {step < TOTAL_STEPS - 1 ? (
                        <button onClick={goNext} className="text-[10px] text-gray-500 hover:text-lime font-bold">
                            Skip
                        </button>
                    ) : <div className="w-8" />}
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-lime rounded-full"
                        animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Steps */}
            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="absolute inset-0 px-6 pt-4 pb-6 flex flex-col overflow-y-auto"
                    >
                        {/* ═══ STEP 0: PROFILE PHOTO ═══ */}
                        {step === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
                                    <h2 className="text-3xl font-black text-white text-center mb-2">Let's set up<br />your profile</h2>
                                    <p className="text-sm text-gray-500 text-center mb-8">Add a photo so others can recognize you at the gym</p>
                                </motion.div>

                                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                                    className="relative group cursor-pointer mb-8"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className={`w-32 h-32 rounded-full border-4 ${profileImage ? 'border-lime/50' : 'border-gray-700 border-dashed'} flex items-center justify-center overflow-hidden transition-all group-hover:border-lime/80`}>
                                        {profileImage ? (
                                            <img src={profileImage} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 text-gray-500">
                                                <Camera size={28} />
                                                <span className="text-[10px] font-bold">Add Photo</span>
                                            </div>
                                        )}
                                    </div>
                                    {profileImage && (
                                        <div className="absolute bottom-0 right-0 bg-lime p-2 rounded-full border-4 border-oled">
                                            <Check size={14} className="text-oled" />
                                        </div>
                                    )}
                                </motion.div>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                            </div>
                        )}

                        {/* ═══ STEP 1: HOME GYM ═══ */}
                        {step === 1 && (
                            <div className="flex-1 flex flex-col">
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                                    <h2 className="text-2xl font-black text-white mb-1">Your Home Gym</h2>
                                    <p className="text-sm text-gray-500 mb-6">Where do you train the most? We'll match you with locals.</p>
                                </motion.div>

                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                                    className="flex items-center gap-2 mb-4">
                                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3 flex items-center gap-3 flex-1">
                                        <Search size={18} className="text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search for a gym..."
                                            value={searchGymQuery}
                                            onChange={(e) => setSearchGymQuery(e.target.value)}
                                            className="bg-transparent text-white text-sm w-full focus:outline-none placeholder:text-gray-600 font-bold"
                                        />
                                    </div>
                                    <button
                                        onClick={refreshGyms}
                                        className="p-3 bg-gray-900 border border-gray-800 rounded-2xl text-gray-400 hover:text-lime transition-colors"
                                        title="Refresh Location"
                                    >
                                        <Zap size={18} className={isLoadingGyms ? 'animate-pulse text-lime' : ''} />
                                    </button>
                                </motion.div>

                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                                    className="flex-1 overflow-y-auto space-y-2 pb-24">
                                    {locationStatus === 'denied' && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                                            <p className="text-xs text-red-400 font-bold mb-1">Location Access Denied</p>
                                            <p className="text-[10px] text-gray-500">We couldn't find gyms because location access is off. Please enable it in your browser settings or add your gym manually below.</p>
                                        </div>
                                    )}

                                    {isLoadingGyms ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                                            <div className="w-8 h-8 border-4 border-lime/20 border-t-lime rounded-full animate-spin" />
                                            <p className="text-xs text-gray-500 font-bold animate-pulse">Scanning local area...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {allGyms
                                                .filter(g => g.name.toLowerCase().includes(searchGymQuery.toLowerCase()))
                                                .slice(0, 50)
                                                .map((gym) => (
                                                    <button
                                                        key={gym.id}
                                                        onClick={() => setHomeGym(gym.id)}
                                                        className={`w-full p-3 rounded-xl border text-left transition-all ${homeGym === gym.id ? 'bg-lime/10 border-lime/40' : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                                                                <MapPin size={18} className={homeGym === gym.id ? 'text-lime' : 'text-gray-500'} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`font-bold truncate text-sm ${homeGym === gym.id ? 'text-lime' : 'text-white'}`}>{gym.name}</p>
                                                                <p className="text-[10px] text-gray-500 truncate mt-0.5">{gym.location}</p>
                                                            </div>
                                                            {homeGym === gym.id && <Check size={16} className="text-lime shrink-0" />}
                                                        </div>
                                                    </button>
                                                ))}

                                            {allGyms.length === 0 && !searchGymQuery && (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-500 text-sm font-bold mb-1">No gyms found nearby.</p>
                                                    <p className="text-xs text-gray-600">Try zooming out or check your location settings.</p>
                                                </div>
                                            )}

                                            {/* Manual Add Trigger */}
                                            <div className="pt-4">
                                                <p className="text-xs text-gray-500 text-center mb-3">Can't find your gym? Add it manually.</p>
                                                <button
                                                    onClick={async () => {
                                                        const name = prompt("Enter Gym Name:");
                                                        if (name) {
                                                            const id = await addCustomGym(name, "Manually added");
                                                            setHomeGym(id);
                                                        }
                                                    }}
                                                    className="w-full py-3 rounded-xl border border-dashed border-gray-700 text-gray-400 text-xs font-bold hover:border-lime/50 hover:text-lime transition-all"
                                                >
                                                    + Add Custom Gym
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            </div>
                        )}

                        {/* ═══ STEP 2: DISCIPLINE ═══ */}
                        {step === 2 && (
                            <div className="flex-1 flex flex-col">
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                                    <h2 className="text-2xl font-black text-white mb-1">Your Discipline</h2>
                                    <p className="text-sm text-gray-500 mb-6">What best describes your training style? This personalizes your experience.</p>
                                </motion.div>

                                <div className="space-y-3">
                                    {DISCIPLINES.map((d, idx) => (
                                        <motion.button key={d.value} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: idx * 0.08 }}
                                            onClick={() => setDiscipline(d.value)}
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
                        )}

                        {/* ═══ STEP 3: BODY STATS ═══ */}
                        {step === 3 && (
                            <div className="flex-1 flex flex-col">
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                                    <h2 className="text-2xl font-black text-white mb-1">Body Stats</h2>
                                    <p className="text-sm text-gray-500 mb-6">Used for fair duel matchups and bodyweight-relative scoring</p>
                                </motion.div>

                                <div className="space-y-4">
                                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                                        className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                                <Ruler size={20} className="text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">Weight</p>
                                                <p className="text-[10px] text-gray-500">Your current bodyweight in kg</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="number" value={weightKg || ''} onChange={e => setWeightKg(Number(e.target.value) || 0)}
                                                placeholder="80" className="flex-1 bg-oled border border-gray-700 text-white text-lg font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-lime text-center" />
                                            <span className="text-sm text-gray-500 w-8">kg</span>
                                        </div>
                                    </motion.div>

                                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                                        className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                                                <Ruler size={20} className="text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">Height</p>
                                                <p className="text-[10px] text-gray-500">Your height in cm</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="number" value={heightCm || ''} onChange={e => setHeightCm(Number(e.target.value) || 0)}
                                                placeholder="180" className="flex-1 bg-oled border border-gray-700 text-white text-lg font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-lime text-center" />
                                            <span className="text-sm text-gray-500 w-8">cm</span>
                                        </div>
                                    </motion.div>

                                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                                        className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                                        <p className="text-sm font-bold text-white mb-3">Preferred Unit</p>
                                        <div className="flex gap-2">
                                            {(['lbs', 'kg'] as const).map(u => (
                                                <button key={u} onClick={() => setUnitPref(u)}
                                                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${unitPref === u
                                                        ? 'bg-lime text-oled' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'}`}>
                                                    {u.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        )}

                        {/* ═══ STEP 4: BIG 4 PRs ═══ */}
                        {step === 4 && (
                            <div className="flex-1 flex flex-col">
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                                    <h2 className="text-2xl font-black text-white mb-1">Your Big 4</h2>
                                    <p className="text-sm text-gray-500 mb-2">Enter your 1 rep max (1RM) for each lift. This determines your rank.</p>
                                    {hasAnyLift && (
                                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                            className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 mb-4">
                                            <span className="text-xl">{rank.icon}</span>
                                            <span className="text-sm font-bold" style={{ color: rank.color }}>{rank.name}</span>
                                            <span className="text-[10px] text-gray-500 ml-auto">{lifts.bench + lifts.squat + lifts.deadlift + lifts.ohp} {unitPref} total</span>
                                        </motion.div>
                                    )}
                                </motion.div>

                                <div className="space-y-3">
                                    {[
                                        { key: 'bench' as const, label: 'Bench Press', icon: '🪑', emoji: '💪' },
                                        { key: 'squat' as const, label: 'Squat', icon: '🏋️', emoji: '🦵' },
                                        { key: 'deadlift' as const, label: 'Deadlift', icon: '⬆️', emoji: '🔥' },
                                        { key: 'ohp' as const, label: 'Overhead Press', icon: '🙌', emoji: '⚡' },
                                    ].map((lift, idx) => (
                                        <motion.div key={lift.key} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: idx * 0.08 }}
                                            className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4">
                                            <span className="text-2xl">{lift.icon}</span>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-white">{lift.label}</p>
                                                <p className="text-[9px] text-gray-500">1 rep max</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input type="number" value={lifts[lift.key] || ''}
                                                    onChange={e => setLifts(prev => ({ ...prev, [lift.key]: Number(e.target.value) || 0 }))}
                                                    placeholder="0"
                                                    className="w-20 bg-oled border border-gray-700 text-white text-sm font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-lime text-center" />
                                                <span className="text-[10px] text-gray-500">{unitPref}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {!hasAnyLift && (
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                                        className="text-[10px] text-gray-600 text-center mt-4">
                                        Don't know your 1RM? No problem — skip this and add it later from your profile.
                                    </motion.p>
                                )}
                            </div>
                        )}

                        {/* ═══ STEP 5: GOALS ═══ */}
                        {step === 5 && (
                            <div className="flex-1 flex flex-col">
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                                    <h2 className="text-2xl font-black text-white mb-1">Your Goals</h2>
                                    <p className="text-sm text-gray-500 mb-6">Pick up to 3 goals so we match you with the right people</p>
                                </motion.div>

                                <div className="grid grid-cols-2 gap-2 mb-6">
                                    {ALL_GOALS.map((goal, idx) => (
                                        <motion.button key={goal} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: idx * 0.04 }}
                                            onClick={() => toggleGoal(goal)}
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
                                            <button key={bp} onClick={() => toggleSubGoal(bp)}
                                                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${subGoals.includes(bp)
                                                    ? 'bg-lime/10 text-lime border border-lime/30'
                                                    : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-gray-300'}`}>
                                                {bp}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* ═══ STEP 6: FITNESS LEVEL ═══ */}
                        {step === 6 && (
                            <div className="flex-1 flex flex-col">
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                                    <h2 className="text-2xl font-black text-white mb-1">Experience Level</h2>
                                    <p className="text-sm text-gray-500 mb-6">How long have you been training?</p>
                                </motion.div>

                                <div className="space-y-3">
                                    {[
                                        { level: 'Beginner' as FitnessLevel, desc: 'New to the gym or training less than 1 year', icon: '🌱', subtitle: '0–1 years' },
                                        { level: 'Intermediate' as FitnessLevel, desc: 'Consistent training with solid form', icon: '⚡', subtitle: '1–4 years' },
                                        { level: 'Professional' as FitnessLevel, desc: 'Advanced lifter or competitive athlete', icon: '🏆', subtitle: '4+ years' },
                                    ].map((item, idx) => (
                                        <motion.button key={item.level} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            onClick={() => setFitnessLevel(item.level)}
                                            className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${fitnessLevel === item.level
                                                ? 'bg-lime/10 border-lime/40' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}>
                                            <span className="text-3xl">{item.icon}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className={`font-bold ${fitnessLevel === item.level ? 'text-lime' : 'text-white'}`}>{item.level}</p>
                                                    <span className="text-[10px] text-gray-500">{item.subtitle}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                            </div>
                                            {fitnessLevel === item.level && <Check size={18} className="text-lime shrink-0" />}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ═══ STEP 7: BIO + FINISH ═══ */}
                        {step === 7 && (
                            <div className="flex-1 flex flex-col">
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                                    <h2 className="text-2xl font-black text-white mb-1">Almost Done!</h2>
                                    <p className="text-sm text-gray-500 mb-6">Write a short bio to let others know what you're about</p>
                                </motion.div>

                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                                    className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
                                    <textarea value={bio} onChange={e => setBio(e.target.value)}
                                        placeholder="Tell others about your training style, goals, and what kind of workout partner you're looking for..."
                                        rows={4} maxLength={200}
                                        className="w-full bg-transparent text-white text-sm leading-relaxed focus:outline-none resize-none placeholder:text-gray-600" />
                                    <p className="text-right text-[10px] text-gray-600 mt-1">{bio.length}/200</p>
                                </motion.div>

                                {/* Summary preview */}
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                                    className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-800 rounded-2xl p-4">
                                    <p className="text-[10px] text-gray-500 font-bold mb-3 uppercase tracking-wider">Your Profile Preview</p>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden border-2 border-gray-700 shrink-0">
                                            {profileImage ? (
                                                <img src={profileImage} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center"><UserIcon size={20} className="text-gray-600" /></div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{user?.name || 'You'}</p>
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
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Button */}
            <div className="px-6 pb-8 pt-3">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={step === TOTAL_STEPS - 1 ? finish : goNext}
                    className="w-full py-4 rounded-2xl bg-lime text-oled font-black text-sm flex items-center justify-center gap-2 hover:bg-lime/90 transition-all shadow-[0_0_40px_-10px_rgba(50,255,50,0.3)]"
                >
                    {step === TOTAL_STEPS - 1 ? (
                        <>
                            <Zap size={18} /> Let's Go!
                        </>
                    ) : (
                        <>
                            Continue <ArrowRight size={16} />
                        </>
                    )}
                </motion.button>
            </div>
        </div>
    );
}
