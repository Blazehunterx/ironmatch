import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Image, Trophy, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setMediaFile(file);
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        setMediaType(type);
        setMediaPreview(URL.createObjectURL(file));
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
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) throw new Error('Not authenticated');

            let mediaUrl = '';
            if (mediaFile) {
                const fileExt = mediaFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `posts/${userData.user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('media')
                    .upload(filePath, mediaFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('media')
                    .getPublicUrl(filePath);

                mediaUrl = publicUrl;
            }

            const { error: postError } = await supabase
                .from('posts')
                .insert([{
                    author_id: userData.user.id,
                    gym_id: gymId || null,
                    content: content.trim(),
                    media_url: mediaUrl,
                    media_type: mediaType,
                    is_auto_generated: false,
                    spots_count: 0
                }]);

            if (postError) throw postError;

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
        <div className="bg-gray-900/60 border border-gray-800 rounded-[32px] p-6 mb-8">
            <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-800 border border-gray-700 overflow-hidden shrink-0">
                    <img src={user?.profile_image_url || "https://i.pravatar.cc/100"} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 resize-none font-medium text-[15px] leading-relaxed min-h-[80px]"
                    />

                    <AnimatePresence>
                        {mediaPreview && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="relative mt-4 rounded-2xl overflow-hidden border border-gray-800 aspect-video bg-black"
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

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800/50">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-750 text-gray-400 hover:text-white transition group"
                            >
                                <Image size={18} className="group-hover:text-lime transition" />
                                <span className="text-[11px] font-black uppercase tracking-wider">Photo / Video</span>
                            </button>
                            {gymId && (
                                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-750 text-gray-400 hover:text-white transition group">
                                    <Trophy size={18} className="group-hover:text-yellow-500 transition" />
                                    <span className="text-[11px] font-black uppercase tracking-wider">Make Event</span>
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
                            className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-black italic uppercase tracking-tighter transition-all active:scale-95 ${isPosting || (!content.trim() && !mediaFile)
                                ? 'bg-gray-800 text-gray-600'
                                : 'bg-lime text-black hover:shadow-[0_0_20px_rgba(163,230,53,0.3)]'
                                }`}
                        >
                            {isPosting ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <span>POST</span>
                                    <Send size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
