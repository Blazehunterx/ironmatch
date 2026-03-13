import { RefreshCw, Search as SearchIcon } from 'lucide-react';

interface ExploreHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    fetchData: () => Promise<void>;
    isLoadingProfiles: boolean;
}

export default function ExploreHeader({ searchQuery, setSearchQuery, fetchData, isLoadingProfiles }: ExploreHeaderProps) {
    return (
        <div className="px-6 pt-8 pb-4">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Explore</h2>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Discover your community</p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-3 bg-gray-900 border border-white/5 rounded-2xl text-gray-500 hover:text-lime transition-all active:rotate-180 duration-500"
                >
                    <RefreshCw size={20} className={isLoadingProfiles ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="relative mb-2">
                <input
                    type="text"
                    placeholder="Search lifters at this gym..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-900 border border-white/5 text-white rounded-[20px] py-4 pl-12 pr-4 focus:outline-none focus:border-lime/50 transition-all text-sm font-medium"
                />
                <SearchIcon size={20} className="text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
        </div>
    );
}
