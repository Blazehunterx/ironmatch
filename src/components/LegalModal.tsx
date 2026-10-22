import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield } from 'lucide-react';

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'privacy' | 'terms';
}

export default function LegalModal({ isOpen, onClose, initialTab = 'privacy' }: LegalModalProps) {
    const [tab, setTab] = useState<'privacy' | 'terms'>(initialTab);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-lg bg-gray-950 border border-gray-800 rounded-[32px] overflow-hidden flex flex-col max-h-[85vh] shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gray-900/50">
                        <div className="flex items-center gap-2">
                            <Shield size={18} className="text-lime" />
                            <h3 className="text-sm font-black uppercase text-white tracking-wider">
                                Legal & Privacy Doctrine
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-full bg-white/5 text-gray-400 hover:text-white transition"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex p-2 bg-black/40 border-b border-gray-800/80 gap-2">
                        <button
                            onClick={() => setTab('privacy')}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                                tab === 'privacy'
                                    ? 'bg-lime text-black shadow-sm'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Privacy Policy
                        </button>
                        <button
                            onClick={() => setTab('terms')}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                                tab === 'terms'
                                    ? 'bg-lime text-black shadow-sm'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Terms of Service
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-6 overflow-y-auto space-y-4 text-xs text-gray-300 leading-relaxed no-scrollbar">
                        {tab === 'privacy' ? (
                            <>
                                <div className="space-y-1">
                                    <h4 className="text-white font-bold text-sm">IronMatch Privacy Policy</h4>
                                    <p className="text-[10px] text-gray-500 uppercase font-mono">Last Updated: October 2026</p>
                                </div>

                                <section className="space-y-1.5">
                                    <h5 className="text-lime font-bold uppercase text-[11px] tracking-wider">1. Information We Collect</h5>
                                    <p>We collect only the minimum data required to power your training:</p>
                                    <ul className="list-disc pl-4 space-y-1 text-gray-400">
                                        <li><strong>Account Data:</strong> Email address, display name, and fitness level.</li>
                                        <li><strong>Workout Telemetry:</strong> Logged sets, reps, load, RPE ratings, and personal records.</li>
                                        <li><strong>Gym Geolocation (Optional):</strong> Real-time gym presence to calculate gym radar distances and leaderboard placement.</li>
                                    </ul>
                                </section>

                                <section className="space-y-1.5">
                                    <h5 className="text-lime font-bold uppercase text-[11px] tracking-wider">2. Offline-First Storage</h5>
                                    <p>
                                        Your logs are stored locally on your device first via encrypted local storage. When cellular or Wi-Fi connectivity is detected, logs synchronize with our dedicated PostgreSQL backend.
                                    </p>
                                </section>

                                <section className="space-y-1.5">
                                    <h5 className="text-lime font-bold uppercase text-[11px] tracking-wider">3. Third-Party Processors</h5>
                                    <p>
                                        We do not sell personal data. All native store in-app purchases are processed directly by <strong>Google Play Billing (Google LLC)</strong> and <strong>Apple StoreKit (Apple Inc.)</strong> via RevenueCat Inc.
                                    </p>
                                </section>

                                <section className="space-y-1.5">
                                    <h5 className="text-lime font-bold uppercase text-[11px] tracking-wider">4. Right to Complete Erasure (Account Deletion)</h5>
                                    <p>
                                        Under GDPR and Google Play User Data policies, you hold the right to immediately and permanently delete your account, workout history, and personal records directly from the Settings menu via the <strong>Delete Account</strong> option.
                                    </p>
                                </section>
                            </>
                        ) : (
                            <>
                                <div className="space-y-1">
                                    <h4 className="text-white font-bold text-sm">IronMatch Terms of Service</h4>
                                    <p className="text-[10px] text-gray-500 uppercase font-mono">Last Updated: October 2026</p>
                                </div>

                                <section className="space-y-1.5">
                                    <h5 className="text-lime font-bold uppercase text-[11px] tracking-wider">1. Physical Health & Medical Disclaimer</h5>
                                    <p className="text-red-400/90 font-medium">
                                        Resistance training involves physical exertion and risk of injury. IronMatch, including its 8-Week Tendon Masterplan and Combat Physio guidance, provides educational athletic information only and does NOT constitute medical diagnosis or physical therapy treatment.
                                    </p>
                                    <p>Always consult a licensed medical physician before initiating heavy resistance training or rehabilitating acute pain.</p>
                                </section>

                                <section className="space-y-1.5">
                                    <h5 className="text-lime font-bold uppercase text-[11px] tracking-wider">2. In-App Subscriptions & Store Purchases</h5>
                                    <p>
                                        IronPass Pro subscriptions and Founding Lifter lifetime passes are billed through your Google Play or Apple ID account. You may cancel recurring subscriptions at any time via your device's Google Play or App Store Subscriptions manager.
                                    </p>
                                </section>

                                <section className="space-y-1.5">
                                    <h5 className="text-lime font-bold uppercase text-[11px] tracking-wider">3. Community Standards & Fair Play</h5>
                                    <p>
                                        We maintain zero tolerance for harassment, fake lift verification, or automated bots. Accounts engaging in abusive behavior will be permanently banned.
                                    </p>
                                </section>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl bg-lime text-black font-black text-xs uppercase tracking-wider hover:bg-lime/90 active:scale-95 transition"
                        >
                            I Understand
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
