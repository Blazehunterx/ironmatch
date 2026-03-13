import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConversations } from '../context/ConversationContext';
import { supabase } from '../lib/supabase';
import { User } from '../types/database';
import { Search as SearchIcon, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatThread from '../components/ChatThread';

// Modular Components
import MessageList from '../components/messages/MessageList';
import NewChatModal from '../components/messages/NewChatModal';

export default function Messages() {
    const { user } = useAuth();
    const { conversations, sendMessage, addConversation } = useConversations();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
    const [showNewChat, setShowNewChat] = useState(false);
    const [newChatSearch, setNewChatSearch] = useState('');

    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!showNewChat || !newChatSearch.trim()) {
            setAvailableUsers([]);
            return;
        }

        const devSearch = async () => {
            setIsSearching(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .neq('id', user?.id)
                .ilike('name', `%${newChatSearch}%`)
                .limit(10);

            if (!error && data) {
                setAvailableUsers(data as User[]);
            }
            setIsSearching(false);
        };

        const timer = setTimeout(devSearch, 300);
        return () => clearTimeout(timer);
    }, [newChatSearch, showNewChat, user?.id]);

    const filtered = conversations.filter(c =>
        c.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-screen pb-24 relative">
            <AnimatePresence mode="wait">
                {activeChatUserId ? (() => {
                    const conv = conversations.find(c => c.user.id === activeChatUserId);
                    if (!conv) return null;
                    return (
                        <ChatThread
                            key="chat"
                            conversation={conv}
                            currentUserId={user?.id || ''}
                            onBack={() => setActiveChatUserId(null)}
                            onSend={(text: string, isVoice?: boolean) => sendMessage(activeChatUserId, text, isVoice)}
                            canSendMore={conv.accepted || conv.messages.filter(m => m.from === user?.id).length < 1}
                        />
                    );
                })() : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-4 py-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-3xl font-bold text-white">Messages</h2>
                            <button
                                onClick={() => setShowNewChat(true)}
                                className="p-2.5 rounded-xl bg-lime text-oled hover:bg-lime/90 active:scale-95 transition-all"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        <div className="relative mb-5">
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-lime text-sm"
                            />
                            <SearchIcon size={18} className="text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        </div>

                        <MessageList 
                            filtered={filtered} 
                            onChatSelect={setActiveChatUserId} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <NewChatModal 
                isOpen={showNewChat}
                onClose={() => setShowNewChat(false)}
                searchQuery={newChatSearch}
                onSearchChange={setNewChatSearch}
                isSearching={isSearching}
                availableUsers={availableUsers}
                onUserSelect={(u) => {
                    addConversation(u, false);
                    setShowNewChat(false);
                    setNewChatSearch('');
                    setActiveChatUserId(u.id);
                }}
            />
        </div>
    );
}

