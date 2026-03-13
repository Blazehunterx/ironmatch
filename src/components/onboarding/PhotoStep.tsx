import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Check } from 'lucide-react';

interface PhotoStepProps {
    profileImage: string;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PhotoStep: React.FC<PhotoStepProps> = ({ profileImage, fileInputRef, onFileSelect }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
                <h2 className="text-3xl font-black text-white text-center mb-2">Let's set up<br />your profile</h2>
                <p className="text-sm text-gray-500 text-center mb-8">Add a photo so others can recognize you at the gym</p>
            </motion.div>

            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                className="relative group cursor-pointer mb-8"
                onClick={() => fileInputRef.current?.click()}
            >
                <div className={`w-32 h-32 rounded-full border-4 ${profileImage ? 'border-lime/50' : 'border-gray-700 border-dashed'} flex items-center justify-center overflow-hidden transition-all group-hover:border-lime/80`}>
                    {profileImage ? (
                        <img src={profileImage} className="w-full h-full object-cover" alt="Profile preview" />
                    ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-500">
                            <Camera size={28} />
                            <span className="text-[10px] font-bold">Add Photo</span>
                        </div>
                    )}
                </div>
                {profileImage && (
                    <div className="absolute bottom-0 right-0 bg-lime p-2 rounded-full border-4 border-oled">
                        <Check size={14} className="text-oled" />
                    </div>
                )}
            </motion.div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileSelect} className="hidden" />
        </div>
    );
};

export default PhotoStep;
