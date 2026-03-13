import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Zap, CheckCircle2, Loader2, CreditCard } from 'lucide-react';
import { useState } from 'react';

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

export default function CheckoutModal({ isOpen, onClose, item, onSuccess }: CheckoutModalProps) {
    const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

    if (!item) return null;

    const handlePurchase = async () => {
        setStatus('processing');
        // Simulate Google Play / Stripe delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        setStatus('success');
        // Record to ledger would happen here via Supabase
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
                        className="relative w-full max-w-lg bg-oled border-t sm:border border-gray-800 rounded-t-[2.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/40">
                            <div>
                                <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter">Secure Checkout</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">IronMatch Empire Secure Payment</p>
                            </div>
                            <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8">
                            {status === 'success' ? (
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-12 text-center"
                                >
                                    <div className="w-20 h-20 rounded-full bg-lime/20 flex items-center justify-center mb-6 shadow-2xl shadow-lime/20 border border-lime/30">
                                        <CheckCircle2 size={40} className="text-lime" />
                                    </div>
                                    <h4 className="text-2xl font-black text-white italic uppercase mb-2">Transaction Confirmed</h4>
                                    <p className="text-sm text-gray-400 max-w-xs mx-auto">Access granted. Your new gear/program has been added to your profile.</p>
                                </motion.div>
                            ) : (
                                <>
                                    {/* Order Summary */}
                                    <div className="flex gap-6 mb-8 p-5 bg-gray-900/50 rounded-3xl border border-gray-800">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-800 shrink-0 border border-gray-700 shadow-xl">
                                            {item.image ? (
                                                <img src={item.image} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-lime/5">
                                                    <Zap size={32} className="text-lime/30" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-[10px] font-black text-lime uppercase tracking-[0.2em] mb-1">{item.type}</h4>
                                            <h3 className="text-lg font-bold text-white leading-tight mb-2">{item.name}</h3>
                                            <div className="text-2xl font-black text-white italic">{item.price}</div>
                                        </div>
                                    </div>

                                    {/* Payment Method (Simulated) */}
                                    <div className="mb-8 space-y-4">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">Payment Method</label>
                                        <div className="p-4 rounded-2xl bg-gray-900 border-2 border-lime flex items-center gap-4 relative">
                                            <div className="p-2 bg-lime/10 rounded-lg text-lime">
                                                <CreditCard size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-white uppercase italic tracking-wider">Google Play Wallet</div>
                                                <p className="text-[10px] text-gray-500 font-medium">Safe & Encrypted for Android</p>
                                            </div>
                                            <div className="p-1 bg-lime rounded-full text-oled">
                                                <CheckCircle2 size={12} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="flex items-center gap-3 p-4 bg-gray-900/30 rounded-2xl border border-gray-800/50 mb-8">
                                        <ShieldCheck size={20} className="text-gray-500" />
                                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                                            Your purchase is protected by 256-bit SSL encryption. Downloads are forever synced to your IronMatch profile.
                                        </p>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={handlePurchase}
                                        disabled={status === 'processing'}
                                        className="w-full py-5 bg-lime text-oled rounded-[24px] text-sm font-black uppercase tracking-widest shadow-2xl shadow-lime/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                    >
                                        {status === 'processing' ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Processing Securely...
                                            </>
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
