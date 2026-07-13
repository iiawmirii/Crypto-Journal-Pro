import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactDOM from 'react-dom/client';
import { Trade, TradeResult, Stats } from './types';
import { generateId } from './utils';
import CryptoCalculator from './components/CryptoCalculator';
import StopLossMistakes from './components/StopLossMistakes';
import PnLStats from './components/PnLStats';
import SettingsTab from './components/SettingsTab';
import { 
  Activity, 
  ArrowUpRight, 
  TrendingUp, 
  TrendingDown, 
  Tag, 
  Calculator, 
  ShieldAlert, 
  Image as ImageIcon, 
  Upload, 
  X, 
  BookOpen, 
  Trash2, 
  Maximize2,
  Sun,
  Moon,
  Settings,
  Check,
  Terminal,
  ChevronDown,
  Calendar,
  BarChart3,
  Edit3,
  Database,
  Download
} from 'lucide-react';

type AppTheme = 'light' | 'dark' | 'amoled';

interface M3ColorSet {
  accent: string;
  accentSoft: string;
  accentGlow: string;
  buttonPrimaryBg: string;
  buttonPrimaryText: string;
  segmentSelected: string;
  segmentSelectedText: string;
  bg?: string;
  bgGradient?: string;
  cardBg?: string;
  border?: string;
}

interface M3ThemePalette {
  id: string;
  light: M3ColorSet;
  dark: M3ColorSet;
}

