import { useState } from 'react';
import { Shield, Copy, Check, Users, LogOut, Share2, Link as LinkIcon } from 'lucide-react';
import { GymSquad, User } from '../../types/database';
import { generateSquadInviteUrl, generateWhatsAppInviteText } from '../../lib/squads';

interface SquadCardProps {
    squad: GymSquad;
    currentUser?: User;
    onLeaveSquad: () => void;
}

export default function SquadCard({ squad, onLeaveSquad }: SquadCardProps) {
    const [copied, setCopied] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(squad.join_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyLink = () => {
        const link = generateSquadInviteUrl(squad);
        navigator.clipboard.writeText(link);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleShareWhatsApp = () => {
        const text = generateWhatsAppInviteText(squad);
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const countryFlag = squad.primary_country === 'NL' ? '🇳🇱'
        : squad.primary_country === 'ID' ? '🇮🇩'
        : squad.primary_country === 'US' ? '🇺🇸'
        : squad.primary_country === 'GB' ? '🇬🇧'
        : squad.primary_country === 'DE' ? '🇩🇪'
        : '🌐';

    return (
        <div className="bg-gradient-to-br from-gray-950 via-oled to-black border border-lime/30 rounded-3xl p-5 shadow-[0_0_30px_rgba(50,255,50,0.1)] relative overflow-hidden">
            {/* Top Bar: Squad Name & Join Code */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-lime/10 border border-lime/40 flex items-center justify-center text-lime font-black shrink-0 shadow-[0_0_15px_rgba(50,255,50,0.2)]">
                        <Shield size={24} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-base">{countryFlag}</span>
                            <h3 className="text-sm font-black uppercase text-white truncate tracking-wide">
                                {squad.name}
                            </h3>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-lime/20 text-lime border border-lime/40">
                                [{squad.tag}]
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                            {squad.max_members === 2 ? 'Ranked Duo' : '4-Man Squad'} · {squad.members.length}/{squad.max_members} Lifters
                        </p>
                    </div>
                </div>

                {/* Score & Tier */}
                <div className="text-right shrink-0">
                    <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider block">Combined BW</span>
                    <span className="text-lg font-black text-lime font-mono italic">
                        {squad.total_score.toFixed(1)}×
                    </span>
                </div>
            </div>

            {/* Invite Code Pill */}
            <div className="mb-4 p-3 bg-gray-900/90 rounded-2xl border border-gray-800 flex items-center justify-between gap-2">
                <div>
                    <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">
                        Squad Invite Code
                    </span>
                    <span className="font-mono font-black text-white text-base tracking-[0.2em] text-lime">
                        {squad.join_code}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                        onClick={handleCopyLink}
                        className="px-2.5 py-1.5 rounded-xl bg-lime/10 border border-lime/30 hover:bg-lime/20 text-xs font-bold text-lime flex items-center gap-1 active:scale-95 transition"
                        title="Copy 1-Click Join Link"
                    >
                        {copiedLink ? <Check size={13} className="text-lime" /> : <LinkIcon size={13} />}
                        <span>{copiedLink ? 'Link Copied!' : '1-Click Link'}</span>
                    </button>
                    <button
                        onClick={handleCopyCode}
                        className="px-2.5 py-1.5 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 text-xs font-bold text-gray-200 flex items-center gap-1 active:scale-95 transition"
                    >
                        {copied ? <Check size={13} className="text-lime" /> : <Copy size={13} />}
                        <span>{copied ? 'Code Copied' : 'Code'}</span>
                    </button>
                    <button
                        onClick={handleShareWhatsApp}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 transition active:scale-95 flex items-center gap-1 text-xs font-bold"
                        title="Share on WhatsApp"
                    >
                        <Share2 size={13} />
                        <span>WhatsApp</span>
                    </button>
                </div>
            </div>

            {/* Member Roster Slots */}
            <div className="space-y-2 mb-4">
                <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider block">
                    Squad Roster
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {squad.members.map((member) => (
                        <div
                            key={member.user_id}
                            className="p-2.5 rounded-2xl bg-gray-900/60 border border-gray-800/80 flex items-center justify-between gap-2"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded-xl overflow-hidden bg-gray-800 border border-gray-700 shrink-0">
                                    <img
                                        src={member.avatar_url || 'https://i.pravatar.cc/100'}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1 truncate">
                                        <span className="text-[10px]">{member.country === 'NL' ? '🇳🇱' : member.country === 'ID' ? '🇮🇩' : member.country === 'US' ? '🇺🇸' : member.country === 'GB' ? '🇬🇧' : '🌐'}</span>
                                        <span className="text-xs font-bold text-white truncate">
                                            {member.name}
                                        </span>
                                        {member.role === 'captain' && (
                                            <span className="text-[8px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 px-1 rounded font-black">CPT</span>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-gray-500 truncate">
                                        {member.gym_name || 'Home Gym'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-xs font-black text-lime font-mono">
                                    {member.bw_multiplier.toFixed(1)}× BW
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Open Empty Slots */}
                    {Array.from({ length: squad.max_members - squad.members.length }).map((_, i) => (
                        <div
                            key={i}
                            className="p-2.5 rounded-2xl border border-dashed border-gray-800 flex items-center justify-center gap-2 bg-black/40 text-gray-600 text-xs font-bold"
                        >
                            <Users size={14} />
                            <span>Slot Open · Send Code</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Leave / Disband */}
            <div className="pt-2 border-t border-gray-900 flex justify-end">
                <button
                    onClick={onLeaveSquad}
                    className="text-[10px] font-black uppercase tracking-wider text-red-500/80 hover:text-red-400 flex items-center gap-1 transition"
                >
                    <LogOut size={12} /> Leave Squad
                </button>
            </div>
        </div>
    );
}
