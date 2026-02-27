import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
    return (
        <div className="flex flex-col min-h-screen bg-oled text-white pb-20">
            <header className="sticky top-0 z-50 p-4 bg-oled/90 backdrop-blur-md border-b border-gray-900 flex flex-col justify-center items-center">
                <div className="flex items-center gap-2">
                    <h1 className="text-lime text-xl font-bold tracking-tight">
                        IRON<span className="text-white">MATCH</span>
                    </h1>
                </div>
                <div className="mt-1 flex items-center gap-2">
                    <span className="text-[8px] px-1.5 py-0.5 bg-red-500 rounded text-white font-black animate-pulse">SYNC VERIFY: v2.0.4</span>
                    <span className="text-[8px] text-gray-600 font-mono">DEBUG MODE ACTIVE</span>
                </div>
            </header>

            <main className="flex-1 w-full max-w-md mx-auto">
                <Outlet />
            </main>

            <BottomNav />
        </div>
    );
}
