import { useFollow } from '../../hooks/useFollow';

export default function FollowStats({ userId }: { userId: string }) {
    const { followerCount, followingCount } = useFollow(userId);
    return (
        <div className="flex gap-4">
            <div className="flex items-center gap-1">
                <span className="text-sm font-black text-white">{followerCount}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Followers</span>
            </div>
            <div className="flex items-center gap-1">
                <span className="text-sm font-black text-white">{followingCount}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Following</span>
            </div>
        </div>
    );
}
