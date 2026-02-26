import { Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageSquare, User, Bell } from 'lucide-react';

export default function BottomNav() {
    const location = useLocation();

    const navItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Explore', path: '/search', icon: Search },
        { name: 'Alerts', path: '/notifications', icon: Bell },
        { name: 'Chat', path: '/messages', icon: MessageSquare },
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
                            className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${isActive ? 'text-lime' : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <Icon size={22} className={isActive ? 'stroke-current' : ''} />
                            <span className="text-[9px] mt-1 font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
