import { Zap, ImageIcon } from 'lucide-react';

interface SearchTabNavigationProps {
    viewMode: 'shouts' | 'posts';
    setViewMode: (mode: 'shouts' | 'posts') => void;
}

export default function SearchTabNavigation({ viewMode, setViewMode }: SearchTabNavigationProps) {
    return (
        <div className="px-4 mb-4">
            <div className="flex bg-gray-900/50 p-1 rounded-2xl border border-gray-800">
                <button
                    onClick={() => setViewMode('shouts')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'shouts'
                        ? 'bg-lime text-oled shadow-lg'
                        : 'text-gray-500 hover:text-white'
                        }`}
                >
                    <Zap size={14} /> Shouts
                </button>
                <button
                    onClick={() => setViewMode('posts')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'posts'
                        ? 'bg-lime text-oled shadow-lg'
                        : 'text-gray-500 hover:text-white'
                        }`}
                >
                    <ImageIcon size={14} /> Community Feed
                </button>
            </div>
        </div>
    );
}
