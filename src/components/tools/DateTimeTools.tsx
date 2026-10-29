import React, { useState } from 'react';
import { AppSettings, HistoryItem } from '../../types';
import { formatNumber } from '../../utils/mathEngine';
import { triggerHaptic } from '../../utils/haptics';

interface ToolCommonProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  onCopyText: (text: string) => void;
}

// 1. Age Calculator
export const AgeCalculator: React.FC<ToolCommonProps> = ({ settings, onSaveHistory, onCopyText }) => {
  const [birthDate, setBirthDate] = useState<string>('2000-01-01');
  const [refDate, setRefDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState<{
    years: number;
    months: number;
    days: number;
    nextBirthdayDays: number;
    totalDays: number;
    totalWeeks: number;
    bornDay: string;
  } | null>(null);

  const calculate = () => {
    triggerHaptic('light', settings.haptics);
    if (!birthDate) return;

    const b = new Date(birthDate);
    const r = new Date(refDate || new Date().toISOString().split('T')[0]);

    if (b > r) return;

    let years = r.getFullYear() - b.getFullYear();
    let months = r.getMonth() - b.getMonth();
    let days = r.getDate() - b.getDate();

    if (days < 0) {
      months--;
      // Days in previous month of ref
      const prevMonth = new Date(r.getFullYear(), r.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // Next birthday countdown
    const nextBday = new Date(r.getFullYear(), b.getMonth(), b.getDate());
    if (nextBday < r) {
      nextBday.setFullYear(r.getFullYear() + 1);
    }
    const msPerDay = 1000 * 60 * 60 * 24;
    const nextBirthdayDays = Math.ceil((nextBday.getTime() - r.getTime()) / msPerDay);

    const totalDays = Math.floor((r.getTime() - b.getTime()) / msPerDay);
    const totalWeeks = Math.floor(totalDays / 7);

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bornDay = weekdays[b.getDay()];

    const resObj = {
      years,
      months,
      days,
      nextBirthdayDays,
      totalDays,
      totalWeeks,
      bornDay,
    };

    setResult(resObj);
    onSaveHistory({
      type: 'tool',
      toolName: 'Age Calculator',
      expression: `Born on ${birthDate}`,
      result: `${years} yrs, ${months} mos, ${days} days old`,
    });
  };

  const reset = () => {
    triggerHaptic('light', settings.haptics);
    setBirthDate('');
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Date of Birth</label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Calculate Age As Of</label>
        <input
          type="date"
          value={refDate}
          onChange={(e) => setRefDate(e.target.value)}
          className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={calculate} className="flex-1 h-12 rounded-xl glass-btn-accent font-semibold text-sm">
          Calculate Age
        </button>
        <button onClick={reset} className="px-5 h-12 rounded-xl glass-btn text-slate-300 text-sm font-medium">
          Reset
        </button>
      </div>

      {result && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 mt-4 font-mono text-sm">
          <div className="text-center py-2 bg-white/5 rounded-xl border border-white/10">
            <span className="text-xs text-slate-400 block mb-0.5">Exact Age</span>
            <span
              onClick={() => onCopyText(`${result.years} years, ${result.months} months, ${result.days} days`)}
              className="text-2xl font-extrabold text-sky-400 cursor-pointer"
            >
              {result.years}y {result.months}m {result.days}d
            </span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Next Birthday In:</span>
            <span className="text-emerald-400 font-bold">{result.nextBirthdayDays} days</span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Day Born:</span>
            <span className="text-white font-semibold">{result.bornDay}</span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Total Days Lived:</span>
            <span className="text-white font-semibold">
              {formatNumber(result.totalDays, 0, settings.numberFormat)} days ({result.totalWeeks} wks)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. Date Difference Calculator
export const DateDifferenceCalculator: React.FC<ToolCommonProps> = ({ settings, onSaveHistory, onCopyText }) => {
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');
  const [result, setResult] = useState<{
    totalDays: number;
    businessDays: number;
    weeks: number;
    remainingDays: number;
    months: number;
  } | null>(null);

  const calculate = () => {
    triggerHaptic('light', settings.haptics);
    if (!startDate || !endDate) return;

    const s = new Date(startDate);
    const e = new Date(endDate);

    const diffMs = Math.abs(e.getTime() - s.getTime());
    const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    // Calculate business days (Monday-Friday)
    let businessDays = 0;
    const cur = new Date(Math.min(s.getTime(), e.getTime()));
    const target = new Date(Math.max(s.getTime(), e.getTime()));

    while (cur < target) {
      cur.setDate(cur.getDate() + 1);
      const day = cur.getDay();
      if (day !== 0 && day !== 6) {
        businessDays++;
      }
    }

    const weeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;
    const months = parseFloat((totalDays / 30.4375).toFixed(1));

    setResult({ totalDays, businessDays, weeks, remainingDays, months });

    onSaveHistory({
      type: 'tool',
      toolName: 'Date Difference',
      expression: `${startDate} to ${endDate}`,
      result: `${totalDays} days (${businessDays} business days)`,
    });
  };

  const reset = () => {
    triggerHaptic('light', settings.haptics);
    setStartDate('');
    setEndDate('');
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={calculate} className="flex-1 h-12 rounded-xl glass-btn-accent font-semibold text-sm">
          Calculate Difference
        </button>
        <button onClick={reset} className="px-5 h-12 rounded-xl glass-btn text-slate-300 text-sm font-medium">
          Reset
        </button>
      </div>

      {result && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 mt-4 font-mono text-sm">
          <div className="flex justify-between items-center text-base">
            <span className="text-slate-200 font-bold">Total Days:</span>
            <span
              onClick={() => onCopyText(`${result.totalDays} days`)}
              className="text-emerald-400 font-extrabold text-2xl cursor-pointer"
            >
              {formatNumber(result.totalDays, 0, settings.numberFormat)} days
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Business / Working Days:</span>
            <span className="text-sky-300 font-semibold">{result.businessDays} days</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>In Weeks & Days:</span>
            <span className="text-white font-semibold">
              {result.weeks} weeks, {result.remainingDays} days
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Approx Months:</span>
            <span className="text-white font-semibold">{result.months} months</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. Time Duration Calculator
export const TimeDurationCalculator: React.FC<ToolCommonProps> = ({ settings, onSaveHistory, onCopyText }) => {
  const [startTime, setStartTime] = useState<string>('09:30');
  const [endTime, setEndTime] = useState<string>('18:15');
  const [result, setResult] = useState<{
    hours: number;
    minutes: number;
    decimalHours: number;
    totalSeconds: number;
  } | null>(null);

  const calculate = () => {
    triggerHaptic('light', settings.haptics);
    if (!startTime || !endTime) return;

    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);

    let startTotalMins = sh * 60 + sm;
    let endTotalMins = eh * 60 + em;

    if (endTotalMins < startTotalMins) {
      // Crossed midnight
      endTotalMins += 24 * 60;
    }

    const diffMins = endTotalMins - startTotalMins;
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    const decimalHours = parseFloat((diffMins / 60).toFixed(2));
    const totalSeconds = diffMins * 60;

    setResult({ hours, minutes, decimalHours, totalSeconds });
    onSaveHistory({
      type: 'tool',
      toolName: 'Time Duration',
      expression: `${startTime} to ${endTime}`,
      result: `${hours}h ${minutes}m (${decimalHours} hrs)`,
    });
  };

  const reset = () => {
    triggerHaptic('light', settings.haptics);
    setStartTime('');
    setEndTime('');
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={calculate} className="flex-1 h-12 rounded-xl glass-btn-accent font-semibold text-sm">
          Calculate Duration
        </button>
        <button onClick={reset} className="px-5 h-12 rounded-xl glass-btn text-slate-300 text-sm font-medium">
          Reset
        </button>
      </div>

      {result && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 mt-4 font-mono text-sm">
          <div className="flex justify-between items-center text-base">
            <span className="text-slate-200 font-bold">Elapsed Time:</span>
            <span
              onClick={() => onCopyText(`${result.hours}h ${result.minutes}m`)}
              className="text-emerald-400 font-extrabold text-2xl cursor-pointer"
            >
              {result.hours}h {result.minutes}m
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Decimal Hours:</span>
            <span className="text-sky-300 font-semibold">{result.decimalHours} hrs</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Total Minutes:</span>
            <span className="text-white font-semibold">
              {formatNumber(result.hours * 60 + result.minutes, 0, settings.numberFormat)} min
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
