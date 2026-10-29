import React, { useState } from 'react';
import {
  Download,
  Share2,
  FileSpreadsheet,
  FileCode,
  FolderArchive,
  Smartphone,
  Globe,
  Palette,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Check,
  ExternalLink,
  Info,
  Copy,
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AppSettings, AccentColor, GlassIntensity, HistoryItem } from '../types';
import { exportHistoryAsCSV, exportSettingsAsJSON, DEFAULT_SETTINGS } from '../utils/storage';
import { generateAndDownloadProjectZip } from '../utils/exportZip';
import { usePWAInstall } from '../utils/usePWAInstall';
import { triggerHaptic } from '../utils/haptics';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetSettings: () => void;
  onClearAllData: () => void;
  history: HistoryItem[];
  labels: Record<string, string>;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings,
  onClearAllData,
  history,
  labels,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Modals & toasts state
  const [showApkGuide, setShowApkGuide] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Install PWA handler
  const handlePwaInstall = async () => {
    triggerHaptic('medium', settings.haptics);
    if (isInstallable) {
      const ok = await install();
      if (ok) showToast('LiquidCalc installed successfully!');
    } else if (isIOS) {
      setShowIosGuide(true);
    } else {
      // In desktop Chrome or Android Chrome if prompt not fired yet, show instructions
      showToast('To install: Tap browser menu (⋮) > "Add to Home screen" or "Install App".');
    }
  };

  // 2. Download ZIP source
  const handleDownloadZip = async () => {
    triggerHaptic('medium', settings.haptics);
    setIsExportingZip(true);
    const success = await generateAndDownloadProjectZip();
    setIsExportingZip(false);
    if (success) {
      showToast('Source code ZIP downloaded!');
    } else {
      showToast('Could not package ZIP.');
    }
  };

  // 3. Export CSV
  const handleExportCSV = () => {
    triggerHaptic('light', settings.haptics);
    exportHistoryAsCSV(history);
    showToast('Calculation history CSV exported!');
  };

  // 4. Export JSON
  const handleExportJSON = () => {
    triggerHaptic('light', settings.haptics);
    exportSettingsAsJSON(settings);
    showToast('Settings JSON exported!');
  };

  // 5. Share App
  const handleShareApp = async () => {
    triggerHaptic('light', settings.haptics);
    const shareData = {
      title: 'LiquidCalc - iOS Glass Multi Calculator',
      text: 'Check out LiquidCalc, a gorgeous iOS Liquid Glass multi-calculator with 22+ financial, scientific, and conversion tools!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('App link shared!');
      } catch {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('App link copied to clipboard!');
      } catch {
        showToast('Link: ' + window.location.href);
      }
    }
  };

  const accentColors: Array<{ id: AccentColor; name: string; hex: string }> = [
    { id: 'blue', name: 'Azure', hex: '#38bdf8' },
    { id: 'purple', name: 'Cosmic', hex: '#a855f7' },
    { id: 'emerald', name: 'Mint', hex: '#10b981' },
    { id: 'amber', name: 'Sunset', hex: '#f59e0b' },
    { id: 'rose', name: 'Crimson', hex: '#f43f5e' },
    { id: 'cyan', name: 'Electric', hex: '#06b6d4' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900/90 border border-sky-400/40 text-white text-xs font-semibold shadow-xl flex items-center gap-2 backdrop-blur-md animate-fadeIn">
          <Check size={14} className="text-sky-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* PROMINENT DOWNLOAD & EXPORT SECTION (As requested) */}
      <GlassCard className="p-5 sm:p-6 border-sky-500/30">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/20 text-white">
            <Download size={18} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {labels.downloadSection || 'Download App & Export'}
            </h2>
            <p className="text-xs text-slate-400">
              {labels.downloadSubtitle || 'Install on your device or export data'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {/* Option 1: PWA */}
          <button
            onClick={handlePwaInstall}
            className="p-3.5 rounded-2xl glass-btn text-left group hover:border-sky-400/40 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <Globe size={18} className="text-sky-400" />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white">
                  {isInstalled ? 'Installed' : 'Instant'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                {labels.btnInstallPwa}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {labels.btnInstallPwaDesc}
              </p>
            </div>
            <div className="mt-3 text-[11px] font-semibold text-sky-400 flex items-center gap-1">
              <span>{isInstalled ? 'Already Installed' : 'Install Now'}</span>
              <span>→</span>
            </div>
          </button>

          {/* Option 2: Android APK */}
          <button
            onClick={() => {
              triggerHaptic('light', settings.haptics);
              setShowApkGuide(true);
            }}
            className="p-3.5 rounded-2xl glass-btn text-left group hover:border-sky-400/40 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <Smartphone size={18} className="text-emerald-400" />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white">
                  Android
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                {labels.btnDownloadApk}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {labels.btnDownloadApkDesc}
              </p>
            </div>
            <div className="mt-3 text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              <span>View Build Guide</span>
              <span>→</span>
            </div>
          </button>

          {/* Option 3: Source Code ZIP */}
          <button
            onClick={handleDownloadZip}
            disabled={isExportingZip}
            className="p-3.5 rounded-2xl glass-btn text-left group hover:border-sky-400/40 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <FolderArchive size={18} className="text-amber-400" />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white">
                  .ZIP
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                {labels.btnDownloadSource}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {labels.btnDownloadSourceDesc}
              </p>
            </div>
            <div className="mt-3 text-[11px] font-semibold text-amber-400 flex items-center gap-1">
              <span>{isExportingZip ? 'Packaging...' : 'Download ZIP'}</span>
              <span>→</span>
            </div>
          </button>

          {/* Option 4: Export CSV */}
          <button
            onClick={handleExportCSV}
            className="p-3.5 rounded-2xl glass-btn text-left group hover:border-sky-400/40 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <FileSpreadsheet size={18} className="text-teal-400" />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white">
                  .CSV
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                {labels.btnExportCsv}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {labels.btnExportCsvDesc}
              </p>
            </div>
            <div className="mt-3 text-[11px] font-semibold text-teal-400 flex items-center gap-1">
              <span>Export Records</span>
              <span>→</span>
            </div>
          </button>

          {/* Option 5: Export JSON */}
          <button
            onClick={handleExportJSON}
            className="p-3.5 rounded-2xl glass-btn text-left group hover:border-sky-400/40 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <FileCode size={18} className="text-purple-400" />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white">
                  .JSON
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                {labels.btnExportJson}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {labels.btnExportJsonDesc}
              </p>
            </div>
            <div className="mt-3 text-[11px] font-semibold text-purple-400 flex items-center gap-1">
              <span>Backup JSON</span>
              <span>→</span>
            </div>
          </button>

          {/* Option 6: Share App */}
          <button
            onClick={handleShareApp}
            className="p-3.5 rounded-2xl glass-btn text-left group hover:border-sky-400/40 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <Share2 size={18} className="text-rose-400" />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white">
                  Share
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                {labels.btnShareApp}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {labels.btnShareAppDesc}
              </p>
            </div>
            <div className="mt-3 text-[11px] font-semibold text-rose-400 flex items-center gap-1">
              <span>Share Link</span>
              <span>→</span>
            </div>
          </button>
        </div>
      </GlassCard>

      {/* APPEARANCE SECTION */}
      <GlassCard className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Palette size={18} className="text-sky-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">
            {labels.appearanceSection}
          </h2>
        </div>

        {/* Theme Mode */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            {labels.themeLabel}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'dark', label: labels.themeDark },
              { id: 'light', label: labels.themeLight },
              { id: 'system', label: labels.themeSystem },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  triggerHaptic('light', settings.haptics);
                  onUpdateSettings({ theme: t.id as any });
                }}
                className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                  settings.theme === t.id
                    ? 'bg-sky-500 text-white border-sky-400 shadow-md'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            {labels.accentColorLabel}
          </label>
          <div className="grid grid-cols-6 gap-2">
            {accentColors.map((acc) => (
              <button
                key={acc.id}
                onClick={() => {
                  triggerHaptic('light', settings.haptics);
                  onUpdateSettings({ accent: acc.id });
                }}
                className={`h-11 rounded-xl flex items-center justify-center transition border ${
                  settings.accent === acc.id
                    ? 'border-white scale-105 shadow-md'
                    : 'border-transparent hover:scale-100'
                }`}
                style={{ backgroundColor: acc.hex }}
                title={acc.name}
              >
                {settings.accent === acc.id && <Check size={16} className="text-white drop-shadow" />}
              </button>
            ))}
          </div>
        </div>

        {/* Glass Intensity */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300">
              {labels.glassIntensityLabel}
            </label>
            <span className="text-xs font-mono text-sky-400 capitalize">
              {settings.glassIntensity}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as GlassIntensity[]).map((level) => (
              <button
                key={level}
                onClick={() => {
                  triggerHaptic('light', settings.haptics);
                  onUpdateSettings({ glassIntensity: level });
                }}
                className={`py-2 rounded-xl text-xs font-semibold capitalize transition border ${
                  settings.glassIntensity === level
                    ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="divide-y divide-white/10 pt-1">
          <div className="py-3 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-200">
              {labels.ambientLightToggle}
            </span>
            <input
              type="checkbox"
              checked={settings.ambientLight}
              onChange={(e) => {
                triggerHaptic('light', settings.haptics);
                onUpdateSettings({ ambientLight: e.target.checked });
              }}
              className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-200">
              {labels.animationsToggle}
            </span>
            <input
              type="checkbox"
              checked={settings.animations}
              onChange={(e) => {
                triggerHaptic('light', settings.haptics);
                onUpdateSettings({ animations: e.target.checked });
              }}
              className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-200">
              {labels.hapticsToggle}
            </span>
            <input
              type="checkbox"
              checked={settings.haptics}
              onChange={(e) => {
                triggerHaptic('light', !settings.haptics);
                onUpdateSettings({ haptics: e.target.checked });
              }}
              className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </GlassCard>

      {/* PREFERENCES SECTION */}
      <GlassCard className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Sliders size={18} className="text-sky-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">
            {labels.preferencesSection}
          </h2>
        </div>

        {/* Language */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            {labels.languageLabel}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                triggerHaptic('light', settings.haptics);
                onUpdateSettings({ language: 'en' });
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                settings.language === 'en'
                  ? 'bg-sky-500 text-white border-sky-400 shadow-md'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              English
            </button>
            <button
              onClick={() => {
                triggerHaptic('light', settings.haptics);
                onUpdateSettings({ language: 'hi' });
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                settings.language === 'hi'
                  ? 'bg-sky-500 text-white border-sky-400 shadow-md'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              हिन्दी (Hindi)
            </button>
          </div>
        </div>

        {/* Decimal Precision */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {labels.decimalPrecisionLabel}
            </label>
            <span className="font-mono text-xs font-bold text-sky-400">
              {settings.precision} decimals
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={8}
            step={1}
            value={settings.precision}
            onChange={(e) => onUpdateSettings({ precision: parseInt(e.target.value) })}
            className="w-full accent-sky-500 cursor-pointer"
          />
        </div>

        {/* Number Grouping Format */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            {labels.numberFormatLabel}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                triggerHaptic('light', settings.haptics);
                onUpdateSettings({ numberFormat: 'standard' });
              }}
              className={`py-2.5 rounded-xl text-xs font-semibold transition border ${
                settings.numberFormat === 'standard'
                  ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {labels.formatStandard}
            </button>
            <button
              onClick={() => {
                triggerHaptic('light', settings.haptics);
                onUpdateSettings({ numberFormat: 'in' });
              }}
              className={`py-2.5 rounded-xl text-xs font-semibold transition border ${
                settings.numberFormat === 'in'
                  ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {labels.formatIndian}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* RESET & DATA MANAGEMENT */}
      <GlassCard className="p-5 sm:p-6 space-y-3">
        <h2 className="text-base font-bold text-white mb-2">Data & Storage Management</h2>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              triggerHaptic('medium', settings.haptics);
              setShowResetConfirm(true);
            }}
            className="flex-1 py-3 px-4 rounded-xl glass-btn text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} />
            <span>{labels.resetSettings}</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('heavy', settings.haptics);
              setShowClearConfirm(true);
            }}
            className="flex-1 py-3 px-4 rounded-xl glass-btn text-xs font-semibold text-rose-300 hover:text-rose-200 flex items-center justify-center gap-2"
          >
            <Trash2 size={14} />
            <span>{labels.clearAllData}</span>
          </button>
        </div>
      </GlassCard>

      {/* ABOUT & PRIVACY */}
      <GlassCard className="p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-white">
          <ShieldCheck size={18} className="text-emerald-400" />
          <h2 className="text-base font-bold">{labels.aboutSection}</h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {labels.privacyNotice}
        </p>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span>{labels.aboutVersion}</span>
          <span className="font-mono">Apple iOS Liquid Glass Edition</span>
        </div>
      </GlassCard>

      {/* MODAL: Android APK Guide */}
      {showApkGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
          <GlassCard className="w-full max-w-lg p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{labels.apkModalTitle}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real Android APKs require building with the Android SDK & Gradle.
                </p>
              </div>
              <button
                onClick={() => setShowApkGuide(false)}
                className="p-1.5 rounded-lg glass-btn text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
              <p>
                To generate a signed, installable Android APK file for your phone:
              </p>

              <div className="p-3 rounded-xl bg-black/40 font-mono text-[11px] text-sky-300 space-y-1 overflow-x-auto">
                <div># 1. Download project ZIP via the "Download Source Code" button</div>
                <div># 2. Extract into a folder and install dependencies:</div>
                <div className="text-white">npm install</div>
                <div># 3. Add Capacitor Android runtime:</div>
                <div className="text-white">npm install @capacitor/core @capacitor/cli @capacitor/android</div>
                <div className="text-white">npx cap init LiquidCalc com.liquidcalc.app --web-dir dist</div>
                <div># 4. Build web bundle & sync to Android:</div>
                <div className="text-white">npm run build</div>
                <div className="text-white">npx cap add android</div>
                <div># 5. Open Android Studio to build APK:</div>
                <div className="text-white">npx cap open android</div>
              </div>

              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-200">
                <strong>Tip:</strong> In Android Studio, go to{' '}
                <code className="text-white font-mono">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</code>{' '}
                to produce your debug or release <code className="text-white font-mono">.apk</code> file.
              </div>
            </div>

            <button
              onClick={() => setShowApkGuide(false)}
              className="w-full h-11 rounded-xl glass-btn-accent font-semibold text-xs"
            >
              {labels.close}
            </button>
          </GlassCard>
        </div>
      )}

      {/* MODAL: iOS Safari PWA Guide */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
          <GlassCard className="w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">{labels.pwaModalTitle}</h3>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                1. Tap the <strong>Share button</strong> (square with arrow up) at the bottom toolbar in Safari.
              </p>
              <p>
                2. Scroll down the action sheet and select <strong>"Add to Home Screen"</strong>.
              </p>
              <p>
                3. Tap <strong>"Add"</strong> in the top right. LiquidCalc will appear as a native glass app icon!
              </p>
            </div>
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full h-11 rounded-xl glass-btn-accent font-semibold text-xs"
            >
              {labels.close}
            </button>
          </GlassCard>
        </div>
      )}

      {/* MODAL: Confirm Reset Settings */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <GlassCard className="w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Reset Settings?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will restore all theme, accent, and calculation preferences to their defaults. Your history will not be deleted.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="h-10 rounded-xl glass-btn text-xs font-semibold text-slate-300 hover:text-white"
              >
                {labels.cancel}
              </button>
              <button
                onClick={() => {
                  triggerHaptic('medium', settings.haptics);
                  onResetSettings();
                  setShowResetConfirm(false);
                  showToast('Settings reset to defaults');
                }}
                className="h-10 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition"
              >
                {labels.confirm}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* MODAL: Confirm Clear All Data */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <GlassCard className="w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">{labels.clearAllData}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {labels.clearAllDataDesc}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="h-10 rounded-xl glass-btn text-xs font-semibold text-slate-300 hover:text-white"
              >
                {labels.cancel}
              </button>
              <button
                onClick={() => {
                  triggerHaptic('heavy', settings.haptics);
                  onClearAllData();
                  setShowClearConfirm(false);
                  showToast('All local data cleared');
                }}
                className="h-10 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition"
              >
                {labels.confirm}
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
