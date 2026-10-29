import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Delete, RotateCcw } from 'lucide-react';
import { evaluateExpression, formatNumber } from '../utils/mathEngine';
import { triggerHaptic } from '../utils/haptics';
import { GlassCard } from './GlassCard';
import { AppSettings, HistoryItem } from '../types';

interface StandardCalculatorProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  externalExpression?: string;
  onClearExternalExpression?: () => void;
}

export const StandardCalculator: React.FC<StandardCalculatorProps> = ({
  settings,
  onSaveHistory,
  externalExpression,
  onClearExternalExpression,
}) => {
  const [expression, setExpression] = useState('');
  const [liveResult, setLiveResult] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [justCalculated, setJustCalculated] = useState(false);

  // If user tapped a history item to reuse
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

  // Compute live preview as expression changes
  useEffect(() => {
    if (!expression.trim()) {
      setLiveResult('');
      setErrorMessage(null);
      return;
    }

    const res = evaluateExpression(expression);
    if (!isNaN(res.value) && !res.error) {
      setLiveResult(formatNumber(res.value, settings.precision, settings.numberFormat));
      setErrorMessage(null);
    } else {
      setLiveResult('');
      // Only set error if expression looks complete
      if (res.error && !/[+\-×÷*/%^]$/.test(expression)) {
        setErrorMessage(res.error);
      } else {
        setErrorMessage(null);
      }
    }
  }, [expression, settings.precision, settings.numberFormat]);

  const handleInput = useCallback(
    (char: string) => {
      triggerHaptic('light', settings.haptics);
      setErrorMessage(null);

      // If user starts typing a number right after a calculation, start fresh
      if (justCalculated && /[0-9.]/.test(char)) {
        setExpression(char);
        setJustCalculated(false);
        return;
      }
      setJustCalculated(false);

      // Operator chaining replacements: if last char is an operator and user clicks another operator
      const operators = ['+', '-', '×', '÷', '%'];
      const lastChar = expression.slice(-1);

      if (operators.includes(char) && operators.includes(lastChar)) {
        setExpression((prev) => prev.slice(0, -1) + char);
        return;
      }

      // Decimal point check
      if (char === '.') {
        const segments = expression.split(/[\+\-×÷*/%^()]/);
        const lastSegment = segments[segments.length - 1];
        if (lastSegment.includes('.')) {
          return; // Prevent double decimals in the same number
        }
      }

      setExpression((prev) => prev + char);
    },
    [expression, justCalculated, settings.haptics]
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

  const handleSignToggle = useCallback(() => {
    triggerHaptic('light', settings.haptics);
    if (!expression) return;

    // Find the last number token in the expression
    const match = expression.match(/(-?\d+\.?\d*)$/);
    if (match) {
      const numStr = match[1];
      const startIdx = expression.length - numStr.length;
      if (numStr.startsWith('-')) {
        setExpression(expression.slice(0, startIdx) + numStr.slice(1));
      } else {
        setExpression(expression.slice(0, startIdx) + '-' + numStr);
      }
    } else {
      // Toggle unary minus
      setExpression((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
    }
  }, [expression, settings.haptics]);

  const handleCalculate = useCallback(() => {
    if (!expression.trim()) return;

    triggerHaptic('heavy', settings.haptics);
    const res = evaluateExpression(expression);

    if (res.error || isNaN(res.value)) {
      setErrorMessage(res.error || 'Syntax Error');
      triggerHaptic('warning', settings.haptics);
      return;
    }

    const formatted = formatNumber(res.value, settings.precision, settings.numberFormat);
    onSaveHistory({
      expression,
      result: formatted,
      type: 'standard',
    });

    setExpression(String(res.value));
    setLiveResult('');
    setJustCalculated(true);
    setErrorMessage(null);
  }, [expression, settings.haptics, settings.precision, settings.numberFormat, onSaveHistory]);

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

  // Desktop Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleInput(e.key);
      } else if (e.key === '.') {
        handleInput('.');
      } else if (e.key === '+') {
        handleInput('+');
      } else if (e.key === '-') {
        handleInput('-');
      } else if (e.key === '*' || e.key === 'x') {
        handleInput('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleInput('÷');
      } else if (e.key === '%') {
        handleInput('%');
      } else if (e.key === '(' || e.key === ')') {
        handleInput(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, handleCalculate, handleDelete, handleClear]);

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      {/* Liquid Glass Display Screen */}
      <GlassCard className="p-5 sm:p-6 mb-4">
        {/* Top toolbar in display */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span className="text-[11px] uppercase tracking-wider text-slate-300">Standard</span>
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

        {/* Live Expression Input View */}
        <div className="min-h-[38px] flex items-center justify-end text-right font-mono text-base sm:text-lg text-slate-300 overflow-x-auto whitespace-nowrap scrollbar-none px-1">
          {expression || '0'}
        </div>

        {/* Live / Formatted Result Output */}
        <div className="min-h-[56px] flex items-baseline justify-end text-right font-mono font-bold tracking-tight text-3xl sm:text-4xl text-white tabular-nums px-1 overflow-x-auto whitespace-nowrap scrollbar-none">
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

      {/* Calculator Keypad */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {/* Row 1 */}
        <button
          onClick={handleClear}
          className="glass-btn h-14 sm:h-16 rounded-2xl flex items-center justify-center font-bold text-lg text-rose-300 hover:text-rose-200"
        >
          AC
        </button>
        <button
          onClick={handleDelete}
          className="glass-btn h-14 sm:h-16 rounded-2xl flex items-center justify-center font-medium text-slate-300 hover:text-white"
        >
          <Delete size={20} />
        </button>
        <button
          onClick={handleSignToggle}
          className="glass-btn h-14 sm:h-16 rounded-2xl flex items-center justify-center font-semibold text-lg text-slate-300 hover:text-white"
        >
          ±
        </button>
        <button
          onClick={() => handleInput('÷')}
          className="glass-btn-accent h-14 sm:h-16 rounded-2xl flex items-center justify-center font-bold text-2xl"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          onClick={() => handleInput('7')}
          className="glass-btn h-14 sm:h-16 rounded-2xl flex items-center justify-center font-semibold text-xl text-white"
        >
          7
        </button>
        <button
          onClick={() => handleInput('8')}
          className="glass-btn h-14 sm:h-16 rounded-2xl flex items-center justify-center font-semibold text-xl text-white"
        >
          8
        </button>
        <button
          onClick={() => handleInput('9')}
          className="glass-btn h-14 sm:h-16 rounded-2xl flex items-center justify-center font-semibold text-xl text-white"
        >
          9
        </button>
        <button
          onClick={() => handleInput('×')}
          className="glass-btn-accent h-14 sm:h-16 rounded-2xl flex items-center justify-center font-bold text-2xl"
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          onClick={() => handleInput('4')}
          className="glass-btn h-14 sm:h-16 rounded-2xl flex items-center justify-center font-semibold text-xl text-white"
        >
          4
        </button>
        <button
          onClick={() => handleInput('5')}
          className="glass-btn h-14 sm:h-16 rounded-2xl flex items-center justify-center font-semibold text-xl text-white"
        >
          5
        </button>
        <button
          onClick={() => handleInput('6')}
          className="glass-btn h-14 sm:h-16 rounded-2xl flex items-center justify-center font-semibold text-xl text-white"
        >
          6
        </button>
        <button
          onClick={() => handleInput('-')}
          className="glass-btn-accent h-14 sm:h-16 rounded-2xl flex items-center justify-center font-bold text-2xl"
        >
          −
        </button>

        {/* Row 4 */}
        <button
          onClick={() => handleInput('1')}
          className="glass-btn h-14 sm:h-16 rounded-2xl flex items-center justify-center font-semibold text-xl text-white"
        >
          1
        </button>
        <button
          onClick={() => handleInput('2')}
          className="glass-btn h-14 sm:h-16 rounded-2xl flex items-center justify-center font-semibold text-xl text-white"
        >
          2
        </button>
        <button
          onClick={() => handleInput('3')}
          className="glass-btn h-14 sm:h-16 rounded-2xl flex items-center justify-center font-semibold text-xl text-white"
        >
          3
        </button>
        <button
          onClick={() => handleInput('+')}
          className="glass-btn-accent h-14 sm:h-16 rounded-2xl flex items-center justify-center font-bold text-2xl"
        >
          +
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleInput('%')}
          className="glass-btn h-14 sm:h-16 rounded-2xl flex items-center justify-center font-medium text-lg text-slate-300 hover:text-white"
        >
          %
        </button>
        <button
          onClick={() => handleInput('0')}
          className="glass-btn h-14 sm:h-16 rounded-2xl flex items-center justify-center font-semibold text-xl text-white"
        >
          0
        </button>
        <button
          onClick={() => handleInput('.')}
          className="glass-btn h-14 sm:h-16 rounded-2xl flex items-center justify-center font-bold text-2xl text-white"
        >
          .
        </button>
        <button
          onClick={handleCalculate}
          className="glass-btn-accent h-14 sm:h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-lg"
        >
          =
        </button>
      </div>

      {/* Parentheses & Extra Row for quick accessibility */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-2.5 sm:mt-3">
        <button
          onClick={() => handleInput('(')}
          className="glass-btn h-11 rounded-xl flex items-center justify-center font-mono font-medium text-slate-300 text-sm hover:text-white"
        >
          ( open
        </button>
        <button
          onClick={() => handleInput(')')}
          className="glass-btn h-11 rounded-xl flex items-center justify-center font-mono font-medium text-slate-300 text-sm hover:text-white"
        >
          ) close
        </button>
      </div>
    </div>
  );
};