const PALETTES: M3ThemePalette[] = [
  {
    id: 'blue',
    light: {
      accent: '#00639b',
      accentSoft: '#cbe6ff',
      accentGlow: 'rgba(0, 99, 155, 0.12)',
      buttonPrimaryBg: '#00639b',
      buttonPrimaryText: '#ffffff',
      segmentSelected: '#cbe6ff',
      segmentSelectedText: '#001d35',
      bg: '#f8f9ff',
      bgGradient: 'radial-gradient(120% 120% at 50% 10%, #f8f9ff 40%, #eef3ff 100%)',
      cardBg: '#ffffff',
      border: '#dee3eb'
    },
    dark: {
      accent: '#93ccff',
      accentSoft: '#004a75',
      accentGlow: 'rgba(147, 204, 255, 0.15)',
      buttonPrimaryBg: '#93ccff',
      buttonPrimaryText: '#003354',
      segmentSelected: '#004a75',
      segmentSelectedText: '#cbe6ff',
      bg: '#0f131a',
      bgGradient: 'radial-gradient(120% 120% at 50% 10%, #0f131a 50%, #171d26 100%)',
      cardBg: '#171d26',
      border: '#3a414c'
    }
  },
  {
    id: 'purple',
    light: {
      accent: '#6750a4',
      accentSoft: '#e8def8',
      accentGlow: 'rgba(103, 80, 164, 0.12)',
      buttonPrimaryBg: '#6750a4',
      buttonPrimaryText: '#ffffff',
      segmentSelected: '#e8def8',
      segmentSelectedText: '#21005d',
      bg: '#fef7ff',
      bgGradient: 'radial-gradient(120% 120% at 50% 10%, #fef7ff 40%, #f3edf7 100%)',
      cardBg: '#ffffff',
      border: '#e6e0e9'
    },
    dark: {
      accent: '#d0bcff',
      accentSoft: '#4f378b',
      accentGlow: 'rgba(208, 188, 255, 0.15)',
      buttonPrimaryBg: '#d0bcff',
      buttonPrimaryText: '#381e72',
      segmentSelected: '#4f378b',
      segmentSelectedText: '#e8def8',
      bg: '#141218',
      bgGradient: 'radial-gradient(120% 120% at 50% 10%, #141218 50%, #1d1b20 100%)',
      cardBg: '#1d1b20',
      border: '#49454f'
    }
  },
  {
    id: 'jade',
    light: {
      accent: '#386a20',
      accentSoft: '#e9f5dd',
      accentGlow: 'rgba(56, 106, 32, 0.12)',
      buttonPrimaryBg: '#386a20',
      buttonPrimaryText: '#ffffff',
      segmentSelected: '#e9f5dd',
      segmentSelectedText: '#042100',
      bg: '#f7faf3',
      bgGradient: 'radial-gradient(120% 120% at 50% 10%, #f7faf3 40%, #edf3e4 100%)',
      cardBg: '#ffffff',
      border: '#e1e5d9'
    },
    dark: {
      accent: '#b1d18a',
      accentSoft: '#205115',
      accentGlow: 'rgba(177, 209, 138, 0.15)',
      buttonPrimaryBg: '#b1d18a',
      buttonPrimaryText: '#113807',
      segmentSelected: '#205115',
      segmentSelectedText: '#e9f5dd',
      bg: '#10140f',
      bgGradient: 'radial-gradient(120% 120% at 50% 10%, #10140f 50%, #171c15 100%)',
      cardBg: '#171c15',
      border: '#3e4438'
    }
  },
  {
    id: 'terracotta',
    light: {
      accent: '#ba1a1a',
      accentSoft: '#ffdad6',
      accentGlow: 'rgba(186, 26, 26, 0.12)',
      buttonPrimaryBg: '#ba1a1a',
      buttonPrimaryText: '#ffffff',
      segmentSelected: '#ffdad6',
      segmentSelectedText: '#410002',
      bg: '#fff8f7',
      bgGradient: 'radial-gradient(120% 120% at 50% 10%, #fff8f7 40%, #fceeec 100%)',
      cardBg: '#ffffff',
      border: '#f5dedc'
    },
    dark: {
      accent: '#ffb4ab',
      accentSoft: '#93000a',
      accentGlow: 'rgba(255, 180, 171, 0.15)',
      buttonPrimaryBg: '#ffb4ab',
      buttonPrimaryText: '#690005',
      segmentSelected: '#93000a',
      segmentSelectedText: '#ffdad6',
      bg: '#1a1110',
      bgGradient: 'radial-gradient(120% 120% at 50% 10%, #1a1110 50%, #231918 100%)',
      cardBg: '#231918',
      border: '#524341'
    }
  },
  {
    id: 'peach',
    light: {
      accent: '#8b5000',
      accentSoft: '#ffdcbe',
      accentGlow: 'rgba(139, 80, 0, 0.12)',
      buttonPrimaryBg: '#8b5000',
      buttonPrimaryText: '#ffffff',
      segmentSelected: '#ffdcbe',
      segmentSelectedText: '#2c1600',
      bg: '#fff8f3',
      bgGradient: 'radial-gradient(120% 120% at 50% 10%, #fff8f3 40%, #faeee4 100%)',
      cardBg: '#ffffff',
      border: '#f2dfd1'
    },
    dark: {
      accent: '#ffb85d',
      accentSoft: '#562f00',
      accentGlow: 'rgba(255, 184, 93, 0.15)',
      buttonPrimaryBg: '#ffb85d',
      buttonPrimaryText: '#301400',
      segmentSelected: '#562f00',
      segmentSelectedText: '#ffdcbe',
      bg: '#18120c',
      bgGradient: 'radial-gradient(120% 120% at 50% 10%, #18120c 50%, #211a12 100%)',
      cardBg: '#211a12',
      border: '#4f453a'
    }
  },
  {
    id: 'teal',
    light: {
      accent: '#006a6a',
      accentSoft: '#bfebeb',
      accentGlow: 'rgba(0, 106, 106, 0.12)',
      buttonPrimaryBg: '#006a6a',
      buttonPrimaryText: '#ffffff',
      segmentSelected: '#bfebeb',
      segmentSelectedText: '#002020',
      bg: '#f4fafb',
      bgGradient: 'radial-gradient(120% 120% at 50% 10%, #f4fafb 40%, #e6f2f3 100%)',
      cardBg: '#ffffff',
      border: '#dbe4e5'
    },
    dark: {
      accent: '#80d5d4',
      accentSoft: '#005050',
      accentGlow: 'rgba(128, 213, 212, 0.15)',
      buttonPrimaryBg: '#80d5d4',
      buttonPrimaryText: '#003737',
      segmentSelected: '#005050',
      segmentSelectedText: '#bfebeb',
      bg: '#0d1515',
      bgGradient: 'radial-gradient(120% 120% at 50% 10%, #0d1515 50%, #151e1e 100%)',
      cardBg: '#151e1e',
      border: '#3a4445'
    }
  },
  {
    id: 'rose',
    light: {
      accent: '#984061',
      accentSoft: '#ffd9e2',
      accentGlow: 'rgba(152, 64, 97, 0.12)',
      buttonPrimaryBg: '#984061',
      buttonPrimaryText: '#ffffff',
      segmentSelected: '#ffd9e2',
      segmentSelectedText: '#3e001d',
      bg: '#fff8f8',
      bgGradient: 'radial-gradient(120% 120% at 50% 10%, #fff8f8 40%, #faedf0 100%)',
      cardBg: '#ffffff',
      border: '#f4dde2'
    },
    dark: {
      accent: '#ffb1c8',
      accentSoft: '#7d2249',
      accentGlow: 'rgba(255, 177, 200, 0.15)',
      buttonPrimaryBg: '#ffb1c8',
      buttonPrimaryText: '#5e0031',
      segmentSelected: '#7d2249',
      segmentSelectedText: '#ffd9e2',
      bg: '#1b1114',
      bgGradient: 'radial-gradient(120% 120% at 50% 10%, #1b1114 50%, #24181a 100%)',
      cardBg: '#24181a',
      border: '#514347'
    }
  },
  {
    id: 'emerald',
    light: {
      accent: '#006e1c',
      accentSoft: '#b6f5b3',
      accentGlow: 'rgba(0, 110, 28, 0.12)',
      buttonPrimaryBg: '#006e1c',
      buttonPrimaryText: '#ffffff',
      segmentSelected: '#b6f5b3',
      segmentSelectedText: '#002203',
      bg: '#f5faf4',
      bgGradient: 'radial-gradient(120% 120% at 50% 10%, #f5faf4 40%, #e7f2e6 100%)',
      cardBg: '#ffffff',
      border: '#dbe4db'
    },
    dark: {
      accent: '#9bd898',
      accentSoft: '#005311',
      accentGlow: 'rgba(155, 216, 152, 0.15)',
      buttonPrimaryBg: '#9bd898',
      buttonPrimaryText: '#00390a',
      segmentSelected: '#005311',
      segmentSelectedText: '#b6f5b3',
      bg: '#0e1510',
      bgGradient: 'radial-gradient(120% 120% at 50% 10%, #0e1510 50%, #151f16 100%)',
      cardBg: '#151f16',
      border: '#3a443b'
    }
  },
  {
    id: 'crimson',
    light: {
      accent: '#b52555',
      accentSoft: '#ffd9e1',
      accentGlow: 'rgba(181, 37, 85, 0.12)',
      buttonPrimaryBg: '#b52555',
      buttonPrimaryText: '#ffffff',
      segmentSelected: '#ffd9e1',
      segmentSelectedText: '#3f0015',
      bg: '#fff8f8',
      bgGradient: 'radial-gradient(120% 120% at 50% 10%, #fff8f8 40%, #faecee 100%)',
      cardBg: '#ffffff',
      border: '#f5dedf'
    },
    dark: {
      accent: '#ffb1c3',
      accentSoft: '#91023a',
      accentGlow: 'rgba(255, 177, 195, 0.15)',
      buttonPrimaryBg: '#ffb1c3',
      buttonPrimaryText: '#5f0022',
      segmentSelected: '#91023a',
      segmentSelectedText: '#ffd9e1',
      bg: '#1c1112',
      bgGradient: 'radial-gradient(120% 120% at 50% 10%, #1c1112 50%, #25191b 100%)',
      cardBg: '#25191b',
      border: '#524344'
    }
  }
];

