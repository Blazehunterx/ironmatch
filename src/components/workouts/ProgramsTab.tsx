import { GraduationCap } from 'lucide-react';
import StarterTemplateCard from './StarterTemplateCard';
import { SCIENCE_PACKS } from '../../constants/sciencePacks';

interface ProgramsTabProps {
    onUseTemplate: (template: any) => void;
}

export default function ProgramsTab({ onUseTemplate }: ProgramsTabProps) {
    return (
        <div className="space-y-6">
            <div className="bg-[#0D0D0D] border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                    <GraduationCap size={80} className="text-lime" />
                </div>
                <h4 className="text-xs font-black text-lime uppercase tracking-widest mb-1">Biomechanical Engineering</h4>
                <h3 className="text-xl font-black text-white mb-2">Evidence-Based Hypertrophy Protocols</h3>
                <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-[85%]">
                    Peer-reviewed mechanical tension & tendon-resilience splits designed for maximum stimulus-to-fatigue efficiency.
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
