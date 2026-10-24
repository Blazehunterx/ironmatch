import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Zap, Star, Trophy, Crown, ArrowRight, Loader2, Sparkles, Infinity as InfinityIcon, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { 
    initNativePurchases, 
    getNativeOfferings, 
    purchaseNativePackage, 
    restoreNativePurchases, 
    IronPassOfferings 
} from '../../lib/purchases';

interface IronPassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function IronPassModal({ isOpen, onClose, onSuccess }: IronPassModalProps) {
    const { user, updateUser } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | 'lifetime'>('lifetime');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [offerings, setOfferings] = useState<IronPassOfferings | null>(null);

    useEffect(() => {
        if (isOpen) {
            initNativePurchases(user?.id).then(() => {
                getNativeOfferings().then(setOfferings);
            });
        }
    }, [isOpen, user?.id]);

    if (!isOpen) return null;

    const playCelebration = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const chords = [329.63, 415.30, 493.88, 659.25, 830.61]; // E major celebration arpeggio
            chords.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
                gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + idx * 0.08);
                osc.stop(ctx.currentTime + 1.4);
            });
        } catch {}
    };

    const handleSubscribe = async () => {
        if (!user) return;
        setIsProcessing(true);

        const price = selectedPlan === 'lifetime' ? 79.99 : selectedPlan === 'annual' ? 59.99 : 9.99;
        const planCode = selectedPlan === 'lifetime' ? 'lifetime' : selectedPlan === 'annual' ? 'pro_annual' : 'pro_monthly';
        const itemName = selectedPlan === 'lifetime' 
            ? 'IronPass Lifetime Founding Lifter' 
            : selectedPlan === 'annual' 
                ? 'IronPass Pro (Annual)' 
                : 'IronPass Pro (Monthly)';

        const nativePkg = selectedPlan === 'lifetime' 
            ? offerings?.lifetime 
            : selectedPlan === 'annual' 
                ? offerings?.annual 
                : offerings?.monthly;

        try {
            // 1. Trigger Native In-App Purchase (Google Play Store on Android / App Store on iOS)
            const purchaseResult = await purchaseNativePackage(selectedPlan, nativePkg);
            if (!purchaseResult.success || !purchaseResult.isPro) {
                if (purchaseResult.error !== 'cancelled') {
                    alert(purchaseResult.error || 'Payment could not be verified with the App Store. Please try again.');
                }
                return;
            }

            // 2. Synchronize Pro status with Supabase backend
            if (isSupabaseConfigured) {
                try {
                    await supabase.from('purchases').insert({
                        user_id: user.id,
                        item_id: planCode,
                        item_name: itemName,
                        item_type: selectedPlan === 'lifetime' ? 'lifetime' : 'subscription',
                        price_usd: price,
                        payment_method: 'app_store',
                        platform_fee_usd: Number((price * 0.15).toFixed(2)), // Google Play 15% fee
                        status: 'completed'
                    });
                } catch (e) {
                    console.warn('Purchase ledger notice:', e);
                }

                const proExpires = new Date();
                if (selectedPlan === 'lifetime') {
                    proExpires.setFullYear(proExpires.getFullYear() + 100);
                } else if (selectedPlan === 'annual') {
                    proExpires.setDate(proExpires.getDate() + 365);
                } else {
                    proExpires.setDate(proExpires.getDate() + 30);
                }

                await updateUser({
                    is_pro: true,
                    pro_tier: planCode,
                    pro_expires_at: proExpires.toISOString()
                });
            } else {
                await updateUser({
                    is_pro: true,
                    pro_tier: planCode
                });
            }

            playCelebration();
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Subscription error:', err);
            alert('Payment processing failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRestore = async () => {
        setIsRestoring(true);
        try {
            const res = await restoreNativePurchases();
            if (res.isPro) {
                await updateUser({ is_pro: true });
                alert('Pro membership successfully restored from your App Store account!');
                if (onSuccess) onSuccess();
                onClose();
            } else {
                alert('No active IronPass Pro subscription found on this App Store account.');
            }
        } catch (err) {
            console.error('Restore error:', err);
            alert('Could not restore purchases. Please check your App Store connection.');
        } finally {
            setIsRestoring(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/90 backdrop-blur-md"
                />

                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-lg bg-oled border border-lime/30 rounded-t-[36px] sm:rounded-[36px] p-6 pb-8 z-10 shadow-[0_0_60px_rgba(50,255,50,0.18)] max-h-[92vh] overflow-y-auto no-scrollbar"
                >
                    {/* Background Glow */}
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-lime/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-gray-400 hover:text-white transition active:scale-95"
                    >
                        <X size={18} />
                    </button>

                    {/* Header */}
                    <div className="text-center pt-2 mb-5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/10 border border-lime/30 text-lime text-[11px] font-black uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(50,255,50,0.2)]">
                            <Crown size={14} /> IronPass Pro Intelligence
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black italic tracking-wide text-white uppercase">
                            Never Plateau Again
                        </h2>
                        <p className="text-xs font-bold text-gray-400 mt-1 max-w-sm mx-auto">
                            RPE Autoregulation, 1RM trajectory analytics, and local gym prestige.
                        </p>
                    </div>

                    {/* Features List */}
                    <div className="space-y-2.5 mb-5 bg-white/[0.02] border border-white/5 rounded-2xl p-3.5">
                        {[
                            {
                                icon: Zap,
                                title: 'RPE Autoregulation Engine',
                                desc: 'Dynamic load calibration based on RPE & fatigue so you never stall.'
                            },
                            {
                                icon: Trophy,
                                title: 'Estimated 1RM Radar Analytics',
                                desc: 'Live strength curve progression across all compound and barbell lifts.'
                            },
                            {
                                icon: ShieldCheck,
                                title: 'Verified Lifter Gym Badge',
                                desc: 'Stand out on your home gym leaderboard with priority partner spotlight.'
                            },
                            {
                                icon: Star,
                                title: 'Custom Graph Themes & Data Export',
                                desc: 'Full CSV/Excel log export and cyberpunk high-contrast OLED graphs.'
                            }
                        ].map((feat, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-lg bg-lime/10 border border-lime/20 flex items-center justify-center text-lime flex-shrink-0 mt-0.5">
                                    <feat.icon size={15} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-white">{feat.title}</h4>
                                    <p className="text-[11px] text-gray-400 leading-tight">{feat.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Lifetime Founding Lifter Spotlight (Anti-Subscription Option) */}
                    <div
                        onClick={() => setSelectedPlan('lifetime')}
                        className={`relative p-4 rounded-2xl border cursor-pointer transition-all mb-3 ${
                            selectedPlan === 'lifetime'
                                ? 'bg-lime/15 border-lime shadow-[0_0_25px_rgba(50,255,50,0.3)] ring-1 ring-lime/40'
                                : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-lime text-black font-black text-[9px] uppercase tracking-wider shadow-sm">
                                <Sparkles size={11} /> 100% Subscription-Free
                            </span>
                            <span className="text-[10px] text-lime font-mono font-black uppercase tracking-wider flex items-center gap-1">
                                <InfinityIcon size={12} /> Pay Once, Own Forever
                            </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <div>
                                <div className="text-sm font-black uppercase text-white tracking-wide">
                                    Founding Lifter (Lifetime Pass)
                                </div>
                                <div className="text-[11px] text-gray-400 mt-0.5">
                                    Zero recurring fees. All future Pro updates included.
                                </div>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                                <div className="text-2xl font-black italic text-lime leading-none">
                                    {offerings?.formattedPrices?.lifetime || '$79.99'}
                                </div>
                                <div className="text-[9px] text-gray-400 font-bold uppercase mt-1">One-time payment</div>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Options */}
                    <div className="grid grid-cols-2 gap-2.5 mb-6">
                        {/* Annual Option */}
                        <div
                            onClick={() => setSelectedPlan('annual')}
                            className={`relative p-3.5 rounded-2xl border cursor-pointer transition ${
                                selectedPlan === 'annual'
                                    ? 'bg-lime/10 border-lime shadow-[0_0_15px_rgba(50,255,50,0.2)]'
                                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                            }`}
                        >
                            <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-lime/20 border border-lime/40 text-lime font-black text-[8px] uppercase tracking-wider">
                                Save 50%
                            </span>
                            <div className="text-[10px] font-black uppercase text-gray-400 mb-0.5">Annual Plan</div>
                            <div className="text-lg font-black italic text-white leading-tight">
                                {offerings?.formattedPrices?.annual || '$59.99'} <span className="text-[10px] font-normal text-gray-400">/yr</span>
                            </div>
                            <div className="text-[10px] text-lime font-bold mt-0.5">Best Value</div>
                        </div>

                        {/* Monthly Option */}
                        <div
                            onClick={() => setSelectedPlan('monthly')}
                            className={`relative p-3.5 rounded-2xl border cursor-pointer transition ${
                                selectedPlan === 'monthly'
                                    ? 'bg-lime/10 border-lime shadow-[0_0_15px_rgba(50,255,50,0.2)]'
                                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                            }`}
                        >
                            <div className="text-[10px] font-black uppercase text-gray-400 mb-0.5">Monthly Plan</div>
                            <div className="text-lg font-black italic text-white leading-tight">
                                {offerings?.formattedPrices?.monthly || '$9.99'} <span className="text-[10px] font-normal text-gray-400">/mo</span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-bold mt-0.5">Cancel anytime</div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleSubscribe}
                        disabled={isProcessing}
                        className="w-full py-4 rounded-2xl bg-lime text-black font-black text-xs uppercase tracking-wider hover:bg-lime/90 active:scale-95 transition shadow-[0_0_25px_rgba(50,255,50,0.3)] flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Connecting to Store...
                            </>
                        ) : (
                            <>
                                {selectedPlan === 'lifetime' 
                                    ? `Unlock Lifetime Founding Pass (${offerings?.formattedPrices?.lifetime || '$79.99'})` 
                                    : selectedPlan === 'annual' 
                                        ? `Start Annual Pro (${offerings?.formattedPrices?.annual || '$59.99'}/yr)` 
                                        : `Start Monthly Pro (${offerings?.formattedPrices?.monthly || '$9.99'}/mo)`}
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>

                    {/* App Store Compliance: Restore Purchases & Guarantee */}
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-4 px-2">
                        <span className="flex items-center gap-1.5 text-gray-500">
                            <ShieldCheck size={13} className="text-lime" /> Google Play & App Store Protected
                        </span>
                        <button
                            type="button"
                            disabled={isRestoring}
                            onClick={handleRestore}
                            className="text-gray-400 hover:text-lime underline transition flex items-center gap-1 active:scale-95"
                        >
                            {isRestoring && <RefreshCw size={11} className="animate-spin text-lime" />}
                            {isRestoring ? 'Restoring...' : 'Restore Purchases'}
                        </button>
                    </div>

                    <p className="text-[10px] text-gray-500 text-center mt-2.5">
                        Billed through your Google Play or Apple ID. Cancel anytime in store settings.
                    </p>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
