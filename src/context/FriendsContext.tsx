import { createContext, useContext, useState, useCallback } from 'react';
import { User } from '../types/database';
import { mockUsers } from '../lib/mock';
import { useAuth } from './AuthContext';

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

    // Friends = accepted connections (stored as user IDs)
    const [friendIds, setFriendIds] = useState<string[]>(() => {
        return user?.friends || ['u2', 'u4']; // Start with a couple mock friends
    });

    // Pending requests received from others
    const [pendingReceivedIds, setPendingReceivedIds] = useState<string[]>(['u6']);

    // Pending requests sent to others
    const [pendingSentIds, setPendingSentIds] = useState<string[]>([]);

    const friends = friendIds.map(id => mockUsers.find(u => u.id === id)).filter(Boolean) as User[];
    const pendingReceived = pendingReceivedIds.map(id => mockUsers.find(u => u.id === id)).filter(Boolean) as User[];

    const sendFriendRequest = useCallback((userId: string) => {
        if (friendIds.includes(userId) || pendingSentIds.includes(userId)) return;
        setPendingSentIds(prev => [...prev, userId]);
    }, [friendIds, pendingSentIds]);

    const acceptFriend = useCallback((userId: string) => {
        setPendingReceivedIds(prev => prev.filter(id => id !== userId));
        setFriendIds(prev => {
            const updated = [...prev, userId];
            if (user) updateUser({ friends: updated });
            return updated;
        });
    }, [user, updateUser]);

    const declineFriend = useCallback((userId: string) => {
        setPendingReceivedIds(prev => prev.filter(id => id !== userId));
    }, []);

    const removeFriend = useCallback((userId: string) => {
        setFriendIds(prev => {
            const updated = prev.filter(id => id !== userId);
            if (user) updateUser({ friends: updated });
            return updated;
        });
    }, [user, updateUser]);

    const getFriendStatus = useCallback((userId: string): FriendStatus => {
        if (friendIds.includes(userId)) return 'friends';
        if (pendingSentIds.includes(userId)) return 'pending_sent';
        if (pendingReceivedIds.includes(userId)) return 'pending_received';
        return 'none';
    }, [friendIds, pendingSentIds, pendingReceivedIds]);

    const getFriendCount = useCallback(() => friendIds.length, [friendIds]);

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
