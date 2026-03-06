import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, Zap, TrendingUp, Clock, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Gym, GymWar } from '../types/database';

interface GymWarArenaProps {
    war: GymWar;
    gym1: Gym;
    gym2: Gym;
    onClose?: () => void;
}

export default function GymWarArena({ war, gym1, gym2 }: GymWarArenaProps) {
    const [stats, setStats] = useState<{ gym1_score: number; gym2_score: number }>({ gym1_score: 0, gym2_score: 0 });
    const [recentLogs, setRecentLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchWarStats() {
            // Fetch volume from activity_logs for both gyms since war started
            const startTime = war.start_date || war.created_at;

            const { data: logs } = await supabase
                .from('activity_logs')
                .select('*, profiles(name, profile_image_url)')
                .in('gym_id', [gym1.id, gym2.id])
                .gte('created_at', startTime)
                .order('created_at', { ascending: false });

            if (logs) {
                const gym1Score = logs.filter(l => l.gym_id === gym1.id).reduce((acc, curr) => acc + curr.value, 0);
                const gym2Score = logs.filter(l => l.gym_id === gym2.id).reduce((acc, curr) => acc + curr.value, 0);

                setStats({ gym1_score: gym1Score, gym2_score: gym2Score });
                setRecentLogs(logs.slice(0, 10));
            }
            setIsLoading(false);
        }

        fetchWarStats();
        // Subscribe to activity_logs for real-time updates
        const channel = supabase
            .channel('war-stats')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, () => {
                fetchWarStats();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [war, gym1.id, gym2.id]);

    const totalScore = stats.gym1_score + stats.gym2_score;
    const gym1Percent = totalScore === 0 ? 50 : (stats.gym1_score / totalScore) * 100;
    const gym2Percent = 100 - gym1Percent;

    return (
        <div className="flex flex-col h-full bg-oled text-white">
            {/* Battle Header */}
            <div className="relative h-48 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-red-600/20 to-oled z-0" />

                {/* Gym 1 */}
                <div className="flex-1 flex flex-col items-center z-10 p-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-red-500/30 flex items-center justify-center mb-2 overflow-hidden">
                        <MapPin size={32} className="text-red-500/50" />
                    </div>
                    <h3 className="text-xs font-black uppercase text-center truncate w-full">{gym1.name}</h3>
                    <p className="text-xl font-black text-white mt-1">{stats.gym1_score.toLocaleString()}</p>
                </div>

                {/* VS */}
                <div className="flex flex-col items-center justify-center z-10 px-2 pt-8">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="p-3 bg-red-600 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                    >
                        <Swords size={24} className="text-white" />
                    </motion.div>
                    <span className="text-[10px] font-black text-red-500 mt-2 tracking-[0.3em]">VS</span>
                </div>

                {/* Gym 2 */}
                <div className="flex-1 flex flex-col items-center z-10 p-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-blue-500/30 flex items-center justify-center mb-2 overflow-hidden">
                        <MapPin size={32} className="text-blue-500/50" />
                    </div>
                    <h3 className="text-xs font-black uppercase text-center truncate w-full">{gym2.name}</h3>
                    <p className="text-xl font-black text-white mt-1">{stats.gym2_score.toLocaleString()}</p>
                </div>

                {/* Tug of War Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-800 flex">
                    <motion.div
                        initial={{ width: '50%' }}
                        animate={{ width: `${gym1Percent}%` }}
                        className="h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                    />
                    <motion.div
                        initial={{ width: '50%' }}
                        animate={{ width: `${gym2Percent}%` }}
                        className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    />
                </div>
            </div>

            {/* Battle Info Card */}
            <div className="px-6 py-6 flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-600/10 rounded-xl">
                            <Zap className="text-red-500" size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Iron Harvest</h4>
                            <p className="text-[10px] text-gray-500">Most volume in 24 hours wins</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-full border border-gray-800">
                        <Clock size={12} className="text-lime" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">14H 22M LEFT</span>
                    </div>
                </div>

                {/* Live Feed */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <TrendingUp size={12} /> Real-time Contributions
                    </h5>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {isLoading ? (
                            <div className="animate-pulse space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-900/50 rounded-2xl border border-gray-800/50" />)}
                            </div>
                        ) : recentLogs.length === 0 ? (
                            <div className="text-center py-12 text-gray-600">
                                <p className="text-xs font-bold uppercase tracking-widest">No contributions yet</p>
                                <p className="text-[10px] mt-1">Get to the gym and lift for your community!</p>
                            </div>
                        ) : (
                            recentLogs.map((log, i) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`flex items-center gap-3 p-3 rounded-2xl border ${log.gym_id === gym1.id
                                        ? 'bg-red-500/5 border-red-500/10'
                                        : 'bg-blue-500/5 border-blue-500/10'
                                        }`}
                                >
                                    <div className="relative">
                                        <img src={log.profiles?.profile_image_url} alt="" className="w-8 h-8 rounded-full border border-gray-800 object-cover" />
                                        <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full ${log.gym_id === gym1.id ? 'bg-red-600' : 'bg-blue-600'}`}>
                                            <Zap size={8} className="text-white fill-current" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[11px] font-bold text-white truncate">{log.profiles?.name}</p>
                                            <p className="text-[10px] font-black text-white">+{Math.round(log.value).toLocaleString()}</p>
                                        </div>
                                        <p className="text-[9px] text-gray-500 truncate">{log.metadata?.plan_name || 'Workout'}</p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Gym Verification Note */}
                <div className="mt-6 p-4 bg-gray-900 rounded-2xl border border-gray-800 flex items-start gap-3">
                    <Shield className="text-lime shrink-0" size={16} />
                    <p className="text-[9px] text-gray-500 leading-relaxed font-medium">
                        Anti-Cheat Active: You must be within 200m of your gym to contribute to the war score. Verified GPS coordinates are required for all logs.
                    </p>
                </div>
            </div>
        </div>
    );
}

function MapPin({ size, className }: { size: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    );
}
