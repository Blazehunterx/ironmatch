import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw } from 'lucide-react';
import { Big4Lifts } from '../../lib/gamification';

interface ProfileSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    isTrainer: boolean;
    onSaveTrainer: (val: boolean) => void;
    unitPref: 'lbs' | 'kg';
    onSetUnitPref: (u: 'lbs' | 'kg') => void;
    editBig4: Big4Lifts;
    onSetBig4: (lifts: Big4Lifts) => void;
    onSaveBig4: () => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
    isOpen, onClose, isTrainer, onSaveTrainer, unitPref, onSetUnitPref, editBig4, onSetBig4, onSaveBig4
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-sm overflow-hidden"
                    >
                        <div className="flex justify-between items-center p-5 border-b border-gray-800">
                            <h3 className="font-bold text-lg text-white">Settings</h3>
                            <button onClick={onClose} className="text-gray-400"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="font-semibold text-white">Trainer Mode</h4>
                                    <p className="text-[10px] text-gray-500 mt-1">Unlock pro features and badges.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={isTrainer} onChange={(e) => onSaveTrainer(e.target.checked)} />
                                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-lime after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                                </label>
                            </div>
                            <div className="pt-4 border-t border-gray-800">
                                <h4 className="font-semibold text-white mb-2">Units</h4>
                                <div className="flex gap-2">
                                    {(['lbs', 'kg'] as const).map(u => (
                                        <button key={u} onClick={() => onSetUnitPref(u)}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold ${unitPref === u ? 'bg-lime text-oled shadow-lg' : 'bg-gray-800 text-gray-500'}`}>{u.toUpperCase()}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-800">
                                <h4 className="font-semibold text-white mb-3">Your Stats (1RM)</h4>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {(['bench', 'squat', 'deadlift', 'ohp'] as const).map((lift) => (
                                        <div key={lift} className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{lift}</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={editBig4[lift] || ''}
                                                    onChange={(e) => onSetBig4({ ...editBig4, [lift]: parseInt(e.target.value) || 0 })}
                                                    className="w-full bg-oled border border-gray-800 rounded-xl px-3 py-2 text-sm text-lime font-bold focus:outline-none focus:border-lime/50"
                                                    placeholder="0"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 font-bold uppercase">{unitPref}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={onSaveBig4}
                                    className="w-full py-3 bg-lime text-oled rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-lime/20 active:scale-95 transition-all"
                                >
                                    Save Big 4 Progress
                                </button>
                            </div>
                            <div className="pt-4 border-t border-gray-800">
                                <h4 className="font-semibold text-white mb-2">Sync & Cache</h4>
                                <button
                                    onClick={() => {
                                        if (confirm('Force refresh app cache?')) {
                                            localStorage.clear();
                                            window.location.reload();
                                        }
                                    }}
                                    className="w-full py-3 bg-gray-800 border border-gray-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={14} /> Clear Cache & Refresh
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProfileSettingsModal;
