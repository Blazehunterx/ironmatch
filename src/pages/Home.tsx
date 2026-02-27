import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGyms } from '../context/GymContext';
import { supabase } from '../lib/supabase';
import { Filter, RefreshCw, Ghost } from 'lucide-react';
import RequestModal from '../components/RequestModal';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Goal, DayOfWeek, TimeBlock } from '../types/database';
import ActiveToggle from '../components/ActiveToggle';
import ProfileCard from '../components/ProfileCard';
import ProfileDetail from '../components/ProfileDetail';
import CollectiveMilestones from '../components/CollectiveMilestones';

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

    // Gym discovery from context
    const { gyms: sortedGyms } = useGyms();

    // Request Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetUser, setTargetUser] = useState<User | null>(null);

    // Profile Detail State
    const [detailUser, setDetailUser] = useState<User | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Real Data Persistence
    const [allProfiles, setAllProfiles] = useState<User[]>([]);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

    const fetchProfiles = async () => {
        setIsLoadingProfiles(true);
        try {
            const { data, error } = await supabase.from('profiles').select('*');
            if (!error && data) {
                setAllProfiles(data);
            }
        } catch (err) {
            console.error('Failed to fetch profiles:', err);
        } finally {
            setIsLoadingProfiles(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    // Exclude current user
    const allUsers = allProfiles.filter(u => u.id !== user?.id);

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

    const handleViewProfile = (u: User) => {
        setDetailUser(u);
        setIsDetailOpen(true);
    };

    return (
        <div className="px-4 pb-20 pt-6">
            {/* Header / Welcome */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Active Buddies</h1>
                    <p className="text-gray-500 text-sm font-medium">Find your next training partner</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-3 rounded-2xl border transition-all relative ${showFilters ? 'bg-lime border-lime text-oled shadow-lg' : 'bg-gray-900 border-gray-800 text-gray-400'
                            }`}
                    >
                        <Filter size={20} />
                        {activeFilterCount > 0 && !showFilters && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-lime text-oled text-[10px] font-black rounded-full flex items-center justify-center border-2 border-oled">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={fetchProfiles}
                        className="p-3 bg-gray-900 border border-gray-800 rounded-2xl text-gray-400 hover:text-lime transition-all"
                    >
                        <RefreshCw size={20} className={isLoadingProfiles ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <ActiveToggle />
            </div>

            <div className="mb-8">
                <CollectiveMilestones milestones={[]} />
            </div>

            {/* Filters Drawer */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8 overflow-hidden"
                    >
                        <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-3xl space-y-6">
                            <div className="flex justify-between items-center pb-2">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Filter Preferences</h3>
                                <button
                                    onClick={() => {
                                        setFilterTrainer(false);
                                        setFilterGoal(null);
                                        setFilterDay(null);
                                        setFilterTime(null);
                                        setFilterLevel(null);
                                        setFilterGym(null);
                                    }}
                                    className="text-[10px] font-black text-lime hover:underline"
                                >
                                    RESET ALL
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-600 block mb-2 uppercase tracking-tight">Home Gym</label>
                                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                        <button
                                            onClick={() => setFilterGym(null)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${!filterGym ? 'bg-lime border-lime text-oled' : 'bg-gray-900 border-gray-800 text-gray-400'}`}
                                        >
                                            All Gyms
                                        </button>
                                        {sortedGyms.slice(0, 5).map(g => (
                                            <button
                                                key={g.id}
                                                onClick={() => setFilterGym(g.id)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${filterGym === g.id ? 'bg-lime border-lime text-oled' : 'bg-gray-900 border-gray-800 text-gray-400'}`}
                                            >
                                                {g.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            {isLoadingProfiles ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-4 border-lime/20 border-t-lime rounded-full animate-spin" />
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-600">Syncing profiles...</p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-20 px-8">
                    <div className="w-16 h-16 bg-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-gray-800">
                        <Ghost className="text-gray-700" size={32} />
                    </div>
                    <h3 className="text-white font-bold mb-1">No matches found</h3>
                    <p className="text-gray-500 text-sm">Try adjusting your filters to find more training partners.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredUsers.map((u, i) => (
                        <ProfileCard
                            key={u.id}
                            user={u}
                            index={i}
                            onRequest={handleRequest}
                            onViewProfile={handleViewProfile}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {targetUser && (
                <RequestModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    user={targetUser}
                />
            )}

            {detailUser && (
                <ProfileDetail
                    isOpen={isDetailOpen}
                    onClose={() => setIsDetailOpen(false)}
                    user={detailUser}
                    onRequest={handleRequest}
                />
            )}
        </div>
    );
}
