import React from 'react';
import { Users } from 'lucide-react';
import { useFriends } from '../../context/FriendsContext';

const ProfileFriends: React.FC = () => {
    const { friends, pendingReceived, acceptFriend } = useFriends();

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h4 className="font-semibold text-white flex items-center gap-2 mb-3">
                <Users size={16} className="text-lime" /> Friends
                <span className="text-xs text-gray-500 font-normal ml-1">{friends.length}</span>
                {pendingReceived.length > 0 && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold border border-red-500/20 ml-auto animate-pulse">
                        {pendingReceived.length} NEW
                    </span>
                )}
            </h4>

            {pendingReceived.length > 0 && (
                <div className="space-y-2 mb-3">
                    {pendingReceived.map(u => (
                        <div key={u.id} className="flex items-center gap-3 p-3 rounded-2xl bg-lime/10 border border-lime/20 shadow-lg shadow-lime/5">
                            <img src={u.profile_image_url} alt={u.name} className="w-10 h-10 rounded-full border-2 border-lime/30 object-cover" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{u.name}</p>
                                <p className="text-[10px] text-lime/70 font-medium">pending request</p>
                            </div>
                            <button
                                onClick={() => acceptFriend(u.id)}
                                className="text-[10px] font-black bg-lime text-oled px-4 py-2 rounded-xl active:scale-95 transition-all shadow-md shadow-lime/20"
                            >
                                ACCEPT
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {friends.length === 0 ? (
                <div className="text-center py-4 bg-gray-800/10 rounded-xl border border-dashed border-gray-800">
                    <p className="text-[10px] text-gray-500 font-medium">No connections yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {friends.map(f => (
                        <div key={f.id} className="flex items-center gap-2 bg-gray-800/40 rounded-2xl p-2 border border-gray-800/60 shadow-sm">
                            <img src={f.profile_image_url} alt={f.name} className="w-8 h-8 rounded-full border border-gray-700 object-cover" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-white truncate">{f.name.split(' ')[0]}</p>
                                <p className="text-[9px] text-gray-500 truncate font-medium">{f.fitness_level}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProfileFriends;
