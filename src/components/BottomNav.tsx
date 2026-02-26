import { Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageSquare, User, Dumbbell, Swords } from 'lucide-react';
import { useConversations } from '../context/ConversationContext';

export default function BottomNav() {
    const location = useLocation();
    const { getUnreadCount } = useConversations();
    const unreadMessages = getUnreadCount();

    const navItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Explore', path: '/search', icon: Search },
        { name: 'Workout', path: '/workouts', icon: Dumbbell },
        { name: 'Arena', path: '/arena', icon: Swords },
        { name: 'Chat', path: '/messages', icon: MessageSquare, badge: unreadMessages },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-oled border-t border-gray-900 pb-safe pb-2 z-50">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 relative ${isActive ? 'text-lime' : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <div className="relative">
                                <Icon size={20} className={isActive ? 'stroke-current' : ''} />
                                {item.badge && item.badge > 0 && (
                                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className="text-[8px] mt-0.5 font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
