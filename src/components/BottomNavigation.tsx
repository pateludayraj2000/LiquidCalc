import React from 'react';
import { Calculator, Grid2X2, History, Settings } from 'lucide-react';
import { NavigationTab } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface BottomNavigationProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  hapticsEnabled: boolean;
  labels: {
    navHome: string;
    navTools: string;
    navHistory: string;
    navSettings: string;
  };
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
  hapticsEnabled,
  labels,
}) => {
  const tabs: Array<{ id: NavigationTab; label: string; icon: typeof Calculator }> = [
    { id: 'home', label: labels.navHome, icon: Calculator },
    { id: 'tools', label: labels.navTools, icon: Grid2X2 },
    { id: 'history', label: labels.navHistory, icon: History },
    { id: 'settings', label: labels.navSettings, icon: Settings },
  ];

  return (
    <nav
      aria-label="App Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-safe pt-2 bg-slate-950/75 dark:bg-slate-950/80 backdrop-blur-2xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.3)]"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 items-center h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light', hapticsEnabled);
                onSelectTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] rounded-2xl transition-all duration-150 ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              <div
                className={`relative flex items-center justify-center p-1.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-white/15 shadow-sm' : ''
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-transform duration-150 ${
                    isActive ? 'scale-110' : ''
                  }`}
                  style={{
                    color: isActive ? 'var(--accent-primary)' : 'currentColor',
                  }}
                />
              </div>
              <span
                className={`text-[10px] font-semibold tracking-tight mt-0.5 whitespace-nowrap transition-colors ${
                  isActive ? 'text-white font-bold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
