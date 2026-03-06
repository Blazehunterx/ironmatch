import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types/database';
import { Check, X, ExternalLink, ShieldAlert, Award, ArrowLeft, MapPin, TrendingUp, Users, Activity, Trophy, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Admin() {
    const { user: currentUser, updateUser } = useAuth();
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [ownedGym, setOwnedGym] = useState<any>(null);
    const [gymStats, setGymStats] = useState({ members: 0, activeToday: 0, totalWorkouts: 0, warRank: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isSupabaseConfigured) {
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);

            // Fetch admin requests
            if (currentUser?.is_admin) {
                const { data: requests } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('verification_status', 'pending');

                if (requests) {
                    const users = requests.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        email: p.email,
                        verification_status: p.verification_status,
                        trainer_license_url: p.trainer_license_url,
                        profile_image_url: p.profile_image_url,
                    })) as User[];
                    setPendingUsers(users);
                }
            }

            // Fetch gym ownership data if user owns a gym
            const { data: gym } = await supabase
                .from('gyms')
                .select('*')
                .eq('owner_id', currentUser?.id)
                .single();

            if (gym) {
                setOwnedGym(gym);
                // Simulated real-time stats for the gym
                setGymStats({
                    members: 142 + Math.floor(Math.random() * 20),
                    activeToday: 12 + Math.floor(Math.random() * 5),
                    totalWorkouts: 2450 + Math.floor(Math.random() * 100),
                    warRank: 4
                });
            }

            setIsLoading(false);
        };

        fetchData();
    }, [currentUser]);

    const handleVerify = async (userId: string, status: 'verified' | 'none', claimData?: { type: 'trainer' | 'gym', gymId?: string }) => {
        if (!isSupabaseConfigured) return;

        const profileUpdate: any = { verification_status: status };

        if (status === 'verified' && claimData?.type === 'gym' && claimData.gymId) {
            const { error: gymError } = await supabase
                .from('gyms')
                .update({ owner_id: userId, is_verified_gym: true })
                .eq('id', claimData.gymId);

            if (gymError) alert('Warning: Gym ownership update failed.');
        }

        const { error } = await supabase
            .from('profiles')
            .update(profileUpdate)
            .eq('id', userId);

        if (!error) {
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
            if (userId === currentUser?.id) updateUser({ verification_status: status });
        }
    };

    if (!currentUser?.is_admin && !ownedGym) {
        return (
            <div className="min-h-screen bg-oled flex flex-col items-center justify-center p-6 text-center">
                <ShieldAlert size={64} className="text-red-500 mb-4" />
                <h1 className="text-2xl font-black text-white mb-2">ACCESS DENIED</h1>
                <p className="text-gray-500 max-w-xs">You do not have administrative or gym ownership privileges.</p>
                <button onClick={() => window.location.href = '/'} className="mt-8 px-6 py-3 bg-gray-800 text-white rounded-xl font-bold">Return Home</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-oled pb-24">
            <header className="sticky top-0 z-50 p-6 bg-oled/90 backdrop-blur-md border-b border-gray-900 flex items-center gap-4">
                <button onClick={() => window.location.href = '/profile'} className="p-2 bg-gray-800 rounded-xl text-gray-400">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-black text-white">{currentUser?.is_admin ? 'Master Control' : 'Gym Dashboard'}</h1>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">IronMatch Analytics Engine</p>
                </div>
            </header>

            <main className="p-6 max-w-md mx-auto space-y-8">
                {/* Gym Owner ROI Section */}
                {ownedGym && (
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
                )}

                {/* Admin Requests Section */}
                {currentUser?.is_admin && (
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">Verification Queue</h2>
                            <span className="bg-purple-500/20 text-purple-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-purple-500/20">
                                {pendingUsers.length} REQUESTS
                            </span>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                                <div className="w-8 h-8 border-2 border-lime/30 border-t-lime rounded-full animate-spin mb-4" />
                                <p className="text-xs text-gray-500">Loading requests...</p>
                            </div>
                        ) : pendingUsers.length === 0 ? (
                            <div className="text-center py-10 bg-gray-900/30 border border-dashed border-gray-800 rounded-3xl">
                                <p className="text-sm font-bold text-gray-600">Queue Clear!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {pendingUsers.map(u => (
                                        <motion.div
                                            key={u.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-gray-900 border border-gray-800 rounded-2xl p-4"
                                        >
                                            <div className="flex items-center gap-4 mb-4">
                                                <img src={u.profile_image_url} alt={u.name} className="w-10 h-10 rounded-xl object-cover" />
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-bold text-white truncate text-sm">{u.name}</h3>
                                                    <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                                                </div>
                                                <div className="p-2 bg-lime/10 rounded-lg">
                                                    {u.trainer_license_url?.startsWith('GYM_CLAIM:') ? <MapPin size={16} className="text-lime" /> : <Award size={16} className="text-lime" />}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => handleVerify(u.id, 'none')}
                                                    className="py-2.5 rounded-xl bg-red-400/10 text-red-400 text-[10px] font-black"
                                                >REJECT</button>
                                                <button
                                                    onClick={() => {
                                                        const isGym = u.trainer_license_url?.startsWith('GYM_CLAIM:');
                                                        const gymId = isGym ? u.trainer_license_url?.split(':')[1].split(' - ')[0] : undefined;
                                                        handleVerify(u.id, 'verified', { type: isGym ? 'gym' : 'trainer', gymId });
                                                    }}
                                                    className="py-2.5 rounded-xl bg-lime text-oled text-[10px] font-black"
                                                >APPROVE</button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}
