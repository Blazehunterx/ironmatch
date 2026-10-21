import React from 'react';
import { Flame, Target, Zap, Dumbbell, Trophy, Edit3 } from 'lucide-react';
import { User } from '../../types/database';
import { getBig4Total } from '../../lib/gamification';
import { rankFor, TierBadge } from './RankBadge';

interface ProfileStatsProps {
    user: User;
    onEditLifts?: () => void;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ user, onEditLifts }) => {
    const unit = user.unit_preference || 'kg';
    const big4 = user.big4 || { bench: 0, squat: 0, deadlift: 0, ohp: 0 };
    const total = getBig4Total(big4);
    const totalKg = unit === 'lbs' ? Math.round(total / 2.20462) : total;
    const rankInfo = rankFor(totalKg);

    const bodyweight = user.weight_kg 
        ? (unit === 'lbs' ? Math.round(user.weight_kg * 2.20462) : user.weight_kg) 
        : 0;
    const strengthRatio = bodyweight > 0 && total > 0 ? (total / bodyweight).toFixed(1) : null;

    const lifts = [
        { name: 'Bench Press', key: 'bench', val: big4.bench, icon: Dumbbell, color: 'text-lime border-lime/30 bg-lime/5' },
        { name: 'Squat', key: 'squat', val: big4.squat, icon: Trophy, color: 'text-amber-400 border-amber-500/30 bg-amber-500/5' },
        { name: 'Deadlift', key: 'deadlift', val: big4.deadlift, icon: Flame, color: 'text-orange-400 border-orange-500/30 bg-orange-500/5' },
        { name: 'Overhead Press', key: 'ohp', val: big4.ohp, icon: Zap, color: 'text-purple-400 border-purple-500/30 bg-purple-500/5' }
    ];

    return (
        <div className="space-y-3.5 mb-6">
            {/* Top Stat Summary Pills */}
            <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-oled border border-gray-800 p-3.5 rounded-2xl text-center shadow-sm">
                    <Flame className="text-orange-500 mx-auto mb-1" size={18} />
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-wider">Streak</p>
                    <p className="text-lg font-black text-white">{user.reliability_streak || 0}d</p>
                </div>
                <div className="bg-oled border border-lime/30 p-3.5 rounded-2xl text-center shadow-[0_0_15px_rgba(50,255,50,0.08)]">
                    <Target className="text-lime mx-auto mb-1" size={18} />
                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Big 4 Total</p>
                    <p className="text-lg font-black text-lime font-mono">
                        {total} <span className="text-[10px] text-gray-500 font-normal">{unit}</span>
                    </p>
                    {strengthRatio && (
                        <p className="text-[9px] text-lime/80 font-black tracking-wide mt-0.5">
                            {strengthRatio}× BW
                        </p>
                    )}
                </div>
                <div className="bg-oled border border-gray-800 p-3.5 rounded-2xl text-center shadow-sm">
                    <Zap className="text-yellow-400 mx-auto mb-1" size={18} />
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-wider">Lifter XP</p>
                    <p className="text-lg font-black text-white font-mono">{user.xp || 0}</p>
                </div>
            </div>

            {/* Big 4 Compound Matrix Card */}
            <div className="bg-gray-950 border border-gray-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Dumbbell size={15} className="text-lime" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">
                            Personal Record Ledger
                        </h4>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-lime/10 border border-lime/30 text-lime text-[9px] font-black uppercase">
                            <TierBadge tier={rankInfo.tier} size="sm" isPro={user.is_pro} />
                            <span>{rankInfo.name}</span>
                        </div>
                    </div>
                    {onEditLifts && (
                        <button
                            type="button"
                            onClick={onEditLifts}
                            className="flex items-center gap-1 text-[10px] font-bold text-lime hover:text-white transition active:scale-95"
                        >
                            <Edit3 size={11} /> Calibrate
                        </button>
                    )}
                </div>

                {/* 4 Compound Lift Grid */}
                <div className="grid grid-cols-2 gap-2">
                    {lifts.map(l => {
                        const liftMultiplier = bodyweight > 0 && l.val > 0 
                            ? (l.val / bodyweight).toFixed(1) 
                            : null;

                        return (
                            <div
                                key={l.key}
                                onClick={onEditLifts}
                                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:border-lime/40 active:scale-[0.98] ${l.color}`}
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between pr-2">
                                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider truncate block">
                                            {l.name}
                                        </span>
                                        {liftMultiplier && (
                                            <span className="text-[8px] font-mono text-lime/90 font-black">
                                                {liftMultiplier}× BW
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-base font-black text-white font-mono mt-0.5 block">
                                        {l.val > 0 ? `${l.val}` : '--'}
                                        <span className="text-[9px] font-normal text-gray-500 ml-0.5">{unit}</span>
                                    </span>
                                </div>
                                <l.icon size={16} className="opacity-60 shrink-0" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProfileStats;
