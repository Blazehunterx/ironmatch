import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayOfWeek, TimeBlock } from '../types/database';
import { isSupabaseConfigured } from '../lib/supabase';
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
import SystemStatus from '../components/SystemStatus';

export default function Profile() {
    const { user, logout, updateUser } = useAuth();

    // Modals & Shop state
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isEditingImage, setIsEditingImage] = useState(false);
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [shopInitialTab, setShopInitialTab] = useState<'gear' | 'marketplace'>('gear');

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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setEditImageUrl(ev.target?.result as string);
        reader.readAsDataURL(file);
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
                <ProfileStats user={user} />

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
                    {user.is_admin && (
                        <button onClick={() => window.location.href = '/admin'} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 transition-all">
                            <Settings size={20} /> OPEN ADMIN BACKEND
                        </button>
                    )}
                    <button onClick={logout} className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                        <LogOut size={18} /> Sign Out
                    </button>

                    <SystemStatus />
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
                        // Optional: Add a subtle toast or success state if needed
                    } catch (err) {
                        console.error('Save error:', err);
                        alert('Failed to save stats. Please check your connection.');
                    }
                }}
            />

            <ProfileImageModal 
                isOpen={isEditingImage} onClose={() => setIsEditingImage(false)}
                editImageUrl={editImageUrl} profileImageUrl={user.profile_image_url}
                fileInputRef={fileInputRef} onFileSelect={handleFileSelect}
                onSave={async () => { 
                    try {
                        await updateUser({ profile_image_url: editImageUrl });
                        setIsEditingImage(false);
                    } catch (err) {
                        alert('Failed to save profile image.');
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
        </div>
    );
}
