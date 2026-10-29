import React, { useState } from 'react';
import { X, Check, Copy } from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { AppSettings, HistoryItem, ToolMeta } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

// Import all sub tools
import {
  GstCalculator,
  DiscountCalculator,
  EmiCalculator,
  SimpleInterestCalculator,
  CompoundInterestCalculator,
  TipCalculator,
} from './FinanceTools';
import { PercentageCalculator, RatioCalculator } from './MathTools';
import { AgeCalculator, DateDifferenceCalculator, TimeDurationCalculator } from './DateTimeTools';
import {
  LengthConverter,
  WeightConverter,
  TemperatureConverter,
  AreaConverter,
  VolumeConverter,
  SpeedConverter,
  DataStorageConverter,
} from './ConverterTools';
import { BmiCalculator, FuelMileageCalculator } from './HealthDailyTools';

interface ToolRunnerModalProps {
  tool: ToolMeta | null;
  onClose: () => void;
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  onSelectStandardCalculator?: () => void;
  onSelectScientificCalculator?: () => void;
}

export const ToolRunnerModal: React.FC<ToolRunnerModalProps> = ({
  tool,
  onClose,
  settings,
  onSaveHistory,
  onSelectStandardCalculator,
  onSelectScientificCalculator,
}) => {
  const [copyToast, setCopyToast] = useState(false);

  if (!tool) return null;

  const handleCopyText = async (text: string) => {
    triggerHaptic('medium', settings.haptics);
    try {
      await navigator.clipboard.writeText(text);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2000);
    } catch {
      // Fallback
    }
  };

  const isHindi = settings.language === 'hi';
  const title = isHindi ? tool.nameHi : tool.name;
  const description = isHindi ? tool.descriptionHi : tool.description;

  const renderToolBody = () => {
    const props = {
      settings,
      onSaveHistory,
      onCopyText: handleCopyText,
    };

    switch (tool.id) {
      case 'standard':
        return (
          <div className="text-center py-6">
            <p className="text-slate-300 text-sm mb-4">
              Standard calculator is accessible directly from the main Home screen.
            </p>
            <button
              onClick={() => {
                onClose();
                onSelectStandardCalculator?.();
              }}
              className="px-6 py-2.5 rounded-xl glass-btn-accent text-sm font-semibold"
            >
              Open Standard Calculator
            </button>
          </div>
        );
      case 'scientific':
        return (
          <div className="text-center py-6">
            <p className="text-slate-300 text-sm mb-4">
              Scientific calculator is accessible directly on the Home screen.
            </p>
            <button
              onClick={() => {
                onClose();
                onSelectScientificCalculator?.();
              }}
              className="px-6 py-2.5 rounded-xl glass-btn-accent text-sm font-semibold"
            >
              Open Scientific Calculator
            </button>
          </div>
        );
      case 'percentage':
        return <PercentageCalculator {...props} />;
      case 'gst':
        return <GstCalculator {...props} />;
      case 'discount':
        return <DiscountCalculator {...props} />;
      case 'emi':
        return <EmiCalculator {...props} />;
      case 'simple-interest':
        return <SimpleInterestCalculator {...props} />;
      case 'compound-interest':
        return <CompoundInterestCalculator {...props} />;
      case 'age':
        return <AgeCalculator {...props} />;
      case 'date-diff':
        return <DateDifferenceCalculator {...props} />;
      case 'time-duration':
        return <TimeDurationCalculator {...props} />;
      case 'length':
        return <LengthConverter {...props} />;
      case 'weight':
        return <WeightConverter {...props} />;
      case 'temperature':
        return <TemperatureConverter {...props} />;
      case 'area':
        return <AreaConverter {...props} />;
      case 'volume':
        return <VolumeConverter {...props} />;
      case 'speed':
        return <SpeedConverter {...props} />;
      case 'storage':
        return <DataStorageConverter {...props} />;
      case 'fuel':
        return <FuelMileageCalculator {...props} />;
      case 'bmi':
        return <BmiCalculator {...props} />;
      case 'tip':
        return <TipCalculator {...props} />;
      case 'ratio':
        return <RatioCalculator {...props} />;
      default:
        return <div className="text-slate-400 py-6 text-center">Tool under construction.</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 animate-fadeIn">
      <div
        className="fixed inset-0"
        onClick={() => {
          triggerHaptic('light', settings.haptics);
          onClose();
        }}
      />

      <GlassCard className="relative z-10 w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl">
        {/* Drag handle pill for mobile */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">{title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light', settings.haptics);
              onClose();
            }}
            className="p-2 rounded-xl glass-btn text-slate-400 hover:text-white shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Copy Toast banner if triggered */}
        {copyToast && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center gap-1.5 animate-fadeIn">
            <Check size={14} />
            <span>Copied result to clipboard!</span>
          </div>
        )}

        {/* Tool interactive body */}
        <div className="pb-4">{renderToolBody()}</div>
      </GlassCard>
    </div>
  );
};
