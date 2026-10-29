import React, { useState, useMemo } from 'react';
import { Trash2, Copy, Check, ArrowUpRight, Download, History as HistoryIcon, Search } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AppSettings, HistoryItem } from '../types';
import { exportHistoryAsCSV } from '../utils/storage';
import { triggerHaptic } from '../utils/haptics';

interface HistoryProps {
  settings: AppSettings;
  history: HistoryItem[];
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  onReuseExpression: (expr: string) => void;
  labels: {
    historyEmpty: string;
    historySubtitle: string;
    clearAll: string;
    clearConfirmTitle: string;
    clearConfirmDesc: string;
    cancel: string;
    confirm: string;
    reuse: string;
  };
}

export const History: React.FC<HistoryProps> = ({
  settings,
  history,
  onClearHistory,
  onDeleteHistoryItem,
  onReuseExpression,
  labels,
}) => {
  const [search, setSearch] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    if (!search.trim()) return history;
    const q = search.toLowerCase();
    return history.filter(
      (item) =>
        item.expression.toLowerCase().includes(q) ||
        item.result.toLowerCase().includes(q) ||
        (item.toolName && item.toolName.toLowerCase().includes(q))
    );
  }, [history, search]);

  const handleCopy = async (item: HistoryItem) => {
    triggerHaptic('light', settings.haptics);
    try {
      await navigator.clipboard.writeText(item.result);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleExportCSV = () => {
    triggerHaptic('medium', settings.haptics);
    exportHistoryAsCSV(history);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-20">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <HistoryIcon size={16} />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Calculation History
          </h1>
          <span className="text-xs text-slate-400 font-mono">({history.length})</span>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-btn text-xs font-semibold text-slate-200 hover:text-white"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic('medium', settings.haptics);
                setShowClearConfirm(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-btn text-xs font-semibold text-rose-300 hover:text-rose-200"
            >
              <Trash2 size={13} />
              <span>{labels.clearAll}</span>
            </button>
          </div>
        )}
      </div>

      {/* Search History Filter if there are items */}
      {history.length > 5 && (
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search through calculations..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-sky-400"
          />
        </div>
      )}

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <GlassCard className="p-8 text-center space-y-2">
          <HistoryIcon size={36} className="text-slate-500 mx-auto stroke-1" />
          <h3 className="text-base font-bold text-white">{labels.historyEmpty}</h3>
          <p className="text-xs text-slate-400">{labels.historySubtitle}</p>
        </GlassCard>
      ) : (
        <div className="space-y-2.5">
          {filteredHistory.map((item) => {
            const date = new Date(item.timestamp);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

            return (
              <GlassCard
                key={item.id}
                className="p-3.5 sm:p-4 hover:bg-white/10 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Expression & Result */}
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-mono">{dateStr} · {timeStr}</span>
                    {item.toolName && (
                      <>
                        <span>•</span>
                        <span className="text-sky-400 font-medium">{item.toolName}</span>
                      </>
                    )}
                  </div>

                  <div className="font-mono text-sm text-slate-200 truncate">
                    {item.expression}
                  </div>

                  <div className="font-mono font-bold text-base sm:text-lg text-white">
                    = {item.result}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => onReuseExpression(item.expression.split(' [')[0])}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg glass-btn text-xs font-medium text-slate-300 hover:text-white"
                    title={labels.reuse}
                  >
                    <ArrowUpRight size={13} />
                    <span>{labels.reuse}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(item)}
                    className="p-1.5 rounded-lg glass-btn text-slate-300 hover:text-white"
                    title="Copy result"
                  >
                    {copiedId === item.id ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      triggerHaptic('light', settings.haptics);
                      onDeleteHistoryItem(item.id);
                    }}
                    className="p-1.5 rounded-lg glass-btn text-slate-400 hover:text-rose-300"
                    title="Delete item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Clear All */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <GlassCard className="w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">{labels.clearConfirmTitle}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {labels.clearConfirmDesc}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="h-10 rounded-xl glass-btn text-xs font-semibold text-slate-300 hover:text-white"
              >
                {labels.cancel}
              </button>
              <button
                onClick={() => {
                  triggerHaptic('heavy', settings.haptics);
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="h-10 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition"
              >
                {labels.confirm}
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
