import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Post } from '../types/database';
import { safeStorage } from '../lib/safeStorage';

const INITIAL_COMMUNITY_POSTS: any[] = [
    {
        id: 'seed-post-1',
        author_id: 'user-colt',
        gym_id: 'golds-venice',
        content: 'Completed W3 • Day 1 Upper Push (Strength & Tendon Armor). Paused Barbell Bench Press 150kg × 6 @ 8.0 RPE after Cable External Rotations. Zero shoulder pinch.',
        spots_count: 14,
        is_auto_generated: true,
        created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        profiles: {
            name: 'Colt Walker',
            profile_image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
            verification_status: 'verified',
            is_founding_trainer: true,
            big4: { bench: 180, squat: 250, deadlift: 300, ohp: 105 }
        }
    },
    {
        id: 'seed-post-2',
        author_id: 'user-callum',
        gym_id: 'puregym-ldn',
        content: '45s Spanish Squat Isometric Holds before Back Squats completely eliminated my patellar tendon flare-up. Hit 180kg × 5 pain-free today.',
        spots_count: 9,
        is_auto_generated: false,
        created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        profiles: {
            name: 'Callum Wright',
            profile_image_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
            verification_status: 'verified',
            is_founding_trainer: false,
            big4: { bench: 125, squat: 180, deadlift: 220, ohp: 70 }
        }
    }
];

export function useSocialFeed(gymId: string | null) {
    const [posts, setPosts] = useState<Post[]>(() => {
        try {
            const cached = safeStorage.getItem('ironmatch_feed_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch {}
        return INITIAL_COMMUNITY_POSTS as Post[];
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchPosts = useCallback(async (isLoadMore = false) => {
        setLoading(true);
        try {
            const from = isLoadMore ? posts.length : 0;
            const to = from + 14;

            const { data, error } = await supabase
                .from('posts')
                .select('*, profiles:profiles!posts_author_id_fkey(name, profile_image_url, verification_status, is_founding_trainer, big4)')
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;
            
            let newBatch = data || [];
            if (gymId && !isLoadMore) {
                const localMatches = newBatch.filter((p: any) => p.gym_id === gymId);
                if (localMatches.length > 0) {
                    newBatch = localMatches;
                }
            }
            if (newBatch.length === 0 && !isLoadMore) {
                newBatch = INITIAL_COMMUNITY_POSTS;
            }
            
            // Merge any locally generated workout proof posts
            let localPosts: any[] = [];
            try {
                const cached = safeStorage.getItem('ironmatch_feed_cache');
                if (cached) {
                    localPosts = JSON.parse(cached).filter((p: any) => p.id?.startsWith('post-'));
                }
            } catch (e) {}

            const merged = [...localPosts, ...newBatch];
            const uniqueMap = new Map();
            merged.forEach(p => { if (!uniqueMap.has(p.id)) uniqueMap.set(p.id, p); });
            const finalBatch = Array.from(uniqueMap.values());

            if (isLoadMore) {
                setPosts(prev => {
                    const combined = [...prev, ...newBatch];
                    const map = new Map();
                    combined.forEach(p => { if (!map.has(p.id)) map.set(p.id, p); });
                    return Array.from(map.values()) as Post[];
                });
            } else {
                setPosts(finalBatch as Post[]);
                // Cache only the first 10 posts and strip heavy data to avoid LocalStorage quota issues
                const cacheData = finalBatch.slice(0, 10).map(post => ({
                    ...post,
                    content: post.content?.substring(0, 500)
                }));
                try {
                    safeStorage.setItem('ironmatch_feed_cache', JSON.stringify(cacheData));
                } catch (e) {
                    console.warn('Feed caching failed:', e);
                }
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
            // Local fallback
            const fallbackPost: any = {
                id: `post-${Date.now()}`,
                author_id: authorId,
                gym_id: gymId || null,
                content,
                media_url: mediaUrl,
                media_type: mediaType,
                spots_count: 0,
                is_auto_generated: false,
                created_at: new Date().toISOString()
            };
            setPosts(prev => [fallbackPost, ...prev]);
        }
    };

    const toggleSpot = async (postId: string) => {
        try {
            const post = posts.find(p => p.id === postId);
            if (!post) return;

            setPosts(prev => prev.map(p =>
                p.id === postId ? { ...p, spots_count: (p.spots_count || 0) + 1 } : p
            ));

            try {
                await supabase.rpc('increment_spots', { post_id_param: postId });
            } catch (e) {}
        } catch (err) {
            console.error('Error spotting post:', err);
        }
    };

    useEffect(() => {
        fetchPosts(false);
    }, [gymId]);

    return { posts, loading, error, hasMore, addPost, toggleSpot, refresh: () => fetchPosts(false), loadMore: () => fetchPosts(true) };
}
