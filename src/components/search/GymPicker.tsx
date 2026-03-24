import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, RefreshCw, MapPin, Loader2, Navigation } from 'lucide-react';
import { Gym } from '../../types/database';
import { searchAddress, GeocodeResult } from '../../lib/geocoding';
import { useGyms } from '../../context/GymContext';
import React from 'react';

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
    const { searchGymsByLocation, userLocation } = useGyms();
    const [geoResults, setGeoResults] = React.useState<GeocodeResult[]>([]);
    const [isGeoLoading, setIsGeoLoading] = React.useState(false);

    React.useEffect(() => {
        if (searchGymQuery.length < 3) {
            setGeoResults([]);
            return;
        }

        const handler = setTimeout(async () => {
            setIsGeoLoading(true);
            const res = await searchAddress(searchGymQuery, userLocation || undefined);
            setGeoResults(res);
            setIsGeoLoading(false);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchGymQuery]);

    const handleSelectGeo = async (res: GeocodeResult) => {
        setSearchGymQuery(''); // Clear filter to show all gyms nearby
        setGeoResults([]);
        await searchGymsByLocation(res.lat, res.lng);
    };

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
                        <div className="p-2 border-b border-gray-800 flex items-center gap-2 relative">
                            {isGeoLoading ? <Loader2 size={14} className="text-lime animate-spin ml-1" /> : <SearchIcon size={14} className="text-gray-500 ml-1" />}
                            <input
                                type="text"
                                placeholder="Search gyms or locations..."
                                value={searchGymQuery}
                                onChange={(e) => setSearchGymQuery(e.target.value)}
                                className="bg-transparent text-white text-sm w-full focus:outline-none placeholder:text-gray-600 flex-1"
                            />

                            <AnimatePresence>
                                {geoResults.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl z-[60]"
                                    >
                                        {geoResults.map((r, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSelectGeo(r)}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 text-left transition-colors border-b border-gray-800 last:border-0"
                                            >
                                                <Navigation size={12} className="text-lime shrink-0" />
                                                <span className="text-[10px] text-gray-300 truncate">{r.name}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

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
                                .filter(g => searchGymQuery === '' || g.name.toLowerCase().includes(searchGymQuery.toLowerCase()))
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
