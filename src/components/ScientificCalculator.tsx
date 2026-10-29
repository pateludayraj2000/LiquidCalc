import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Delete } from 'lucide-react';
import { evaluateExpression, formatNumber } from '../utils/mathEngine';
import { triggerHaptic } from '../utils/haptics';
import { GlassCard } from './GlassCard';
import { AppSettings, HistoryItem } from '../types';

interface ScientificCalculatorProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  externalExpression?: string;
  onClearExternalExpression?: () => void;
}

export const ScientificCalculator: React.FC<ScientificCalculatorProps> = ({
  settings,
  onSaveHistory,
  externalExpression,
  onClearExternalExpression,
}) => {
  const [expression, setExpression] = useState('');
  const [liveResult, setLiveResult] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDegreeMode, setIsDegreeMode] = useState(true);
  const [isInverseMode, setIsInverseMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [justCalculated, setJustCalculated] = useState(false);

  useEffect(() => {
    if (externalExpression) {
      setExpression(externalExpression);
      setJustCalculated(false);
      setErrorMessage(null);
      if (onClearExternalExpression) {
        onClearExternalExpression();
      }
    }
  }, [externalExpression, onClearExternalExpression]);

  // Live evaluation preview
  useEffect(() => {
    if (!expression.trim()) {
      setLiveResult('');
      setErrorMessage(null);
      return;
    }

    const res = evaluateExpression(expression, isDegreeMode);
    if (!isNaN(res.value) && !res.error) {
      setLiveResult(formatNumber(res.value, settings.precision, settings.numberFormat));
      setErrorMessage(null);
    } else {
      setLiveResult('');
      if (res.error && !/[+\-×÷*/%^]$/.test(expression)) {
        setErrorMessage(res.error);
      } else {
        setErrorMessage(null);
      }
    }
  }, [expression, isDegreeMode, settings.precision, settings.numberFormat]);

  const handleInput = useCallback(
    (char: string) => {
      triggerHaptic('light', settings.haptics);
      setErrorMessage(null);

      if (justCalculated && /[0-9.]/.test(char)) {
        setExpression(char);
        setJustCalculated(false);
        return;
      }
      setJustCalculated(false);

      const operators = ['+', '-', '×', '÷', '%', '^'];
      const lastChar = expression.slice(-1);

      if (operators.includes(char) && operators.includes(lastChar)) {
        setExpression((prev) => prev.slice(0, -1) + char);
        return;
      }

      setExpression((prev) => prev + char);
    },
    [expression, justCalculated, settings.haptics]
  );

  const handleFunctionInput = useCallback(
    (fnName: string) => {
      triggerHaptic('light', settings.haptics);
      setErrorMessage(null);

      if (justCalculated) {
        setExpression(`${fnName}(`);
        setJustCalculated(false);
        return;
      }

      setExpression((prev) => prev + `${fnName}(`);
    },
    [justCalculated, settings.haptics]
  );

  const handleClear = useCallback(() => {
    triggerHaptic('medium', settings.haptics);
    setExpression('');
    setLiveResult('');
    setErrorMessage(null);
    setJustCalculated(false);
  }, [settings.haptics]);

  const handleDelete = useCallback(() => {
    triggerHaptic('light', settings.haptics);
    if (justCalculated) {
      setExpression('');
      setJustCalculated(false);
      return;
    }
    setExpression((prev) => prev.slice(0, -1));
  }, [justCalculated, settings.haptics]);

  const handleCalculate = useCallback(() => {
    if (!expression.trim()) return;

    triggerHaptic('heavy', settings.haptics);
    const res = evaluateExpression(expression, isDegreeMode);

    if (res.error || isNaN(res.value)) {
      setErrorMessage(res.error || 'Syntax Error');
      triggerHaptic('warning', settings.haptics);
      return;
    }

    const formatted = formatNumber(res.value, settings.precision, settings.numberFormat);
    onSaveHistory({
      expression: `${expression} [${isDegreeMode ? 'DEG' : 'RAD'}]`,
      result: formatted,
      type: 'scientific',
    });

    setExpression(String(res.value));
    setLiveResult('');
    setJustCalculated(true);
    setErrorMessage(null);
  }, [expression, isDegreeMode, settings.haptics, settings.precision, settings.numberFormat, onSaveHistory]);

  const handleCopy = useCallback(async () => {
    const textToCopy = expression || liveResult || '0';
    triggerHaptic('medium', settings.haptics);
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }, [expression, liveResult, settings.haptics]);

  return (
    <div className="w-full max-w-sm sm:max-w-xl mx-auto">
      {/* Liquid Glass Display Screen */}
      <GlassCard className="p-4 sm:p-5 mb-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic('light', settings.haptics);
                setIsDegreeMode(!isDegreeMode);
              }}
              className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/10 hover:bg-white/20 text-sky-400 transition"
            >
              {isDegreeMode ? 'DEG' : 'RAD'}
            </button>
            <button
              onClick={() => {
                triggerHaptic('light', settings.haptics);
                setIsInverseMode(!isInverseMode);
              }}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition ${
                isInverseMode ? 'bg-sky-500 text-white' : 'bg-white/10 text-slate-300'
              }`}
            >
              INV
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              title="Copy to clipboard"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Expression */}
        <div className="min-h-[36px] flex items-center justify-end text-right font-mono text-base text-slate-300 overflow-x-auto whitespace-nowrap scrollbar-none px-1">
          {expression || '0'}
        </div>

        {/* Result */}
        <div className="min-h-[52px] flex items-baseline justify-end text-right font-mono font-bold tracking-tight text-3xl sm:text-4xl text-white tabular-nums px-1 overflow-x-auto whitespace-nowrap scrollbar-none">
          {errorMessage ? (
            <span className="text-rose-400 text-lg font-medium tracking-normal animate-shake">
              {errorMessage}
            </span>
          ) : liveResult ? (
            <span className="text-sky-300/90 text-2xl sm:text-3xl font-semibold">
              = {liveResult}
            </span>
          ) : (
            <span className="text-white">{expression || '0'}</span>
          )}
        </div>
      </GlassCard>

      {/* Scientific Keypad: 5 columns layout for mobile & responsive */}
      <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
        {/* Row 1 Scientific keys */}
        <button
          onClick={() => handleFunctionInput(isInverseMode ? 'asin' : 'sin')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-medium text-xs sm:text-sm text-sky-300"
        >
          {isInverseMode ? 'sin⁻¹' : 'sin'}
        </button>
        <button
          onClick={() => handleFunctionInput(isInverseMode ? 'acos' : 'cos')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-medium text-xs sm:text-sm text-sky-300"
        >
          {isInverseMode ? 'cos⁻¹' : 'cos'}
        </button>
        <button
          onClick={() => handleFunctionInput(isInverseMode ? 'atan' : 'tan')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-medium text-xs sm:text-sm text-sky-300"
        >
          {isInverseMode ? 'tan⁻¹' : 'tan'}
        </button>
        <button
          onClick={handleClear}
          className="glass-btn h-12 sm:h-13 rounded-xl font-bold text-sm text-rose-300 hover:text-rose-200"
        >
          AC
        </button>
        <button
          onClick={handleDelete}
          className="glass-btn h-12 sm:h-13 rounded-xl flex items-center justify-center font-medium text-slate-300"
        >
          <Delete size={18} />
        </button>

        {/* Row 2 */}
        <button
          onClick={() => handleFunctionInput('ln')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-medium text-xs sm:text-sm text-slate-300"
        >
          ln
        </button>
        <button
          onClick={() => handleFunctionInput('log')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-medium text-xs sm:text-sm text-slate-300"
        >
          log
        </button>
        <button
          onClick={() => handleInput('^')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-medium text-xs sm:text-sm text-slate-300"
        >
          xʸ
        </button>
        <button
          onClick={() => handleInput('(')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-medium text-sm text-slate-300"
        >
          (
        </button>
        <button
          onClick={() => handleInput(')')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-medium text-sm text-slate-300"
        >
          )
        </button>

        {/* Row 3 */}
        <button
          onClick={() => handleFunctionInput('sqrt')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-medium text-xs sm:text-sm text-slate-300"
        >
          √x
        </button>
        <button
          onClick={() => handleInput('7')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-semibold text-lg text-white"
        >
          7
        </button>
        <button
          onClick={() => handleInput('8')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-semibold text-lg text-white"
        >
          8
        </button>
        <button
          onClick={() => handleInput('9')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-semibold text-lg text-white"
        >
          9
        </button>
        <button
          onClick={() => handleInput('÷')}
          className="glass-btn-accent h-12 sm:h-13 rounded-xl font-bold text-xl"
        >
          ÷
        </button>

        {/* Row 4 */}
        <button
          onClick={() => handleInput('^2')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-medium text-xs sm:text-sm text-slate-300"
        >
          x²
        </button>
        <button
          onClick={() => handleInput('4')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-semibold text-lg text-white"
        >
          4
        </button>
        <button
          onClick={() => handleInput('5')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-semibold text-lg text-white"
        >
          5
        </button>
        <button
          onClick={() => handleInput('6')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-semibold text-lg text-white"
        >
          6
        </button>
        <button
          onClick={() => handleInput('×')}
          className="glass-btn-accent h-12 sm:h-13 rounded-xl font-bold text-xl"
        >
          ×
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleInput('!')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-medium text-xs sm:text-sm text-slate-300"
        >
          n!
        </button>
        <button
          onClick={() => handleInput('1')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-semibold text-lg text-white"
        >
          1
        </button>
        <button
          onClick={() => handleInput('2')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-semibold text-lg text-white"
        >
          2
        </button>
        <button
          onClick={() => handleInput('3')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-semibold text-lg text-white"
        >
          3
        </button>
        <button
          onClick={() => handleInput('-')}
          className="glass-btn-accent h-12 sm:h-13 rounded-xl font-bold text-xl"
        >
          −
        </button>

        {/* Row 6 */}
        <button
          onClick={() => handleInput('π')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-serif text-base text-sky-300"
        >
          π
        </button>
        <button
          onClick={() => handleInput('e')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-serif text-base text-sky-300"
        >
          e
        </button>
        <button
          onClick={() => handleInput('0')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-semibold text-lg text-white"
        >
          0
        </button>
        <button
          onClick={() => handleInput('.')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-bold text-xl text-white"
        >
          .
        </button>
        <button
          onClick={() => handleInput('+')}
          className="glass-btn-accent h-12 sm:h-13 rounded-xl font-bold text-xl"
        >
          +
        </button>

        {/* Row 7 */}
        <button
          onClick={() => handleFunctionInput('abs')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-medium text-xs sm:text-sm text-slate-300"
        >
          |x|
        </button>
        <button
          onClick={() => handleFunctionInput('cbrt')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-medium text-xs sm:text-sm text-slate-300"
        >
          ∛x
        </button>
        <button
          onClick={() => handleInput('%')}
          className="glass-btn h-12 sm:h-13 rounded-xl font-medium text-base text-slate-300"
        >
          %
        </button>
        <button
          onClick={handleCalculate}
          className="col-span-2 glass-btn-accent h-12 sm:h-13 rounded-xl font-extrabold text-2xl shadow-lg"
        >
          =
        </button>
      </div>
    </div>
  );
};