const applyM3Theme = (themeCategory: 'light' | 'dark' | 'amoled', colorId: string) => {
  document.body.setAttribute('data-theme', themeCategory);
  const body = document.body;
  
  if (themeCategory === 'amoled') {
    body.style.removeProperty('--accent');
    body.style.removeProperty('--accent-soft');
    body.style.removeProperty('--accent-glow');
    body.style.removeProperty('--button-primary-bg');
    body.style.removeProperty('--button-primary-text');
    body.style.removeProperty('--segment-selected');
    body.style.removeProperty('--segment-selected-text');
    body.style.removeProperty('--bg');
    body.style.removeProperty('--bg-gradient');
    body.style.removeProperty('--card-bg');
    body.style.removeProperty('--border');
    return;
  }
  
  const palette = PALETTES.find(p => p.id === colorId) || PALETTES[0];
  const target = themeCategory === 'light' ? palette.light : palette.dark;
  
  body.style.setProperty('--accent', target.accent);
  body.style.setProperty('--accent-soft', target.accentSoft);
  body.style.setProperty('--accent-glow', target.accentGlow);
  body.style.setProperty('--button-primary-bg', target.buttonPrimaryBg);
  body.style.setProperty('--button-primary-text', target.buttonPrimaryText);
  body.style.setProperty('--segment-selected', target.segmentSelected);
  body.style.setProperty('--segment-selected-text', target.segmentSelectedText);
  
  if (target.bg) body.style.setProperty('--bg', target.bg);
  else body.style.removeProperty('--bg');

  if (target.bgGradient) body.style.setProperty('--bg-gradient', target.bgGradient);
  else body.style.removeProperty('--bg-gradient');

  if (target.cardBg) body.style.setProperty('--card-bg', target.cardBg);
  else body.style.removeProperty('--card-bg');

  if (target.border) body.style.setProperty('--border', target.border);
  else body.style.removeProperty('--border');
};

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

