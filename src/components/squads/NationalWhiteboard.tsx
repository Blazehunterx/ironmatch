import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Globe, MapPin, Flag } from 'lucide-react';
import { getRankedSquads, getWhiteboardRecords } from '../../lib/squads';

interface NationalWhiteboardProps {
    userGymId?: string;
    userGymName?: string;
    userCountry?: string;
}

export default function NationalWhiteboard({
    userGymId,
    userGymName = 'Your Gym',
    userCountry = 'US'
}: NationalWhiteboardProps) {
    const [scope, setScope] = useState<'global' | 'national' | 'facility'>('global');
    const [selectedCountry, setSelectedCountry] = useState<string>(
        ['NL', 'US', 'GB', 'ID', 'DE'].includes(userCountry) ? userCountry : 'US'
    );

    const squads = useMemo(() => {
        return getRankedSquads(scope, selectedCountry, userGymId);
    }, [scope, selectedCountry, userGymId]);

    const records = useMemo(() => {
        return getWhiteboardRecords(scope, selectedCountry, userGymId);
    }, [scope, selectedCountry, userGymId]);

    const bestSquat = records.find(r => r.exercise === 'squat');
    const bestBench = records.find(r => r.exercise === 'bench');
    const bestDeadlift = records.find(r => r.exercise === 'deadlift');

    const countryLabel = selectedCountry === 'NL' ? '🇳🇱 Netherlands'
        : selectedCountry === 'US' ? '🇺🇸 United States'
        : selectedCountry === 'GB' ? '🇬🇧 United Kingdom'
        : selectedCountry === 'ID' ? '🇮🇩 Indonesia'
        : selectedCountry === 'DE' ? '🇩🇪 Germany'
        : '🌐 Global';

    return (
        <div className="space-y-4">
            {/* Header & Scope Filter */}
            <div className="bg-gray-950 border border-gray-800 rounded-3xl p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                        <Trophy size={18} className="text-yellow-400" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-white">
                            Iron Whiteboard & Ranked Squads
                        </h3>
                    </div>

                    {scope === 'national' && (
                        <select
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className="bg-gray-900 border border-gray-700 text-xs font-bold text-white rounded-xl px-2 py-1 focus:outline-none focus:border-lime"
                        >
                            <option value="NL">🇳🇱 Netherlands</option>
                            <option value="US">🇺🇸 USA</option>
                            <option value="GB">🇬🇧 UK</option>
                            <option value="ID">🇮🇩 Indonesia</option>
                            <option value="DE">🇩🇪 Germany</option>
                        </select>
                    )}
                </div>

                {/* Scope Toggle Pills */}
                <div className="grid grid-cols-3 gap-1.5 bg-gray-900/90 p-1 rounded-2xl border border-gray-800">
                    <button
                        onClick={() => setScope('global')}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition ${
                            scope === 'global'
                                ? 'bg-lime text-oled shadow-sm'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Globe size={11} /> Global
                    </button>
                    <button
                        onClick={() => setScope('national')}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition ${
                            scope === 'national'
                                ? 'bg-lime text-oled shadow-sm'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Flag size={11} /> National
                    </button>
                    <button
                        onClick={() => setScope('facility')}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition ${
                            scope === 'facility'
                                ? 'bg-lime text-oled shadow-sm'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <MapPin size={11} /> Facility
                    </button>
                </div>
            </div>

            {/* WHITEBOARD BENCHMARKS (Squat, Bench, Deadlift) */}
            <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-2 px-1">
                    {scope === 'global' ? 'Global Hall of Fame' : scope === 'national' ? `${countryLabel} Record Lifts` : `${userGymName} Whiteboard`}
                </span>

                <div className="grid grid-cols-3 gap-2">
                    {/* Best Squat */}
                    <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800/80 flex flex-col justify-between">
                        <div>
                            <span className="text-[8px] font-black uppercase tracking-wider text-teal-400 block mb-1">
                                Top Squat
                            </span>
                            <span className="text-lg font-black text-white font-mono leading-tight">
                                {bestSquat ? `${bestSquat.weight_kg}kg` : '200kg'}
                            </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-900">
                            <p className="text-[9px] font-bold text-gray-300 truncate">
                                {bestSquat ? bestSquat.lifter_name : 'Target'}
                            </p>
                            <span className="text-[8px] text-gray-500 truncate block">
                                {bestSquat?.squad_tag ? `[${bestSquat.squad_tag}]` : userGymName}
                            </span>
                        </div>
                    </div>

                    {/* Best Bench */}
                    <div className="p-3 rounded-2xl bg-gray-950 border border-lime/30 flex flex-col justify-between shadow-[0_0_15px_rgba(50,255,50,0.08)]">
                        <div>
                            <span className="text-[8px] font-black uppercase tracking-wider text-lime block mb-1">
                                Top Bench
                            </span>
                            <span className="text-lg font-black text-lime font-mono leading-tight">
                                {bestBench ? `${bestBench.weight_kg}kg` : '140kg'}
                            </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-900">
                            <p className="text-[9px] font-bold text-white truncate">
                                {bestBench ? bestBench.lifter_name : 'Target'}
                            </p>
                            <span className="text-[8px] text-gray-400 truncate block">
                                {bestBench?.squad_tag ? `[${bestBench.squad_tag}]` : userGymName}
                            </span>
                        </div>
                    </div>

                    {/* Best Deadlift */}
                    <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800/80 flex flex-col justify-between">
                        <div>
                            <span className="text-[8px] font-black uppercase tracking-wider text-yellow-400 block mb-1">
                                Top Deadlift
                            </span>
                            <span className="text-lg font-black text-white font-mono leading-tight">
                                {bestDeadlift ? `${bestDeadlift.weight_kg}kg` : '240kg'}
                            </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-900">
                            <p className="text-[9px] font-bold text-gray-300 truncate">
                                {bestDeadlift ? bestDeadlift.lifter_name : 'Target'}
                            </p>
                            <span className="text-[8px] text-gray-500 truncate block">
                                {bestDeadlift?.squad_tag ? `[${bestDeadlift.squad_tag}]` : userGymName}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RANKED SQUADS LEADERBOARD */}
            <div>
                <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                        {scope === 'global' ? 'Global Squad Ranked' : scope === 'national' ? `${countryLabel} Ranked Squads` : 'Facility Squads'}
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">
                        Ranked by Combined BW Ratio
                    </span>
                </div>

                <div className="space-y-2">
                    {squads.map((sq, idx) => {
                        const rankNumber = idx + 1;
                        const rankColor = rankNumber === 1 ? 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10'
                            : rankNumber === 2 ? 'text-gray-300 border-gray-400/40 bg-gray-400/10'
                            : rankNumber === 3 ? 'text-amber-500 border-amber-500/40 bg-amber-500/10'
                            : 'text-gray-500 border-gray-800 bg-gray-900/50';

                        return (
                            <motion.div
                                key={sq.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-3 rounded-2xl bg-gray-950 border border-gray-800/90 flex items-center justify-between gap-3 hover:border-gray-700 transition"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-black text-xs font-mono shrink-0 ${rankColor}`}>
                                        #{rankNumber}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-xs">
                                                {sq.primary_country === 'NL' ? '🇳🇱' : sq.primary_country === 'US' ? '🇺🇸' : sq.primary_country === 'GB' ? '🇬🇧' : sq.primary_country === 'ID' ? '🇮🇩' : '🌐'}
                                            </span>
                                            <h4 className="text-xs font-black text-white uppercase truncate">
                                                {sq.name}
                                            </h4>
                                            <span className="text-[8px] font-mono font-bold px-1.5 rounded bg-lime/10 text-lime border border-lime/30">
                                                [{sq.tag}]
                                            </span>
                                        </div>

                                        {/* Member Avatars Stack */}
                                        <div className="flex items-center gap-1 mt-1">
                                            <div className="flex -space-x-1.5 overflow-hidden">
                                                {sq.members.map(m => (
                                                    <img
                                                        key={m.user_id}
                                                        src={m.avatar_url || 'https://i.pravatar.cc/100'}
                                                        alt={m.name}
                                                        className="inline-block h-4 w-4 rounded-full ring-1 ring-black object-cover"
                                                        title={`${m.name} (${m.bw_multiplier.toFixed(1)}x BW)`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[9px] text-gray-500 ml-1">
                                                {sq.members.length}/{sq.max_members} lifters
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <span className="text-sm font-black text-lime font-mono italic block">
                                        {sq.total_score.toFixed(1)}× BW
                                    </span>
                                    <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">
                                        {sq.rank_tier} Tier
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
