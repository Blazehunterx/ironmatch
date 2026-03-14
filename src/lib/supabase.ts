import { createClient } from '@supabase/supabase-js';
import { safeStorage } from './safeStorage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Using mock data fallback.');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder',
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            storageKey: 'ironmatch-auth-token',
            storage: {
                getItem: (key) => safeStorage.getItem(key),
                setItem: (key, value) => { safeStorage.setItem(key, value); },
                removeItem: (key) => safeStorage.removeItem(key)
            }
        }
    }
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
