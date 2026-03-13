import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { User } from '../../types/database';

interface UserSearchResultsProps {
    results: User[];
    findGymName: (id: string) => string;
}

export default function UserSearchResults({ results, findGymName }: UserSearchResultsProps) {
    return (
        <AnimatePresence>
            {results.length > 0 && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-4 px-4"
                >
                    <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
                        {results.slice(0, 5).map(u => (
                            <div key={u.id} className="flex items-center gap-3 p-3 hover:bg-gray-800/50 transition-colors cursor-pointer">
                                <img src={u.profile_image_url} alt={u.name} className="w-10 h-10 rounded-full border border-gray-700 object-cover" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-semibold text-white">{u.name}</h4>
                                        {(u.is_trainer || (u.reliability_streak || 0) > 10) && (
                                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black">
                                                <Trophy size={8} className="fill-current" /> MENTOR
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-500">{u.fitness_level} · {findGymName(u.home_gym)}</p>
                                </div>
                                {u.is_trainer && <span className="text-[8px] bg-lime/20 text-lime px-1.5 py-0.5 rounded font-bold">TRAINER</span>}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