const TABS = [
  { id: 'journal' as const, label: 'Journal', icon: BookOpen },
  { id: 'calculator' as const, label: 'Calculator', icon: Calculator },
  { id: 'stats' as const, label: 'Stats', icon: BarChart3 },
  { id: 'mistakes' as const, label: 'Lessons', icon: ShieldAlert },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

function App() {
  const [activeTab, setActiveTab] = useState<'journal' | 'calculator' | 'stats' | 'mistakes' | 'settings'>('journal');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [theme, setTheme] = useState<AppTheme>('dark');
  const [accentColorId, setAccentColorId] = useState<string>('blue');
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  
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

  const isValidTrade = (item: any): item is Trade => (
    item && typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.pair === 'string' &&
    typeof item.timestamp === 'number' && item.timestamp > 0 &&
    (item.resultType === 'gain' || item.resultType === 'loss') &&
    typeof item.amount === 'number' && item.amount >= 0 &&
    typeof item.rrr === 'number' &&
    typeof item.reason === 'string'
  );

  const importTrades = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          const isValid = parsed.every(isValidTrade);
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

  useEffect(() => {
    let savedTheme = localStorage.getItem('crypto_theme_v1') as 'light' | 'dark';
    if (savedTheme as any === 'colored') {
      savedTheme = 'dark';
    }
    const savedAccent = localStorage.getItem('crypto_accent_v1') || 'blue';
    
    const activeT: AppTheme = savedTheme || 'dark';
    setTheme(activeT);
    setAccentColorId(savedAccent);
    applyM3Theme(activeT, savedAccent);
  }, []);

  const changeTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    localStorage.setItem('crypto_theme_v1', newTheme);
    applyM3Theme(newTheme, accentColorId);
  };

  const changeAccentColor = (newAccent: string) => {
    setAccentColorId(newAccent);
    localStorage.setItem('crypto_accent_v1', newAccent);
    applyM3Theme(theme, newAccent);
  };

  useEffect(() => {
    const savedTrades = localStorage.getItem('crypto_trades_v1');
    if (savedTrades) {
      try {
        const parsed = JSON.parse(savedTrades);
        if (Array.isArray(parsed)) {
          setTrades(parsed.filter(isValidTrade));
        }
      } catch (e) {
        console.error("Error loading offline trades", e);
      }
    }
  }, []);

  const saveTrades = (newTrades: Trade[]) => {
    setTrades(newTrades);
    localStorage.setItem('crypto_trades_v1', JSON.stringify(newTrades));
  };

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
    <div className="app-container pb-24 md:pb-8">
      <header className="main-header select-none">
        <div className="header-inner px-6 flex items-center justify-between md:grid md:grid-cols-3">
          
          {/* Logo */}
          <div className="flex items-center gap-4 justify-self-start relative z-50">
            <div className="logo cursor-default flex items-center gap-2">
              <Activity className="text-[var(--accent)] w-5 h-5 animate-pulse" />
              <span className="font-sans font-extrabold tracking-tight">
                CRYPTO<b className="text-[var(--accent)]">JOURNAL</b>
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-[var(--accent-soft)] text-[var(--accent)] font-mono font-semibold tracking-wider rounded border border-[var(--border)] uppercase inline-flex items-center select-none">
                PRO
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex justify-self-center">
            <div className="flex items-center gap-4">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative flex flex-col items-center gap-1 group px-2.5 py-1 cursor-pointer outline-none active:scale-95 transition-transform"
                  >
                    <div className="relative w-16 h-8 flex items-center justify-center rounded-full overflow-hidden transition-all duration-300">
                      {isActive && (
                        <motion.div
                          layoutId="m3-active-pill"
                          className="absolute inset-0 bg-[var(--accent-soft)]"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <Icon className={`w-5 h-5 transition-colors relative z-10 ${isActive ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-dim)] group-hover:text-[var(--text)]'}`} />
                    </div>
                    <span className={`text-[10px] font-bold tracking-widest transition-colors select-none ${isActive ? 'text-[var(--text)] font-extrabold' : 'text-[var(--text-dim)] group-hover:text-[var(--text)]'}`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right spacer */}
          <div className="flex items-center gap-3.5 justify-self-end relative">
          </div>

        </div>
      </header>

      <main className="dashboard-grid">
        {/* Left column statistics list */}
        <section className={`stats-panel mb-4 lg:mb-0 ${activeTab !== 'journal' ? 'hide-stats-on-mobile' : ''}`}>

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
                    <BookOpen className="w-4 h-4 text-teal-400" /> Log Trade
                  </h2>
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
                                className="px-2 py-0.5 bg-[var(--input-bg)] hover:bg-[var(--segment-bg)] rounded-md border border-[var(--border)] hover:border-[var(--accent)] transition-all text-[var(--text-dim)] hover:text-[var(--text)] font-semibold"
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
                        <Upload className="w-4 h-4 text-blue-400" />
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
                              {trade.direction && (
                                <span className={`text-[9px] px-1.5 py-0.5 font-bold tracking-tight rounded select-none ${
                                  trade.direction === 'short' 
                                    ? 'bg-rose-500/15 text-rose-500 border-2 border-rose-500/20' 
                                    : 'bg-emerald-500/15 text-emerald-500 border-2 border-emerald-500/20'
                                }`}>
                                  {trade.direction.toUpperCase()}
                                </span>
                              )}
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
                          className="edit-btn active:scale-90"
                          onClick={() => setEditingTrade(trade)}
                          title="Edit trade details"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[var(--text-dim)] hover:text-[var(--accent)] transition-all" />
                        </button>

                        <button
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

          {activeTab === 'settings' && (
            <SettingsTab
              theme={theme}
              accentColorId={accentColorId}
              onThemeChange={changeTheme}
              onAccentColorChange={changeAccentColor}
              onExport={exportTrades}
              onImport={importTrades}
              dataMessage={dataMessage}
              tradesCount={trades.length}
            />
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
              <div className={editingTrade.direction ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "grid grid-cols-1 gap-4"}>
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
                {editingTrade.direction && (
                  <div className="field flex flex-col gap-1 text-xs">
                    <label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">Direction</label>
                    <select 
                      value={editingTrade.direction} 
                      onChange={e => setEditingTrade({ ...editingTrade, direction: e.target.value as 'long' | 'short' })}
                      className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] transition-all"
                    >
                      <option value="long">Long</option>
                      <option value="short">Short</option>
                    </select>
                  </div>
                )}
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
                    <Upload className="w-4 h-4 text-blue-400" />
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

      {/* Toast notification */}
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
                {dataMessage.type === 'success' ? 'Saved' : 'Save Error'}
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

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[999] border-t border-[var(--border)] bg-[var(--header-bg)] backdrop-blur-xl pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex justify-around items-center h-[76px] px-2 select-none">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-1 cursor-pointer outline-none relative active:scale-95 transition-transform"
            >
              <div className="relative w-14 h-8 flex items-center justify-center rounded-full overflow-hidden transition-all duration-200">
                {isActive && (
                  <motion.div
                    layoutId="m3-active-pill-mobile"
                    className="absolute inset-0 bg-[var(--accent-soft)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`w-5.5 h-5.5 transition-colors relative z-10 ${isActive ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-dim)]'}`} />
              </div>
              <span className={`text-[10px] font-bold tracking-wider transition-colors select-none ${isActive ? 'text-[var(--text)] font-extrabold' : 'text-[var(--text-dim)]'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
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
const root = ReactDOM.createRoot(container);
root.render(<App />);
