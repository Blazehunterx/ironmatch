import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConversations } from '../context/ConversationContext';
import { mockUsers } from '../lib/mock';
import { MessageSquare, Search as SearchIcon, ChevronRight, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatThread from '../components/ChatThread';

export default function Messages() {
    const { user } = useAuth();
    const { conversations, sendMessage, addConversation } = useConversations();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
    const [showNewChat, setShowNewChat] = useState(false);
    const [newChatSearch, setNewChatSearch] = useState('');

    const availableUsers = mockUsers.filter(u =>
        u.id !== user?.id &&
        !conversations.find(c => c.user.id === u.id) &&
        u.name.toLowerCase().includes(newChatSearch.toLowerCase())
    );

    const filtered = conversations.filter(c =>
        c.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-screen pb-24 relative">
            <AnimatePresence>
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

                        <div className="space-y-1">
                            {filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center text-gray-500 py-20 gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
                                        <MessageSquare size={24} className="text-gray-600" />
                                    </div>
                                    <p className="text-center font-medium">No messages yet.</p>
                                    <p className="text-sm">Request a workout to start a conversation!</p>
                                </div>
                            ) : (
                                filtered.map((chat, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.06 }}
                                        key={chat.user.id}
                                        onClick={() => setActiveChatUserId(chat.user.id)}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-900 transition-colors cursor-pointer active:scale-[0.99]"
                                    >
                                        <div className="relative shrink-0">
                                            <img src={chat.user.profile_image_url} alt={chat.user.name} className="w-14 h-14 rounded-full border border-gray-800 bg-gray-800 object-cover" />
                                            {chat.unread && (
                                                <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-lime rounded-full border-2 border-oled"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <h4 className={`text-base font-semibold truncate ${chat.unread ? 'text-white' : 'text-gray-200'}`}>
                                                    {chat.user.name}
                                                </h4>
                                                <span className="text-[10px] text-gray-500 shrink-0 ml-2">{chat.time}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {!chat.accepted && (
                                                    <span className="text-[9px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-bold shrink-0">PENDING</span>
                                                )}
                                                <p className={`text-sm truncate ${chat.unread ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>
                                                    {chat.lastMessage}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-700 shrink-0" />
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* New Chat Modal */}
            <AnimatePresence>
                {showNewChat && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowNewChat(false)}
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
                                    <button onClick={() => setShowNewChat(false)} className="p-2 text-gray-500 hover:text-white rounded-lg">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search people..."
                                        value={newChatSearch}
                                        onChange={(e) => setNewChatSearch(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-lime text-sm"
                                    />
                                    <SearchIcon size={18} className="text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                                </div>
                                <div className="space-y-1">
                                    {availableUsers.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-8">No users found</p>
                                    ) : (
                                        availableUsers.map(u => (
                                            <button
                                                key={u.id}
                                                onClick={() => {
                                                    addConversation(u, false);
                                                    setShowNewChat(false);
                                                    setNewChatSearch('');
                                                    setActiveChatUserId(u.id);
                                                }}
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
        </div>
    );
}
