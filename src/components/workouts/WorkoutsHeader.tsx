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
                    className="p-2.5 rounded-xl bg-[#0D0D0D] border border-white/10 text-orange-400 hover:text-orange-300 hover:border-orange-500/40 active:scale-95 transition-all shadow-sm"
                >
                    <Utensils size={17} />
                </Link>
                {onOpenPlateLoader && (
                    <button
                        onClick={onOpenPlateLoader}
                        title="Olympic Barbell Plate Loader"
                        className="p-2.5 rounded-xl bg-[#0D0D0D] border border-white/10 text-gray-300 hover:text-lime hover:border-lime/40 active:scale-95 transition-all shadow-sm"
                    >
                        <Dumbbell size={17} />
                    </button>
                )}
                <button
                    onClick={onJoinSession}
                    title="Live Group Sessions"
                    className="p-2.5 rounded-xl bg-[#0D0D0D] border border-white/10 text-lime hover:border-lime/40 active:scale-95 transition-all shadow-sm"
                >
                    <Users size={17} />
                </button>
                <button
                    onClick={onCreatePlan}
                    title="Create Workout Plan"
                    className="p-2.5 rounded-xl bg-lime text-black hover:bg-lime/90 active:scale-95 transition-all font-black shadow-[0_0_12px_rgba(50,255,50,0.3)]"
                >
                    <Plus size={17} />
                </button>
            </div>
        </div>
    );
}
