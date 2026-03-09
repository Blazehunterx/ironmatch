import { createContext, useContext, useState, useCallback } from 'react';
import { User } from '../types/database';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useEffect } from 'react';

type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends';

interface FriendsContextType {
    friends: User[];
    pendingReceived: User[];
    pendingSent: string[];
    sendFriendRequest: (userId: string) => void;
    acceptFriend: (userId: string) => void;
    declineFriend: (userId: string) => void;
    removeFriend: (userId: string) => void;
    getFriendStatus: (userId: string) => FriendStatus;
    getFriendCount: () => number;
}

const FriendsContext = createContext<FriendsContextType | null>(null);

export function FriendsProvider({ children }: { children: React.ReactNode }) {
    const { user, updateUser } = useAuth();

    // Friends lookup (Real profiles hydrated from IDs)
    const [friends, setFriends] = useState<User[]>([]);
    const [pendingReceived, setPendingReceived] = useState<User[]>([]);
    const [pendingSentIds, setPendingSentIds] = useState<string[]>([]);

    const fetchFriendsData = useCallback(async () => {
        if (!user?.id || !isSupabaseConfigured) {
            setFriends([]);
            setPendingReceived([]);
            return;
        }

        try {
            // 1. Fetch friend list from profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('friends')
                .eq('id', user.id)
                .single();

            const friendIds = profile?.friends || [];

            // 2. Fetch pending received requests from the new friend_requests table
            const { data: requests } = await supabase
                .from('friend_requests')
                .select('sender_id')
                .eq('receiver_id', user.id)
                .eq('status', 'pending');

            const pendingReceivedIds = requests?.map(r => r.sender_id) || [];

            // 3. Fetch pending sent requests
            const { data: sentRequests } = await supabase
                .from('friend_requests')
                .select('receiver_id')
                .eq('sender_id', user.id)
                .eq('status', 'pending');

            const pendingIdsFromDB = sentRequests?.map(r => r.receiver_id) || [];
            if (pendingIdsFromDB.length > 0) {
                setPendingSentIds(pendingIdsFromDB);
            }

            const allIds = [...new Set([...friendIds, ...pendingReceivedIds])];

            if (allIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('*')
                    .in('id', allIds);

                if (profiles) {
                    setFriends(friendIds.map((id: string) => profiles.find(p => p.id === id)).filter(Boolean) as User[]);
                    setPendingReceived(pendingReceivedIds.map((id: string) => profiles.find(p => p.id === id)).filter(Boolean) as User[]);
                }
            } else {
                setFriends([]);
                setPendingReceived([]);
            }
        } catch (err) {
            console.error('Error fetching friends:', err);
        } finally {
        }
    }, [user?.id]);

    useEffect(() => {
        fetchFriendsData();

        if (isSupabaseConfigured && user?.id) {
            // Simple real-time subscription for friend requests
            const channel = supabase
                .channel('friendship_changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'friend_requests' }, () => {
                    fetchFriendsData();
                })
                .subscribe();

            return () => { supabase.removeChannel(channel); };
        }
    }, [user?.id, fetchFriendsData]);

    const sendFriendRequest = useCallback(async (userId: string) => {
        if (!user || !isSupabaseConfigured) return;

        const { error } = await supabase.from('friend_requests').insert({
            sender_id: user.id,
            receiver_id: userId,
            status: 'pending'
        });

        if (!error) {
            setPendingSentIds(prev => [...prev, userId]);
        }
    }, [user]);

    const acceptFriend = useCallback(async (userId: string) => {
        if (!user || !isSupabaseConfigured) return;

        // 1. Update request status
        await supabase.from('friend_requests')
            .update({ status: 'accepted' })
            .eq('sender_id', userId)
            .eq('receiver_id', user.id);

        // 2. Explicitly link them as buddies in the profiles (cached for performance)
        const { data: currentProfile } = await supabase.from('profiles').select('friends').eq('id', user.id).single();
        const { data: senderProfile } = await supabase.from('profiles').select('friends').eq('id', userId).single();

        const newFriends = Array.from(new Set([...(currentProfile?.friends || []), userId]));
        const senderNewFriends = Array.from(new Set([...(senderProfile?.friends || []), user.id]));

        await supabase.from('profiles').update({ friends: newFriends }).eq('id', user.id);
        await supabase.from('profiles').update({ friends: senderNewFriends }).eq('id', userId);

        updateUser({ friends: newFriends });
        fetchFriendsData();
    }, [user, updateUser, fetchFriendsData]);

    const declineFriend = useCallback(async (userId: string) => {
        if (!user || !isSupabaseConfigured) return;
        await supabase.from('friend_requests')
            .delete()
            .eq('sender_id', userId)
            .eq('receiver_id', user.id);
        fetchFriendsData();
    }, [user, fetchFriendsData]);

    const removeFriend = useCallback(async (userId: string) => {
        if (!user || !isSupabaseConfigured) return;
        const updatedFriends = (user.friends || []).filter(id => id !== userId);
        updateUser({ friends: updatedFriends });
        fetchFriendsData();
    }, [user, updateUser, fetchFriendsData]);

    const getFriendStatus = useCallback((userId: string): FriendStatus => {
        if (user?.friends?.includes(userId)) return 'friends';
        if (pendingSentIds.includes(userId)) return 'pending_sent';
        if (pendingReceived.some(u => u.id === userId)) return 'pending_received';
        return 'none';
    }, [user?.friends, pendingSentIds, pendingReceived]);

    const getFriendCount = useCallback(() => user?.friends?.length || 0, [user?.friends]);

    return (
        <FriendsContext.Provider value={{
            friends, pendingReceived, pendingSent: pendingSentIds,
            sendFriendRequest, acceptFriend, declineFriend, removeFriend,
            getFriendStatus, getFriendCount
        }}>
            {children}
        </FriendsContext.Provider>
    );
}

export function useFriends() {
    const context = useContext(FriendsContext);
    if (!context) throw new Error('useFriends must be used within FriendsProvider');
    return context;
}
