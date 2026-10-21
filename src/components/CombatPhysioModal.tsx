import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Play, Pause, RotateCcw, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CombatPhysioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplySwap?: (oldEx: string, newEx: string) => void;
}

type JointCategory = 'shoulder' | 'knee' | 'back' | 'elbow_wrist';

interface InjuryProtocol {
    id: JointCategory;
    title: string;
    icon: string;
    rootCause: string;
    rehabTimerName: string;
    rehabInstructions: string;
    tempoCue: string;
    swaps: { avoid: string; useInstead: string; reason: string }[];
}

const PROTOCOLS: Record<JointCategory, InjuryProtocol> = {
    shoulder: {
        id: 'shoulder',
        title: 'Left Shoulder Pinch / Impingement',
        icon: '🛡️',
        rootCause: 'Subacromial space narrowing during internal rotation & excessive flare in horizontal pressing.',
        rehabTimerName: '45s Scapular Wall Slide / Neutral Isometric Hold',
        rehabInstructions: 'Press forearms firmly against wall at 90° in scapular plane (30° forward). Maintain steady isometric pressure without shrugging traps.',
        tempoCue: 'Strict 3-second eccentric lowering on all pressing movements.',
        swaps: [
            { avoid: 'Barbell Bench Press (flared elbows)', useInstead: 'Neutral-Grip Dumbbell / Cable Chest Press', reason: 'Spares anterior shoulder capsule and keeps humerus centered in the glenoid.' },
            { avoid: 'Dips past 90 degrees', useInstead: 'Cable Tricep Pushdown with Rope', reason: 'Eliminates extreme anterior shoulder glide under heavy bodyweight load.' },
            { avoid: 'Behind-the-Neck OHP', useInstead: 'Seated Neutral-Grip Dumbbell Overhead Press', reason: 'Natural scapular plane path avoids subacromial pinch.' }
        ]
    },
    knee: {
        id: 'knee',
        title: 'Patellar Knee Shear / Tendonitis',
        icon: '🦵',
        rootCause: 'Excessive anterior knee translation under deep quadriceps load before patellar tendon is warmed.',
        rehabTimerName: '45s Spanish Squat Isometric Hold',
        rehabInstructions: 'Loop a heavy resistance band behind knees anchored to rig. Sit back to 70-80° knee flexion with vertical shins. Hold firm.',
        tempoCue: 'Hamstring Curls FIRST on every leg session to lubricate the joint + 3s eccentric cadence.',
        swaps: [
            { avoid: 'Deep Barbell Squat with forward knees', useInstead: 'Hamstring Curls First + Spanish Squats', reason: 'Recruits hamstrings and patellar tendon analgesia (Rio et al. 2015 protocol).' },
            { avoid: 'Heavy Leg Extension at 90° lock', useInstead: 'Reverse Sled Drag / Wall Sit 45s Hold', reason: 'Removes peak shear force on the patella while building tendon tolerance.' }
        ]
    },
    back: {
        id: 'back',
        title: 'Lower Back / Spinal Compression',
        icon: '🦴',
        rootCause: 'Lumbar flexion under axial compressive load (butt wink / rounding under fatigue).',
        rehabTimerName: '45s Suitcase Carry / McGill Side Plank',
        rehabInstructions: 'Hold heavy dumbbell in one hand. Walk tall without leaning. Fire the quadratus lumborum to stabilize the pelvis.',
        tempoCue: 'Maintain neutral spine brace (valsalva maneuver) before every rep; stop 2 reps before form breakdown.',
        swaps: [
            { avoid: 'Heavy Conventional Deadlift from floor', useInstead: 'Trap Bar Deadlift / Chest-Supported T-Bar Row', reason: 'Brings center of gravity inside the base of support, reducing spinal moment arm.' },
            { avoid: 'Standing Barbell Good Mornings', useInstead: 'Glute-Ham Raise / 45° Hyperextension', reason: 'Loads posterior chain without compressive shear on lumbar discs.' }
        ]
    },
    elbow_wrist: {
        id: 'elbow_wrist',
        title: 'Elbow & Wrist Tendon Strain',
        icon: '🦾',
        rootCause: 'Repetitive wrist extension/flexion torque under heavy barbell loading (Golfer/Tennis elbow).',
        rehabTimerName: '45s Neutral-Grip Farmer Walk or Deadhang',
        rehabInstructions: 'Hang with relaxed shoulders or hold heavy farmer bars with neutral wrists. Keep forearms under constant isometric tension.',
        tempoCue: 'Use open or neutral grip; avoid aggressive wrist cocking during curls or presses.',
        swaps: [
            { avoid: 'Straight Bar Barbell Curl', useInstead: 'EZ-Bar / Hammer Curls with Neutral Grip', reason: 'Aligns the radius and ulna, reducing medial epicondyle torque.' },
            { avoid: 'Heavy Skull Crushers', useInstead: 'Cable Overhead Tricep Extension with Rope', reason: 'Constant cable tension removes destructive torque spike at bottom elbow lockout.' }
        ]
    }
};

