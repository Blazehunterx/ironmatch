import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Navigation, Map, ShieldCheck } from 'lucide-react';
import { useGyms } from '../context/GymContext';
import { useToast } from '../context/ToastContext';
import { getCurrentPosition } from '../lib/location';

interface AddGymModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdded: (gymId: string) => void;
}

export default function AddGymModal({ isOpen, onClose, onAdded }: AddGymModalProps) {
    const { addCustomGym } = useGyms();
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [lat, setLat] = useState<string>('');
    const [lng, setLng] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    const handleUseCurrentLocation = async () => {
        setIsLocating(true);
        try {
            const coords = await getCurrentPosition();
            setLat(coords.lat.toFixed(6));
            setLng(coords.lng.toFixed(6));
            showToast('Coordinates captured!', 'success');
        } catch (err) {
            showToast('Could not get location. Please enter manually.', 'error');
        } finally {
            setIsLocating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !address) return;

        setIsSubmitting(true);
        try {
            const gymId = await addCustomGym(
                name,
                address,
                lat ? parseFloat(lat) : undefined,
                lng ? parseFloat(lng) : undefined
            );
            showToast(`"${name}" has been added!`, 'success');
            onAdded(gymId);
            onClose();
            // Reset
            setName('');
            setAddress('');
            setLat('');
            setLng('');
        } catch (err: any) {
            showToast(err.message || 'Failed to add gym', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-6 z-[201] shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-lime/10 rounded-xl">
                                    <MapPin className="text-lime" size={24} />
                                </div>
                                <h2 className="text-xl font-black text-white">Add New Gym</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Gym Name</label>
                                <input
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Golds Gym Venice"
                                    className="w-full bg-oled border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime/50 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Location / Address</label>
                                <input
                                    required
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    placeholder="Street, City, or General Area"
                                    className="w-full bg-oled border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime/50 transition-all"
                                />
                            </div>

                            <div className="bg-oled/50 border border-gray-800/50 rounded-2xl p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={14} className="text-blue-400" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification Coordinates</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleUseCurrentLocation}
                                        disabled={isLocating}
                                        className="flex items-center gap-1.5 text-[10px] font-black text-lime hover:text-white transition-colors disabled:opacity-50"
                                    >
                                        <Navigation size={12} className={isLocating ? 'animate-pulse' : ''} /> {isLocating ? 'LOCATING...' : 'USE MY LOCATION'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <input
                                            value={lat}
                                            onChange={e => setLat(e.target.value)}
                                            placeholder="Latitude"
                                            className="w-full bg-gray-900/50 border border-gray-800 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-gray-600"
                                        />
                                    </div>
                                    <div className="relative">
                                        <input
                                            value={lng}
                                            onChange={e => setLng(e.target.value)}
                                            placeholder="Longitude"
                                            className="w-full bg-gray-900/50 border border-gray-800 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-gray-600"
                                        />
                                    </div>
                                </div>
                                <p className="text-[9px] text-gray-600 italic leading-tight">
                                    Coordinates help us fact-check that this is a real gym. Leave blank if unsure.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !name || !address}
                                className="w-full py-4 bg-lime text-oled font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-white active:scale-95 transition-all shadow-lg shadow-lime/10 disabled:opacity-30"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-oled/30 border-t-oled rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Map size={18} /> ADD GYM & CREATE COMMUNITY
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
