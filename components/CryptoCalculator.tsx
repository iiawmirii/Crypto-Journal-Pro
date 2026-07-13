import React, { useState, useEffect } from 'react';
import { TradeResult, Trade } from '../types';
import { Calculator, ArrowRight, CornerDownLeft, Sparkles, TrendingUp, TrendingDown, Plus, Trash2 } from 'lucide-react';
import { generateId } from '../utils';

interface CryptoCalculatorProps {
  onLogTrade: (trade: Trade) => void;
}

const getDefaultPcts = (length: number): string[] => {
  if (length === 1) return ['100'];
  if (length === 2) return ['50', '50'];
  if (length === 3) return ['40', '30', '30'];
  if (length === 4) return ['25', '25', '25', '25'];
  if (length === 5) return ['20', '20', '20', '20', '20'];
  
  const base = Math.floor(100 / length);
  const remainder = 100 % length;
  return Array.from({ length }, (_, i) => 
    (base + (i < remainder ? 1 : 0)).toString()
  );
};

export default function CryptoCalculator({ onLogTrade }: CryptoCalculatorProps) {
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [entryPrice, setEntryPrice] = useState<string>('50000');
  const [stopLoss, setStopLoss] = useState<string>('48000');
  const [leverage, setLeverage] = useState<string>('10');
  const [margin, setMargin] = useState<string>('100');

  const [targets, setTargets] = useState<{ price: string; pct: string }[]>([
    { price: '52000', pct: '40' },
    { price: '54000', pct: '30' },
    { price: '56000', pct: '30' },
  ]);

  useEffect(() => {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    if (!isNaN(entry) && !isNaN(sl) && entry > 0) {
      const risk = Math.abs(entry - sl);
      const isLong = direction === 'long';
      
      const numTargets = targets.length;
      const defaultPcts = getDefaultPcts(numTargets);

      const newTargets = Array.from({ length: numTargets }, (_, i) => {
        const stepMultiplier = i + 1;
        const targetPriceVal = isLong 
          ? entry + (risk * stepMultiplier)
          : entry - (risk * stepMultiplier);
        return {
          price: Math.max(0, targetPriceVal).toFixed(2),
          pct: targets[i]?.pct || defaultPcts[i]
        };
      });
      setTargets(newTargets);
    }
  }, [entryPrice, stopLoss, direction, targets.length]);

  const entry = parseFloat(entryPrice) || 0;
  const sl = parseFloat(stopLoss) || 0;
  const lev = parseFloat(leverage) || 0;
  const marg = parseFloat(margin) || 0;

  const positionSize = marg * lev;
  const quantity = entry > 0 ? positionSize / entry : 0;

  const isLong = direction === 'long';
  const slDifference = isLong ? entry - sl : sl - entry;
  const lossAtSL = quantity * slDifference;
  const lossPctOfMargin = marg > 0 ? (lossAtSL / marg) * 100 : 0;

  let totalPctClosed = 0;
  let totalProfit = 0;
  let closedWeightedSum = 0;

  const calculatedTargets = targets.map((t, index) => {
    const tgtPrice = parseFloat(t.price) || 0;
    const tgtPct = parseFloat(t.pct) || 0;
    
    totalPctClosed += tgtPct;
    
    const diff = isLong ? tgtPrice - entry : entry - tgtPrice;
    const profitAtStep = quantity * diff * (tgtPct / 100);
    totalProfit += profitAtStep;
    closedWeightedSum += tgtPrice * tgtPct;

    return {
      price: tgtPrice,
      pct: tgtPct,
      profit: profitAtStep,
    };
  });

  const averageExitPrice = totalPctClosed > 0 ? closedWeightedSum / totalPctClosed : 0;
  const netRRR = lossAtSL > 0 ? totalProfit / lossAtSL : 0;

  const handleUpdateTarget = (index: number, field: 'price' | 'pct', value: string) => {
    const next = [...targets];
    next[index] = { ...next[index], [field]: value };
    setTargets(next);
  };

  const handleAddTarget = () => {
    const nextLength = targets.length + 1;
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const isLong = direction === 'long';

    let newPrice = '';
    if (!isNaN(entry) && !isNaN(sl) && entry > 0) {
      const risk = Math.abs(entry - sl);
      const targetPriceVal = isLong 
        ? entry + (risk * nextLength)
        : entry - (risk * nextLength);
      newPrice = Math.max(0, targetPriceVal).toFixed(2);
    }

    const defaultPcts = getDefaultPcts(nextLength);
    const updatedTargets = [
      ...targets.map((t, idx) => ({ ...t, pct: defaultPcts[idx] })),
      { price: newPrice, pct: defaultPcts[nextLength - 1] }
    ];
    setTargets(updatedTargets);
  };

  const handleDeleteTarget = (indexToDelete: number) => {
    if (targets.length <= 1) return;
    const nextLength = targets.length - 1;
    const filtered = targets.filter((_, idx) => idx !== indexToDelete);

    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const isLong = direction === 'long';
    const defaultPcts = getDefaultPcts(nextLength);

    const updatedTargets = filtered.map((t, idx) => {
      let priceVal = t.price;
      if (!isNaN(entry) && !isNaN(sl) && entry > 0) {
        const risk = Math.abs(entry - sl);
        const targetPriceVal = isLong 
          ? entry + (risk * (idx + 1))
          : entry - (risk * (idx + 1));
        priceVal = Math.max(0, targetPriceVal).toFixed(2);
      }
      return {
        price: priceVal,
        pct: defaultPcts[idx]
      };
    });

    setTargets(updatedTargets);
  };

  const [tradeForm, setTradeForm] = useState({
    pair: 'BTC/USDT',
    reason: '',
  });

  const handleCreateTrade = (type: 'gain' | 'loss') => {
    let amount = type === 'gain' ? totalProfit : lossAtSL;
    if (isNaN(amount) || amount < 0) amount = 0;

    const newTrade: Trade = {
      id: generateId(),
      pair: tradeForm.pair.toUpperCase() || 'CALC/USDT',
      timestamp: Date.now(),
      resultType: type,
      amount: parseFloat(amount.toFixed(2)),
      rrr: parseFloat(netRRR.toFixed(2)) || 0,
      reason: `[Imported from Calc] ${direction.toUpperCase()} Entry: $${entry} | SL: $${sl} | Lev: ${lev}x | Margin: $${marg}. ${tradeForm.reason}`,
      direction: direction,
      entryPrice: entry,
      stopPrice: sl,
      stopLossHit: type === 'loss',
      stopLossReason: type === 'loss' ? 'Calculated Stop Loss trigger' : undefined
    };

    onLogTrade(newTrade);
    setToastMessage(`Trade Successfully Committed Offline! (${type.toUpperCase()} PnL logged)`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  return (
    <div className="card flex flex-col gap-5" id="crypto-calculator-section" style={{ color: 'var(--text)' }}>
      <div className="flex items-center justify-between border-b pb-4 flex-wrap gap-2" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <Calculator className="text-blue-500 w-5 h-5 shrink-0" />
          <div>
            <h2 className="text-base font-extrabold tracking-tight">CRYPTO FUTURES CALCULATOR</h2>
            <p className="text-xs text-[var(--text-dim)]">Plan leverage, margins, targets, and risk tolerance offline.</p>
          </div>
        </div>
        
        {toastMessage && (
          <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-semibold px-3 py-1 rounded-lg border border-emerald-500/20 animate-pulse">
            {toastMessage}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Side: Inputs */}
        <div className="flex flex-col gap-4">
          <div className="flex p-1 rounded-full border border-[var(--border)] bg-[var(--input-bg)] select-none">
              <button
                onClick={() => setDirection('long')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold transition-all ${direction === 'long' ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> LONG POSITION
            </button>
              <button
                onClick={() => setDirection('short')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold transition-all ${direction === 'short' ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
            >
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" /> SHORT POSITION
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="field">
              <label>Entry Price ($)</label>
              <input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="50000"
                className="w-full"
              />
            </div>
            <div className="field">
              <label>Stop Loss Price ($)</label>
              <input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="48000"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="field">
              <label>Leverage (X)</label>
              <input
                type="number"
                value={leverage}
                onChange={(e) => setLeverage(e.target.value)}
                placeholder="10"
                className="w-full"
              />
            </div>
            <div className="field">
              <label>Margin ($)</label>
              <input
                type="number"
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                placeholder="100"
                className="w-full"
              />
            </div>
          </div>

          {/* Computed Basic States */}
          <div className="computed-stats-box">
            <div className="flex justify-between items-center gap-4">
              <span className="font-medium text-[var(--text-dim)]">Total Position Size:</span>
              <span className="font-bold text-[var(--text)]">${positionSize.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="font-medium text-[var(--text-dim)]">Asset Amount (Qty):</span>
              <span className="font-bold text-[var(--text)]">{quantity.toFixed(5)} units</span>
            </div>
            <div className="flex justify-between items-center computed-stats-box-divider gap-4">
              <span className="font-medium text-[var(--text-dim)]">PnL at Stop Loss:</span>
              <span className="font-bold text-[var(--loss)]">
                -${lossAtSL.toFixed(2)} ({lossPctOfMargin.toFixed(1)}% of margin)
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Step Target Outputs */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
            <span className="text-[10px] font-bold tracking-wider text-[var(--text-dim)] uppercase">
              TAKE-PROFIT TARGETS ({targets.length})
            </span>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold bg-[var(--accent-soft)] hover:bg-[var(--accent)] text-[var(--accent)] hover:text-[var(--button-primary-text)] rounded-full transition-all border border-[var(--border)] active:scale-95 shadow-sm cursor-pointer"
              onClick={handleAddTarget}
            >
              <Plus className="w-3.5 h-3.5" /> ADD TARGET
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {targets.map((t, idx) => {
              const stepCalc = calculatedTargets[idx] || { price: 0, pct: 0, profit: 0 };
              return (
                <div key={idx} className="flex gap-3 items-center py-2 px-3 rounded-xl border border-[var(--border)]" style={{ background: 'var(--input-bg)' }}>
                  <span className="text-[10px] w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold shrink-0" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[var(--text-dim)]">Tgt:</span>
                      <input
                        type="number"
                        value={t.price}
                        onChange={(e) => handleUpdateTarget(idx, 'price', e.target.value)}
                        className="py-1 px-2 text-xs rounded font-mono w-full transition-all border border-[var(--border)] focus:border-[var(--accent)]"
                        style={{ background: 'var(--card-bg)', color: 'var(--text)' }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[var(--text-dim)]">Size%:</span>
                      <input
                        type="number"
                        value={t.pct}
                        onChange={(e) => handleUpdateTarget(idx, 'pct', e.target.value)}
                        className="py-1 px-2 text-xs rounded font-mono w-16 transition-all border border-[var(--border)] focus:border-[var(--accent)]"
                        style={{ background: 'var(--card-bg)', color: 'var(--text)' }}
                        max="100"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="text-right pl-2 shrink-0 font-mono text-[11px] font-bold min-w-[70px]">
                    <span className={`inline-block px-2 py-0.5 rounded border ${
                      stepCalc.profit >= 0 
                        ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-500' 
                        : 'bg-rose-500/10 border-rose-500/15 text-rose-500'
                    }`} style={{ color: stepCalc.profit >= 0 ? 'var(--gain)' : 'var(--loss)' }}>
                      {stepCalc.profit >= 0 ? '+' : ''}${stepCalc.profit.toFixed(1)}
                    </span>
                  </div>
                  {targets.length > 1 && (
                    <button
                      onClick={() => handleDeleteTarget(idx)}
                      className="text-[var(--text-dim)] hover:text-rose-500 p-1 rounded transition-all cursor-pointer hover:bg-[var(--card-bg)] shrink-0"
                      title="Delete target step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="computed-stats-box">
            <div className="flex justify-between items-center gap-4">
              <span className="font-medium text-[var(--text-dim)]">Cumulative Profit (100% Exit):</span>
              <span className="font-bold text-sm text-[var(--gain)]">${totalProfit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="font-medium text-[var(--text-dim)]">Closing Allocation:</span>
              <span className="font-bold" style={{ color: totalPctClosed === 100 ? 'var(--gain)' : 'var(--accent)' }}>
                {totalPctClosed}% closed
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="font-medium text-[var(--text-dim)]">Est. Average Exit Price:</span>
              <span className="font-semibold text-[var(--text)]">${averageExitPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center computed-stats-box-divider gap-4">
              <span className="font-bold text-[var(--text-dim)]">Planned Risk-to-Reward Ratio:</span>
              <span className="font-bold text-xs text-[var(--accent)]">1 : {netRRR.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Journal Logger Section */}
      <div className="quick-journal-wrapper">
        <h3 className="quick-journal-title">
          <CornerDownLeft className="w-3.5 h-3.5 text-blue-500" /> LOG DIRECTLY TO OFFLINE JOURNAL
        </h3>
        <div className="quick-journal-grid">
          <div className="field">
            <label>Trading Pair</label>
            <input
              type="text"
              value={tradeForm.pair}
              onChange={(e) => setTradeForm(prev => ({ ...prev, pair: e.target.value }))}
              placeholder="BTC/USDT"
            />
          </div>
          <div className="field">
            <label>Optional Execution Notes</label>
            <input
              type="text"
              value={tradeForm.reason}
              onChange={(e) => setTradeForm(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Any additional thoughts or observation on execution...?"
            />
          </div>
        </div>

        <div className="quick-journal-actions">
          <button
            className="flex-1 py-2.5 text-white shadow-sm font-extrabold rounded-lg text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 bg-[#10b981] hover:bg-[#059669] active:scale-95 disabled:bg-[var(--border)] disabled:text-[var(--text-dim)] disabled:opacity-40 disabled:cursor-not-allowed duration-150"
            onClick={() => handleCreateTrade('gain')}
            disabled={!(entry > 0 && marg > 0)}
          >
            LOG PROFIT (+${totalProfit.toFixed(2)})
          </button>
          <button
            className="flex-1 py-2.5 text-white shadow-sm font-extrabold rounded-lg text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 bg-[#f43f5e] hover:bg-[#e11d48] active:scale-95 disabled:bg-[var(--border)] disabled:text-[var(--text-dim)] disabled:opacity-40 disabled:cursor-not-allowed duration-150"
            onClick={() => handleCreateTrade('loss')}
            disabled={!(entry > 0 && marg > 0)}
          >
            LOG STOP LOSS (-${lossAtSL.toFixed(2)})
          </button>
        </div>
      </div>
    </div>
  );
}
