import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { resetPasswordEmail } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await resetPasswordEmail(email);
            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-oled">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-sm text-center space-y-6"
                >
                    <div className="flex justify-center">
                        <div className="p-4 rounded-full bg-lime/10">
                            <CheckCircle className="w-16 h-16 text-lime" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white">Check your email</h2>
                    <p className="text-gray-400">
                        We've sent a password reset link to <span className="text-white font-semibold">{email}</span>.
                    </p>
                    <div className="pt-4">
                        <Link to="/login" className="text-lime font-bold hover:underline flex items-center justify-center gap-2">
                            <ArrowLeft size={16} /> Back to Sign In
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-oled">
            <div className="w-full max-w-sm space-y-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="p-3 mb-4 rounded-full bg-lime/10">
                        <Dumbbell className="w-12 h-12 text-lime" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Forgot Password?</h2>
                    <p className="mt-2 text-sm text-gray-400">No worries! Enter your email and we'll send you a reset link.</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">
                            {error}
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                            Email address
                        </label>
                        <div className="relative mt-1">
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 pl-11 text-white bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime transition-all placeholder:text-gray-600"
                                placeholder="alex@example.com"
                            />
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-oled transition-colors bg-lime rounded-lg hover:bg-lime/90 disabled:opacity-50"
                    >
                        {loading ? 'Sending Link...' : 'Send Reset Link'}
                    </button>
                </form>

                <p className="text-sm text-center text-gray-400">
                    Remember your password?{' '}
                    <Link to="/login" className="font-medium text-lime hover:text-lime/80 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
