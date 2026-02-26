import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockGyms } from '../lib/mock';
import { Camera, ArrowRight, User as UserIcon } from 'lucide-react';
import type { FitnessLevel } from '../types/database';

export default function CreateProfile() {
    const { user, signup } = useAuth();
    const navigate = useNavigate();
    const [gymId, setGymId] = useState(mockGyms[0].id);
    const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('Beginner');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);

    // If we already have a full profile, could redirect.
    // For the mock, we just update the user.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // In a real app we would call a supabase update matching the authenticated user.
        // For mock, we'll re-call signup with the updated fields, or a separate update function.
        // Let's use signup mock to just merge properties for demonstration
        await signup({
            ...user,
            home_gym: gymId,
            fitness_level: fitnessLevel,
            bio: bio
        });
        setLoading(false);
        navigate('/');
    };

    return (
        <div className="flex flex-col min-h-screen bg-oled px-4 pt-12 pb-8">
            <div className="w-full max-w-md mx-auto space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Setup your profile</h2>
                    <p className="mt-2 text-gray-400">Tell us a bit about yourself so we can find your perfect gym partner.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center mb-8">
                        <div className="relative group cursor-pointer">
                            <div className="w-24 h-24 overflow-hidden rounded-full border-2 border-lime/50 bg-gray-900 flex items-center justify-center">
                                <UserIcon className="w-10 h-10 text-gray-600" />
                            </div>
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Home Gym</label>
                            <select
                                value={gymId}
                                onChange={(e) => setGymId(e.target.value)}
                                className="w-full px-4 py-3 mt-1 text-white bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime appearance-none"
                            >
                                {mockGyms.map(gym => (
                                    <option key={gym.id} value={gym.id}>{gym.name} - {gym.location}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300">Fitness Level</label>
                            <div className="grid gap-2 mt-2">
                                {[
                                    { level: 'Beginner', desc: '0-1 years' },
                                    { level: 'Intermediate', desc: '1-4 years' },
                                    { level: 'Professional', desc: '4+ years' }
                                ].map(({ level, desc }) => (
                                    <button
                                        type="button"
                                        key={level}
                                        onClick={() => setFitnessLevel(level as FitnessLevel)}
                                        className={`px-4 py-3 text-sm text-left rounded-lg border transition-all flex justify-between items-center ${fitnessLevel === level
                                            ? 'bg-lime/20 border-lime text-lime font-medium'
                                            : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
                                            }`}
                                    >
                                        <span>{level}</span>
                                        <span className={`text-xs ${fitnessLevel === level ? 'text-lime/80' : 'text-gray-500'}`}>{desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300">Bio <span className="text-gray-500 font-normal">(Optional)</span></label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="What are your fitness goals? What kind of workout partner are you looking for?"
                                rows={3}
                                maxLength={150}
                                className="w-full px-4 py-3 mt-1 text-white bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime resize-none placeholder:text-gray-600"
                            />
                            <div className="text-right text-xs text-gray-500 mt-1">{bio.length}/150</div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-oled transition-colors bg-lime rounded-lg hover:bg-lime/90"
                    >
                        {loading ? 'Saving...' : 'Complete Profile'}
                        {!loading && <ArrowRight className="w-4 h-4 ml-2 mt-0.5" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
