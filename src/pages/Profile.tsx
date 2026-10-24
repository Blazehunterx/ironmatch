import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogOut, Settings, Crown, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayOfWeek, TimeBlock } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { compressImage } from '../lib/imageCompression';
import { uploadToStorage } from '../lib/storageUpload';
import React from 'react';

// Modular Components
import TalentDashboard from '../components/TalentDashboard';
import EmpireShop from '../components/EmpireShop';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileBio from '../components/profile/ProfileBio';
import ProfileGoals from '../components/profile/ProfileGoals';
import ProfileSchedule from '../components/profile/ProfileSchedule';
import ProfileFriends from '../components/profile/ProfileFriends';
import ProfileSettingsModal from '../components/profile/ProfileSettingsModal';
import ProfileImageModal from '../components/profile/ProfileImageModal';
import IronPassModal from '../components/monetization/IronPassModal';

export default function Profile() {
    const { user, logout, updateUser } = useAuth();
    const { showToast } = useToast();

    // Modals & Shop state
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isEditingImage, setIsEditingImage] = useState(false);
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [shopInitialTab, setShopInitialTab] = useState<'gear' | 'marketplace'>('gear');
    const [isProModalOpen, setIsProModalOpen] = useState(false);

    // Temp state for editing
    const [editBig4, setEditBig4] = useState(user?.big4 || { bench: 0, squat: 0, deadlift: 0, ohp: 0 });
    const [editImageUrl, setEditImageUrl] = useState('');
    const [activeTab, setActiveTab] = useState<'profile' | 'talent'>('profile');

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!user) return;
        if (!isSettingsOpen) {
            setEditBig4(user.big4 || { bench: 0, squat: 0, deadlift: 0, ohp: 0 });
        }
    }, [user?.big4, isSettingsOpen]);

    if (!user) return null;

    const toggleAvailBlock = (day: DayOfWeek, block: TimeBlock) => {
        const current = user.availability || [];
        const daySlot = current.find(a => a.day === day);
        let updated;
        if (daySlot) {
            const hasBlock = daySlot.blocks.includes(block);
            const newBlocks = hasBlock ? daySlot.blocks.filter(b => b !== block) : [...daySlot.blocks, block];
            updated = newBlocks.length === 0 
                ? current.filter(a => a.day !== day) 
                : current.map(a => a.day === day ? { ...a, blocks: newBlocks } : a);
        } else {
            updated = [...current, { day, blocks: [block] }];
        }
        updateUser({ availability: updated });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const compressed = await compressImage(file, 1080, 0.75);
            setEditImageUrl(compressed);
        } catch {
            const reader = new FileReader();
            reader.onload = (ev) => setEditImageUrl(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const [isExportingCSV, setIsExportingCSV] = useState(false);

    const handleExportCSV = async () => {
        setIsExportingCSV(true);
        try {
            let logs: any[] = [];
            if (isSupabaseConfigured) {
                const { data } = await supabase
                    .from('workout_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                if (data) logs = data;
            }

            const headers = ['Date', 'Duration_Min', 'Exercise_Name', 'Set_Number', 'Weight', 'Unit', 'Reps', 'RPE', 'Completed'];
            const rows: string[] = [headers.join(',')];

            if (logs.length > 0) {
                for (const log of logs) {
                    const date = log.created_at ? new Date(log.created_at).toISOString().split('T')[0] : '';
                    const duration = log.duration_min || '';
                    const exercises = log.exercises || [];

                    for (const ex of exercises) {
                        const exName = `"${(ex.name || 'Exercise').replace(/"/g, '""')}"`;
                        if (Array.isArray(ex.setDetails) && ex.setDetails.length > 0) {
                            for (const s of ex.setDetails) {
                                rows.push([
                                    date,
                                    duration,
                                    exName,
                                    s.setNumber || 1,
                                    s.weight || 0,
                                    user.unit_preference || 'kg',
                                    s.reps || 0,
                                    s.rpe || '',
                                    s.completed ? 'YES' : 'NO'
                                ].join(','));
                            }
                        } else {
                            rows.push([
                                date,
                                duration,
                                exName,
                                1,
                                ex.weight || 0,
                                user.unit_preference || 'kg',
                                ex.reps || 0,
                                '',
                                'YES'
                            ].join(','));
                        }
                    }
                }
            } else {
                const date = new Date().toISOString().split('T')[0];
                const u = user.unit_preference || 'kg';
                rows.push([date, '0', '"Barbell Bench Press (Baseline 1RM)"', 1, user.big4?.bench || 0, u, 1, '10', 'YES'].join(','));
                rows.push([date, '0', '"Barbell Back Squat (Baseline 1RM)"', 1, user.big4?.squat || 0, u, 1, '10', 'YES'].join(','));
                rows.push([date, '0', '"Barbell Deadlift (Baseline 1RM)"', 1, user.big4?.deadlift || 0, u, 1, '10', 'YES'].join(','));
                rows.push([date, '0', '"Overhead Press (Baseline 1RM)"', 1, user.big4?.ohp || 0, u, 1, '10', 'YES'].join(','));
            }

            const csvContent = rows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `IronMatch_Training_History_${(user.name || 'Lifter').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showToast('Training history exported (.CSV)', 'success');
        } catch (err) {
            console.error('CSV Export Error:', err);
            showToast('Could not export workout history.', 'error');
        } finally {
            setIsExportingCSV(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen px-4 pt-8 pb-24 relative overflow-y-auto">
            <ProfileHeader 
                user={user} 
                onOpenSettings={() => setIsSettingsOpen(true)} 
                onOpenShop={() => { setShopInitialTab('marketplace'); setIsShopOpen(true); }}
                onOpenWardrobe={() => { setShopInitialTab('gear'); setIsShopOpen(true); }}
                onEditImage={() => { setEditImageUrl(user.profile_image_url); setIsEditingImage(true); }}
                isSupabaseConfigured={isSupabaseConfigured}
            />

            <div className="space-y-4">
                {/* IronPass Pro Banner */}
                <div 
                    onClick={() => setIsProModalOpen(true)}
                    className={`p-4 rounded-2xl border cursor-pointer transition active:scale-[0.99] flex items-center justify-between gap-3 ${
                        user.is_pro 
                            ? 'bg-gradient-to-r from-lime/10 to-emerald-500/10 border-lime/40 shadow-[0_0_20px_rgba(50,255,50,0.15)]' 
                            : 'bg-white/[0.03] border-lime/30 hover:border-lime/60'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user.is_pro ? 'bg-lime text-black font-black' : 'bg-lime/10 text-lime border border-lime/30'}`}>
                            <Crown size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-black uppercase text-white tracking-wider">
                                    {user.is_pro ? 'IronPass Pro Active' : 'Upgrade To IronPass Pro'}
                                </h4>
                                {user.is_pro && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-lime text-black text-[9px] font-black uppercase">PRO</span>
                                )}
                            </div>
                            <p className="text-[11px] text-gray-400">
                                {user.is_pro ? 'Unlimited AI periodization & 1RM radar enabled' : 'Unlock AI periodization, 1RM radar & verified spotlight'}
                            </p>
                        </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-xl bg-lime text-black text-[10px] font-black uppercase tracking-wider hover:bg-lime/90 transition shadow-sm">
                        {user.is_pro ? 'Manage' : 'Upgrade'}
                    </button>
                </div>

                <ProfileStats user={user} onEditLifts={() => setIsSettingsOpen(true)} />

                {user.verification_status === 'verified' && user.is_trainer && (
                    <div className="flex bg-gray-900/50 p-1 rounded-2xl border border-gray-800 mb-6">
                        <button onClick={() => setActiveTab('profile')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Overview</button>
                        <button onClick={() => setActiveTab('talent')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'talent' ? 'bg-lime text-oled shadow-lg shadow-lime/20' : 'text-gray-500 hover:text-white'}`}>Talent HUB</button>
                    </div>
                )}

                {activeTab === 'profile' ? (
                    <div className="space-y-4">
                        <ProfileBio bio={user.bio || ''} onSave={(bio) => updateUser({ bio })} />
                        <ProfileGoals goals={user.goals || []} onSave={(goals) => updateUser({ goals })} />
                        <ProfileFriends />
                        <ProfileSchedule availability={user.availability || []} onToggleBlock={toggleAvailBlock} />
                    </div>
                ) : (
                    <TalentDashboard user={user} onUpdateUser={updateUser} />
                )}

                <div className="space-y-3 pt-4">
                    {/* 1-Tap CSV Training History Export */}
                    <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-white/10 flex items-center justify-between gap-3 shadow-sm hover:border-lime/30 transition">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-lime/10 border border-lime/30 flex items-center justify-center text-lime font-black shrink-0">
                                <Download size={18} />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-xs font-black uppercase text-white tracking-wider">
                                    Export Logs (.CSV)
                                </h4>
                                <p className="text-[10px] text-gray-400">
                                    Raw workout data for spreadsheets & coaches
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleExportCSV}
                            disabled={isExportingCSV}
                            className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-lime hover:text-black border border-lime/30 text-xs font-black uppercase tracking-wider text-lime transition active:scale-95 flex items-center gap-1.5 shrink-0 shadow-sm"
                        >
                            {isExportingCSV ? 'Exporting...' : 'Export CSV'}
                        </button>
                    </div>

                    {user.is_admin && (
                        <button 
                            onClick={() => window.location.href = '/admin'} 
                            className="w-full py-3.5 bg-zinc-900 border border-zinc-700/80 hover:border-lime/50 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
                        >
                            <Settings size={18} className="text-lime" /> Admin Master Console
                        </button>
                    )}
                    <button 
                        onClick={logout} 
                        className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all active:scale-95"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </div>

            <ProfileSettingsModal 
                isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
                isTrainer={user.is_trainer || false} onSaveTrainer={(val) => updateUser({ is_trainer: val })}
                unitPref={user.unit_preference || 'lbs'} onSetUnitPref={(u) => updateUser({ unit_preference: u })}
                editBig4={editBig4} onSetBig4={setEditBig4}
                onSaveBig4={async () => {
                    try {
                        await updateUser({ big4: editBig4 });
                        setIsSettingsOpen(false);
                        showToast('Strength calibration saved!', 'success');
                    } catch (err) {
                        console.error('Save error:', err);
                        showToast('Failed to save stats. Check your connection.', 'error');
                    }
                }}
            />

            <ProfileImageModal 
                isOpen={isEditingImage} onClose={() => setIsEditingImage(false)}
                editImageUrl={editImageUrl} profileImageUrl={user.profile_image_url}
                fileInputRef={fileInputRef} onFileSelect={handleFileSelect}
                onSave={async (croppedData) => { 
                    try {
                        const cdnUrl = await uploadToStorage(croppedData, 'avatars', user.id);
                        await updateUser({ profile_image_url: cdnUrl || croppedData });
                        setIsEditingImage(false);
                        showToast('Profile photo updated!', 'success');
                    } catch (err) {
                        showToast('Failed to save profile image.', 'error');
                    }
                }}
            />

            <AnimatePresence>
                {isShopOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsShopOpen(false)} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60]" />
                        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 z-[60] bg-oled rounded-t-[2.5rem] h-[85vh] border-t border-gray-800 overflow-hidden">
                            <EmpireShop onClose={() => setIsShopOpen(false)} initialTab={shopInitialTab} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <IronPassModal 
                isOpen={isProModalOpen} 
                onClose={() => setIsProModalOpen(false)} 
            />
        </div>
    );
}
