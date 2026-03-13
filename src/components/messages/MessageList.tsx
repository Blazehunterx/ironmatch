import { motion } from 'framer-motion';
import { MessageSquare, ChevronRight } from 'lucide-react';

interface MessageListProps {
    filtered: any[];
    onChatSelect: (userId: string) => void;
}

export default function MessageList({ filtered, onChatSelect }: MessageListProps) {
    if (filtered.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-gray-500 py-20 gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
                    <MessageSquare size={24} className="text-gray-600" />
                </div>
                <p className="text-center font-medium">No messages yet.</p>
                <p className="text-sm">Request a workout to start a conversation!</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {filtered.map((chat, idx) => (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    key={chat.user.id}
                    onClick={() => onChatSelect(chat.user.id)}
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
            ))}
        </div>
    );
}
