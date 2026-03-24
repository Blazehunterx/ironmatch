import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockUsers } from '../lib/mock';
import { withTimeout, profileToUser } from '../lib/authUtils';
import { safeStorage } from '../lib/safeStorage';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    signup: (userData: Partial<User> & { password?: string }) => Promise<void>;
    updateUser: (userData: Partial<User>) => Promise<void>;
    resetPasswordEmail: (email: string) => Promise<void>;
    updatePassword: (password: string) => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // On mount: check for existing Supabase session
    useEffect(() => {
        if (!isSupabaseConfigured) {
            // Fallback to localStorage mock
            const storedUser = safeStorage.getItem('ironmatch_user');
            if (storedUser) setUser(JSON.parse(storedUser));
            setLoading(false);
            return;
        }

        // Check current session with a timeout
        const initAuth = async () => {
            // Optimistic Recovery: Try to get user from safeStorage immediately
            try {
                const cached = safeStorage.getItem('ironmatch_user');
                if (cached) {
                    const parsed = JSON.parse(cached);
                    setUser(parsed);
                    // If we have a cache, we can set loading to false earlier to show UI
                    setLoading(false);
                }
            } catch (e) {}

            try {
                const { data: { session } } = await withTimeout(
                    supabase.auth.getSession(),
                    5000,
                    'Auth session timeout'
                );

                if (session?.user) {
                    const profile = await fetchProfile(session.user.id);
                    if (profile) setUser(profile);
                } else {
                    // No session, clear any stale cached user
                    setUser(null);
                    safeStorage.removeItem('ironmatch_user');
                }
            } catch (err) {
                console.warn('Auth init timeout/error:', err);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth event:', event, !!session?.user);

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                if (session?.user) {
                    // Only fetch if we don't have a user OR if it's a different user
                    if (!user || user.id !== session.user.id) {
                        const profile = await fetchProfile(session.user.id);
                        if (profile) setUser(profile);
                    }
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                safeStorage.clear(); // Nuclear option on sign-out to fix quota issues for next user
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function fetchProfile(userId: string, retries = 3): Promise<User | null> {
        console.log('FETCH_PROFILE_START:', userId, 'Attempt:', 4 - retries);
        try {
            const { data, error } = await withTimeout(
                supabase.from('profiles').select('*').eq('id', userId).maybeSingle() as any,
                15000,
                'Profile fetch timed out (15s limit)'
            ) as any;

            if (error) {
                // Handle specific Supabase/Abort errors
                if (error.message?.includes('AbortError') || error.message?.includes('Lock broken')) {
                    console.warn('Profile fetch lock conflict, retrying...');
                    await new Promise(r => setTimeout(r, 500));
                    return fetchProfile(userId, retries); // Don't decrement retries for sync/lock issues
                }

                if (retries > 0 && (error.code === 'PGRST116' || error.message.includes('JSON object'))) {
                    // Profile not found yet (common after signup) or transient error
                    console.log('Profile not found yet, retrying in 1s...');
                    await new Promise(r => setTimeout(r, 1000));
                    return fetchProfile(userId, retries - 1);
                }
                console.error('FETCH_PROFILE_DB_ERROR:', error.message, error.details);
                return null;
            }
            if (!data) {
                if (retries > 0) {
                    await new Promise(r => setTimeout(r, 1500));
                    return fetchProfile(userId, retries - 1);
                }
                console.warn('FETCH_PROFILE_EMPTY_RESULT');
                return null;
            }
            
            console.log('FETCH_PROFILE_SUCCESS:', data.name);
            const hydratedUser = profileToUser(data);
            // Optionally persist a small copy to mock storage for ultra-offline recovery
            try {
                safeStorage.setItem('ironmatch_user', JSON.stringify(hydratedUser));
            } catch (e) {}
            
            return hydratedUser;
        } catch (err: any) {
            if (err.message?.includes('Lock broken')) {
                await new Promise(r => setTimeout(r, 500));
                return fetchProfile(userId, retries);
            }
            console.error('FETCH_PROFILE_EXCEPTION:', err.message);
            if (retries > 0) {
                await new Promise(r => setTimeout(r, 1500));
                return fetchProfile(userId, retries - 1);
            }
            return null;
        }
    }

    const login = async (email: string, password: string) => {
        if (!isSupabaseConfigured) {
            // Fallback: mock login
            return new Promise<void>((resolve, reject) => {
                setTimeout(() => {
                    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
                    if (foundUser) {
                        setUser(foundUser);
                        safeStorage.setItem('ironmatch_user', JSON.stringify(foundUser));
                        safeStorage.setItem('ironmatch_remembered_email', foundUser.email);
                        resolve();
                    } else {
                        reject(new Error('User not found. Try alex@example.com'));
                    }
                }, 500);
            });
        }

        const sanitizedEmail = email.trim().toLowerCase();
        const sanitizedPassword = password.trim();

        setLoading(true);
        try {
            const { data, error } = await withTimeout(
                supabase.auth.signInWithPassword({ email: sanitizedEmail, password: sanitizedPassword }),
                10000,
                'Sign-in timed out. Please check your connection and refresh.'
            ) as any;

            if (error) throw new Error(error.message);

            if (data.user) {
                try {
                    safeStorage.setItem('ironmatch_remembered_email', email);
                } catch (e) {}

                // Await profile hydration BEFORE finishing loading state
                let profile = await fetchProfile(data.user.id);
                
                if (!profile) {
                    console.warn('Profile missing for authenticated user. Attempting auto-creation...');
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: data.user.id,
                            name: data.user.user_metadata?.name || email.split('@')[0],
                            email: email,
                            fitness_level: 'Beginner',
                            xp: 0
                        })
                        .select()
                        .maybeSingle();

                    if (!profileError && profileData) {
                        console.info('Auto-created profile successfully.');
                        profile = profileToUser(profileData);
                    }
                }

                if (profile) {
                    setUser(profile);
                } else {
                    throw new Error('Your account exists, but we couldn\'t load your Iron Empire profile. Please refresh or contact support.');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        if (isSupabaseConfigured) {
            await supabase.auth.signOut();
        }
        setUser(null);
        safeStorage.removeItem('ironmatch_user');
    };

    async function uploadProfileImage(base64: string, userId: string): Promise<string> {
        // Convert base64 to blob
        const base64Data = base64.split(',')[1];
        const contentType = base64.split(';')[0].split(':')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: contentType });

        const fileName = `${userId}_${Date.now()}.png`;

        // Upload to storage
        const { error } = await supabase.storage
            .from('avatars')
            .upload(fileName, blob, {
                contentType: contentType,
                cacheControl: '3600',
                upsert: true
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

        return publicUrl;
    }

    const signup = async (userData: Partial<User> & { password?: string }) => {
        if (!isSupabaseConfigured) {
            // Fallback: mock signup
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    const newUser: User = {
                        id: `u${Date.now()}`,
                        name: userData.name || '',
                        email: userData.email || '',
                        home_gym: userData.home_gym || '',
                        fitness_level: userData.fitness_level || 'Beginner',
                        reliability_streak: 0,
                        profile_image_url: userData.profile_image_url || 'https://i.pravatar.cc/150',
                        bio: userData.bio || '',
                        is_trainer: userData.is_trainer || false,
                        goals: userData.goals || [],
                        sub_goals: userData.sub_goals || [],
                        availability: userData.availability || [],
                    };
                    mockUsers.push(newUser);
                        setUser(newUser);
                        safeStorage.setItem('ironmatch_user', JSON.stringify(newUser));
                        resolve();
                    }, 800);
            });
        }

        const sanitizedEmail = (userData.email || '').trim().toLowerCase();
        const sanitizedName = (userData.name || '').trim();
        const sanitizedPassword = (userData.password || '').trim();

        setLoading(true);
        try {
            // Real Supabase signup
            const { data, error } = await supabase.auth.signUp({
                email: sanitizedEmail,
                password: sanitizedPassword,
                options: {
                    data: {
                        name: sanitizedName,
                    },
                },
            });

            if (error) throw new Error(error.message);

            // After signup, ensure profile exists with the name
            if (data.user) {
                if (userData.email) {
                    safeStorage.setItem('ironmatch_remembered_email', userData.email);
                }
                
                const { error: upsertError } = await supabase.from('profiles').upsert({
                    id: data.user.id,
                    name: userData.name || '',
                    email: sanitizedEmail,
                    fitness_level: userData.fitness_level || 'Beginner',
                    home_gym: userData.home_gym || '',
                    profile_image_url: userData.profile_image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name || 'U'}`
                });

                if (upsertError) console.error('SIGNUP_PROFILE_UPSERT_ERROR:', upsertError);

                const profile = await fetchProfile(data.user.id);
                if (profile) setUser(profile);
            }
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (userData: Partial<User>) => {
        if (!user) return;
        const updated = { ...user, ...userData };

        // Deep merge big4 if it exists in userData
        if (userData.big4) {
            updated.big4 = { ...user.big4, ...userData.big4 };
        }

        setUser(updated);

        if (isSupabaseConfigured) {
            const payload: any = {};
            
            // If profile_image_url is base64, upload it first
            if (userData.profile_image_url?.startsWith('data:image')) {
                try {
                    const publicUrl = await uploadProfileImage(userData.profile_image_url, user.id);
                    payload.profile_image_url = publicUrl;
                    updated.profile_image_url = publicUrl;
                    setUser(updated); // Update again with the real URL
                } catch (err) {
                    console.error('IMAGE_UPLOAD_ERROR:', err);
                    throw err;
                }
            }

            Object.keys(userData).forEach(key => {
                if (key === 'profile_image_url' && payload.profile_image_url) return; // Already handled
                if (key === 'big4') {
                    payload[key] = updated.big4;
                } else {
                    payload[key] = (userData as any)[key];
                }
            });

            const { error } = await supabase
                .from('profiles')
                .update(payload)
                .eq('id', user.id);

            if (error) {
                console.error('CRITICAL_UPDATE_ERROR:', error.message, error.details);
                throw error;
            } else {
                console.log('SUCCESS: Profile persistence for:', Object.keys(payload).join(', '));
            }
        } else {
            safeStorage.setItem('ironmatch_user', JSON.stringify(updated));
            const idx = mockUsers.findIndex(u => u.id === user.id);
            if (idx !== -1) mockUsers[idx] = updated;
        }
    };

    const updatePassword = async (password: string) => {
        if (!isSupabaseConfigured) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session found. Please request a new reset link.');

        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw new Error(error.message);
    };

    const resetPasswordEmail = async (email: string) => {
        if (!isSupabaseConfigured) return;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw new Error(error.message);
    };

    const contextValue = React.useMemo(() => ({
        user,
        login,
        logout,
        signup,
        updateUser,
        resetPasswordEmail,
        updatePassword,
        loading
    }), [user, loading]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
