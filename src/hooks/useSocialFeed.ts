import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Post } from '../types/database';
import { safeStorage } from '../lib/safeStorage';

export function useSocialFeed(gymId: string | null) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchPosts = useCallback(async (isLoadMore = false) => {
        if (!isLoadMore && posts.length === 0) {
            const cached = safeStorage.getItem('ironmatch_feed_cache');
            if (cached) {
                try {
                    setPosts(JSON.parse(cached));
                } catch (e) {}
            }
        }

        setLoading(true);
        try {
            let query = supabase
                .from('posts')
                .select('*, profiles:profiles!posts_author_id_fkey(name, profile_image_url, verification_status, is_founding_trainer, big4)');

            if (gymId) {
                query = query.eq('gym_id', gymId);
            }

            const from = isLoadMore ? posts.length : 0;
            const to = from + 14;

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;
            
            const newBatch = data || [];
            
            if (isLoadMore) {
                setPosts(prev => [...prev, ...newBatch]);
            } else {
                setPosts(newBatch);
                // Cache only the first 10 posts and strip heavy data to avoid LocalStorage quota issues
                const cacheData = newBatch.slice(0, 10).map(post => ({
                    ...post,
                    content: post.content?.substring(0, 500)
                }));
                safeStorage.setItem('ironmatch_feed_cache', JSON.stringify(cacheData));
            }

            setHasMore(newBatch.length === 15);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [gymId, posts.length]);

    const addPost = async (authorId: string, content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .insert([{
                    author_id: authorId,
                    gym_id: gymId || null,
                    content,
                    media_url: mediaUrl,
                    media_type: mediaType,
                    spots_count: 0,
                    is_auto_generated: false
                }])
                .select('*, profiles:profiles!posts_author_id_fkey(name, profile_image_url, verification_status, is_founding_trainer)')
                .single();

            if (error) throw error;
            setPosts(prev => [data, ...prev]);
        } catch (err: any) {
            console.error('Error adding post:', err);
            throw err;
        }
    };

    const toggleSpot = async (postId: string) => {
        try {
            const post = posts.find(p => p.id === postId);
            if (!post) return;

            const { error } = await supabase.rpc('increment_spots', { post_id_param: postId });
            if (error) throw error;

            setPosts(prev => prev.map(p =>
                p.id === postId ? { ...p, spots_count: (p.spots_count || 0) + 1 } : p
            ));
        } catch (err) {
            console.error('Error spotting post:', err);
        }
    };

    useEffect(() => {
        fetchPosts(false);
    }, [gymId]); // Removed fetchPosts from deps to avoid loop

    return { posts, loading, error, hasMore, addPost, toggleSpot, refresh: () => fetchPosts(false), loadMore: () => fetchPosts(true) };
}
