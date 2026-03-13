import { AnimatePresence } from 'framer-motion';
import { useSocialFeed } from '../hooks/useSocialFeed';
import { useAuth } from '../context/AuthContext';
import { Share2 } from 'lucide-react';
import { useState, useCallback } from 'react';

import PostCreator from './PostCreator';
import PostDetail from './PostDetail';
import PostCard from './PostCard';

interface SocialFeedProps {
    gymId?: string | null;
    onStoryCreated?: () => void;
}

export default function SocialFeed({ gymId = null, onStoryCreated }: SocialFeedProps) {
    const { user } = useAuth();
    const { posts, loading, error, hasMore, loadMore, toggleSpot, refresh } = useSocialFeed(gymId);
    const [selectedPost, setSelectedPost] = useState<any | null>(null);

    const handlePostCreated = useCallback(() => {
        refresh();
        if (onStoryCreated) onStoryCreated();
    }, [refresh, onStoryCreated]);

    const handleToggleSpot = useCallback((postId: string) => {
        toggleSpot(postId);
    }, [toggleSpot]);

    if (loading && posts.length === 0) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-900/50 rounded-3xl h-64 border border-gray-800" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PostCreator gymId={gymId} onPostCreated={handlePostCreated} />

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <p className="text-red-500 text-xs font-bold">Error: {error}</p>
                    <button onClick={refresh} className="mt-2 text-[10px] text-red-500 underline uppercase font-black">Retry Connection</button>
                </div>
            )}

            {posts.length === 0 && !error ? (
                <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-dashed border-gray-800 p-8">
                    <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
                        <Share2 size={28} className="text-gray-700" />
                    </div>
                    <h4 className="text-white font-bold mb-2">No activity yet</h4>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">Be the first to share a workout photo or a PR attempt!</p>
                </div>
            ) : (
                <>
                    {posts.map((post: any) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onSelect={setSelectedPost}
                            onToggleSpot={handleToggleSpot}
                            currentUserId={user?.id}
                        />
                    ))}
                    
                    {hasMore && (
                        <button
                            onClick={loadMore}
                            disabled={loading}
                            className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-lime transition-colors mt-4 border border-dashed border-gray-800 rounded-2xl"
                        >
                            {loading ? 'Lifting more posts...' : 'View More Activity'}
                        </button>
                    )}
                </>
            )}

            <AnimatePresence>
                {selectedPost && (
                    <PostDetail
                        post={selectedPost}
                        onClose={() => setSelectedPost(null)}
                        onSpot={toggleSpot}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
