import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ShieldCheck, Zap, CheckCircle2, Loader2,
    CreditCard, MessageCircle, ArrowRight
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { safeStorage } from '../../lib/safeStorage';
import { WorkoutPlan } from '../../types/database';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: {
        id: string;
        name: string;
        price: string;
        type: 'plan' | 'cosmetic' | 'science';
        description?: string;
        image?: string;
    } | null;
    onSuccess: () => void;
}

type PaymentMethod = 'card' | 'xp' | 'whatsapp';

export default function CheckoutModal({ isOpen, onClose, item, onSuccess }: CheckoutModalProps) {
    const { user, updateUser } = useAuth();
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
    const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

    if (!item) return null;

    const userXP = user?.xp || 0;
    const XP_COST = 1500;
    const canAffordXP = userXP >= XP_COST;

    const playFanfare = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
                gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + idx * 0.08);
                osc.stop(ctx.currentTime + 1.2);
            });
        } catch {}
    };

    const handlePurchase = async () => {
        setStatus('processing');

        if (selectedMethod === 'whatsapp') {
            const encodedMsg = encodeURIComponent(
                `Hey IronMatch VIP Concierge! I want to order the "${item.name}" program (${item.price}). My User ID is ${user?.id || 'guest'}.`
            );
            window.open(`https://wa.me/6281234567890?text=${encodedMsg}`, '_blank');
        }

        await new Promise(resolve => setTimeout(resolve, 1200));

        // Unlock in user state
        const currentUnlocked = user?.unlocked_cosmetics || [];
        const newUnlocked = Array.from(new Set([...currentUnlocked, item.id, `plan-${item.id}`]));

        // Record purchase ledger in Supabase cloud
        if (isSupabaseConfigured && user) {
            const priceNum = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
            try {
                await supabase.from('purchases').insert({
                    user_id: user.id,
                    item_id: item.id,
                    item_name: item.name,
                    item_type: item.type,
                    price_usd: priceNum,
                    payment_method: selectedMethod,
                    trainer_id: (item as any).author_id || null,
                    trainer_cut_usd: priceNum * 0.8,
                    platform_fee_usd: priceNum * 0.2,
                    status: 'completed'
                });
            } catch (e) {
                console.warn('Purchase logging notice:', e);
            }
        }

        // If it's a workout plan, create a ready-to-lift WorkoutPlan in local storage and Supabase
        if (item.type === 'plan') {
            const newPlan: WorkoutPlan = {
                id: `unlocked-plan-${item.id}-${Date.now()}`,
                name: item.name,
                author_id: user?.id || 'trainer',
                target: 'Full Body',
                shared: false,
                created_at: new Date().toISOString(),
                exercises: [
                    { id: 'ex-1', name: 'Competition Barbell Squat', sets: 5, reps: 5, weight: 100, notes: 'Elite RPE 8 Protocol' },
                    { id: 'ex-2', name: 'Paused Bench Press', sets: 4, reps: 6, weight: 80, notes: '2s pause on chest' },
                    { id: 'ex-3', name: 'Deficit Deadlift', sets: 4, reps: 5, weight: 120, notes: 'Explosive drive off floor' },
                    { id: 'ex-4', name: 'Weighted Pull-ups', sets: 3, reps: 8, weight: 10, notes: 'Strict full lock' }
                ]
            };

            try {
                const existing = JSON.parse(safeStorage.getItem('ironmatch_custom_plans') || '[]');
                safeStorage.setItem('ironmatch_custom_plans', JSON.stringify([newPlan, ...existing]));
            } catch {}

            if (isSupabaseConfigured && user) {
                try {
                    await supabase.from('workout_plans').insert({
                        author_id: user.id,
                        name: item.name,
                        target: 'Full Body',
                        shared: false,
                        is_premium: false,
                        exercises: newPlan.exercises
                    });
                } catch (e) {}
            }
        }

        // Deduct XP if paid via XP
        const newXP = selectedMethod === 'xp' ? Math.max(0, userXP - XP_COST) : userXP;

        await updateUser({
            unlocked_cosmetics: newUnlocked,
            xp: newXP
        });

        playFanfare();
        setStatus('success');

        setTimeout(() => {
            onSuccess();
            onClose();
            setStatus('idle');
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                    />
                    
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-lg bg-oled border-t sm:border border-gray-800 rounded-t-[2.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/40 shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
                                    Secure Empire Checkout
                                </h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                    Instant program access & sync
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                                <X size={22} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            {status === 'success' ? (
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-10 text-center"
                                >
                                    <div className="w-20 h-20 rounded-full bg-lime/20 flex items-center justify-center mb-5 shadow-2xl shadow-lime/20 border border-lime/40">
                                        <CheckCircle2 size={42} className="text-lime" />
                                    </div>
                                    <h4 className="text-2xl font-black text-white italic uppercase mb-2">Program Unlocked!</h4>
                                    <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
                                        Added to your profile & workout templates. You can begin training immediately.
                                    </p>
                                </motion.div>
                            ) : (
                                <>
                                    {/* Order Summary */}
                                    <div className="flex gap-4 p-4 bg-gray-900/60 rounded-3xl border border-gray-800">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-800 shrink-0 border border-gray-700 shadow-xl">
                                            {item.image ? (
                                                <img src={item.image} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-lime/5">
                                                    <Zap size={28} className="text-lime/40" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[9px] font-black text-lime uppercase tracking-widest mb-0.5">
                                                {item.type} Strategy
                                            </h4>
                                            <h3 className="text-base font-black text-white truncate mb-1">
                                                {item.name}
                                            </h3>
                                            <div className="text-xl font-black text-white italic">
                                                {selectedMethod === 'xp' ? `${XP_COST.toLocaleString()} XP` : item.price}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3 Checkout Methods */}
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                                            Select Payment Method:
                                        </label>

                                        {/* Card / Google Play */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedMethod('card')}
                                            className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                                                selectedMethod === 'card'
                                                    ? 'bg-lime/10 border-lime shadow-[0_0_15px_rgba(50,255,50,0.15)]'
                                                    : 'bg-gray-900 border-gray-800 text-gray-400'
                                            }`}
                                        >
                                            <div className="p-2 bg-gray-800 rounded-xl text-lime shrink-0">
                                                <CreditCard size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-black text-white uppercase italic">
                                                    Google Play / In-App Card
                                                </div>
                                                <p className="text-[10px] text-gray-500">1-Tap instant confirmation ({item.price})</p>
                                            </div>
                                            {selectedMethod === 'card' && <CheckCircle2 size={16} className="text-lime" />}
                                        </button>

                                        {/* 1-Tap XP Redemption */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedMethod('xp')}
                                            className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                                                selectedMethod === 'xp'
                                                    ? 'bg-lime/10 border-lime shadow-[0_0_15px_rgba(50,255,50,0.15)]'
                                                    : 'bg-gray-900 border-gray-800 text-gray-400'
                                            }`}
                                        >
                                            <div className="p-2 bg-gray-800 rounded-xl text-yellow-400 shrink-0">
                                                <Zap size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-black text-white uppercase italic flex items-center gap-2">
                                                    Redeem with XP
                                                    <span className="text-[9px] bg-yellow-400/20 text-yellow-400 px-1.5 py-0.2 rounded font-mono font-bold">
                                                        {XP_COST} XP
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-500">
                                                    Your Balance: {userXP.toLocaleString()} XP {!canAffordXP && '(Need more XP)'}
                                                </p>
                                            </div>
                                            {selectedMethod === 'xp' && <CheckCircle2 size={16} className="text-lime" />}
                                        </button>

                                        {/* WhatsApp Concierge */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedMethod('whatsapp')}
                                            className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                                                selectedMethod === 'whatsapp'
                                                    ? 'bg-lime/10 border-lime shadow-[0_0_15px_rgba(50,255,50,0.15)]'
                                                    : 'bg-gray-900 border-gray-800 text-gray-400'
                                            }`}
                                        >
                                            <div className="p-2 bg-gray-800 rounded-xl text-green-400 shrink-0">
                                                <MessageCircle size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-black text-white uppercase italic">
                                                    WhatsApp Direct Concierge
                                                </div>
                                                <p className="text-[10px] text-gray-500">Direct trainer chat & invoice</p>
                                            </div>
                                            {selectedMethod === 'whatsapp' && <CheckCircle2 size={16} className="text-lime" />}
                                        </button>
                                    </div>

                                    {/* Security Guarantee Note */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-900/40 rounded-xl border border-gray-800/60">
                                        <ShieldCheck size={16} className="text-lime shrink-0" />
                                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                                            Zero-risk guarantee. Downloads sync forever to your IronMatch profile across all devices.
                                        </p>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={handlePurchase}
                                        disabled={status === 'processing' || (selectedMethod === 'xp' && !canAffordXP)}
                                        className="w-full py-4 bg-lime text-oled rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-lime/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                    >
                                        {status === 'processing' ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Unlocking Program...
                                            </>
                                        ) : selectedMethod === 'xp' ? (
                                            <>Unlock for {XP_COST.toLocaleString()} XP <Zap size={14} /></>
                                        ) : selectedMethod === 'whatsapp' ? (
                                            <>Order on WhatsApp & Unlock <ArrowRight size={14} /></>
                                        ) : (
                                            <>Confirm & Unlock {item.price}</>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
