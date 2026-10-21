import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Utensils } from 'lucide-react';
import { FoodItem } from '../../constants/foodDatabase';
import { saveCustomFood } from '../../lib/nutritionStorage';

interface AddCustomFoodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdded: (food: FoodItem) => void;
}

export default function AddCustomFoodModal({ isOpen, onClose, onAdded }: AddCustomFoodModalProps) {
    const [name, setName] = useState('');
    const [servingSize, setServingSize] = useState('100g');
    const [servingGrams, setServingGrams] = useState<number>(100);
    const [protein, setProtein] = useState<string>('');
    const [calories, setCalories] = useState<string>('');
    const [carbs, setCarbs] = useState<string>('');
    const [fat, setFat] = useState<string>('');
    const [isBali, setIsBali] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !protein) return;

        const p = parseFloat(protein) || 0;
        const cal = parseFloat(calories) || Math.round(p * 4 + (parseFloat(carbs) || 0) * 4 + (parseFloat(fat) || 0) * 9);

        const newFood = saveCustomFood({
            name: name.trim(),
            category: isBali ? 'bali_warung' : 'protein',
            categoryLabel: isBali ? 'Bali Warung' : 'Custom',
            servingSize: servingSize.trim() || `${servingGrams}g`,
            servingGrams: servingGrams > 0 ? servingGrams : 100,
            protein: p,
            calories: cal,
            carbs: parseFloat(carbs) || 0,
            fat: parseFloat(fat) || 0,
            isBaliStaple: isBali
        });

        onAdded(newFood);
        onClose();
        setName('');
        setProtein('');
        setCalories('');
        setCarbs('');
        setFat('');
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md bg-gray-950 border border-gray-800 rounded-2xl p-6 shadow-2xl relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-lime/10 text-lime rounded-xl border border-lime/30">
                            <Utensils size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white">Add Custom Food</h3>
                            <p className="text-xs text-gray-400">Save your favorite dish to your permanent database</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-400 block mb-1">Food Name *</label>
                            <input
                                type="text"
                                placeholder="e.g. Nasi Ayam Sambal Matah, Whey Shake..."
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-lime"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-400 block mb-1">Serving Label</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 1 portion, 1 scoop"
                                    value={servingSize}
                                    onChange={e => setServingSize(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-lime"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-400 block mb-1">Weight in Grams</label>
                                <input
                                    type="number"
                                    value={servingGrams}
                                    onChange={e => setServingGrams(Number(e.target.value))}
                                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-lime"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-lime block mb-1">Protein (g) *</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="e.g. 32"
                                    value={protein}
                                    onChange={e => setProtein(e.target.value)}
                                    required
                                    className="w-full bg-gray-900 border border-lime/40 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-lime"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-400 block mb-1">Calories (kcal)</label>
                                <input
                                    type="number"
                                    placeholder="Auto-estimated if blank"
                                    value={calories}
                                    onChange={e => setCalories(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-lime"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-400 block mb-1">Carbs (g)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="Optional"
                                    value={carbs}
                                    onChange={e => setCarbs(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-lime"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-400 block mb-1">Fat (g)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="Optional"
                                    value={fat}
                                    onChange={e => setFat(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-lime"
                                />
                            </div>
                        </div>

                        <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer pt-1">
                            <input
                                type="checkbox"
                                checked={isBali}
                                onChange={e => setIsBali(e.target.checked)}
                                className="rounded text-lime focus:ring-lime"
                            />
                            <span>🇮🇩 Bali Local Warung dish</span>
                        </label>

                        <button
                            type="submit"
                            className="w-full py-3 bg-lime text-oled font-black rounded-xl hover:bg-lime/90 transition-all flex items-center justify-center gap-2 mt-2"
                        >
                            <Plus size={18} />
                            Save Food to Database
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
