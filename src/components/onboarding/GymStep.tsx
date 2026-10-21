import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, MapPin, Check, Loader2, Navigation, 
    Plus, Building2, Sparkles, X, RotateCw 
} from 'lucide-react';
import { searchAddress, GeocodeResult } from '../../lib/geocoding';
import { useGyms } from '../../context/GymContext';
import { Gym } from '../../types/database';

interface GymStepProps {
    allGyms: Gym[];
    homeGym: string;
    searchGymQuery: string;
    isLoadingGyms: boolean;
    locationStatus: string;
    onSetHomeGym: (id: string) => void;
    onSearchChange: (query: string) => void;
    onRefresh: () => void;
    onAddCustomGymDetails?: (name: string, location: string) => Promise<string>;
}

const REGION_PRESETS = [
    { id: 'all', label: 'All Global', flag: '🌐' },
    { id: 'nl', label: 'Netherlands', flag: '🇳🇱', filterKeywords: ['netherlands', 'amsterdam', 'utrecht', 'rotterdam'] },
    { id: 'uk', label: 'United Kingdom', flag: '🇬🇧', filterKeywords: ['united kingdom', 'london', 'uk', 'manchester'] },
    { id: 'us', label: 'United States', flag: '🇺🇸', filterKeywords: ['usa', 'los angeles', 'new york', 'texas', 'california'] },
    { id: 'de', label: 'Germany', flag: '🇩🇪', filterKeywords: ['germany', 'berlin', 'cologne', 'munich'] },
    { id: 'id', label: 'Bali / Indonesia', flag: '🇮🇩', filterKeywords: ['bali', 'canggu', 'indonesia', 'jakarta'] },
    { id: 'au', label: 'Australia', flag: '🇦🇺', filterKeywords: ['australia', 'sydney', 'melbourne'] },
    { id: 'es', label: 'Spain & Europe', flag: '🇪🇸', filterKeywords: ['spain', 'barcelona', 'france', 'paris', 'europe'] },
];

