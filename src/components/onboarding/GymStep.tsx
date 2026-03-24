import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, MapPin, Check, Loader2, Navigation } from 'lucide-react';
import { searchAddress, GeocodeResult } from '../../lib/geocoding';
import { useGyms } from '../../context/GymContext';

interface GymStepProps {
    allGyms: any[];
    homeGym: string;
    searchGymQuery: string;
    isLoadingGyms: boolean;
    locationStatus: string;
    onSetHomeGym: (id: string) => void;
    onSearchChange: (query: string) => void;
    onRefresh: () => void;
    onAddCustom: () => void;
}

const GymStep: React.FC<GymStepProps> = ({
    allGyms, homeGym, searchGymQuery, isLoadingGyms, locationStatus,
    onSetHomeGym, onSearchChange, onRefresh, onAddCustom
}) => {
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
        onSearchChange(''); // Clear filter to show all gyms nearby
        setGeoResults([]);
        await searchGymsByLocation(res.lat, res.lng);
    };

    return (
        <div className="flex-1 flex flex-col">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <h2 className="text-2xl font-black text-white mb-1">Your Home Gym</h2>
                <p className="text-sm text-gray-500 mb-6">Where do you train the most? We'll match you with locals.</p>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                className="flex items-center gap-2 mb-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3 flex items-center gap-3 flex-1 relative">
                    {isGeoLoading ? <Loader2 size={18} className="text-lime animate-spin" /> : <Search size={18} className="text-gray-500" />}
                    <input
                        type="text"
                        placeholder="Search for a gym or city..."
                        value={searchGymQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="bg-transparent text-white text-sm w-full focus:outline-none placeholder:text-gray-600 font-bold"
                    />

                    <AnimatePresence>
                        {geoResults.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl z-50"
                            >
                                <div className="p-2 border-b border-gray-800 bg-gray-900/50">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2">Locations</p>
                                </div>
                                {geoResults.map((r, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSelectGeo(r)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 text-left transition-colors border-b border-gray-800 last:border-0"
                                    >
                                        <Navigation size={12} className="text-lime shrink-0" />
                                        <span className="text-[11px] text-gray-300 truncate">{r.name}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <button
                    onClick={onRefresh}
                    className="p-3 bg-gray-900 border border-gray-800 rounded-2xl text-gray-400 hover:text-lime transition-colors"
                >
                    <Zap size={18} className={isLoadingGyms ? 'animate-pulse text-lime' : ''} />
                </button>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                className="flex-1 overflow-y-auto space-y-2 pb-24">
                {locationStatus === 'denied' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                        <p className="text-xs text-red-400 font-bold mb-1">Location Access Denied</p>
                        <p className="text-[10px] text-gray-500">Enable it in settings or add manually.</p>
                    </div>
                )}

                {isLoadingGyms ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="w-8 h-8 border-4 border-lime/20 border-t-lime rounded-full animate-spin" />
                        <p className="text-xs text-gray-500 font-bold animate-pulse">Scanning local area...</p>
                    </div>
                ) : (
                    <>
                        {allGyms
                            .filter(g => searchGymQuery === '' || g.name.toLowerCase().includes(searchGymQuery.toLowerCase()))
                            .slice(0, 50)
                            .map((gym) => (
                                <button
                                    key={gym.id}
                                    onClick={() => onSetHomeGym(gym.id)}
                                    className={`w-full p-3 rounded-xl border text-left transition-all ${homeGym === gym.id ? 'bg-lime/10 border-lime/40' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                                            <MapPin size={18} className={homeGym === gym.id ? 'text-lime' : 'text-gray-500'} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold truncate text-sm ${homeGym === gym.id ? 'text-lime' : 'text-white'}`}>{gym.name}</p>
                                            <p className="text-[10px] text-gray-500 truncate mt-0.5">{gym.location}</p>
                                        </div>
                                        {homeGym === gym.id && <Check size={16} className="text-lime shrink-0" />}
                                    </div>
                                </button>
                            ))}

                        <div className="pt-4">
                            <button
                                onClick={onAddCustom}
                                className="w-full py-3 rounded-xl border border-dashed border-gray-700 text-gray-400 text-xs font-bold hover:border-lime/50 hover:text-lime transition-all"
                            >
                                + Add Custom Gym
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default GymStep;
