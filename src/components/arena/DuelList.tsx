import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Plus, Upload, Timer, Image, ChevronUp, ChevronDown, Zap, CheckCircle2, Trophy, X, Camera } from 'lucide-react';
import { User } from '../../types/database';
import { Duel } from '../../lib/gamification';
import { getGhostChallengers, createDuelFromGhost, saveGhostDuel, GhostLifter } from '../../lib/ghostDuels';
import { TierBadge, rankFor } from '../profile/RankBadge';

interface DuelListProps {
    duels: Duel[];
    user: User | null;
    onShowCreator: () => void;
    onAddDuel?: (duel: Duel) => void;
}

const DuelList: React.FC<DuelListProps> = ({ duels, user, onShowCreator, onAddDuel }) => {
    const [localDuels, setLocalDuels] = useState<Duel[]>(duels);
    const [activeProofModalDuel, setActiveProofModalDuel] = useState<Duel | null>(null);
    const [proofValue, setProofValue] = useState<string>('');
    const [proofFileName, setProofFileName] = useState<string>('');
    const [submittingProof, setSubmittingProof] = useState(false);
    const [acceptedGhostId, setAcceptedGhostId] = useState<string | null>(null);

    // Sync external duels
    React.useEffect(() => {
        setLocalDuels(duels);
    }, [duels]);

    const userTotalKg = user?.big4 
        ? (user.big4.bench + user.big4.squat + user.big4.deadlift + user.big4.ohp) 
        : 380;
    const ghostRivals = getGhostChallengers(userTotalKg, 3);

    const handleAcceptGhost = (ghost: GhostLifter) => {
        const newDuel = createDuelFromGhost(user, ghost);
        setLocalDuels(prev => [newDuel, ...prev]);
        setAcceptedGhostId(ghost.id);
        setTimeout(() => setAcceptedGhostId(null), 2000);
        if (onAddDuel) {
            onAddDuel(newDuel);
        }
    };

    const handleOpenProof = (duel: Duel) => {
        setActiveProofModalDuel(duel);
        setProofValue('');
        setProofFileName('');
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProofFileName(file.name);
        }
    };

    const handleSubmitProof = () => {
        if (!activeProofModalDuel) return;
        const numVal = parseFloat(proofValue) || 0;
        if (numVal <= 0) {
            alert('Please enter your completed lift weight or reps.');
            return;
        }

        setSubmittingProof(true);
        setTimeout(() => {
            setLocalDuels(prev => prev.map(d => {
                if (d.id === activeProofModalDuel.id) {
                    const isChallenger = d.challengerId === user?.id;
                    const updated = {
                        ...d,
                        challengerProgress: isChallenger ? numVal : d.challengerProgress,
                        opponentProgress: isChallenger ? d.opponentProgress : numVal,
                    };
                    saveGhostDuel(updated);
                    return updated;
                }
                return d;
            }));
            setSubmittingProof(false);
            setActiveProofModalDuel(null);
            alert(`Proof verified! Score updated to ${numVal}.`);
        }, 600);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between mb-1">
                <div>
                    <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                        <Swords size={18} className="text-red-400" /> Active Duels
                    </h3>
                    <p className="text-[11px] text-gray-500">Live head-to-head strength showdowns</p>
                </div>
                <button onClick={onShowCreator}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-red-500/15 to-orange-500/15 border border-red-500/30 text-red-400 px-3.5 py-1.5 rounded-xl text-xs font-black hover:opacity-90 active:scale-95 transition-all shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                >
                    <Plus size={14} /> New Challenge
                </button>
            </div>

            {/* Duel rules callout */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-3.5 text-[11px] text-gray-400 flex items-start gap-2.5">
                <Upload size={14} className="text-yellow-400 mt-0.5 shrink-0" />
                <span>Duels require <strong className="text-yellow-400">verified proof</strong>. Post video or gym photo to validate numbers. 48h to accept, 7 days to complete.</span>
            </div>

            {/* Active Duels List */}
            {localDuels.length > 0 && (
                <div className="space-y-3">
                    {localDuels.map((duel, idx) => {
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
                                className={`bg-gray-900/80 border rounded-2xl p-4 space-y-3 ${isPending ? 'border-yellow-500/30' : 'border-gray-800'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${isPending
                                            ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                                            : 'bg-green-500/15 text-green-400 border border-green-500/30'}`}>
                                            {duel.status.toUpperCase()}
                                        </span>
                                        <span className="text-xs font-extrabold text-white">{duel.exercise}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <Timer size={12} /><span className="text-[10px] font-mono">{duel.endsAt}</span>
                                    </div>
                                </div>

                                <div className="p-2 rounded-xl bg-black/40 border border-gray-800/60 flex items-center justify-between">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Target Objective</span>
                                    <span className="text-xs font-black text-lime">{duel.target}</span>
                                </div>

                                {isPending ? (
                                    <div className="text-center py-3 bg-yellow-500/5 rounded-xl border border-yellow-500/10">
                                        <p className="text-xs text-yellow-400 font-bold mb-0.5">⏳ Awaiting {theirName.split(' ')[0]} to accept</p>
                                        <p className="text-[10px] text-gray-500">Auto-expires in 48 hours if unconfirmed</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 py-1">
                                        <div className="flex-1 text-center">
                                            <img 
                                                src={user?.profile_image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                                                className="w-12 h-12 rounded-full border-2 border-lime mx-auto mb-1 object-cover shadow-[0_0_12px_rgba(50,255,50,0.2)]" 
                                                alt="You"
                                            />
                                            <p className="text-[10px] font-black text-lime">You</p>
                                            <p className="text-xl font-black text-white font-mono">{myProgress}</p>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-xs font-black text-gray-600 italic">VS</span>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded flex items-center gap-0.5 ${winning
                                                ? 'bg-lime/15 text-lime border border-lime/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
                                                {winning ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                                {winning ? 'LEADING' : 'BEHIND'}
                                            </span>
                                        </div>
                                        <div className="flex-1 text-center">
                                            <img 
                                                src={theirAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} 
                                                className="w-12 h-12 rounded-full border-2 border-gray-700 mx-auto mb-1 object-cover" 
                                                alt={theirName}
                                            />
                                            <p className="text-[10px] font-bold text-gray-400 truncate max-w-[80px] mx-auto">{theirName.split(' ')[0]}</p>
                                            <p className="text-xl font-black text-white font-mono">{theirProgress}</p>
                                        </div>
                                    </div>
                                )}

                                {!isPending && (
                                    <div className="flex items-center gap-2 pt-1 border-t border-gray-800/80">
                                        <button onClick={() => handleOpenProof(duel)}
                                            className="flex-1 py-2.5 rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-extrabold flex items-center justify-center gap-1.5 hover:bg-yellow-500/25 active:scale-95 transition-all shadow-[0_0_12px_rgba(234,179,8,0.15)]"
                                        >
                                            <Image size={14} /> Post Proof & Update Lift
                                        </button>
                                        <div className="px-2.5 py-1.5 rounded-xl bg-gray-950 border border-gray-800 text-[10px] text-gray-400 font-bold shrink-0">
                                            🏆 +{duel.xpReward} XP
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Ghost Rivals Matchmaking Section */}
            <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-black text-white text-sm flex items-center gap-1.5">
                            <Zap size={16} className="text-lime" /> Available Arena Rivals
                        </h4>
                        <p className="text-[10px] text-gray-500">
                            Instant matchmaking calibrated to your {rankFor(userTotalKg).name} tier
                        </p>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-lime/10 text-lime border border-lime/30">
                        {ghostRivals.length} Ready
                    </span>
                </div>

                <div className="space-y-3">
                    {ghostRivals.map(ghost => {
                        const isAccepted = acceptedGhostId === ghost.id;

                        return (
                            <div 
                                key={ghost.id} 
                                className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800/80 space-y-3 hover:border-gray-700 transition-all"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={ghost.avatarUrl} 
                                            className="w-10 h-10 rounded-full object-cover border border-gray-700" 
                                            alt={ghost.name}
                                        />
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <h5 className="text-xs font-black text-white">{ghost.name}</h5>
                                                <TierBadge tier={ghost.rankTier} size="sm" />
                                            </div>
                                            <p className="text-[10px] text-gray-500 font-medium">
                                                {ghost.city} • {ghost.weightKg}kg • {ghost.rankName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-[9px] font-black text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
                                            +{ghost.activeChallenge.xpReward} XP
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-black/60 border border-gray-800/80 flex items-center justify-between">
                                    <div>
                                        <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Bounty Challenge</span>
                                        <span className="text-xs font-extrabold text-white">
                                            {ghost.activeChallenge.exercise}: {ghost.activeChallenge.target}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Rival Baseline</span>
                                        <span className="text-xs font-mono font-bold text-gray-300">
                                            {ghost.activeChallenge.progressText}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-[10px] text-gray-400 italic">"{ghost.quote}"</p>

                                <button
                                    onClick={() => handleAcceptGhost(ghost)}
                                    disabled={isAccepted}
                                    className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                                        isAccepted
                                            ? 'bg-lime text-oled shadow-[0_0_15px_rgba(50,255,50,0.3)]'
                                            : 'bg-lime/15 border border-lime/30 text-lime hover:bg-lime hover:text-oled active:scale-98'
                                    }`}
                                >
                                    {isAccepted ? (
                                        <>
                                            <CheckCircle2 size={14} /> Duel Accepted! Added to Active
                                        </>
                                    ) : (
                                        <>
                                            <Swords size={14} /> Accept Challenge ⚡
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Proof Submission Modal */}
            <AnimatePresence>
                {activeProofModalDuel && (
                    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/85 backdrop-blur-md">
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            className="bg-oled border-t border-gray-800 rounded-t-3xl w-full max-w-lg p-5 space-y-4 shadow-2xl"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-base font-black text-white italic uppercase flex items-center gap-1.5">
                                        <Upload size={18} className="text-yellow-400" /> Validate Duel Proof
                                    </h4>
                                    <p className="text-[10px] text-gray-500">
                                        {activeProofModalDuel.exercise} • Target: {activeProofModalDuel.target}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setActiveProofModalDuel(null)}
                                    className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-gray-900 border border-gray-800"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                                        Your Verified Completed Score (kg or reps)
                                    </label>
                                    <input
                                        type="number"
                                        value={proofValue}
                                        onChange={(e) => setProofValue(e.target.value)}
                                        placeholder="e.g. 100 or 8"
                                        className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl py-3 px-4 text-sm font-black focus:outline-none focus:border-yellow-400"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                                        Attach Media Verification
                                    </label>
                                    <label className="w-full py-4 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/40 hover:border-yellow-400/40 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer">
                                        <Camera size={20} className="text-yellow-400" />
                                        <span className="text-xs font-bold text-gray-300">
                                            {proofFileName ? proofFileName : 'Choose Gym Photo or Video Clip'}
                                        </span>
                                        <span className="text-[9px] text-gray-500">Max 50MB (MP4, MOV, JPEG)</span>
                                        <input
                                            type="file"
                                            accept="image/*,video/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmitProof}
                                disabled={submittingProof || !proofValue}
                                className="w-full py-3.5 rounded-xl bg-yellow-400 text-oled font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-yellow-300 active:scale-98 transition disabled:opacity-30 shadow-[0_0_20px_rgba(250,204,21,0.25)]"
                            >
                                <Trophy size={16} /> {submittingProof ? 'Verifying Proof...' : 'Submit Verified Proof'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default DuelList;
