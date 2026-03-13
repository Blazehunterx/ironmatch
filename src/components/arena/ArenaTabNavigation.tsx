import React from 'react';
import { Swords, Shield, Target, LucideIcon } from 'lucide-react';

export type ArenaTab = 'wars' | 'duels' | 'quests';

interface ArenaTabOption {
    key: ArenaTab;
    icon: LucideIcon;
    label: string;
}

interface ArenaTabNavigationProps {
    activeTab: ArenaTab;
    onTabChange: (tab: ArenaTab) => void;
}

const ArenaTabNavigation: React.FC<ArenaTabNavigationProps> = ({ activeTab, onTabChange }) => {
    const tabs: ArenaTabOption[] = [
        { key: 'wars', icon: Shield, label: 'Gym Wars' },
        { key: 'duels', icon: Swords, label: 'Duels' },
        { key: 'quests', icon: Target, label: 'Quests' },
    ];

    return (
        <div className="flex px-4 gap-1.5 mb-4">
            {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                    <button key={tab.key} onClick={() => onTabChange(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab.key
                            ? 'bg-lime/10 border border-lime/40 text-lime'
                            : 'bg-gray-900 border border-gray-800 text-gray-500 hover:text-gray-300'}`}
                    >
                        <Icon size={14} /> {tab.label}
                    </button>
                );
            })}
        </div>
    );
};

export default ArenaTabNavigation;
