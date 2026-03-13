import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera } from 'lucide-react';

interface ProfileImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    editImageUrl: string;
    profileImageUrl: string;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSave: () => void;
}

const ProfileImageModal: React.FC<ProfileImageModalProps> = ({
    isOpen, onClose, editImageUrl, profileImageUrl, fileInputRef, onFileSelect, onSave
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-sm p-6"
                    >
                        <h3 className="font-bold text-lg text-white mb-4 text-center">Update Picture</h3>
                        <div className="flex justify-center mb-6">
                            <img src={editImageUrl || profileImageUrl} className="w-24 h-24 rounded-full border-2 border-lime/50 object-cover shadow-2xl" alt="Preview" />
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileSelect} className="hidden" />
                        <div className="space-y-3">
                            <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-gray-800 border border-gray-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-700 transition-all">
                                <Camera size={18} /> Take/Choose Photo
                            </button>
                            <div className="flex gap-3">
                                <button onClick={onClose} className="flex-1 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 font-bold transition-all">Cancel</button>
                                <button onClick={onSave} className="flex-1 py-2 rounded-xl bg-lime text-oled font-bold transition-all">Save</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProfileImageModal;
