import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, ShieldAlert, Loader2, UserX } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { User } from '../../types/database';

export default function AdminUserManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.length < 2) return;

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .ilike('name', `%${searchQuery}%`)
                .limit(10);

            if (error) throw error;
            setResults(data || []);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (user: User) => {
        if (!window.confirm(`PERMANENTLY DELETE user "${user.name}"? This will remove all their posts, workouts, and data. This cannot be undone.`)) return;

        setIsDeleting(user.id);
        try {
            // Delete from profiles (Cascade handles the rest)
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', user.id);

            if (error) {
                alert(`Failed to delete user: ${error.message}`);
                throw error;
            }

            setResults(prev => prev.filter(u => u.id !== user.id));
            alert('User purged successfully.');
        } catch (err) {
            console.error('Delete error:', err);
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <section className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                    <Trash2 className="text-red-500" size={20} />
                </div>
                <div>
                    <h3 className="text-white font-bold text-sm uppercase italic">User Purge Gate</h3>
                    <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Administrative Deletion</p>
                </div>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-oled border border-gray-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    />
                </div>
                <button
                    type="submit"
                    className="px-6 py-3 bg-gray-800 text-white rounded-xl font-bold text-xs uppercase hover:bg-gray-700 transition-colors"
                >
                    Search
                </button>
            </form>

            <div className="space-y-3">
                {isLoading && (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="animate-spin text-gray-600" size={20} />
                    </div>
                )}

                <AnimatePresence>
                    {results.map(u => (
                        <motion.div
                            key={u.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-oled border border-gray-800 rounded-2xl p-4 flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <img src={u.profile_image_url} alt="" className="w-10 h-10 rounded-xl object-cover border border-gray-800" />
                                <div>
                                    <p className="text-white font-bold text-sm">{u.name}</p>
                                    <p className="text-[10px] text-gray-500 font-mono">{u.email}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDeleteUser(u)}
                                disabled={isDeleting === u.id}
                                className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                            >
                                {isDeleting === u.id ? <Loader2 className="animate-spin" size={18} /> : <UserX size={18} />}
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {!isLoading && results.length === 0 && searchQuery.length >= 2 && (
                    <div className="text-center py-6 space-y-2 opacity-50">
                        <ShieldAlert className="mx-auto text-gray-600" size={24} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">No users found in shadow sector</p>
                    </div>
                )}
            </div>
        </section>
    );
}
