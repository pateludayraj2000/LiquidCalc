import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { AppSettings, HistoryItem } from '../../types';
import { formatNumber } from '../../utils/mathEngine';
import { triggerHaptic } from '../../utils/haptics';

interface ToolCommonProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  onCopyText: (text: string) => void;
}

// Generic Converter Builder Component for ratio-based units
interface UnitDef {
  id: string;
  label: string;
  rateToBase: number; // Multiplier to reach base unit
}

function createConverterComponent(
  title: string,
  units: UnitDef[],
  defaultFrom: string,
  defaultTo: string
) {
  return function Converter({ settings, onSaveHistory, onCopyText }: ToolCommonProps) {
    const [val, setVal] = useState<string>('1');
    const [fromUnit, setFromUnit] = useState<string>(defaultFrom);
    const [toUnit, setToUnit] = useState<string>(defaultTo);
    const [result, setResult] = useState<number | null>(null);

    const convert = () => {
      triggerHaptic('light', settings.haptics);
      const num = parseFloat(val);
      if (isNaN(num)) return;

      const fromDef = units.find((u) => u.id === fromUnit);
      const toDef = units.find((u) => u.id === toUnit);
      if (!fromDef || !toDef) return;

      // Base value = num * fromDef.rateToBase
      const inBase = num * fromDef.rateToBase;
      // Target value = inBase / toDef.rateToBase
      const converted = inBase / toDef.rateToBase;

      setResult(converted);
      onSaveHistory({
        type: 'tool',
        toolName: title,
        expression: `${val} ${fromDef.label}`,
        result: `${formatNumber(converted, settings.precision, settings.numberFormat)} ${toDef.label}`,
      });
    };

    const swap = () => {
      triggerHaptic('light', settings.haptics);
      const temp = fromUnit;
      setFromUnit(toUnit);
      setToUnit(temp);
      setResult(null);
    };

    const reset = () => {
      triggerHaptic('light', settings.haptics);
      setVal('1');
      setResult(null);
    };

    const fromLabel = units.find((u) => u.id === fromUnit)?.label || fromUnit;
    const toLabel = units.find((u) => u.id === toUnit)?.label || toUnit;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Value to Convert</label>
          <input
            type="number"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-lg focus:outline-none focus:border-sky-400"
          />
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">From</label>
            <select
              value={fromUnit}
              onChange={(e) => {
                setFromUnit(e.target.value);
                setResult(null);
              }}
              className="w-full h-12 px-3 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-sky-400"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-5">
            <button
              onClick={swap}
              title="Swap units"
              className="p-3 rounded-xl glass-btn text-slate-300 hover:text-white"
            >
              <ArrowUpDown size={18} />
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">To</label>
            <select
              value={toUnit}
              onChange={(e) => {
                setToUnit(e.target.value);
                setResult(null);
              }}
              className="w-full h-12 px-3 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-sky-400"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={convert} className="flex-1 h-12 rounded-xl glass-btn-accent font-semibold text-sm">
            Convert
          </button>
          <button onClick={reset} className="px-5 h-12 rounded-xl glass-btn text-slate-300 text-sm font-medium">
            Reset
          </button>
        </div>

        {result !== null && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mt-4 text-center font-mono">
            <div className="text-xs text-slate-400 mb-1">
              {val} {fromLabel} =
            </div>
            <div
              onClick={() => onCopyText(result.toString())}
              className="text-2xl font-extrabold text-sky-400 cursor-pointer hover:underline"
              title="Click to copy"
            >
              {formatNumber(result, settings.precision, settings.numberFormat)} {toLabel}
            </div>
          </div>
        )}
      </div>
    );
  };
}

// 1. Length Converter (Base: Meter)
export const LengthConverter = createConverterComponent(
  'Length Converter',
  [
    { id: 'm', label: 'Meters (m)', rateToBase: 1 },
    { id: 'km', label: 'Kilometers (km)', rateToBase: 1000 },
    { id: 'cm', label: 'Centimeters (cm)', rateToBase: 0.01 },
    { id: 'mm', label: 'Millimeters (mm)', rateToBase: 0.001 },
    { id: 'mi', label: 'Miles (mi)', rateToBase: 1609.344 },
    { id: 'yd', label: 'Yards (yd)', rateToBase: 0.9144 },
    { id: 'ft', label: 'Feet (ft)', rateToBase: 0.3048 },
    { id: 'in', label: 'Inches (in)', rateToBase: 0.0254 },
    { id: 'nmi', label: 'Nautical Miles (nmi)', rateToBase: 1852 },
  ],
  'km',
  'mi'
);

