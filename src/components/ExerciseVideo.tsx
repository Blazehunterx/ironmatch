import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface ExerciseVideoProps {
    src: string;
    thumbnail?: string;
    className?: string;
    autoPlay?: boolean;
}

export default function ExerciseVideo({ src, thumbnail, className = "", autoPlay = true }: ExerciseVideoProps) {
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gray-900 group ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                    <Loader2 size={24} className="text-lime animate-spin" />
                </div>
            )}

            <video
                ref={videoRef}
                src={src}
                poster={thumbnail}
                className="w-full h-full object-cover"
                loop
                muted={isMuted}
                autoPlay={autoPlay}
                playsInline
                onLoadStart={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
            />

            {/* Controls Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={togglePlay} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition">
                            {isPlaying ? <Pause size={16} /> : <Play size={16} className="fill-current" />}
                        </button>
                        <button onClick={() => setIsMuted(!isMuted)} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition">
                            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating indicator */}
            <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg border border-white/10">
                <p className="text-[8px] font-black text-white/70 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-lime animate-pulse" /> Form Demo
                </p>
            </div>
        </div>
    );
}
