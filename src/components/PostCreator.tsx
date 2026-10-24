import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Image, Trophy, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { safeStorage } from '../lib/safeStorage';
import { compressImage } from '../lib/imageCompression';

interface PostCreatorProps {
    gymId?: string | null;
    onPostCreated?: () => void;
}

export default function PostCreator({ gymId, onPostCreated }: PostCreatorProps) {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const [postType, setPostType] = useState<'feed' | 'story'>('feed');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setMediaFile(file);
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        setMediaType(type);
        if (type === 'image') {
            try {
                const compressed = await compressImage(file, 1080, 0.75);
                setMediaPreview(compressed);
            } catch {
                setMediaPreview(URL.createObjectURL(file));
            }
        } else {
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    const clearMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        setMediaType(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handlePost = async () => {
        if (!content.trim() && !mediaFile) return;
        setIsPosting(true);

        try {
            let authorId = user?.id;
            try {
                const { data: userData } = await supabase.auth.getUser();
                if (userData?.user?.id) authorId = userData.user.id;
            } catch (e) {}

            if (!authorId) throw new Error('Please sign in to share to the Guild Feed.');

            let mediaUrl = '';
            if (mediaFile) {
                try {
                    const fileExt = mediaFile.name.split('.').pop();
                    const fileName = `${Math.random()}.${fileExt}`;
                    const filePath = `posts/${authorId}/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('media')
                        .upload(filePath, mediaFile);

                    if (!uploadError) {
                        const { data: { publicUrl } } = supabase.storage
                            .from('media')
                            .getPublicUrl(filePath);
                        mediaUrl = publicUrl;
                    } else {
                        mediaUrl = mediaPreview || '';
                    }
                } catch (e) {
                    mediaUrl = mediaPreview || '';
                }
            }

            if (postType === 'story') {
                if (!mediaUrl) throw new Error('Stories require a photo or video.');
                
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 24);

                try {
                    await supabase
                        .from('stories')
                        .insert([{
                            author_id: authorId,
                            media_url: mediaUrl,
                            media_type: mediaType || 'image',
                            content: content.trim(),
                            expires_at: expiresAt.toISOString()
                        }]);
                } catch (e) {}
            } else {
                let cloudSuccess = false;
                try {
                    const { error: postError } = await supabase
                        .from('posts')
                        .insert([{
                            author_id: authorId,
                            gym_id: gymId || null,
                            content: content.trim(),
                            media_url: mediaUrl,
                            media_type: mediaType,
                            is_auto_generated: false,
                            spots_count: 0
                        }]);
                    if (!postError) cloudSuccess = true;
                } catch (e) {}

                // Offline-first fallback to local feed cache
                if (!cloudSuccess) {
                    const localPost = {
                        id: `post-${Date.now()}`,
                        author_id: authorId,
                        gym_id: gymId || null,
                        content: content.trim(),
                        media_url: mediaUrl,
                        media_type: mediaType || 'image',
                        created_at: new Date().toISOString(),
                        spots_count: 0,
                        is_auto_generated: false,
                        profiles: {
                            name: user?.name || 'Iron Lifter',
                            profile_image_url: user?.profile_image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'IL')}`,
                            verification_status: 'verified',
                            is_founding_trainer: false,
                            big4: user?.big4
                        }
                    };
                    const cached = safeStorage.getItem('ironmatch_feed_cache');
                    const existing = cached ? JSON.parse(cached) : [];
                    safeStorage.setItem('ironmatch_feed_cache', JSON.stringify([localPost, ...existing]));
                }
            }

            setContent('');
            clearMedia();
            if (onPostCreated) onPostCreated();
        } catch (err: any) {
            console.error('CRITICAL POST ERROR:', err);
            alert(`Failed to post: ${err.message || 'Unknown error'}`);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-4 mb-6 overflow-hidden">
            <div className="flex bg-black/40 p-1 rounded-2xl mb-4 w-fit border border-gray-800">
                <button
                    onClick={() => setPostType('feed')}
                    className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${postType === 'feed' ? 'bg-lime text-oled shadow-lg' : 'text-gray-500'}`}
                >
                    Wall Post
                </button>
                <button
                    onClick={() => setPostType('story')}
                    className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${postType === 'story' ? 'bg-lime text-oled shadow-lg' : 'text-gray-500'}`}
                >
                    Story
                </button>
            </div>
            
            <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 overflow-hidden shrink-0">
                    <img src={user?.profile_image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'IL')}`} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind? Share PRs, sets, or ask for a spot..."
                        className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-white placeholder-gray-500 resize-none font-medium text-sm leading-relaxed min-h-[64px]"
                    />
                </div>
            </div>

            <AnimatePresence>
                {mediaPreview && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative mt-3 rounded-2xl overflow-hidden border border-gray-800 aspect-video bg-black"
                    >
                        {mediaType === 'video' ? (
                            <video src={mediaPreview} className="w-full h-full object-cover" controls />
                        ) : (
                            <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                        )}
                        <button
                            onClick={clearMedia}
                            className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition backdrop-blur-md"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-800/50">
                <div className="flex items-center gap-2 min-w-0">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-750 text-gray-300 hover:text-white transition group shrink-0"
                    >
                        <Image size={15} className="group-hover:text-lime transition" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Photo / Video</span>
                    </button>
                    {gymId && (
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-750 text-gray-300 hover:text-white transition group shrink-0">
                            <Trophy size={15} className="group-hover:text-yellow-500 transition" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Event</span>
                        </button>
                    )}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*,video/*"
                    className="hidden"
                />

                <button
                    onClick={handlePost}
                    disabled={isPosting || (!content.trim() && !mediaFile)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shrink-0 ${isPosting || (!content.trim() && !mediaFile)
                        ? 'bg-gray-800 text-gray-500'
                        : 'bg-lime text-black hover:shadow-[0_0_20px_rgba(163,230,53,0.3)]'
                        }`}
                >
                    {isPosting ? (
                        <Loader2 className="animate-spin" size={15} />
                    ) : (
                        <>
                            <span>Post</span>
                            <Send size={14} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
