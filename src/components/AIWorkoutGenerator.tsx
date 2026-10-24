import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, Zap, Activity, Flame } from 'lucide-react';
import { WorkoutPlan } from '../types/database';
import { useAuth } from '../context/AuthContext';
import { weeklyMuscleSets, MUSCLES, Muscle } from '../lib/muscles';
import { generate8WeekTendonBlueprint, PlanDoctrine, WeakLinkArea } from '../lib/blueprintGenerator';
import { safeStorage } from '../lib/safeStorage';

interface AIWorkoutGeneratorProps {
    onGenerate: (plan: WorkoutPlan) => void;
    onClose: () => void;
    logs?: any[];
}

type RedFlag = 'shoulder' | 'knee' | 'back' | 'elbow_wrist' | 'none';
type Realm = 'commercial' | 'cable' | 'home';

export default function AIWorkoutGenerator({ onGenerate, onClose, logs = [] }: AIWorkoutGeneratorProps) {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [doctrine, setDoctrine] = useState<PlanDoctrine>('strength_tendon');
    const [scars, setScars] = useState<RedFlag[]>(['none']);
    const [realm, setRealm] = useState<Realm>('commercial');
    const [days, setDays] = useState<number>(4);

    // Compute volume deficits from real 7-day workout history
    const muscleVolume = useMemo(() => weeklyMuscleSets(logs), [logs]);

    const laggingMuscles = useMemo(() => {
        const lagged: { muscle: Muscle; sets: number; label: string }[] = [];
        for (const [m, s] of Object.entries(muscleVolume) as [Muscle, number][]) {
            if (s < 6) {
                lagged.push({ muscle: m, sets: s, label: MUSCLES[m] });
            }
        }
        return lagged.slice(0, 3); // top 3 lagging
    }, [muscleVolume]);

    const toggleScar = (s: RedFlag) => {
        if (s === 'none') {
            setScars(['none']);
            return;
        }
        const filtered = scars.filter(item => item !== 'none');
        if (filtered.includes(s)) {
            const next = filtered.filter(item => item !== s);
            setScars(next.length ? next : ['none']);
        } else {
            setScars([...filtered, s]);
        }
    };

    const handleGenerate = () => {
        const weakLinks: WeakLinkArea[] = scars as WeakLinkArea[];
        try {
            safeStorage.setItem(
                `ironmatch_blueprint_config_${user?.id || 'guest'}`,
                JSON.stringify({ doctrine, weakLinks, realm, daysPerWeek: days })
            );
        } catch {}
        const plan = generate8WeekTendonBlueprint({
            user,
            doctrine,
            weakLinks,
            realm,
            daysPerWeek: days,
            weekNumber: 1,
            dayNumber: 1
        });
        onGenerate(plan);
    };
    return (
        <div className="p-6 bg-oled max-w-lg mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-lime/10 rounded-xl text-lime">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-wider">AI Head Coach</h2>
                        <p className="text-xs text-gray-400">8-Week Tendon & Strength Masterplan Synthesizer</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-white">
                    <X size={20} />
                </button>
            </div>

            {/* Lagging Volume Detection Pill */}
            {laggingMuscles.length > 0 && (
                <div className="mt-4 p-3 rounded-2xl bg-gray-900 border border-gray-800 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                        <Activity size={14} />
                        <span>Detected 7-Day Volume Deficits:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {laggingMuscles.map(l => (
                            <span key={l.muscle} className="px-2 py-0.5 rounded-lg bg-black text-[11px] font-mono text-gray-300 border border-gray-700">
                                {l.label}: <strong className="text-amber-400">{l.sets} sets</strong>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 mt-5"
                    >
                        <p className="text-xs font-black uppercase text-lime tracking-wider">Step 1 of 3: Master Blueprint Doctrine</p>

                        <div className="space-y-2.5">
                            {[
                                {
                                    id: 'strength_tendon' as PlanDoctrine,
                                    name: '8-Week Raw Strength & Tendon Armor',
                                    badge: 'TENDON FOCUS',
                                    desc: 'Trains the neglected stabilizers: patellar isometrics, JM press, rotator cuff, and adductor stability so joints keep pace with heavy Big 4 loads.'
                                },
                                {
                                    id: 'aesthetic_armor' as PlanDoctrine,
                                    name: '8-Week Dense Aesthetic Armor',
                                    badge: '3D PHYSIQUE',
                                    desc: 'Builds the powerhouse muscles normal PPL ignores: Neck density, forearms & brachialis, tear-drop VMO, and 3D rear delts.'
                                },
                                {
                                    id: 'longevity_rehab' as PlanDoctrine,
                                    name: '8-Week Bulletproof Longevity Protocol',
                                    badge: 'JOINT HEALING',
                                    desc: 'Eliminates joint friction. 3-4s slow eccentrics, Rio et al. tendon analgesia holds, and decompression carries.'
                                }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setDoctrine(item.id)}
                                    className={`w-full p-4 rounded-2xl border text-left transition-all ${
                                        doctrine === item.id
                                            ? 'bg-lime/10 border-lime shadow-[0_0_15px_rgba(50,255,50,0.15)]'
                                            : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <p className={`font-black text-sm ${doctrine === item.id ? 'text-lime' : 'text-white'}`}>{item.name}</p>
                                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-black text-lime border border-lime/30">
                                            {item.badge}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                                </button>
                            ))}
                        </div>

                        {/* Curriculum Preview Box */}
                        <div className="p-3 bg-gray-950 rounded-2xl border border-gray-800 text-xs">
                            <p className="font-bold text-gray-300 mb-1 flex items-center gap-1.5">
                                <Flame size={14} className="text-lime" /> 8-Week Periodization Arc:
                            </p>
                            <p className="text-[11px] text-gray-400">
                                Weeks 1-2: Tendon Priming ➔ Weeks 3-5: Progressive Compound Tension ➔ Week 6: Connective Deload ➔ Weeks 7-8: Peak 1RM Testing.
                            </p>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full mt-4 py-3.5 bg-lime text-oled font-black rounded-xl hover:bg-lime/90 flex items-center justify-center gap-2 transition active:scale-95"
                        >
                            Next: Weak-Point Scan <ArrowRight size={16} />
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 mt-5"
                    >
                        <p className="text-xs font-black uppercase text-lime tracking-wider">Step 2 of 3: Joint Scars & Red Flags</p>
                        <p className="text-xs text-gray-400">The engine automatically swaps high-shear lifts to safe alternatives.</p>

                        <div className="space-y-2">
                            {[
                                { id: 'none' as RedFlag, name: '100% Iron Frame (No Pain)', desc: 'Full range of motion, heavy barbells enabled.' },
                                { id: 'shoulder' as RedFlag, name: 'Shoulder Impingement / AC Joint', desc: 'Adds Lu raises & serratus protraction; neutral dumbbell presses.' },
                                { id: 'knee' as RedFlag, name: 'Patellar Tendon / Knee Pain', desc: 'Pre-exhausts with 45s Spanish squats & Poliquin step-downs for VMO.' },
                                { id: 'back' as RedFlag, name: 'Lower Back / Spinal Shear', desc: 'Adds loaded Jefferson curls & heavy suitcase farmer carries.' },
                                { id: 'elbow_wrist' as RedFlag, name: 'Elbow / Wrist Tendon Strain', desc: 'Adds JM press, Zottman curls & forearm tendon remodeling.' }
                            ].map(item => {
                                const isSelected = scars.includes(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleScar(item.id)}
                                        className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                                            isSelected
                                                ? item.id === 'none'
                                                    ? 'bg-lime/10 border-lime'
                                                    : 'bg-red-500/10 border-red-500/50 shadow-sm'
                                                : 'bg-gray-900 border-gray-800'
                                        }`}
                                    >
                                        <p className={`font-black text-sm ${isSelected ? (item.id === 'none' ? 'text-lime' : 'text-red-400') : 'text-white'}`}>{item.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button onClick={() => setStep(1)} className="flex-1 py-3 bg-gray-900 text-gray-300 font-bold rounded-xl">
                                Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="flex-1 py-3 bg-lime text-oled font-black rounded-xl hover:bg-lime/90 flex items-center justify-center gap-2"
                            >
                                Equipment & Days <ArrowRight size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 mt-5"
                    >
                        <p className="text-xs font-black uppercase text-lime tracking-wider">Step 3 of 3: Equipment & Days</p>

                        <div>
                            <label className="text-xs font-bold text-gray-300 block mb-2">Gym Realm (Equipment)</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'commercial', label: 'Commercial Gym' },
                                    { id: 'cable', label: 'Cables & DBs' },
                                    { id: 'home', label: 'Home / Barbell' },
                                ].map((item: any) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setRealm(item.id)}
                                        className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                                            realm === item.id ? 'bg-lime text-oled border-lime' : 'bg-gray-900 border-gray-800 text-gray-400'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-300 block mb-2">Sessions Per Week</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[3, 4, 5].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDays(d)}
                                        className={`py-3 rounded-xl border font-mono text-sm font-black text-center transition-all ${
                                            days === d ? 'bg-lime text-oled border-lime' : 'bg-gray-900 border-gray-800 text-gray-400'
                                        }`}
                                    >
                                        {d} Days
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button onClick={() => setStep(2)} className="flex-1 py-3 bg-gray-900 text-gray-300 font-bold rounded-xl">
                                Back
                            </button>
                            <button
                                onClick={handleGenerate}
                                className="flex-1 py-3.5 bg-lime text-oled font-black rounded-xl hover:bg-lime/90 flex items-center justify-center gap-2 shadow-[0_0_15px_#32FF32] transition active:scale-95"
                            >
                                <Zap size={16} /> Synthesize 8-Week Plan!
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
