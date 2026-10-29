import React, { useState } from 'react';
import { AppSettings, HistoryItem } from '../../types';
import { formatNumber } from '../../utils/mathEngine';
import { triggerHaptic } from '../../utils/haptics';

interface ToolCommonProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  onCopyText: (text: string) => void;
}

// 1. Percentage Calculator
export const PercentageCalculator: React.FC<ToolCommonProps> = ({ settings, onSaveHistory, onCopyText }) => {
  const [mode, setMode] = useState<'of' | 'is_what' | 'change'>('of');
  const [val1, setVal1] = useState<string>('15');
  const [val2, setVal2] = useState<string>('500');
  const [resultText, setResultText] = useState<string | null>(null);

  const calculate = () => {
    triggerHaptic('light', settings.haptics);
    const n1 = parseFloat(val1);
    const n2 = parseFloat(val2);

    if (isNaN(n1) || isNaN(n2)) return;

    let res = '';
    let numericRes = 0;

    if (mode === 'of') {
      // What is n1% of n2?
      numericRes = (n1 * n2) / 100;
      res = `${n1}% of ${n2} = ${formatNumber(numericRes, settings.precision, settings.numberFormat)}`;
    } else if (mode === 'is_what') {
      // n1 is what % of n2?
      if (n2 === 0) return;
      numericRes = (n1 / n2) * 100;
      res = `${n1} is ${formatNumber(numericRes, 2, settings.numberFormat)}% of ${n2}`;
    } else {
      // % change from n1 to n2
      if (n1 === 0) return;
      const diff = n2 - n1;
      numericRes = (diff / n1) * 100;
      const dir = numericRes >= 0 ? 'increase' : 'decrease';
      res = `${Math.abs(numericRes).toFixed(2)}% ${dir} from ${n1} to ${n2}`;
    }

    setResultText(res);
    onSaveHistory({
      type: 'tool',
      toolName: 'Percentage Calculator',
      expression: `${val1} & ${val2} (${mode})`,
      result: res,
    });
  };

  const reset = () => {
    triggerHaptic('light', settings.haptics);
    setVal1('');
    setVal2('');
    setResultText(null);
  };

  return (
    <div className="space-y-4">
      {/* Mode selection tabs */}
      <div className="grid grid-cols-3 p-1 bg-white/5 rounded-2xl border border-white/10 text-xs font-semibold">
        <button
          onClick={() => {
            triggerHaptic('light', settings.haptics);
            setMode('of');
            setResultText(null);
          }}
          className={`py-2 rounded-xl transition ${
            mode === 'of' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          X% of Y
        </button>
        <button
          onClick={() => {
            triggerHaptic('light', settings.haptics);
            setMode('is_what');
            setResultText(null);
          }}
          className={`py-2 rounded-xl transition ${
            mode === 'is_what' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          X is what % of Y
        </button>
        <button
          onClick={() => {
            triggerHaptic('light', settings.haptics);
            setMode('change');
            setResultText(null);
          }}
          className={`py-2 rounded-xl transition ${
            mode === 'change' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          % Change
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {mode === 'of' ? 'Percentage (%)' : mode === 'is_what' ? 'Value X' : 'Initial Value (from)'}
          </label>
          <input
            type="number"
            value={val1}
            onChange={(e) => setVal1(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-lg focus:outline-none focus:border-sky-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {mode === 'of' ? 'Total Value (Y)' : mode === 'is_what' ? 'Total Value (Y)' : 'Final Value (to)'}
          </label>
          <input
            type="number"
            value={val2}
            onChange={(e) => setVal2(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-lg focus:outline-none focus:border-sky-400"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={calculate} className="flex-1 h-12 rounded-xl glass-btn-accent font-semibold text-sm">
          Calculate
        </button>
        <button onClick={reset} className="px-5 h-12 rounded-xl glass-btn text-slate-300 text-sm font-medium">
          Reset
        </button>
      </div>

      {resultText && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mt-4 text-center font-mono">
          <div className="text-xs text-slate-400 mb-1">Result</div>
          <div
            onClick={() => onCopyText(resultText)}
            className="text-xl sm:text-2xl font-bold text-sky-400 cursor-pointer hover:underline"
            title="Click to copy"
          >
            {resultText}
          </div>
        </div>
      )}
    </div>
  );
};

// Greatest Common Divisor helper for ratio simplifier
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

// 2. Ratio Calculator
export const RatioCalculator: React.FC<ToolCommonProps> = ({ settings, onSaveHistory, onCopyText }) => {
  const [tab, setTab] = useState<'solve' | 'simplify'>('solve');
  // Proportions: a/b = c/d
  const [a, setA] = useState<string>('16');
  const [b, setB] = useState<string>('9');
  const [c, setC] = useState<string>('1920');
  const [d, setD] = useState<string>(''); // Unknown

  // Simplify: x : y
  const [simpA, setSimpA] = useState<string>('1920');
  const [simpB, setSimpB] = useState<string>('1080');
  const [ratioResult, setRatioResult] = useState<string | null>(null);

  const calculateSolve = () => {
    triggerHaptic('light', settings.haptics);
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    const numC = parseFloat(c);
    const numD = parseFloat(d);

    const filledCount = [!isNaN(numA), !isNaN(numB), !isNaN(numC), !isNaN(numD)].filter(Boolean).length;
    if (filledCount !== 3) {
      setRatioResult('Please leave exactly ONE field blank to solve for it.');
      return;
    }

    let solvedVal = 0;
    let solvedVar = '';

    if (isNaN(numA)) {
      solvedVal = (numB * numC) / numD;
      solvedVar = 'A';
    } else if (isNaN(numB)) {
      solvedVal = (numA * numD) / numC;
      solvedVar = 'B';
    } else if (isNaN(numC)) {
      solvedVal = (numA * numD) / numB;
      solvedVar = 'C';
    } else if (isNaN(numD)) {
      solvedVal = (numB * numC) / numA;
      solvedVar = 'D';
    }

    const res = `${solvedVar} = ${formatNumber(solvedVal, 4, settings.numberFormat)}`;
    setRatioResult(res);

    onSaveHistory({
      type: 'tool',
      toolName: 'Ratio Solver',
      expression: `Ratio ${a || '?'}:${b || '?'} = ${c || '?'}:${d || '?'}`,
      result: res,
    });
  };

  const calculateSimplify = () => {
    triggerHaptic('light', settings.haptics);
    const numA = parseFloat(simpA);
    const numB = parseFloat(simpB);

    if (isNaN(numA) || isNaN(numB) || numA === 0 || numB === 0) return;

    // Convert decimal to integers if needed
    let mul = 1;
    while (!Number.isInteger(numA * mul) || !Number.isInteger(numB * mul)) {
      mul *= 10;
      if (mul > 10000) break;
    }

    const intA = Math.round(numA * mul);
    const intB = Math.round(numB * mul);
    const div = gcd(intA, intB);

    const redA = intA / div;
    const redB = intB / div;

    const res = `${redA} : ${redB}`;
    setRatioResult(`Simplified Ratio: ${res} (Decimal: ${(numA / numB).toFixed(4)})`);

    onSaveHistory({
      type: 'tool',
      toolName: 'Ratio Simplifier',
      expression: `${simpA} : ${simpB}`,
      result: res,
    });
  };

  const reset = () => {
    triggerHaptic('light', settings.haptics);
    setA('');
    setB('');
    setC('');
    setD('');
    setSimpA('');
    setSimpB('');
    setRatioResult(null);
  };

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="grid grid-cols-2 p-1 bg-white/5 rounded-2xl border border-white/10 text-xs font-semibold">
        <button
          onClick={() => {
            triggerHaptic('light', settings.haptics);
            setTab('solve');
            setRatioResult(null);
          }}
          className={`py-2 rounded-xl transition ${
            tab === 'solve' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Proportion Solver (A:B = C:D)
        </button>
        <button
          onClick={() => {
            triggerHaptic('light', settings.haptics);
            setTab('simplify');
            setRatioResult(null);
          }}
          className={`py-2 rounded-xl transition ${
            tab === 'simplify' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Simplify Ratio (A : B)
        </button>
      </div>

      {tab === 'solve' ? (
        <div>
          <div className="text-xs text-slate-400 mb-2">
            Leave one field blank and tap Calculate to solve for it:
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="space-y-2 flex-1">
              <input
                type="number"
                value={a}
                onChange={(e) => setA(e.target.value)}
                placeholder="A"
                className="w-full h-12 text-center rounded-xl bg-white/5 border border-white/15 text-white font-mono text-lg focus:outline-none focus:border-sky-400"
              />
              <div className="w-full h-0.5 bg-white/20" />
              <input
                type="number"
                value={b}
                onChange={(e) => setB(e.target.value)}
                placeholder="B"
                className="w-full h-12 text-center rounded-xl bg-white/5 border border-white/15 text-white font-mono text-lg focus:outline-none focus:border-sky-400"
              />
            </div>
            <span className="text-2xl font-bold text-sky-400 px-2">=</span>
            <div className="space-y-2 flex-1">
              <input
                type="number"
                value={c}
                onChange={(e) => setC(e.target.value)}
                placeholder="C"
                className="w-full h-12 text-center rounded-xl bg-white/5 border border-white/15 text-white font-mono text-lg focus:outline-none focus:border-sky-400"
              />
              <div className="w-full h-0.5 bg-white/20" />
              <input
                type="number"
                value={d}
                onChange={(e) => setD(e.target.value)}
                placeholder="D (solve)"
                className="w-full h-12 text-center rounded-xl bg-white/5 border border-white/15 text-white font-mono text-lg focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button onClick={calculateSolve} className="flex-1 h-12 rounded-xl glass-btn-accent font-semibold text-sm">
              Solve Proportion
            </button>
            <button onClick={reset} className="px-5 h-12 rounded-xl glass-btn text-slate-300 text-sm font-medium">
              Reset
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={simpA}
              onChange={(e) => setSimpA(e.target.value)}
              placeholder="e.g. 1920"
              className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-lg focus:outline-none focus:border-sky-400"
            />
            <span className="text-2xl font-bold text-sky-400">:</span>
            <input
              type="number"
              value={simpB}
              onChange={(e) => setSimpB(e.target.value)}
              placeholder="e.g. 1080"
              className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-lg focus:outline-none focus:border-sky-400"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button onClick={calculateSimplify} className="flex-1 h-12 rounded-xl glass-btn-accent font-semibold text-sm">
              Reduce to Lowest Terms
            </button>
            <button onClick={reset} className="px-5 h-12 rounded-xl glass-btn text-slate-300 text-sm font-medium">
              Reset
            </button>
          </div>
        </div>
      )}

      {ratioResult && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mt-4 text-center font-mono">
          <div className="text-xs text-slate-400 mb-1">Result</div>
          <div
            onClick={() => onCopyText(ratioResult)}
            className="text-xl sm:text-2xl font-bold text-sky-400 cursor-pointer hover:underline"
          >
            {ratioResult}
          </div>
        </div>
      )}
    </div>
  );
};
