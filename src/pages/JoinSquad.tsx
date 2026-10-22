import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getStoredSquads, joinSquadByCode } from '../lib/squads';
import { safeStorage } from '../lib/safeStorage';
import { GymSquad } from '../types/database';

export default function JoinSquad() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const code = (searchParams.get('squad') || searchParams.get('code') || '').trim().toUpperCase();
    const tag = (searchParams.get('tag') || '').trim().toUpperCase();

    const [status, setStatus] = useState<'loading' | 'joined' | 'not_logged_in' | 'error'>('loading');
    const [joinedSquad, setJoinedSquad] = useState<GymSquad | null>(null);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!code) {
            setStatus('error');
            setErrorMsg('No squad join code was found in this link.');
            return;
        }

        // Persist code in case user needs to sign up or log in first
        safeStorage.setItem('pending_squad_code', code);

        const squads = getStoredSquads();
        const targetSquad = squads.find(s => s.join_code === code || (tag && s.tag === tag));

        if (!user) {
            setJoinedSquad(targetSquad || null);
            setStatus('not_logged_in');
            return;
        }

        // User is logged in -> attempt instant auto-pairing
        const result = joinSquadByCode(user, code);
        if (result.success && result.squad) {
            setJoinedSquad(result.squad);
            setStatus('joined');
            safeStorage.removeItem('pending_squad_code');
        } else if (result.error && result.error.includes('already an active member')) {
            setJoinedSquad(targetSquad || null);
            setStatus('joined');
            safeStorage.removeItem('pending_squad_code');
        } else {
            setStatus('error');
            setErrorMsg(result.error || 'Failed to join squad.');
        }
    }, [code, tag, user]);

    return (
        <div className="min-h-screen bg-oled text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-lime/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md bg-gray-950 border border-lime/40 rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-[0_0_50px_rgba(50,255,50,0.15)] text-center"
            >
                {/* Header Icon */}
                <div className="w-16 h-16 rounded-3xl bg-lime/10 border border-lime/40 flex items-center justify-center text-lime mx-auto shadow-[0_0_20px_rgba(50,255,50,0.3)]">
                    <Shield size={32} />
                </div>

                {status === 'loading' && (
                    <div className="space-y-3 py-6">
                        <div className="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin mx-auto" />
                        <h3 className="text-base font-black uppercase tracking-wider">
                            Syncing Duo Squad Invite...
                        </h3>
                    </div>
                )}

                {status === 'joined' && joinedSquad && (
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime/20 border border-lime/40 text-lime text-xs font-black uppercase tracking-wider">
                            <CheckCircle2 size={14} /> You're Locked In!
                        </div>

                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-wide text-white">
                                {joinedSquad.name}
                            </h2>
                            <p className="text-xs text-lime font-mono font-bold mt-1">
                                Squad Tag: [{joinedSquad.tag}] · Code: {joinedSquad.join_code}
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-black/60 border border-lime/20 text-left space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">Roster Capacity</span>
                                <span className="text-white font-mono font-bold">
                                    {joinedSquad.members.length}/{joinedSquad.max_members} Lifters ({joinedSquad.max_members === 2 ? 'Ranked Duo' : '4-Man Squad'})
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">Combined BW Ratio</span>
                                <span className="text-lime font-mono font-black text-sm">
                                    {joinedSquad.total_score.toFixed(1)}× BW
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">Competitive Tier</span>
                                <span className="text-white font-bold uppercase">
                                    {joinedSquad.rank_tier} Tier
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-400">
                            You and your gym bro now combine strength scores on the National and Global Whiteboard.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate('/arena')}
                            className="w-full py-4 rounded-2xl bg-lime text-oled font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(50,255,50,0.3)] hover:brightness-105 active:scale-95 transition flex items-center justify-center gap-2"
                        >
                            Enter Arena Whiteboard <ArrowRight size={14} />
                        </button>
                    </div>
                )}

                {status === 'not_logged_in' && (
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime/20 border border-lime/40 text-lime text-xs font-black uppercase tracking-wider">
                            <Sparkles size={14} /> 1-Click Duo Invite
                        </div>

                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-wide text-white">
                                {joinedSquad ? joinedSquad.name : `Squad [${tag || code}]`}
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">
                                {joinedSquad?.captain_name
                                    ? `${joinedSquad.captain_name} invited you to play Ranked Duos together!`
                                    : 'You have a pending invite to pair up on the gym floor.'}
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-black/60 border border-gray-800 text-left space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <span className="text-lime">⚡</span> Auto-pairs immediately after registration
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <span className="text-lime">🇳🇱</span> Compete together in the Netherlands National Gym Ladder
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <span className="text-lime">🤝</span> Spotter Radar & Ghost Duels enabled
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <button
                                type="button"
                                onClick={() => navigate('/signup')}
                                className="w-full py-4 rounded-2xl bg-lime text-oled font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(50,255,50,0.3)] hover:brightness-105 active:scale-95 transition flex items-center justify-center gap-2"
                            >
                                Create Account to Pair Up <ArrowRight size={14} />
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="w-full py-3 rounded-2xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white font-bold text-xs uppercase tracking-wider transition"
                            >
                                Already have an account? Log In
                            </button>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-base font-black uppercase text-white">
                            Invite Error
                        </h3>
                        <p className="text-xs text-gray-400">
                            {errorMsg || 'This squad link may be expired or invalid.'}
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="w-full py-3 rounded-2xl bg-gray-900 border border-gray-800 text-white font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition"
                        >
                            Return to Gym Floor
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
