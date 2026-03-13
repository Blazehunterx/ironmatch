import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface NotificationsContextType {
    token: string | null;
    notifications: PushNotificationSchema[];
    register: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<PushNotificationSchema[]>([]);

    const saveTokenToDb = useCallback(async (tokenValue: string) => {
        if (!user?.id) return;

        try {
            const { error } = await supabase
                .from('user_push_tokens')
                .upsert({
                    user_id: user.id,
                    token: tokenValue,
                    device_type: Capacitor.getPlatform(),
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, token' });

            if (error) console.error('Error saving push token:', error);
            else console.log('Push token synced to DB');
        } catch (err) {
            console.error('Push token sync crash:', err);
        }
    }, [user?.id]);

    const register = useCallback(async () => {
        if (Capacitor.getPlatform() === 'web') {
            console.log('Push notifications not supported on web');
            return;
        }

        try {
            // 1. Request Permission
            let perm = await PushNotifications.checkPermissions();
            if (perm.receive === 'prompt') {
                perm = await PushNotifications.requestPermissions();
            }

            if (perm.receive !== 'granted') {
                throw new Error('Push permission denied');
            }

            // 2. Register with FCM
            await PushNotifications.register();

            // 3. Listen for token
            PushNotifications.addListener('registration', (token: Token) => {
                console.log('Push registration success:', token.value);
                setToken(token.value);
                saveTokenToDb(token.value);
            });

            PushNotifications.addListener('registrationError', (error: any) => {
                console.error('Push registration error:', error);
            });

            // 4. Listen for notifications
            PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
                console.log('Push received:', notification);
                setNotifications(prev => [notification, ...prev]);
            });

            PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
                console.log('Push action:', notification);
                const data = notification.notification.data;
                if (data.type === 'message') navigate('/messages');
                if (data.type === 'gym_war' || data.type === 'duel') navigate('/arena');
            });

        } catch (err) {
            console.error('Notification Setup Failed:', err);
        }
    }, [saveTokenToDb]);

    useEffect(() => {
        if (user?.id) {
            register();
        }
    }, [user?.id, register]);

    return (
        <NotificationsContext.Provider value={{ token, notifications, register }}>
            {children}
        </NotificationsContext.Provider>
    );
}

export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (!context) throw new Error('useNotifications must be used within NotificationsProvider');
    return context;
};
