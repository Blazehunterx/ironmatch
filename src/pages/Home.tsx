import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGyms } from '../context/GymContext';
import { supabase } from '../lib/supabase';
import { RefreshCw, LayoutGrid, Users, MapPin, X, Filter } from 'lucide-react';
import RequestModal from '../components/RequestModal';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Goal, DayOfWeek, TimeBlock } from '../types/database';
import ActiveToggle from '../components/ActiveToggle';
import ProfileCard from '../components/ProfileCard';
import ProfileDetail from '../components/ProfileDetail';
import SocialFeed from '../components/SocialFeed';
import GymWarArena from '../components/GymWarArena';
import StoryViewer from '../components/StoryViewer';
import { Story } from '../types/database';

export default function Home() {
    const { user } = useAuth();
    const { findGym, getActiveWar } = useGyms();

    // State for profiles, stories and war
    const [allProfiles, setAllProfiles] = useState<User[]>([]);
    const [activeStories, setActiveStories] = useState<Story[]>([]);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
    const [activeWar, setActiveWar] = useState<any>(null);
    const [showArena, setShowArena] = useState(false);
    const [showStories, setShowStories] = useState(false);
    const [startStoryIndex, setStartStoryIndex] = useState(0);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetUser, setTargetUser] = useState<User | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailUser, setDetailUser] = useState<User | null>(null);

    // Filter state
    const [showFilters, setShowFilters] = useState(false);
    const [filterTrainer] = useState(false);
    const [filterGoal] = useState<Goal | null>(null);
    const [filterDay] = useState<DayOfWeek | null>(null);
    const [filterTime] = useState<TimeBlock | null>(null);
    const [filterLevel] = useState<string | null>(null);
    const [filterGym] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'feed' | 'buddies'>('feed');

    const fetchProfiles = async () => {
        setIsLoadingProfiles(true);
        try {
            const { data, error } = await supabase.from('profiles').select('*');
            if (!error && data) {
                setAllProfiles(data);
            }

            // Fetch active stories
            const { data: storyData } = await supabase
                .from('stories')
                .select('*, profiles:profiles!stories_author_id_fkey(name, profile_image_url)')
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false });

            if (storyData) {
                setActiveStories(storyData as any);
            }

            if (user?.home_gym) {
                const war = await getActiveWar(user.home_gym);
                setActiveWar(war);
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

    const allUsers = allProfiles.filter(u => u.id !== user?.id);

    const filteredUsers = useMemo(() => {
        let result = allUsers;
        if (filterTrainer) result = result.filter(u => u.is_trainer);
        if (filterGoal) result = result.filter(u => u.goals?.includes(filterGoal));
        if (filterLevel) result = result.filter(u => u.fitness_level === filterLevel);
        if (filterGym) result = result.filter(u => u.home_gym === filterGym);
        if (filterDay) {
            result = result.filter(u => {
                const daySlot = u.availability?.find(a => a.day === filterDay);
                if (!daySlot) return false;
                if (filterTime) return daySlot.blocks.includes(filterTime);
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

    const handleViewStory = (index: number) => {
        setStartStoryIndex(index);
        setShowStories(true);
    };

    return (
        <div className="px-4 pb-20 pt-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight italic uppercase">Social Hub</h1>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Connect and track progress</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-3 rounded-2xl border transition-all relative ${showFilters ? 'bg-lime border-lime text-oled shadow-lg' : 'bg-gray-900 border-gray-800 text-gray-400'}`}
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

            <div className="flex bg-gray-900/50 p-1.5 rounded-2xl mb-6 border border-gray-800">
                <button
                    onClick={() => setActiveTab('feed')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'feed' ? 'bg-lime text-oled shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                    <LayoutGrid size={14} /> Global Feed
                </button>
                <button
                    onClick={() => setActiveTab('buddies')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'buddies' ? 'bg-lime text-oled shadow-lg' : 'text-gray-500 hover:white'}`}
                >
                    <Users size={14} /> Find Buddies
                </button>
            </div>

            {activeTab === 'feed' ? (
                <div className="space-y-6">
                    {/* Recently Active (Stories) */}
                    <div className="mb-4">
                        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                            {/* Show everyone with an active story first, then founding trainers */}
                            {allProfiles
                                .filter(u => u.is_founding_trainer || activeStories.some(s => s.author_id === u.id))
                                .sort((a, b) => {
                                    const aHasStory = activeStories.some(s => s.author_id === a.id);
                                    const bHasStory = activeStories.some(s => s.author_id === b.id);
                                    if (aHasStory && !bHasStory) return -1;
                                    if (!aHasStory && bHasStory) return 1;
                                    return 0;
                                })
                                .map((u) => {
                                    const hasActiveStory = activeStories.some(s => s.author_id === u.id);
                                    return (
                                        <motion.div
                                            key={u.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            onClick={() => hasActiveStory ? handleViewStory(activeStories.findIndex(s => s.author_id === u.id)) : handleViewProfile(u)}
                                            className="flex flex-col items-center shrink-0 cursor-pointer group"
                                        >
                                            <div className={`w-16 h-16 rounded-full p-[2px] mb-1 ${hasActiveStory ? 'bg-gradient-to-br from-lime to-emerald-500 shadow-[0_0_15px_rgba(163,230,53,0.3)]' : 'bg-gray-800'}`}>
                                                <img src={u.profile_image_url} alt={u.name} className="w-full h-full rounded-full border-2 border-oled object-cover bg-gray-900" />
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors truncate w-16 text-center ${hasActiveStory ? 'text-lime' : 'text-gray-500'}`}>
                                                {u.name.split(' ')[0]}
                                            </span>
                                        </motion.div>
                                    );
                                })}
                        </div>
                    </div>

                    <SocialFeed gymId={filterGym} onStoryCreated={fetchProfiles} />
                </div>
            ) : (
                <>
                    <div className="mb-6">
                        <ActiveToggle />
                    </div>

                    {isLoadingProfiles ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-lime/20 border-t-lime rounded-full animate-spin" />
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-600">Syncing profiles...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-20 px-8 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-lime/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-16 h-16 bg-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-gray-800 relative z-10">
                                <MapPin className="text-lime" size={32} />
                            </div>
                            <h3 className="text-white font-bold mb-2 relative z-10">Pioneer of {findGym(filterGym || user?.home_gym || '')?.name || 'this Gym'}</h3>
                            <p className="text-gray-400 text-xs leading-relaxed relative z-10">You are the first to claim this territory! Invite your lifting partner to start building your squad and dominating the leaderboards.</p>
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
                </>
            )}

            <AnimatePresence>
                {showStories && activeStories.length > 0 && (
                    <StoryViewer
                        stories={activeStories}
                        initialIndex={startStoryIndex}
                        onClose={() => setShowStories(false)}
                    />
                )}
            </AnimatePresence>

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

            <AnimatePresence>
                {showArena && activeWar && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowArena(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="bg-oled border-t border-gray-800 sm:border border-gray-800 w-full max-w-lg h-[80vh] sm:rounded-2xl overflow-hidden z-10 relative"
                        >
                            <GymWarArena
                                war={activeWar}
                                gym1={findGym(activeWar.gym_1_id)!}
                                gym2={findGym(activeWar.gym_2_id)!}
                                onClose={() => setShowArena(false)}
                            />
                            <button
                                onClick={() => setShowArena(false)}
                                className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-colors z-20"
                            >
                                <X size={20} />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
