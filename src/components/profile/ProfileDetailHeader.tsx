import { MapPin, CheckCircle2, Zap, X, GraduationCap } from 'lucide-react';
import { User, Gym } from '../../types/database';
import FollowStats from './FollowStats';

interface ProfileDetailHeaderProps {
    user: User;
    gym: Gym | undefined;
    onClose: () => void;
}

export default function ProfileDetailHeader({ user, gym, onClose }: ProfileDetailHeaderProps) {
    return (
        <div className="relative h-64 shrink-0">
            <img
                src={user.profile_image_url}
                alt={user.name}
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-oled via-oled/40 to-transparent" />

            {/* Close */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors z-10"
            >
                <X size={20} />
            </button>

            {/* Trainer Badge */}
            {user.is_trainer && (
                <div className="absolute top-4 left-4 bg-lime text-oled text-xs font-black px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-lg">
                    <GraduationCap size={14} /> PERSONAL TRAINER
                </div>
            )}

            {/* Name at bottom of image */}
            <div className="absolute bottom-4 left-5 right-5">
                <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-3xl font-black text-white leading-none">{user.name}</h2>
                    <div className="flex gap-2 items-center">
                        {user.verification_status === 'verified' && (
                            <CheckCircle2 size={20} className="text-lime fill-lime/10" />
                        )}
                        {user.is_founding_trainer && (
                            <div className="px-2 py-0.5 bg-gradient-to-r from-amber-500 via-yellow-200 to-amber-500 rounded-full border border-white/20 shadow-lg flex items-center gap-1 animate-pulse">
                                <Zap size={10} className="text-oled fill-oled" />
                                <span className="text-[8px] font-black text-oled uppercase tracking-widest">Founding</span>
                            </div>
                        )}
                    </div>
                </div>
                {gym && (
                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-2">
                        <MapPin size={12} className="text-lime" /> {gym.name}
                    </p>
                )}
                <div className="flex items-center gap-4 mt-4">
                    <FollowStats userId={user.id} />
                </div>
            </div>
        </div>
    );
}
