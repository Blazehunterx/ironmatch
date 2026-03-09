import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { Story } from '../types/database';

interface StoryViewerProps {
    stories: Story[];
    initialIndex?: number;
    onClose: () => void;
}

export default function StoryViewer({ stories, initialIndex = 0, onClose }: StoryViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    const STORY_DURATION = 5000; // 5 seconds per story
    const progressTimer = useRef<any>(null);

    const currentStory = stories[currentIndex];

    useEffect(() => {
        if (isPaused) {
            clearInterval(progressTimer.current);
            return;
        }

        const step = 100 / (STORY_DURATION / 100);
        progressTimer.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + step;
            });
        }, 100);

        return () => clearInterval(progressTimer.current);
    }, [currentIndex, isPaused]);

    const handleNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setProgress(0);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setProgress(0);
        } else {
            setProgress(0);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
        >
            {/* Background Blur */}
            <div className="absolute inset-0 overflow-hidden">
                <img
                    src={currentStory.media_url}
                    className="w-full h-full object-cover blur-3xl opacity-30"
                    alt=""
                />
            </div>

            <div className="relative w-full max-w-lg aspect-[9/16] bg-gray-900 shadow-2xl overflow-hidden sm:rounded-3xl">
                {/* Progress Bars */}
                <div className="absolute top-4 inset-x-4 z-30 flex gap-1">
                    {stories.map((_, i) => (
                        <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-100 ease-linear"
                                style={{
                                    width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-8 inset-x-4 z-30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-white/20 p-0.5">
                            <img
                                src={currentStory.profiles?.profile_image_url || '/influencers/placeholder.png'}
                                className="w-full h-full rounded-full object-cover"
                                alt=""
                            />
                        </div>
                        <div>
                            <h3 className="text-white text-sm font-black italic uppercase tracking-tight">
                                {currentStory.profiles?.name}
                            </h3>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                                {currentStory.content || 'Life Lately'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white/70 hover:text-white"
                        >
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white/70 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Media Content */}
                <div
                    className="w-full h-full relative"
                    onMouseDown={() => setIsPaused(true)}
                    onMouseUp={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                >
                    {currentStory.media_type === 'video' ? (
                        <video
                            src={currentStory.media_url}
                            autoPlay
                            muted={isMuted}
                            loop
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src={currentStory.media_url}
                            className="w-full h-full object-cover"
                            alt=""
                        />
                    )}

                    {/* Navigation Tap Zones */}
                    <div className="absolute inset-0 flex">
                        <div className="flex-1 cursor-pointer" onClick={handlePrev} />
                        <div className="flex-1 cursor-pointer" onClick={handleNext} />
                    </div>
                </div>

                {/* Footer / Interaction */}
                <div className="absolute bottom-6 inset-x-6 z-30">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Send a message..."
                            className="flex-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full py-3 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            </div>

            {/* Desktop Navigation Buttons */}
            <button
                onClick={handlePrev}
                className="hidden sm:flex absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full text-white transition-all transform hover:scale-110"
            >
                <ChevronLeft size={32} />
            </button>
            <button
                onClick={handleNext}
                className="hidden sm:flex absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full text-white transition-all transform hover:scale-110"
            >
                <ChevronRight size={32} />
            </button>
        </motion.div>
    );
}
