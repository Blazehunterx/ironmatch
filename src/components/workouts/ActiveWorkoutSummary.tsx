import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Trophy, Check, Camera, Flame, Zap,
    Dumbbell, Clock, ShieldCheck, ArrowRight, Loader2, MessageCircle
} from 'lucide-react';
import { WorkoutExercise } from '../../types/database';
import { useAuth } from '../../context/AuthContext';
import { getRankFromLifts } from '../../lib/gamification';
import { compressImage } from '../../lib/imageCompression';
import { uploadToStorage } from '../../lib/storageUpload';

interface ActiveWorkoutSummaryProps {
    planName: string;
    exercises: WorkoutExercise[];
    elapsed: number;
    prs?: { exercise: string; newWeight: number }[];
    onDone: () => void;
    onPostToFeed?: (postData: { content: string; mediaUrl?: string; totalVolume: number }) => Promise<void>;
}

export default function ActiveWorkoutSummary({
    planName, exercises, elapsed, prs = [], onDone, onPostToFeed
}: ActiveWorkoutSummaryProps) {
    const { user } = useAuth();
    const [isPosting, setIsPosting] = useState(false);
    const [posted, setPosted] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const completedExercises = exercises.filter(e => e.completed);
    const totalVolume = exercises.reduce((acc, ex) =>
        acc + (ex.completed ? (ex.sets * ex.reps * (ex.weight || 0)) : 0), 0
    );
    const unit = user?.unit_preference || 'kg';
    const rank = getRankFromLifts(user?.big4 || { bench: 0, squat: 0, deadlift: 0, ohp: 0 }, unit);

    const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const compressed = await compressImage(file, 1080, 0.75);
            setPhotoPreview(compressed);
        } catch {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPhotoPreview(ev.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleShareToFeed = async () => {
        if (!onPostToFeed || posted) return;
        setIsPosting(true);
        try {
            let finalMediaUrl: string | undefined = photoPreview || undefined;
            if (photoPreview && photoPreview.startsWith('data:')) {
                finalMediaUrl = await uploadToStorage(photoPreview, 'workout-proofs', user?.id || 'proofs');
            }

            const prText = prs.length > 0 ? ` 🏆 Hit PR on ${prs.map(p => `${p.exercise} (${p.newWeight}${unit})`).join(', ')}!` : '';
            const caption = `🔥 Crushed ${planName}! Volume: ${totalVolume.toLocaleString()} ${unit} in ${Math.round(elapsed / 60)}m across ${completedExercises.length} lifts.${prText} #IronMatch`;
            
            await onPostToFeed({
                content: caption,
                mediaUrl: finalMediaUrl,
                totalVolume
            });
            setPosted(true);
        } catch (err) {
            console.error('Failed to post proof:', err);
        } finally {
            setIsPosting(false);
        }
    };

    const handleWhatsAppShare = () => {
        const prText = prs.length > 0 ? ` 🏆 New PR: ${prs.map(p => `${p.exercise} ${p.newWeight}${unit}`).join(', ')}!` : '';
        const text = `🔥 Just logged ${totalVolume.toLocaleString()} ${unit} volume on IronMatch (${planName}) in ${Math.round(elapsed / 60)} minutes!${prText} Can you match my volume? Check it on IronMatch!`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-oled px-4 py-8 flex flex-col items-center justify-start overflow-y-auto pb-24">
            {/* Header Celebration */}
            <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 14 }}
                className="w-16 h-16 bg-lime/10 border-2 border-lime rounded-2xl flex items-center justify-center text-lime shadow-[0_0_25px_rgba(50,255,50,0.3)] mb-4"
            >
                <Trophy size={32} />
            </motion.div>

            <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-black text-white italic uppercase tracking-tight text-center"
            >
                Workout Destroyed!
            </motion.h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 mb-6 text-center">
                Session verified & logged to guild history
            </p>

            {/* THE BRIGHT WORKOUT PROOF CARD */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="w-full max-w-sm bg-gray-900/90 border border-gray-800 rounded-[28px] overflow-hidden shadow-2xl relative"
            >
                {/* Proof Card Top Bar */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-black/40">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl border border-gray-700 overflow-hidden bg-gray-800">
                            <img
                                src={user?.profile_image_url || 'https://i.pravatar.cc/100'}
                                alt="User"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-white">{user?.name || 'Iron Lifter'}</span>
                                <span className="text-[10px]">{rank.icon}</span>
                            </div>
                            <span className="text-[9px] text-lime font-bold uppercase tracking-wider block">
                                {rank.name} Tier
                            </span>
                        </div>
                    </div>
                    <span className="text-[9px] bg-lime/10 text-lime px-2 py-0.5 rounded-full font-black uppercase tracking-wider border border-lime/30 flex items-center gap-1">
                        <ShieldCheck size={10} /> Verified
                    </span>
                </div>

                {/* Photo / Hero Graphic Section */}
                <div className="relative aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
                    {photoPreview ? (
                        <img src={photoPreview} alt="Workout Proof" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-gray-900 via-black to-gray-950 relative">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,255,50,0.12)_0%,transparent_70%)]" />
                            <Dumbbell size={54} className="text-lime/40 mb-3 animate-pulse" />
                            <h4 className="text-white font-black text-lg italic uppercase tracking-wider z-10">
                                {planName}
                            </h4>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 z-10">
                                {user?.home_gym_name || 'Bali Guild Hub'}
                            </p>
                        </div>
                    )}

                    {/* Overlay Volume Badge */}
                    <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-md rounded-2xl p-3 border border-gray-800 flex items-center justify-between">
                        <div>
                            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest block">Total Volume</span>
                            <span className="text-xl font-black text-lime italic">
                                {totalVolume.toLocaleString()}<span className="text-[10px] text-white ml-1">{unit}</span>
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest block">Duration</span>
                            <span className="text-sm font-mono font-bold text-white flex items-center gap-1 justify-end">
                                <Clock size={12} className="text-lime" /> {Math.round(elapsed / 60)}m
                            </span>
                        </div>
                    </div>

                    {/* Camera Button to Attach Photo */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black/90 text-white rounded-xl border border-gray-700 backdrop-blur-md transition-all active:scale-95 flex items-center gap-1 text-[10px] font-bold"
                    >
                        <Camera size={14} className="text-lime" />
                        <span>{photoPreview ? 'Change Photo' : 'Add Photo'}</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                    />
                </div>

                {/* PR Highlights */}
                {prs.length > 0 && (
                    <div className="p-3 bg-yellow-500/10 border-t border-b border-yellow-500/20 flex items-center gap-2">
                        <Flame size={16} className="text-yellow-400 shrink-0" />
                        <div className="text-[11px] text-yellow-300 font-bold truncate">
                            New PR: {prs.map(p => `${p.exercise} ${p.newWeight}${unit}`).join(', ')}
                        </div>
                    </div>
                )}

                {/* Summary Lifts Checklist */}
                <div className="p-4 space-y-2 bg-gray-950/60 max-h-40 overflow-y-auto">
                    <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider block">
                        Completed Exercises ({completedExercises.length}/{exercises.length})
                    </span>
                    {exercises.map((ex, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-0.5">
                            <span className={`font-medium truncate ${ex.completed ? 'text-gray-300' : 'text-gray-600'}`}>
                                {ex.name}
                            </span>
                            <span className="text-[10px] font-mono text-gray-500 shrink-0 ml-2">
                                {ex.completed ? `${ex.sets} × ${ex.reps} @ ${ex.weight || 0}${unit}` : 'Skipped'}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="w-full max-w-sm space-y-3 mt-6">
                {/* Post to Global Feed Button */}
                {posted ? (
                    <div className="w-full py-3.5 rounded-2xl bg-lime/10 border border-lime/40 text-lime font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                        <Check size={16} /> Shared to Global Feed!
                    </div>
                ) : (
                    <button
                        onClick={handleShareToFeed}
                        disabled={isPosting}
                        className="w-full py-3.5 rounded-2xl bg-lime text-oled font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(50,255,50,0.3)] hover:bg-lime/90 active:scale-98 transition-all"
                    >
                        {isPosting ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <>
                                <Zap size={16} /> Post Proof to Global Feed
                            </>
                        )}
                    </button>
                )}

                {/* WhatsApp Share Button */}
                <button
                    onClick={handleWhatsAppShare}
                    className="w-full py-3.5 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                    <MessageCircle size={16} /> Share Proof on WhatsApp
                </button>

                {/* Done Button */}
                <button
                    onClick={onDone}
                    className="w-full py-3 rounded-2xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
                >
                    Done & Return to Guild <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}
