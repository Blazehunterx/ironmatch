import { safeStorage } from './safeStorage';
import { FoodItem, FOOD_DATABASE } from '../constants/foodDatabase';

export interface LoggedMeal {
    id: string;
    foodId: string;
    name: string;
    categoryLabel: string;
    servings: number;
    grams: number;
    protein: number;
    calories: number;
    carbs: number;
    fat: number;
    timestamp: string; // ISO date string
}

export interface DailyNutritionTarget {
    proteinGoal: number;   // grams (default: 150)
    calorieGoal: number;   // kcal (default: 2400)
    carbGoal?: number;     // grams
    fatGoal?: number;      // grams
}

const STORAGE_KEY_LOGS = 'ironmatch_nutrition_logs_v2';
const STORAGE_KEY_CUSTOM = 'ironmatch_custom_foods_v2';
const STORAGE_KEY_TARGETS = 'ironmatch_nutrition_targets_v2';

export const DEFAULT_TARGETS: DailyNutritionTarget = {
    proteinGoal: 150,
    calorieGoal: 2400,
    carbGoal: 250,
    fatGoal: 70
};

export function getNutritionTargets(): DailyNutritionTarget {
    try {
        const raw = safeStorage.getItem(STORAGE_KEY_TARGETS);
        return raw ? { ...DEFAULT_TARGETS, ...JSON.parse(raw) } : DEFAULT_TARGETS;
    } catch {
        return DEFAULT_TARGETS;
    }
}

export function saveNutritionTargets(targets: DailyNutritionTarget) {
    safeStorage.setItem(STORAGE_KEY_TARGETS, JSON.stringify(targets));
}

export function getCustomFoods(): FoodItem[] {
    try {
        const raw = safeStorage.getItem(STORAGE_KEY_CUSTOM);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveCustomFood(food: Omit<FoodItem, 'id'>): FoodItem {
    const list = getCustomFoods();
    const newFood: FoodItem = {
        ...food,
        id: `custom-food-${Date.now()}`
    };
    list.unshift(newFood);
    safeStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(list));
    return newFood;
}

export function getAllFoods(): FoodItem[] {
    const custom = getCustomFoods();
    return [...custom, ...FOOD_DATABASE];
}

export function getAllLoggedMeals(): LoggedMeal[] {
    try {
        const raw = safeStorage.getItem(STORAGE_KEY_LOGS);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function logMeal(
    food: FoodItem,
    servings: number,
    customGrams?: number
): LoggedMeal {
    const logs = getAllLoggedMeals();
    const grams = customGrams ?? Math.round(food.servingGrams * servings);
    const multiplier = grams / food.servingGrams;

    const newMeal: LoggedMeal = {
        id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        foodId: food.id,
        name: food.name,
        categoryLabel: food.categoryLabel,
        servings: Number(servings.toFixed(2)),
        grams: Math.round(grams),
        protein: Math.round(food.protein * multiplier * 10) / 10,
        calories: Math.round(food.calories * multiplier),
        carbs: Math.round((food.carbs || 0) * multiplier * 10) / 10,
        fat: Math.round((food.fat || 0) * multiplier * 10) / 10,
        timestamp: new Date().toISOString()
    };

    logs.unshift(newMeal);
    safeStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    return newMeal;
}

export function deleteLoggedMeal(id: string) {
    const logs = getAllLoggedMeals().filter(m => m.id !== id);
    safeStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
}

export function getTodayMeals(): LoggedMeal[] {
    const logs = getAllLoggedMeals();
    const todayStr = new Date().toDateString();
    return logs.filter(m => new Date(m.timestamp).toDateString() === todayStr);
}

export function getTodayTotals() {
    const meals = getTodayMeals();
    return meals.reduce(
        (acc, m) => ({
            protein: acc.protein + m.protein,
            calories: acc.calories + m.calories,
            carbs: acc.carbs + m.carbs,
            fat: acc.fat + m.fat
        }),
        { protein: 0, calories: 0, carbs: 0, fat: 0 }
    );
}

export interface DaySummary {
    date: string;
    dayLabel: string;
    protein: number;
    calories: number;
}

export function getPast7DaysHistory(): DaySummary[] {
    const logs = getAllLoggedMeals();
    const days: DaySummary[] = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 864e5);
        const dateStr = d.toDateString();
        const dayLabel = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
        const dayMeals = logs.filter(m => new Date(m.timestamp).toDateString() === dateStr);

        const protein = dayMeals.reduce((sum, m) => sum + m.protein, 0);
        const calories = dayMeals.reduce((sum, m) => sum + m.calories, 0);

        days.push({
            date: dateStr,
            dayLabel,
            protein: Math.round(protein),
            calories: Math.round(calories)
        });
    }

    return days;
}
