import { useState, useMemo, useEffect } from 'react';
import GridCard from '../components/ProfileCard';
import ProfileDetail from '../components/ProfileDetail';
import { mockUsers, mockGyms } from '../lib/mock';
import { User, Goal, DayOfWeek, TimeBlock, ALL_GOALS, ALL_DAYS, ALL_TIME_BLOCKS, Gym } from '../types/database';
import { useAuth } from '../context/AuthContext';
import { Ghost, SlidersHorizontal, X, GraduationCap, Calendar, Target, MapPin, Navigation } from 'lucide-react';
import RequestModal from '../components/RequestModal';
import { motion, AnimatePresence } from 'framer-motion';
import { GeoCoords, getCurrentPosition, haversineDistance, formatDistance } from '../lib/location';

export default function Home() {
    const { user } = useAuth();

    // Filter state
    const [showFilters, setShowFilters] = useState(false);
    const [filterTrainer, setFilterTrainer] = useState(false);
    const [filterGoal, setFilterGoal] = useState<Goal | null>(null);
    const [filterDay, setFilterDay] = useState<DayOfWeek | null>(null);
    const [filterTime, setFilterTime] = useState<TimeBlock | null>(null);
    const [filterLevel, setFilterLevel] = useState<string | null>(null);
    const [filterGym, setFilterGym] = useState<string | null>(null);

    // Location state
    const [userLocation, setUserLocation] = useState<GeoCoords | null>(null);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');

    // Ask for location on mount
    useEffect(() => {
        setLocationStatus('loading');
        getCurrentPosition()
            .then(coords => {
                setUserLocation(coords);
                setLocationStatus('granted');
            })
            .catch(() => setLocationStatus('denied'));
    }, []);

    // Gyms sorted by distance
    const sortedGyms = useMemo(() => {
        if (!userLocation) return mockGyms;
        return [...mockGyms].sort((a, b) =>
            haversineDistance(userLocation, { lat: a.lat, lng: a.lng }) -
            haversineDistance(userLocation, { lat: b.lat, lng: b.lng })
        );
    }, [userLocation]);

    const getGymDistance = (gym: Gym) => {
        if (!userLocation) return null;
        return haversineDistance(userLocation, { lat: gym.lat, lng: gym.lng });
    };

    // Request Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetUser, setTargetUser] = useState<User | null>(null);

    // Profile Detail State
    const [detailUser, setDetailUser] = useState<User | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Exclude current user
    const allUsers = mockUsers.filter(u => u.id !== user?.id);

    // Apply filters
    const filteredUsers = useMemo(() => {
        let result = allUsers;

        if (filterTrainer) {
            result = result.filter(u => u.is_trainer);
        }

        if (filterGoal) {
            result = result.filter(u => u.goals?.includes(filterGoal));
        }

        if (filterLevel) {
            result = result.filter(u => u.fitness_level === filterLevel);
        }

        if (filterGym) {
            result = result.filter(u => u.home_gym === filterGym);
        }

        if (filterDay) {
            result = result.filter(u => {
                const daySlot = u.availability?.find(a => a.day === filterDay);
                if (!daySlot) return false;
                if (filterTime) {
                    return daySlot.blocks.includes(filterTime);
                }
                return true;
            });
        }

        return result;
    }, [allUsers, filterTrainer, filterGoal, filterDay, filterTime, filterLevel, filterGym]);

    const activeFilterCount = [filterTrainer, filterGoal, filterDay, filterTime, filterLevel, filterGym].filter(Boolean).length;

    const handleRequest = (u: User) => {
        setTargetUser(u);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTargetUser(null);
    };

    const clearFilters = () => {
        setFilterTrainer(false);
        setFilterGoal(null);
        setFilterDay(null);
        setFilterTime(null);
        setFilterLevel(null);
        setFilterGym(null);
    };

    const handleViewProfile = (u: User) => {
        setDetailUser(u);
        setIsDetailOpen(true);
    };

    return (
        <div className="flex flex-col w-full min-h-[calc(100vh-120px)] pb-32">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 mb-3">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">Discover</h1>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        {locationStatus === 'granted' && <Navigation size={9} className="text-lime" />}
                        {filteredUsers.length} partner{filteredUsers.length !== 1 ? 's' : ''} nearby
                    </p>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`relative p-2.5 rounded-xl border transition-all active:scale-95 ${showFilters || activeFilterCount > 0
                        ? 'bg-lime/10 border-lime/40 text-lime'
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                        }`}
                >
                    <SlidersHorizontal size={18} />
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-lime text-oled text-[9px] font-black flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-4">
                            {/* Quick Clear */}
                            {activeFilterCount > 0 && (
                                <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                                    <X size={12} /> Clear all filters
                                </button>
                            )}

                            {/* Trainer Toggle */}
                            <div className="flex items-center justify-between bg-gray-900/60 border border-gray-800 rounded-xl px-3 py-2.5">
                                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                                    <GraduationCap size={14} className="text-lime" /> Trainers Only
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={filterTrainer} onChange={(e) => setFilterTrainer(e.target.checked)} />
                                    <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-lime"></div>
                                </label>
                            </div>

                            {/* Nearby Gym Filter */}
                            <div>
                                <span className="text-xs font-semibold text-gray-400 flex items-center gap-1 mb-2"><MapPin size={12} /> Nearby Gym</span>
                                <div className="space-y-1.5">
                                    {sortedGyms.map(g => {
                                        const dist = getGymDistance(g);
                                        return (
                                            <button
                                                key={g.id}
                                                onClick={() => setFilterGym(filterGym === g.id ? null : g.id)}
                                                className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-xl border text-xs transition-all ${filterGym === g.id
                                                    ? 'bg-lime/10 border-lime/40 text-lime'
                                                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
                                                    }`}
                                            >
                                                <MapPin size={12} className={filterGym === g.id ? 'text-lime' : 'text-gray-600'} />
                                                <span className="flex-1 font-semibold">{g.name}</span>
                                                <span className="text-[10px] text-gray-500">{g.location}</span>
                                                {dist !== null && (
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${dist < 3 ? 'bg-lime/10 text-lime' : 'bg-gray-800 text-gray-500'}`}>
                                                        {formatDistance(dist)}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-gray-400 flex items-center gap-1 mb-2"><Target size={12} /> Goal</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {ALL_GOALS.map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setFilterGoal(filterGoal === g ? null : g)}
                                            className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all ${filterGoal === g
                                                ? 'bg-lime/20 border-lime/50 text-lime'
                                                : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
                                                }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Fitness Level */}
                            <div>
                                <span className="text-xs font-semibold text-gray-400 mb-2 block">Level</span>
                                <div className="flex gap-1.5">
                                    {['Beginner', 'Intermediate', 'Professional'].map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setFilterLevel(filterLevel === level ? null : level)}
                                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${filterLevel === level
                                                ? 'bg-lime/20 border-lime/50 text-lime'
                                                : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Availability Filter */}
                            <div>
                                <span className="text-xs font-semibold text-gray-400 flex items-center gap-1 mb-2"><Calendar size={12} /> Available On</span>
                                <div className="flex gap-1 mb-2">
                                    {ALL_DAYS.map(day => (
                                        <button
                                            key={day}
                                            onClick={() => { setFilterDay(filterDay === day ? null : day); if (filterDay === day) setFilterTime(null); }}
                                            className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg border text-center transition-all ${filterDay === day
                                                ? 'bg-lime/20 border-lime/50 text-lime'
                                                : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600'
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                                {filterDay && (
                                    <div className="flex gap-1.5">
                                        {ALL_TIME_BLOCKS.map(block => (
                                            <button
                                                key={block}
                                                onClick={() => setFilterTime(filterTime === block ? null : block)}
                                                className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${filterTime === block
                                                    ? 'bg-lime/20 border-lime/50 text-lime'
                                                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
                                                    }`}
                                            >
                                                {block}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Grid */}
            <div className="px-4">
                {filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-gray-500 gap-4 py-20">
                        <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
                            <Ghost size={32} className="text-gray-600" />
                        </div>
                        <p className="text-center font-medium">No partners match your filters.</p>
                        <button onClick={clearFilters} className="text-sm text-lime hover:underline">Clear filters</button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filteredUsers.map((feedUser, index) => (
                            <GridCard
                                key={feedUser.id}
                                user={feedUser}
                                index={index}
                                onRequest={handleRequest}
                                onViewProfile={handleViewProfile}
                            />
                        ))}
                    </div>
                )}
            </div>

            {targetUser && (
                <RequestModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    user={targetUser}
                />
            )}

            <ProfileDetail
                user={detailUser}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                onRequest={handleRequest}
            />
        </div>
    );
}
