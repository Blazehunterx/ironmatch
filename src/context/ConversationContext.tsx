import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, ChatMessage } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
    loading: boolean;
}

const ConversationContext = createContext<ConversationContextType | null>(null);

// Owner of the app who welcomes new users
// Owner of the app who welcomes new users

export function ConversationProvider({ children, currentUserId }: { children: React.ReactNode; currentUserId: string }) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchConversations = useCallback(async () => {
        if (!isSupabaseConfigured || !currentUserId) {
            setLoading(false);
            return;
        }

        try {
            // 1. Fetch all messages for the current user
            const { data: messages, error } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // 2. Group by the OTHER user
            const grouped: Record<string, ChatMessage[]> = {};
            messages?.forEach(m => {
                const otherId = m.sender_id === currentUserId ? m.receiver_id : m.sender_id;
                if (!grouped[otherId]) grouped[otherId] = [];
                grouped[otherId].push(m);
            });

            // 3. Fetch profiles for all other users
            const otherIds = Object.keys(grouped);
            if (otherIds.length === 0) {
                setConversations([]);
                setLoading(false);
                return;
            }

            const { data: profiles, error: pError } = await supabase
                .from('profiles')
                .select('*')
                .in('id', otherIds);

            if (pError) throw pError;

            // 4. Construct conversation objects
            const newConversations: Conversation[] = profiles.map(profile => {
                const userMsgs = grouped[profile.id];
                const lastMsg = userMsgs[userMsgs.length - 1];

                return {
                    user: profile as User,
                    lastMessage: lastMsg.is_voice ? '🎤 Voice message' : lastMsg.content,
                    time: new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    unread: !lastMsg.is_read && lastMsg.receiver_id === currentUserId,
                    accepted: true, // Defaulting to true for now, can be linked to friends/matches later
                    messages: userMsgs.map(m => ({
                        from: m.sender_id,
                        text: m.content,
                        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        isVoice: m.is_voice
                    }))
                };
            }).sort((a, b) => {
                // Sort by last message time
                const aTime = grouped[a.user.id][grouped[a.user.id].length - 1].created_at;
                const bTime = grouped[b.user.id][grouped[b.user.id].length - 1].created_at;
                return new Date(bTime).getTime() - new Date(aTime).getTime();
            });

            setConversations(newConversations);
        } catch (err) {
            console.error('Error fetching conversations:', err);
        } finally {
            setLoading(false);
        }
    }, [currentUserId]);

    useEffect(() => {
        fetchConversations();

        if (!isSupabaseConfigured || !currentUserId) return;

        // Real-time subscription
        const channel = supabase
            .channel('realtime:messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${currentUserId}`
            }, () => {
                fetchConversations();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchConversations, currentUserId]);

    const addConversation = useCallback((user: User, isAccepted = true) => {
        setConversations(prev => {
            if (prev.find(c => c.user.id === user.id)) {
                return prev.map(c => c.user.id === user.id ? { ...c, accepted: isAccepted } : c);
            }
            return [{
                user,
                lastMessage: 'Starting a new conversation...',
                time: 'Just now',
                unread: false,
                accepted: isAccepted,
                messages: []
            }, ...prev];
        });
    }, []);

    const sendMessage = useCallback(async (userId: string, text: string, isVoice?: boolean) => {
        if (!currentUserId) return;

        // Optimistic update
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newMessage = { from: currentUserId, text, time: now, isVoice };

        setConversations(prev => prev.map(c => {
            if (c.user.id === userId) {
                return {
                    ...c,
                    lastMessage: isVoice ? '🎤 Voice message' : text,
                    time: now,
                    unread: false,
                    messages: [...c.messages, newMessage]
                };
            }
            return c;
        }));

        if (isSupabaseConfigured) {
            const { error } = await supabase.from('messages').insert({
                sender_id: currentUserId,
                receiver_id: userId,
                content: text,
                is_voice: isVoice || false,
                is_read: false
            });
            if (error) console.error('Error sending message:', error);
        }
    }, [currentUserId]);

    const getUnreadCount = useCallback(() => {
        return conversations.filter(c => c.unread).length;
    }, [conversations]);

    return (
        <ConversationContext.Provider value={{ conversations, addConversation, sendMessage, getUnreadCount, loading }}>
            {children}
        </ConversationContext.Provider>
    );
}

export function useConversations() {
    const context = useContext(ConversationContext);
    if (!context) throw new Error('useConversations must be used within ConversationProvider');
    return context;
}
