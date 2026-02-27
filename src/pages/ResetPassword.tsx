import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Lock, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { updatePassword } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Supabase puts the reset token in the URL hash: #access_token=...
        const hasToken = window.location.hash.includes('access_token=');
        if (!hasToken && !success) {
            setError('No reset token found. Please make sure you clicked the link in your email.');
        }
    }, [success]);

    const passChecks = {
        length: password.length >= 6,
        number: /\d/.test(password),
    };
    const passValid = passChecks.length && passChecks.number;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passValid) {
            setError('Password must be at least 6 characters with a number');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setError('');
            setLoading(true);
            await updatePassword(password);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-oled">
            <div className="w-full max-w-sm space-y-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="p-3 mb-4 rounded-full bg-lime/10">
                        <Dumbbell className="w-12 h-12 text-lime" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Reset Password</h2>
                    <p className="mt-2 text-sm text-gray-400">Enter your new secure password below.</p>
                </div>

                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-lime/10 border border-lime/20 rounded-xl text-center space-y-2"
                        >
                            <div className="flex justify-center">
                                <Check size={32} className="text-lime" />
                            </div>
                            <p className="text-lime font-bold">Password Reset Successful!</p>
                            <p className="text-xs text-gray-400">Redirecting to login...</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="password" senior-className="block text-sm font-medium text-gray-300">
                                        New Password
                                    </label>
                                    <div className="relative mt-1">
                                        <input
                                            id="password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 pl-11 text-white bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime transition-all placeholder:text-gray-600"
                                            placeholder="••••••••"
                                        />
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    </div>
                                    <div className="flex gap-3 mt-1.5 px-1">
                                        <span className={`text-[10px] flex items-center gap-1 ${passChecks.length ? 'text-lime' : 'text-gray-500'}`}>
                                            {passChecks.length ? <Check size={10} /> : <AlertCircle size={10} />} 6+ chars
                                        </span>
                                        <span className={`text-[10px] flex items-center gap-1 ${passChecks.number ? 'text-lime' : 'text-gray-500'}`}>
                                            {passChecks.number ? <Check size={10} /> : <AlertCircle size={10} />} Has number
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" senior-className="block text-sm font-medium text-gray-300">
                                        Confirm New Password
                                    </label>
                                    <div className="relative mt-1">
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3 pl-11 text-white bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime transition-all placeholder:text-gray-600"
                                            placeholder="••••••••"
                                        />
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-oled transition-colors bg-lime rounded-lg hover:bg-lime/90 disabled:opacity-50"
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
