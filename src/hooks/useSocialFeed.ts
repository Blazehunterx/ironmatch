import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Post } from '../types/database';

export function useSocialFeed(gymId: string | null) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = useCallback(async () => {
        if (!gymId) return;
        setLoading(true);
        try {
            // Fetch posts and include author profiles and spots count
            const { data, error } = await supabase
                .from('posts')
                .select('*, profiles(name, profile_image_url)')
                .eq('gym_id', gymId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (err: any) {
            console.error('Error fetching social feed:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [gymId]);

    const addPost = async (authorId: string, content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
        if (!gymId) return;

        try {
            const { data, error } = await supabase
                .from('posts')
                .insert([{
                    author_id: authorId,
                    gym_id: gymId,
                    content,
                    media_url: mediaUrl,
                    media_type: mediaType,
                    spots_count: 0
                }])
                .select()
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
        if (gymId) fetchPosts();
    }, [gymId, fetchPosts]);

    return { posts, loading, error, addPost, toggleSpot, refresh: fetchPosts };
}
