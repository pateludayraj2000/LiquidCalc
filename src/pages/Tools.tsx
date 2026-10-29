import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, Grid2X2 } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AppSettings, ToolCategory, ToolMeta } from '../types';
import { ALL_TOOLS } from '../utils/toolsData';
import { triggerHaptic } from '../utils/haptics';

interface ToolsProps {
  settings: AppSettings;
  onOpenTool: (tool: ToolMeta) => void;
  labels: {
    searchToolsPlaceholder: string;
    allCategories: string;
    categoryFinance: string;
    categoryMath: string;
    categoryConverters: string;
    categoryDaily: string;
    categoryDateTime: string;
    allToolsTitle: string;
  };
}

export const Tools: React.FC<ToolsProps> = ({ settings, onOpenTool, labels }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');

  const isHindi = settings.language === 'hi';

  const categories: Array<{ id: ToolCategory; label: string }> = [
    { id: 'all', label: labels.allCategories },
    { id: 'finance', label: labels.categoryFinance },
    { id: 'math', label: labels.categoryMath },
    { id: 'converters', label: labels.categoryConverters },
    { id: 'daily', label: labels.categoryDaily },
    { id: 'datetime', label: labels.categoryDateTime },
  ];

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter((tool) => {
      // Category filter
      if (selectedCategory !== 'all' && tool.category !== selectedCategory) {
        return false;
      }

      // Search query filter (matches english or hindi text)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = tool.name.toLowerCase().includes(q) || tool.nameHi.toLowerCase().includes(q);
        const matchesDesc = tool.description.toLowerCase().includes(q) || tool.descriptionHi.toLowerCase().includes(q);
        return matchesName || matchesDesc;
      }

      return true;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5 pb-20">
      {/* Header and Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Grid2X2 size={16} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {labels.allToolsTitle}
            </h1>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
          </span>
        </div>

        {/* Liquid Glass Search Input */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={labels.searchToolsPlaceholder}
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-sky-400 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                triggerHaptic('light', settings.haptics);
                setSelectedCategory(cat.id);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                selectedCategory === cat.id
                  ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <p className="text-slate-400 text-sm">No calculators match "{searchQuery}"</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-3 px-4 py-2 rounded-xl glass-btn text-xs font-medium text-white"
          >
            Reset Filters
          </button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTools.map((tool) => {
            const title = isHindi ? tool.nameHi : tool.name;
            const desc = isHindi ? tool.descriptionHi : tool.description;

            return (
              <GlassCard
                key={tool.id}
                onClick={() => {
                  triggerHaptic('light', settings.haptics);
                  onOpenTool(tool);
                }}
                className="p-4 cursor-pointer group hover:bg-white/10 active:scale-[0.98] transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium tracking-wide uppercase text-sky-400/90 font-mono">
                      {tool.category}
                    </span>
                    <div className="p-1 rounded-lg bg-white/5 group-hover:bg-sky-500/20 text-slate-400 group-hover:text-sky-300 transition-colors">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-sky-200 transition-colors">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
