import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users } from 'lucide-react';

interface MarketplaceProgramCardProps {
    program: {
        id: string;
        name: string;
        trainer: string;
        duration: string;
        price: string;
        intensity: string;
        description: string;
        reviews: number;
        students: number;
        image: string;
    };
    index: number;
}

const MarketplaceProgramCard: React.FC<MarketplaceProgramCardProps> = ({ program, index }) => {
    return (
        <motion.div
            key={program.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden group shadow-2xl"
        >
            <div className="h-40 relative">
                <img src={program.image} alt={program.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                    <span className="text-[9px] bg-lime text-oled px-2 py-1 rounded-lg font-black uppercase tracking-wider">{program.intensity}</span>
                    <span className="text-[9px] bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-lg font-black uppercase tracking-wider">{program.duration}</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                        <p className="text-[10px] text-lime font-black uppercase tracking-[0.2em]">{program.trainer}</p>
                        <h4 className="text-lg font-black text-white">{program.name}</h4>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-black text-white">{program.price}</p>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-gray-900/50">
                <p className="text-xs text-gray-400 leading-relaxed mb-4">{program.description}</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-[10px] text-yellow-500 font-bold">
                            <Sparkles size={12} /> {program.reviews}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold">
                            <Users size={12} /> {program.students} students
                        </div>
                    </div>
                    <button className="px-5 py-2 rounded-xl bg-white text-black text-[10px] font-black hover:bg-lime transition-all active:scale-95 shadow-xl">
                        View Details
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default MarketplaceProgramCard;
