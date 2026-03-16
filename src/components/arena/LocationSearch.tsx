import { useState, useEffect } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { searchAddress, GeocodeResult } from '../../lib/geocoding';
import { useGyms } from '../../context/GymContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function LocationSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<GeocodeResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { searchGymsByLocation, refreshGyms, userLocation } = useGyms();

    useEffect(() => {
        if (query.length < 3) {
            setResults([]);
            return;
        }

        const handler = setTimeout(async () => {
            setIsLoading(true);
            const res = await searchAddress(query);
            setResults(res);
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(handler);
    }, [query]);

    const handleSelect = async (res: GeocodeResult) => {
        setQuery(res.name);
        setResults([]);
        await searchGymsByLocation(res.lat, res.lng);
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        refreshGyms();
    };

    return (
        <div className="relative px-4 mb-4 z-40">
            <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    {isLoading ? <Loader2 size={16} className="text-lime animate-spin" /> : <Search size={16} className="text-gray-500 group-focus-within:text-lime transition-colors" />}
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by city or address (e.g. Noordweg)..."
                    className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-gray-600"
                />
                {query && (
                    <button 
                        onClick={handleClear}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-4 right-4 mt-2 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl"
                    >
                        {results.map((r, i) => (
                            <button
                                key={i}
                                onClick={() => handleSelect(r)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 text-left transition-colors border-b border-gray-800 last:border-0"
                            >
                                <MapPin size={16} className="text-lime shrink-0" />
                                <span className="text-xs text-gray-300 truncate">{r.name}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            
            {!query && userLocation && (
                <div className="mt-2 flex items-center gap-2 px-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                       Showing gyms near you
                   </span>
                </div>
            )}
        </div>
    );
}
