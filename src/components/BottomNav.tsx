import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, User, Dumbbell, Swords } from 'lucide-react';
import { useConversations } from '../context/ConversationContext';

export default function BottomNav() {
    const location = useLocation();
    const { getUnreadCount } = useConversations();
    const unreadMessages = getUnreadCount();

    // 5 Focused Core Pillars: Zero Bloat, Large Touch Targets for In-Gym Use
    const navItems = [
        { name: 'Gym', path: '/', icon: Home },
        { name: 'Train', path: '/workouts', icon: Dumbbell },
        { name: 'Arena', path: '/arena', icon: Swords },
        { name: 'Chat', path: '/messages', icon: MessageSquare, badge: unreadMessages },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-oled/95 backdrop-blur-md border-t border-gray-900 pb-safe pb-2 z-50 shadow-[0_-5px_25px_rgba(0,0,0,0.8)]">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-150 relative active:scale-95 ${
                                isActive ? 'text-lime' : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            <div className="relative">
                                <Icon size={21} className={isActive ? 'stroke-[2.5px] drop-shadow-[0_0_8px_rgba(50,255,50,0.4)]' : 'stroke-[1.8px]'} />
                                {(item.badge ?? 0) > 0 && (
                                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-md">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[10px] mt-1 tracking-wider uppercase ${
                                isActive ? 'font-black text-lime' : 'font-semibold text-gray-500'
                            }`}>
                                {item.name}
                            </span>
                            {isActive && (
                                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-lime shadow-[0_0_6px_#32FF32]" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
