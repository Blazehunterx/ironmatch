import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Play, X, Copy, Check, ShieldCheck, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { WorkoutPlan, GroupSession } from '../types/database';

interface GroupWorkoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    trainerId: string;
    homeGymId: string;
    plans: WorkoutPlan[];
}

export default function GroupWorkoutModal({ isOpen, onClose, trainerId, homeGymId, plans }: GroupWorkoutModalProps) {
    const [title, setTitle] = useState('');
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const [isCreating, setIsCreating] = useState(false);
    const [createdSession, setCreatedSession] = useState<GroupSession | null>(null);
    const [copied, setCopied] = useState(false);

    const handleCreate = async () => {
        if (!title.trim()) return;
        setIsCreating(true);

        const { data, error } = await supabase
            .from('group_sessions')
            .insert({
                trainer_id: trainerId,
                gym_id: homeGymId,
                title,
                workout_plan_id: selectedPlanId,
                status: 'active'
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating group session:', error);
        } else {
            setCreatedSession(data);
        }
        setIsCreating(false);
    };

    const copyCode = () => {
        if (createdSession) {
            navigator.clipboard.writeText(createdSession.join_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-oled border border-gray-800 w-full max-w-sm rounded-3xl overflow-hidden z-10 relative shadow-2xl"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400">
                                <Users size={20} />
                            </div>
                            <h2 className="text-xl font-black text-white">Group Session</h2>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {!createdSession ? (
                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Session Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Friday Morning Burner"
                                    className="w-full bg-gray-900 border border-gray-800 text-white rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-purple-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Select Workout Plan</label>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                    {plans.map(plan => (
                                        <button
                                            key={plan.id}
                                            onClick={() => setSelectedPlanId(plan.id)}
                                            className={`w-full text-left p-3 rounded-2xl border transition-all ${selectedPlanId === plan.id
                                                ? 'bg-purple-500/10 border-purple-500/50 text-white'
                                                : 'bg-gray-900 border-gray-800 text-gray-400'
                                                }`}
                                        >
                                            <p className="text-xs font-bold">{plan.name}</p>
                                            <p className="text-[10px] opacity-60">{plan.target} • {plan.exercises.length} Exercises</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 flex items-start gap-3">
                                <ShieldCheck size={16} className="text-purple-400 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                                    Only verified trainers can host group sessions. Participants will see your real-time status and live leaderboard.
                                </p>
                            </div>

                            <button
                                onClick={handleCreate}
                                disabled={!title.trim() || isCreating}
                                className="w-full py-4 rounded-2xl bg-purple-600 text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-purple-500 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-purple-600/20"
                            >
                                {isCreating ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Play size={18} className="fill-current" /> START SESSION
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
                                <Zap size={32} className="text-purple-400 fill-current" />
                            </div>
                            <h3 className="text-lg font-black text-white mb-2">Session is Live!</h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-8">SHARE JOIN CODE</p>

                            <div className="flex items-center gap-2 bg-gray-900 p-2 rounded-2xl border border-gray-800 mb-8">
                                <div className="flex-1 py-3 text-2xl font-black text-lime tracking-[0.2em] font-mono">
                                    {createdSession.join_code}
                                </div>
                                <button
                                    onClick={copyCode}
                                    className="p-4 bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-all active:scale-95"
                                >
                                    {copied ? <Check size={20} className="text-lime" /> : <Copy size={20} />}
                                </button>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-4 rounded-2xl bg-gray-800 text-white font-black text-sm hover:bg-gray-700 transition-all"
                            >
                                GO TO SESSION
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
