import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockUsers, mockPosts } from '../lib/mock';
import { useGyms } from '../context/GymContext';
import { Heart, MessageCircle, MapPin, Users, ChevronDown, Search as SearchIcon, Image as ImageIcon, Send, Zap, Calendar, Trophy, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Post } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import AddGymModal from '../components/AddGymModal';
import GymShoutbox from '../components/GymShoutbox';
import BuddyMatch from '../components/BuddyMatch';

interface EnhancedPost extends Post {
    likes_count: number;
    liked: boolean;
    comments: { user: User; text: string }[];
    showComments: boolean;
    profiles?: User; // From Supabase join
}

export default function Search() {
    const { user } = useAuth();
    const { gyms: allGyms, findGym, locationStatus, refreshGyms, isLoadingGyms: isSearchingGyms } = useGyms();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGym, setSelectedGym] = useState(user?.home_gym || 'g1');
    const [showGymPicker, setShowGymPicker] = useState(false);
    const [searchGymQuery, setSearchGymQuery] = useState('');
    const [newPostText, setNewPostText] = useState('');
    const [newPostImage, setNewPostImage] = useState('');
    const [showAddGym, setShowAddGym] = useState(false);
    const [viewMode, setViewMode] = useState<'shouts' | 'posts'>('shouts');
    const [showNewPost, setShowNewPost] = useState(false);
    const [isEvent, setIsEvent] = useState(false);
    const [eventDate, setEventDate] = useState('');
    const [eventTitle, setEventTitle] = useState('');
    const [showBuddyMatch, setShowBuddyMatch] = useState(false);

    // Real Data States
    const [profiles, setProfiles] = useState<User[]>([]);
    const [posts, setPosts] = useState<EnhancedPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!isSupabaseConfigured) {
            setProfiles(mockUsers);
            const enhancedMocks = mockPosts.map(p => ({
                ...p,
                likes_count: 0,
                liked: false,
                comments: [],
                showComments: false
            }));
            setPosts(enhancedMocks);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        // Fetch Profiles in this gym
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('home_gym', selectedGym);

        if (profileData) setProfiles(profileData);

        // Fetch Posts in this gym
        const { data: postData } = await supabase
            .from('posts')
            .select(`
                *,
                profiles (*)
            `)
            .eq('gym_id', selectedGym)
            .order('created_at', { ascending: false });

        if (postData) {
            // Fetch Likes for these posts
            const postIds = postData.map(p => p.id);
            const { data: likeData } = await supabase
                .from('likes')
                .select('*')
                .in('post_id', postIds);

            const enhancedPosts = postData.map(p => ({
                ...p,
                likes_count: likeData?.filter(l => l.post_id === p.id).length || 0,
                liked: user ? !!likeData?.find(l => l.post_id === p.id && l.user_id === user.id) : false,
                comments: [], // Comments TBD
                showComments: false
            }));
            setPosts(enhancedPosts);
        }
        setIsLoading(false);
    }, [selectedGym, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const searchResults = searchQuery.length >= 2
        ? profiles.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) && u.id !== user?.id)
        : [];

    const storyUsers = profiles.filter(u => u.id !== user?.id).slice(0, 6);

    const [newComment, setNewComment] = useState<Record<string, string>>({});

    const gym = findGym(selectedGym);
    const gymPosts = posts;

    const toggleLike = async (postId: string) => {
        if (!user || !isSupabaseConfigured) return;

        const post = posts.find(p => p.id === postId);
        if (!post) return;

        if (post.liked) {
            await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id });
        } else {
            await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
        }
        fetchData();
    };

    const toggleComments = (postId: string) => {
        setPosts(prev => prev.map(p =>
            p.id === postId ? { ...p, showComments: !p.showComments } : p
        ));
    };

    const addComment = (postId: string) => {
        const text = newComment[postId]?.trim();
        if (!text || !user) return;
        setPosts(prev => prev.map(p =>
            p.id === postId ? { ...p, comments: [...p.comments, { user, text }] } : p
        ));
        setNewComment(prev => ({ ...prev, [postId]: '' }));
    };

    const postImageRef = useRef<HTMLInputElement>(null);

    const handlePostImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setNewPostImage(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleNewPost = async () => {
        if (!newPostText.trim() || !user) return;

        if (isSupabaseConfigured) {
            await supabase.from('posts').insert({
                author_id: user.id,
                gym_id: selectedGym,
                content: newPostText,
                media_url: newPostImage || undefined,
                is_event: isEvent,
                event_date: isEvent ? eventDate : undefined,
                event_title: isEvent ? eventTitle : undefined,
            });
            fetchData();
        } else {
            const post: EnhancedPost = {
                id: `p${Date.now()}`,
                author_id: user.id,
                gym_id: selectedGym,
                content: newPostText,
                media_url: newPostImage || undefined,
                is_event: isEvent,
                event_date: isEvent ? eventDate : undefined,
                event_title: isEvent ? eventTitle : undefined,
                created_at: new Date().toISOString(),
                likes_count: 0,
                liked: false,
                comments: [],
                showComments: false,
            };
            setPosts(prev => [post, ...prev]);
        }

        setNewPostText('');
        setNewPostImage('');
        setIsEvent(false);
        setEventDate('');
        setEventTitle('');
        setShowNewPost(false);
    };

    const getAuthor = (post: EnhancedPost) => post.profiles || user;

    return (
        <div className="flex flex-col min-h-screen pb-24">
            {/* Header */}
            <div className="px-4 pt-6 pb-3">
                <h2 className="text-3xl font-bold text-white mb-4">Explore</h2>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Search people..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-lime text-sm"
                    />
                    <SearchIcon size={18} className="text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
                <button
                    onClick={fetchData}
                    className="p-3 bg-gray-900 border border-gray-800 rounded-2xl text-gray-500 hover:text-lime transition-all active:rotate-180 duration-500"
                >
                    <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Buddy Match Call to Action */}
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
                <div>
                    <h4 className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] leading-none mb-1.5">Alpha Matching</h4>
                    <p className="text-lg font-black text-white leading-tight">Find a Gym Buddy</p>
                    <p className="text-[11px] text-blue-100/60 font-medium">Matches you with active users now</p>
                </div>
            </motion.button>

            {/* User Search Results */}
            <AnimatePresence>
                {searchResults.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-4"
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

            {/* Stories Row */}
            <div className="px-4 mb-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Recently Active</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {storyUsers.map((u, idx) => (
                        <motion.div
                            key={u.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex flex-col items-center shrink-0 cursor-pointer group"
                        >
                            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-lime to-emerald-500 mb-1">
                                <img src={u.profile_image_url} alt={u.name} className="w-full h-full rounded-full border-2 border-oled object-cover" />
                            </div>
                            <span className="text-[10px] text-gray-400 group-hover:text-white transition-colors truncate w-16 text-center">{u.name.split(' ')[0]}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Gym Selector */}
            <div className="px-4 mb-4">
                <button
                    onClick={() => setShowGymPicker(!showGymPicker)}
                    className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 hover:border-gray-700 transition-colors w-full"
                >
                    <MapPin size={14} className="text-lime" />
                    <span className="text-sm font-semibold text-white flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">{gym?.name}</span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1 shrink-0"><Users size={10} /> {gym?.member_count}</span>
                    <ChevronDown size={14} className={`text-gray-500 transition-transform ${showGymPicker ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                    {showGymPicker && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-2 bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
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
                                        title="Refresh Location"
                                    >
                                        <Zap size={14} className={isSearchingGyms ? 'animate-pulse text-lime' : ''} />
                                    </button>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {locationStatus === 'denied' && (
                                        <div className="p-3 text-[10px] text-red-400 bg-red-500/5 border-b border-gray-800">
                                            Location access denied. Enable it in browser settings for automatic discovery.
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
            </div>

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
                        <ImageIcon size={14} /> Posts
                    </button>
                </div>
            </div>

            {viewMode === 'shouts' ? (
                <div className="px-4 flex-1 flex flex-col min-h-[500px] mb-4">
                    <GymShoutbox gymId={selectedGym} gymName={gym?.name || 'Gym'} />
                </div>
            ) : (
                <>
                    {/* New Post Button */}
                    <div className="px-4 mb-4">
                        {!showNewPost ? (
                            <button
                                onClick={() => setShowNewPost(true)}
                                className="w-full py-3 rounded-xl bg-gray-900 border border-gray-800 border-dashed text-gray-500 text-sm font-medium hover:border-lime/30 hover:text-gray-400 transition-colors"
                            >
                                + Share something with the community...
                            </button>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3"
                            >
                                <textarea
                                    value={newPostText}
                                    onChange={(e) => setNewPostText(e.target.value)}
                                    placeholder={isEvent ? "Details about the event..." : "What's on your mind?"}
                                    className="w-full bg-oled border border-gray-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-lime resize-none"
                                    rows={3}
                                    autoFocus
                                />

                                {isEvent && (
                                    <div className="space-y-3 p-3 bg-lime/10 border border-lime/30 rounded-xl">
                                        <input
                                            type="text"
                                            value={eventTitle}
                                            onChange={(e) => setEventTitle(e.target.value)}
                                            placeholder="Event Title (e.g. Sunday Leg Massacre)"
                                            className="w-full bg-oled border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:border-lime outline-none"
                                        />
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-lime" />
                                            <input
                                                type="datetime-local"
                                                value={eventDate}
                                                onChange={(e) => setEventDate(e.target.value)}
                                                className="bg-oled border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:border-lime outline-none flex-1 [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <input
                                            ref={postImageRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePostImageSelect}
                                            className="hidden"
                                        />
                                        <button
                                            onClick={() => postImageRef.current?.click()}
                                            className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 text-gray-400 rounded-lg px-3 py-2 text-xs font-medium hover:text-white hover:border-gray-600 active:scale-95 transition-all"
                                        >
                                            <ImageIcon size={14} /> {newPostImage ? 'Change Photo' : 'Photo'}
                                        </button>

                                        <button
                                            onClick={() => setIsEvent(!isEvent)}
                                            className={`flex items-center gap-1.5 border rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wider active:scale-95 transition-all ${isEvent
                                                ? 'bg-lime text-oled border-lime shadow-[0_0_15px_-3px_rgba(50,255,50,0.5)]'
                                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            <Trophy size={14} /> {isEvent ? 'Gym Event' : 'Make Event'}
                                        </button>
                                    </div>

                                    {newPostImage && (
                                        <div className="relative">
                                            <img src={newPostImage} className="h-10 w-10 rounded-lg object-cover border border-gray-700 shadow-lg" />
                                            <button
                                                onClick={() => setNewPostImage('')}
                                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black shadow-md"
                                            >✕</button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 justify-end pt-2 border-t border-gray-800/50">
                                    <button onClick={() => setShowNewPost(false)} className="px-5 py-2.5 rounded-xl bg-gray-800 text-gray-400 text-xs font-bold hover:bg-gray-700 transition">Cancel</button>
                                    <button
                                        onClick={handleNewPost}
                                        disabled={!newPostText.trim() || (isEvent && (!eventDate || !eventTitle))}
                                        className="px-6 py-2.5 rounded-xl bg-lime text-oled text-xs font-black uppercase tracking-widest hover:bg-lime/90 disabled:opacity-30 transition shadow-lg"
                                    >
                                        Post
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Posts Feed */}
                    <div className="px-4 space-y-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-8 h-8 border-4 border-lime/30 border-t-lime rounded-full animate-spin" />
                                <p className="text-xs text-gray-500 font-bold">Loading community...</p>
                            </div>
                        ) : gymPosts.length === 0 ? (
                            <div className="text-center py-16 text-gray-600">
                                <p className="font-medium mb-1">No posts in this community yet.</p>
                                <p className="text-sm">Be the first to share!</p>
                            </div>
                        ) : (
                            gymPosts.map((post, idx) => {
                                const author = getAuthor(post);
                                return (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden"
                                    >
                                        {/* Post Header */}
                                        <div className="flex items-center gap-3 p-4 pb-2">
                                            <img src={author?.profile_image_url} alt="" className="w-10 h-10 rounded-full border border-gray-700 object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-white truncate">{author?.name}</h4>
                                                <p className="text-[10px] text-gray-500">
                                                    {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {gym?.name}
                                                </p>
                                            </div>
                                            {author?.is_trainer && <span className="text-[8px] bg-lime/20 text-lime px-1.5 py-0.5 rounded font-bold shrink-0">TRAINER</span>}
                                        </div>

                                        {/* Post Content */}
                                        <div className="px-4 pb-3">
                                            {post.is_event ? (
                                                <div className="mt-1 p-4 rounded-2xl bg-gradient-to-br from-lime/20 via-lime/5 to-transparent border border-lime/30 shadow-[inset_0_0_20px_-10px_rgba(50,255,50,0.3)]">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="p-2 bg-lime rounded-xl">
                                                            <Calendar size={18} className="text-oled" />
                                                        </div>
                                                        <div>
                                                            <h5 className="text-xs font-black text-lime uppercase tracking-widest leading-none mb-1">Upcoming Event</h5>
                                                            <h4 className="text-lg font-black text-white leading-tight">{post.event_title}</h4>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-300 leading-relaxed mb-4">{post.content}</p>
                                                    <div className="flex items-center justify-between pt-3 border-t border-lime/20">
                                                        <div className="flex items-center gap-2 text-[11px] font-black text-white uppercase tracking-wider">
                                                            <Zap size={14} className="text-lime fill-current" />
                                                            {post.event_date ? new Date(post.event_date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                                                        </div>
                                                        <button className="px-4 py-1.5 bg-lime text-oled text-[10px] font-black rounded-lg uppercase tracking-widest active:scale-95 transition-all shadow-md">
                                                            Join In
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-200 leading-relaxed">{post.content}</p>
                                            )}
                                        </div>

                                        {/* Media */}
                                        {post.media_url && !post.is_event && (
                                            <img src={post.media_url} alt="" className="w-full aspect-video object-cover" />
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-800/50">
                                            <button
                                                onClick={() => toggleLike(post.id)}
                                                className={`flex items-center gap-1 text-xs font-semibold transition-colors ${post.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
                                            >
                                                <Heart size={16} className={post.liked ? 'fill-current' : ''} /> {post.likes_count}
                                            </button>
                                            <button
                                                onClick={() => toggleComments(post.id)}
                                                className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-white transition-colors"
                                            >
                                                <MessageCircle size={16} /> {post.comments.length}
                                            </button>
                                        </div>

                                        {/* Comments */}
                                        <AnimatePresence>
                                            {post.showComments && (
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: 'auto' }}
                                                    exit={{ height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 pb-3 border-t border-gray-800/50 pt-3 space-y-2.5">
                                                        {post.comments.map((c, ci) => (
                                                            <div key={ci} className="flex items-start gap-2">
                                                                <img src={c.user.profile_image_url} alt="" className="w-7 h-7 rounded-full border border-gray-700 object-cover mt-0.5" />
                                                                <div className="bg-gray-800/50 rounded-xl px-3 py-1.5 flex-1">
                                                                    <span className="text-[10px] font-bold text-white">{c.user.name}</span>
                                                                    <p className="text-xs text-gray-400">{c.text}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {/* Add comment */}
                                                        <div className="flex gap-2 pt-1">
                                                            <input
                                                                type="text"
                                                                value={newComment[post.id] || ''}
                                                                onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                                onKeyDown={(e) => e.key === 'Enter' && addComment(post.id)}
                                                                placeholder="Add a comment..."
                                                                className="flex-1 bg-oled border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-lime"
                                                            />
                                                            <button
                                                                onClick={() => addComment(post.id)}
                                                                disabled={!newComment[post.id]?.trim()}
                                                                className="p-2 rounded-lg bg-lime text-oled disabled:opacity-30 active:scale-95 transition"
                                                            >
                                                                <Send size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </>
            )}

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
                            className="bg-oled border-t border-gray-800 sm:border border-gray-800 w-full max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden z-10 relative"
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

            {/* Add Gym Modal */}
            <AddGymModal
                isOpen={showAddGym}
                onClose={() => setShowAddGym(false)}
                onAdded={() => {
                    setShowAddGym(false);
                    refreshGyms();
                }}
            />
        </div>
    );
}
