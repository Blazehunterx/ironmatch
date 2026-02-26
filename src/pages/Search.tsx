import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockUsers, mockGyms } from '../lib/mock';
import {
    Search as SearchIcon, Heart, MessageCircle, Send, Image as ImageIcon,
    ChevronDown, MapPin, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Post } from '../types/database';

interface EnhancedPost extends Post {
    likes: number;
    liked: boolean;
    comments: { user: User; text: string }[];
    showComments: boolean;
}

export default function Search() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGym, setSelectedGym] = useState(user?.home_gym || 'g1');
    const [showGymPicker, setShowGymPicker] = useState(false);
    const [newPostText, setNewPostText] = useState('');
    const [newPostImage, setNewPostImage] = useState('');
    const [showNewPost, setShowNewPost] = useState(false);

    // Search results for users
    const searchResults = searchQuery.length >= 2
        ? mockUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) && u.id !== user?.id)
        : [];

    // Stories (recently posted users)
    const storyUsers = mockUsers.filter(u => u.id !== user?.id).slice(0, 6);

    // Enhanced posts with likes/comments
    const [posts, setPosts] = useState<EnhancedPost[]>(() => {
        const others = mockUsers.filter(u => u.id !== user?.id);
        return [
            {
                id: 'p1', author_id: 'u1', gym_id: 'g1',
                content: 'Hit a new PR on deadlift today! 405lbs! 🔥💪',
                media_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',
                created_at: new Date().toISOString(),
                likes: 12, liked: false,
                comments: [
                    { user: others[1], text: 'Beast mode! 🔥' },
                    { user: others[2], text: 'What program are you running?' },
                ],
                showComments: false
            },
            {
                id: 'p2', author_id: 'u4', gym_id: 'g1',
                content: 'Anyone hitting legs at 6PM? Need a spotter for heavy squats 🦵',
                created_at: new Date(Date.now() - 3600000).toISOString(),
                likes: 5, liked: false,
                comments: [{ user: others[0], text: 'I\'m in! See you there.' }],
                showComments: false
            },
            {
                id: 'p3', author_id: 'u2', gym_id: 'g1',
                content: 'Just finished a killer shoulder workout. Feeling the pump 💪',
                media_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop',
                created_at: new Date(Date.now() - 7200000).toISOString(),
                likes: 8, liked: true,
                comments: [],
                showComments: false
            }
        ];
    });

    const [newComment, setNewComment] = useState<Record<string, string>>({});

    const gym = mockGyms.find(g => g.id === selectedGym);
    const gymPosts = posts.filter(p => p.gym_id === selectedGym);

    const toggleLike = (postId: string) => {
        setPosts(prev => prev.map(p =>
            p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
        ));
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

    const handleNewPost = () => {
        if (!newPostText.trim() || !user) return;
        const post: EnhancedPost = {
            id: `p${Date.now()}`,
            author_id: user.id,
            gym_id: selectedGym,
            content: newPostText,
            media_url: newPostImage || undefined,
            created_at: new Date().toISOString(),
            likes: 0, liked: false, comments: [], showComments: false,
        };
        setPosts(prev => [post, ...prev]);
        setNewPostText('');
        setNewPostImage('');
        setShowNewPost(false);
    };

    const getAuthor = (id: string) => mockUsers.find(u => u.id === id) || user;

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
                                            <h4 className="text-sm font-semibold text-white">{u.name}</h4>
                                            <p className="text-[10px] text-gray-500">{u.fitness_level} · {mockGyms.find(g => g.id === u.home_gym)?.name}</p>
                                        </div>
                                        {u.is_trainer && <span className="text-[8px] bg-lime/20 text-lime px-1.5 py-0.5 rounded font-bold">TRAINER</span>}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

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
                    <span className="text-sm font-semibold text-white flex-1 text-left">{gym?.name}</span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1"><Users size={10} /> {gym?.member_count}</span>
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
                                {mockGyms.map(g => (
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
                                        <span className="text-[10px] text-gray-600">{g.member_count} members</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

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
                            placeholder="What's on your mind?"
                            className="w-full bg-oled border border-gray-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-lime resize-none"
                            rows={3}
                            autoFocus
                        />
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newPostImage}
                                onChange={(e) => setNewPostImage(e.target.value)}
                                placeholder="Image URL (optional)"
                                className="flex-1 bg-oled border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-lime"
                            />
                            <ImageIcon size={16} className="text-gray-500" />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowNewPost(false)} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-400 text-xs font-medium hover:bg-gray-700 transition">Cancel</button>
                            <button onClick={handleNewPost} disabled={!newPostText.trim()} className="px-4 py-2 rounded-lg bg-lime text-oled text-xs font-bold hover:bg-lime/90 disabled:opacity-30 transition">Post</button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Posts Feed */}
            <div className="px-4 space-y-4">
                {gymPosts.length === 0 ? (
                    <div className="text-center py-16 text-gray-600">
                        <p className="font-medium mb-1">No posts in this community yet.</p>
                        <p className="text-sm">Be the first to share!</p>
                    </div>
                ) : (
                    gymPosts.map((post, idx) => {
                        const author = getAuthor(post.author_id);
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
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-white">{author?.name}</h4>
                                        <p className="text-[10px] text-gray-500">
                                            {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {gym?.name}
                                        </p>
                                    </div>
                                    {author?.is_trainer && <span className="text-[8px] bg-lime/20 text-lime px-1.5 py-0.5 rounded font-bold">TRAINER</span>}
                                </div>

                                {/* Post Content */}
                                <div className="px-4 pb-3">
                                    <p className="text-sm text-gray-200 leading-relaxed">{post.content}</p>
                                </div>

                                {/* Media */}
                                {post.media_url && (
                                    <img src={post.media_url} alt="" className="w-full aspect-video object-cover" />
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-800/50">
                                    <button
                                        onClick={() => toggleLike(post.id)}
                                        className={`flex items-center gap-1 text-xs font-semibold transition-colors ${post.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
                                    >
                                        <Heart size={16} className={post.liked ? 'fill-current' : ''} /> {post.likes}
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
        </div>
    );
}
