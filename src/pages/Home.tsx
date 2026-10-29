import React, { useState } from 'react';
import { ArrowUpRight, Sparkles, History as HistoryIcon } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StandardCalculator } from '../components/StandardCalculator';
import { ScientificCalculator } from '../components/ScientificCalculator';
import { AppSettings, HistoryItem, ToolMeta } from '../types';
import { ALL_TOOLS } from '../utils/toolsData';
import { triggerHaptic } from '../utils/haptics';

interface HomeProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  history: HistoryItem[];
  onOpenTool: (tool: ToolMeta) => void;
  onNavigateHistory: () => void;
  onReuseExpression: (expr: string) => void;
  externalExpression?: string;
  onClearExternalExpression?: () => void;
  labels: {
    standard: string;
    scientific: string;
    quickShortcuts: string;
    historyEmpty: string;
  };
}

export const Home: React.FC<HomeProps> = ({
  settings,
  onSaveHistory,
  history,
  onOpenTool,
  onNavigateHistory,
  onReuseExpression,
  externalExpression,
  onClearExternalExpression,
  labels,
}) => {
  const [calcMode, setCalcMode] = useState<'standard' | 'scientific'>('standard');

  const isHindi = settings.language === 'hi';

  // Popular shortcut tools to feature on home
  const shortcutIds = ['percentage', 'gst', 'emi', 'discount', 'age', 'bmi'];
  const shortcutTools = ALL_TOOLS.filter((t) => shortcutIds.includes(t.id));

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20">
      {/* Segmented Mode Switcher */}
      <div className="max-w-xs mx-auto p-1 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
        <button
          onClick={() => {
            triggerHaptic('light', settings.haptics);
            setCalcMode('standard');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            calcMode === 'standard'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {labels.standard}
        </button>
        <button
          onClick={() => {
            triggerHaptic('light', settings.haptics);
            setCalcMode('scientific');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            calcMode === 'scientific'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {labels.scientific}
        </button>
      </div>

      {/* Main Glass Calculator Container */}
      <div className="flex justify-center">
        {calcMode === 'standard' ? (
          <StandardCalculator
            settings={settings}
            onSaveHistory={onSaveHistory}
            externalExpression={externalExpression}
            onClearExternalExpression={onClearExternalExpression}
          />
        ) : (
          <ScientificCalculator
            settings={settings}
            onSaveHistory={onSaveHistory}
            externalExpression={externalExpression}
            onClearExternalExpression={onClearExternalExpression}
          />
        )}
      </div>

      {/* Quick Tool Shortcut Cards */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Sparkles size={14} className="text-sky-400" />
            <span>{labels.quickShortcuts}</span>
          </div>
          <span className="text-xs text-slate-500">22 multi-tools available</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {shortcutTools.map((tool) => {
            const title = isHindi ? tool.nameHi : tool.name;
            return (
              <GlassCard
                key={tool.id}
                onClick={() => {
                  triggerHaptic('light', settings.haptics);
                  onOpenTool(tool);
                }}
                className="p-3 sm:p-3.5 cursor-pointer group hover:bg-white/10 active:scale-95 transition"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                    {title}
                  </span>
                  <ArrowUpRight
                    size={14}
                    className="text-slate-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {isHindi ? tool.descriptionHi : tool.description}
                </p>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Recent Calculations Preview */}
      {history.length > 0 && (
        <GlassCard className="p-4 sm:p-5 mt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HistoryIcon size={16} className="text-sky-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Recent Calculations
              </span>
            </div>
            <button
              onClick={() => {
                triggerHaptic('light', settings.haptics);
                onNavigateHistory();
              }}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
            >
              View All ({history.length}) →
            </button>
          </div>

          <div className="divide-y divide-white/10">
            {history.slice(0, 2).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  triggerHaptic('light', settings.haptics);
                  onReuseExpression(item.expression.split(' [')[0]);
                }}
                className="py-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-white/5 px-2 rounded-xl transition"
              >
                <div className="font-mono text-slate-300 truncate max-w-[60%]">
                  {item.expression}
                </div>
                <div className="font-mono font-bold text-sky-300 text-sm">
                  = {item.result}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};
