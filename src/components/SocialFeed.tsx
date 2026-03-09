import { motion, AnimatePresence } from 'framer-motion';
import { useSocialFeed } from '../hooks/useSocialFeed';
import { useFollow } from '../hooks/useFollow';
import { supabase } from '../lib/supabase';
import { Zap, MessageSquare, Share2, MoreHorizontal, Trophy, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ExerciseVideo from './ExerciseVideo';
import { useState, useEffect } from 'react';

import PostCreator from './PostCreator';
import PostDetail from './PostDetail';

interface SocialFeedProps {
    gymId?: string | null;
}

export default function SocialFeed({ gymId = null }: SocialFeedProps) {
    const { posts, loading, error, toggleSpot, refresh } = useSocialFeed(gymId);
    const [selectedPost, setSelectedPost] = useState<any | null>(null);

    if (loading && posts.length === 0) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-900/50 rounded-3xl h-64 border border-gray-800" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PostCreator gymId={gymId} onPostCreated={refresh} />

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <p className="text-red-500 text-xs font-bold">Error: {error}</p>
                    <button onClick={refresh} className="mt-2 text-[10px] text-red-500 underline uppercase font-black">Retry Connection</button>
                </div>
            )}

            {posts.length === 0 && !error ? (
                <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-dashed border-gray-800 p-8">
                    <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
                        <Share2 size={28} className="text-gray-700" />
                    </div>
                    <h4 className="text-white font-bold mb-2">No activity yet</h4>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">Be the first to share a workout photo or a PR attempt!</p>
                </div>
            ) : (
                posts.map((post: any) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setSelectedPost(post)}
                        className="bg-gray-900/40 border border-gray-800 rounded-[32px] overflow-hidden group hover:border-lime/20 transition-all duration-500 cursor-pointer active:scale-[0.98]"
                    >
                        {/* Author Header */}
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gray-800 border border-gray-700 overflow-hidden shrink-0">
                                    <img src={post.profiles?.profile_image_url || 'https://i.pravatar.cc/100'} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1">
                                        <h4 className="text-sm font-black text-white leading-none">{post.profiles?.name}</h4>
                                        {post.profiles?.verification_status === 'verified' && (
                                            <CheckCircle2 size={12} className={post.profiles?.is_founding_trainer ? "text-yellow-500 fill-yellow-500/10" : "text-lime fill-lime/10"} />
                                        )}
                                        <FollowButton targetUserId={post.author_id} />
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                        </span>
                                        {post.is_auto_generated && (
                                            <span className="text-[8px] bg-lime/10 text-lime px-1.5 py-0.5 rounded border border-lime/20 font-black uppercase tracking-tighter">Verified Link</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); }}
                                className="text-gray-600 hover:text-white transition"
                            >
                                <MoreHorizontal size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        {post.content && (
                            <div className="px-5 pb-4">
                                <p className="text-[13px] text-gray-300 leading-relaxed font-medium">
                                    {post.content}
                                </p>
                            </div>
                        )}

                        {/* Media */}
                        {post.media_url && (
                            <div className="mx-2 mb-2 rounded-[24px] overflow-hidden bg-black aspect-square md:aspect-video relative">
                                {post.media_type === 'video' ? (
                                    <ExerciseVideo src={post.media_url} className="w-full h-full" autoPlay={false} />
                                ) : (
                                    <img src={post.media_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                )}

                                {/* Auto-generated overlay for Workout Receipts */}
                                {post.is_auto_generated && (
                                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Trophy size={16} className="text-lime" />
                                                    <span className="text-[10px] font-black text-lime uppercase tracking-[0.2em]">Session Complete</span>
                                                </div>
                                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">Iron Harvest</h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Volume</p>
                                                <p className="text-2xl font-black text-white italic">4,250<span className="text-xs text-lime ml-1">LB</span></p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Interactions */}
                        <div className="p-4 flex items-center justify-between border-t border-gray-800/50 bg-gray-900/20">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleSpot(post.id); }}
                                    className="flex items-center gap-2 group/spot"
                                >
                                    <div className="p-2 rounded-xl bg-lime/10 group-hover/spot:bg-lime/20 transition-colors">
                                        <Zap size={18} className="text-lime fill-lime/20 group-hover/spot:fill-lime transition-all" />
                                    </div>
                                    <span className="text-xs font-black text-white italic">{post.spots_count || 0} SPOTS</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }}
                                    className="flex items-center gap-2 group/msg"
                                >
                                    <div className="p-2 rounded-xl bg-gray-800 group-hover/msg:bg-gray-700 transition-colors">
                                        <MessageSquare size={18} className="text-gray-400" />
                                    </div>
                                    <span className="text-xs font-black text-gray-400">CHATS</span>
                                </button>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); }}
                                className="p-2.5 rounded-xl bg-gray-800 text-gray-400 hover:text-white transition-all active:scale-90"
                            >
                                <Share2 size={18} />
                            </button>
                        </div>
                    </motion.div>
                ))
            )}

            <AnimatePresence>
                {selectedPost && (
                    <PostDetail
                        post={selectedPost}
                        onClose={() => setSelectedPost(null)}
                        onSpot={toggleSpot}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function FollowButton({ targetUserId }: { targetUserId: string }) {
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
    }, []);

    const { isFollowing, toggleFollow, loading } = useFollow(targetUserId, currentUserId || undefined);

    if (!currentUserId || currentUserId === targetUserId) return null;

    return (
        <button
            onClick={(e) => { e.stopPropagation(); toggleFollow(); }}
            disabled={loading}
            className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full border transition-all ${isFollowing
                ? 'bg-gray-800 border-gray-700 text-gray-500'
                : 'bg-lime/10 border-lime/30 text-lime hover:bg-lime/20'
                }`}
        >
            {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
        </button>
    );
}
