import { Users, Activity, TrendingUp, Trophy, Zap, Award } from 'lucide-react';

interface GymOwnerDashboardProps {
    gymStats: { members: number; activeToday: number; totalWorkouts: number; warRank: number };
}

export default function GymOwnerDashboard({ gymStats }: GymOwnerDashboardProps) {
    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Your Business ROI</h2>
                <span className="bg-lime/10 text-lime text-[10px] font-black px-2 py-0.5 rounded-full border border-lime/20">VERIFIED GYM OWNER</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
                    <Users size={20} className="text-blue-400 mb-2" />
                    <p className="text-2xl font-black text-white">{gymStats.members}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Members</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
                    <Activity size={20} className="text-lime mb-2" />
                    <p className="text-2xl font-black text-white">{gymStats.activeToday}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Today</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
                    <TrendingUp size={20} className="text-purple-400 mb-2" />
                    <p className="text-2xl font-black text-white">{gymStats.totalWorkouts}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Workouts Logged</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
                    <Trophy size={20} className="text-yellow-500 mb-2" />
                    <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-black text-white">#{gymStats.warRank}</p>
                        <p className="text-[10px] text-gray-500 font-bold">in City</p>
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">War Ranking</p>
                </div>
            </div>

            {/* Recent Activity Mini-Feed */}
            <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Live Gym Feed</h3>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Real-time</span>
                    </div>
                </div>
                <div className="divide-y divide-gray-800 mb-2">
                    <div className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Zap size={14} /></div>
                        <div className="flex-1">
                            <p className="text-xs text-white font-bold">New Member Joined</p>
                            <p className="text-[10px] text-gray-500">Alex just set this as Home Gym</p>
                        </div>
                        <span className="text-[9px] text-gray-600 font-bold">2m ago</span>
                    </div>
                    <div className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-lime/10 rounded-lg text-lime"><Award size={14} /></div>
                        <div className="flex-1">
                            <p className="text-xs text-white font-bold">PR Logged!</p>
                            <p className="text-[10px] text-gray-500">Sarah hit 225lbs Bench Press</p>
                        </div>
                        <span className="text-[9px] text-gray-600 font-bold">15m ago</span>
                    </div>
                </div>
                <button className="w-full py-3 text-[10px] font-black text-gray-500 uppercase hover:bg-gray-800 transition-colors">See Detailed Analytics</button>
            </div>
        </section>
    );
}
