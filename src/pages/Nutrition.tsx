import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, Trash2, Utensils, Flame,
    Check, BarChart2, Edit3, X, Share2, ScanLine, ChevronLeft
} from 'lucide-react';
import { FoodItem } from '../constants/foodDatabase';
import {
    getAllFoods, getTodayMeals, logMeal,
    deleteLoggedMeal, getNutritionTargets, saveNutritionTargets,
    getPast7DaysHistory, LoggedMeal, DailyNutritionTarget
} from '../lib/nutritionStorage';
import AddCustomFoodModal from '../components/nutrition/AddCustomFoodModal';
import BarcodeScannerModal from '../components/nutrition/BarcodeScannerModal';
import { useToast } from '../context/ToastContext';

type CategoryFilter = 'all' | 'bali_warung' | 'protein' | 'seafood' | 'dairy_eggs' | 'plant_vegan' | 'carbs' | 'fats' | 'supplements';

const CATEGORIES: { id: CategoryFilter; label: string; icon: string }[] = [
    { id: 'all', label: 'All Foods', icon: '🍽️' },
    { id: 'bali_warung', label: 'Whole Meal Bowls', icon: '🍱' },
    { id: 'protein', label: 'Meat & Poultry', icon: '🍗' },
    { id: 'seafood', label: 'Seafood', icon: '🐟' },
    { id: 'dairy_eggs', label: 'Dairy & Eggs', icon: '🥛' },
    { id: 'plant_vegan', label: 'Plant & Vegan', icon: '🌱' },
    { id: 'carbs', label: 'Carbs & Grains', icon: '🍚' },
    { id: 'fats', label: 'Healthy Fats', icon: '🥑' },
    { id: 'supplements', label: 'Supplements', icon: '⚡' },
];

