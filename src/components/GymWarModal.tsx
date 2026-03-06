import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Users, X, MapPin, Swords } from 'lucide-react';
import { Gym } from '../types/database';
import { supabase } from '../lib/supabase';

interface GymWarModalProps {
    isOpen: boolean;
    onClose: () => void;
    ownerGym: Gym;
    allGyms: Gym[];
}

export default function GymWarModal({ isOpen, onClose, ownerGym, allGyms }: GymWarModalProps) {
    const [step, setStep] = useState(1);
    const [targetGym, setTargetGym] = useState<Gym | null>(null);
    const [battleType, setBattleType] = useState<'volume' | 'active' | 'pr'>('volume');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const challengeTypes = [
        { id: 'volume', name: 'Iron Harvest', desc: 'Collective weight moved in 24 hours.', icon: <Zap className="text-lime" /> },
        { id: 'active', name: 'Legion Call', desc: 'Highest unique member attendance in 24 hours.', icon: <Users className="text-blue-400" /> },
        { id: 'pr', name: 'Peak Performance', desc: 'Most Personal Records broken in 24 hours.', icon: <Trophy className="text-purple-400" /> },
    ];

    const handleSubmit = async () => {
        if (!targetGym) return;
        setIsSubmitting(true);

        try {
            const { error } = await supabase.from('gym_wars').insert({
                gym_1_id: ownerGym.id,
                gym_2_id: targetGym.id,
                battle_type: battleType,
                status: 'pending'
            });

            if (!error) {
                alert(`Challenge sent to ${targetGym.name}! Waiting for their owner to accept.`);
                onClose();
            } else {
                alert('Failed to send challenge: ' + error.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-oled border border-gray-800 w-full max-w-md rounded-3xl overflow-hidden relative shadow-2xl"
            >
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <Swords className="text-red-500" /> GYM WARS
                        </h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Initiate Arena Challenge</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-900 rounded-xl text-gray-500"><X size={20} /></button>
                </div>

                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <h3 className="text-sm font-bold text-white mb-4">Select Target Community</h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {allGyms.filter(g => g.id !== ownerGym.id).map(g => (
                                        <button
                                            key={g.id}
                                            onClick={() => setTargetGym(g)}
                                            className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${targetGym?.id === g.id
                                                    ? 'bg-lime/10 border-lime shadow-[0_0_20px_-5px_rgba(50,255,50,0.2)]'
                                                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                                                }`}
                                        >
                                            <div className="p-2 bg-gray-800 rounded-lg">
                                                <MapPin size={16} className={targetGym?.id === g.id ? 'text-lime' : 'text-gray-500'} />
                                            </div>
                                            <div className="text-left flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-white truncate">{g.name}</h4>
                                                <p className="text-[10px] text-gray-500">{g.location} · {g.member_count} Members</p>
                                            </div>
                                            {g.is_verified_gym && <Zap size={12} className="text-lime fill-current" />}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    disabled={!targetGym}
                                    onClick={() => setStep(2)}
                                    className="w-full py-4 bg-white text-oled rounded-2xl font-black uppercase tracking-widest text-xs mt-4 disabled:opacity-30 active:scale-95 transition-all"
                                >
                                    Select Battle Type
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-2 mb-6">
                                    <button onClick={() => setStep(1)} className="p-2 bg-gray-900 rounded-lg text-gray-500 hover:text-white transition-colors">
                                        <X size={14} className="rotate-45" />
                                    </button>
                                    <h3 className="text-sm font-bold text-white">Choose Your Weapon</h3>
                                </div>

                                <div className="space-y-3">
                                    {challengeTypes.map(challenge => (
                                        <button
                                            key={challenge.id}
                                            onClick={() => setBattleType(challenge.id as any)}
                                            className={`w-full flex items-start gap-4 p-4 rounded-2xl border transition-all ${battleType === challenge.id
                                                    ? 'bg-red-500/10 border-red-500 shadow-[0_0_20px_-5px_rgba(255,50,50,0.2)]'
                                                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                                                }`}
                                        >
                                            <div className={`p-3 rounded-xl ${battleType === challenge.id ? 'bg-red-500/20' : 'bg-gray-800'}`}>
                                                {challenge.icon}
                                            </div>
                                            <div className="text-left flex-1">
                                                <h4 className="text-sm font-black text-white mb-1 uppercase tracking-wider">{challenge.name}</h4>
                                                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">{challenge.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-8 p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                                    <p className="text-[10px] text-red-500/60 font-medium text-center italic">
                                        Note: Wars last 24 hours once accepted. All member activity during this time counts towards your score.
                                    </p>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Swords size={16} />}
                                    DECLARATION OF WAR
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
