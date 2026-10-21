import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dumbbell } from 'lucide-react';

interface PlateCalculatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialWeight?: number;
    unit?: 'kg' | 'lbs';
}

interface PlateCount {
    weight: number;
    count: number;
    color: string;
}

const KG_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
const LBS_PLATES = [45, 35, 25, 10, 5, 2.5];

const PLATE_COLORS_KG: Record<number, string> = {
    25: 'bg-red-600 border-red-400 text-white',
    20: 'bg-blue-600 border-blue-400 text-white',
    15: 'bg-yellow-500 border-yellow-300 text-black',
    10: 'bg-green-600 border-green-400 text-white',
    5: 'bg-white/80 border-white text-black',
    2.5: 'bg-gray-700 border-gray-500 text-white',
    1.25: 'bg-zinc-800 border-zinc-600 text-gray-300'
};

export default function PlateCalculatorModal({
    isOpen,
    onClose,
    initialWeight = 100,
    unit = 'kg'
}: PlateCalculatorModalProps) {
    const isKg = unit === 'kg';
    const defaultBar = isKg ? 20 : 45;
    const [targetWeight, setTargetWeight] = useState<number>(initialWeight);
    const [barWeight, setBarWeight] = useState<number>(defaultBar);

    if (!isOpen) return null;

    const availablePlates = isKg ? KG_PLATES : LBS_PLATES;

    // Calculate plates per side
    const calculatePlatesPerSide = (): { plates: PlateCount[]; remaining: number } => {
        let weightPerSide = Math.max(0, (targetWeight - barWeight) / 2);
        const result: PlateCount[] = [];

        for (const plate of availablePlates) {
            if (weightPerSide >= plate) {
                const count = Math.floor(weightPerSide / plate);
                result.push({
                    weight: plate,
                    count,
                    color: PLATE_COLORS_KG[plate] || 'bg-gray-700 text-white'
                });
                weightPerSide = Number((weightPerSide - count * plate).toFixed(2));
            }
        }

        return { plates: result, remaining: weightPerSide };
    };

    const { plates, remaining } = calculatePlatesPerSide();
    const weightPerSideTotal = Math.max(0, (targetWeight - barWeight) / 2);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[350] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md bg-oled border border-white/10 rounded-t-[32px] sm:rounded-[32px] p-6 pb-8 z-10 shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-lime/10 border border-lime/30 flex items-center justify-center text-lime shadow-[0_0_15px_rgba(50,255,50,0.15)]">
                                <Dumbbell size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-black italic tracking-wide text-white uppercase">
                                    Plate Calculator
                                </h3>
                                <p className="text-[11px] font-bold text-gray-400">
                                    Load on each side of the barbell
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5 active:scale-95 transition"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Target Weight Controls */}
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 mb-4">
                        <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
                            Total Lift Weight
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setTargetWeight(prev => Math.max(barWeight, prev - (isKg ? 2.5 : 5)))}
                                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black text-lg active:scale-95 transition flex items-center justify-center border border-white/10"
                                >
                                    -
                                </button>
                                <div className="text-3xl font-black italic text-lime tabular-nums tracking-tight">
                                    {targetWeight} <span className="text-xs uppercase not-italic text-gray-400">{unit}</span>
                                </div>
                                <button
                                    onClick={() => setTargetWeight(prev => prev + (isKg ? 2.5 : 5))}
                                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black text-lg active:scale-95 transition flex items-center justify-center border border-white/10"
                                >
                                    +
                                </button>
                            </div>

                            {/* Bar Type Selector */}
                            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/5">
                                {[
                                    { name: isKg ? '20kg' : '45lb', val: isKg ? 20 : 45 },
                                    { name: isKg ? '15kg' : '35lb', val: isKg ? 15 : 35 },
                                    { name: isKg ? '10kg' : '25lb', val: isKg ? 10 : 25 }
                                ].map(bar => (
                                    <button
                                        key={bar.val}
                                        onClick={() => setBarWeight(bar.val)}
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition uppercase ${
                                            barWeight === bar.val
                                                ? 'bg-lime text-black shadow-[0_0_10px_rgba(50,255,50,0.3)]'
                                                : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        {bar.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Visual Barbell Representation */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-4">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                Per Side: <span className="text-white font-bold">{weightPerSideTotal} {unit}</span>
                            </span>
                            {remaining > 0 && (
                                <span className="text-[10px] font-bold text-yellow-400">
                                    +{remaining} {unit} unaccounted
                                </span>
                            )}
                        </div>

                        {/* Bar Sleeve & Loaded Plates */}
                        <div className="relative flex items-center h-20 bg-zinc-950/80 rounded-xl px-4 border border-zinc-900 overflow-x-auto no-scrollbar">
                            {/* Bar Sleeve */}
                            <div className="h-4 w-12 bg-gradient-to-r from-zinc-700 to-zinc-500 rounded-l flex-shrink-0" />
                            <div className="h-10 w-2.5 bg-zinc-400 rounded-sm flex-shrink-0 mr-2" />

                            {/* Stacked Plates */}
                            <div className="flex items-center gap-1.5 flex-1">
                                {plates.length === 0 ? (
                                    <span className="text-xs text-gray-500 italic">Empty Bar ({barWeight} {unit})</span>
                                ) : (
                                    plates.map((p, pIdx) => (
                                        Array.from({ length: p.count }).map((_, cIdx) => (
                                            <motion.div
                                                key={`${pIdx}-${cIdx}`}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className={`flex-shrink-0 h-16 w-5 rounded-md border flex items-center justify-center font-black text-[9px] shadow-md ${p.color}`}
                                                title={`${p.weight} ${unit}`}
                                            >
                                                <span className="rotate-90 select-none tracking-tighter">
                                                    {p.weight}
                                                </span>
                                            </motion.div>
                                        ))
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Plate List Breakdown */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {plates.map(p => (
                            <div
                                key={p.weight}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5"
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-3.5 h-3.5 rounded-md border ${p.color}`} />
                                    <span className="text-xs font-bold text-white">{p.weight} {unit}</span>
                                </div>
                                <span className="text-xs font-black text-lime">× {p.count}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3.5 rounded-2xl bg-lime text-black font-black text-xs uppercase tracking-wider hover:bg-lime/90 active:scale-95 transition shadow-[0_0_20px_rgba(50,255,50,0.25)]"
                    >
                        Got It, Ready To Lift
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
