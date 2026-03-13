import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types/database';
import { ShieldAlert, Zap, Loader2 } from 'lucide-react';

// Modular Components
import AdminHeader from '../components/admin/AdminHeader';
import GymOwnerDashboard from '../components/admin/GymOwnerDashboard';
import VerificationQueue from '../components/admin/VerificationQueue';

export default function Admin() {
    const { user: currentUser, updateUser } = useAuth();
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [ownedGym, setOwnedGym] = useState<any>(null);
    const [gymStats, setGymStats] = useState({ members: 0, activeToday: 0, totalWorkouts: 0, warRank: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [pulseStatus, setPulseStatus] = useState<{ loading: boolean; message: string; error?: string } | null>(null);

    const forcePulse = async () => {
        setPulseStatus({ loading: true, message: 'Initiating Imperial Pulse...' });
        try {
            const response = await fetch('https://wltdrodvrvwfhkmodgde.supabase.co/functions/v1/engagement-bot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Apex-Secret': 'IRONMATCH_INTERNAL_PULSE_2026'
                },
                body: JSON.stringify({})
            });

            const data = await response.json();
            if (response.ok) {
                setPulseStatus({ 
                    loading: false, 
                    message: `Success! Influencer ${data.influencer} posted: "${data.post.substring(0, 30)}..."`,
                    error: undefined 
                });
                setTimeout(() => setPulseStatus(null), 5000);
            } else {
                throw new Error(data.error || 'Pulse failed');
            }
        } catch (err: any) {
            setPulseStatus({ loading: false, message: 'Pulse Failed', error: err.message });
        }
    };

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
                        is_founding_trainer: p.is_founding_trainer
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

    const toggleFoundingStatus = async (userId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('profiles')
            .update({ is_founding_trainer: !currentStatus })
            .eq('id', userId);

        if (!error) {
            setPendingUsers(prev => prev.map(u => 
                u.id === userId ? { ...u, is_founding_trainer: !currentStatus } : u
            ));
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
            <AdminHeader 
                isAdmin={!!currentUser?.is_admin} 
                onBack={() => window.location.href = '/profile'} 
            />

            <main className="p-6 max-w-md mx-auto space-y-8">
                {ownedGym && (
                    <GymOwnerDashboard gymStats={gymStats} />
                )}

                {currentUser?.is_admin && (
                    <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-lime/10 rounded-xl flex items-center justify-center">
                                <Zap className="text-lime" size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm uppercase italic">Bot Diagnostics</h3>
                                <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Imperial Control</p>
                            </div>
                        </div>

                        <button
                            onClick={forcePulse}
                            disabled={pulseStatus?.loading}
                            className="w-full py-4 bg-lime text-oled rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-lime/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {pulseStatus?.loading ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
                            Force Influencer Pulse
                        </button>

                        {pulseStatus && (
                            <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest ${pulseStatus.error ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-lime/10 text-lime border border-lime/20'}`}>
                                {pulseStatus.error ? `Error: ${pulseStatus.error}` : pulseStatus.message}
                            </div>
                        )}
                    </div>
                )}

                {currentUser?.is_admin && (
                    <VerificationQueue 
                        pendingUsers={pendingUsers}
                        isLoading={isLoading}
                        onVerify={handleVerify}
                        onToggleFounding={toggleFoundingStatus}
                    />
                )}
            </main>
        </div>
    );
}
