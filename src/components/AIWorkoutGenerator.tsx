import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, X, AlertTriangle, Zap } from 'lucide-react';
import { WorkoutPlan, BodyPart } from '../types/database';
import { useAuth } from '../context/AuthContext';

interface AIWorkoutGeneratorProps {
    onGenerate: (plan: WorkoutPlan) => void;
    onClose: () => void;
}

type Archetype = 'tank' | 'berserker' | 'warrior';
type RedFlag = 'shoulder' | 'knee' | 'back' | 'none';
type Realm = 'commercial' | 'cable' | 'home';

export default function AIWorkoutGenerator({ onGenerate, onClose }: AIWorkoutGeneratorProps) {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [archetype, setArchetype] = useState<Archetype>('tank');
    const [scars, setScars] = useState<RedFlag[]>(['none']);
    const [realm, setRealm] = useState<Realm>('commercial');
    const [days, setDays] = useState<number>(4);

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
        let name = 'AI ';
        let target: BodyPart = 'Full Body';
        const exercises: any[] = [];

        const hasShoulder = scars.includes('shoulder');
        const hasKnee = scars.includes('knee');
        const hasBack = scars.includes('back');

        // Dynamically calibrate weights based on user strength profile & bodyweight
        const bw = user?.weight_kg || 75;
        const bench1RM = user?.big4?.bench || (bw * 1.0);
        const squat1RM = user?.big4?.squat || (bw * 1.3);
        const deadlift1RM = user?.big4?.deadlift || (bw * 1.6);
        const ohp1RM = user?.big4?.ohp || (bw * 0.6);

        // Calibrated loads (rounded to nearest 2.5kg plate increment)
        const heavyBench = Math.max(30, Math.round((bench1RM * 0.75) / 2.5) * 2.5);
        const heavySquat = Math.max(40, Math.round((squat1RM * 0.75) / 2.5) * 2.5);
        const heavyDeadlift = Math.max(50, Math.round((deadlift1RM * 0.75) / 2.5) * 2.5);
        const heavyHackSquat = Math.max(40, Math.round((squat1RM * 0.85) / 2.5) * 2.5);
        const neutralDbPress = Math.max(12, Math.round((bench1RM * 0.32) / 2) * 2);
        const cableFly = Math.max(8, Math.round((bench1RM * 0.18) / 2.5) * 2.5);
        const tBarRow = Math.max(20, Math.round((deadlift1RM * 0.35) / 2.5) * 2.5);
        const suitcaseCarry = Math.max(14, Math.round((bw * 0.25) / 2) * 2);
        const hamstringCurl = Math.max(20, Math.round((squat1RM * 0.30) / 2.5) * 2.5);
        const latPulldown = Math.max(25, Math.round((deadlift1RM * 0.40) / 2.5) * 2.5);
        const lateralRaise = Math.max(6, Math.round((ohp1RM * 0.15)));
        const tricepPushdown = Math.max(12, Math.round((bench1RM * 0.25) / 2.5) * 2.5);
        const bicepCurl = Math.max(8, Math.round((bench1RM * 0.18) / 2) * 2);
        const trapBarDeadlift = Math.max(50, Math.round((deadlift1RM * 0.70) / 2.5) * 2.5);
        const weightedPullUp = Math.max(0, Math.round(bw > 85 ? 0 : 10));
        const kbCarry = Math.max(12, Math.round((bw * 0.20) / 2) * 2);

        if (archetype === 'tank') {
            name += 'Eldritch Tank Protocol';
            target = 'Full Body';

            // If knee scar, hamstring curl comes FIRST!
            if (hasKnee) {
                exercises.push({
                    id: `${planId}-1`,
                    name: 'Seated Hamstring Curls (Joint Lube)',
                    sets: 3,
                    reps: 15,
                    weight: hamstringCurl,
                    notes: '3s eccentric · Pre-exhausts knee capsule'
                });
                exercises.push({
                    id: `${planId}-2`,
                    name: 'Spanish Squat / Banded Hack Squat',
                    sets: 3,
                    reps: 10,
                    weight: heavyHackSquat,
                    notes: '3s lowering · Vertical shins'
                });
            } else {
                exercises.push({
                    id: `${planId}-1`,
                    name: 'Barbell Box Squat',
                    sets: 4,
                    reps: 6,
                    weight: heavySquat,
                    notes: 'Controlled 2s down · Explode up'
                });
            }

            // Shoulder friendly pressing
            if (hasShoulder) {
                exercises.push({
                    id: `${planId}-3`,
                    name: 'Neutral-Grip Dumbbell Press (Floor/Incline)',
                    sets: 3,
                    reps: 10,
                    weight: neutralDbPress,
                    notes: '3s eccentric · Tuck elbows 30°'
                });
                exercises.push({
                    id: `${planId}-4`,
                    name: 'Standing Cable Fly (Neutral Wrist)',
                    sets: 3,
                    reps: 12,
                    weight: cableFly,
                    notes: 'Constant tension · Joint-safe'
                });
            } else {
                exercises.push({
                    id: `${planId}-3`,
                    name: 'Barbell Bench Press',
                    sets: 4,
                    reps: 6,
                    weight: heavyBench,
                    notes: 'Explosive drive · Strict arch'
                });
            }

            // Back friendly pulling
            if (hasBack) {
                exercises.push({
                    id: `${planId}-5`,
                    name: 'Chest-Supported T-Bar Row',
                    sets: 4,
                    reps: 10,
                    weight: tBarRow,
                    notes: 'Zero lumbar shear'
                });
                exercises.push({
                    id: `${planId}-6`,
                    name: 'Suitcase Carry (45s hold)',
                    sets: 3,
                    reps: 45,
                    weight: suitcaseCarry,
                    notes: 'Walk tall · Neutral spine'
                });
            } else {
                exercises.push({
                    id: `${planId}-5`,
                    name: 'Barbell Deadlift',
                    sets: 3,
                    reps: 5,
                    weight: heavyDeadlift,
                    notes: 'Reset every rep · Braced core'
                });
            }
        } else if (archetype === 'berserker') {
            name += 'Iron Berserker Hypertrophy';
            target = 'Chest';
            exercises.push(
                { id: `${planId}-1`, name: hasShoulder ? 'Incline Neutral DB Press' : 'Incline Barbell Bench', sets: 4, reps: 10, weight: hasShoulder ? neutralDbPress : Math.round(heavyBench * 0.85), notes: '3s lowering tempo' },
                { id: `${planId}-2`, name: 'Lat Pulldown (Mag Grip)', sets: 4, reps: 12, weight: latPulldown, notes: 'Full squeeze at clavicle' },
                { id: `${planId}-3`, name: 'Cable Lateral Raise', sets: 4, reps: 15, weight: lateralRaise, notes: 'Lead with elbow' },
                { id: `${planId}-4`, name: 'Rope Tricep Pushdown', sets: 3, reps: 12, weight: tricepPushdown, notes: 'Flared finish' },
                { id: `${planId}-5`, name: 'Incline Dumbbell Bicep Curl', sets: 3, reps: 12, weight: bicepCurl, notes: 'Deep stretch at bottom' }
            );
        } else {
            name += 'Agile Warrior Hybrid';
            target = 'Full Body';
            exercises.push(
                { id: `${planId}-1`, name: 'Trap Bar Deadlift', sets: 4, reps: 8, weight: trapBarDeadlift, notes: 'Power production' },
                { id: `${planId}-2`, name: 'Weighted Pull-Ups', sets: 3, reps: 6, weight: weightedPullUp, notes: 'Chest to bar' },
                { id: `${planId}-3`, name: 'Overhead Kettlebell Carry', sets: 3, reps: 40, weight: kbCarry, notes: 'Rotator cuff stability' },
                { id: `${planId}-4`, name: 'Bodyweight Push-Up Burnout', sets: 3, reps: 20, weight: 0, notes: 'To mechanical failure' }
            );
        }

        const newPlan: WorkoutPlan = {
            id: planId,
            name,
            author_id: 'ai-head-coach',
            target,
            exercises,
            shared: false,
            created_at: new Date().toISOString()
        };

        onGenerate(newPlan);
    };

    return (
        <div className="p-6 pb-12 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-lime rounded-xl shadow-[0_0_15px_-5px_#32FF32]">
                        <Sparkles size={20} className="text-oled" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">AI Head Coach</h3>
                        <p className="text-xs text-gray-400">Roll custom joint-safe split</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        <p className="text-xs font-black uppercase text-lime tracking-wider">Step 1 of 3: Class & Archetype</p>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: 'tank', label: 'Eldritch Tank', sub: 'Heavy compound & cables, joint-safe priority', badge: 'Recommended' },
                                { id: 'berserker', label: 'Iron Berserker', sub: 'High volume hypertrophy and pump' },
                                { id: 'warrior', label: 'Agile Warrior', sub: 'Hybrid athletic conditioning & strength' },
                            ].map((item: any) => (
                                <button
                                    key={item.id}
                                    onClick={() => setArchetype(item.id)}
                                    className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${
                                        archetype === item.id
                                            ? 'bg-lime/10 border-lime text-white shadow-[inset_0_0_20px_-10px_#32FF32]'
                                            : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                                    }`}
                                >
                                    <div>
                                        <p className="font-bold text-white text-sm">{item.label}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                                    </div>
                                    {item.badge && (
                                        <span className="text-[10px] px-2 py-0.5 bg-lime/20 text-lime rounded-full font-bold">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-3 bg-lime text-oled font-black rounded-xl hover:bg-lime/90 flex items-center justify-center gap-2 mt-4"
                        >
                            Continue to Red Flags <ArrowRight size={16} />
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        <p className="text-xs font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5">
                            <AlertTriangle size={14} /> Step 2 of 3: Battle Scars & Joint Red Flags
                        </p>
                        <p className="text-xs text-gray-400">Select any active aches so Coach can auto-swap aggravating lifts:</p>

                        <div className="space-y-2.5">
                            {[
                                { id: 'shoulder', label: 'Left Shoulder Pinch / Impingement', sub: 'Replaces flared pressing with neutral cables' },
                                { id: 'knee', label: 'Patellar Knee Shear', sub: 'Puts Hamstring Curls first on leg days' },
                                { id: 'back', label: 'Lower Back / Spinal Tightness', sub: 'Replaces heavy axial loading with chest-supported lifts' },
                                { id: 'none', label: 'None (100% Joint Clear)', sub: 'Standard compound programming' },
                            ].map((item: any) => {
                                const isChecked = scars.includes(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleScar(item.id)}
                                        className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                                            isChecked
                                                ? 'bg-red-500/10 border-red-500/40 text-white'
                                                : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                                        }`}
                                    >
                                        <div>
                                            <p className="font-bold text-white text-xs">{item.label}</p>
                                            <p className="text-[11px] text-gray-400">{item.sub}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                                            isChecked ? 'bg-red-500 border-red-500 text-white' : 'border-gray-700'
                                        }`}>
                                            {isChecked && <ShieldCheck size={14} />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 py-3 bg-gray-900 text-gray-300 font-bold rounded-xl"
                            >
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
                        className="space-y-4"
                    >
                        <p className="text-xs font-black uppercase text-lime tracking-wider">Step 3 of 3: Realm & Quest Days</p>

                        <div>
                            <label className="text-xs font-bold text-gray-300 block mb-2">Training Realm (Equipment)</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'commercial', label: 'Commercial Gym' },
                                    { id: 'cable', label: 'Cable Heavy' },
                                    { id: 'home', label: 'Home / Barbell' },
                                ].map((item: any) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setRealm(item.id)}
                                        className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                                            realm === item.id
                                                ? 'bg-lime text-oled border-lime'
                                                : 'bg-gray-900 border-gray-800 text-gray-400'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-300 block mb-2">Quest Days Per Week</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[3, 4, 5].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDays(d)}
                                        className={`py-3 rounded-xl border font-mono text-sm font-black text-center transition-all ${
                                            days === d
                                                ? 'bg-lime text-oled border-lime'
                                                : 'bg-gray-900 border-gray-800 text-gray-400'
                                        }`}
                                    >
                                        {d} Days
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 py-3 bg-gray-900 text-gray-300 font-bold rounded-xl"
                            >
                                Back
                            </button>
                            <button
                                onClick={generatePlan}
                                className="flex-1 py-3 bg-lime text-oled font-black rounded-xl hover:bg-lime/90 flex items-center justify-center gap-2 shadow-[0_0_15px_#32FF32]"
                            >
                                <Zap size={16} /> Roll Custom Split!
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
