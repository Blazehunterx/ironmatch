import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Users, KeyRound, Sparkles, AlertCircle } from 'lucide-react';
import { User, GymSquad } from '../../types/database';
import { createSquad, joinSquadByCode } from '../../lib/squads';

interface CreateJoinSquadModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSquadUpdated: (squad: GymSquad) => void;
}

export default function CreateJoinSquadModal({
    isOpen,
    onClose,
    user,
    onSquadUpdated
}: CreateJoinSquadModalProps) {
    const [mode, setMode] = useState<'create' | 'join'>('create');
    const [name, setName] = useState('');
    const [tag, setTag] = useState('');
    const [maxMembers, setMaxMembers] = useState<2 | 4>(2);
    const [country, setCountry] = useState(user.country || 'NL');
    const [joinCode, setJoinCode] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        if (!name.trim()) {
            setErrorMsg('Squad name is required.');
            return;
        }
        if (!tag.trim()) {
            setErrorMsg('Squad Tag is required (3-8 letters/numbers).');
            return;
        }

        const newSquad = createSquad(user, name, tag, maxMembers, country);
        onSquadUpdated(newSquad);
        onClose();
    };

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        if (!joinCode.trim()) {
            setErrorMsg('Please enter a 6-digit Squad Join Code.');
            return;
        }

        const result = joinSquadByCode(user, joinCode);
        if (result.success && result.squad) {
            onSquadUpdated(result.squad);
            onClose();
        } else {
            setErrorMsg(result.error || 'Failed to join squad.');
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-md bg-gray-950 border border-lime/40 rounded-3xl p-6 relative shadow-[0_0_50px_rgba(50,255,50,0.15)] max-h-[90vh] overflow-y-auto no-scrollbar"
                >
                    <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-lime/10 border border-lime/30 flex items-center justify-center text-lime">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-black uppercase text-white tracking-wide">
                                    Gym Squad Hub
                                </h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    2 to 4 Lifters · Global & National
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-white rounded-xl bg-gray-900 border border-gray-800 transition"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Mode Switcher */}
                    <div className="flex bg-gray-900/80 p-1 rounded-2xl my-5 border border-gray-800 gap-1">
                        <button
                            type="button"
                            onClick={() => { setMode('create'); setErrorMsg(''); }}
                            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                                mode === 'create'
                                    ? 'bg-lime text-oled shadow-[0_0_12px_rgba(50,255,50,0.3)]'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Sparkles size={12} className="inline mr-1" /> Form Squad
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode('join'); setErrorMsg(''); }}
                            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                                mode === 'join'
                                    ? 'bg-lime text-oled shadow-[0_0_12px_rgba(50,255,50,0.3)]'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <KeyRound size={12} className="inline mr-1" /> Enter Code
                        </button>
                    </div>

                    {errorMsg && (
                        <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-xs font-bold">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {mode === 'create' ? (
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1.5">
                                    Squad Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Dutch Iron Syndicate"
                                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime"
                                    maxLength={32}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1.5">
                                        Squad Tag (3-8 Chars)
                                    </label>
                                    <input
                                        type="text"
                                        value={tag}
                                        onChange={(e) => setTag(e.target.value.toUpperCase())}
                                        placeholder="NL-TITAN"
                                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-lime font-mono font-bold text-sm focus:outline-none focus:border-lime uppercase"
                                        maxLength={8}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1.5">
                                        Home Region
                                    </label>
                                    <select
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-lime"
                                    >
                                        <option value="NL">🇳🇱 Netherlands</option>
                                        <option value="GLOBAL">🌐 Global / Cross-Border</option>
                                        <option value="ID">🇮🇩 Indonesia / Bali</option>
                                        <option value="US">🇺🇸 United States</option>
                                        <option value="GB">🇬🇧 United Kingdom</option>
                                        <option value="DE">🇩🇪 Germany</option>
                                        <option value="AU">🇦🇺 Australia</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1.5">
                                    Roster Format
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setMaxMembers(2)}
                                        className={`py-3 px-3 rounded-xl border text-xs font-black uppercase flex flex-col items-center gap-1 transition ${
                                            maxMembers === 2
                                                ? 'bg-lime/10 border-lime text-lime shadow-sm'
                                                : 'bg-gray-900 border-gray-800 text-gray-400'
                                        }`}
                                    >
                                        <Users size={16} />
                                        <span>Duo (2 Lifters)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMaxMembers(4)}
                                        className={`py-3 px-3 rounded-xl border text-xs font-black uppercase flex flex-col items-center gap-1 transition ${
                                            maxMembers === 4
                                                ? 'bg-lime/10 border-lime text-lime shadow-sm'
                                                : 'bg-gray-900 border-gray-800 text-gray-400'
                                        }`}
                                    >
                                        <Shield size={16} />
                                        <span>Full Squad (4 Lifters)</span>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full py-4 rounded-2xl bg-lime text-oled font-black text-sm uppercase tracking-wider hover:bg-lime/90 active:scale-[0.98] transition shadow-[0_0_20px_rgba(50,255,50,0.3)]"
                                >
                                    Forge Squad & Generate Join Code
                                </button>
                                <p className="text-[10px] text-gray-500 text-center mt-2">
                                    Your gym bro can join from any city or country using your 6-digit code.
                                </p>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleJoin} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1.5">
                                    Enter 6-Digit Join Code
                                </label>
                                <input
                                    type="text"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. AMS777"
                                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-4 text-center font-mono font-black text-2xl tracking-[0.3em] text-lime focus:outline-none focus:border-lime uppercase"
                                    maxLength={6}
                                />
                                <p className="text-[11px] text-gray-400 mt-2 text-center">
                                    Ask your gym bro for their Squad Code (found in their Squad Card).
                                </p>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full py-4 rounded-2xl bg-lime text-oled font-black text-sm uppercase tracking-wider hover:bg-lime/90 active:scale-[0.98] transition shadow-[0_0_20px_rgba(50,255,50,0.3)]"
                                >
                                    Join Squad & Link Lifts
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
