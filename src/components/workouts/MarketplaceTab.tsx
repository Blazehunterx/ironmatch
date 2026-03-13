import { Sparkles } from 'lucide-react';

interface MarketplaceTabProps {
    onOpenShop: () => void;
}

export default function MarketplaceTab({ onOpenShop }: MarketplaceTabProps) {
    return (
        <div className="flex flex-col items-center justify-center text-gray-500 py-32 gap-6 bg-gray-900/50 rounded-3xl border border-dashed border-gray-800">
            <div className="w-20 h-20 rounded-full bg-lime/10 flex items-center justify-center border border-lime/20 shadow-2xl shadow-lime/10">
                <Sparkles size={32} className="text-lime" />
            </div>
            <div className="text-center px-8">
                <h4 className="text-lg font-black text-white italic uppercase tracking-tight">The Pro Marketplace</h4>
                <p className="text-xs text-gray-500 mt-2 font-medium">Discover premium plans from elite trainers or monetize your own expertise.</p>
            </div>
            <button 
                onClick={onOpenShop}
                className="px-8 py-4 bg-lime text-oled rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-lime/20 active:scale-95 transition-all"
            >
                Enter Empire Shop
            </button>
        </div>
    );
}
