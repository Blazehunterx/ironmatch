import React from 'react';

type Tab = 'plans' | 'community' | 'programs' | 'marketplace' | 'templates' | 'history' | 'insights';

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
        { key: 'history', label: '📊 History' },
        { key: 'insights', label: '📈 Insights' }
    ];

    return (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide py-1 no-scrollbar">
            {tabs.map(t => {
                const isActive = activeTab === t.key;
                return (
                    <button
                        key={t.key}
                        onClick={() => onTabChange(t.key)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all shrink-0 ${
                            isActive
                                ? 'bg-lime text-oled shadow-[0_0_12px_rgba(50,255,50,0.3)] scale-[1.02]'
                                : 'bg-gray-900/80 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 active:scale-95'
                        }`}
                    >
                        {t.label}
                    </button>
                );
            })}
        </div>
    );
};

export default WorkoutTabNavigation;
