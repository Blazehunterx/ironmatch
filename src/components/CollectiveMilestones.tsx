import { motion } from 'framer-motion';
import { Target, Trophy, Users, Zap, Calendar } from 'lucide-react';
import { GymMilestone } from '../types/database';
import { formatDistanceToNow } from 'date-fns';

interface CollectiveMilestonesProps {
    milestones: GymMilestone[];
}

export default function CollectiveMilestones({ milestones }: CollectiveMilestonesProps) {
    if (milestones.length === 0) {
        return (
            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4 border border-gray-700">
                    <Trophy size={24} className="text-gray-700" />
                </div>
                <h4 className="text-sm font-bold text-gray-400">No Active Milestones</h4>
                <p className="text-[11px] text-gray-600 mt-1">Check back soon for collective gym challenges!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Users size={16} className="text-lime" /> Collective Goals
                </h3>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Gym-wide</span>
            </div>

            {milestones.map((m, idx) => {
                const pct = Math.min(100, (m.current_value / m.target_value) * 100);
                const isComplete = pct >= 100;

                return (
                    <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`relative overflow-hidden bg-gray-900 border p-5 rounded-3xl transition-all ${isComplete ? 'border-lime/30 bg-lime/5' : 'border-gray-800'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h4 className={`text-sm font-black tracking-tight ${isComplete ? 'text-lime' : 'text-white'}`}>
                                    {m.title}
                                </h4>
                                <p className="text-[11px] text-gray-500 leading-relaxed mt-1">{m.description}</p>
                            </div>
                            <div className={`shrink-0 p-2.5 rounded-2xl border ${isComplete ? 'bg-lime/10 border-lime/20 text-lime' : 'bg-gray-800/50 border-gray-700 text-gray-500'
                                }`}>
                                {m.type === 'volume' ? <Zap size={18} /> : m.type === 'workouts' ? <Target size={18} /> : <Trophy size={18} />}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                                <span className={isComplete ? 'text-lime' : 'text-gray-500'}>
                                    {isComplete ? 'Goal Achieved!' : 'Progress'}
                                </span>
                                <span className="text-white">
                                    {m.current_value.toLocaleString()} / {m.target_value.toLocaleString()} <span className="text-gray-500">{m.unit}</span>
                                </span>
                            </div>
                            <div className="h-3 bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-700/30">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${isComplete
                                            ? 'bg-gradient-to-r from-lime to-emerald-400 shadow-[0_0_15px_-2px_rgba(50,255,50,0.4)]'
                                            : 'bg-lime'
                                        }`}
                                />
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                <Calendar size={12} />
                                Ends {formatDistanceToNow(new Date(m.deadline), { addSuffix: true })}
                            </div>
                            {m.reward_badge && (
                                <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                                    <span className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">REWARD: {m.reward_badge}</span>
                                </div>
                            )}
                        </div>

                        {isComplete && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-lime/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}
