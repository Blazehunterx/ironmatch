import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, Share2, Scale } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { User } from '../../types/database';
import confetti from 'canvas-confetti';

interface RemoteWhatsAppDuelProps {
    user: User | null;
}

export interface RemoteDuelState {
    id: string;
    exercise: string;
    challengerName: string;
    challengerScore: number;
    challengerBW: number;
    opponentName: string;
    opponentBW: number;
    fairTarget: number;
    opponentScore?: number;
    status: 'pending' | 'resolved';
    winner?: string;
    createdAt: string;
}

const STORAGE_KEY = 'ironmatch_remote_duels_v3';

export default function RemoteWhatsAppDuel({ user }: RemoteWhatsAppDuelProps) {
    const { showToast } = useToast();
    const [exercise, setExercise] = useState('Weighted Dips');
    const [challengerScore, setChallengerScore] = useState<number>(40);
    const [challengerBW, setChallengerBW] = useState<number>(user?.weight_kg || 80);
    const [opponentName, setOpponentName] = useState('Training Partner');
    const [opponentBW, setOpponentBW] = useState<number>(75);
    const [duels, setDuels] = useState<RemoteDuelState[]>([]);
    const [incomingDuel, setIncomingDuel] = useState<RemoteDuelState | null>(null);
    const [opponentAchievedScore, setOpponentAchievedScore] = useState<string>('');

    // Load saved duels
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setDuels(JSON.parse(raw));
        } catch { /* storage */ }

        // Check URL parameters for duel challenge or return score
        const params = new URLSearchParams(window.location.search);
        const duelId = params.get('duelId');
        const challenger = params.get('challenger');
        const ex = params.get('exercise');
        const score = params.get('score');
        const target = params.get('target');
        const oppScore = params.get('oppScore');

        if (duelId && oppScore) {
            // Challenger receiving return score from opponent
            resolveIncomingDuel(duelId, parseFloat(oppScore));
        } else if (duelId && challenger && ex && score && target) {
            // Opponent receiving challenge from challenger
            setIncomingDuel({
                id: duelId,
                exercise: ex,
                challengerName: challenger,
                challengerScore: parseFloat(score),
                challengerBW: parseFloat(params.get('cBW') || '80'),
                opponentName: 'You',
                opponentBW: parseFloat(params.get('oBW') || '60'),
                fairTarget: parseFloat(target),
                status: 'pending',
                createdAt: new Date().toISOString()
            });
        }
    }, []);

    // Calculate pound-for-pound fair target
    const fairTarget = Math.max(
        0,
        Math.round((challengerScore + challengerBW) * (opponentBW / challengerBW) - opponentBW)
    );

    const getShareBaseUrl = () => {
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !window.location.hostname.startsWith('127.')) {
            return window.location.origin + window.location.pathname;
        }
        return 'https://ironmatch.app/arena';
    };

    const handleSendChallenge = () => {
        const id = `duel-${Date.now()}`;
        const newDuel: RemoteDuelState = {
            id,
            exercise,
            challengerName: user?.name || 'Iron Lifter',
            challengerScore,
            challengerBW,
            opponentName: opponentName.trim() || 'Training Partner',
            opponentBW,
            fairTarget,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        const updated = [newDuel, ...duels];
        setDuels(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        // Generate WhatsApp link
        const baseUrl = getShareBaseUrl();
        const duelUrl = `${baseUrl}?duelId=${id}&challenger=${encodeURIComponent(newDuel.challengerName)}&exercise=${encodeURIComponent(exercise)}&score=${challengerScore}&target=${fairTarget}&cBW=${challengerBW}&oBW=${opponentBW}`;

        const text = `🥊 IRONMATCH DUEL CHALLENGE!\n` +
            `From: ${newDuel.challengerName}\n` +
            `Exercise: ${exercise}\n` +
            `My Score: ${challengerScore} kg (Bodyweight: ${challengerBW} kg)\n` +
            `🎯 Your Fair Target: ${fairTarget} kg (Bodyweight: ${opponentBW} kg)\n\n` +
            `Tap the link to accept and log your score:\n${duelUrl}`;

        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        showToast('WhatsApp challenge link generated!', 'success');
    };

    const handleSendScoreBack = () => {
        if (!incomingDuel || !opponentAchievedScore) return;
        const myScore = parseFloat(opponentAchievedScore);
        const baseUrl = getShareBaseUrl();
        const returnUrl = `${baseUrl}?duelId=${incomingDuel.id}&oppScore=${myScore}`;

        const isWinner = myScore >= incomingDuel.fairTarget;
        const replyText = `🔥 IRONMATCH DUEL RESULT!\n` +
            `Exercise: ${incomingDuel.exercise}\n` +
            `Target was: ${incomingDuel.fairTarget} kg\n` +
            `My Achieved Score: ${myScore} kg\n` +
            `Result: ${isWinner ? '🏆 Target Beaten!' : 'Target Missed!'}\n\n` +
            `Verify & Crown Champion:\n${returnUrl}`;

        window.open(`https://wa.me/?text=${encodeURIComponent(replyText)}`, '_blank');
        showToast('Sending score back via WhatsApp!', 'success');
        setIncomingDuel(null);
    };

    const resolveIncomingDuel = (duelId: string, oppScore: number) => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const list: RemoteDuelState[] = raw ? JSON.parse(raw) : [];
            const match = list.find(d => d.id === duelId);
            if (match) {
                const won = match.challengerScore >= (oppScore || 0);
                match.opponentScore = oppScore;
                match.status = 'resolved';
                match.winner = won ? match.challengerName : match.opponentName;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
                setDuels(list);

                if (won) {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    showToast(`🏆 You won the duel against ${match.opponentName}!`, 'success');
                } else {
                    showToast(`Duel resolved! ${match.opponentName} hit ${oppScore}kg!`, 'info');
                }
            }
        } catch { /* storage */ }
    };

    return (
        <div className="space-y-4">
            {/* Incoming Duel Card if accessed from link */}
            {incomingDuel && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 bg-gradient-to-br from-red-950/80 to-gray-950 border-2 border-red-500 rounded-2xl shadow-2xl space-y-4"
                >
                    <div className="flex items-center gap-2 text-red-400 font-black text-sm">
                        <Swords size={18} />
                        <span>INCOMING DUEL CHALLENGE</span>
                    </div>

                    <div>
                        <h4 className="text-xl font-black text-white">{incomingDuel.exercise}</h4>
                        <p className="text-xs text-gray-400">
                            Challenged by <strong className="text-lime">{incomingDuel.challengerName}</strong>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 bg-black/60 rounded-xl border border-gray-800 font-mono text-center">
                        <div>
                            <span className="text-[10px] text-gray-500 block">CHALLENGER SCORE</span>
                            <span className="text-lg font-black text-white">{incomingDuel.challengerScore} kg</span>
                            <span className="text-[10px] text-gray-400 block">at {incomingDuel.challengerBW}kg BW</span>
                        </div>
                        <div className="border-l border-gray-800">
                            <span className="text-[10px] text-lime block font-bold">YOUR FAIR TARGET</span>
                            <span className="text-lg font-black text-lime">{incomingDuel.fairTarget} kg</span>
                            <span className="text-[10px] text-gray-400 block">at {incomingDuel.opponentBW}kg BW</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-300 block mb-1">Enter Your Achieved Score (kg)</label>
                        <input
                            type="number"
                            value={opponentAchievedScore}
                            onChange={e => setOpponentAchievedScore(e.target.value)}
                            placeholder={`Target is ${incomingDuel.fairTarget} kg`}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white font-mono text-lg focus:outline-none focus:border-lime"
                        />
                    </div>

                    <button
                        onClick={handleSendScoreBack}
                        disabled={!opponentAchievedScore}
                        className="w-full py-3 bg-lime text-oled font-black rounded-xl hover:bg-lime/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Share2 size={16} /> Send Score Back to Challenger on WhatsApp
                    </button>
                </motion.div>
            )}

            {/* Duel Creator Card */}
            <div className="p-5 bg-gray-950 border border-gray-800 rounded-2xl shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl">
                            <Swords size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-white">Remote 1-on-1 Duel</h3>
                            <p className="text-xs text-gray-400">Pound-for-pound fair handicap via WhatsApp</p>
                        </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-lime/10 text-lime border border-lime/30 font-mono font-bold uppercase tracking-wider">
                        P4P Scaled
                    </span>
                </div>

                {/* Exercise Selection */}
                <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Select Exercise</label>
                    <select
                        value={exercise}
                        onChange={e => setExercise(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-lime"
                    >
                        <option value="Weighted Dips">Weighted Dips</option>
                        <option value="Weighted Pull-Ups">Weighted Pull-Ups</option>
                        <option value="100 Push-Ups Race">100 Push-Ups Race</option>
                        <option value="Barbell Squat">Barbell Squat</option>
                        <option value="Bench Press">Bench Press</option>
                        <option value="Weekly Volume (Tonnage)">Weekly Volume (Tonnage)</option>
                    </select>
                </div>

                {/* Score & Bodyweights */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-bold text-gray-400 block mb-1">Your Lift Score (kg)</label>
                        <input
                            type="number"
                            value={challengerScore}
                            onChange={e => setChallengerScore(Number(e.target.value))}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-lime"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 block mb-1">Your Bodyweight (kg)</label>
                        <input
                            type="number"
                            value={challengerBW}
                            onChange={e => setChallengerBW(Number(e.target.value))}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-lime"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-bold text-gray-400 block mb-1">Opponent Name</label>
                        <input
                            type="text"
                            value={opponentName}
                            onChange={e => setOpponentName(e.target.value)}
                            placeholder="e.g. Alex"
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-lime"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 block mb-1">Opponent Weight (kg)</label>
                        <input
                            type="number"
                            value={opponentBW}
                            onChange={e => setOpponentBW(Number(e.target.value))}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-lime"
                        />
                    </div>
                </div>

                {/* Pound for pound calculation banner */}
                <div className="p-3 bg-gray-900/80 border border-lime/30 rounded-xl flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                        <Scale size={16} className="text-lime shrink-0" />
                        <span>Fair Relative Target:</span>
                    </div>
                    <span className="text-base font-black text-lime">{fairTarget} kg</span>
                </div>

                <button
                    onClick={handleSendChallenge}
                    className="w-full py-3 bg-lime text-oled font-black rounded-xl hover:bg-lime/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-lime/10"
                >
                    <Share2 size={16} /> Challenge on WhatsApp
                </button>
            </div>

            {/* Duel History / Active Cards */}
            {duels.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-gray-400 px-1">Active Remote Duels</h4>
                    {duels.slice(0, 5).map(d => (
                        <div key={d.id} className="p-3 bg-gray-950 border border-gray-800 rounded-xl flex items-center justify-between text-xs">
                            <div>
                                <p className="font-bold text-white">{d.exercise}</p>
                                <p className="text-gray-400 font-mono">
                                    You: {d.challengerScore}kg vs {d.opponentName}: {d.fairTarget}kg target
                                </p>
                            </div>
                            <span className={`px-2 py-1 rounded font-bold font-mono text-[10px] ${
                                d.status === 'resolved'
                                    ? d.winner === d.challengerName || d.winner?.includes('You')
                                        ? 'bg-lime/10 text-lime border border-lime/30'
                                        : 'bg-red-500/10 text-red-400'
                                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                            }`}>
                                {d.status === 'resolved' ? `Winner: ${d.winner}` : 'Pending WhatsApp'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
