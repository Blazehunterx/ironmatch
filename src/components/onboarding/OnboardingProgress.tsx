import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface OnboardingProgressProps {
    step: number;
    totalSteps: number;
    onBack: () => void;
    onSkip: () => void;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ 
    step, totalSteps, onBack, onSkip 
}) => {
    return (
        <div className="px-6 pt-6 pb-2">
            <div className="flex items-center justify-between mb-3">
                {step > 0 ? (
                    <button onClick={onBack} className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors -ml-1.5">
                        <ArrowLeft size={20} />
                    </button>
                ) : <div className="w-8" />}
                <span className="text-[10px] text-gray-500 font-bold">{step + 1} / {totalSteps}</span>
                {step < totalSteps - 1 ? (
                    <button onClick={onSkip} className="text-[10px] text-gray-500 hover:text-lime font-bold">
                        Skip
                    </button>
                ) : <div className="w-8" />}
            </div>
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-lime rounded-full"
                    animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
};

export default OnboardingProgress;
