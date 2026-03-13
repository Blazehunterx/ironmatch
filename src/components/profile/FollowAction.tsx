import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useFollow } from '../../hooks/useFollow';

export default function FollowAction({ targetUserId }: { targetUserId: string }) {
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
    }, []);

    const { isFollowing, toggleFollow, loading } = useFollow(targetUserId, currentUserId || undefined);

    if (!currentUserId || currentUserId === targetUserId) return null;

    return (
        <button
            onClick={toggleFollow}
            disabled={loading}
            className={`flex-1 py-4.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${isFollowing
                ? 'bg-gray-800 text-gray-400 border border-gray-700'
                : 'bg-white text-oled hover:bg-gray-200'
                }`}
        >
            {isFollowing ? 'Following' : 'Follow'}
        </button>
    );
}
