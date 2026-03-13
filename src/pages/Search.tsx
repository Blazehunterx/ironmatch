import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockUsers } from '../lib/mock';
import { useGyms } from '../context/GymContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import AddGymModal from '../components/AddGymModal';
import GymShoutbox from '../components/GymShoutbox';
import GymWarModal from '../components/GymWarModal';
import BuddyMatch from '../components/BuddyMatch';
import SocialFeed from '../components/SocialFeed';

// Modular Components
import ExploreHeader from '../components/search/ExploreHeader';
import BuddyMatchCTA from '../components/search/BuddyMatchCTA';
import UserSearchResults from '../components/search/UserSearchResults';
import GymSelector from '../components/search/GymSelector';
import GymPicker from '../components/search/GymPicker';
import SearchTabNavigation from '../components/search/SearchTabNavigation';

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

    const handleClaimGym = async () => {
        if (!user) return;
        const proof = window.prompt('Please provide a link to proof of management (e.g. Website, LinkedIn):');
        if (proof) {
            await supabase.from('profiles').update({
                verification_status: 'pending',
                trainer_license_url: `GYM_CLAIM:${selectedGym} - Proof: ${proof}`
            }).eq('id', user.id);
            alert('Claim request sent! We will verify and give you access.');
        }
    };

    return (
        <div className="flex flex-col min-h-screen pb-24 bg-oled">
            <ExploreHeader 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
                fetchData={fetchData} 
                isLoadingProfiles={isLoadingProfiles} 
            />

            <BuddyMatchCTA 
                xp={user?.xp || 0} 
                isTrainer={user?.is_trainer || false} 
                onShowMatch={() => setShowBuddyMatch(true)} 
            />

            <UserSearchResults 
                results={searchResults} 
                findGymName={(id) => findGym(id)?.name || 'Unknown Gym'} 
            />

            <GymSelector 
                currentUser={user}
                gym={gym}
                selectedGym={selectedGym}
                showGymPicker={showGymPicker}
                setShowGymPicker={setShowGymPicker}
                handleJoinGym={handleJoinGym}
                isJoining={isJoining}
                viewMode={viewMode}
                setViewMode={setViewMode}
                onClaimGym={handleClaimGym}
                onStartWar={() => setShowWarModal(true)}
            />

            <GymPicker 
                isOpen={showGymPicker}
                searchGymQuery={searchGymQuery}
                setSearchGymQuery={setSearchGymQuery}
                refreshGyms={refreshGyms}
                isSearchingGyms={isSearchingGyms}
                searchRadius={searchRadius}
                setSearchRadius={setSearchRadius}
                locationStatus={locationStatus}
                allGyms={allGyms}
                selectedGym={selectedGym}
                onSelect={(id) => { setSelectedGym(id); setShowGymPicker(false); }}
                onAddCustom={() => setShowAddGym(true)}
            />

            <SearchTabNavigation 
                viewMode={viewMode}
                setViewMode={setViewMode}
            />

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

