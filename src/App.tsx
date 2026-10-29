/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { TopBar } from './components/TopBar';
import { BottomNavigation } from './components/BottomNavigation';
import { Home } from './pages/Home';
import { Tools } from './pages/Tools';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { ToolRunnerModal } from './components/tools/ToolRunnerModal';
import {
  AppSettings,
  HistoryItem,
  NavigationTab,
  ToolMeta,
} from './types';
import {
  getSavedSettings,
  saveSettings,
  getSavedHistory,
  saveHistory,
  addHistoryItem,
  clearHistory,
  clearAllLocalData,
  DEFAULT_SETTINGS,
} from './utils/storage';
import { getTranslation } from './utils/i18n';
import { ALL_TOOLS } from './utils/toolsData';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => getSavedSettings());
  const [history, setHistory] = useState<HistoryItem[]>(() => getSavedHistory());
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [activeTool, setActiveTool] = useState<ToolMeta | null>(null);
  const [reuseExpression, setReuseExpression] = useState<string | undefined>(undefined);

  // Sync settings to localStorage and HTML data-theme
  useEffect(() => {
    saveSettings(settings);

    // Theme mode handling
    const root = document.documentElement;
    let effectiveTheme = settings.theme;
    if (settings.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = prefersDark ? 'dark' : 'light';
    }
    root.setAttribute('data-theme', effectiveTheme);

    // Accent colors mapping
    const ACCENT_MAP = {
      blue: { primary: '#38bdf8', from: '#38bdf8', to: '#2563eb', glow: 'rgba(56, 189, 248, 0.35)' },
      purple: { primary: '#c084fc', from: '#c084fc', to: '#9333ea', glow: 'rgba(192, 132, 252, 0.35)' },
      emerald: { primary: '#34d399', from: '#34d399', to: '#059669', glow: 'rgba(52, 211, 153, 0.35)' },
      amber: { primary: '#fbbf24', from: '#fbbf24', to: '#d97706', glow: 'rgba(251, 191, 36, 0.35)' },
      rose: { primary: '#fb7185', from: '#fb7185', to: '#e11d48', glow: 'rgba(251, 113, 133, 0.35)' },
      cyan: { primary: '#22d3ee', from: '#22d3ee', to: '#0891b2', glow: 'rgba(34, 211, 238, 0.35)' },
    };

    const currentAccent = ACCENT_MAP[settings.accent] || ACCENT_MAP.blue;
    root.style.setProperty('--accent-primary', currentAccent.primary);
    root.style.setProperty('--accent-gradient-from', currentAccent.from);
    root.style.setProperty('--accent-gradient-to', currentAccent.to);
    root.style.setProperty('--accent-glow', currentAccent.glow);

    // Glass intensity mapping
    const BLUR_MAP = {
      low: '12px',
      medium: '24px',
      high: '36px',
    };
    root.style.setProperty('--glass-blur', BLUR_MAP[settings.glassIntensity] || '24px');
  }, [settings]);

  // Labels for current language
  const labels = useMemo(() => getTranslation(settings.language), [settings.language]);

  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const handleClearAllData = () => {
    clearAllLocalData();
    setSettings(DEFAULT_SETTINGS);
    setHistory([]);
  };

  const handleSaveHistoryItem = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem = addHistoryItem(item);
    setHistory((prev) => [newItem, ...prev]);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    saveHistory(updated);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleReuseExpression = (expr: string) => {
    setReuseExpression(expr);
    setCurrentTab('home');
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden">
      {/* Liquid Ambient Glow Background Orbs */}
      {settings.ambientLight && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[110px] opacity-25 animate-pulse"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          />
          <div
            className="absolute top-1/3 -right-32 w-96 h-96 rounded-full blur-[130px] opacity-20"
            style={{ backgroundColor: '#6366f1' }}
          />
          <div
            className="absolute -bottom-32 left-1/4 w-80 h-80 rounded-full blur-[120px] opacity-20"
            style={{ backgroundColor: '#ec4899' }}
          />
        </div>
      )}

      {/* Top Header */}
      <TopBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        hapticsEnabled={settings.haptics}
        onOpenDownload={() => setCurrentTab('settings')}
        labels={labels}
      />

      {/* Main Responsive Canvas */}
      <main className="relative z-10 flex-1 w-full px-3.5 sm:px-6 pt-4 sm:pt-6">
        {currentTab === 'home' && (
          <Home
            settings={settings}
            onSaveHistory={handleSaveHistoryItem}
            history={history}
            onOpenTool={(tool) => setActiveTool(tool)}
            onNavigateHistory={() => setCurrentTab('history')}
            onReuseExpression={handleReuseExpression}
            externalExpression={reuseExpression}
            onClearExternalExpression={() => setReuseExpression(undefined)}
            labels={labels}
          />
        )}

        {currentTab === 'tools' && (
          <Tools
            settings={settings}
            onOpenTool={(tool) => setActiveTool(tool)}
            labels={labels}
          />
        )}

        {currentTab === 'history' && (
          <History
            settings={settings}
            history={history}
            onClearHistory={handleClearHistory}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            onReuseExpression={handleReuseExpression}
            labels={labels}
          />
        )}

        {currentTab === 'settings' && (
          <Settings
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetSettings={handleResetSettings}
            onClearAllData={handleClearAllData}
            history={history}
            labels={labels}
          />
        )}
      </main>

      {/* Bottom Floating Navigation for mobile & quick switching */}
      <BottomNavigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        hapticsEnabled={settings.haptics}
        labels={labels}
      />

      {/* Multi-Tool Interactive Modal Runner */}
      {activeTool && (
        <ToolRunnerModal
          tool={activeTool}
          onClose={() => setActiveTool(null)}
          settings={settings}
          onSaveHistory={handleSaveHistoryItem}
          onSelectStandardCalculator={() => {
            setActiveTool(null);
            setCurrentTab('home');
          }}
          onSelectScientificCalculator={() => {
            setActiveTool(null);
            setCurrentTab('home');
          }}
        />
      )}
    </div>
  );
}
