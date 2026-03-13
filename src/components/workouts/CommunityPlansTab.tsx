import { GraduationCap } from 'lucide-react';
import { WorkoutPlan } from '../../types/database';
import CommunityPlanCard from './CommunityPlanCard';

interface CommunityPlan extends WorkoutPlan {
    profiles?: {
        name: string;
        profile_image_url: string;
    };
}

interface CommunityPlansTabProps {
    loading: boolean;
    communityPlans: CommunityPlan[];
    onAdd: (template: WorkoutPlan) => void;
}

export default function CommunityPlansTab({ loading, communityPlans, onAdd }: CommunityPlansTabProps) {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 border-2 border-lime/30 border-t-lime rounded-full animate-spin" />
                <p className="text-xs text-gray-500">Scanning for trainer expertise...</p>
            </div>
        );
    }

    if (communityPlans.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-gray-500 py-20 gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
                    <GraduationCap size={24} className="text-gray-600" />
                </div>
                <p className="text-center font-medium">No shared plans found.</p>
                <p className="text-xs text-center px-8">Follow verified trainers to see their shared workout routines here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {communityPlans.map((plan, idx) => (
                <CommunityPlanCard
                    key={plan.id}
                    plan={plan}
                    index={idx}
                    onAdd={onAdd}
                />
            ))}
        </div>
    );
}
