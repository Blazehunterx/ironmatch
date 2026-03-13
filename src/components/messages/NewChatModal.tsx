import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon, ChevronRight } from 'lucide-react';
import { User } from '../../types/database';

interface NewChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    searchQuery: string;
    onSearchChange: (val: string) => void;
    isSearching: boolean;
    availableUsers: User[];
    onUserSelect: (user: User) => void;
}

export default function NewChatModal({
    isOpen, onClose, searchQuery, onSearchChange, isSearching, availableUsers, onUserSelect
}: NewChatModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/85 backdrop-blur-md z-50"
                    />
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-oled rounded-t-3xl max-h-[70vh] overflow-y-auto"
                    >
                        <div className="px-5 py-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">New Message</h3>
                                <button onClick={onClose} className="p-2 text-gray-500 hover:text-white rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    placeholder="Search people..."
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-lime text-sm"
                                />
                                <SearchIcon size={18} className="text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                            </div>
                            <div className="space-y-1">
                                {isSearching ? (
                                    <div className="flex justify-center py-8">
                                        <div className="w-6 h-6 border-2 border-lime/30 border-t-lime rounded-full animate-spin" />
                                    </div>
                                ) : availableUsers.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-8">
                                        {searchQuery.trim() ? 'No users found' : 'Type to search people...'}
                                    </p>
                                ) : (
                                    availableUsers.map(u => (
                                        <button
                                            key={u.id}
                                            onClick={() => onUserSelect(u)}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-900 transition-colors text-left"
                                        >
                                            <img src={u.profile_image_url} alt={u.name} className="w-11 h-11 rounded-full border border-gray-800 object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                                                <p className="text-[10px] text-gray-500">{u.fitness_level} • {u.bio?.slice(0, 40) || 'No bio'}</p>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-700 shrink-0" />
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
