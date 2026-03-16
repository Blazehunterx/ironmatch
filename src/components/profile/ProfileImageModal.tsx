import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ZoomIn, Check } from 'lucide-react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../lib/cropImage';

interface ProfileImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    editImageUrl: string;
    profileImageUrl: string;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSave: (croppedImage: string) => void;
}

const ProfileImageModal: React.FC<ProfileImageModalProps> = ({
    isOpen, onClose, editImageUrl, fileInputRef, onFileSelect, onSave
}) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!editImageUrl) {
            onClose();
            return;
        }

        try {
            setIsProcessing(true);
            const croppedImage = await getCroppedImg(editImageUrl, croppedAreaPixels);
            onSave(croppedImage);
            setIsProcessing(false);
        } catch (e) {
            console.error(e);
            setIsProcessing(false);
            alert('Failed to crop image');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-gray-900 border border-gray-800 rounded-[2.5rem] w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                            <h3 className="font-black text-xl text-white tracking-tight">Adjust Picture</h3>
                            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                                <motion.div whileTap={{ scale: 0.9 }}><Check size={24} className="text-lime" /></motion.div>
                            </button>
                        </div>

                        <div className="relative flex-1 min-h-[350px] bg-black">
                            {editImageUrl ? (
                                <Cropper
                                    image={editImageUrl}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    cropShape="round"
                                    showGrid={false}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center space-y-4">
                                        <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mx-auto border-2 border-dashed border-gray-700">
                                            <Camera size={32} className="text-gray-600" />
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium">No image selected</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 space-y-8 bg-gray-900/80 backdrop-blur-md">
                            {editImageUrl && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <ZoomIn size={18} className="text-gray-500" />
                                        <input
                                            type="range"
                                            value={zoom}
                                            min={1}
                                            max={3}
                                            step={0.1}
                                            aria-labelledby="Zoom"
                                            onChange={(e) => setZoom(Number(e.target.value))}
                                            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-lime"
                                        />
                                    </div>
                                </div>
                            )}

                            <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileSelect} className="hidden" />
                            
                            <div className="flex flex-col gap-4">
                                <button 
                                    onClick={() => fileInputRef.current?.click()} 
                                    className="w-full py-4 bg-gray-800 border border-gray-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-700 active:scale-[0.98] transition-all"
                                >
                                    <Camera size={20} /> Change Source
                                </button>
                                
                                <button 
                                    onClick={handleSave} 
                                    disabled={!editImageUrl || isProcessing}
                                    className="w-full py-5 bg-lime text-oled rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-lime/20 disabled:opacity-50 disabled:grayscale active:scale-[0.98] transition-all flex items-center justify-center"
                                >
                                    {isProcessing ? <div className="w-5 h-5 border-2 border-oled/30 border-t-oled rounded-full animate-spin" /> : 'Apply & Save Changes'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProfileImageModal;
