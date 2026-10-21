import { Plus, Users, Dumbbell, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RankPill } from '../profile/RankBadge';

interface WorkoutsHeaderProps {
    onJoinSession: () => void;
    onCreatePlan: () => void;
    onOpenPlateLoader?: () => void;
    totalKg?: number;
    isPro?: boolean;
}

export default function WorkoutsHeader({
    onJoinSession,
    onCreatePlan,
    onOpenPlateLoader,
    totalKg = 380,
    isPro = false
}: WorkoutsHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-white tracking-tight">Train</h2>
                <RankPill totalKg={totalKg} isPro={isPro} />
            </div>
            <div className="flex items-center gap-2">
                <Link
                    to="/nutrition"
                    title="Macro & Fuel Tracker"
                    className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-orange-400 hover:text-orange-300 hover:border-orange-500/40 active:scale-95 transition-all"
                >
                    <Utensils size={18} />
                </Link>
                {onOpenPlateLoader && (
                    <button
                        onClick={onOpenPlateLoader}
                        title="Olympic Barbell Plate Loader"
                        className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-lime hover:border-lime/40 active:scale-95 transition-all"
                    >
                        <Dumbbell size={18} />
                    </button>
                )}
                <button
                    onClick={onJoinSession}
                    title="Live Group Sessions"
                    className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-lime hover:bg-gray-800 active:scale-95 transition-all"
                >
                    <Users size={18} />
                </button>
                <button
                    onClick={onCreatePlan}
                    title="Create Workout Plan"
                    className="p-2.5 rounded-xl bg-lime text-oled hover:bg-lime/90 active:scale-95 transition-all font-black"
                >
                    <Plus size={18} />
                </button>
            </div>
        </div>
    );
}
