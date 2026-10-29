import React from 'react';
import { Download, Sparkles } from 'lucide-react';
import { NavigationTab } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface TopBarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  hapticsEnabled: boolean;
  onOpenDownload: () => void;
  labels: {
    appName: string;
    navHome: string;
    navTools: string;
    navHistory: string;
    navSettings: string;
  };
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  hapticsEnabled,
  onOpenDownload,
  labels,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full px-4 sm:px-6 py-3 border-b border-white/10 bg-slate-950/70 dark:bg-slate-950/75 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div
          onClick={() => {
            triggerHaptic('light', hapticsEnabled);
            onSelectTab('home');
          }}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap">
            {labels.appName}
          </span>
        </div>

        {/* Zone 2: 4 clean single-line nav links for tablet/desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => {
              triggerHaptic('light', hapticsEnabled);
              onSelectTab('home');
            }}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'home'
                ? 'text-white border-b-2 border-sky-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {labels.navHome}
          </button>
          <button
            onClick={() => {
              triggerHaptic('light', hapticsEnabled);
              onSelectTab('tools');
            }}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'tools'
                ? 'text-white border-b-2 border-sky-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {labels.navTools}
          </button>
          <button
            onClick={() => {
              triggerHaptic('light', hapticsEnabled);
              onSelectTab('history');
            }}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'history'
                ? 'text-white border-b-2 border-sky-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {labels.navHistory}
          </button>
          <button
            onClick={() => {
              triggerHaptic('light', hapticsEnabled);
              onSelectTab('settings');
            }}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'settings'
                ? 'text-white border-b-2 border-sky-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {labels.navSettings}
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              triggerHaptic('medium', hapticsEnabled);
              onOpenDownload();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white glass-btn-accent shadow-sm active:scale-95 transition whitespace-nowrap"
          >
            <Download size={14} />
            <span>Get App</span>
          </button>
        </div>
      </div>
    </header>
  );
};
