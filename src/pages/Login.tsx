import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, ArrowRight } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Failed to sign in');
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
                    <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back</h2>
                    <p className="mt-2 text-sm text-gray-400">Ready to crush your next workout?</p>
                    <p className="mt-3 text-xs text-gray-600 bg-gray-900 rounded-lg px-3 py-2 border border-gray-800">Demo: <span className="text-lime font-mono">alex@example.com</span></p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 mt-1 text-white bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all placeholder:text-gray-600"
                                placeholder="alex@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 mt-1 text-white bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all placeholder:text-gray-600"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-oled transition-colors bg-lime rounded-lg hover:bg-lime/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                        {!loading && <ArrowRight className="w-4 h-4 mt-0.5 ml-2" />}
                    </button>
                </form>

                <p className="text-sm text-center text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-medium text-lime hover:text-lime/80 transition-colors">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
