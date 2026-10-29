import { AppSettings, HistoryItem } from '../types';

const SETTINGS_KEY = 'liquidcalc_settings_v1';
const HISTORY_KEY = 'liquidcalc_history_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accent: 'blue',
  glassIntensity: 'medium',
  ambientLight: true,
  animations: true,
  haptics: true,
  language: 'en',
  precision: 6,
  numberFormat: 'standard',
};

// Safe localStorage get/set
export function getSavedSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to parse saved settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('Failed to save settings:', e);
    return false;
  }
}

export function getSavedHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse history:', e);
    return [];
  }
}

export function saveHistory(history: HistoryItem[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // Keep maximum 200 items to avoid localStorage bloat
    const trimmed = history.slice(0, 200);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    return true;
  } catch (e) {
    console.error('Failed to save history:', e);
    return false;
  }
}

export function addHistoryItem(item: Omit<HistoryItem, 'id' | 'timestamp'>): HistoryItem {
  const current = getSavedHistory();
  const newItem: HistoryItem = {
    ...item,
    id: `calc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };
  const updated = [newItem, ...current];
  saveHistory(updated);
  return newItem;
}

export function clearHistory(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.removeItem(HISTORY_KEY);
    return true;
  } catch {
    return false;
  }
}

export function clearAllLocalData(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(HISTORY_KEY);
    return true;
  } catch {
    return false;
  }
}

// Download helpers
export function exportHistoryAsCSV(history: HistoryItem[]): void {
  if (!history || history.length === 0) {
    // Generate empty headers
    const csvContent = 'ID,Timestamp,Date,Time,Type,Tool,Expression,Result\n';
    triggerDownload(csvContent, 'liquidcalc_history.csv', 'text/csv;charset=utf-8;');
    return;
  }

  const headers = ['ID', 'Timestamp', 'Date', 'Time', 'Type', 'Tool', 'Expression', 'Result'];
  const rows = history.map((item) => {
    const d = new Date(item.timestamp);
    const dateStr = d.toISOString().split('T')[0];
    const timeStr = d.toTimeString().split(' ')[0];
    const escapedExpr = `"${(item.expression || '').replace(/"/g, '""')}"`;
    const escapedResult = `"${(item.result || '').replace(/"/g, '""')}"`;
    const tool = item.toolName ? `"${item.toolName.replace(/"/g, '""')}"` : '""';
    return [item.id, item.timestamp, dateStr, timeStr, item.type, tool, escapedExpr, escapedResult].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  triggerDownload(csv, `liquidcalc_history_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
}

export function exportSettingsAsJSON(settings: AppSettings): void {
  const jsonStr = JSON.stringify(settings, null, 2);
  triggerDownload(jsonStr, `liquidcalc_settings_${Date.now()}.json`, 'application/json;charset=utf-8;');
}

export function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
