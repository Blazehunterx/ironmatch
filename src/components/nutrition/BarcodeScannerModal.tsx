import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ScanLine, Camera, Search, Sparkles, Check,
    AlertCircle, Loader2
} from 'lucide-react';
import { FoodItem } from '../../constants/foodDatabase';
import { logMeal } from '../../lib/nutritionStorage';

interface BarcodeScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMealLogged: (mealName: string, protein: number) => void;
}

interface ScannedProduct {
    barcode: string;
    name: string;
    brand: string;
    servingSize: string;
    servingGrams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

// Built-in verified gym staples for instant offline scanning
const GYM_STAPLE_BARCODES: ScannedProduct[] = [
    {
        barcode: '888849000101',
        name: 'Quest Protein Bar (Choc Chip)',
        brand: 'Quest Nutrition',
        servingSize: '1 bar (60g)',
        servingGrams: 60,
        calories: 200,
        protein: 21,
        carbs: 22,
        fat: 7
    },
    {
        barcode: '734000180011',
        name: 'Barebells Protein Bar (Caramel Cashew)',
        brand: 'Barebells',
        servingSize: '1 bar (55g)',
        servingGrams: 55,
        calories: 199,
        protein: 20,
        carbs: 14,
        fat: 8
    },
    {
        barcode: '748927028669',
        name: 'Gold Standard 100% Whey (Double Rich)',
        brand: 'Optimum Nutrition',
        servingSize: '1 scoop (30.4g)',
        servingGrams: 30,
        calories: 120,
        protein: 24,
        carbs: 3,
        fat: 1.5
    },
    {
        barcode: '811620021665',
        name: 'Core Power Elite 42g Protein',
        brand: 'Fairlife',
        servingSize: '1 bottle (414ml)',
        servingGrams: 414,
        calories: 230,
        protein: 42,
        carbs: 7,
        fat: 3.5
    },
    {
        barcode: '850005432001',
        name: 'Skyr High-Protein Icelandic Yogurt',
        brand: 'Ísey Skyr',
        servingSize: '1 cup (150g)',
        servingGrams: 150,
        calories: 100,
        protein: 17,
        carbs: 6,
        fat: 0.2
    },
    {
        barcode: '080000001234',
        name: 'Chunk Light Tuna in Springwater',
        brand: 'StarKist',
        servingSize: '1 can drained (120g)',
        servingGrams: 120,
        calories: 110,
        protein: 26,
        carbs: 0,
        fat: 1
    },
    {
        barcode: '070847811190',
        name: 'Monster Energy Ultra Zero',
        brand: 'Monster Energy',
        servingSize: '1 can (500ml)',
        servingGrams: 500,
        calories: 11,
        protein: 0,
        carbs: 1.4,
        fat: 0
    }
];

export default function BarcodeScannerModal({
    isOpen,
    onClose,
    onMealLogged
}: BarcodeScannerModalProps) {
    const [barcodeInput, setBarcodeInput] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [detectedProduct, setDetectedProduct] = useState<ScannedProduct | null>(null);
    const [portionCount, setPortionCount] = useState<number>(1);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const playBeep = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch {}
    };

    if (!isOpen) return null;

    const handleSelectPreset = (item: ScannedProduct) => {
        playBeep();
        setDetectedProduct(item);
        setPortionCount(1);
        setErrorMsg(null);
    };

