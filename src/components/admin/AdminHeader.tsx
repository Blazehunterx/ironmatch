import { ArrowLeft } from 'lucide-react';

interface AdminHeaderProps {
    isAdmin: boolean;
    onBack: () => void;
}

export default function AdminHeader({ isAdmin, onBack }: AdminHeaderProps) {
    return (
        <header className="sticky top-0 z-50 p-6 bg-oled/90 backdrop-blur-md border-b border-gray-900 flex items-center gap-4">
            <button onClick={onBack} className="p-2 bg-gray-800 rounded-xl text-gray-400">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-xl font-black text-white">{isAdmin ? 'Master Control' : 'Gym Dashboard'}</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">IronMatch Analytics Engine</p>
            </div>
        </header>
    );
}
