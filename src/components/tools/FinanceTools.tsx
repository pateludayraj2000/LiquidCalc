import React, { useState } from 'react';
import { AppSettings, HistoryItem } from '../../types';
import { formatNumber } from '../../utils/mathEngine';
import { triggerHaptic } from '../../utils/haptics';

interface ToolCommonProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  onCopyText: (text: string) => void;
}

// 1. GST Calculator
export const GstCalculator: React.FC<ToolCommonProps> = ({ settings, onSaveHistory, onCopyText }) => {
  const [amount, setAmount] = useState<string>('10000');
  const [gstRate, setGstRate] = useState<number>(18);
  const [isInclusive, setIsInclusive] = useState<boolean>(false);
  const [result, setResult] = useState<{
    original: number;
    gstAmount: number;
    cgst: number;
    sgst: number;
    finalAmount: number;
  } | null>(null);

  const calculate = () => {
    triggerHaptic('light', settings.haptics);
    const num = parseFloat(amount);
    if (isNaN(num) || num < 0) return;

    let gstAmount = 0;
    let net = 0;
    let total = 0;

    if (isInclusive) {
      // GST is already inside amount
      net = (num * 100) / (100 + gstRate);
      gstAmount = num - net;
      total = num;
    } else {
      // GST is added to amount
      net = num;
      gstAmount = (num * gstRate) / 100;
      total = num + gstAmount;
    }

    const calculatedResult = {
      original: net,
      gstAmount,
      cgst: gstAmount / 2,
      sgst: gstAmount / 2,
      finalAmount: total,
    };

    setResult(calculatedResult);
    onSaveHistory({
      type: 'tool',
      toolName: 'GST Calculator',
      expression: `${isInclusive ? 'Inclusive' : 'Exclusive'} GST @ ${gstRate}% on ${formatNumber(num, 2, settings.numberFormat)}`,
      result: `Total: ${formatNumber(total, 2, settings.numberFormat)} (GST: ${formatNumber(gstAmount, 2, settings.numberFormat)})`,
    });
  };

  const reset = () => {
    triggerHaptic('light', settings.haptics);
    setAmount('');
    setResult(null);
  };

  return (
    <div className="space-y-4">
      {/* Mode Switcher */}
      <div className="grid grid-cols-2 p-1 bg-white/5 rounded-2xl border border-white/10">
        <button
          onClick={() => {
            triggerHaptic('light', settings.haptics);
            setIsInclusive(false);
          }}
          className={`py-2 text-xs font-semibold rounded-xl transition ${
            !isInclusive ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Add GST (Exclusive)
        </button>
        <button
          onClick={() => {
            triggerHaptic('light', settings.haptics);
            setIsInclusive(true);
          }}
          className={`py-2 text-xs font-semibold rounded-xl transition ${
            isInclusive ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Extract GST (Inclusive)
        </button>
      </div>

      {/* Inputs */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          {isInclusive ? 'Gross Total Amount' : 'Initial Amount'}
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 5000"
          className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-lg focus:outline-none focus:border-sky-400 transition"
        />
      </div>

      {/* Preset Rates */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">GST Rate (%)</label>
        <div className="grid grid-cols-5 gap-2">
          {[3, 5, 12, 18, 28].map((rate) => (
            <button
              key={rate}
              onClick={() => {
                triggerHaptic('light', settings.haptics);
                setGstRate(rate);
              }}
              className={`h-10 rounded-xl font-bold text-xs transition border ${
                gstRate === rate
                  ? 'bg-sky-500 text-white border-sky-400 shadow-md'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {rate}%
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={calculate}
          className="flex-1 h-12 rounded-xl glass-btn-accent font-semibold text-sm"
        >
          Calculate GST
        </button>
        <button
          onClick={reset}
          className="px-5 h-12 rounded-xl glass-btn text-slate-300 text-sm font-medium hover:text-white"
        >
          Reset
        </button>
      </div>

      {/* Formatted Output */}
      {result && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 mt-4 font-mono text-sm">
          <div className="flex justify-between text-slate-400">
            <span>Net / Base Amount:</span>
            <span className="text-white font-semibold">
              {formatNumber(result.original, 2, settings.numberFormat)}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>CGST ({gstRate / 2}%):</span>
            <span className="text-sky-300">
              {formatNumber(result.cgst, 2, settings.numberFormat)}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>SGST ({gstRate / 2}%):</span>
            <span className="text-sky-300">
              {formatNumber(result.sgst, 2, settings.numberFormat)}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Total GST Tax:</span>
            <span className="text-emerald-400 font-semibold">
              {formatNumber(result.gstAmount, 2, settings.numberFormat)}
            </span>
          </div>
          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-base">
            <span className="text-slate-200 font-bold">Total Amount:</span>
            <span
              onClick={() => onCopyText(result.finalAmount.toFixed(2))}
              className="text-white font-extrabold text-lg text-sky-400 cursor-pointer hover:underline"
              title="Click to copy"
            >
              {formatNumber(result.finalAmount, 2, settings.numberFormat)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. Discount Calculator
export const DiscountCalculator: React.FC<ToolCommonProps> = ({ settings, onSaveHistory, onCopyText }) => {
  const [originalPrice, setOriginalPrice] = useState<string>('2499');
  const [discountPercent, setDiscountPercent] = useState<string>('25');
  const [additionalDiscount, setAdditionalDiscount] = useState<string>('5');
  const [taxPercent, setTaxPercent] = useState<string>('0');
  const [result, setResult] = useState<{
    finalPrice: number;
    totalSavings: number;
    effectivePercent: number;
  } | null>(null);

  const calculate = () => {
    triggerHaptic('light', settings.haptics);
    const p = parseFloat(originalPrice);
    const d1 = parseFloat(discountPercent) || 0;
    const d2 = parseFloat(additionalDiscount) || 0;
    const tax = parseFloat(taxPercent) || 0;

    if (isNaN(p) || p < 0) return;

    // First discount
    let current = p * (1 - d1 / 100);
    // Stacked second discount
    current = current * (1 - d2 / 100);
    // Add sales tax if any
    const finalPrice = current * (1 + tax / 100);
    const totalSavings = p - current;
    const effectivePercent = ((p - current) / p) * 100;

    setResult({ finalPrice, totalSavings, effectivePercent });
    onSaveHistory({
      type: 'tool',
      toolName: 'Discount Calculator',
      expression: `${discountPercent}% (+${additionalDiscount}%) off on ${p}`,
      result: `Pay: ${formatNumber(finalPrice, 2, settings.numberFormat)} (Saved: ${formatNumber(totalSavings, 2, settings.numberFormat)})`,
    });
  };

  const reset = () => {
    triggerHaptic('light', settings.haptics);
    setOriginalPrice('');
    setDiscountPercent('');
    setAdditionalDiscount('');
    setTaxPercent('');
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Original Price</label>
        <input
          type="number"
          value={originalPrice}
          onChange={(e) => setOriginalPrice(e.target.value)}
          placeholder="e.g. 1999"
          className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-lg focus:outline-none focus:border-sky-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Discount (%)</label>
          <input
            type="number"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            placeholder="e.g. 20"
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Extra Discount (%)</label>
          <input
            type="number"
            value={additionalDiscount}
            onChange={(e) => setAdditionalDiscount(e.target.value)}
            placeholder="e.g. 5"
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Sales Tax (%) [Optional]</label>
        <input
          type="number"
          value={taxPercent}
          onChange={(e) => setTaxPercent(e.target.value)}
          placeholder="0"
          className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={calculate} className="flex-1 h-12 rounded-xl glass-btn-accent font-semibold text-sm">
          Calculate Savings
        </button>
        <button onClick={reset} className="px-5 h-12 rounded-xl glass-btn text-slate-300 text-sm font-medium">
          Reset
        </button>
      </div>

      {result && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 mt-4 font-mono text-sm">
          <div className="flex justify-between text-slate-400">
            <span>You Save:</span>
            <span className="text-emerald-400 font-bold">
              {formatNumber(result.totalSavings, 2, settings.numberFormat)} ({result.effectivePercent.toFixed(1)}%)
            </span>
          </div>
          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-base">
            <span className="text-slate-200 font-bold">Final Price to Pay:</span>
            <span
              onClick={() => onCopyText(result.finalPrice.toFixed(2))}
              className="text-white font-extrabold text-xl text-sky-400 cursor-pointer"
              title="Click to copy"
            >
              {formatNumber(result.finalPrice, 2, settings.numberFormat)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. EMI Calculator (Loan)
export const EmiCalculator: React.FC<ToolCommonProps> = ({ settings, onSaveHistory, onCopyText }) => {
  const [principal, setPrincipal] = useState<string>('500000');
  const [annualRate, setAnnualRate] = useState<string>('8.5');
  const [tenureYears, setTenureYears] = useState<string>('5');
  const [result, setResult] = useState<{
    monthlyEmi: number;
    totalInterest: number;
    totalPayment: number;
    interestRatio: number;
  } | null>(null);

  const calculate = () => {
    triggerHaptic('light', settings.haptics);
    const p = parseFloat(principal);
    const rYear = parseFloat(annualRate);
    const years = parseFloat(tenureYears);

    if (isNaN(p) || p <= 0 || isNaN(rYear) || rYear < 0 || isNaN(years) || years <= 0) return;

    const n = years * 12; // Total months
    const r = rYear / 12 / 100; // Monthly interest rate

    let emi = 0;
    if (r === 0) {
      emi = p / n;
    } else {
      emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = emi * n;
    const totalInterest = totalPayment - p;
    const interestRatio = (totalInterest / totalPayment) * 100;

    setResult({
      monthlyEmi: emi,
      totalInterest,
      totalPayment,
      interestRatio,
    });

    onSaveHistory({
      type: 'tool',
      toolName: 'Loan EMI Calculator',
      expression: `Principal ${formatNumber(p, 0, settings.numberFormat)} @ ${rYear}% for ${years} yrs`,
      result: `EMI: ${formatNumber(emi, 0, settings.numberFormat)}/mo (Total Int: ${formatNumber(totalInterest, 0, settings.numberFormat)})`,
    });
  };

  const reset = () => {
    triggerHaptic('light', settings.haptics);
    setPrincipal('');
    setAnnualRate('');
    setTenureYears('');
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Loan Amount (Principal)</label>
        <input
          type="number"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          placeholder="e.g. 500000"
          className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-lg focus:outline-none focus:border-sky-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Annual Interest Rate (%)</label>
          <input
            type="number"
            step="0.1"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            placeholder="e.g. 8.5"
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Tenure (Years)</label>
          <input
            type="number"
            value={tenureYears}
            onChange={(e) => setTenureYears(e.target.value)}
            placeholder="e.g. 5"
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={calculate} className="flex-1 h-12 rounded-xl glass-btn-accent font-semibold text-sm">
          Calculate EMI
        </button>
        <button onClick={reset} className="px-5 h-12 rounded-xl glass-btn text-slate-300 text-sm font-medium">
          Reset
        </button>
      </div>

      {result && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 mt-4 font-mono text-sm">
          <div className="flex justify-between items-center text-base">
            <span className="text-slate-200 font-bold">Monthly EMI:</span>
            <span
              onClick={() => onCopyText(result.monthlyEmi.toFixed(2))}
              className="text-emerald-400 font-extrabold text-xl cursor-pointer"
              title="Click to copy"
            >
              {formatNumber(result.monthlyEmi, 2, settings.numberFormat)}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Total Interest Payable:</span>
            <span className="text-rose-300 font-semibold">
              {formatNumber(result.totalInterest, 2, settings.numberFormat)}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Total Payment (Principal + Int):</span>
            <span className="text-white font-semibold">
              {formatNumber(result.totalPayment, 2, settings.numberFormat)}
            </span>
          </div>

          {/* Breakdown progress bar */}
          <div className="pt-2">
            <div className="text-[11px] text-slate-400 flex justify-between mb-1">
              <span>Principal: {(100 - result.interestRatio).toFixed(1)}%</span>
              <span>Interest: {result.interestRatio.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex">
              <div
                className="h-full bg-sky-400"
                style={{ width: `${100 - result.interestRatio}%` }}
              />
              <div
                className="h-full bg-rose-400"
                style={{ width: `${result.interestRatio}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. Simple Interest Calculator
export const SimpleInterestCalculator: React.FC<ToolCommonProps> = ({ settings, onSaveHistory, onCopyText }) => {
  const [principal, setPrincipal] = useState<string>('100000');
  const [rate, setRate] = useState<string>('7');
  const [time, setTime] = useState<string>('3');
  const [result, setResult] = useState<{ interest: number; total: number } | null>(null);

  const calculate = () => {
    triggerHaptic('light', settings.haptics);
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseFloat(time);

    if (isNaN(p) || isNaN(r) || isNaN(t)) return;

    const interest = (p * r * t) / 100;
    const total = p + interest;

    setResult({ interest, total });
    onSaveHistory({
      type: 'tool',
      toolName: 'Simple Interest',
      expression: `${p} @ ${r}% for ${t} years`,
      result: `Interest: ${formatNumber(interest, 2, settings.numberFormat)}, Total: ${formatNumber(total, 2, settings.numberFormat)}`,
    });
  };

  const reset = () => {
    triggerHaptic('light', settings.haptics);
    setPrincipal('');
    setRate('');
    setTime('');
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Principal Amount</label>
        <input
          type="number"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          placeholder="e.g. 50000"
          className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-lg focus:outline-none focus:border-sky-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Annual Rate (%)</label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g. 7"
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Time (Years)</label>
          <input
            type="number"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="e.g. 3"
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={calculate} className="flex-1 h-12 rounded-xl glass-btn-accent font-semibold text-sm">
          Calculate Interest
        </button>
        <button onClick={reset} className="px-5 h-12 rounded-xl glass-btn text-slate-300 text-sm font-medium">
          Reset
        </button>
      </div>

      {result && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 mt-4 font-mono text-sm">
          <div className="flex justify-between text-slate-400">
            <span>Simple Interest Earned:</span>
            <span className="text-emerald-400 font-bold">
              {formatNumber(result.interest, 2, settings.numberFormat)}
            </span>
          </div>
          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-base">
            <span className="text-slate-200 font-bold">Total Maturity Amount:</span>
            <span
              onClick={() => onCopyText(result.total.toFixed(2))}
              className="text-white font-extrabold text-xl text-sky-400 cursor-pointer"
            >
              {formatNumber(result.total, 2, settings.numberFormat)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. Compound Interest Calculator
export const CompoundInterestCalculator: React.FC<ToolCommonProps> = ({ settings, onSaveHistory, onCopyText }) => {
  const [principal, setPrincipal] = useState<string>('100000');
  const [rate, setRate] = useState<string>('8');
  const [years, setYears] = useState<string>('5');
  const [frequency, setFrequency] = useState<number>(12); // monthly compounding default
  const [monthlyContribution, setMonthlyContribution] = useState<string>('5000');
  const [result, setResult] = useState<{
    futureValue: number;
    totalInvested: number;
    interestEarned: number;
  } | null>(null);

  const calculate = () => {
    triggerHaptic('light', settings.haptics);
    const p = parseFloat(principal) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const t = parseFloat(years) || 0;
    const pmt = parseFloat(monthlyContribution) || 0;
    const n = frequency;

    if (t <= 0) return;

    // Compound on lump sum: P * (1 + r/n)^(n*t)
    const lumpSumFV = p * Math.pow(1 + r / n, n * t);

    // Compound on regular monthly addition
    let pmtFV = 0;
    if (pmt > 0 && r > 0) {
      // monthly rate
      const monthlyRate = r / 12;
      const totalMonths = t * 12;
      pmtFV = pmt * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    } else if (pmt > 0) {
      pmtFV = pmt * (t * 12);
    }

    const futureValue = lumpSumFV + pmtFV;
    const totalInvested = p + pmt * (t * 12);
    const interestEarned = futureValue - totalInvested;

    setResult({ futureValue, totalInvested, interestEarned });
    onSaveHistory({
      type: 'tool',
      toolName: 'Compound Interest',
      expression: `${p} lump + ${pmt}/mo @ ${rate}% for ${years} yrs`,
      result: `Future Value: ${formatNumber(futureValue, 2, settings.numberFormat)} (Interest: ${formatNumber(interestEarned, 2, settings.numberFormat)})`,
    });
  };

  const reset = () => {
    triggerHaptic('light', settings.haptics);
    setPrincipal('');
    setRate('');
    setYears('');
    setMonthlyContribution('');
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Initial Principal</label>
        <input
          type="number"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          placeholder="e.g. 100000"
          className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-lg focus:outline-none focus:border-sky-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Annual Interest Rate (%)</label>
          <input
            type="number"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g. 8"
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Years to Grow</label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="e.g. 5"
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Monthly Contribution</label>
          <input
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            placeholder="e.g. 5000"
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Compounding Interval</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(parseInt(e.target.value))}
            className="w-full h-12 px-3 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-sky-400"
          >
            <option value={1}>Annually (1/yr)</option>
            <option value={2}>Semi-Annually (2/yr)</option>
            <option value={4}>Quarterly (4/yr)</option>
            <option value={12}>Monthly (12/yr)</option>
            <option value={365}>Daily (365/yr)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={calculate} className="flex-1 h-12 rounded-xl glass-btn-accent font-semibold text-sm">
          Calculate Growth
        </button>
        <button onClick={reset} className="px-5 h-12 rounded-xl glass-btn text-slate-300 text-sm font-medium">
          Reset
        </button>
      </div>

      {result && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 mt-4 font-mono text-sm">
          <div className="flex justify-between text-slate-400">
            <span>Total Invested:</span>
            <span className="text-white font-semibold">
              {formatNumber(result.totalInvested, 2, settings.numberFormat)}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Compound Interest:</span>
            <span className="text-emerald-400 font-bold">
              +{formatNumber(result.interestEarned, 2, settings.numberFormat)}
            </span>
          </div>
          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-base">
            <span className="text-slate-200 font-bold">Future Maturity Value:</span>
            <span
              onClick={() => onCopyText(result.futureValue.toFixed(2))}
              className="text-white font-extrabold text-xl text-sky-400 cursor-pointer"
            >
              {formatNumber(result.futureValue, 2, settings.numberFormat)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// 6. Tip Calculator
export const TipCalculator: React.FC<ToolCommonProps> = ({ settings, onSaveHistory, onCopyText }) => {
  const [bill, setBill] = useState<string>('1250');
  const [tipRate, setTipRate] = useState<number>(15);
  const [splitCount, setSplitCount] = useState<number>(2);
  const [result, setResult] = useState<{
    tipAmount: number;
    totalAmount: number;
    amountPerPerson: number;
    tipPerPerson: number;
  } | null>(null);

  const calculate = () => {
    triggerHaptic('light', settings.haptics);
    const b = parseFloat(bill);
    const count = Math.max(1, splitCount);

    if (isNaN(b) || b <= 0) return;

    const tipAmount = (b * tipRate) / 100;
    const totalAmount = b + tipAmount;
    const amountPerPerson = totalAmount / count;
    const tipPerPerson = tipAmount / count;

    setResult({ tipAmount, totalAmount, amountPerPerson, tipPerPerson });
    onSaveHistory({
      type: 'tool',
      toolName: 'Tip & Split',
      expression: `${tipRate}% tip on ${b} split ${count} ways`,
      result: `Per Person: ${formatNumber(amountPerPerson, 2, settings.numberFormat)} (Total: ${formatNumber(totalAmount, 2, settings.numberFormat)})`,
    });
  };

  const reset = () => {
    triggerHaptic('light', settings.haptics);
    setBill('');
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Bill Amount</label>
        <input
          type="number"
          value={bill}
          onChange={(e) => setBill(e.target.value)}
          placeholder="e.g. 1500"
          className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-lg focus:outline-none focus:border-sky-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Tip Percentage (%)</label>
        <div className="grid grid-cols-5 gap-2">
          {[5, 10, 15, 18, 20].map((rate) => (
            <button
              key={rate}
              onClick={() => {
                triggerHaptic('light', settings.haptics);
                setTipRate(rate);
              }}
              className={`h-10 rounded-xl font-bold text-xs transition border ${
                tipRate === rate
                  ? 'bg-sky-500 text-white border-sky-400'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {rate}%
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Split Between People</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              triggerHaptic('light', settings.haptics);
              setSplitCount((prev) => Math.max(1, prev - 1));
            }}
            className="w-12 h-12 rounded-xl glass-btn text-lg font-bold text-white flex items-center justify-center"
          >
            -
          </button>
          <div className="flex-1 h-12 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center font-mono font-bold text-lg text-white">
            {splitCount} {splitCount === 1 ? 'person' : 'people'}
          </div>
          <button
            onClick={() => {
              triggerHaptic('light', settings.haptics);
              setSplitCount((prev) => prev + 1);
            }}
            className="w-12 h-12 rounded-xl glass-btn text-lg font-bold text-white flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={calculate} className="flex-1 h-12 rounded-xl glass-btn-accent font-semibold text-sm">
          Calculate Tip
        </button>
        <button onClick={reset} className="px-5 h-12 rounded-xl glass-btn text-slate-300 text-sm font-medium">
          Reset
        </button>
      </div>

      {result && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 mt-4 font-mono text-sm">
          <div className="flex justify-between items-center text-base">
            <span className="text-slate-200 font-bold">Each Person Pays:</span>
            <span
              onClick={() => onCopyText(result.amountPerPerson.toFixed(2))}
              className="text-emerald-400 font-extrabold text-2xl cursor-pointer"
            >
              {formatNumber(result.amountPerPerson, 2, settings.numberFormat)}
            </span>
          </div>
          <div className="flex justify-between text-slate-400 text-xs">
            <span>(Includes {formatNumber(result.tipPerPerson, 2, settings.numberFormat)} tip per person)</span>
          </div>
          <div className="pt-2 border-t border-white/10 flex justify-between text-slate-400">
            <span>Total Tip:</span>
            <span className="text-white font-semibold">
              {formatNumber(result.tipAmount, 2, settings.numberFormat)}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Total Bill:</span>
            <span className="text-white font-semibold">
              {formatNumber(result.totalAmount, 2, settings.numberFormat)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
