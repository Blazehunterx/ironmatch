import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/database';
import { mockUsers } from '../lib/mock';

interface AuthContextType {
    user: User | null;
    login: (email: string) => Promise<void>;
    logout: () => void;
    signup: (userData: Partial<User>) => Promise<void>;
    updateUser: (userData: Partial<User>) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('ironmatch_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string) => {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
                if (foundUser) {
                    setUser(foundUser);
                    localStorage.setItem('ironmatch_user', JSON.stringify(foundUser));
                    resolve();
                } else {
                    reject(new Error('User not found. Try alex@example.com'));
                }
            }, 500);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('ironmatch_user');
    };

    const signup = async (userData: Partial<User>) => {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const newUser: User = {
                    id: `u${Date.now()}`,
                    name: userData.name || '',
                    email: userData.email || '',
                    home_gym: userData.home_gym || 'g1',
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
    };

    const updateUser = (userData: Partial<User>) => {
        if (!user) return;
        const updated = { ...user, ...userData };
        setUser(updated);
        localStorage.setItem('ironmatch_user', JSON.stringify(updated));
        // Also update in mockUsers array
        const idx = mockUsers.findIndex(u => u.id === user.id);
        if (idx !== -1) {
            mockUsers[idx] = updated;
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