export default function Nutrition() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
    const [todayMeals, setTodayMeals] = useState<LoggedMeal[]>([]);
    const [targets, setTargets] = useState<DailyNutritionTarget>(getNutritionTargets());
    const [isEditingTargets, setIsEditingTargets] = useState(false);
    const [tempProteinTarget, setTempProteinTarget] = useState(targets.proteinGoal.toString());
    const [tempCalorieTarget, setTempCalorieTarget] = useState(targets.calorieGoal.toString());
    const [showAddCustomModal, setShowAddCustomModal] = useState(false);
    const [showBarcodeModal, setShowBarcodeModal] = useState(false);
    const [selectedFoodForPortion, setSelectedFoodForPortion] = useState<FoodItem | null>(null);
    const [portionMultiplier, setPortionMultiplier] = useState<number>(1);
    const [customGramsInput, setCustomGramsInput] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'tracker' | 'history'>('tracker');

    const refreshData = useCallback(() => {
        setTodayMeals(getTodayMeals());
        setTargets(getNutritionTargets());
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const allFoods = useMemo(() => getAllFoods(), [showAddCustomModal]);

    const filteredFoods = useMemo(() => {
        return allFoods.filter(food => {
            const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
            const matchesQuery = !searchQuery.trim() ||
                food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                food.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesQuery;
        });
    }, [allFoods, selectedCategory, searchQuery]);

    const totals = useMemo(() => {
        return todayMeals.reduce(
            (acc, m) => ({
                protein: acc.protein + m.protein,
                calories: acc.calories + m.calories,
                carbs: acc.carbs + m.carbs,
                fat: acc.fat + m.fat
            }),
            { protein: 0, calories: 0, carbs: 0, fat: 0 }
        );
    }, [todayMeals]);

    const proteinPct = Math.min(100, Math.round((totals.protein / targets.proteinGoal) * 100));
    const caloriePct = Math.min(100, Math.round((totals.calories / targets.calorieGoal) * 100));

    const handleQuickAdd = (food: FoodItem, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const meal = logMeal(food, 1);
        refreshData();
        showToast(`+${meal.protein}g protein: ${food.name}`, 'success');
    };

    const handleConfirmPortionAdd = () => {
        if (!selectedFoodForPortion) return;
        const grams = customGramsInput ? parseFloat(customGramsInput) : undefined;
        const meal = logMeal(selectedFoodForPortion, portionMultiplier, grams);
        refreshData();
        showToast(`Logged ${meal.name} (+${meal.protein}g P, ${meal.calories} kcal)`, 'success');
        setSelectedFoodForPortion(null);
        setCustomGramsInput('');
        setPortionMultiplier(1);
    };

    const handleDeleteMeal = (id: string, name: string) => {
        deleteLoggedMeal(id);
        refreshData();
        showToast(`Removed ${name}`, 'info');
    };

    const handleSaveTargets = () => {
        const p = parseInt(tempProteinTarget) || 150;
        const c = parseInt(tempCalorieTarget) || 2400;
        const newTargets = { ...targets, proteinGoal: p, calorieGoal: c };
        saveNutritionTargets(newTargets);
        setTargets(newTargets);
        setIsEditingTargets(false);
        showToast('Daily targets updated!', 'success');
    };

    const history7Days = useMemo(() => getPast7DaysHistory(), [todayMeals]);

    return (
        <div className="p-4 space-y-6 pb-24 max-w-md mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <button 
                        onClick={() => navigate('/workouts')}
                        className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white active:scale-95 transition-all"
                        title="Back to Train"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                            <span className="text-lime">RATIONS</span> & FUEL
                        </h1>
                        <p className="text-[10px] text-gray-400">Food database & macros</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowBarcodeModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-lime text-oled rounded-xl text-xs font-black uppercase tracking-wider hover:bg-lime/90 transition-all shadow-[0_0_12px_rgba(50,255,50,0.3)] active:scale-95 shrink-0"
                    >
                        <ScanLine size={13} /> Scan Barcode
                    </button>
                    <button
                        onClick={() => setShowAddCustomModal(true)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-900 border border-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all shrink-0"
                    >
                        <Plus size={13} /> Custom
                    </button>
                </div>
            </div>

            {/* Daily Dashboard Summary Card */}
            <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-lime/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                        <Flame size={14} className="text-lime" /> Daily Fuel Status
                    </span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                const text = `🥗 IronMatch Fuel Check: Logged ${Math.round(totals.protein)}g protein (${proteinPct}%) and ${Math.round(totals.calories)} kcal today! #IronMatch`;
                                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            className="text-xs text-lime/80 hover:text-lime flex items-center gap-1 font-bold"
                        >
                            <Share2 size={12} /> Share Fuel
                        </button>
                        <button
                            onClick={() => setIsEditingTargets(!isEditingTargets)}
                            className="text-xs text-gray-400 hover:text-lime flex items-center gap-1"
                        >
                            <Edit3 size={12} /> {isEditingTargets ? 'Cancel' : 'Edit Targets'}
                        </button>
                    </div>
                </div>

                {isEditingTargets ? (
                    <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl space-y-3 mb-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-gray-400 block mb-1">Target Protein (g)</label>
                                <input
                                    type="number"
                                    value={tempProteinTarget}
                                    onChange={e => setTempProteinTarget(e.target.value)}
                                    className="w-full bg-black border border-lime/40 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 block mb-1">Target Calories (kcal)</label>
                                <input
                                    type="number"
                                    value={tempCalorieTarget}
                                    onChange={e => setTempCalorieTarget(e.target.value)}
                                    className="w-full bg-black border border-gray-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleSaveTargets}
                            className="w-full py-2 bg-lime text-oled text-xs font-black rounded-lg hover:bg-lime/90"
                        >
                            Save Targets
                        </button>
                    </div>
                ) : null}

                {/* Protein Bar */}
                <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-lime" /> Protein
                        </span>
                        <div className="font-mono text-right">
                            <span className="text-lg font-black text-lime">{Math.round(totals.protein)}g</span>
                            <span className="text-xs text-gray-400"> / {targets.proteinGoal}g ({proteinPct}%)</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-900 h-2.5 rounded-full overflow-hidden border border-gray-800">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${proteinPct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="h-full bg-lime shadow-[0_0_12px_#32FF32]"
                        />
                    </div>
                    <div className="text-[11px] text-gray-400 text-right">
                        {totals.protein >= targets.proteinGoal
                            ? '🎯 Protein target completed!'
                            : `${Math.round(targets.proteinGoal - totals.protein)}g remaining today`}
                    </div>
                </div>

                {/* Calories Bar */}
                <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400" /> Calories
                        </span>
                        <div className="font-mono text-right">
                            <span className="text-sm font-bold text-white">{Math.round(totals.calories)}</span>
                            <span className="text-xs text-gray-400"> / {targets.calorieGoal} kcal ({caloriePct}%)</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden border border-gray-800">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${caloriePct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="h-full bg-amber-400"
                        />
                    </div>
                </div>

                {/* Macro Split Pills */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-900 text-center font-mono text-xs">
                    <div className="p-2 bg-gray-900/60 rounded-xl border border-gray-800/60">
                        <span className="text-[10px] text-gray-400 block">PROTEIN</span>
                        <span className="font-black text-lime">{Math.round(totals.protein)}g</span>
                    </div>
                    <div className="p-2 bg-gray-900/60 rounded-xl border border-gray-800/60">
                        <span className="text-[10px] text-gray-400 block">CARBS</span>
                        <span className="font-black text-blue-400">{Math.round(totals.carbs)}g</span>
                    </div>
                    <div className="p-2 bg-gray-900/60 rounded-xl border border-gray-800/60">
                        <span className="text-[10px] text-gray-400 block">FATS</span>
                        <span className="font-black text-amber-400">{Math.round(totals.fat)}g</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs between Database and Today's Log */}
            <div className="flex rounded-xl bg-gray-900 p-1 border border-gray-800">
                <button
                    onClick={() => setActiveTab('tracker')}
                    className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
                        activeTab === 'tracker'
                            ? 'bg-lime text-oled shadow-md'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Food Database & Search ({allFoods.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
                        activeTab === 'history'
                            ? 'bg-lime text-oled shadow-md'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Today's Log ({todayMeals.length}) & 7D
                </button>
            </div>

            {activeTab === 'tracker' ? (
                <>
                    {/* Search Bar */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search 150+ foods (e.g. Ayam, Telur, Whey, Tempe...)"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-10 py-3 text-white text-sm focus:outline-none focus:border-lime placeholder:text-gray-600"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Category Filter Horizontal Scroll */}
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
                        {CATEGORIES.map(cat => {
                            const isSelected = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                                        isSelected
                                            ? 'bg-lime text-oled border-lime'
                                            : 'bg-gray-950 text-gray-400 border-gray-800 hover:border-gray-700'
                                    }`}
                                >
                                    <span>{cat.icon}</span>
                                    <span>{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Food Results List */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                            <span>Found {filteredFoods.length} food options</span>
                            <span className="text-[11px] text-gray-500">Tap + for 1-click add</span>
                        </div>

                        {filteredFoods.length === 0 ? (
                            <div className="p-8 text-center bg-gray-950 border border-gray-800 rounded-2xl">
                                <Utensils size={32} className="mx-auto text-gray-600 mb-2" />
                                <p className="text-sm font-bold text-white mb-1">No matching foods found</p>
                                <p className="text-xs text-gray-400 mb-4">You can easily add this food to your database.</p>
                                <button
                                    onClick={() => setShowAddCustomModal(true)}
                                    className="px-4 py-2 bg-lime text-oled font-black text-xs rounded-xl"
                                >
                                    + Add Custom Food Now
                                </button>
                            </div>
                        ) : (
                            filteredFoods.map(food => (
                                <div
                                    key={food.id}
                                    onClick={() => {
                                        setSelectedFoodForPortion(food);
                                        setPortionMultiplier(1);
                                        setCustomGramsInput(food.servingGrams.toString());
                                    }}
                                    className="p-3 bg-gray-950 border border-gray-800/80 rounded-xl flex items-center justify-between hover:border-lime/40 cursor-pointer transition-all active:scale-[0.99] group"
                                >
                                    <div className="min-w-0 pr-3 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            {food.isBaliStaple && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-lime/10 border border-lime/30 text-lime font-bold shrink-0">
                                                    🍱 Whole Food
                                                </span>
                                            )}
                                            <h4 className="text-sm font-bold text-white truncate group-hover:text-lime transition-colors">
                                                {food.name}
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 font-mono">
                                            <span>{food.servingSize}</span>
                                            <span>•</span>
                                            <span>{food.calories} kcal</span>
                                            {food.carbs > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-blue-400">{food.carbs}g C</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="px-2.5 py-1 bg-lime/10 border border-lime/30 text-lime font-mono font-black text-xs rounded-lg">
                                            +{food.protein}g P
                                        </span>
                                        <button
                                            onClick={(e) => handleQuickAdd(food, e)}
                                            title="1-Tap Add 1 Serving"
                                            className="p-2 bg-gray-900 border border-gray-800 hover:bg-lime hover:text-oled hover:border-lime text-gray-300 rounded-lg transition-all"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : (
                /* Today's Meal Log & 7-Day History */
                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-black uppercase text-gray-400 mb-3 flex items-center gap-2">
                            <Utensils size={14} className="text-lime" /> Logged Today ({todayMeals.length})
                        </h3>

                        {todayMeals.length === 0 ? (
                            <div className="p-8 text-center bg-gray-950 border border-gray-800 rounded-2xl">
                                <p className="text-xs text-gray-400 mb-2">No meals logged yet today.</p>
                                <button
                                    onClick={() => setActiveTab('tracker')}
                                    className="px-4 py-2 bg-lime text-oled font-black text-xs rounded-xl"
                                >
                                    Browse Food Database
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {todayMeals.map(meal => (
                                    <div
                                        key={meal.id}
                                        className="p-3 bg-gray-950 border border-gray-800 rounded-xl flex items-center justify-between"
                                    >
                                        <div className="min-w-0 pr-2">
                                            <p className="text-sm font-bold text-white truncate">{meal.name}</p>
                                            <p className="text-xs text-gray-400 font-mono">
                                                {meal.grams}g ({meal.servings}x) • {meal.calories} kcal • {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="font-mono font-black text-lime text-xs">
                                                +{meal.protein}g P
                                            </span>
                                            <button
                                                onClick={() => handleDeleteMeal(meal.id, meal.name)}
                                                className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 7-Day History Chart */}
                    <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4">
                        <h4 className="text-xs font-black uppercase text-gray-400 mb-4 flex items-center gap-1.5">
                            <BarChart2 size={14} className="text-lime" /> Past 7 Days Protein Streak
                        </h4>
                        <div className="grid grid-cols-7 gap-1.5 items-end h-32 pt-4">
                            {history7Days.map((day, idx) => {
                                const heightPct = Math.min(100, Math.round((day.protein / targets.proteinGoal) * 100));
                                const isGoalMet = day.protein >= targets.proteinGoal;
                                return (
                                    <div key={idx} className="flex flex-col items-center h-full justify-end gap-1">
                                        <span className="text-[10px] font-mono text-gray-400">{day.protein}g</span>
                                        <div className="w-full bg-gray-900 h-20 rounded-md overflow-hidden flex items-end">
                                            <div
                                                style={{ height: `${heightPct}%` }}
                                                className={`w-full rounded-md transition-all ${
                                                    isGoalMet ? 'bg-lime shadow-[0_0_8px_#32FF32]' : day.protein > 0 ? 'bg-lime/50' : 'bg-transparent'
                                                }`}
                                            />
                                        </div>
                                        <span className="text-[9px] font-medium text-gray-400">{day.dayLabel}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Serving & Portion Adjuster */}
            <AnimatePresence>
                {selectedFoodForPortion && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-sm bg-gray-950 border border-gray-800 rounded-2xl p-5 shadow-2xl relative"
                        >
                            <button
                                onClick={() => setSelectedFoodForPortion(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
                            >
                                <X size={20} />
                            </button>

                            <h3 className="text-base font-black text-white mb-1">{selectedFoodForPortion.name}</h3>
                            <p className="text-xs text-gray-400 mb-4">Base serving: {selectedFoodForPortion.servingSize} ({selectedFoodForPortion.servingGrams}g)</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1.5 font-bold">Select Serving Amount</label>
                                    <div className="grid grid-cols-4 gap-2 mb-2">
                                        {[0.5, 1, 1.5, 2].map(mult => (
                                            <button
                                                key={mult}
                                                onClick={() => {
                                                    setPortionMultiplier(mult);
                                                    setCustomGramsInput(Math.round(selectedFoodForPortion.servingGrams * mult).toString());
                                                }}
                                                className={`py-2 text-xs font-mono font-bold rounded-xl border transition-all ${
                                                    portionMultiplier === mult && !customGramsInput
                                                        ? 'bg-lime text-oled border-lime'
                                                        : 'bg-gray-900 text-gray-300 border-gray-800'
                                                }`}
                                            >
                                                {mult}x
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Or Enter Exact Grams</label>
                                    <input
                                        type="number"
                                        placeholder={`${selectedFoodForPortion.servingGrams}g`}
                                        value={customGramsInput}
                                        onChange={e => {
                                            setCustomGramsInput(e.target.value);
                                            const g = parseFloat(e.target.value) || 0;
                                            setPortionMultiplier(g / selectedFoodForPortion.servingGrams);
                                        }}
                                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-lime"
                                    />
                                </div>

                                {/* Calculated preview */}
                                <div className="p-3 bg-gray-900 rounded-xl border border-gray-800 grid grid-cols-3 gap-2 text-center font-mono text-xs">
                                    <div>
                                        <span className="text-[10px] text-gray-400 block">PROTEIN</span>
                                        <span className="font-black text-lime">
                                            {Math.round(selectedFoodForPortion.protein * (portionMultiplier || 1) * 10) / 10}g
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 block">CALORIES</span>
                                        <span className="font-bold text-white">
                                            {Math.round(selectedFoodForPortion.calories * (portionMultiplier || 1))} kcal
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 block">CARBS</span>
                                        <span className="font-bold text-blue-400">
                                            {Math.round(selectedFoodForPortion.carbs * (portionMultiplier || 1))}g
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirmPortionAdd}
                                    className="w-full py-3 bg-lime text-oled font-black rounded-xl hover:bg-lime/90 transition-all flex items-center justify-center gap-2"
                                >
                                    <Check size={18} /> Log Meal
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Food Creation Modal */}
            <AddCustomFoodModal
                isOpen={showAddCustomModal}
                onClose={() => setShowAddCustomModal(false)}
                onAdded={(food) => {
                    showToast(`"${food.name}" added to food database!`, 'success');
                }}
            />

            {/* Packaged Fuel Barcode Scanner Modal */}
            <BarcodeScannerModal
                isOpen={showBarcodeModal}
                onClose={() => setShowBarcodeModal(false)}
                onMealLogged={(name, protein) => {
                    refreshData();
                    showToast(`+${protein}g protein logged: ${name}`, 'success');
                }}
            />
        </div>
    );
}
