import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { GymMessage } from '../types/database';
import { useAuth } from '../context/AuthContext';

export function useShoutbox(gymId: string | null) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<GymMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMessages = useCallback(async () => {
        if (!gymId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('gym_messages')
                .select('*')
                .eq('gym_id', gymId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setMessages(data || []);
        } catch (err: any) {
            console.error('Error fetching shoutbox messages:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [gymId]);

    const sendMessage = async (content: string) => {
        if (!gymId || !user || !content.trim()) return;

        const newMessage = {
            gym_id: gymId,
            user_id: user.id,
            user_name: user.name,
            user_avatar: user.profile_image_url,
            content: content.trim(),
            created_at: new Date().toISOString(),
        };

        try {
            const { error } = await supabase.from('gym_messages').insert([newMessage]);
            if (error) throw error;
        } catch (err: any) {
            console.error('Error sending shout:', err);
            setError(err.message);
        }
    };

    useEffect(() => {
        if (!gymId) {
            setMessages([]);
            return;
        }

        fetchMessages();

        // Subscribe to real-time updates
        const channel = supabase
            .channel(`shoutbox:${gymId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'gym_messages',
                    filter: `gym_id=eq.${gymId}`,
                },
                (payload) => {
                    const newMessage = payload.new as GymMessage;
                    setMessages((prev) => [newMessage, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [gymId, fetchMessages]);

    return { messages, loading, error, sendMessage, refresh: fetchMessages };
}
