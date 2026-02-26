import { createContext, useContext, useState, useCallback } from 'react';
import { User } from '../types/database';
import { mockUsers } from '../lib/mock';

interface Message {
    from: string;
    text: string;
    time: string;
    isVoice?: boolean;
}

interface Conversation {
    user: User;
    lastMessage: string;
    time: string;
    unread: boolean;
    accepted: boolean;
    messages: Message[];
}

interface ConversationContextType {
    conversations: Conversation[];
    addConversation: (user: User, isAccepted?: boolean) => void;
    sendMessage: (userId: string, text: string, isVoice?: boolean, fromUserId?: string) => void;
    getUnreadCount: () => number;
}

const ConversationContext = createContext<ConversationContextType | null>(null);

export function ConversationProvider({ children, currentUserId }: { children: React.ReactNode; currentUserId: string }) {
    const [conversations, setConversations] = useState<Conversation[]>(() => {
        const others = mockUsers.filter(u => u.id !== currentUserId).slice(0, 4);
        return [
            {
                user: others[0],
                lastMessage: 'Sounds good, see you at 6!',
                time: '12:30 PM',
                unread: false,
                accepted: true,
                messages: [
                    { from: currentUserId, text: `Hey ${others[0]?.name?.split(' ')[0]}, want to hit a session tomorrow?`, time: '11:20 AM' },
                    { from: others[0]?.id || '', text: 'Yes! What time works for you?', time: '11:45 AM' },
                    { from: currentUserId, text: 'How about 6 PM? Leg day 🔥', time: '12:10 PM' },
                    { from: others[0]?.id || '', text: 'Sounds good, see you at 6!', time: '12:30 PM' },
                ]
            },
            {
                user: others[1],
                lastMessage: 'Are you still looking for a spotter?',
                time: 'Yesterday',
                unread: true,
                accepted: true,
                messages: [
                    { from: others[1]?.id || '', text: 'Hey! Saw your profile. I need a spotter for bench day.', time: 'Yesterday' },
                    { from: currentUserId, text: 'Sure, I\'m at Iron Forge most evenings', time: 'Yesterday' },
                    { from: others[1]?.id || '', text: 'Are you still looking for a spotter?', time: 'Yesterday' },
                ]
            },
            {
                user: others[2],
                lastMessage: 'Sent you a workout request!',
                time: 'Mon',
                unread: false,
                accepted: false,
                messages: [
                    { from: others[2]?.id || '', text: 'Sent you a workout request!', time: 'Mon' },
                ]
            },
        ].filter(c => c.user);
    });

    const addConversation = useCallback((user: User, isAccepted = true) => {
        setConversations(prev => {
            // Don't add duplicate
            if (prev.find(c => c.user.id === user.id)) {
                // If it already exists, just mark as accepted
                return prev.map(c => c.user.id === user.id ? { ...c, accepted: isAccepted } : c);
            }
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return [{
                user,
                lastMessage: isAccepted ? 'Workout request accepted! 💪' : 'Sent you a workout request!',
                time: 'Just now',
                unread: true,
                accepted: isAccepted,
                messages: [{
                    from: isAccepted ? 'system' : user.id,
                    text: isAccepted ? `${user.name} accepted your workout request! Say hi 👋` : 'Sent you a workout request!',
                    time: now,
                }]
            }, ...prev];
        });
    }, []);

    const sendMessage = useCallback((userId: string, text: string, isVoice?: boolean, fromUserId?: string) => {
        setConversations(prev => prev.map(c => {
            if (c.user.id === userId) {
                const newMsg: Message = { from: fromUserId || currentUserId, text, time: 'Just now', isVoice };
                return {
                    ...c,
                    lastMessage: isVoice ? '🎤 Voice message' : text,
                    time: 'Just now',
                    unread: false,
                    messages: [...c.messages, newMsg]
                };
            }
            return c;
        }));
    }, [currentUserId]);

    const getUnreadCount = useCallback(() => {
        return conversations.filter(c => c.unread).length;
    }, [conversations]);

    return (
        <ConversationContext.Provider value={{ conversations, addConversation, sendMessage, getUnreadCount }}>
            {children}
        </ConversationContext.Provider>
    );
}

export function useConversations() {
    const context = useContext(ConversationContext);
    if (!context) throw new Error('useConversations must be used within ConversationProvider');
    return context;
}
