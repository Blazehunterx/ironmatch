import { Dumbbell } from 'lucide-react';
import { WorkoutPlan } from '../../types/database';
import WorkoutPlanCard from './WorkoutPlanCard';

interface WorkoutPlansTabProps {
    plans: WorkoutPlan[];
    isTrainer: boolean;
    onStart: (plan: WorkoutPlan) => void;
    onDelete: (id: string) => void;
    onToggleShare: (id: string) => void;
    onCreateFirst: () => void;
}

export default function WorkoutPlansTab({
    plans, isTrainer, onStart, onDelete, onToggleShare, onCreateFirst
}: WorkoutPlansTabProps) {
    if (plans.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-gray-500 py-20 gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
                    <Dumbbell size={24} className="text-gray-600" />
                </div>
                <p className="text-center font-medium">No workout plans yet.</p>
                <button onClick={onCreateFirst} className="text-sm text-lime hover:underline">Create your first plan</button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {plans.map((plan, idx) => (
                <WorkoutPlanCard
                    key={plan.id}
                    plan={plan}
                    index={idx}
                    isTrainer={isTrainer}
                    onStart={onStart}
                    onDelete={onDelete}
                    onToggleShare={onToggleShare}
                />
            ))}
        </div>
    );
}
