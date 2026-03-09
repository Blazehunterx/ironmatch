
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Target, Star, ChevronRight, Info } from 'lucide-react';
import { User, Bounty } from '../types/database';

interface TalentDashboardProps {
    user: User;
}

export default function TalentDashboard({ user }: TalentDashboardProps) {
    // Mock metrics for prototype
    const metrics = {
        totalSpots: (user.followers_count || 0) * 12,
        engagementRate: '4.8%',
        influenceScore: 84,
        activeBounties: 3
    };

    const bounties: Bounty[] = [
        {
            id: 'b1',
            title: 'Founding Spirit',
            description: 'Post a video welcome message for the new gym community.',
            reward_xp: 500,
            requirement_type: 'post_video',
            status: 'available'
        },
        {
            id: 'b2',
            title: 'Technical Mentor',
            description: 'Help 3 newbies with their Squat form in the Shouts.',
            reward_xp: 300,
            requirement_type: 'help_newbie',
            status: 'available'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Influence Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[32px] p-6 border border-white/20 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-1">Impact Score</h3>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-black text-white italic">{metrics.influenceScore}</span>
                                <span className="text-xs font-bold text-indigo-300 mb-2">/ 100</span>
                            </div>
                        </div>
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                            <Star size={24} className="text-yellow-400 fill-yellow-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-black/20 rounded-2xl p-3 border border-white/5">
                            <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-wider mb-1">Total Spots</p>
                            <p className="text-lg font-black text-white">{metrics.totalSpots.toLocaleString()}</p>
                        </div>
                        <div className="bg-black/20 rounded-2xl p-3 border border-white/5">
                            <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-wider mb-1">Engagement</p>
                            <p className="text-lg font-black text-white">{metrics.engagementRate}</p>
                        </div>
                        <div className="bg-black/20 rounded-2xl p-3 border border-white/5">
                            <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-wider mb-1">Active Now</p>
                            <p className="text-lg font-black text-white">12</p>
                        </div>
                    </div>
                </div>
                <TrendingUp size={160} className="absolute -right-8 -bottom-8 text-white/5 rotate-12" />
            </div>

            {/* Bounties Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Target size={14} className="text-lime" /> Available Bounties
                    </h4>
                    <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black animate-pulse">NEW</span>
                </div>

                <div className="space-y-3">
                    {bounties.map(bounty => (
                        <motion.button
                            key={bounty.id}
                            whileHover={{ x: 4 }}
                            className="w-full text-left bg-gray-900/40 border border-white/5 rounded-[24px] p-4 flex items-center gap-4 group hover:border-lime/30 transition-all"
                        >
                            <div className="p-3 rounded-2xl bg-gray-800 text-lime group-hover:scale-110 transition-transform">
                                <Zap size={20} className="fill-current" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h5 className="text-sm font-black text-white italic uppercase tracking-tighter">{bounty.title}</h5>
                                    <span className="text-[10px] font-black text-lime">+{bounty.reward_xp} XP</span>
                                </div>
                                <p className="text-xs text-gray-500 font-medium leading-tight">{bounty.description}</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-700" />
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Next Milestone */}
            <div className="bg-gray-900/60 border border-white/5 rounded-[24px] p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-400/10 rounded-xl text-yellow-400">
                        <Star size={18} />
                    </div>
                    <div>
                        <h5 className="text-xs font-black text-white uppercase tracking-wider">Elite Partner Status</h5>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Progress to next tier</p>
                    </div>
                </div>

                <div className="h-2 bg-black rounded-full overflow-hidden mb-2">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '65%' }}
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
                    />
                </div>
                <div className="flex justify-between items-center text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    <span>650 / 1,000 XP</span>
                    <span>Level 4 Elite</span>
                </div>
            </div>

            {/* Pro Tip */}
            <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex gap-3">
                <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-100/60 leading-relaxed italic">
                    "Consistent high-quality content in the community feed increases your Influence Score and unlocks higher-tier bounty rewards."
                </p>
            </div>
        </div>
    );
}