const GymStep: React.FC<GymStepProps> = ({
    allGyms, homeGym, searchGymQuery, isLoadingGyms, locationStatus,
    onSetHomeGym, onSearchChange, onRefresh, onAddCustomGymDetails
}) => {
    const { searchGymsByLocation, userLocation, addCustomGym } = useGyms();
    const [geoResults, setGeoResults] = useState<GeocodeResult[]>([]);
    const [isGeoLoading, setIsGeoLoading] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState<string>('all');
    
    // Custom Gym Inline Modal State
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customGymName, setCustomGymName] = useState('');
    const [customGymCity, setCustomGymCity] = useState('');
    const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);

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
    }, [searchGymQuery, userLocation]);

    const handleSelectGeo = async (res: GeocodeResult) => {
        onSearchChange('');
        setGeoResults([]);
        await searchGymsByLocation(res.lat, res.lng);
    };

    const handleCreateCustomGym = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customGymName.trim()) return;

        setIsSubmittingCustom(true);
        try {
            const loc = customGymCity.trim() || 'Worldwide Facility';
            let newId = '';
            if (onAddCustomGymDetails) {
                newId = await onAddCustomGymDetails(customGymName.trim(), loc);
            } else {
                newId = await addCustomGym(customGymName.trim(), loc);
            }
            onSetHomeGym(newId);
            setShowCustomModal(false);
            setCustomGymName('');
            setCustomGymCity('');
        } catch (err) {
            console.error('Failed to add custom gym:', err);
        } finally {
            setIsSubmittingCustom(false);
        }
    };

    // Filter gyms by search query and region
    const filteredGyms = allGyms.filter(gym => {
        const matchesSearch = searchGymQuery === '' || 
            gym.name.toLowerCase().includes(searchGymQuery.toLowerCase()) ||
            gym.location.toLowerCase().includes(searchGymQuery.toLowerCase());

        if (!matchesSearch) return false;
        if (selectedRegion === 'all') return true;

        const region = REGION_PRESETS.find(r => r.id === selectedRegion);
        if (!region || !region.filterKeywords) return true;

        const locLower = gym.location.toLowerCase();
        const nameLower = gym.name.toLowerCase();
        return region.filterKeywords.some(kw => locLower.includes(kw) || nameLower.includes(kw));
    });

    const activeSelectedGym = allGyms.find(g => g.id === homeGym);

    return (
        <div className="flex-1 flex flex-col">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <h2 className="text-2xl font-black text-white mb-1">Select Your Home Gym</h2>
                <p className="text-sm text-gray-400 mb-3">
                    Attach yourself to a main gym anywhere in the world to join the local floor roster.
                </p>

                {/* Selected Gym Active Highlight Banner */}
                {activeSelectedGym && (
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-3.5 mb-3 rounded-2xl bg-lime/15 border border-lime/50 flex items-center justify-between shadow-[0_0_20px_rgba(50,255,50,0.15)]"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-lime text-oled flex items-center justify-center font-black shrink-0">
                                <MapPin size={20} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-black uppercase text-white truncate">
                                        {activeSelectedGym.name}
                                    </span>
                                    <span className="text-[9px] bg-lime text-oled px-1.5 py-0.2 rounded font-black uppercase">
                                        Attached
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-300 truncate">
                                    {activeSelectedGym.location} · {activeSelectedGym.member_count || 1} Lifters
                                </p>
                            </div>
                        </div>
                        <Check size={18} className="text-lime shrink-0 mr-1" />
                    </motion.div>
                )}
            </motion.div>

            {/* Worldwide Region Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-2">
                {REGION_PRESETS.map(r => (
                    <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRegion(r.id)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-all border ${
                            selectedRegion === r.id
                                ? 'bg-lime text-oled border-lime shadow-[0_0_12px_rgba(50,255,50,0.25)]'
                                : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-white'
                        }`}
                    >
                        <span>{r.flag}</span>
                        <span>{r.label}</span>
                    </button>
                ))}
            </div>

            {/* Search Input Bar */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                className="flex items-center gap-2 mb-3">
                <div className="bg-gray-950 border border-gray-800 rounded-2xl p-3 flex items-center gap-3 flex-1 relative focus-within:border-lime/50">
                    {isGeoLoading ? <Loader2 size={18} className="text-lime animate-spin shrink-0" /> : <Search size={18} className="text-gray-500 shrink-0" />}
                    <input
                        type="text"
                        placeholder="Search any gym or city worldwide (e.g. Amsterdam, London, LA)..."
                        value={searchGymQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="bg-transparent text-white text-xs w-full focus:outline-none placeholder:text-gray-600 font-bold"
                    />

                    <AnimatePresence>
                        {geoResults.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-gray-950 border border-lime/30 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-60 overflow-y-auto"
                            >
                                <div className="p-2 border-b border-gray-800 bg-gray-900/50">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">
                                        OpenStreetMap Global Locations
                                    </p>
                                </div>
                                {geoResults.map((r, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleSelectGeo(r)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 text-left transition-colors border-b border-gray-800/80 last:border-0"
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
                    type="button"
                    onClick={onRefresh}
                    title="Refresh local facilities"
                    className="p-3 bg-gray-950 hover:bg-gray-900 border border-gray-800 text-gray-400 hover:text-lime rounded-2xl shrink-0 transition"
                >
                    <RotateCw size={16} className={isLoadingGyms ? 'animate-spin text-lime' : ''} />
                </button>

                <button
                    type="button"
                    onClick={() => setShowCustomModal(true)}
                    className="p-3 bg-gray-900 hover:bg-gray-800 border border-lime/30 text-lime rounded-2xl flex items-center gap-1.5 text-xs font-black shrink-0 transition"
                >
                    <Plus size={16} /> Add Custom
                </button>
            </motion.div>

            {locationStatus === 'denied' && !activeSelectedGym && (
                <p className="text-[10px] text-gray-500 mb-2 font-mono px-1">
                    Tip: Select your country flag above or type any gym worldwide.
                </p>
            )}

            {/* GYM LIST */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
                className="flex-1 overflow-y-auto space-y-2 pb-20">
                {isLoadingGyms && (
                    <div className="flex items-center justify-between px-2 py-1 text-[10px] text-gray-500 font-mono">
                        <span className="flex items-center gap-1.5 text-lime">
                            <span className="w-2 h-2 rounded-full bg-lime animate-ping" />
                            Scanning nearby facilities...
                        </span>
                        <span>Global Directory Active</span>
                    </div>
                )}

                {filteredGyms.length === 0 && !isLoadingGyms ? (
                    <div className="p-8 text-center bg-gray-950 rounded-3xl border border-dashed border-gray-800 space-y-3">
                        <Building2 size={32} className="text-gray-600 mx-auto" />
                        <div>
                            <h4 className="text-xs font-bold text-white mb-0.5">Gym not found in this region?</h4>
                            <p className="text-[10px] text-gray-400 max-w-xs mx-auto">
                                Type your gym name and city to attach yourself as the founding lifter.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowCustomModal(true)}
                            className="px-4 py-2 rounded-xl bg-lime text-oled font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(50,255,50,0.3)]"
                        >
                            <Plus size={14} /> Attach Any Gym in the World
                        </button>
                    </div>
                ) : (
                    <>
                        {filteredGyms.slice(0, 40).map((gym) => {
                            const isSelected = homeGym === gym.id;
                            return (
                                <button
                                    key={gym.id}
                                    type="button"
                                    onClick={() => onSetHomeGym(gym.id)}
                                    className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                                        isSelected
                                            ? 'bg-lime/10 border-lime shadow-[0_0_15px_rgba(50,255,50,0.15)]'
                                            : 'bg-gray-950 border-gray-800/90 hover:border-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                            isSelected ? 'bg-lime text-oled font-black' : 'bg-gray-900 text-gray-400 border border-gray-800'
                                        }`}>
                                            <Building2 size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <p className={`font-bold truncate text-xs ${isSelected ? 'text-lime' : 'text-white'}`}>
                                                    {gym.name}
                                                </p>
                                                {gym.member_count && gym.member_count > 40 && (
                                                    <span className="text-[8px] bg-white/10 text-gray-300 font-mono px-1 rounded">
                                                        POPULAR
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-400 truncate mt-0.5">
                                                {gym.location}
                                            </p>
                                        </div>
                                        {isSelected && <Check size={18} className="text-lime shrink-0" />}
                                    </div>
                                </button>
                            );
                        })}

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => setShowCustomModal(true)}
                                className="w-full py-3 rounded-2xl border border-dashed border-gray-800 hover:border-lime/40 text-gray-400 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2"
                            >
                                <Plus size={14} className="text-lime" /> Attach Any Other Gym Worldwide
                            </button>
                        </div>
                    </>
                )}
            </motion.div>

            {/* ATTACH ANY GYM WORLDWIDE MODAL */}
            <AnimatePresence>
                {showCustomModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-sm bg-gray-950 border border-lime/40 rounded-3xl p-5 space-y-4 shadow-2xl"
                        >
                            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                                        Attach Any Gym Worldwide
                                    </h3>
                                    <p className="text-[10px] text-gray-400">
                                        Represent your facility on the National Whiteboard
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowCustomModal(false)}
                                    className="p-1 rounded-xl text-gray-400 hover:text-white"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateCustomGym} className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                                        Gym / Facility Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Basic-Fit Rembrandtplein, Equinox, PureGym"
                                        value={customGymName}
                                        onChange={e => setCustomGymName(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:border-lime focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                                        City & Country *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Amsterdam, Netherlands or London, UK"
                                        value={customGymCity}
                                        onChange={e => setCustomGymCity(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:border-lime focus:outline-none"
                                    />
                                </div>

                                <div className="p-3 rounded-xl bg-lime/10 border border-lime/30 text-[10px] text-lime flex items-center gap-2">
                                    <Sparkles size={16} className="shrink-0" />
                                    <span>You will become the founding lifter representing this gym floor!</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmittingCustom || !customGymName.trim()}
                                    className="w-full py-3.5 rounded-2xl bg-lime text-oled font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(50,255,50,0.3)] disabled:opacity-50"
                                >
                                    {isSubmittingCustom ? 'Attaching Facility...' : 'Attach as Main Gym 📍'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GymStep;
