/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactDOM from 'react-dom/client';
import { Trade, TradeResult, Stats } from './types';
import { generateId } from './utils';
import CryptoCalculator from './components/CryptoCalculator';
import StopLossMistakes from './components/StopLossMistakes';
import PnLStats from './components/PnLStats';
import { 
  Activity, 
  ArrowUpRight, 
  TrendingUp, 
  TrendingDown, 
  Tag, 
  Calculator, 
  ShieldAlert, 
  Image as ImageIcon, 
  UploadCloud, 
  X, 
  BookOpen, 
  Trash2, 
  Maximize2,
  Sun,
  Moon,
  Palette,
  Check,
  Terminal,
  ChevronDown,
  Calendar,
  BarChart3,
  Edit3,
  Database,
  Download
} from 'lucide-react';

type AppTheme = 'light' | 'dark';

// In-browser image compressor to prevent LocalStorage 5MB quota overflow
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 450;
        const MAX_HEIGHT = 350;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = () => resolve('');
    };
    reader.onerror = () => resolve('');
  });
};

function App() {
  const [activeTab, setActiveTab] = useState<'journal' | 'calculator' | 'stats' | 'mistakes'>('journal');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [theme, setTheme] = useState<AppTheme>('dark');
  const [themeOpen, setThemeOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  
  // Form State
  const [form, setForm] = useState({
    pair: '',
    time: new Date().toISOString().slice(0, 16),
    resultType: 'gain' as TradeResult,
    amount: '',
    rrr: '',
    reason: '',
    direction: 'long' as 'long' | 'short',
    stopLossHit: false,
    stopLossReason: '',
    imageUrl: ''
  });

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Backup & Import/Export LocalStates and Functions
  const [dataMenuOpen, setDataMenuOpen] = useState(false);
  const [dataMessage, setDataMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const exportTrades = () => {
    try {
      const dataStr = JSON.stringify(trades, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `crypto_journal_backup_${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setDataMessage({ text: 'Backup exported successfully!', type: 'success' });
      setTimeout(() => setDataMessage(null), 4000);
    } catch (e) {
      setDataMessage({ text: 'Failed to export backup.', type: 'error' });
      setTimeout(() => setDataMessage(null), 4000);
    }
  };

  const importTrades = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          const isValid = parsed.every((item: any) => item && typeof item === 'object' && 'id' in item && 'pair' in item);
          if (isValid || parsed.length === 0) {
            saveTrades(parsed);
            setDataMessage({ text: `Successfully backup-restored ${parsed.length} trades!`, type: 'success' });
          } else {
            setDataMessage({ text: 'Invalid file format. Ensure it is a valid Crypto Journal backup file.', type: 'error' });
          }
        } else {
          setDataMessage({ text: 'File must contain an array of trades.', type: 'error' });
        }
      } catch (err) {
        setDataMessage({ text: 'Failed to parse JSON file.', type: 'error' });
      }
      setTimeout(() => setDataMessage(null), 4000);
      e.target.value = ''; // Clear value
    };
    reader.readAsText(file);
  };

  // Sync theme with body data attributes
  useEffect(() => {
    let savedTheme = localStorage.getItem('crypto_theme_v1') as any;
    if (savedTheme === 'colored') {
      savedTheme = 'dark';
    }
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.setAttribute('data-theme', savedTheme);
    } else {
      document.body.setAttribute('data-theme', 'dark');
    }
  }, []);

  const changeTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('crypto_theme_v1', newTheme);
  };

  // Load data offline from local storage
  useEffect(() => {
    const savedTrades = localStorage.getItem('crypto_trades_v1');
    if (savedTrades) {
      try {
        setTrades(JSON.parse(savedTrades));
      } catch (e) {
        console.error("Error loading offline trades", e);
      }
    }

  }, []);

  // Save trades to local storage
  const saveTrades = (newTrades: Trade[]) => {
    setTrades(newTrades);
    localStorage.setItem('crypto_trades_v1', JSON.stringify(newTrades));
  };

  // Performance calculations
  const stats = useMemo((): Stats => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const calc = (sinceMs: number) => 
      trades
        .filter(t => t.timestamp >= now - sinceMs)
        .reduce((acc, t) => acc + (t.resultType === 'gain' ? t.amount : -t.amount), 0);

    return {
      daily: calc(dayMs),
      threeDay: calc(dayMs * 3),
      weekly: calc(dayMs * 7),
      monthly: calc(dayMs * 30),
      allTime: trades.reduce((acc, t) => acc + (t.resultType === 'gain' ? t.amount : -t.amount), 0)
    };
  }, [trades]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedBase64 = await compressImage(file);
      setForm(prev => ({ ...prev, imageUrl: compressedBase64 }));
    }
  };

  const handleAddTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pair || !form.amount) return;

    const newTrade: Trade = {
      id: generateId(),
      pair: form.pair.toUpperCase(),
      timestamp: new Date(form.time).getTime(),
      resultType: form.resultType,
      amount: parseFloat(form.amount),
      rrr: parseFloat(form.rrr) || 0,
      reason: form.reason,
      direction: form.direction,
      stopLossHit: form.resultType === 'loss' ? form.stopLossHit : false,
      stopLossReason: form.resultType === 'loss' && form.stopLossHit ? form.stopLossReason : undefined,
      imageUrl: form.imageUrl || undefined
    };

    const updated = [newTrade, ...trades];
    saveTrades(updated);

    // Reset Form
    setForm({
      pair: '',
      time: new Date().toISOString().slice(0, 16),
      resultType: 'gain',
      amount: '',
      rrr: '',
      reason: '',
      direction: 'long',
      stopLossHit: false,
      stopLossReason: '',
      imageUrl: ''
    });
  };

  const handleLogTradeFromCalculator = (newTrade: Trade) => {
    const updated = [newTrade, ...trades];
    saveTrades(updated);
  };

  return (
    <div className="app-container">
      <header className="main-header select-none">
        <div className="header-inner px-6 flex items-center justify-between md:grid md:grid-cols-3">
          
          {/* LEFT SECTION: Logo only */}
          <div className="flex items-center gap-4 justify-self-start relative z-50">
            <div className="logo cursor-default">
              <Activity className="text-blue-500 w-5 h-5 animate-pulse" />
              <span className="font-sans font-extrabold tracking-tight">
                CRYPTO<b className="text-blue-500">JOURNAL</b>
                <span className="text-[10px] ml-2 px-2 py-0.5 bg-blue-500/10 text-blue-500 font-mono font-semibold tracking-wider rounded border border-blue-500/15 uppercase">
                  PRO
                </span>
              </span>
            </div>
          </div>

          {/* CENTER SECTION: Navigation Segments */}
          <div className="hidden md:flex justify-self-center">
            <div className="ios-segmented-track border-0 bg-transparent p-0">
              <button
                onClick={() => setActiveTab('journal')}
                className={`ios-segment-btn ${activeTab === 'journal' ? 'active' : ''}`}
              >
                <BookOpen className="w-3.5 h-3.5" /> JOURNAL
              </button>
              <button
                onClick={() => setActiveTab('calculator')}
                className={`ios-segment-btn ${activeTab === 'calculator' ? 'active' : ''}`}
              >
                <Calculator className="w-3.5 h-3.5" /> CALCULATOR
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`ios-segment-btn ${activeTab === 'stats' ? 'active' : ''}`}
              >
                <BarChart3 className="w-3.5 h-3.5" /> STATS
              </button>
              <button
                onClick={() => setActiveTab('mistakes')}
                className={`ios-segment-btn ${activeTab === 'mistakes' ? 'active' : ''}`}
              >
                <ShieldAlert className="w-3.5 h-3.5" /> LESSONS
              </button>
            </div>
          </div>

          {/* RIGHT SECTION: Theme Selector & Backup Tools */}
          <div className="flex items-center gap-3.5 justify-self-end relative z-100">
            
            {/* Backup / Export / Import Settings Menu */}
            <div className="relative">
              <button
                onClick={() => { setDataMenuOpen(!dataMenuOpen); setThemeOpen(false); }}
                className="h-9 w-9 xl:px-3.5 xl:w-auto rounded-xl bg-[var(--segment-bg)] border border-[var(--border)] flex items-center justify-center gap-2 cursor-pointer text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--card-bg)] shadow-sm active:scale-95 transition-all text-xs font-semibold"
                title="Data Import/Export Backup"
              >
                <Database className="w-4 h-4 text-blue-500" />
                <span className="font-mono text-[10px] uppercase tracking-wider hidden xl:inline">
                  Export / Import
                </span>
              </button>

              <AnimatePresence>
                {dataMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDataMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 6 }}
                      transition={{ type: "spring", stiffness: 450, damping: 28 }}
                      className="absolute right-0 mt-2 p-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-2xl z-50 flex flex-col gap-1.5 min-w-[200px]"
                    >
                      <div className="px-2.5 py-1 text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest font-mono border-b border-[var(--border)] pb-1.5 mb-1 select-none">
                        Data Management
                      </div>
                      
                      <button 
                        onClick={() => { exportTrades(); setDataMenuOpen(false); }} 
                        className="w-full text-left px-2.5 py-2 rounded-lg text-[11px] font-semibold flex items-center gap-2.5 text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--segment-bg)] active:scale-95 transition-all"
                      >
                        <Download className="w-4 h-4 text-emerald-500" />
                        <span>Export Backup (JSON)</span>
                      </button>

                      <label 
                        className="w-full text-left px-2.5 py-2 rounded-lg text-[11px] font-semibold flex items-center gap-2.5 text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--segment-bg)] cursor-pointer active:scale-95 transition-all"
                      >
                        <UploadCloud className="w-4 h-4 text-amber-500" />
                        <span>Import Backup (JSON)</span>
                        <input 
                          type="file" 
                          accept=".json" 
                          onChange={(e) => { importTrades(e); setDataMenuOpen(false); }} 
                          className="hidden" 
                        />
                      </label>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button
                onClick={() => { setThemeOpen(!themeOpen); setDataMenuOpen(false); }}
                className="h-9 px-3.5 rounded-xl bg-[var(--segment-bg)] border border-[var(--border)] flex items-center gap-2 cursor-pointer text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--card-bg)] shadow-sm active:scale-95 transition-all text-xs font-semibold"
                title="Change Theme"
              >
                {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
                {theme === 'dark' && <Moon className="w-4 h-4 text-blue-400" />}
                <span className="font-mono text-[10px] uppercase tracking-wider hidden sm:inline">
                  {theme === 'light' && 'Cream/Light'}
                  {theme === 'dark' && 'Zinc/Dark'}
                </span>
                <ChevronDown className="w-3 h-3 text-[var(--text-dim)]" />
              </button>

              <AnimatePresence>
                {themeOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setThemeOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 6 }}
                      transition={{ type: "spring", stiffness: 450, damping: 28 }}
                      className="absolute right-0 mt-2 p-1.5 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-2xl z-50 flex flex-col gap-1 min-w-[150px]"
                    >
                      <button 
                        onClick={() => { changeTheme('light'); setThemeOpen(false); }} 
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-2 transition-all ${
                          theme === 'light' 
                            ? 'bg-[var(--segment-selected)] text-[var(--segment-selected-text)] border border-[var(--border)] shadow-sm' 
                            : 'text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--segment-bg)]'
                        }`}
                      >
                        <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-500' : 'text-zinc-400'}`} />
                        <span>Cream Light</span>
                        {theme === 'light' && <Check className="w-3 h-3 ml-auto text-blue-500" />}
                      </button>

                      <button 
                        onClick={() => { changeTheme('dark'); setThemeOpen(false); }} 
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-2 transition-all ${
                          theme === 'dark' 
                            ? 'bg-[var(--segment-selected)] text-[var(--segment-selected-text)] border border-[var(--border)] shadow-sm' 
                            : 'text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--segment-bg)]'
                        }`}
                      >
                        <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-blue-400' : 'text-zinc-400'}`} />
                        <span>Midnight Dark</span>
                        {theme === 'dark' && <Check className="w-3 h-3 ml-auto text-blue-500" />}
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </header>

      {/* iOS Segmented Bar for smaller viewport bounds */}
      <div className="md:hidden sticky top-[72px] z-[90] p-3 border-b border-[var(--border)] backdrop-blur bg-[var(--header-bg)] flex justify-center">
        <div className="ios-segmented-track w-full max-w-md">
          <button
            onClick={() => setActiveTab('journal')}
            className={`ios-segment-btn ${activeTab === 'journal' ? 'active' : ''}`}
          >
            JOURNAL
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`ios-segment-btn ${activeTab === 'calculator' ? 'active' : ''}`}
          >
            CALCULATOR
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`ios-segment-btn ${activeTab === 'stats' ? 'active' : ''}`}
          >
            STATS
          </button>
          <button
            onClick={() => setActiveTab('mistakes')}
            className={`ios-segment-btn ${activeTab === 'mistakes' ? 'active' : ''}`}
          >
            LESSONS
          </button>
        </div>
      </div>

      <main className="dashboard-grid">
        {/* Left column statistics list */}
        <section className={`stats-panel mb-4 lg:mb-0 ${activeTab !== 'journal' ? 'hide-stats-on-mobile' : ''}`}>
          <div className="panel-title font-mono text-[10px] tracking-widest text-zinc-500 mb-1 select-none">
            OFFLINE JOURNAL ENGINES
          </div>
          
          <div className="stats-cards">
            <StatItem label="Daily Profits / Losses" value={stats.daily} />
            <StatItem label="Rolling 3-Day Performance" value={stats.threeDay} />
            <StatItem label="Weekly Balance Performance" value={stats.weekly} />
            <StatItem label="Monthly Margin PnL" value={stats.monthly} />
            <StatItem label="Cumulative Active Balance" value={stats.allTime} isLarge />
          </div>
        </section>

        {/* Dynamic screen renders */}
        <div className="flex flex-col gap-6 min-w-0">

          {activeTab === 'journal' && (
            <div className="main-content">
              {/* Form Manual Input */}
              <section className="entry-section card">
                <div className="flex justify-between items-center border-b border-[var(--border)] pb-4 mb-4 flex-wrap gap-2">
                  <h2 className="text-sm font-extrabold tracking-wider uppercase text-[var(--text)] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-teal-400" /> LOG TRADE MANUALLY
                  </h2>
                  
                  <div className="flex bg-[var(--segment-bg)] p-1 rounded-xl border border-[var(--border)] text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, direction: 'long' })}
                      className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 ${
                        form.direction === 'long' 
                          ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/20' 
                          : 'text-[var(--text-dim)] hover:text-[var(--text)]'
                      }`}
                    >
                      <TrendingUp className="w-3 h-3" /> LONG
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, direction: 'short' })}
                      className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 ${
                        form.direction === 'short' 
                          ? 'bg-[#f43f5e]/15 text-[#f43f5e] border border-[#f43f5e]/20' 
                          : 'text-[var(--text-dim)] hover:text-[var(--text)] font-medium'
                      }`}
                    >
                      <TrendingDown className="w-3 h-3" /> SHORT
                    </button>
                  </div>
                </div>

                <form onSubmit={handleAddTrade} className="trade-form flex flex-col gap-5">
                  <div className="form-grid">
                    <div className="field">
                      <label>Pair / Symbol</label>
                      <input type="text" placeholder="ETH/USDT" value={form.pair} onChange={e => setForm({...form, pair: e.target.value})} required />
                    </div>
                    <div className="field">
                      <label>Date & Time</label>
                      <input type="datetime-local" value={form.time} onChange={e => setForm({...form, time: e.target.value})} required />
                    </div>
                    <div className="field">
                      <label>Outcome</label>
                      <select value={form.resultType} onChange={e => setForm({...form, resultType: e.target.value as TradeResult})}>
                        <option value="gain">Profit / Gain (+)</option>
                        <option value="loss">Loss / Drawdown (-)</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>PnL Amount ($)</label>
                      <input type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required min="0.01" />
                    </div>
                    <div className="field">
                      <label>Risk-to-Reward Ratio</label>
                      <input type="number" step="0.1" placeholder="2.5" value={form.rrr} onChange={e => setForm({...form, rrr: e.target.value})} />
                    </div>
                  </div>

                  {/* Dynamic Stop-loss activates if user chose Loss */}
                  {form.resultType === 'loss' && (
                    <div className="bg-rose-500/5 border border-rose-500/15 p-4 rounded-xl flex flex-col gap-3 font-sans transition-all">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-rose-500 select-none">
                        <input 
                          type="checkbox" 
                          checked={form.stopLossHit} 
                          onChange={e => setForm({ ...form, stopLossHit: e.target.checked })}
                          className="w-4 h-4 rounded accent-rose-500 cursor-pointer"
                        />
                        WAS STOP LOSS TRIGGERED?
                      </label>
                      
                      {form.stopLossHit && (
                        <div className="flex flex-col gap-3 mt-1">
                          <span className="text-[10px] text-[var(--text-dim)] block font-semibold uppercase tracking-wider">Mistake / Activation Reason:</span>
                          <input 
                            type="text" 
                            placeholder="e.g. FOMO Trigger, moved stop wider, news spread volatility..."
                            value={form.stopLossReason}
                            onChange={e => setForm({ ...form, stopLossReason: e.target.value })}
                            className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-3.5 py-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] transition-all"
                          />
                          <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-[var(--text-dim)]">
                            <span>Shortcut templates:</span>
                            {['FOMO Entry', 'Moved Stop Loss Wider', 'Too Loaded (Over-leverage)', 'Premature Profit Chase', 'News Spread Volatility', 'No Trade Plan Violation'].map(err => (
                              <button 
                                type="button" 
                                key={err}
                                onClick={() => setForm({...form, stopLossReason: err})}
                                className="px-2 py-0.5 bg-[var(--input-bg)] hover:bg-[var(--segment-bg)] rounded-md border border-[var(--border)] hover:border-[var(--accent)] transition-all text-[var(--text-[var(--text-dim)])] hover:text-[var(--text)] font-semibold"
                              >
                                {err}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Snapshot selector */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-[var(--border)] pt-4 select-none">
                    <div className="flex items-center gap-2 shrink-0">
                      <input 
                        type="file" 
                        id="form-image-attachment" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="hidden" 
                      />
                      <label 
                        htmlFor="form-image-attachment" 
                        className="flex items-center gap-2 px-4 py-2.5 hover:bg-[var(--segment-bg)] border-2 border-[var(--border)] hover:border-[var(--accent)] rounded-xl cursor-pointer text-xs text-[var(--text)] bg-[var(--input-bg)] font-bold transition-all shadow"
                      >
                        <UploadCloud className="w-4 h-4 text-blue-400" />
                        {form.imageUrl ? 'Change Snapshot' : 'Attach Technical Chart Image'}
                      </label>
                    </div>

                    {form.imageUrl && (
                      <div className="flex items-center gap-3 bg-[var(--input-bg)] pl-2 pr-4 py-1.5 rounded-xl border-2 border-[var(--border)]">
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden shadow">
                          <img src={form.imageUrl} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] text-[var(--text-dim)] font-mono">Attachment Processed</span>
                        <button 
                          type="button" 
                          onClick={() => setForm({ ...form, imageUrl: '' })}
                          className="text-zinc-500 hover:text-rose-400 ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="submit-btn mt-2 inline-flex justify-center items-center gap-2 font-extrabold uppercase py-4">
                    <ArrowUpRight className="w-4 h-4" /> Save Trade Offline
                  </button>
                </form>
              </section>

              {/* Historic ledger logs */}
              <section className="history-section mt-4 select-none">
                <div className="section-header border-b border-[var(--border)] pb-3 flex justify-between items-center">
                  <span className="text-[10px] font-extrabold tracking-widest text-[var(--text-dim)] uppercase">OFFLINE HISTORIC LEDGER</span>
                  <span className="font-mono text-[var(--text-dim)] text-xs font-bold">{trades.length} entries stored</span>
                </div>

                <div className="trade-list mt-4 flex flex-col gap-4">
                  {trades.length === 0 ? (
                    <div className="empty-history font-sans">
                      No trades entered yet. Click details above or use the futures calculator to commit entries.
                    </div>
                  ) : (
                    trades.map(trade => (
                      <div key={trade.id} className={`trade-card ${trade.resultType} flex flex-col gap-3.5`}>
                        <div className="trade-card-main">
                          <div className="trade-info">
                            <div className="flex items-center gap-2">
                              <span className="pair font-extrabold text-sm md:text-base text-[var(--text)]">{trade.pair}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 font-bold tracking-tight rounded select-none ${
                                trade.direction === 'short' 
                                  ? 'bg-rose-500/15 text-rose-500 border-2 border-rose-500/20' 
                                  : 'bg-emerald-500/15 text-emerald-500 border-2 border-emerald-500/20'
                              }`}>
                                {trade.direction?.toUpperCase() || 'LONG'}
                              </span>
                            </div>
                            <span className="date font-mono text-[10px] text-[var(--text-dim)] mt-1">{new Date(trade.timestamp).toLocaleString()}</span>
                          </div>

                          <div className="trade-math">
                            <span className="amount text-sm md:text-base text-[var(--text)] font-extrabold">{trade.resultType === 'gain' ? '+' : '-'}${trade.amount.toFixed(2)}</span>
                            {trade.rrr > 0 && <span className="rrr font-mono text-[10px] font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-lg border border-[var(--border)]">RR 1:{trade.rrr}</span>}
                          </div>
                        </div>

                        {trade.reason && (
                          <div className="trade-reason text-xs text-[var(--text-dim)] leading-relaxed font-sans border-t border-[var(--border)] pt-3">
                            {trade.reason.startsWith('[Imported from Calc]') ? (
                              <span className="text-[var(--text)]">
                                <b className="text-[var(--accent)] font-sans text-[10px] mr-1 block uppercase tracking-wide">CALCULATED TARGET:</b>
                                {trade.reason.replace('[Imported from Calc]', '').trim()}
                              </span>
                            ) : (
                              <span>{trade.reason}</span>
                            )}
                          </div>
                        )}

                        {trade.imageUrl && (
                          <div className="flex items-center gap-3 mt-1 border-t border-[var(--border)] pt-3 flex-wrap">
                            <span className="text-[10px] font-bold text-[var(--text-dim)] tracking-wider flex items-center gap-1 uppercase">
                              <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> Chart Snaps:
                            </span>
                            <div 
                              onClick={() => setLightboxImage(trade.imageUrl || null)}
                              className="relative group w-14 h-14 rounded-xl overflow-hidden border-2 border-[var(--border)] hover:border-[var(--accent)] cursor-pointer shadow-lg transition-all flex items-center justify-center shrink-0"
                              title="Inspect full image"
                            >
                              <img src={trade.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-[9px] text-white font-bold">
                                VIEW
                              </div>
                            </div>
                          </div>
                        )}

                        {trade.stopLossHit && (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-rose-500 bg-rose-500/10 py-2 px-3 rounded-xl border-2 border-rose-500/20 mt-1">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> STOP LOSS HIT: &ldquo;{trade.stopLossReason}&rdquo;
                          </div>
                        )}

                        <button
                          type="button"
                          className="edit-btn active:scale-90"
                          onClick={() => setEditingTrade(trade)}
                          title="Edit trade details"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[var(--text-dim)] hover:text-[var(--accent)] transition-all" />
                        </button>

                        <button 
                          type="button"
                          className="del-btn active:scale-90" 
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this log entry permanently?")) {
                              saveTrades(trades.filter(t => t.id !== trade.id));
                            }
                          }}
                          title="Delete trade"
                        >
                          <Trash2 className="w-4 h-4 text-[var(--text-dim)] hover:text-rose-500 transition-all" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'calculator' && (
            <CryptoCalculator 
              onLogTrade={handleLogTradeFromCalculator} 
            />
          )}

          {activeTab === 'stats' && (
            <PnLStats 
              trades={trades} 
              onEditTrade={(trade) => setEditingTrade(trade)}
            />
          )}

          {activeTab === 'mistakes' && (
            <StopLossMistakes trades={trades} />
          )}

        </div>
      </main>

      {/* Edit Trade Modal */}
      {editingTrade && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[99999] overflow-y-auto"
          onClick={() => setEditingTrade(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto" 
            onClick={e => e.stopPropagation()}
            style={{ color: 'var(--text)' }}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
              <h3 className="text-sm font-extrabold tracking-wider uppercase flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-500" /> EDIT JOURNAL ENTRY
              </h3>
              <button 
                type="button" 
                onClick={() => setEditingTrade(null)}
                className="text-[var(--text-dim)] hover:text-rose-400 p-1 rounded-lg hover:bg-[var(--input-bg)] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                saveTrades(trades.map(t => t.id === editingTrade.id ? editingTrade : t));
                setEditingTrade(null);
              }} 
              className="flex flex-col gap-4 text-left"
            >
              {/* Row 1: Pair and Direction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="field flex flex-col gap-1 text-xs">
                  <label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">Pair / Symbol</label>
                  <input 
                    type="text" 
                    value={editingTrade.pair} 
                    onChange={e => setEditingTrade({ ...editingTrade, pair: e.target.value.toUpperCase() })} 
                    className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] transition-all"
                    required 
                  />
                </div>
                <div className="field flex flex-col gap-1 text-xs">
                  <label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">Direction</label>
                  <select 
                    value={editingTrade.direction || 'long'} 
                    onChange={e => setEditingTrade({ ...editingTrade, direction: e.target.value as 'long' | 'short' })}
                    className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] transition-all"
                  >
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Date & Time, Result Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="field flex flex-col gap-1 text-xs">
                  <label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={(() => {
                      const d = new Date(editingTrade.timestamp);
                      const pad = (n: number) => n.toString().padStart(2, '0');
                      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                    })()} 
                    onChange={e => setEditingTrade({ ...editingTrade, timestamp: new Date(e.target.value).getTime() })} 
                    className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] transition-all"
                    required 
                  />
                </div>
                <div className="field flex flex-col gap-1 text-xs">
                  <label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">Outcome</label>
                  <select 
                    value={editingTrade.resultType} 
                    onChange={e => setEditingTrade({ ...editingTrade, resultType: e.target.value as TradeResult })}
                    className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] transition-all"
                  >
                    <option value="gain">Profit / Gain (+)</option>
                    <option value="loss">Loss / Drawdown (-)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: PnL Amount and RRR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="field flex flex-col gap-1 text-xs">
                  <label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">PnL Amount ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={editingTrade.amount} 
                    onChange={e => setEditingTrade({ ...editingTrade, amount: parseFloat(e.target.value) || 0 })} 
                    className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] transition-all"
                    min="0.01"
                    required 
                  />
                </div>
                <div className="field flex flex-col gap-1 text-xs">
                  <label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">Risk-to-Reward Ratio (RRR)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={editingTrade.rrr || ''} 
                    onChange={e => setEditingTrade({ ...editingTrade, rrr: parseFloat(e.target.value) || 0 })} 
                    className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] transition-all"
                    placeholder="e.g. 2.5"
                  />
                </div>
              </div>

              {/* Row 4: Entry Price and Stop Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="field flex flex-col gap-1 text-xs">
                  <label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">Entry Price ($)</label>
                  <input 
                    type="number" 
                    step="0.00000001" 
                    value={editingTrade.entryPrice || ''} 
                    onChange={e => setEditingTrade({ ...editingTrade, entryPrice: parseFloat(e.target.value) || undefined })} 
                    className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] transition-all"
                    placeholder="e.g. 50000"
                  />
                </div>
                <div className="field flex flex-col gap-1 text-xs">
                  <label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">Stop Loss / Exit Price ($)</label>
                  <input 
                    type="number" 
                    step="0.00000001" 
                    value={editingTrade.stopPrice || ''} 
                    onChange={e => setEditingTrade({ ...editingTrade, stopPrice: parseFloat(e.target.value) || undefined })} 
                    className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] transition-all"
                    placeholder="e.g. 48000"
                  />
                </div>
              </div>

              {/* Reason / Note Textarea */}
              <div className="field flex flex-col gap-1 text-xs">
                <label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">Note / Analysis Reason</label>
                <textarea 
                  value={editingTrade.reason} 
                  onChange={e => setEditingTrade({ ...editingTrade, reason: e.target.value })} 
                  className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] transition-all min-h-[70px] resize-y"
                  placeholder="Notes about the setups, emotions, context..."
                />
              </div>

              {/* Stop Loss specifics template if outcome is loss */}
              {editingTrade.resultType === 'loss' && (
                <div className="bg-rose-500/5 border border-rose-500/15 p-3.5 rounded-xl flex flex-col gap-2 transition-all">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-rose-500 select-none">
                    <input 
                      type="checkbox" 
                      checked={editingTrade.stopLossHit || false} 
                      onChange={e => setEditingTrade({ ...editingTrade, stopLossHit: e.target.checked })}
                      className="w-4 h-4 rounded accent-rose-500 cursor-pointer"
                    />
                    WAS STOP LOSS TRIGGERED?
                  </label>
                  
                  {editingTrade.stopLossHit && (
                    <div className="flex flex-col gap-2 mt-1">
                      <span className="text-[9px] text-[var(--text-dim)] block font-semibold uppercase tracking-wider">Mistake / Activation Reason:</span>
                      <input 
                        type="text" 
                        placeholder="FOMO Trigger, Spread spread volatility..."
                        value={editingTrade.stopLossReason || ''}
                        onChange={e => setEditingTrade({ ...editingTrade, stopLossReason: e.target.value })}
                        className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-3.5 py-1.5 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] transition-all"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Photo uploader */}
              <div className="border-t border-[var(--border)] pt-4 flex flex-col gap-2 select-none">
                <span className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">Attach Technical Chart</span>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <input 
                    type="file" 
                    id="edit-image-attachment" 
                    accept="image/*" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const compressed = await compressImage(file);
                        setEditingTrade({ ...editingTrade, imageUrl: compressed });
                      }
                    }} 
                    className="hidden" 
                  />
                  <label 
                    htmlFor="edit-image-attachment" 
                    className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--segment-bg)] border-2 border-[var(--border)] hover:border-[var(--accent)] rounded-xl cursor-pointer text-[11px] text-[var(--text)] bg-[var(--input-bg)] font-bold transition-all shadow"
                  >
                    <UploadCloud className="w-4 h-4 text-blue-400" />
                    {editingTrade.imageUrl ? 'Change Photo' : 'Upload Technical Photo'}
                  </label>

                  {editingTrade.imageUrl && (
                    <div className="flex items-center gap-2.5 bg-[var(--input-bg)] pl-2 pr-3 py-1 rounded-xl border border-[var(--border)]">
                      <div className="relative w-8 h-8 rounded overflow-hidden shadow">
                        <img src={editingTrade.imageUrl} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[9px] text-[var(--text-dim)] font-mono">Snapshot Attached</span>
                      <button 
                        type="button" 
                        onClick={() => setEditingTrade({ ...editingTrade, imageUrl: undefined })}
                        className="text-zinc-500 hover:text-rose-400 ml-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Save & Actions */}
              <div className="flex gap-3 justify-end border-t border-[var(--border)] pt-4 mt-1">
                <button 
                  type="button" 
                  onClick={() => setEditingTrade(null)} 
                  className="px-4 py-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--input-bg)] text-xs font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-black uppercase shadow cursor-pointer active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal overlay for image inspection */}
      {/* Floating Status / Toast for Import/Export updates */}
      <AnimatePresence>
        {dataMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-[10000] px-4.5 py-3 rounded-xl shadow-2xl border-2 flex items-center gap-2.5 max-w-sm ${
              dataMessage.type === 'success' 
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/30' 
                : 'bg-rose-950/90 text-rose-300 border-rose-500/30'
            }`}
          >
            <Database className="w-5 h-5 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-sans font-bold text-xs">
                {dataMessage.type === 'success' ? 'Database Synced' : 'Data Sync Error'}
              </span>
              <span className="text-[11px] font-medium opacity-90 leading-tight">
                {dataMessage.text}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" 
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-3xl w-full flex flex-col gap-3 animate-opacity" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setLightboxImage(null)} 
              className="absolute -top-12 right-0 text-[var(--text)] hover:text-rose-400 px-3 py-1.5 font-mono flex items-center gap-1 text-xs bg-[var(--input-bg)] rounded-xl border-2 border-[var(--border)] active:scale-95 transition-all shadow"
            >
              <X className="w-4 h-4" /> CLOSE PREVIEW
            </button>
            <div className="w-full h-auto max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl border-2 border-[var(--border)] flex items-center justify-center bg-black">
              <img src={lightboxImage} className="w-full h-auto object-contain max-h-[80vh]" alt="Attached snap viewer" />
            </div>
            <p className="text-center text-xs text-[var(--text-dim)] font-mono select-none mt-1">Snapshot Inspected Offline</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value, isLarge = false }: { label: string, value: number, isLarge?: boolean }) {
  const isPositive = value >= 0;
  return (
    <div className={`stat-item ${isLarge ? 'large' : ''} ${isPositive ? 'positive' : 'negative'}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value text-xl md:text-2xl font-mono leading-none">
        {isPositive ? '+' : '-'}${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );
}

const container = document.getElementById('root')!;
let root = (window as any).__reactRoot || (container as any).__reactRoot;
if (!root) {
  const hasReactRoot = Object.keys(container).some(key => key.startsWith('__reactContainer'));
  if (hasReactRoot) {
    const parent = container.parentNode;
    if (parent) {
      const newContainer = container.cloneNode(false) as HTMLElement;
      parent.replaceChild(newContainer, container);
      root = ReactDOM.createRoot(newContainer);
      (newContainer as any).__reactRoot = root;
      (window as any).__reactRoot = root;
    } else {
      root = ReactDOM.createRoot(container);
      (container as any).__reactRoot = root;
      (window as any).__reactRoot = root;
    }
  } else {
    root = ReactDOM.createRoot(container);
    (container as any).__reactRoot = root;
    (window as any).__reactRoot = root;
  }
}
root.render(<App />);