// 2. Weight Converter (Base: Kilogram)
export const WeightConverter = createConverterComponent(
  'Weight Converter',
  [
    { id: 'kg', label: 'Kilograms (kg)', rateToBase: 1 },
    { id: 'g', label: 'Grams (g)', rateToBase: 0.001 },
    { id: 'mg', label: 'Milligrams (mg)', rateToBase: 0.000001 },
    { id: 't', label: 'Metric Tons (t)', rateToBase: 1000 },
    { id: 'lb', label: 'Pounds (lb)', rateToBase: 0.45359237 },
    { id: 'oz', label: 'Ounces (oz)', rateToBase: 0.028349523125 },
    { id: 'st', label: 'Stone (st)', rateToBase: 6.35029318 },
  ],
  'kg',
  'lb'
);

// 3. Area Converter (Base: Square Meter)
export const AreaConverter = createConverterComponent(
  'Area Converter',
  [
    { id: 'sqm', label: 'Square Meters (m²)', rateToBase: 1 },
    { id: 'sqkm', label: 'Square Kilometers (km²)', rateToBase: 1000000 },
    { id: 'sqft', label: 'Square Feet (ft²)', rateToBase: 0.092903 },
    { id: 'sqyd', label: 'Square Yards (yd²)', rateToBase: 0.836127 },
    { id: 'acre', label: 'Acres', rateToBase: 4046.8564224 },
    { id: 'hectare', label: 'Hectares (ha)', rateToBase: 10000 },
    { id: 'sqmi', label: 'Square Miles (mi²)', rateToBase: 2589988.11 },
  ],
  'sqft',
  'sqm'
);

// 4. Volume Converter (Base: Liter)
export const VolumeConverter = createConverterComponent(
  'Volume Converter',
  [
    { id: 'l', label: 'Liters (L)', rateToBase: 1 },
    { id: 'ml', label: 'Milliliters (mL)', rateToBase: 0.001 },
    { id: 'gal_us', label: 'Gallons (US)', rateToBase: 3.78541 },
    { id: 'gal_uk', label: 'Gallons (UK)', rateToBase: 4.54609 },
    { id: 'qt', label: 'Quarts (US)', rateToBase: 0.946353 },
    { id: 'pt', label: 'Pints (US)', rateToBase: 0.473176 },
    { id: 'cup', label: 'Cups (US)', rateToBase: 0.24 },
    { id: 'floz', label: 'Fluid Ounces (fl oz)', rateToBase: 0.0295735 },
    { id: 'cbm', label: 'Cubic Meters (m³)', rateToBase: 1000 },
  ],
  'gal_us',
  'l'
);

// 5. Speed Converter (Base: km/h)
export const SpeedConverter = createConverterComponent(
  'Speed Converter',
  [
    { id: 'kmh', label: 'Kilometers/hour (km/h)', rateToBase: 1 },
    { id: 'mph', label: 'Miles/hour (mph)', rateToBase: 1.609344 },
    { id: 'ms', label: 'Meters/second (m/s)', rateToBase: 3.6 },
    { id: 'knot', label: 'Knots (kn)', rateToBase: 1.852 },
    { id: 'mach', label: 'Mach (at sea level)', rateToBase: 1225.044 },
  ],
  'kmh',
  'mph'
);

