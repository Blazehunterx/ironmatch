import React from 'react';

type Tab = 'plans' | 'community' | 'programs' | 'marketplace' | 'templates' | 'history';

interface WorkoutTabNavigationProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

const WorkoutTabNavigation: React.FC<WorkoutTabNavigationProps> = ({ activeTab, onTabChange }) => {
    const tabs: { key: Tab; label: string }[] = [
        { key: 'plans', label: '📋 Plans' },
        { key: 'community', label: '🤝 Discovery' },
        { key: 'marketplace', label: '💎 Shop' },
        { key: 'programs', label: '🎓 Science' },
        { key: 'templates', label: '⭐ Starter' },
        { key: 'history', label: '📊 History' }
    ];

    return (
        <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-800">
            {tabs.map(t => (
                <button
                    key={t.key}
                    onClick={() => onTabChange(t.key)}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${activeTab === t.key
                        ? 'bg-lime text-oled'
                        : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
};

export default WorkoutTabNavigation;
