
import { motion } from 'framer-motion';
import { X, Zap, MessageSquare, Share2, Send, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Post } from '../types/database';
import ExerciseVideo from './ExerciseVideo';

interface PostDetailProps {
    post: Post;
    onClose: () => void;
    onSpot: (postId: string) => void;
}

export default function PostDetail({ post, onClose, onSpot }: PostDetailProps) {
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState<any[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [post.id]);

    const fetchComments = async () => {
        setIsLoadingComments(true);
        try {
            const { data, error } = await supabase
                .from('comments')
                .select('*, profiles:profiles!comments_user_id_fkey(name, profile_image_url)')
                .eq('post_id', post.id)
                .order('created_at', { ascending: true });

            if (!error) setComments(data || []);
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setIsLoadingComments(false);
        }
    };

    const handleAddComment = async () => {
        if (!comment.trim()) return;

        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) return;

            const { error } = await supabase
                .from('comments')
                .insert({
                    post_id: post.id,
                    user_id: userData.user.id,
                    content: comment.trim()
                });

            if (!error) {
                setComment('');
                fetchComments();
            }
        } catch (err) {
            console.error('Error adding comment:', err);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/90 backdrop-blur-xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-5xl h-full md:h-[90vh] bg-oled md:rounded-[40px] border border-white/10 overflow-hidden flex flex-col md:flex-row shadow-2xl"
            >
                {/* Close Button Mobile */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 p-3 bg-white/10 backdrop-blur-md rounded-full text-white md:hidden"
                >
                    <X size={24} />
                </button>

                {/* Media Section */}
                <div className="flex-1 bg-black relative flex items-center justify-center h-[50vh] md:h-full">
                    {post.media_url ? (
                        post.media_type === 'video' ? (
                            <ExerciseVideo src={post.media_url} className="w-full h-full object-contain" autoPlay={true} />
                        ) : (
                            <img src={post.media_url} className="w-full h-full object-contain" alt="" />
                        )
                    ) : (
                        <div className="text-gray-800 font-black text-6xl uppercase italic opacity-20 select-none">IronMatch</div>
                    )}
                </div>

                {/* Interaction Section */}
                <div className="w-full md:w-[400px] flex flex-col h-[50vh] md:h-full bg-gray-900 border-l border-white/5">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gray-800 border border-white/10 overflow-hidden">
                                <img src={post.profiles?.profile_image_url || 'https://i.pravatar.cc/100'} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white leading-none flex items-center gap-1">
                                    {post.profiles?.name}
                                    {post.profiles?.verification_status === 'verified' && <CheckCircle2 size={12} className="text-lime" />}
                                </h4>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="hidden md:block text-gray-500 hover:text-white transition">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content & Comments */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">
                            {post.content}
                        </p>

                        <div className="pt-6 border-t border-white/5">
                            <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Comments</h5>

                            {isLoadingComments ? (
                                <div className="space-y-4">
                                    {[1, 2].map(i => (
                                        <div key={i} className="flex gap-3 animate-pulse">
                                            <div className="w-8 h-8 rounded-xl bg-gray-800" />
                                            <div className="flex-1 bg-gray-800 h-10 rounded-xl" />
                                        </div>
                                    ))}
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-8">
                                    <MessageSquare size={32} className="mx-auto text-gray-800 mb-2 opacity-50" />
                                    <p className="text-[10px] text-gray-600 font-bold uppercase">No sparks yet...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {comments.map(c => (
                                        <div key={c.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-gray-800 border border-white/5 overflow-hidden shrink-0">
                                                <img src={c.profiles?.profile_image_url} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[11px] text-white font-bold">{c.profiles?.name}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{c.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer / Input */}
                    <div className="p-6 border-t border-white/5 bg-gray-900/50 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => onSpot(post.id)}
                                    className="flex items-center gap-2 group"
                                >
                                    <div className="p-2.5 rounded-2xl bg-lime/10 group-hover:bg-lime/20 transition-all active:scale-90">
                                        <Zap size={20} className="text-lime fill-lime/20 group-hover:fill-lime transition-all" />
                                    </div>
                                    <span className="text-xs font-black text-white italic">{post.spots_count || 0}</span>
                                </button>
                                <button className="p-2.5 rounded-2xl bg-gray-800 text-gray-400 hover:text-white transition-all active:scale-90">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="relative group/input">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                className="w-full bg-oled border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-lime/50 transition-all"
                            />
                            <button
                                onClick={handleAddComment}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-lime hover:scale-110 active:scale-90 transition-all"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
