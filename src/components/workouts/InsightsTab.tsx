import LiftProgressChart from '../insights/LiftProgressChart';

interface InsightsTabProps {
    userId: string;
}

export default function InsightsTab({ userId }: InsightsTabProps) {
    return (
        <div className="pb-8">
            <LiftProgressChart userId={userId} />
        </div>
    );
}
