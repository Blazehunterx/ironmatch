import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Post } from '../types/database';

export function useSocialFeed(gymId: string | null) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('posts')
                .select('*, profiles:profiles!posts_author_id_fkey(name, profile_image_url, verification_status, is_founding_trainer)');

            if (gymId) {
                // Community Feed: Filter by specific gym
                query = query.eq('gym_id', gymId);
            } else {
                // Global Feed: Show everything (Real Users + AI Influencers)
                // We don't filter by gymId here
            }

            const { data, error } = await query
                .order('created_at', { ascending: false });

            console.log('SOCIAL_FEED_DEBUG: Fetched data length:', data?.length);
            if (error) {
                console.error('SOCIAL_FEED_DEBUG: Fetch error:', error);
                throw error;
            }
            setPosts(data || []);
        } catch (err: any) {
            console.error('SOCIAL_FEED_DEBUG: Catch block error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [gymId]);

    const addPost = async (authorId: string, content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .insert([{
                    author_id: authorId,
                    gym_id: gymId || null, // Global posts have no gymId
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
        // Logic for liking/spotting a post
        // In a real app we'd have a 'spots' junction table, 
        // for now we'll increment the local count and update the DB
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
        fetchPosts();
    }, [fetchPosts]);

    return { posts, loading, error, addPost, toggleSpot, refresh: fetchPosts };
}