// 6. Data Storage Converter (Base: Byte)
export const DataStorageConverter: React.FC<ToolCommonProps> = ({ settings, onSaveHistory, onCopyText }) => {
  const [val, setVal] = useState<string>('1');
  const [isBinary, setIsBinary] = useState<boolean>(true); // 1024 vs 1000
  const [fromUnit, setFromUnit] = useState<string>('GB');
  const [toUnit, setToUnit] = useState<string>('MB');
  const [result, setResult] = useState<number | null>(null);

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const base = isBinary ? 1024 : 1000;

  const convert = () => {
    triggerHaptic('light', settings.haptics);
    const num = parseFloat(val);
    if (isNaN(num)) return;

    const fromIndex = units.indexOf(fromUnit);
    const toIndex = units.indexOf(toUnit);
    if (fromIndex === -1 || toIndex === -1) return;

    // Converted = num * (base ^ (fromIndex - toIndex))
    const exp = fromIndex - toIndex;
    const converted = num * Math.pow(base, exp);

    setResult(converted);
    onSaveHistory({
      type: 'tool',
      toolName: 'Data Storage Converter',
      expression: `${val} ${fromUnit} (${isBinary ? 'Binary 1024' : 'Decimal 1000'})`,
      result: `${formatNumber(converted, settings.precision, settings.numberFormat)} ${toUnit}`,
    });
  };

  const swap = () => {
    triggerHaptic('light', settings.haptics);
    const t = fromUnit;
    setFromUnit(toUnit);
    setToUnit(t);
    setResult(null);
  };

  return (
    <div className="space-y-4">
      {/* 1024 vs 1000 toggle */}
      <div className="grid grid-cols-2 p-1 bg-white/5 rounded-2xl border border-white/10 text-xs font-semibold">
        <button
          onClick={() => {
            triggerHaptic('light', settings.haptics);
            setIsBinary(true);
            setResult(null);
          }}
          className={`py-2 rounded-xl transition ${
            isBinary ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Binary (1024: KiB, MiB, GiB)
        </button>
        <button
          onClick={() => {
            triggerHaptic('light', settings.haptics);
            setIsBinary(false);
            setResult(null);
          }}
          className={`py-2 rounded-xl transition ${
            !isBinary ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Decimal (1000: KB, MB, GB)
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Value</label>
        <input
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-lg focus:outline-none focus:border-sky-400"
        />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">From</label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full h-12 px-3 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-sky-400"
          >
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-5">
          <button onClick={swap} className="p-3 rounded-xl glass-btn text-slate-300 hover:text-white">
            <ArrowUpDown size={18} />
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">To</label>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full h-12 px-3 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-sky-400"
          >
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={convert} className="flex-1 h-12 rounded-xl glass-btn-accent font-semibold text-sm">
          Convert Storage
        </button>
      </div>

      {result !== null && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mt-4 text-center font-mono">
          <div className="text-xs text-slate-400 mb-1">
            {val} {fromUnit} =
          </div>
          <div
            onClick={() => onCopyText(result.toString())}
            className="text-2xl font-extrabold text-sky-400 cursor-pointer hover:underline"
          >
            {formatNumber(result, settings.precision, settings.numberFormat)} {toUnit}
          </div>
        </div>
      )}
    </div>
  );
};

// 7. Temperature Converter (Special Formulas)
export const TemperatureConverter: React.FC<ToolCommonProps> = ({ settings, onSaveHistory, onCopyText }) => {
  const [val, setVal] = useState<string>('25');
  const [fromScale, setFromScale] = useState<'C' | 'F' | 'K' | 'R'>('C');
  const [result, setResult] = useState<{
    celsius: number;
    fahrenheit: number;
    kelvin: number;
    rankine: number;
  } | null>(null);

  const calculate = () => {
    triggerHaptic('light', settings.haptics);
    const num = parseFloat(val);
    if (isNaN(num)) return;

    // Convert everything to Celsius first
    let c = 0;
    if (fromScale === 'C') c = num;
    else if (fromScale === 'F') c = (num - 32) * (5 / 9);
    else if (fromScale === 'K') c = num - 273.15;
    else if (fromScale === 'R') c = (num - 491.67) * (5 / 9);

    const f = c * (9 / 5) + 32;
    const k = c + 273.15;
    const r = (c + 273.15) * (9 / 5);

    setResult({ celsius: c, fahrenheit: f, kelvin: k, rankine: r });

    onSaveHistory({
      type: 'tool',
      toolName: 'Temperature Converter',
      expression: `${val}°${fromScale}`,
      result: `${c.toFixed(2)}°C = ${f.toFixed(2)}°F = ${k.toFixed(2)}K`,
    });
  };

  const reset = () => {
    triggerHaptic('light', settings.haptics);
    setVal('');
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Temperature Value</label>
        <input
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-lg focus:outline-none focus:border-sky-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Input Scale</label>
        <div className="grid grid-cols-4 gap-2">
          {(['C', 'F', 'K', 'R'] as const).map((scale) => (
            <button
              key={scale}
              onClick={() => {
                triggerHaptic('light', settings.haptics);
                setFromScale(scale);
                setResult(null);
              }}
              className={`h-11 rounded-xl font-bold text-sm transition border ${
                fromScale === scale
                  ? 'bg-sky-500 text-white border-sky-400'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              °{scale}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={calculate} className="flex-1 h-12 rounded-xl glass-btn-accent font-semibold text-sm">
          Convert Temperature
        </button>
        <button onClick={reset} className="px-5 h-12 rounded-xl glass-btn text-slate-300 text-sm font-medium">
          Reset
        </button>
      </div>

      {result && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 mt-4 font-mono text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Celsius:</span>
            <span
              onClick={() => onCopyText(`${result.celsius.toFixed(2)} °C`)}
              className="text-white font-bold cursor-pointer hover:underline"
            >
              {result.celsius.toFixed(2)} °C
            </span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Fahrenheit:</span>
            <span
              onClick={() => onCopyText(`${result.fahrenheit.toFixed(2)} °F`)}
              className="text-white font-bold cursor-pointer hover:underline"
            >
              {result.fahrenheit.toFixed(2)} °F
            </span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Kelvin:</span>
            <span
              onClick={() => onCopyText(`${result.kelvin.toFixed(2)} K`)}
              className="text-white font-bold cursor-pointer hover:underline"
            >
              {result.kelvin.toFixed(2)} K
            </span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Rankine:</span>
            <span
              onClick={() => onCopyText(`${result.rankine.toFixed(2)} °R`)}
              className="text-white font-bold cursor-pointer hover:underline"
            >
              {result.rankine.toFixed(2)} °R
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