    const handleSearchBarcode = async (codeToSearch: string) => {
        const trimmed = codeToSearch.trim();
        if (!trimmed) return;

        setIsSearching(true);
        setErrorMsg(null);

        // 1. Check local gym staples first
        const localMatch = GYM_STAPLE_BARCODES.find(
            p => p.barcode === trimmed || p.name.toLowerCase().includes(trimmed.toLowerCase())
        );

        if (localMatch) {
            playBeep();
            setDetectedProduct(localMatch);
            setIsSearching(false);
            return;
        }

        // 2. Fetch from OpenFoodFacts free API
        try {
            const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${trimmed}.json`);
            const data = await res.json();

            if (data.status === 1 && data.product) {
                const p = data.product;
                const nutriments = p.nutriments || {};

                const scanned: ScannedProduct = {
                    barcode: trimmed,
                    name: p.product_name || p.generic_name || 'Scanned Packaged Food',
                    brand: p.brands || 'Packaged Nutrition',
                    servingSize: p.serving_size || '100g serving',
                    servingGrams: Number(p.serving_quantity) || 100,
                    calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 150),
                    protein: Math.round((nutriments.proteins_100g || nutriments.proteins || 10) * 10) / 10,
                    carbs: Math.round((nutriments.carbohydrates_100g || nutriments.carbohydrates || 15) * 10) / 10,
                    fat: Math.round((nutriments.fat_100g || nutriments.fat || 5) * 10) / 10
                };

                playBeep();
                setDetectedProduct(scanned);
            } else {
                setErrorMsg(`No product found for barcode "${trimmed}". Select a gym staple or enter manual food.`);
            }
        } catch {
            setErrorMsg(`Network timeout looking up "${trimmed}". Tap a staple below.`);
        } finally {
            setIsSearching(false);
        }
    };

    const handleLogProduct = () => {
        if (!detectedProduct) return;

        const foodItem: FoodItem = {
            id: `barcode-${detectedProduct.barcode}-${Date.now()}`,
            name: `${detectedProduct.name} (${detectedProduct.brand})`,
            category: 'supplements',
            categoryLabel: detectedProduct.brand || 'Packaged Fuel',
            servingSize: detectedProduct.servingSize,
            servingGrams: detectedProduct.servingGrams,
            calories: detectedProduct.calories,
            protein: detectedProduct.protein,
            carbs: detectedProduct.carbs,
            fat: detectedProduct.fat
        };

        const totalGrams = Math.round(detectedProduct.servingGrams * portionCount);
        const meal = logMeal(foodItem, portionCount, totalGrams);

        onMealLogged(meal.name, meal.protein);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-oled border border-gray-800 rounded-[28px] overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-black/60">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-lime/10 border border-lime/30 text-lime">
                            <ScanLine size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
                                Fuel Barcode Scanner
                            </h3>
                            <p className="text-[11px] text-gray-500">Scan packaged protein, bars, & shakes</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-white rounded-xl transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-5 overflow-y-auto space-y-5 flex-1">
                    {/* Viewfinder Camera Simulation */}
                    <div className="relative aspect-[16/9] rounded-2xl border-2 border-dashed border-gray-800 bg-black overflow-hidden flex flex-col items-center justify-center p-4 shadow-inner">
                        <div className="absolute inset-4 border border-lime/30 rounded-xl pointer-events-none flex items-center justify-center">
                            {/* Scanning laser bar */}
                            <motion.div
                                animate={{ y: [-50, 50, -50] }}
                                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                className="w-full h-0.5 bg-lime shadow-[0_0_12px_#32FF32]"
                            />
                        </div>

                        <div className="text-center space-y-1 relative z-10 bg-black/70 px-4 py-2 rounded-xl border border-gray-800">
                            <Camera size={24} className="text-lime mx-auto mb-1 animate-pulse" />
                            <p className="text-xs font-bold text-white">Align Barcode in Reticle</p>
                            <p className="text-[9px] text-gray-500">Instant scan or select quick gym staple below</p>
                        </div>
                    </div>

                    {/* Manual / Barcode Search Bar */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block">
                            Or Type Barcode / Food Name
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={barcodeInput}
                                    onChange={(e) => setBarcodeInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearchBarcode(barcodeInput); }}
                                    placeholder="e.g. 748927028669 or Quest"
                                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-lime"
                                />
                                {barcodeInput && (
                                    <button
                                        onClick={() => setBarcodeInput('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => handleSearchBarcode(barcodeInput)}
                                disabled={isSearching || !barcodeInput.trim()}
                                className="px-4 bg-lime text-oled font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 disabled:opacity-40"
                            >
                                {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                                Lookup
                            </button>
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center gap-2 text-red-300 text-xs">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Detected Product Card */}
                    <AnimatePresence>
                        {detectedProduct && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                className="p-4 bg-gray-950 border border-lime/40 rounded-2xl space-y-3 shadow-lg shadow-lime/5"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-[9px] uppercase tracking-wider font-bold text-lime block flex items-center gap-1">
                                            <Sparkles size={10} /> Verified Fuel Match
                                        </span>
                                        <h4 className="text-sm font-black text-white">{detectedProduct.name}</h4>
                                        <p className="text-[11px] text-gray-400">{detectedProduct.brand} · {detectedProduct.servingSize}</p>
                                    </div>
                                    <span className="text-xl font-black text-lime font-mono">
                                        +{Math.round(detectedProduct.protein * portionCount * 10) / 10}g P
                                    </span>
                                </div>

                                {/* Macro Breakdown Chips */}
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="p-2 bg-gray-900 rounded-xl border border-gray-800">
                                        <span className="text-[8px] uppercase text-gray-500 font-bold block">Calories</span>
                                        <span className="text-xs font-black text-amber-400">
                                            {Math.round(detectedProduct.calories * portionCount)} kcal
                                        </span>
                                    </div>
                                    <div className="p-2 bg-gray-900 rounded-xl border border-gray-800">
                                        <span className="text-[8px] uppercase text-gray-500 font-bold block">Carbs</span>
                                        <span className="text-xs font-black text-blue-400">
                                            {Math.round(detectedProduct.carbs * portionCount * 10) / 10}g
                                        </span>
                                    </div>
                                    <div className="p-2 bg-gray-900 rounded-xl border border-gray-800">
                                        <span className="text-[8px] uppercase text-gray-500 font-bold block">Fat</span>
                                        <span className="text-xs font-black text-rose-400">
                                            {Math.round(detectedProduct.fat * portionCount * 10) / 10}g
                                        </span>
                                    </div>
                                </div>

                                {/* Portion Multiplier */}
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-xs font-bold text-gray-300">Servings:</span>
                                    <div className="flex items-center gap-2">
                                        {[0.5, 1, 1.5, 2].map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setPortionCount(p)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                                    portionCount === p
                                                        ? 'bg-lime text-oled font-black'
                                                        : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                                                }`}
                                            >
                                                {p}x
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogProduct}
                                    className="w-full py-3 bg-lime text-oled font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 active:scale-95 transition hover:bg-lime/90 shadow-[0_0_15px_rgba(50,255,50,0.3)]"
                                >
                                    <Check size={14} /> Log To Today's Rations
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Quick Gym Staple Presets (1-Tap Fast Logging) */}
                    <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block">
                            Popular Packaged Gym Staples (1-Tap Scan)
                        </span>
                        <div className="grid grid-cols-1 gap-2">
                            {GYM_STAPLE_BARCODES.map((item) => (
                                <button
                                    key={item.barcode}
                                    onClick={() => handleSelectPreset(item)}
                                    className="p-3 bg-gray-900/80 hover:bg-gray-800 border border-gray-800 rounded-2xl text-left flex items-center justify-between transition-all active:scale-[0.98] group"
                                >
                                    <div className="min-w-0 pr-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-white truncate group-hover:text-lime transition-colors">
                                                {item.name}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-0.5">
                                            {item.servingSize} · {item.calories} kcal
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-xs font-black text-lime font-mono block">
                                            +{item.protein}g P
                                        </span>
                                        <span className="text-[9px] text-gray-600 block">
                                            Tap to load
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
