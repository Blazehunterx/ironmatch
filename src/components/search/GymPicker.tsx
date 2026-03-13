import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, RefreshCw, MapPin } from 'lucide-react';
import { Gym } from '../../types/database';

interface GymPickerProps {
    isOpen: boolean;
    searchGymQuery: string;
    setSearchGymQuery: (query: string) => void;
    refreshGyms: () => void;
    isSearchingGyms: boolean;
    searchRadius: number;
    setSearchRadius: (radius: number) => void;
    locationStatus: string | null;
    allGyms: Gym[];
    selectedGym: string;
    onSelect: (id: string) => void;
    onAddCustom: () => void;
}

export default function GymPicker({
    isOpen, searchGymQuery, setSearchGymQuery, refreshGyms,
    isSearchingGyms, searchRadius, setSearchRadius, locationStatus,
    allGyms, selectedGym, onSelect, onAddCustom
}: GymPickerProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden px-4 mb-4"
                >
                    <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
                        <div className="p-2 border-b border-gray-800 flex items-center gap-2">
                            <SearchIcon size={14} className="text-gray-500 ml-1" />
                            <input
                                type="text"
                                placeholder="Search gyms..."
                                value={searchGymQuery}
                                onChange={(e) => setSearchGymQuery(e.target.value)}
                                className="bg-transparent text-white text-sm w-full focus:outline-none placeholder:text-gray-600 flex-1"
                            />
                            <button
                                onClick={refreshGyms}
                                className="p-1.5 hover:text-lime transition-colors text-gray-500"
                            >
                                <RefreshCw size={14} className={isSearchingGyms ? 'animate-spin text-lime' : ''} />
                            </button>
                        </div>

                        {/* Range Selector */}
                        <div className="p-3 bg-gray-900 border-b border-gray-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Search Radius</span>
                                <span className="text-xs font-bold text-lime">{searchRadius} km</span>
                            </div>
                            <div className="flex gap-2">
                                {[5, 10, 20, 50, 100].map(km => (
                                    <button
                                        key={km}
                                        onClick={() => { setSearchRadius(km); }}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${searchRadius === km
                                            ? 'bg-lime border-lime text-oled shadow-lg'
                                            : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-white'
                                            }`}
                                    >
                                        {km}k
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto">
                            {locationStatus === 'denied' && (
                                <div className="p-3 text-[10px] text-red-400 bg-red-500/5 border-b border-gray-800">
                                    Location access denied. Enable it in settings for automatic discovery.
                                </div>
                            )}
                            {allGyms
                                .filter(g => g.name.toLowerCase().includes(searchGymQuery.toLowerCase()))
                                .slice(0, 15)
                                .map(g => (
                                    <button
                                        key={g.id}
                                        onClick={() => onSelect(g.id)}
                                        className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${selectedGym === g.id ? 'bg-lime/5' : 'hover:bg-gray-800/50'}`}
                                    >
                                        <MapPin size={12} className={selectedGym === g.id ? 'text-lime' : 'text-gray-600'} />
                                        <div className="flex-1">
                                            <span className={`text-sm font-semibold ${selectedGym === g.id ? 'text-lime' : 'text-white'}`}>{g.name}</span>
                                            <span className="text-xs text-gray-500 ml-2">{g.location}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-600 shrink-0">{g.member_count} members</span>
                                    </button>
                                ))}

                            <div className="p-3 border-t border-gray-800">
                                <button
                                    onClick={onAddCustom}
                                    className="w-full py-2 rounded-lg border border-dashed border-gray-700 text-gray-500 text-xs font-bold hover:border-lime/50 hover:text-lime transition-all"
                                >
                                    + Add Custom Gym
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