export default function CombatPhysioModal({ isOpen, onClose }: CombatPhysioModalProps) {
    const [selectedJoint, setSelectedJoint] = useState<JointCategory>('shoulder');
    const [timeLeft, setTimeLeft] = useState(45);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const protocol = PROTOCOLS[selectedJoint];

    // 45s Isometric Timer
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, timeLeft]);

    const handleStartPause = () => {
        setIsRunning(prev => !prev);
    };

    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(45);
    };

    const handleSwitchJoint = (j: JointCategory) => {
        setSelectedJoint(j);
        setIsRunning(false);
        setTimeLeft(45);
    };

    if (!isOpen) return null;

    const timerPct = Math.round(((45 - timeLeft) / 45) * 100);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-md bg-gray-950 border border-gray-800 rounded-3xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
                    >
                        <X size={20} />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-lime/10 border border-lime/30 text-lime rounded-2xl shadow-[0_0_15px_-5px_#32FF32]">
                            <ShieldAlert size={22} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white flex items-center gap-2">
                                QUEN COMBAT PHYSIO
                            </h3>
                            <p className="text-xs text-gray-400">Real-time biomechanical triage & 45s tendon rehab</p>
                        </div>
                    </div>

                    {/* Joint Selector Pills */}
                    <div className="grid grid-cols-2 gap-2">
                        {(['shoulder', 'knee', 'back', 'elbow_wrist'] as JointCategory[]).map(key => {
                            const p = PROTOCOLS[key];
                            const isSelected = selectedJoint === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleSwitchJoint(key)}
                                    className={`p-2.5 rounded-xl border text-left transition-all text-xs font-bold flex items-center gap-2 ${
                                        isSelected
                                            ? 'bg-lime text-oled border-lime shadow-md'
                                            : 'bg-gray-900 text-gray-300 border-gray-800 hover:border-gray-700'
                                    }`}
                                >
                                    <span>{p.icon}</span>
                                    <span className="truncate">{p.title.split('/')[0]}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Active Joint Diagnosis Card */}
                    <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black text-white">{protocol.title}</h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-lime/10 text-lime border border-lime/30 font-bold">
                                Joint Safe
                            </span>
                        </div>

                        <p className="text-xs text-gray-300 leading-relaxed">
                            <strong className="text-lime">Biomechanical Root Cause:</strong> {protocol.rootCause}
                        </p>

                        <div className="p-2.5 bg-black/60 rounded-xl border border-gray-800 text-xs text-amber-300 font-mono">
                            ⚡ {protocol.tempoCue}
                        </div>
                    </div>

                    {/* 45-Second Isometric Rehab Timer (Rio et al. Protocol) */}
                    <div className="p-5 bg-gradient-to-br from-gray-900 to-black border border-lime/40 rounded-2xl text-center space-y-4 shadow-xl">
                        <div>
                            <span className="text-[10px] font-black tracking-wider uppercase text-lime block mb-1">
                                Evidence-Based Tendon Analgesia (Rio et al. 2015)
                            </span>
                            <h5 className="text-sm font-bold text-white">{protocol.rehabTimerName}</h5>
                            <p className="text-[11px] text-gray-400 mt-1">{protocol.rehabInstructions}</p>
                        </div>

                        {/* Circular Timer Visual */}
                        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-gray-800"
                                    strokeWidth="3.5"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="text-lime transition-all duration-300"
                                    strokeDasharray={`${timerPct}, 100`}
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <div className="absolute font-mono">
                                <span className="text-3xl font-black text-white">{timeLeft}</span>
                                <span className="text-[10px] text-gray-400 block -mt-1">SEC</span>
                            </div>
                        </div>

                        {/* Timer Controls */}
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={handleStartPause}
                                className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all ${
                                    isRunning
                                        ? 'bg-amber-500 text-oled hover:bg-amber-400'
                                        : 'bg-lime text-oled hover:bg-lime/90 shadow-[0_0_12px_#32FF32]'
                                }`}
                            >
                                {isRunning ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start 45s Hold</>}
                            </button>
                            <button
                                onClick={handleReset}
                                className="p-2.5 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-xl"
                            >
                                <RotateCcw size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Recommended Safe Swaps */}
                    <div className="space-y-2">
                        <h5 className="text-xs font-black uppercase text-gray-400 px-1">Recommended Exercise Swaps</h5>
                        {protocol.swaps.map((swap, idx) => (
                            <div key={idx} className="p-3 bg-gray-900/60 border border-gray-800 rounded-xl space-y-1.5 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-red-400 line-through font-medium truncate max-w-[150px]">
                                        {swap.avoid}
                                    </span>
                                    <span className="text-gray-500 font-mono text-[10px]">SWAP TO</span>
                                    <span className="text-lime font-bold truncate max-w-[150px]">
                                        {swap.useInstead}
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-400 italic">{swap.reason}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
