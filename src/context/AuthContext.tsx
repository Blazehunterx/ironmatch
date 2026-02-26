import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockUsers } from '../lib/mock';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    signup: (userData: Partial<User> & { password?: string }) => Promise<void>;
    updateUser: (userData: Partial<User>) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert a Supabase profile row into our User type
function profileToUser(profile: any): User {
    return {
        id: profile.id,
        name: profile.name || '',
        email: profile.email || '',
        home_gym: profile.home_gym || '',
        fitness_level: profile.fitness_level || 'Beginner',
        reliability_streak: profile.reliability_streak || 0,
        profile_image_url: profile.profile_image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name || 'U'}`,
        bio: profile.bio || '',
        is_trainer: profile.is_trainer || false,
        goals: profile.goals || [],
        sub_goals: profile.sub_goals || [],
        availability: profile.availability || [],
        weight_kg: profile.weight_kg,
        height_cm: profile.height_cm,
        unit_preference: profile.unit_preference || 'lbs',
        discipline: profile.discipline || 'General Fitness',
        xp: profile.xp || 0,
        friends: profile.friends || [],
        big4: profile.big4 || { bench: 0, squat: 0, deadlift: 0, ohp: 0 },
    };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // On mount: check for existing Supabase session
    useEffect(() => {
        if (!isSupabaseConfigured) {
            // Fallback to localStorage mock
            const storedUser = localStorage.getItem('ironmatch_user');
            if (storedUser) setUser(JSON.parse(storedUser));
            setLoading(false);
            return;
        }

        // Check current session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                const profile = await fetchProfile(session.user.id);
                if (profile) setUser(profile);
            }
            setLoading(false);
        });

        // Listen for auth changes (login/logout/token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const profile = await fetchProfile(session.user.id);
                if (profile) setUser(profile);
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function fetchProfile(userId: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !data) {
            console.warn('Profile fetch error:', error);
            return null;
        }
        return profileToUser(data);
    }

    const login = async (email: string, password: string) => {
        if (!isSupabaseConfigured) {
            // Fallback: mock login
            return new Promise<void>((resolve, reject) => {
                setTimeout(() => {
                    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
                    if (foundUser) {
                        setUser(foundUser);
                        localStorage.setItem('ironmatch_user', JSON.stringify(foundUser));
                        localStorage.setItem('ironmatch_remembered_email', foundUser.email);
                        resolve();
                    } else {
                        reject(new Error('User not found. Try alex@example.com'));
                    }
                }, 500);
            });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw new Error(error.message);
        if (data.user) {
            localStorage.setItem('ironmatch_remembered_email', email);
            const profile = await fetchProfile(data.user.id);
            if (profile) setUser(profile);
        }
    };

    const logout = async () => {
        if (isSupabaseConfigured) {
            await supabase.auth.signOut();
        }
        setUser(null);
        localStorage.removeItem('ironmatch_user');
    };

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
                    localStorage.setItem('ironmatch_user', JSON.stringify(newUser));
                    resolve();
                }, 800);
            });
        }

        // Real Supabase signup
        const { data, error } = await supabase.auth.signUp({
            email: userData.email || '',
            password: userData.password || '',
            options: {
                data: {
                    name: userData.name || '',
                },
            },
        });

        if (error) throw new Error(error.message);

        // After signup, update the auto-created profile with the name
        if (data.user) {
            if (userData.email) {
                localStorage.setItem('ironmatch_remembered_email', userData.email);
            }
            await supabase.from('profiles').update({
                name: userData.name || '',
            }).eq('id', data.user.id);

            const profile = await fetchProfile(data.user.id);
            if (profile) setUser(profile);
        }
    };

    const updateUser = async (userData: Partial<User>) => {
        if (!user) return;
        const updated = { ...user, ...userData };
        setUser(updated);

        if (isSupabaseConfigured) {
            // Persist to Supabase
            const { error } = await supabase
                .from('profiles')
                .update({
                    name: updated.name,
                    bio: updated.bio,
                    fitness_level: updated.fitness_level,
                    home_gym: updated.home_gym,
                    is_trainer: updated.is_trainer,
                    profile_image_url: updated.profile_image_url,
                    weight_kg: updated.weight_kg,
                    height_cm: updated.height_cm,
                    unit_preference: updated.unit_preference,
                    discipline: updated.discipline,
                    xp: updated.xp,
                    reliability_streak: updated.reliability_streak,
                    goals: updated.goals,
                    sub_goals: updated.sub_goals,
                    availability: updated.availability,
                    big4: updated.big4,
                    friends: updated.friends,
                })
                .eq('id', user.id);

            if (error) console.warn('Profile update error:', error);
        } else {
            localStorage.setItem('ironmatch_user', JSON.stringify(updated));
            const idx = mockUsers.findIndex(u => u.id === user.id);
            if (idx !== -1) mockUsers[idx] = updated;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, signup, updateUser, loading }}>
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
