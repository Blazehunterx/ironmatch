import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Zap, ShoppingBag, Trophy, ExternalLink, ShieldCheck } from 'lucide-react';
import { COSMETIC_ITEMS, CosmeticItem, canUnlock } from '../lib/cosmetics';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import CheckoutModal from './marketplace/CheckoutModal';

interface EmpireShopProps {
    onClose: () => void;
    initialTab?: 'gear' | 'marketplace';
}

export default function EmpireShop({ onClose, initialTab = 'gear' }: EmpireShopProps) {
    const { user, updateUser } = useAuth();
    const [selectedTab, setSelectedTab] = useState<'gear' | 'marketplace'>(initialTab);
    const [selectedGearTab, setSelectedGearTab] = useState<'frame' | 'color'>('frame');
    const [premiumPlans, setPremiumPlans] = useState<any[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(false);
    const [checkoutItem, setCheckoutItem] = useState<any>(null);

    useEffect(() => {
        if (selectedTab === 'marketplace') {
            fetchPremiumPlans();
        }
    }, [selectedTab]);

    const fetchPremiumPlans = async () => {
        setLoadingPlans(true);
        try {
            const { data, error } = await supabase
                .from('workout_plans')
                .select('*, profiles!workout_plans_author_id_fkey(name, profile_image_url)')
                .eq('shared', true)
                .eq('is_premium', true)
                .order('sales_count', { ascending: false });

            if (error) throw error;
            setPremiumPlans(data || []);
        } catch (err) {
            console.error('Error fetching plans:', err);
            // Fallback to mock if DB not ready
            setPremiumPlans([
                {
                    id: 'p1',
                    name: 'Elite Powerlifting',
                    author_name: 'Mateo "The Beast"',
                    google_product_id: 'com.ironmatch.powerlifting',
                    price_display: '$14.99',
                    intensity: 'Expert',
                    description: 'The exact program used to break the world squat record.',
                    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60'
                }
            ]);
        } finally {
            setLoadingPlans(false);
        }
    };

    if (!user) return null;

    const userXP = user.xp || 0;
    const userLevel = user.fitness_level || 'Beginner';
    const unlocked = user.unlocked_cosmetics || [];

    const handleUnlockGear = (item: CosmeticItem) => {
        if (canUnlock(item, userXP, userLevel)) {
            const newUnlocked = [...unlocked, item.id];
            updateUser({
                unlocked_cosmetics: newUnlocked,
                xp: userXP - item.xpRequirement
            });
        }
    };

    const filteredGear = COSMETIC_ITEMS.filter(item => item.type === selectedGearTab);

    return (
        <div className="flex flex-col h-full bg-oled">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/40">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-lime rounded-2xl text-oled shadow-lg shadow-lime/20">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Empire Shop</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                             Secure Marketplace <ShieldCheck size={10} className="text-lime" />
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-gray-900 border border-gray-800 px-4 py-2 rounded-2xl flex items-center gap-2">
                        <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-black text-white italic">{userXP.toLocaleString()}</span>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex p-4 gap-2 bg-gray-900/20">
                <button
                    onClick={() => setSelectedTab('gear')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedTab === 'gear'
                        ? 'bg-lime text-oled shadow-lg'
                        : 'text-gray-500 hover:text-white border border-gray-800'
                        }`}
                >
                    <Trophy size={16} /> Gear
                </button>
                <button
                    onClick={() => setSelectedTab('marketplace')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedTab === 'marketplace'
                        ? 'bg-lime text-oled shadow-lg'
                        : 'text-gray-500 hover:text-white border border-gray-800'
                        }`}
                >
                    <Sparkles size={16} /> Marketplace
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 pt-4 pb-24">
                {selectedTab === 'gear' ? (
                    <div className="space-y-6">
                        {/* Gear Sub-tabs */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedGearTab('frame')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${selectedGearTab === 'frame' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-600'}`}
                            >
                                Frames
                            </button>
                            <button
                                onClick={() => setSelectedGearTab('color')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${selectedGearTab === 'color' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-600'}`}
                            >
                                Name Colors
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {filteredGear.map((item, idx) => {
                                const isUnlocked = unlocked.includes(item.id);
                                const canAfford = canUnlock(item, userXP, userLevel);
                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-gray-900 border border-gray-800 rounded-3xl p-4 flex items-center gap-5 hover:border-lime/30 transition-all group"
                                    >
                                        <div className="relative shrink-0">
                                            <div className={`w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border-2 ${item.type === 'frame' ? item.previewValue : 'border-gray-700'}`}>
                                                <img src={user.profile_image_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            {!isUnlocked && <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center"><X size={20} className="text-gray-500" /></div>}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`text-sm font-black ${item.type === 'color' ? item.previewValue : 'text-white'} italic uppercase tracking-tight`}>{item.name}</h4>
                                            <p className="text-[10px] text-gray-500 font-medium mt-0.5">{item.description}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className={`text-[9px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1.5 ${canAfford ? 'bg-yellow-400/10 text-yellow-400' : 'bg-red-500/10 text-red-500'}`}>
                                                    <Zap size={10} className="fill-current" /> {item.xpRequirement} XP
                                                </div>
                                            </div>
                                        </div>
                                        {isUnlocked ? (
                                            <span className="text-[9px] font-black text-lime uppercase tracking-widest px-3 py-1 bg-lime/10 rounded-full">Collected</span>
                                        ) : (
                                            <button
                                                onClick={() => handleUnlockGear(item)}
                                                disabled={!canAfford}
                                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${canAfford ? 'bg-white text-oled hover:bg-lime active:scale-95' : 'bg-gray-800 text-gray-600 grayscale'}`}
                                            >
                                                Unlock
                                            </button>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="p-5 bg-gradient-to-br from-blue-600/20 to-purple-600/10 border border-white/5 rounded-[2rem] relative overflow-hidden">
                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Elite Programs</h4>
                            <h3 className="text-xl font-black text-white italic uppercase mb-2">Trainer Marketplace</h3>
                            <p className="text-xs text-gray-500 leading-relaxed max-w-[85%] font-medium">Earnable expertise from the world's most disciplined trainers. Your gains start here.</p>
                            <Sparkles size={80} className="absolute -right-4 -bottom-4 text-white/5 rotate-12" />
                        </div>

                        {loadingPlans ? (
                            <div className="flex py-20 items-center justify-center">
                                <Zap size={32} className="text-lime animate-pulse" />
                            </div>
                        ) : premiumPlans.length === 0 ? (
                            <div className="py-20 text-center">
                                <p className="text-sm font-bold text-gray-500 italic uppercase">Marketplace is waking up...</p>
                                <p className="text-[10px] text-gray-600 mt-1">New programs are being drafted by our elite trainers.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {premiumPlans.map((plan, idx) => (
                                    <motion.div
                                        key={plan.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden group hover:border-lime/20 transition-all shadow-2xl"
                                    >
                                        <div className="h-48 relative">
                                            <img src={plan.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                                            <div className="absolute top-5 left-5">
                                                <span className="bg-lime text-oled px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">{plan.intensity}</span>
                                            </div>
                                            <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
                                                <div>
                                                    <p className="text-[10px] text-lime font-black uppercase tracking-[0.2em] mb-1">{plan.profiles?.name || plan.author_name}</p>
                                                    <h4 className="text-xl font-black text-white italic uppercase leading-none">{plan.name}</h4>
                                                </div>
                                                <div className="text-2xl font-black text-white italic tracking-tighter">
                                                    {plan.price_display}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6">{plan.description}</p>
                                            <button 
                                                onClick={() => setCheckoutItem({
                                                    id: plan.id,
                                                    name: plan.name,
                                                    price: plan.price_display,
                                                    type: 'plan',
                                                    image: plan.image_url
                                                })}
                                                className="w-full py-4 bg-white text-oled rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-lime transition-all active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                Unlock Strategy <ExternalLink size={12} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CheckoutModal 
                isOpen={!!checkoutItem}
                onClose={() => setCheckoutItem(null)}
                item={checkoutItem}
                onSuccess={() => {
                    // Logic to refresh plans or update user owned items
                    fetchPremiumPlans();
                }}
            />
        </div>
    );
}
