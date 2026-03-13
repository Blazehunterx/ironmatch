import { Shield } from 'lucide-react';

interface GeofenceToggleProps {
    verifyLocation: boolean;
    setVerifyLocation: (verify: boolean) => void;
}

export default function GeofenceToggle({ verifyLocation, setVerifyLocation }: GeofenceToggleProps) {
    return (
        <div className="mt-6 p-4 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Shield className={`shrink-0 ${verifyLocation ? 'text-lime' : 'text-gray-600'}`} size={20} />
                <div>
                    <h4 className="text-sm font-bold text-white">Verified Location</h4>
                    <p className="text-[10px] text-gray-500">1.2x XP & contribute to Gym Wars</p>
                </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={verifyLocation} onChange={(e) => setVerifyLocation(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-lime after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
        </div>
    );
}
