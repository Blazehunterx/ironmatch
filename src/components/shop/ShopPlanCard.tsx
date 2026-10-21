import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, CheckCircle2 } from 'lucide-react';

interface ShopPlanCardProps {
    plan: any;
    idx: number;
    onSelect: (plan: any) => void;
    isUnlocked?: boolean;
}

export const ShopPlanCard: React.FC<ShopPlanCardProps> = ({ plan, idx, onSelect, isUnlocked }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-gray-900 border rounded-[2.5rem] overflow-hidden group transition-all shadow-2xl ${
                isUnlocked ? 'border-lime/40 shadow-[0_0_25px_rgba(50,255,50,0.1)]' : 'border-gray-800 hover:border-lime/20'
            }`}
        >
            <div className="h-48 relative">
                <img 
                    src={plan.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                    alt="" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                <div className="absolute top-5 left-5 flex items-center gap-2">
                    <span className="bg-lime text-oled px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                        {plan.intensity}
                    </span>
                    {isUnlocked && (
                        <span className="bg-lime/20 border border-lime text-lime px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg backdrop-blur-md">
                            <CheckCircle2 size={11} /> Unlocked
                        </span>
                    )}
                </div>
                <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
                    <div>
                        <p className="text-[10px] text-lime font-black uppercase tracking-[0.2em] mb-1">{plan.profiles?.name || plan.author_name}</p>
                        <h4 className="text-xl font-black text-white italic uppercase leading-none">{plan.name}</h4>
                    </div>
                    <div className="text-2xl font-black text-white italic tracking-tighter">
                        {isUnlocked ? (
                            <span className="text-lime text-sm uppercase tracking-wider font-bold">OWNED</span>
                        ) : (
                            plan.price_display
                        )}
                    </div>
                </div>
            </div>
            <div className="p-6">
                <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6">{plan.description}</p>
                {isUnlocked ? (
                    <div className="w-full py-4 bg-lime/10 border border-lime/30 text-lime rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                        <CheckCircle2 size={14} className="text-lime" /> Unlocked · Added to Workout Splits
                    </div>
                ) : (
                    <button 
                        onClick={() => onSelect({
                            id: plan.id,
                            name: plan.name,
                            price: plan.price_display,
                            type: 'plan',
                            image: plan.image_url,
                            description: plan.description
                        })}
                        className="w-full py-4 bg-white text-oled rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-lime transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Unlock Strategy <ExternalLink size={12} />
                    </button>
                )}
            </div>
        </motion.div>
    );
};
