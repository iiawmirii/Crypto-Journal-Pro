import React from 'react';
import { motion } from 'motion/react';
import { 
  Sun, 
  Moon, 
  Check, 
  Download, 
  Upload, 
  Settings, 
  Zap,
  HardDrive
} from 'lucide-react';

export interface M3Palette {
  id: string;
  name: string;
  colorHex: string;
  description: string;
}

export const M3_PALETTES: M3Palette[] = [
  { id: 'blue', name: 'Classic Blue', colorHex: '#00639b', description: 'Clean Horizon Blue' },
  { id: 'purple', name: 'Amethyst Purple', colorHex: '#6750a4', description: 'Royal Lavender (M3 Default)' },
  { id: 'jade', name: 'Jade Green', colorHex: '#386a20', description: 'Organic Forest Basil' },
  { id: 'terracotta', name: 'Cherry Red', colorHex: '#ba1a1a', description: 'Ruby Red Terracotta' },
  { id: 'peach', name: 'Peach Amber', colorHex: '#8b5000', description: 'Cozy Warm Ochre' },
  { id: 'teal', name: 'Teal Green', colorHex: '#006a6a', description: 'Organic Fresh Teal' },
  { id: 'rose', name: 'M3 Rose', colorHex: '#984061', description: 'Earthy Wild Rose' },
  { id: 'emerald', name: 'Emerald Forest', colorHex: '#006e1c', description: 'Rich Forest Emerald' },
  { id: 'crimson', name: 'Deep Crimson', colorHex: '#b52555', description: 'Classic Ruby Crimson' },
];

