import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ActiveToggle() {
    const { user, updateUser } = useAuth();
    const [isUpdating, setIsUpdating] = useState(false);

    const toggleActive = async () => {
        if (!user) return;
        setIsUpdating(true);
        try {
            await updateUser({
                is_training: !user.is_training,
                last_active_at: new Date().toISOString(),
                training_status: !user.is_training ? 'Training' : ''
            });
        } catch (err) {
            console.error('Failed to update active status:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <button
            onClick={toggleActive}
            disabled={isUpdating}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${user?.is_training
                ? 'bg-lime border-lime shadow-[0_0_30px_-5px_rgba(50,255,50,0.4)]'
                : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border transition-colors ${user?.is_training ? 'bg-black/10 border-black/10' : 'bg-gray-800 border-gray-700 text-gray-400'
                    }`}>
                    {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} className={user?.is_training ? 'text-oled fill-current' : ''} />}
                </div>
                <div className="text-left">
                    <p className={`text-sm font-black tracking-tight ${user?.is_training ? 'text-oled' : 'text-white'}`}>
                        {user?.is_training ? 'Currently Training' : 'Inactive'}
                    </p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${user?.is_training ? 'text-oled/60' : 'text-gray-500'}`}>
                        {user?.is_training ? 'Others can find you' : 'Toggle to show presence'}
                    </p>
                </div>
            </div>

            <div className={`w-12 h-6 rounded-full relative transition-colors ${user?.is_training ? 'bg-black/20' : 'bg-gray-800'
                }`}>
                <motion.div
                    animate={{ x: user?.is_training ? 24 : 4 }}
                    className={`absolute top-1 w-4 h-4 rounded-full shadow-sm ${user?.is_training ? 'bg-white' : 'bg-gray-600'
                        }`}
                />
            </div>
        </button>
    );
}
