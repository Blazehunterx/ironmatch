import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Dumbbell, Search, Check, AlertTriangle, Layers } from 'lucide-react';
import { BodyPart, ALL_BODY_PARTS, WorkoutExercise } from '../../types/database';
import { PlanExerciseItem } from './PlanExerciseItem';
import { EXERCISE_DATABASE, ExerciseDefinition, ExerciseModality } from '../../lib/exercises';

interface WorkoutPlanCreatorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, target: BodyPart, exercises: WorkoutExercise[], isPremium?: boolean, priceDisplay?: string) => Promise<void>;
    isTrainer?: boolean;
}

const MODALITY_BADGES: Record<ExerciseModality, { label: string; style: string }> = {
    barbell: { label: 'Barbell', style: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    dumbbell: { label: 'Dumbbell', style: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
    cable: { label: 'Cable', style: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    machine: { label: 'Machine', style: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
    bodyweight: { label: 'Bodyweight', style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    smith: { label: 'Smith', style: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30' },
};

const WorkoutPlanCreator: React.FC<WorkoutPlanCreatorProps> = ({ isOpen, onClose, onSave, isTrainer }) => {
    const [planName, setPlanName] = useState('');
    const [planTarget, setPlanTarget] = useState<BodyPart>('Chest');
    const [planExercises, setPlanExercises] = useState<WorkoutExercise[]>([]);
    const [showExercisePicker, setShowExercisePicker] = useState(false);
    const [pickerSearch, setPickerSearch] = useState('');
    const [pickerCategory, setPickerCategory] = useState<string>('All');
    const [pickerModality, setPickerModality] = useState<string>('All');
    const [recentAddedId, setRecentAddedId] = useState<string | null>(null);
    const [isPremium, setIsPremium] = useState(false);
    const [price, setPrice] = useState('9.99');

    // Filter exercises from full 150+ database
    const filteredExercises = useMemo(() => {
        return EXERCISE_DATABASE.filter(ex => {
            const matchesSearch = pickerSearch.trim() === '' ||
                ex.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
                ex.category.toLowerCase().includes(pickerSearch.toLowerCase()) ||
                ex.primaryMuscles.some(m => m.toLowerCase().includes(pickerSearch.toLowerCase())) ||
                ex.modality.toLowerCase().includes(pickerSearch.toLowerCase());

            const matchesCategory = pickerCategory === 'All' || ex.category.toLowerCase() === pickerCategory.toLowerCase();
            const matchesModality = pickerModality === 'All' || ex.modality.toLowerCase() === pickerModality.toLowerCase();

            return matchesSearch && matchesCategory && matchesModality;
        });
    }, [pickerSearch, pickerCategory, pickerModality]);

    const addExerciseFromDef = (ex: ExerciseDefinition) => {
        setPlanExercises(prev => [...prev, {
            id: `ne-${Date.now()}-${Math.random()}`,
            name: ex.name,
            sets: 3,
            reps: 10,
            modality: ex.modality,
        }]);
        setRecentAddedId(ex.id);
        setTimeout(() => setRecentAddedId(null), 1200);
    };

    const updateExercise = (id: string, field: string, value: number) => {
        setPlanExercises(prev => prev.map(e =>
            e.id === id ? { ...e, [field]: value } : e
        ));
    };

    const removeExercise = (id: string) => {
        setPlanExercises(prev => prev.filter(e => e.id !== id));
    };

    const handleSave = async () => {
        if (!planName.trim() || planExercises.length === 0) return;
        await onSave(planName, planTarget, planExercises, isPremium, `$${price}`);
        setPlanName('');
        setPlanExercises([]);
        setIsPremium(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/85 backdrop-blur-md z-[60]"
                    />
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-[60] bg-oled rounded-t-3xl max-h-[92vh] overflow-y-auto scrollbar-hide border-t border-gray-800"
                    >
                        <div className="px-5 pt-6 pb-32 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-white italic tracking-tight">Create Workout Plan</h3>
                                    <p className="text-[11px] text-gray-500 font-medium">Build a custom blueprint with precise modalities</p>
                                </div>
                                <button onClick={onClose} className="p-2 text-gray-500 hover:text-white rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>

                            <input
                                type="text"
                                value={planName}
                                onChange={(e) => setPlanName(e.target.value)}
                                placeholder="Plan name (e.g. Hypertrophy Push Destroyer)"
                                className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-lime"
                            />

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Primary Target</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {ALL_BODY_PARTS.map(bp => (
                                        <button
                                            key={bp}
                                            onClick={() => {
                                                setPlanTarget(bp);
                                                // Sync picker category if currently default
                                                if (pickerCategory === 'All' || ALL_BODY_PARTS.includes(pickerCategory as any)) {
                                                    setPickerCategory(bp);
                                                }
                                            }}
                                            className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${planTarget === bp
                                                ? 'bg-lime/20 border-lime/50 text-lime shadow-[0_0_10px_rgba(50,255,50,0.15)]'
                                                : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            {bp}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Exercises ({planExercises.length})
                                    </label>
                                    {planExercises.length > 0 && (
                                        <span className="text-[10px] text-gray-500 font-mono">
                                            ~{planExercises.reduce((acc, curr) => acc + (curr.sets || 3), 0) * 3} min estimated
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {planExercises.map((ex, idx) => (
                                        <PlanExerciseItem
                                            key={ex.id}
                                            exercise={ex}
                                            index={idx}
                                            onUpdate={updateExercise}
                                            onRemove={removeExercise}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={() => {
                                        setPickerCategory(planTarget);
                                        setShowExercisePicker(true);
                                    }}
                                    className="w-full mt-2.5 py-3 rounded-xl bg-gray-900 border border-gray-800 border-dashed text-gray-400 text-xs font-bold hover:border-lime/40 hover:text-lime transition-all flex items-center justify-center gap-1.5"
                                >
                                    <Plus size={16} className="text-lime" /> Add Exercise from Library (150+)
                                </button>
                            </div>

                            {/* Exercise Picker Drawer / Modal */}
                            <AnimatePresence>
                                {showExercisePicker && (
                                    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80 backdrop-blur-md">
                                        <motion.div
                                            initial={{ y: '100%' }}
                                            animate={{ y: 0 }}
                                            exit={{ y: '100%' }}
                                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                                            className="bg-oled border-t border-gray-800 rounded-t-3xl w-full max-w-lg p-5 max-h-[85vh] flex flex-col shadow-2xl"
                                        >
                                            <div className="flex items-center justify-between mb-3 shrink-0">
                                                <div>
                                                    <h4 className="text-base font-black text-white italic uppercase flex items-center gap-1.5">
                                                        <Layers size={18} className="text-lime" /> Exercise Library
                                                    </h4>
                                                    <p className="text-[10px] text-gray-500">Pick lifts across all equipment modalities</p>
                                                </div>
                                                <button
                                                    onClick={() => setShowExercisePicker(false)}
                                                    className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-gray-900 border border-gray-800"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>

                                            {/* Search Bar */}
                                            <div className="relative mb-3 shrink-0">
                                                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                                <input
                                                    type="text"
                                                    value={pickerSearch}
                                                    onChange={(e) => setPickerSearch(e.target.value)}
                                                    placeholder="Search exercises, muscles, modalities..."
                                                    className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl py-2.5 pl-9 pr-9 text-xs focus:outline-none focus:border-lime"
                                                />
                                                {pickerSearch && (
                                                    <button
                                                        onClick={() => setPickerSearch('')}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Category Filter Pills */}
                                            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-hide shrink-0">
                                                {['All', ...ALL_BODY_PARTS].map(cat => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => setPickerCategory(cat)}
                                                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all ${pickerCategory === cat
                                                            ? 'bg-lime text-oled border-lime font-black shadow-[0_0_10px_rgba(50,255,50,0.3)]'
                                                            : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                                                            }`}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Modality Filter Pills */}
                                            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-hide shrink-0">
                                                {['All', 'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'smith'].map(mod => (
                                                    <button
                                                        key={mod}
                                                        onClick={() => setPickerModality(mod)}
                                                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border whitespace-nowrap transition-all ${pickerModality === mod
                                                            ? 'bg-white/20 text-white border-white/40 font-black'
                                                            : 'bg-gray-900/60 border-gray-800/80 text-gray-500 hover:text-gray-300'
                                                            }`}
                                                    >
                                                        {mod}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Exercises Scrollable List */}
                                            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 divide-y divide-gray-900/40">
                                                {filteredExercises.length === 0 ? (
                                                    <div className="py-8 text-center text-gray-500 text-xs">
                                                        No exercises found matching your filters.
                                                    </div>
                                                ) : (
                                                    filteredExercises.map(ex => {
                                                        const badge = MODALITY_BADGES[ex.modality] || { label: ex.modality, style: 'bg-gray-800 text-gray-400 border-gray-700' };
                                                        const isJustAdded = recentAddedId === ex.id;

                                                        return (
                                                            <div
                                                                key={ex.id}
                                                                className="py-2.5 px-3 rounded-xl bg-gray-900/70 border border-gray-800/80 hover:border-gray-700 flex items-center justify-between gap-2 transition-all"
                                                            >
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="text-xs font-bold text-white truncate">{ex.name}</span>
                                                                        <span className={`text-[8px] font-mono uppercase font-black px-1.5 py-0.5 rounded border ${badge.style}`}>
                                                                            {badge.label}
                                                                        </span>
                                                                        {ex.jointImpact === 'high' && (
                                                                            <span className="text-[8px] font-bold text-amber-400 bg-amber-400/10 px-1 py-0.2 rounded border border-amber-400/20 flex items-center gap-0.5">
                                                                                <AlertTriangle size={8} /> Heavy Axial
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <span className="text-[9px] text-gray-500 font-semibold">{ex.category}</span>
                                                                        <span className="text-gray-700 text-[8px]">•</span>
                                                                        <span className="text-[9px] text-gray-400 truncate">
                                                                            {ex.primaryMuscles.join(', ')}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    data-testid={`add-ex-${ex.id}`}
                                                                    onClick={() => addExerciseFromDef(ex)}
                                                                    className={`px-3 py-1.5 rounded-lg text-xs font-black shrink-0 transition-all flex items-center gap-1 ${isJustAdded
                                                                        ? 'bg-lime text-oled shadow-[0_0_12px_rgba(50,255,50,0.4)]'
                                                                        : 'bg-lime/10 text-lime border border-lime/30 hover:bg-lime hover:text-oled'
                                                                        }`}
                                                                >
                                                                    {isJustAdded ? (
                                                                        <>
                                                                            <Check size={12} /> Added
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Plus size={12} /> Add
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>

                                            {/* Done button */}
                                            <div className="pt-3 border-t border-gray-800 shrink-0">
                                                <button
                                                    data-testid="done-adding-exercises"
                                                    onClick={() => setShowExercisePicker(false)}
                                                    className="w-full py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs font-extrabold hover:bg-gray-800 transition"
                                                >
                                                    Done Adding ({planExercises.length} in Plan)
                                                </button>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}
                            </AnimatePresence>

                            {isTrainer && (
                                <div className="p-5 bg-gray-900 border-2 border-dashed border-gray-800 rounded-3xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xs font-black text-white italic uppercase">Monetize this Plan</h4>
                                            <p className="text-[10px] text-gray-500 font-medium">List on the Empire Marketplace</p>
                                        </div>
                                        <button
                                            onClick={() => setIsPremium(!isPremium)}
                                            className={`w-12 h-6 rounded-full transition-all relative ${isPremium ? 'bg-lime' : 'bg-gray-800'}`}
                                        >
                                            <motion.div
                                                animate={{ x: isPremium ? 24 : 4 }}
                                                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                                            />
                                        </button>
                                    </div>

                                    {isPremium && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-4 pt-2"
                                        >
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest block mb-2">Price ($ USD)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-bold">$</span>
                                                        <input
                                                            type="text"
                                                            value={price}
                                                            onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                                                            className="w-full bg-oled border border-gray-800 text-white rounded-xl py-3 pl-8 pr-4 text-sm focus:outline-none focus:border-lime font-bold"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest block mb-2">Your Share (80%)</label>
                                                    <div className="w-full bg-lime/10 border border-lime/20 text-lime rounded-xl py-3 px-4 text-sm font-black italic">
                                                        ${(parseFloat(price || '0') * 0.8).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-[9px] text-gray-600 font-medium leading-relaxed">
                                                * IronMatch takes a 20% commission to handle hosting, distribution, and Google Play compliance.
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={handleSave}
                                disabled={!planName.trim() || planExercises.length === 0}
                                className="w-full py-4 rounded-xl bg-lime text-oled font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-lime/90 active:scale-[0.98] transition-all disabled:opacity-30 shadow-[0_0_30px_-5px_rgba(50,255,50,0.3)]"
                            >
                                <Dumbbell size={18} /> Save {isPremium ? 'Premium' : ''} Workout Plan
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default WorkoutPlanCreator;
