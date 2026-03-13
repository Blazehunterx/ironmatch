import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Wallet, HelpCircle, CheckCircle2, ChevronRight, Landmark } from 'lucide-react';
import { User } from '../../types/database';

interface ProfilePayoutSettingsProps {
    user: User;
    onSave: (data: Partial<User>) => Promise<void>;
}

const ProfilePayoutSettings: React.FC<ProfilePayoutSettingsProps> = ({ user, onSave }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [revolutTag, setRevolutTag] = useState(user.revolut_tag || '');
    const [iban, setIban] = useState(user.payout_iban || '');
    const [showRevolutHelp, setShowRevolutHelp] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({
                revolut_tag: revolutTag,
                payout_iban: iban
            });
            alert('Payout settings updated successfully!');
        } catch (error) {
            console.error('Error saving payout settings:', error);
            alert('Failed to update payout settings.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Balance Overview */}
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-lime to-lime shadow-lg shadow-lime/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Wallet size={100} className="text-oled" />
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-oled/60 uppercase tracking-widest mb-1">Pending Balance</p>
                    <h3 className="text-4xl font-black text-oled italic tabular-nums leading-none">
                        ${(user.pending_balance || 0).toFixed(2)}
                    </h3>
                    <p className="text-[10px] text-oled/80 mt-3 font-bold flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> Next payout automatically at $50.00
                    </p>
                </div>
            </div>

            {/* Methods Selection */}
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 space-y-6">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white italic uppercase tracking-wider">Payout Methods</h4>
                </div>

                {/* Revolut Tag */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            Revolut Tag <HelpCircle size={12} className="cursor-help" onClick={() => setShowRevolutHelp(!showRevolutHelp)} />
                        </label>
                        {revolutTag && <span className="text-[8px] text-lime font-black uppercase">Active</span>}
                    </div>
                    
                    <AnimatePresence>
                        {showRevolutHelp && (
                            <motion.p 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="text-[10px] text-gray-400 bg-gray-800/50 p-3 rounded-xl leading-relaxed"
                            >
                                Your @Revtag allows us to send your share instantly to your Revolut account. IronMatch takes 0% fee on payouts.
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">@</span>
                        <input
                            type="text"
                            value={revolutTag}
                            onChange={(e) => setRevolutTag(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                            placeholder="yourtag"
                            className="w-full bg-oled border border-gray-800 text-white rounded-xl py-3 pl-8 pr-4 text-sm focus:outline-none focus:border-lime font-bold"
                        />
                    </div>
                </div>

                {/* IBAN Foundation (Standard Bank Payout) */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Bank IBAN (Optional)</label>
                    <div className="relative">
                        <Landmark size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={iban}
                            onChange={(e) => setIban(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                            placeholder="GB00 REVO 0000 ..."
                            className="w-full bg-oled border border-gray-800 text-white rounded-xl py-3 pl-10 pr-4 text-[10px] focus:outline-none focus:border-lime font-mono"
                        />
                    </div>
                    <p className="text-[8px] text-gray-600 px-1 font-medium italic">Fallback method if Revolut is unavailable.</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving || (revolutTag === (user.revolut_tag || '') && iban === (user.payout_iban || ''))}
                    className="w-full py-4 bg-lime text-oled rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-lime/10 active:scale-95 transition-all disabled:opacity-20 disabled:scale-100"
                >
                    {isSaving ? 'Updating...' : 'Update Payout Security'}
                </button>
            </div>

            {/* Transaction Ledger Placeholder */}
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black text-white italic uppercase tracking-wider">Recent Sales</h4>
                    <button className="text-[10px] text-lime font-bold hover:underline flex items-center gap-1">
                        View All <ChevronRight size={10} />
                    </button>
                </div>
                
                <div className="flex flex-col items-center justify-center py-8 text-gray-600 gap-3 border border-dashed border-gray-800 rounded-2xl">
                    <CreditCard size={24} className="opacity-20" />
                    <p className="text-[10px] font-medium italic uppercase">No transactions yet</p>
                </div>
            </div>
        </div>
    );
};

export default ProfilePayoutSettings;
