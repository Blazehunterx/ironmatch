import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, X, Upload, Users, Check, Scale } from 'lucide-react';
import { User } from '../../types/database';
import { 
    getRankFromLifts, getBig4Total, checkDuelFairness, 
    calculateEquivalentWeight, DUEL_TEMPLATES 
} from '../../lib/gamification';

interface DuelCreatorProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    allProfiles: User[];
    onSendChallenge: (duelData: any) => void;
}

const DuelCreator: React.FC<DuelCreatorProps> = ({ 
    isOpen, onClose, user, allProfiles, onSendChallenge 
}) => {
    const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null);
    const [selectedDuelTemplate, setSelectedDuelTemplate] = useState<number | null>(null);
    const [useCustomDuel, setUseCustomDuel] = useState(false);
    const [customExercise, setCustomExercise] = useState('');
    const [customTarget, setCustomTarget] = useState('');
    const [duelWeight, setDuelWeight] = useState<number>(0);

    const handleSend = () => {
        if (!user) return;
        let newDuelData: any = null;

        if (useCustomDuel && customExercise.trim() && customTarget.trim() && selectedOpponent) {
            const opp = allProfiles.find(u => u.id === selectedOpponent);
            if (!opp) return;

            newDuelData = {
                challenger_id: user.id,
                opponent_id: opp.id,
                type: 'custom',
                exercise_name: customExercise.trim(),
                target_value: customTarget.trim(),
                status: 'pending',
                challenger_progress: 0,
                opponent_progress: 0,
                xp_reward: 150
            };
        } else if (selectedDuelTemplate !== null) {
            const opp = allProfiles.find(u => u.id === selectedOpponent);
            const template = DUEL_TEMPLATES[selectedDuelTemplate];
            if (!opp || !template) return;

            let finalTarget = template.target;
            if (template.type === 'weight' && duelWeight > 0) {
                const oppWeight = calculateEquivalentWeight(duelWeight, user.weight_kg || 75, opp.weight_kg || 75);
                finalTarget = `Lift ${duelWeight}${user.unit_preference} (Opponent: ${oppWeight}${opp.unit_preference})`;
            }

            newDuelData = {
                challenger_id: user.id,
                opponent_id: opp.id,
                type: template.type,
                exercise_name: template.exercise,
                target_value: finalTarget,
                status: 'pending',
                challenger_progress: 0,
                opponent_progress: 0,
                xp_reward: 150
            };
        }

        if (newDuelData) {
            onSendChallenge(newDuelData);
            // Reset state
            setSelectedOpponent(null);
            setSelectedDuelTemplate(null);
            setDuelWeight(0);
            setCustomExercise('');
            setCustomTarget('');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm">
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                        className="bg-gray-900 border-t border-gray-800 rounded-t-3xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                <Swords size={20} className="text-red-400" /> New Duel
                            </h3>
                            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg"><X size={20} /></button>
                        </div>

                        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 mb-4 text-[10px] text-yellow-400 flex items-start gap-2">
                            <Upload size={12} className="mt-0.5 shrink-0" />
                            <span>Weight duels require <strong>proof</strong>. You must post your lift for it to count. Challenge expires in <strong>48h</strong>, must complete in <strong>7 days</strong>.</span>
                        </div>

                        <div className="mb-5">
                            <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1"><Users size={12} /> Choose Opponent</p>
                            <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                {allProfiles.filter(u => u.id !== user?.id).map(u => {
                                    const opRank = u.big4 ? getRankFromLifts(u.big4, u.unit_preference) : null;
                                    return (
                                        <button key={u.id} onClick={() => setSelectedOpponent(u.id)}
                                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${selectedOpponent === u.id
                                                ? 'bg-lime/10 border-lime/30' : 'bg-gray-800/50 border-gray-800 hover:border-gray-700'}`}>
                                            <img src={u.profile_image_url} className="w-8 h-8 rounded-full border border-gray-700 object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-bold truncate ${selectedOpponent === u.id ? 'text-lime' : 'text-white'}`}>{u.name}</p>
                                                <p className="text-[9px] text-gray-500">
                                                    {u.weight_kg || '?'}kg · {opRank ? `${opRank.icon} ${opRank.name}` : u.fitness_level}
                                                </p>
                                            </div>
                                            {selectedOpponent === u.id && <Check size={14} className="text-lime shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Fairness indicator */}
                        {selectedOpponent && selectedDuelTemplate !== null && DUEL_TEMPLATES[selectedDuelTemplate]?.type === 'weight' && (() => {
                            const opp = allProfiles.find(u => u.id === selectedOpponent);
                            if (!opp?.weight_kg || !user?.weight_kg) return null;
                            const myBig4 = user.big4 || { bench: 0, squat: 0, deadlift: 0, ohp: 0 };
                            const oppBig4 = opp.big4 || { bench: 0, squat: 0, deadlift: 0, ohp: 0 };
                            const fairness = checkDuelFairness(
                                { liftValue: getBig4Total(myBig4), unit: user.unit_preference || 'lbs', bodyweightKg: user.weight_kg },
                                { liftValue: getBig4Total(oppBig4), unit: opp.unit_preference || 'lbs', bodyweightKg: opp.weight_kg }
                            );
                            return (
                                <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ borderColor: fairness.color + '40', backgroundColor: fairness.color + '08' }}>
                                    <Scale size={14} style={{ color: fairness.color }} />
                                    <span className="text-[10px] font-bold" style={{ color: fairness.color }}>{fairness.label}</span>
                                    <span className="text-[9px] text-gray-500 ml-auto">
                                        You: {user.weight_kg}kg · {opp.name.split(' ')[0]}: {opp.weight_kg}kg
                                    </span>
                                </div>
                            );
                        })()}

                        {/* Challenge picker */}
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-gray-400 flex items-center gap-1"><Swords size={12} /> {useCustomDuel ? 'Custom Challenge' : 'Choose Challenge'}</p>
                                <button onClick={() => { setUseCustomDuel(!useCustomDuel); setSelectedDuelTemplate(null); setDuelWeight(0); }}
                                    className="text-[10px] text-lime font-bold hover:underline">
                                    {useCustomDuel ? 'Use Templates' : 'Create Custom'}
                                </button>
                            </div>

                            {useCustomDuel ? (
                                <div className="space-y-2">
                                    <input type="text" value={customExercise} onChange={e => setCustomExercise(e.target.value)}
                                        placeholder="Exercise (e.g. Bench Press 3x8)"
                                        className="w-full bg-oled border border-gray-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-lime" />
                                    <input type="text" value={customTarget} onChange={e => setCustomTarget(e.target.value)}
                                        placeholder="Target (e.g. 225lbs for 8 reps)"
                                        className="w-full bg-oled border border-gray-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-lime" />
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-1.5 mb-3">
                                        {DUEL_TEMPLATES.map((t, i) => (
                                            <button key={i} onClick={() => { setSelectedDuelTemplate(i); setDuelWeight(0); }}
                                                className={`p-3 rounded-xl border text-left transition-all ${selectedDuelTemplate === i
                                                    ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-800/50 border-gray-800 hover:border-gray-700'}`}>
                                                <p className={`text-xs font-bold ${selectedDuelTemplate === i ? 'text-red-400' : 'text-white'}`}>{t.exercise}</p>
                                                <p className="text-[9px] text-gray-500 mt-0.5">{t.target}</p>
                                            </button>
                                        ))}
                                    </div>

                                    {selectedDuelTemplate !== null && DUEL_TEMPLATES[selectedDuelTemplate].type === 'weight' && (
                                        <div className="space-y-3 p-4 bg-gray-800/30 rounded-2xl border border-gray-800">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Your Target Weight ({user?.unit_preference || 'lbs'})</label>
                                                <input type="number" value={duelWeight || ''} onChange={e => setDuelWeight(Number(e.target.value))}
                                                    placeholder="Enter weight..."
                                                    className="w-full bg-oled border border-gray-700 text-white text-lg font-black rounded-xl px-4 py-3 focus:outline-none focus:border-red-500" />
                                            </div>

                                            {selectedOpponent && user?.weight_kg && duelWeight > 0 && (() => {
                                                const opp = allProfiles.find(u => u.id === selectedOpponent);
                                                if (!opp?.weight_kg) return null;
                                                const eqWeight = calculateEquivalentWeight(duelWeight, user.weight_kg, opp.weight_kg);
                                                return (
                                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                                        className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase">FairDuel Target for {opp.name.split(' ')[0]}</p>
                                                            <p className="text-sm font-black text-red-400">{eqWeight} {opp.unit_preference || 'lbs'}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[9px] text-gray-500">Relative Effort</p>
                                                            <p className="text-[10px] font-bold text-white">{(duelWeight / user.weight_kg).toFixed(2)}x BW</p>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <button onClick={handleSend}
                            disabled={selectedOpponent === null || (useCustomDuel ? !customExercise.trim() || !customTarget.trim() : (selectedDuelTemplate === null || (DUEL_TEMPLATES[selectedDuelTemplate].type === 'weight' && duelWeight <= 0)))}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 flex items-center justify-center gap-2">
                            <Swords size={18} /> Send Challenge
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DuelCreator;
