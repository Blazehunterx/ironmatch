import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Award } from 'lucide-react';
import { User } from '../../types/database';

interface VerificationQueueProps {
    pendingUsers: User[];
    isLoading: boolean;
    onVerify: (userId: string, status: 'verified' | 'none', claimData?: { type: 'trainer' | 'gym', gymId?: string }) => void;
    onToggleFounding: (userId: string, currentStatus: boolean) => void;
}

export default function VerificationQueue({
    pendingUsers, isLoading, onVerify, onToggleFounding
}: VerificationQueueProps) {
    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Verification Queue</h2>
                <span className="bg-purple-500/20 text-purple-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-purple-500/20">
                    {pendingUsers.length} REQUESTS
                </span>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                    <div className="w-8 h-8 border-2 border-lime/30 border-t-lime rounded-full animate-spin mb-4" />
                    <p className="text-xs text-gray-500">Loading requests...</p>
                </div>
            ) : pendingUsers.length === 0 ? (
                <div className="text-center py-10 bg-gray-900/30 border border-dashed border-gray-800 rounded-3xl">
                    <p className="text-sm font-bold text-gray-600">Queue Clear!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {pendingUsers.map(u => (
                            <motion.div
                                key={u.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-gray-900 border border-gray-800 rounded-2xl p-4"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <img src={u.profile_image_url} alt={u.name} className="w-10 h-10 rounded-xl object-cover" />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-white truncate text-sm">{u.name}</h3>
                                        <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                                    </div>
                                    <div className="p-2 bg-lime/10 rounded-lg">
                                        {u.trainer_license_url?.startsWith('GYM_CLAIM:') ? <MapPin size={16} className="text-lime" /> : <Award size={16} className="text-lime" />}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => onVerify(u.id, 'none')}
                                        className="py-2.5 rounded-xl bg-red-400/10 text-red-400 text-[10px] font-black"
                                    >REJECT</button>
                                    <button
                                        onClick={() => {
                                            const isGym = u.trainer_license_url?.startsWith('GYM_CLAIM:');
                                            const gymId = isGym ? u.trainer_license_url?.split(':')[1].split(' - ')[0] : undefined;
                                            onVerify(u.id, 'verified', { type: isGym ? 'gym' : 'trainer', gymId });
                                        }}
                                        className="py-2.5 rounded-xl bg-lime text-oled text-[10px] font-black"
                                    >APPROVE</button>
                                </div>

                                {u.verification_status === 'verified' && (
                                    <button
                                        onClick={() => onToggleFounding(u.id, !!u.is_founding_trainer)}
                                        className={`w-full mt-3 py-2 rounded-xl text-[10px] font-black border transition-all ${u.is_founding_trainer
                                            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                                            : 'bg-gray-800 border-gray-700 text-gray-500'
                                            }`}
                                    >
                                        {u.is_founding_trainer ? '★ FOUNDING TRAINER' : 'PROMOTE TO FOUNDING'}
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </section>
    );
}
