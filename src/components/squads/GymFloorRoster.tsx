import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Radio, UserPlus, Check, MessageSquare } from 'lucide-react';
import { User, SpotBeacon, GymSquad } from '../../types/database';
import { getActiveBeacons, broadcastSpotBeacon, dismissBeacon } from '../../lib/squads';
import { TierBadge, rankFor } from '../profile/RankBadge';

interface GymFloorRosterProps {
    currentUser: User;
    gymLifters: User[];
    gymName: string;
    gymId: string;
    userSquad: GymSquad | null;
    onInviteToSquad?: (targetUser: User) => void;
    onOpenChat?: (targetUser: User) => void;
}

export default function GymFloorRoster({
    currentUser,
    gymLifters,
    gymName,
    gymId,
    userSquad,
    onInviteToSquad,
    onOpenChat
}: GymFloorRosterProps) {
    const [beacons, setBeacons] = useState<SpotBeacon[]>(() => getActiveBeacons());
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [spotExercise, setSpotExercise] = useState('Barbell Bench Press');
    const [spotWeight, setSpotWeight] = useState(currentUser.big4?.bench || 100);
    const [spotType, setSpotType] = useState<'need_spot' | 'working_in' | 'squad_recruit'>('need_spot');
    const [invitedUsers, setInvitedUsers] = useState<string[]>([]);

    const activeUserBeacon = beacons.find(b => b.user_id === currentUser.id);

    const handleBroadcast = (e: React.FormEvent) => {
        e.preventDefault();
        const newBeacon: SpotBeacon = {
            id: `beacon-${Date.now()}`,
            user_id: currentUser.id,
            user_name: currentUser.name,
            avatar_url: currentUser.profile_image_url || 'https://i.pravatar.cc/100',
            gym_id: gymId,
            gym_name: gymName,
            exercise: spotExercise,
            current_weight: spotWeight,
            unit: currentUser.unit_preference || 'kg',
            status: spotType,
            squad_tag: userSquad?.tag,
            created_at: new Date().toISOString()
        };

        broadcastSpotBeacon(newBeacon);
        setBeacons(getActiveBeacons());
        setIsBroadcasting(false);
    };

    const handleDismissBeacon = () => {
        if (activeUserBeacon) {
            dismissBeacon(activeUserBeacon.id);
            setBeacons(getActiveBeacons());
        }
    };

    const handleInvite = (u: User) => {
        setInvitedUsers(prev => [...prev, u.id]);
        if (onInviteToSquad) onInviteToSquad(u);
    };

    const filteredLifters = gymLifters;

    return (
        <div className="space-y-4">
            {/* SPOTTER BEACON RADAR */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-lime/10 via-gray-950 to-oled border border-lime/40 shadow-[0_0_30px_rgba(50,255,50,0.1)] relative">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-lime" />
                        </span>
                        <h4 className="text-xs font-black uppercase text-white tracking-wider">
                            Live Gym Floor Radar
                        </h4>
                    </div>

                    {activeUserBeacon ? (
                        <button
                            onClick={handleDismissBeacon}
                            className="px-2.5 py-1 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-wider hover:bg-red-500/20 transition"
                        >
                            Cancel Beacon
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsBroadcasting(true)}
                            className="px-3 py-1.5 rounded-xl bg-lime text-oled text-[10px] font-black uppercase tracking-wider hover:bg-lime/90 active:scale-95 transition shadow-[0_0_12px_rgba(50,255,50,0.3)] flex items-center gap-1"
                        >
                            <Radio size={12} /> Broadcast Beacon
                        </button>
                    )}
                </div>

                {/* Active Beacons List */}
                {beacons.length > 0 ? (
                    <div className="space-y-2">
                        {beacons.map(b => (
                            <div
                                key={b.id}
                                className="p-2.5 rounded-2xl bg-black/70 border border-lime/20 flex items-center justify-between gap-2"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-xl overflow-hidden bg-gray-800 border border-lime/40 shrink-0">
                                        <img src={b.avatar_url} alt={b.user_name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <span className="text-xs font-black text-white truncate">{b.user_name}</span>
                                            {b.squad_tag && (
                                                <span className="text-[8px] font-mono font-bold px-1 rounded bg-lime/20 text-lime">
                                                    [{b.squad_tag}]
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-300 truncate">
                                            {b.exercise} · <span className="text-lime font-mono font-bold">{b.current_weight}{b.unit}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="shrink-0">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                        b.status === 'need_spot'
                                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 animate-pulse'
                                            : 'bg-teal-500/20 text-teal-400 border border-teal-500/40'
                                    }`}>
                                        {b.status === 'need_spot' ? 'Needs Spot 🔥' : 'Working In'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 py-1">
                        Floor is quiet. Broadcast a beacon to let fellow lifters know you are going heavy.
                    </p>
                )}
            </div>

            {/* BROADCAST MODAL */}
            <AnimatePresence>
                {isBroadcasting && (
                    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-sm bg-gray-950 border border-lime/40 rounded-3xl p-5 space-y-4"
                        >
                            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                                <h3 className="text-sm font-black uppercase text-white">Broadcast to Gym Floor</h3>
                                <button onClick={() => setIsBroadcasting(false)} className="text-gray-400 hover:text-white text-xs font-bold">Close</button>
                            </div>

                            <form onSubmit={handleBroadcast} className="space-y-3">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Exercise</label>
                                    <select
                                        value={spotExercise}
                                        onChange={e => setSpotExercise(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:border-lime"
                                    >
                                        <option value="Barbell Bench Press">Barbell Bench Press</option>
                                        <option value="Barbell Back Squat">Barbell Back Squat</option>
                                        <option value="Barbell Incline Bench">Barbell Incline Bench</option>
                                        <option value="Overhead Press">Overhead Press</option>
                                        <option value="Heavy Dumbbell Press">Heavy Dumbbell Press</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Working Weight ({currentUser.unit_preference || 'kg'})</label>
                                        <input
                                            type="number"
                                            value={spotWeight}
                                            onChange={e => setSpotWeight(Number(e.target.value))}
                                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-lime font-mono font-bold text-sm focus:border-lime"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Beacon Signal</label>
                                        <select
                                            value={spotType}
                                            onChange={e => setSpotType(e.target.value as any)}
                                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-lime"
                                        >
                                            <option value="need_spot">Need Spotter</option>
                                            <option value="working_in">Open to Work-In</option>
                                            <option value="squad_recruit">Recruiting Squad</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-2xl bg-lime text-oled font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(50,255,50,0.3)] mt-2"
                                >
                                    Ping Gym Floor ⚡
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* GYM FLOOR ROSTER LIST */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                        {gymName} Floor Roster ({filteredLifters.length} Lifters)
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">
                        Objective Strength Ratios
                    </span>
                </div>

                {filteredLifters.length === 0 ? (
                    <div className="p-8 text-center bg-gray-950 rounded-3xl border border-dashed border-gray-800">
                        <Users size={32} className="text-gray-700 mx-auto mb-2" />
                        <h4 className="text-xs font-bold text-white mb-1">No other lifters on the roster yet</h4>
                        <p className="text-[10px] text-gray-500 max-w-xs mx-auto">
                            Invite your gym bro with your Squad code to start representing your facility.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredLifters.map((u) => {
                            const rawSbd = u.big4 ? ((u.big4.bench || 0) + (u.big4.squat || 0) + (u.big4.deadlift || 0)) : 320;
                            const isStoredLbs = u.unit_preference === 'lbs' || rawSbd > 850;
                            const totalKg = isStoredLbs ? Math.round(rawSbd / 2.20462) : rawSbd;
                            const bwKg = u.weight_kg && u.weight_kg > 35 ? u.weight_kg : 80;
                            const bwMultiple = Math.min(9.9, totalKg / bwKg).toFixed(1);
                            const rank = rankFor(totalKg);
                            const hasBeenInvited = invitedUsers.includes(u.id);

                            return (
                                <div
                                    key={u.id}
                                    className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800/90 flex items-center justify-between gap-3 hover:border-gray-700 transition"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-800 border border-gray-700 shrink-0">
                                            <img
                                                src={u.profile_image_url || 'https://i.pravatar.cc/100'}
                                                alt={u.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <span className="text-xs font-black text-white truncate">{u.name}</span>
                                                <TierBadge tier={rank.tier} size="sm" />
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-lime font-mono font-bold">
                                                    {bwMultiple}× BW
                                                </span>
                                                <span className="text-[9px] text-gray-500">
                                                    Total: {totalKg}kg
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {userSquad && userSquad.members.length < userSquad.max_members ? (
                                            <button
                                                onClick={() => handleInvite(u)}
                                                disabled={hasBeenInvited}
                                                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition ${
                                                    hasBeenInvited
                                                        ? 'bg-gray-800 text-gray-400'
                                                        : 'bg-lime/10 border border-lime/30 text-lime hover:bg-lime/20'
                                                }`}
                                            >
                                                {hasBeenInvited ? <Check size={11} /> : <UserPlus size={11} />}
                                                <span>{hasBeenInvited ? 'Invited' : 'Squad+'}</span>
                                            </button>
                                        ) : null}

                                        {onOpenChat && (
                                            <button
                                                onClick={() => onOpenChat(u)}
                                                className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition active:scale-95"
                                                title="Direct Message"
                                            >
                                                <MessageSquare size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
