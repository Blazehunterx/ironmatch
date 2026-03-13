import { Plus, Users } from 'lucide-react';

interface WorkoutsHeaderProps {
    onJoinSession: () => void;
    onCreatePlan: () => void;
}

export default function WorkoutsHeader({ onJoinSession, onCreatePlan }: WorkoutsHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-white">Workouts</h2>
            <div className="flex items-center gap-2">
                <button
                    onClick={onJoinSession}
                    className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-lime hover:bg-gray-800 active:scale-95 transition-all"
                >
                    <Users size={20} />
                </button>
                <button
                    onClick={onCreatePlan}
                    className="p-2.5 rounded-xl bg-lime text-oled hover:bg-lime/90 active:scale-95 transition-all"
                >
                    <Plus size={20} />
                </button>
            </div>
        </div>
    );
}
