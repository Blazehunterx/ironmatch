import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockUsers } from '../lib/mock';
import { useGyms } from '../context/GymContext';
import { MapPin, Users, ChevronDown, Search as SearchIcon, ImageIcon, Zap, Trophy, RefreshCw, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import AddGymModal from '../components/AddGymModal';
import GymShoutbox from '../components/GymShoutbox';
import GymWarModal from '../components/GymWarModal';
import BuddyMatch from '../components/BuddyMatch';
import SocialFeed from '../components/SocialFeed';

export default function Search() {
    const { user } = useAuth();
    const {
        gyms: allGyms, findGym, locationStatus, refreshGyms,
        isLoadingGyms: isSearchingGyms, searchRadius, setSearchRadius
    } = useGyms();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGym, setSelectedGym] = useState(user?.home_gym || '');
    const [showGymPicker, setShowGymPicker] = useState(false);
    const [searchGymQuery, setSearchGymQuery] = useState('');
    const [showAddGym, setShowAddGym] = useState(false);
    const [viewMode, setViewMode] = useState<'shouts' | 'posts'>('posts');
    const [showBuddyMatch, setShowBuddyMatch] = useState(false);
    const [showWarModal, setShowWarModal] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    // Real Data States
    const [profiles, setProfiles] = useState<User[]>([]);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

    const fetchData = useCallback(async () => {
        if (!isSupabaseConfigured || !selectedGym) {
            setProfiles(mockUsers);
            setIsLoadingProfiles(false);
            return;
        }

        setIsLoadingProfiles(true);
        // Fetch Profiles in this gym
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('home_gym', selectedGym);

        if (profileData) setProfiles(profileData);
        setIsLoadingProfiles(false);
    }, [selectedGym]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleJoinGym = async (gymId: string) => {
        if (!user || isJoining) return;
        setIsJoining(true);
        try {
            const gymName = findGym(gymId)?.name || 'New Gym';
            const { error } = await supabase
                .from('profiles')
                .update({ home_gym: gymId, home_gym_name: gymName })
                .eq('id', user.id);

            if (!error) {
                // Refresh local user state if needed, or rely on AuthContext if it syncs
                window.location.reload(); // Hard refresh to ensure all contexts sync
            }
        } catch (err) {
            console.error('Error joining gym:', err);
        } finally {
            setIsJoining(false);
        }
    };

    const searchResults = searchQuery.length >= 2
        ? profiles.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) && u.id !== user?.id)
        : [];

    const gym = findGym(selectedGym);

    // Helper to determine if a gym is selected (either by user's home gym or currently picked)
    const selectedByMeOrOthers = () => !!selectedGym;

    return (
        <div className="flex flex-col min-h-screen pb-24 bg-oled">
            {/* Header */}
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

                {/* Search Bar */}
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

            {/* Buddy Match Call to Action */}
            {((user?.xp || 0) >= 50 || user?.is_trainer) && (
                <div className="px-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowBuddyMatch(true)}
                        className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 border-t border-white/20 flex items-center gap-4 relative overflow-hidden group shadow-2xl shadow-blue-900/40"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                            <Users size={80} />
                        </div>
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-white shadow-xl">
                            <Zap size={24} className="fill-current" />
                        </div>
                        <div className="text-left">
                            <h4 className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] leading-none mb-1.5">Alpha Matching</h4>
                            <p className="text-lg font-black text-white leading-tight">Find a Gym Buddy</p>
                            <p className="text-[11px] text-blue-100/60 font-medium">Matches you with active users now</p>
                        </div>
                    </motion.button>
                </div>
            )}

            {/* User Search Results */}
            <AnimatePresence>
                {searchResults.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-4 px-4"
                    >
                        <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
                            {searchResults.slice(0, 5).map(u => (
                                <div key={u.id} className="flex items-center gap-3 p-3 hover:bg-gray-800/50 transition-colors cursor-pointer">
                                    <img src={u.profile_image_url} alt={u.name} className="w-10 h-10 rounded-full border border-gray-700 object-cover" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-semibold text-white">{u.name}</h4>
                                            {(u.is_trainer || (u.reliability_streak || 0) > 10) && (
                                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black">
                                                    <Trophy size={8} className="fill-current" /> MENTOR
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-500">{u.fitness_level} · {findGym(u.home_gym)?.name}</p>
                                    </div>
                                    {u.is_trainer && <span className="text-[8px] bg-lime/20 text-lime px-1.5 py-0.5 rounded font-bold">TRAINER</span>}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Gym Selector & Journey CTA */}
            <div className="px-6 mb-6">
                {!user?.home_gym ? (
                    <div className="mb-6 p-6 rounded-[32px] bg-gradient-to-br from-lime to-lime-600 border border-white/20 shadow-2xl shadow-lime/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">Join a Squad</h3>
                            <p className="text-black/70 text-xs font-bold leading-tight mb-4">You haven't joined a gym yet. Select a community to track progress and join Gym Wars.</p>
                            <button
                                onClick={() => setShowGymPicker(true)}
                                className="bg-black text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl"
                            >
                                Find My Gym
                            </button>
                        </div>
                        <MapPin size={120} className="absolute -right-8 -bottom-8 text-black/10 rotate-12" />
                    </div>
                ) : (
                    <button
                        onClick={() => setShowGymPicker(!showGymPicker)}
                        className="flex items-center gap-3 bg-gray-900 border border-white/5 rounded-[24px] px-5 py-4 hover:border-lime/30 transition-all w-full group shadow-lg"
                    >
                        <div className="p-2 bg-lime/10 rounded-xl group-hover:bg-lime/20 transition-colors">
                            <MapPin size={18} className="text-lime" />
                        </div>
                        <div className="flex-1 text-left">
                            <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{gym?.location || 'Nearby'}</h4>
                            <span className="text-sm font-black text-white truncate max-w-[200px] block">{gym?.name || 'Select a Gym'}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1 shrink-0">
                                <Users size={12} /> {gym?.member_count}
                            </span>
                            <ChevronDown size={14} className={`text-gray-500 transition-transform ${showGymPicker ? 'rotate-180' : ''}`} />
                        </div>
                    </button>
                )}

                {gym && !gym.owner_id && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-4 rounded-2xl bg-lime/10 border border-lime/20 flex flex-col gap-3"
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-lime/20 rounded-lg shrink-0">
                                <Trophy className="text-lime" size={20} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Unclaimed Community</h4>
                                <p className="text-[10px] text-gray-400 mt-1">Claim this gym to create events, send free passes, and lead your squad to victory in Gym Wars!</p>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                if (!user) return;
                                const proof = window.prompt('Please provide a link to proof of management (e.g. Website, LinkedIn):');
                                if (proof) {
                                    await supabase.from('profiles').update({
                                        verification_status: 'pending',
                                        trainer_license_url: `GYM_CLAIM:${selectedGym} - Proof: ${proof}`
                                    }).eq('id', user.id);
                                    alert('Claim request sent! We will verify and give you access.');
                                }
                            }}
                            className="w-full py-2.5 bg-lime text-oled rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                        >
                            Claim this Kingdom
                        </button>
                    </motion.div>
                )}

                {gym && gym.owner_id === user?.id && gym.is_verified_gym && (
                    <div className="mt-3 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <ShieldAlert size={16} className="text-blue-400" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Owner Controls</span>
                            </div>
                            <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-black">VERIFIED</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button className="py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-[10px] font-bold text-white hover:border-blue-500/50 transition-all flex items-center justify-center gap-2">
                                <Zap size={14} className="text-blue-400" /> Free Passes
                            </button>
                            <button
                                onClick={() => setShowWarModal(true)}
                                className="py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-[10px] font-bold text-white hover:border-red-500/50 transition-all flex items-center justify-center gap-2"
                            >
                                <Trophy size={14} className="text-red-400" /> Start 1v1 War
                            </button>
                        </div>
                    </div>
                )}

                {gym && selectedByMeOrOthers() && (
                    <div className="mt-4">
                        {user?.home_gym !== selectedGym ? (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => handleJoinGym(selectedGym)}
                                disabled={isJoining}
                                className="w-full py-4 bg-lime text-black rounded-[20px] text-xs font-black uppercase tracking-widest shadow-xl shadow-lime/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                                {isJoining ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} className="fill-current" />}
                                Join This Community
                            </motion.button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode('shouts')}
                                    className={`flex-1 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'shouts'
                                        ? 'bg-lime text-black shadow-lg shadow-lime/10'
                                        : 'bg-gray-900 text-gray-400 border border-white/5'}`}
                                >
                                    Shouts
                                </button>
                                <button
                                    onClick={() => setViewMode('posts')}
                                    className={`flex-1 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'posts'
                                        ? 'bg-lime text-black shadow-lg shadow-lime/10'
                                        : 'bg-gray-900 text-gray-400 border border-white/5'}`}
                                >
                                    Feed
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <AnimatePresence>
                {showGymPicker && (
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
                                            onClick={() => { setSelectedGym(g.id); setShowGymPicker(false); }}
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
                                        onClick={() => setShowAddGym(true)}
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

            {/* Tab Selector */}
            <div className="px-4 mb-4">
                <div className="flex bg-gray-900/50 p-1 rounded-2xl border border-gray-800">
                    <button
                        onClick={() => setViewMode('shouts')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'shouts'
                            ? 'bg-lime text-oled shadow-lg'
                            : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        <Zap size={14} /> Shouts
                    </button>
                    <button
                        onClick={() => setViewMode('posts')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'posts'
                            ? 'bg-lime text-oled shadow-lg'
                            : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        <ImageIcon size={14} /> Community Feed
                    </button>
                </div>
            </div>

            <div className="px-4 flex-1">
                {viewMode === 'shouts' ? (
                    <div className="flex flex-col min-h-[500px] relative">
                        <GymShoutbox gymId={selectedGym} gymName={gym?.name || 'Gym'} />
                    </div>
                ) : (
                    <SocialFeed gymId={selectedGym} />
                )}
            </div>

            {/* Buddy Match Modal */}
            <AnimatePresence>
                {showBuddyMatch && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowBuddyMatch(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="bg-oled border-t border-gray-800 sm:border border-gray-800 w-full max-w-lg rounded-t-3xl sm:rounded-2xl h-[80vh] overflow-hidden z-10 relative"
                        >
                            <BuddyMatch
                                currentUser={user!}
                                allUsers={profiles}
                                onClose={() => setShowBuddyMatch(false)}
                                onStartChat={(id) => { console.log('Chat with', id); setShowBuddyMatch(false); }}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <AddGymModal
                isOpen={showAddGym}
                onClose={() => setShowAddGym(false)}
                onAdded={() => {
                    setShowAddGym(false);
                    refreshGyms();
                }}
            />
            {gym && (
                <GymWarModal
                    isOpen={showWarModal}
                    onClose={() => setShowWarModal(false)}
                    ownerGym={gym}
                    allGyms={allGyms}
                />
            )}
        </div>
    );
}
