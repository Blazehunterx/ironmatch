import { GraduationCap } from 'lucide-react';
import StarterTemplateCard from './StarterTemplateCard';
import { SCIENCE_PACKS } from '../../constants/sciencePacks';

interface ProgramsTabProps {
    onUseTemplate: (template: any) => void;
}

export default function ProgramsTab({ onUseTemplate }: ProgramsTabProps) {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                    <GraduationCap size={80} className="text-blue-400" />
                </div>
                <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Elite Engineering</h4>
                <h3 className="text-xl font-black text-white mb-2">Jeff Nippard Science Packs</h3>
                <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-[80%]">
                    Evidence-based hypertrophy programs designed for maximum efficiency and scientific precision.
                </p>
            </div>

            <div className="space-y-3">
                {SCIENCE_PACKS.map((template, idx) => (
                    <StarterTemplateCard
                        key={template.id}
                        template={template as any}
                        index={idx}
                        onUse={onUseTemplate}
                    />
                ))}
            </div>
        </div>
    );
}
