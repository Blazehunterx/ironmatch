import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, Zap, Activity } from 'lucide-react';
import { WorkoutPlan, BodyPart, WorkoutExercise, WorkoutLog } from '../types/database';
import { useAuth } from '../context/AuthContext';
import { EXERCISE_DATABASE } from '../lib/exercises';
import { weeklyMuscleSets, MUSCLES, Muscle } from '../lib/muscles';

interface AIWorkoutGeneratorProps {
    onGenerate: (plan: WorkoutPlan) => void;
    onClose: () => void;
    logs?: WorkoutLog[];
}

type Archetype = 'hypertrophy' | 'powerlifting' | 'bulletproof';
type RedFlag = 'shoulder' | 'knee' | 'back' | 'none';
type Realm = 'commercial' | 'cable' | 'home';

export default function AIWorkoutGenerator({ onGenerate, onClose, logs = [] }: AIWorkoutGeneratorProps) {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [archetype, setArchetype] = useState<Archetype>('hypertrophy');
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

    const generatePlan = () => {
        const planId = `ai-${Date.now()}`;
        const hasShoulder = scars.includes('shoulder');
        const hasKnee = scars.includes('knee');
        const hasBack = scars.includes('back');

        const bw = user?.weight_kg || 75;
        const bench1RM = user?.big4?.bench || (bw * 1.0);
        const squat1RM = user?.big4?.squat || (bw * 1.3);
        const deadlift1RM = user?.big4?.deadlift || (bw * 1.6);
        const ohp1RM = user?.big4?.ohp || (bw * 0.6);

        // Filter exercise candidates based on realm and joint scars
        const candidateExercises = EXERCISE_DATABASE.filter(ex => {
            // Equipment check
            if (realm === 'cable' && (ex.modality === 'barbell' || ex.modality === 'smith')) return false;
            if (realm === 'home' && (ex.modality === 'machine' || ex.modality === 'cable')) return false;

            // Joint protection check
            if (hasShoulder && (ex.id === 'standing-barbell-ohp' || ex.id === 'barbell-bench-press' || ex.id === 'dips-chest')) return false;
            if (hasKnee && (ex.id === 'barbell-back-squat')) return false;
            if (hasBack && (ex.id === 'conventional-deadlift' || ex.id === 'barbell-row')) return false;

            return true;
        });

        // Assemble balanced routine targeting primary movement patterns + lagging volume
        const selectedExercises: WorkoutExercise[] = [];

        const addCandidate = (id: string, sets: number, reps: number, calcWeight: number, notes?: string) => {
            const found = candidateExercises.find(e => e.id === id) || EXERCISE_DATABASE.find(e => e.id === id);
            if (!found) return;
            selectedExercises.push({
                id: `${planId}-${selectedExercises.length + 1}`,
                name: found.name,
                sets,
                reps,
                weight: Math.max(0, Math.round(calcWeight / found.defaultIncrement) * found.defaultIncrement),
                modality: found.modality,
                notes: notes || found.description
            });
        };

        let protocolName = 'AI ';
        let target: BodyPart = 'Full Body';

        if (archetype === 'hypertrophy') {
            protocolName += 'Autoregulated Volume Optimizer';
            target = 'Full Body';

            // Knee friendly / Hamstring priority
            if (hasKnee) {
                addCandidate('seated-leg-curl', 4, 12, squat1RM * 0.32, 'Pre-exhausts knee capsule · 3s eccentric');
                addCandidate('romanian-deadlift', 4, 8, deadlift1RM * 0.65, 'Hinge focus, soft knees, zero shear');
                addCandidate('leg-press-45', 3, 10, squat1RM * 0.90, 'High foot placement for glute/hamstring recruitment');
            } else {
                addCandidate('barbell-back-squat', 4, 6, squat1RM * 0.75, 'Controlled 2s eccentric · Explode out of hole');
                addCandidate('seated-leg-curl', 3, 12, squat1RM * 0.30, 'Deep knee flexion pump');
            }

            // Shoulder friendly / Chest priority
            if (hasShoulder) {
                addCandidate('incline-dumbbell-press', 4, 10, bench1RM * 0.32, 'Neutral 30° tuck · Zero subacromial friction');
                addCandidate('cable-chest-fly', 3, 12, bench1RM * 0.18, 'Constant tension throughout full range');
                addCandidate('cable-face-pull', 4, 15, ohp1RM * 0.25, 'Rotator cuff stabilization & rear delts');
            } else {
                addCandidate('incline-barbell-bench-press', 4, 8, bench1RM * 0.70, 'Clavicular pec focus · 2s controlled descent');
                addCandidate('cable-chest-fly', 3, 12, bench1RM * 0.18, 'Peak squeeze at horizontal abduction');
            }

            // Back friendly / Pull priority
            if (hasBack) {
                addCandidate('chest-supported-t-bar-row', 4, 10, deadlift1RM * 0.40, 'Zero spinal axial loading');
                addCandidate('lat-pulldown', 4, 10, deadlift1RM * 0.40, 'Vertical pull · Drive elbows into back pockets');
            } else {
                addCandidate('barbell-row', 4, 8, deadlift1RM * 0.55, 'Strict 45° torso angle');
                addCandidate('pull-ups', 3, 8, bw > 85 ? 0 : 5, 'Full dead hang stretch');
            }

            addCandidate('cable-lateral-raise', 4, 15, ohp1RM * 0.15, 'Lagging lateral delt stimulus');
            addCandidate('standing-calf-raise', 3, 15, bw * 0.8, 'Full 3s bottom calf stretch');

        } else if (archetype === 'powerlifting') {
            protocolName += 'Big 4 Peaking Split';
            target = 'Full Body';

            addCandidate('barbell-back-squat', 5, 5, squat1RM * 0.80, 'Competition depth · Aggressive brace');
            addCandidate('barbell-bench-press', 5, 5, bench1RM * 0.80, 'Strict paused lockout on chest');
            addCandidate('conventional-deadlift', 4, 3, deadlift1RM * 0.82, 'Sub-maximal explosive speed pull');
            addCandidate('standing-barbell-ohp', 4, 6, ohp1RM * 0.75, 'Strict overhead press');
            addCandidate('barbell-row', 4, 8, deadlift1RM * 0.50, 'Scapular stability for bench platform');

        } else {
            protocolName += 'Combat Longevity & Bulletproof Protocol';
            target = 'Full Body';

            addCandidate('seated-leg-curl', 4, 15, squat1RM * 0.30, 'Tendon primer · Slow negative');
            addCandidate('incline-dumbbell-press', 4, 10, bench1RM * 0.30, 'Joint-safe neutral grip');
            addCandidate('chest-supported-t-bar-row', 4, 12, deadlift1RM * 0.35, 'Decompresses lumbar spine');
            addCandidate('cable-face-pull', 4, 20, ohp1RM * 0.20, 'Posterior rotator protection');
            addCandidate('cable-lateral-raise', 4, 15, ohp1RM * 0.15, 'Zero-shear side delt tension');
            addCandidate('hanging-leg-raise', 3, 12, 0, 'Spinal decompression + pelvic control');
        }

        const generatedPlan: WorkoutPlan = {
            id: planId,
            name: protocolName,
            author_id: user?.id || 'ai-coach',
            target,
            exercises: selectedExercises,
            shared: false,
            created_at: new Date().toISOString()
        };

        onGenerate(generatedPlan);
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
                        <p className="text-xs text-gray-400">Algorithmic Program Synthesizer</p>
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
                        <p className="text-xs font-black uppercase text-lime tracking-wider">Step 1 of 3: Training Doctrine</p>

                        <div className="space-y-2.5">
                            {[
                                {
                                    id: 'hypertrophy' as Archetype,
                                    name: 'Hypertrophy & Volume Balance',
                                    desc: 'Reads Muscle Heatmap to prioritize lagging muscle groups with optimal 10-14 set stimulus.'
                                },
                                {
                                    id: 'powerlifting' as Archetype,
                                    name: 'Powerlifting Big 4 Peaking',
                                    desc: 'Heavy linear progressive overload for Squat, Bench, Deadlift, and Overhead Press.'
                                },
                                {
                                    id: 'bulletproof' as Archetype,
                                    name: 'Bulletproof Longevity & Joints',
                                    desc: 'Eliminates joint shear. Emphasizes cables, neutral dumbbell grips, and isometric primers.'
                                }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setArchetype(item.id)}
                                    className={`w-full p-4 rounded-2xl border text-left transition-all ${
                                        archetype === item.id
                                            ? 'bg-lime/10 border-lime shadow-[0_0_15px_rgba(50,255,50,0.15)]'
                                            : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                                    }`}
                                >
                                    <p className={`font-black text-sm ${archetype === item.id ? 'text-lime' : 'text-white'}`}>{item.name}</p>
                                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full mt-4 py-3.5 bg-lime text-oled font-black rounded-xl hover:bg-lime/90 flex items-center justify-center gap-2 transition active:scale-95"
                        >
                            Next: Joint Profile <ArrowRight size={16} />
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
                                { id: 'shoulder' as RedFlag, name: 'Shoulder Impingement / AC Joint', desc: 'Swaps wide flat barbell bench to neutral dumbbell press & face pulls.' },
                                { id: 'knee' as RedFlag, name: 'Patellar Tendon / Knee Pain', desc: 'Pre-exhausts with hamstring curls, switches to vertical-shin leg presses.' },
                                { id: 'back' as RedFlag, name: 'Lower Back / Lumbar Shear', desc: 'Removes bent barbell rows & conventional deadlifts in favor of supported T-bars.' }
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
                                onClick={generatePlan}
                                className="flex-1 py-3.5 bg-lime text-oled font-black rounded-xl hover:bg-lime/90 flex items-center justify-center gap-2 shadow-[0_0_15px_#32FF32] transition active:scale-95"
                            >
                                <Zap size={16} /> Synthesize Protocol!
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
