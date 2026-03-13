import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Swords, Plus, Upload, Timer, Image, ChevronUp, ChevronDown } from 'lucide-react';
import { User } from '../../types/database';
import { Duel } from '../../lib/gamification';

interface DuelListProps {
    duels: Duel[];
    user: User | null;
    onShowCreator: () => void;
}

const DuelList: React.FC<DuelListProps> = ({ duels, user, onShowCreator }) => {
    const proofInputRef = useRef<HTMLInputElement>(null);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Swords size={16} className="text-red-400" /> Your Duels
                </h3>
                <button onClick={onShowCreator}
                    className="flex items-center gap-1 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-xl text-[10px] font-bold hover:opacity-80 active:scale-95 transition-all"
                >
                    <Plus size={12} /> Challenge
                </button>
            </div>

            {/* Duel rules callout */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 text-[10px] text-gray-500 flex items-start gap-2">
                <Upload size={12} className="text-yellow-500 mt-0.5 shrink-0" />
                <span>Duels require <span className="text-yellow-400 font-bold">proof</span> — post your lift to validate. 48h to accept, 7 days to complete.</span>
            </div>

            {duels.map((duel, idx) => {
                const isChallenger = duel.challengerId === user?.id;
                const myProgress = isChallenger ? duel.challengerProgress : duel.opponentProgress;
                const theirProgress = isChallenger ? duel.opponentProgress : duel.challengerProgress;
                const theirName = isChallenger ? duel.opponentName : duel.challengerName;
                const theirAvatar = isChallenger ? duel.opponentAvatar : duel.challengerAvatar;
                const winning = myProgress > theirProgress;
                const isPending = duel.status === 'pending';

                return (
                    <motion.div key={duel.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className={`bg-gray-900 border rounded-2xl p-4 space-y-3 ${isPending ? 'border-yellow-500/20' : 'border-gray-800'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isPending
                                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                    : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                    {duel.status.toUpperCase()}
                                </span>
                                <span className="text-xs font-bold text-white">{duel.exercise}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                                <Timer size={10} /><span className="text-[10px]">{duel.endsAt}</span>
                            </div>
                        </div>

                        {isPending ? (
                            <div className="text-center py-2">
                                <p className="text-xs text-yellow-400 mb-1">⏳ Waiting for {theirName.split(' ')[0]} to accept</p>
                                <p className="text-[10px] text-gray-500">Challenge expires in 48 hours</p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="flex-1 text-center">
                                    <img src={user?.profile_image_url} className="w-12 h-12 rounded-full border-2 border-lime mx-auto mb-1 object-cover" />
                                    <p className="text-[10px] font-bold text-lime">You</p>
                                    <p className="text-lg font-black text-white">{myProgress}</p>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-lg font-black text-gray-600">VS</span>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-0.5 ${winning
                                        ? 'bg-lime/10 text-lime' : 'bg-red-500/10 text-red-400'}`}>
                                        {winning ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                        {winning ? 'LEADING' : 'BEHIND'}
                                    </span>
                                </div>
                                <div className="flex-1 text-center">
                                    <img src={theirAvatar} className="w-12 h-12 rounded-full border-2 border-gray-700 mx-auto mb-1 object-cover" />
                                    <p className="text-[10px] font-bold text-gray-400">{theirName.split(' ')[0]}</p>
                                    <p className="text-lg font-black text-white">{theirProgress}</p>
                                </div>
                            </div>
                        )}

                        {!isPending && (
                            <div className="flex items-center gap-2">
                                <input ref={proofInputRef} type="file" accept="image/*,video/*" className="hidden" />
                                <button onClick={() => proofInputRef.current?.click()}
                                    className="flex-1 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-yellow-500/20 active:scale-95 transition-all"
                                >
                                    <Image size={12} /> Post Proof
                                </button>
                                <p className="text-[9px] text-gray-500">🏆 {duel.xpReward} XP</p>
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </motion.div>
    );
};

export default DuelList;
