import React, { useState } from 'react';
import { AppSettings, HistoryItem } from '../../types';
import { formatNumber } from '../../utils/mathEngine';
import { triggerHaptic } from '../../utils/haptics';

interface ToolCommonProps {
  settings: AppSettings;
  onSaveHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  onCopyText: (text: string) => void;
}

// 1. BMI Calculator
export const BmiCalculator: React.FC<ToolCommonProps> = ({ settings, onSaveHistory, onCopyText }) => {
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  // Metric: cm, kg
  const [heightCm, setHeightCm] = useState<string>('175');
  const [weightKg, setWeightKg] = useState<string>('70');
  // Imperial: ft, in, lbs
  const [heightFt, setHeightFt] = useState<string>('5');
  const [heightIn, setHeightIn] = useState<string>('9');
  const [weightLbs, setWeightLbs] = useState<string>('154');

  const [result, setResult] = useState<{
    bmi: number;
    category: string;
    categoryColor: string;
    idealWeightRange: string;
  } | null>(null);

  const calculate = () => {
    triggerHaptic('light', settings.haptics);
    let hMeters = 0;
    let wKg = 0;

    if (unitSystem === 'metric') {
      const cm = parseFloat(heightCm);
      const kg = parseFloat(weightKg);
      if (isNaN(cm) || isNaN(kg) || cm <= 0 || kg <= 0) return;
      hMeters = cm / 100;
      wKg = kg;
    } else {
      const ft = parseFloat(heightFt) || 0;
      const inch = parseFloat(heightIn) || 0;
      const lbs = parseFloat(weightLbs);
      if (isNaN(lbs) || (ft === 0 && inch === 0) || lbs <= 0) return;
      const totalInches = ft * 12 + inch;
      hMeters = totalInches * 0.0254;
      wKg = lbs * 0.45359237;
    }

    const bmi = wKg / (hMeters * hMeters);

    let category = 'Normal weight';
    let categoryColor = 'text-emerald-400';

    if (bmi < 18.5) {
      category = 'Underweight';
      categoryColor = 'text-sky-400';
    } else if (bmi < 25) {
      category = 'Normal weight';
      categoryColor = 'text-emerald-400';
    } else if (bmi < 30) {
      category = 'Overweight';
      categoryColor = 'text-amber-400';
    } else {
      category = 'Obesity';
      categoryColor = 'text-rose-400';
    }

    // Healthy weight range (BMI 18.5 - 24.9)
    const minHealthyKg = 18.5 * (hMeters * hMeters);
    const maxHealthyKg = 24.9 * (hMeters * hMeters);

    let idealRange = '';
    if (unitSystem === 'metric') {
      idealRange = `${minHealthyKg.toFixed(1)} kg - ${maxHealthyKg.toFixed(1)} kg`;
    } else {
      const minLbs = minHealthyKg * 2.20462;
      const maxLbs = maxHealthyKg * 2.20462;
      idealRange = `${minLbs.toFixed(1)} lbs - ${maxLbs.toFixed(1)} lbs`;
    }

    setResult({
      bmi: parseFloat(bmi.toFixed(1)),
      category,
      categoryColor,
      idealWeightRange: idealRange,
    });

    onSaveHistory({
      type: 'tool',
      toolName: 'BMI Calculator',
      expression: `${unitSystem === 'metric' ? `${heightCm}cm, ${weightKg}kg` : `${heightFt}'${heightIn}", ${weightLbs}lbs`}`,
      result: `BMI: ${bmi.toFixed(1)} (${category})`,
    });
  };

  const reset = () => {
    triggerHaptic('light', settings.haptics);
    setHeightCm('');
    setWeightKg('');
    setWeightLbs('');
    setResult(null);
  };

  return (
    <div className="space-y-4">
      {/* Unit system toggle */}
      <div className="grid grid-cols-2 p-1 bg-white/5 rounded-2xl border border-white/10 text-xs font-semibold">
        <button
          onClick={() => {
            triggerHaptic('light', settings.haptics);
            setUnitSystem('metric');
            setResult(null);
          }}
          className={`py-2 rounded-xl transition ${
            unitSystem === 'metric' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Metric (cm / kg)
        </button>
        <button
          onClick={() => {
            triggerHaptic('light', settings.haptics);
            setUnitSystem('imperial');
            setResult(null);
          }}
          className={`py-2 rounded-xl transition ${
            unitSystem === 'imperial' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Imperial (ft-in / lbs)
        </button>
      </div>

      {unitSystem === 'metric' ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Height (cm)</label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="e.g. 175"
              className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Weight (kg)</label>
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="e.g. 70"
              className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Height (Feet)</label>
              <input
                type="number"
                value={heightFt}
                onChange={(e) => setHeightFt(e.target.value)}
                placeholder="5"
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Height (Inches)</label>
              <input
                type="number"
                value={heightIn}
                onChange={(e) => setHeightIn(e.target.value)}
                placeholder="9"
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Weight (lbs)</label>
            <input
              type="number"
              value={weightLbs}
              onChange={(e) => setWeightLbs(e.target.value)}
              placeholder="e.g. 155"
              className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button onClick={calculate} className="flex-1 h-12 rounded-xl glass-btn-accent font-semibold text-sm">
          Calculate BMI
        </button>
        <button onClick={reset} className="px-5 h-12 rounded-xl glass-btn text-slate-300 text-sm font-medium">
          Reset
        </button>
      </div>

      {result && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 mt-4 font-mono text-sm">
          <div className="text-center py-2 bg-white/5 rounded-xl border border-white/10">
            <span className="text-xs text-slate-400 block mb-0.5">Your Body Mass Index</span>
            <span
              onClick={() => onCopyText(result.bmi.toString())}
              className="text-3xl font-extrabold text-white cursor-pointer"
            >
              {result.bmi}
            </span>
            <div className={`text-sm font-bold mt-1 ${result.categoryColor}`}>
              {result.category}
            </div>
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Healthy Weight Range:</span>
            <span className="text-emerald-400 font-semibold">{result.idealWeightRange}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. Fuel Mileage Calculator
export const FuelMileageCalculator: React.FC<ToolCommonProps> = ({ settings, onSaveHistory, onCopyText }) => {
  const [distance, setDistance] = useState<string>('450');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mi'>('km');
  const [fuelUsed, setFuelUsed] = useState<string>('30');
  const [fuelUnit, setFuelUnit] = useState<'liters' | 'gallons'>('liters');
  const [fuelCostPerUnit, setFuelCostPerUnit] = useState<string>('100');

  const [result, setResult] = useState<{
    kmPerLiter: number;
    litersPer100Km: number;
    mpgUs: number;
    totalCost: number;
    costPerDistance: number;
  } | null>(null);

  const calculate = () => {
    triggerHaptic('light', settings.haptics);
    const dist = parseFloat(distance);
    const fuel = parseFloat(fuelUsed);
    const price = parseFloat(fuelCostPerUnit) || 0;

    if (isNaN(dist) || isNaN(fuel) || dist <= 0 || fuel <= 0) return;

    // Normalize to km and liters
    const distKm = distanceUnit === 'km' ? dist : dist * 1.609344;
    const fuelLiters = fuelUnit === 'liters' ? fuel : fuel * 3.785411784;

    const kmPerLiter = distKm / fuelLiters;
    const litersPer100Km = 100 / kmPerLiter;

    // MPG (US) = (miles) / (US gallons)
    const miles = distKm / 1.609344;
    const gallons = fuelLiters / 3.785411784;
    const mpgUs = miles / gallons;

    const totalCost = fuel * price;
    const costPerDistance = totalCost / dist;

    setResult({
      kmPerLiter,
      litersPer100Km,
      mpgUs,
      totalCost,
      costPerDistance,
    });

    onSaveHistory({
      type: 'tool',
      toolName: 'Fuel Mileage Calculator',
      expression: `${dist} ${distanceUnit} on ${fuel} ${fuelUnit}`,
      result: `${kmPerLiter.toFixed(1)} km/L (${mpgUs.toFixed(1)} MPG), Total: ${formatNumber(totalCost, 2, settings.numberFormat)}`,
    });
  };

  const reset = () => {
    triggerHaptic('light', settings.haptics);
    setDistance('');
    setFuelUsed('');
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Distance Traveled</label>
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="e.g. 500"
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
          />
        </div>
        <select
          value={distanceUnit}
          onChange={(e) => setDistanceUnit(e.target.value as 'km' | 'mi')}
          className="h-12 px-3 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-medium"
        >
          <option value="km">Kilometers</option>
          <option value="mi">Miles</option>
        </select>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Fuel Consumed</label>
          <input
            type="number"
            value={fuelUsed}
            onChange={(e) => setFuelUsed(e.target.value)}
            placeholder="e.g. 35"
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
          />
        </div>
        <select
          value={fuelUnit}
          onChange={(e) => setFuelUnit(e.target.value as 'liters' | 'gallons')}
          className="h-12 px-3 rounded-xl bg-slate-900 border border-white/15 text-white text-xs font-medium"
        >
          <option value="liters">Liters</option>
          <option value="gallons">Gallons (US)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          Fuel Price per {fuelUnit === 'liters' ? 'Liter' : 'Gallon'}
        </label>
        <input
          type="number"
          value={fuelCostPerUnit}
          onChange={(e) => setFuelCostPerUnit(e.target.value)}
          placeholder="e.g. 100"
          className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-base focus:outline-none focus:border-sky-400"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={calculate} className="flex-1 h-12 rounded-xl glass-btn-accent font-semibold text-sm">
          Calculate Mileage
        </button>
        <button onClick={reset} className="px-5 h-12 rounded-xl glass-btn text-slate-300 text-sm font-medium">
          Reset
        </button>
      </div>

      {result && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 mt-4 font-mono text-sm">
          <div className="flex justify-between items-center text-base">
            <span className="text-slate-200 font-bold">Fuel Efficiency:</span>
            <span
              onClick={() => onCopyText(`${result.kmPerLiter.toFixed(2)} km/L`)}
              className="text-emerald-400 font-extrabold text-xl cursor-pointer"
            >
              {result.kmPerLiter.toFixed(2)} km/L
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>In US MPG:</span>
            <span className="text-sky-300 font-semibold">{result.mpgUs.toFixed(1)} MPG</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Per 100 Kilometers:</span>
            <span className="text-white font-semibold">{result.litersPer100Km.toFixed(2)} L / 100km</span>
          </div>
          <div className="pt-2 border-t border-white/10 flex justify-between text-slate-400">
            <span>Total Fuel Cost:</span>
            <span className="text-white font-bold">
              {formatNumber(result.totalCost, 2, settings.numberFormat)}
            </span>
          </div>
          <div className="flex justify-between text-slate-400 text-xs">
            <span>Cost per {distanceUnit}:</span>
            <span className="text-sky-300">
              {formatNumber(result.costPerDistance, 2, settings.numberFormat)} / {distanceUnit}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
