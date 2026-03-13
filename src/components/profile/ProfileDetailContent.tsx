import { MessageSquare, Target, CalendarDays, Trophy, GraduationCap } from 'lucide-react';
import { User } from '../../types/database';

interface ProfileDetailContentProps {
    user: User;
}

const goalEmoji: Record<string, string> = {
    'Workout Buddy': '🤝', 'Socialize': '💬', 'Get Pushed': '🔥', 'Learn': '📚',
    'Train for Competition': '🏋️', 'Lose Weight': '💪', 'Recovery Partner': '🧘', 'Cardio Partner': '🏃',
};

export default function ProfileDetailContent({ user }: ProfileDetailContentProps) {
    return (
        <div className="px-5 pb-32 space-y-6">
            {/* Bio */}
            {user.bio && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <MessageSquare size={12} /> About
                    </h4>
                    <p className="text-sm text-gray-300 leading-relaxed">{user.bio}</p>
                </div>
            )}

            {/* Goals */}
            {user.goals && user.goals.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                        <Target size={12} /> Goals
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {user.goals.map(g => (
                            <span key={g} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-lime/10 text-lime border border-lime/20">
                                {goalEmoji[g]} {g}
                            </span>
                        ))}
                    </div>
                    {user.sub_goals && user.sub_goals.length > 0 && (
                        <p className="text-xs text-gray-500 mt-3">
                            Focus areas: <span className="text-gray-400">{user.sub_goals.join(' · ')}</span>
                        </p>
                    )}
                </div>
            )}

            {/* Availability */}
            {user.availability && user.availability.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                        <CalendarDays size={12} /> Training Schedule
                    </h4>
                    <div className="space-y-3">
                        {user.availability.map(slot => (
                            <div key={slot.day} className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{slot.day}</span>
                                <div className="flex gap-1.5 flex-wrap">
                                    {slot.blocks.map(block => (
                                        <span
                                            key={block}
                                            className="text-[9px] font-bold px-3 py-1 rounded bg-lime/10 text-lime border border-lime/20"
                                        >
                                            {block}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Strength Stats */}
            {user.big4 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                        <Trophy size={12} className="text-yellow-500" /> Strength Milestone
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-oled rounded-lg border border-gray-800">
                            <span className="text-[8px] text-gray-600 block uppercase">Bench</span>
                            <span className="text-sm font-black text-white">{user.big4.bench || 0} <span className="text-[8px] text-gray-600">lbs</span></span>
                        </div>
                        <div className="p-2 bg-oled rounded-lg border border-gray-800">
                            <span className="text-[8px] text-gray-600 block uppercase">Squat</span>
                            <span className="text-sm font-black text-white">{user.big4.squat || 0} <span className="text-[8px] text-gray-600">lbs</span></span>
                        </div>
                        <div className="p-2 bg-oled rounded-lg border border-gray-800">
                            <span className="text-[8px] text-gray-600 block uppercase">Deadlift</span>
                            <span className="text-sm font-black text-white">{user.big4.deadlift || 0} <span className="text-[8px] text-gray-600">lbs</span></span>
                        </div>
                        <div className="p-2 bg-oled rounded-lg border border-gray-800">
                            <span className="text-[8px] text-gray-600 block uppercase">OHP</span>
                            <span className="text-sm font-black text-white">{user.big4.ohp || 0} <span className="text-[8px] text-gray-600">lbs</span></span>
                        </div>
                    </div>
                </div>
            )}

            {/* Extra Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <GraduationCap size={12} /> Discipline
                </h4>
                <p className="text-sm text-gray-300">{user.discipline || 'General Fitness'}</p>
            </div>
        </div>
    );
}
