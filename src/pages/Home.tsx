import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGyms } from '../context/GymContext';
import { supabase } from '../lib/supabase';
import { RefreshCw, LayoutGrid, Users, MapPin, X, Filter, Dumbbell } from 'lucide-react';
import RequestModal from '../components/RequestModal';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Goal, DayOfWeek, TimeBlock } from '../types/database';
import ActiveToggle from '../components/ActiveToggle';
import ProfileDetail from '../components/ProfileDetail';
import SocialFeed from '../components/SocialFeed';
import GymWarArena from '../components/GymWarArena';
import StoryViewer from '../components/StoryViewer';
import PlacementMatchModal from '../components/placement/PlacementMatchModal';
import GymFloorRoster from '../components/squads/GymFloorRoster';
import { getUserSquad } from '../lib/squads';
import { Story, GymSquad } from '../types/database';

export default function Home() {
    const { user } = useAuth();
    const { findGym, getActiveWar, gyms } = useGyms();

    // State for profiles, stories and war
    const [allProfiles, setAllProfiles] = useState<User[]>([]);
    const [activeStories, setActiveStories] = useState<Story[]>([]);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
    const [activeWar, setActiveWar] = useState<any>(null);
    const [showArena, setShowArena] = useState(false);
    const [showStories, setShowStories] = useState(false);
    const [startStoryIndex, setStartStoryIndex] = useState(0);
    const [userSquad] = useState<GymSquad | null>(() => getUserSquad(user?.id || ''));

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetUser, setTargetUser] = useState<User | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailUser, setDetailUser] = useState<User | null>(null);

    // Filter state
    const [showFilters, setShowFilters] = useState(false);
    const [showPlacementModal, setShowPlacementModal] = useState(false);
    const [filterTrainer] = useState(false);
    const [filterGoal] = useState<Goal | null>(null);
    const [filterDay] = useState<DayOfWeek | null>(null);
    const [filterTime] = useState<TimeBlock | null>(null);
    const [filterLevel] = useState<string | null>(null);
    const [filterGym] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'feed' | 'buddies'>('feed');
    const [feedScope, setFeedScope] = useState<'my_gym' | 'global'>('my_gym');

    const activeGym = findGym(user?.home_gym || '') || (gyms.length > 0 ? gyms[0] : null);
    const currentGymId = feedScope === 'my_gym' ? (user?.home_gym || activeGym?.id || null) : filterGym;

    const fetchProfiles = async () => {
        setIsLoadingProfiles(true);
        try {
            // 1. Fetch only essential profiles for stories bar
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, profile_image_url, is_founding_trainer, home_gym')
                .or('is_founding_trainer.eq.true, verification_status.eq.verified')
                .limit(50);
                
            if (!error && data) {
                setAllProfiles(data as any[]);
            }

            // 2. Fetch active stories with specific selection
            const { data: storyData } = await supabase
                .from('stories')
                .select('id, author_id, media_url, media_type, content, created_at, expires_at, profiles:profiles!stories_author_id_fkey(name, profile_image_url)')
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
            console.error('Failed to fetch home data:', err);
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

            {/* Provisional Rank Placement Banner */}
            {(!user?.big4 || (user.big4.bench + user.big4.squat + user.big4.deadlift + user.big4.ohp) === 0) && (
                <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-lime/20 via-gray-900 to-black border border-lime/40 flex items-center justify-between gap-3 shadow-lg shadow-lime/5">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🌱</span>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-black text-white uppercase italic">Provisional · Unranked</h4>
                                <span className="text-[8px] bg-lime text-oled px-1.5 py-0.2 rounded font-black uppercase">Tutorial</span>
                            </div>
                            <p className="text-[10px] text-gray-400">Snap your bar to unlock Ranked Arena & AI Split</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowPlacementModal(true)}
                        className="px-3.5 py-2 rounded-xl bg-lime text-oled font-black text-xs uppercase tracking-wider shrink-0 hover:scale-105 active:scale-95 transition shadow-[0_0_12px_rgba(50,255,50,0.3)]"
                    >
                        Placement ⚡
                    </button>
                </div>
            )}

            <div className="flex bg-gray-900/50 p-1.5 rounded-2xl mb-6 border border-gray-800">
                <button
                    onClick={() => setActiveTab('feed')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'feed' ? 'bg-lime text-oled shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                    <LayoutGrid size={14} /> Feed & Activity
                </button>
                <button
                    onClick={() => setActiveTab('buddies')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'buddies' ? 'bg-lime text-oled shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                    <Users size={14} /> Gym Floor Roster
                </button>
            </div>

            {activeTab === 'feed' ? (
                <div className="space-y-4">
                    {/* Facility Anchor Card */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-lime/10 via-gray-950 to-oled border border-lime/30 flex items-center justify-between shadow-[0_0_20px_rgba(50,255,50,0.08)]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-lime/10 border border-lime/30 flex items-center justify-center text-lime font-black shrink-0">
                                <MapPin size={18} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-black uppercase text-lime tracking-widest block">Home Facility</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                                </div>
                                <h3 className="text-xs sm:text-sm font-black text-white uppercase italic tracking-wide truncate">
                                    {activeGym?.name || user?.home_gym_name || 'Global Lifters Facility'}
                                </h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/5 shrink-0 ml-2">
                            <button
                                onClick={() => setFeedScope('my_gym')}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition ${
                                    feedScope === 'my_gym' ? 'bg-lime text-black shadow-sm' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Facility
                            </button>
                            <button
                                onClick={() => setFeedScope('global')}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition ${
                                    feedScope === 'global' ? 'bg-lime text-black shadow-sm' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Global
                            </button>
                        </div>
                    </div>

                    {/* Recently Active (Stories) */}
                    <div className="mb-2">
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

                    <SocialFeed gymId={currentGymId} onStoryCreated={fetchProfiles} />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="mb-4">
                        <ActiveToggle />
                    </div>

                    {user && (
                        <GymFloorRoster
                            currentUser={user}
                            gymLifters={filteredUsers}
                            gymName={activeGym?.name || user?.home_gym_name || 'Gym Floor'}
                            gymId={currentGymId || 'facility-main'}
                            userSquad={userSquad}
                            onInviteToSquad={(targetUser) => {
                                handleRequest(targetUser);
                            }}
                            onOpenChat={(targetUser) => {
                                handleViewProfile(targetUser);
                            }}
                        />
                    )}
                </div>
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

            {/* Quick Floating Action for In-Gym Workout */}
            <div className="fixed bottom-20 right-4 z-40">
                <Link
                    to="/workouts"
                    className="px-4 py-3 bg-lime text-oled rounded-2xl font-black shadow-[0_0_20px_rgba(50,255,50,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-xs border border-lime/50"
                >
                    <Dumbbell size={18} />
                    <span className="font-black uppercase italic tracking-wider">Start Workout</span>
                </Link>
            </div>

            <PlacementMatchModal
                isOpen={showPlacementModal}
                onClose={() => setShowPlacementModal(false)}
                onPlacementComplete={() => setShowPlacementModal(false)}
            />
        </div>
    );
}
