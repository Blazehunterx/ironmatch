import { UserPlus, UserCheck } from 'lucide-react';
import { useFriends } from '../../context/FriendsContext';
import { useToast } from '../../context/ToastContext';

export default function FriendButton({ userId }: { userId: string }) {
    const { getFriendStatus, sendFriendRequest, removeFriend } = useFriends();
    const { showToast } = useToast();
    const status = getFriendStatus(userId);

    if (status === 'friends') {
        return (
            <button
                onClick={() => { removeFriend(userId); showToast('Friend removed', 'info'); }}
                className="py-4 px-5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
                <UserCheck size={18} /> Friends
            </button>
        );
    }
    return (
        <button
            onClick={() => { sendFriendRequest(userId); showToast('Friend request sent!'); }}
            className="flex-1 py-4 rounded-2xl bg-blue-500 text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-600 active:scale-[0.98] transition-all shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]"
        >
            <UserPlus size={18} /> Add Friend
        </button>
    );
}