interface SettingsTabProps {
  theme: 'light' | 'dark' | 'amoled';
  accentColorId: string;
  onThemeChange: (theme: 'light' | 'dark' | 'amoled') => void;
  onAccentColorChange: (colorId: string) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dataMessage: { text: string; type: 'success' | 'error' } | null;
  tradesCount: number;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  theme,
  accentColorId,
  onThemeChange,
  onAccentColorChange,
  onExport,
  onImport,
  dataMessage,
  tradesCount,
}) => {
  return (
    <div className="flex flex-col gap-6 select-none max-w-4xl mx-auto w-full">
      {/* Settings Card */}
      <section className="card p-6 flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <Settings className="text-[var(--accent)] w-5 h-5 animate-[spin_8s_linear_infinite]" />
          <div>
            <h2 className="text-base font-extrabold tracking-tight uppercase">Settings</h2>
            <p className="text-xs text-[var(--text-dim)]">Customize your theme and manage backups.</p>
          </div>
        </div>

        {/* Section 1: Themes & M3 Accent Colors */}
        <div className="flex flex-col gap-5">
          <h3 className="text-xs font-black tracking-widest text-[var(--text-dim)] uppercase flex items-center gap-2">
            <span>Theme</span>
          </h3>

          <div className={`grid grid-cols-1 ${theme === 'amoled' ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-6`}>
            {/* Theme Mode Segmented Pickers */}
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-bold text-[var(--text-dim)] uppercase tracking-wider">
                Mode
              </label>
              <div className="flex p-1 rounded-full border border-[var(--border)] bg-[var(--input-bg)] w-full">
                <button
                  onClick={() => onThemeChange('light')}
                  className={`flex-1 py-2.5 text-[10px] sm:text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer outline-none active:scale-95 ${
                    theme === 'light'
                      ? 'bg-[var(--segment-selected)] text-[var(--segment-selected-text)] shadow-sm font-extrabold'
                      : 'hover:text-[var(--text)] text-[var(--text-dim)]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="hidden sm:inline">LIGHT</span>
                  <span className="sm:hidden">LIGHT</span>
                  {theme === 'light' && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                </button>
                <button
                  onClick={() => onThemeChange('dark')}
                  className={`flex-1 py-2.5 text-[10px] sm:text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer outline-none active:scale-95 ${
                    theme === 'dark'
                      ? 'bg-[var(--segment-selected)] text-[var(--segment-selected-text)] shadow-sm font-extrabold'
                      : 'hover:text-[var(--text)] text-[var(--text-dim)]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="hidden sm:inline">DARK</span>
                  <span className="sm:hidden">DARK</span>
                  {theme === 'dark' && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                </button>
                <button
                  onClick={() => onThemeChange('amoled')}
                  className={`flex-1 py-2.5 text-[10px] sm:text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer outline-none active:scale-95 ${
                    theme === 'amoled'
                      ? 'bg-[var(--segment-selected)] text-[var(--segment-selected-text)] shadow-sm font-extrabold'
                      : 'hover:text-[var(--text)] text-[var(--text-dim)]'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="hidden sm:inline">AMOLED</span>
                  <span className="sm:hidden">AMOLED</span>
                  {theme === 'amoled' && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                </button>
              </div>
              <p className="text-[10px] text-[var(--text-dim)] leading-relaxed">
                {theme === 'amoled'
                  ? 'Pure black AMOLED theme with neon accents.'
                  : 'Background adapts to the selected accent color.'}
              </p>
            </div>

            {/* M3 Seed Accent Color Palette Picker */}
            {theme !== 'amoled' && (
              <div className="flex flex-col gap-3">
                <label className="text-[11px] font-bold text-[var(--text-dim)] uppercase tracking-wider">
                  Accent Color
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1">
                  {M3_PALETTES.map((p) => {
                    const isSelected = accentColorId === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => onAccentColorChange(p.id)}
                        className={`relative flex items-center gap-2.5 p-2 px-3 rounded-xl border transition-all cursor-pointer outline-none active:scale-95 ${
                          isSelected
                            ? 'border-[var(--accent)] bg-[var(--accent-soft)] shadow-sm'
                            : 'border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--text-dim)]'
                        }`}
                      >
                        {/* Color Dot with dynamic background */}
                        <div 
                          className="w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-inner relative shrink-0"
                          style={{ backgroundColor: p.colorHex }}
                        >
                          {isSelected && (
                            <Check className="w-2.5 h-2.5 text-white mix-blend-difference drop-shadow" />
                          )}
                        </div>
                        <span className={`text-[10px] font-bold text-left leading-tight truncate ${isSelected ? 'text-[var(--text)]' : 'text-[var(--text-dim)]'}`}>
                          {p.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-[var(--text-dim)] leading-relaxed">
                  Sets the accent color for the interface.
                </p>
              </div>
            )}
          </div>
        </div>

        <hr className="border-[var(--border)]" />

        {/* Section 2: JSON Offline Backups */}
        <div className="flex flex-col gap-5">
          <h3 className="text-xs font-black tracking-widest text-[var(--text-dim)] uppercase flex items-center gap-2">
            <span>Data</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sync Info Column */}
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-[var(--input-bg)] border border-[var(--border)] flex gap-3">
                <HardDrive className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-[var(--text)]">Local Storage</span>
                  <span className="text-[10px] text-[var(--text-dim)] leading-relaxed">
                    All data is stored locally. Nothing is sent to servers.
                  </span>
                  <div className="mt-2 text-[10px] font-mono font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-1 rounded-lg w-max border border-[var(--border)]">
                    {tradesCount} entries saved
                  </div>
                </div>
              </div>

              {/* Status alerts */}
              {dataMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3.5 rounded-2xl border text-xs font-semibold ${
                    dataMessage.type === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                  }`}
                >
                  {dataMessage.text}
                </motion.div>
              )}
            </div>

            {/* Actions Column */}
            <div className="flex flex-col gap-3 justify-center">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-dim)] uppercase">
                EXPORT & IMPORT BACKUPS
              </span>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Export Button */}
                <button
                  onClick={onExport}
                  className="flex-1 px-5 py-3 rounded-2xl bg-[var(--accent)] text-[var(--button-primary-text)] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md hover:opacity-90 active:scale-95 transition-all outline-none"
                >
                  <Download className="w-4 h-4" />
                  <span>EXPORT BACKUP</span>
                </button>

                {/* Import Label / Button */}
                <label
                  className="flex-1 px-5 py-3 rounded-2xl bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:bg-[var(--segment-bg)] active:scale-95 transition-all"
                >
                  <Upload className="w-4 h-4 text-[var(--accent)]" />
                  <span>IMPORT BACKUP</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={onImport}
                    className="hidden"
                  />
                </label>
              </div>

              <span className="text-[9px] text-[var(--text-dim)] leading-normal mt-1 text-center sm:text-left">
                * Note: Importing a backup file will append the backup data into your existing offline crypto journal log entries safely.
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsTab;
