import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useFollow(targetUserId?: string, followerId?: string) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchFollowStats = useCallback(async () => {
        if (!targetUserId) return;

        try {
            // Fetch follower count
            const { count: followers, error: fError } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('following_id', targetUserId);

            // Fetch following count
            const { count: following, error: gError } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('follower_id', targetUserId);

            if (!fError) setFollowerCount(followers || 0);
            if (!gError) setFollowingCount(following || 0);

            // Check if current user is following
            if (followerId) {
                const { data } = await supabase
                    .from('follows')
                    .select('*')
                    .eq('follower_id', followerId)
                    .eq('following_id', targetUserId)
                    .single();

                setIsFollowing(!!data);
            }
        } catch (err) {
            console.error('Error fetching follow stats:', err);
        }
    }, [targetUserId, followerId]);

    useEffect(() => {
        fetchFollowStats();
    }, [fetchFollowStats]);

    const toggleFollow = async () => {
        if (!targetUserId || !followerId || loading) return;

        setLoading(true);
        try {
            if (isFollowing) {
                const { error } = await supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', followerId)
                    .eq('following_id', targetUserId);

                if (!error) {
                    setIsFollowing(false);
                    setFollowerCount(prev => Math.max(0, prev - 1));
                }
            } else {
                const { error } = await supabase
                    .from('follows')
                    .insert({ follower_id: followerId, following_id: targetUserId });

                if (!error) {
                    setIsFollowing(true);
                    setFollowerCount(prev => prev + 1);
                }
            }
        } catch (err) {
            console.error('Error toggling follow:', err);
        } finally {
            setLoading(false);
        }
    };

    return { isFollowing, followerCount, followingCount, toggleFollow, loading, refresh: fetchFollowStats };
}
