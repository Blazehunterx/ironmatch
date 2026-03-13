import { WorkoutLog, WorkoutPlan } from '../../types/database';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2 } from 'lucide-react';

interface HistoryTabProps {
    logs: WorkoutLog[];
    plans: WorkoutPlan[];
}

export default function HistoryTab({ logs, plans }: HistoryTabProps) {
    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-gray-500 py-20 gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
                    <Clock size={24} className="text-gray-600" />
                </div>
                <p className="text-center font-medium">No workout history yet.</p>
                <p className="text-sm">Start a plan to log your first workout!</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {logs.map((log, idx) => {
                const plan = plans.find(p => p.id === log.plan_id);
                const completedCount = log.exercises.filter(e => e.completed).length;
                return (
                    <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-4"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-white text-sm">{plan?.name || 'Workout'}</h4>
                            <span className="text-[10px] text-gray-500">
                                {new Date(log.started_at).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                            <span className="flex items-center gap-1"><Clock size={11} /> {log.duration_min} min</span>
                            <span className="flex items-center gap-1"><CheckCircle2 size={11} className="text-lime" /> {completedCount}/{log.exercises.length}</span>
                            {plan && <span className="text-[10px] bg-lime/10 text-lime px-1.5 py-0.5 rounded">{plan.target}</span>}
                        </div>
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-lime rounded-full transition-all"
                                style={{ width: `${(completedCount / log.exercises.length) * 100}%` }}
                            />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
