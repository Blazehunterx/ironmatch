import { useState } from 'react';
import { motion } from 'framer-motion';
import { Big4Lifts, Rank } from '../../lib/gamification';
import { Camera, Sparkles, Activity, Trophy } from 'lucide-react';
import PlacementMatchModal from '../placement/PlacementMatchModal';
import InteractiveBodyCalibration from './InteractiveBodyCalibration';
import { TierBadge, rankFor } from '../profile/RankBadge';

interface Big4StepProps {
    lifts: Big4Lifts;
    unitPref: 'lbs' | 'kg';
    rank: Rank;
    hasAnyLift: boolean;
    onSetLifts: (lifts: Big4Lifts) => void;
}

const Big4Step: React.FC<Big4StepProps> = ({
    lifts, unitPref, rank, hasAnyLift, onSetLifts
}) => {
    // Mode: 'guided_body' for new lifters or 'experienced_direct' for seasoned powerlifters
    const [calibrationMode, setCalibrationMode] = useState<'guided_body' | 'experienced_direct'>('guided_body');
    const [showPlacementModal, setShowPlacementModal] = useState(false);

    const liftConfigs = [
        { key: 'bench' as const, label: 'Bench Press', icon: '🪑' },
        { key: 'squat' as const, label: 'Squat', icon: '🏋️' },
        { key: 'deadlift' as const, label: 'Deadlift', icon: '⬆️' },
        { key: 'ohp' as const, label: 'Overhead Press', icon: '🙌' },
    ];

    const handleLiftChange = (key: keyof Big4Lifts, value: number) => {
        onSetLifts({ ...lifts, [key]: value });
    };

    const totalLifts = lifts.bench + lifts.squat + lifts.deadlift + lifts.ohp;

    return (
        <div className="flex-1 flex flex-col pb-8">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-2xl font-black text-white">Strength Calibration</h2>
                    {totalLifts > 0 && (
                        <span className="text-[10px] font-mono font-bold text-lime bg-lime/10 px-2 py-0.5 rounded-full border border-lime/30">
                            {totalLifts} {unitPref} Total
                        </span>
                    )}
                </div>
                <p className="text-xs text-gray-400 mb-3">
                    Choose your calibration style, or tap a 1-click starting preset below if you don't know your 1-Rep Max.
                </p>

                {/* 1-TAP BEGINNER / INTERMEDIATE / ADVANCED PRESETS */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <button
                        type="button"
                        onClick={() =>
                            onSetLifts(
                                unitPref === 'lbs'
                                    ? { bench: 65, squat: 85, deadlift: 115, ohp: 45 }
                                    : { bench: 30, squat: 40, deadlift: 50, ohp: 20 }
                            )
                        }
                        className="py-2 px-2 rounded-xl bg-gray-950 border border-lime/30 hover:border-lime text-left transition active:scale-95"
                    >
                        <div className="text-[9px] font-black uppercase text-lime">Beginner</div>
                        <div className="text-[10px] font-bold text-white truncate">
                            {unitPref === 'lbs' ? '45lb Bar Start' : '20kg Bar Start'}
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            onSetLifts(
                                unitPref === 'lbs'
                                    ? { bench: 155, squat: 205, deadlift: 255, ohp: 105 }
                                    : { bench: 70, squat: 95, deadlift: 115, ohp: 47.5 }
                            )
                        }
                        className="py-2 px-2 rounded-xl bg-gray-950 border border-white/10 hover:border-lime/50 text-left transition active:scale-95"
                    >
                        <div className="text-[9px] font-black uppercase text-gray-400">Intermediate</div>
                        <div className="text-[10px] font-bold text-white truncate">
                            {unitPref === 'lbs' ? '155 / 205 / 255' : '70 / 95 / 115kg'}
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            onSetLifts(
                                unitPref === 'lbs'
                                    ? { bench: 225, squat: 315, deadlift: 405, ohp: 135 }
                                    : { bench: 100, squat: 140, deadlift: 180, ohp: 60 }
                            )
                        }
                        className="py-2 px-2 rounded-xl bg-gray-950 border border-white/10 hover:border-lime/50 text-left transition active:scale-95"
                    >
                        <div className="text-[9px] font-black uppercase text-amber-400">Advanced</div>
                        <div className="text-[10px] font-bold text-white truncate">
                            {unitPref === 'lbs' ? '2/3/4 Plate Club' : '100/140/180kg'}
                        </div>
                    </button>
                </div>

                {/* TWO-TRACK SEGMENTED SELECTOR */}
                <div className="p-1 rounded-2xl bg-gray-950 border border-gray-800 grid grid-cols-2 gap-1 mb-4">
                    <button
                        type="button"
                        onClick={() => setCalibrationMode('guided_body')}
                        className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                            calibrationMode === 'guided_body'
                                ? 'bg-lime text-oled shadow-[0_0_15px_rgba(50,255,50,0.3)]'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Activity size={14} /> Interactive Body
                    </button>
                    <button
                        type="button"
                        onClick={() => setCalibrationMode('experienced_direct')}
                        className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                            calibrationMode === 'experienced_direct'
                                ? 'bg-lime text-oled shadow-[0_0_15px_rgba(50,255,50,0.3)]'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Trophy size={14} /> Experienced (Big 4)
                    </button>
                </div>
            </motion.div>

            {/* TRACK 1: GUIDED INTERACTIVE BODY CALIBRATION */}
            {calibrationMode === 'guided_body' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <InteractiveBodyCalibration
                        unitPref={unitPref}
                        currentLifts={lifts}
                        onCalibratedLiftsChange={onSetLifts}
                    />
                </motion.div>
            )}

            {/* TRACK 2: EXPERIENCED DIRECT BIG 4 LIFT ENTRY */}
            {calibrationMode === 'experienced_direct' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                >
                    {/* Instant Snapshot Placement Button */}
                    <button
                        type="button"
                        onClick={() => setShowPlacementModal(true)}
                        className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-lime/20 via-gray-900 to-black border border-lime/40 flex items-center justify-between text-left hover:border-lime transition-all active:scale-[0.98] shadow-lg shadow-lime/5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-lime text-oled rounded-xl shrink-0">
                                <Camera size={18} />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-black text-white uppercase italic">Snap Bar or Load Digital Plates</p>
                                    <span className="text-[8px] bg-lime text-oled px-1.5 py-0.2 rounded font-black uppercase">Instant</span>
                                </div>
                                <p className="text-[10px] text-gray-400">Zero manual math · Auto-derives your Big 4</p>
                            </div>
                        </div>
                        <Sparkles size={16} className="text-lime shrink-0" />
                    </button>

                    {hasAnyLift && (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-3 bg-gray-950 border border-lime/30 rounded-2xl p-3">
                            <TierBadge 
                                tier={rankFor(unitPref === 'lbs' ? Math.round(totalLifts / 2.20462) : totalLifts).tier} 
                                size="sm" 
                            />
                            <div>
                                <p className="text-xs font-black uppercase text-white tracking-wider">{rank.name} Tier</p>
                                <p className="text-[10px] text-gray-400 font-mono">{totalLifts} {unitPref} total recorded</p>
                            </div>
                        </motion.div>
                    )}

                    <div className="space-y-2.5">
                        {liftConfigs.map((lift, idx) => (
                            <motion.div key={lift.key} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.06 }}
                                className="bg-gray-950 border border-gray-800/90 rounded-2xl p-3.5 flex items-center gap-3 hover:border-gray-700 transition">
                                <span className="text-2xl">{lift.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white truncate">{lift.label}</p>
                                    <p className="text-[9px] text-gray-500 font-mono">1 Rep Max</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <input 
                                        type="number" 
                                        value={lifts[lift.key] || ''}
                                        onChange={e => handleLiftChange(lift.key, Number(e.target.value) || 0)}
                                        placeholder="0"
                                        className="w-20 bg-oled border border-gray-700 text-white text-sm font-mono font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-lime text-center" 
                                    />
                                    <span className="text-[10px] text-gray-500 font-bold">{unitPref}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                const starterWeights = unitPref === 'kg'
                                    ? { bench: 30, squat: 40, deadlift: 50, ohp: 20 }
                                    : { bench: 65, squat: 90, deadlift: 115, ohp: 45 };
                                onSetLifts(starterWeights);
                            }}
                            className="w-full py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-[11px] font-bold text-gray-400 hover:text-white transition flex items-center justify-center gap-2"
                        >
                            🌱 Set Freshman Starter Baseline (Empty Bar + Dumbbells)
                        </button>
                    </div>
                </motion.div>
            )}

            <PlacementMatchModal
                isOpen={showPlacementModal}
                onClose={() => setShowPlacementModal(false)}
                onPlacementComplete={(_rankName, big4) => {
                    onSetLifts(big4);
                    setShowPlacementModal(false);
                }}
            />
        </div>
    );
};

export default Big4Step;
