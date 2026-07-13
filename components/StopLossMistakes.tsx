import React from 'react';
import { Trade } from '../types';
import { ShieldAlert, AlertCircle, Frown, TrendingDown, BookOpen } from 'lucide-react';

interface StopLossMistakesProps {
  trades: Trade[];
}

export default function StopLossMistakes({ trades }: StopLossMistakesProps) {
  // Filter for Trades where StopLoss was hit
  const slTrades = trades.filter(t => t.stopLossHit === true);

  // Group reasons and calculate frequencies and losses
  const reasonStats = slTrades.reduce((acc, t) => {
    const r = (t.stopLossReason || 'Unspecified / Technical Stop').trim();
    if (!acc[r]) {
      acc[r] = { count: 0, totalLoss: 0 };
    }
    acc[r].count += 1;
    acc[r].totalLoss += t.amount;
    return acc;
  }, {} as Record<string, { count: number; totalLoss: number }>);

  // Convert to array and sort by count/amount lost
  const groupedMistakes = Object.entries(reasonStats).map(([reason, data]) => ({
    reason,
    count: data.count,
    totalLoss: data.totalLoss,
  })).sort((a, b) => b.totalLoss - a.totalLoss);

  const totalSLHitsCount = slTrades.length;
  const totalSLLostAmount = slTrades.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="card flex flex-col gap-5" id="sl-mistakes-archive" style={{ color: 'var(--text)' }}>
      <div className="flex items-center justify-between border-b pb-4 flex-wrap gap-2" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-rose-500 w-5 h-5 shrink-0" />
          <div>
            <h2 className="text-base font-extrabold tracking-tight">Stop-Loss History</h2>
            <p className="text-xs text-[var(--text-dim)]">Review your stop-loss activations and recurring mistakes.</p>
          </div>
        </div>
        <div className="flex bg-rose-500/10 text-rose-500 px-3 py-1 border border-rose-500/15 rounded-full font-mono text-[10px] font-semibold tracking-wider">
          {totalSLHitsCount} STOP LOG{totalSLHitsCount !== 1 ? 'S' : ''} ACTIVE
        </div>
      </div>

      {groupedMistakes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Key statistical box */}
          <div className="md:col-span-1 p-5 rounded-2xl flex flex-col justify-between gap-5 border border-[var(--border)]" 
               style={{ 
                 background: 'linear-gradient(135deg, var(--segment-bg) 0%, rgba(239, 68, 68, 0.03) 100%)',
               }}>
            <div>
              <span className="text-[9px] text-rose-500 font-bold tracking-widest block mb-1">Summary</span>
              <h3 className="font-extrabold text-lg tracking-tight" style={{ color: 'var(--text)' }}>Overview</h3>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                You have hit your stop-loss <b style={{ color: 'var(--loss)' }}>{totalSLHitsCount} times</b>, contributing to a total drawdown loss of <b style={{ color: 'var(--loss)' }}>${totalSLLostAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>.
              </p>
            </div>
            
            <div className="p-3 rounded-xl border font-mono text-[10px] flex items-start gap-2" style={{ background: 'var(--input-bg)', borderColor: 'var(--border)', color: 'var(--text-dim)' }}>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-normal">Track patterns to avoid repeating the same mistakes.</span>
            </div>
          </div>

          {/* Grouped Mistakes List */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <span className="text-[10px] font-semibold tracking-widest uppercase block text-[var(--text-dim)]">Trigger Frequency</span>
            
            <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
              {groupedMistakes.map((item, idx) => (
                <div key={item.reason} className="p-4 rounded-xl border flex justify-between items-center gap-4 transition-all hover:bg-[var(--accent-soft)]" 
                     style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                  <div className="flex items-start gap-3">
                    <span className="text-[10px] font-mono font-bold w-6 h-6 rounded-lg flex items-center justify-center border border-[var(--border)]" 
                          style={{ background: 'var(--input-bg)', color: 'var(--text-dim)' }}>
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold leading-none font-sans" style={{ color: 'var(--text)' }}>
                        &ldquo;{item.reason}&rdquo;
                      </h4>
                      <p className="text-[10px] mt-1.5 italic" style={{ color: 'var(--text-dim)' }}>
                        Triggered {item.count} time{item.count !== 1 ? 's' : ''} ({((item.count / totalSLHitsCount) * 100).toFixed(0)}% of stops)
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] font-mono block text-[var(--text-dim)]">Loss</span>
                    <span className="text-xs font-mono font-semibold" style={{ color: 'var(--loss)' }}>-${item.totalLoss.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      ) : (
        <div className="p-10 border border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-center" 
             style={{ borderColor: 'var(--border)', background: 'var(--input-bg)' }}>
          <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-400 mb-1">
            <Frown className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>No stop-losses logged yet!</p>
          <p className="text-[11px] max-w-sm text-[var(--text-dim)] leading-relaxed">
            When logging trades with a negative outcome in the journal tab, ensure to select the stop-loss checkbox to begin populating recurring triggers.
          </p>
        </div>
      )}

      {/* Audit Historic Trades Segment */}
      <div className="border-t pt-4 flex flex-col gap-3" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 text-[var(--text-dim)]">
          <TrendingDown className="w-3.5 h-3.5 text-rose-500" /> Recent Stop-Loss Log
        </h3>
        
        {slTrades.length === 0 ? (
          <p className="text-xs italic py-2 text-[var(--text-dim)]">No stop-losses recorded.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {slTrades.slice(0, 6).map(trade => (
              <div 
                key={trade.id} 
                className="p-3 rounded-lg border flex flex-col gap-1.5 relative bg-[var(--input-bg)]" 
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs" style={{ color: 'var(--text)' }}>{trade.pair}</span>
                  <span className="text-[11px] font-mono font-medium" style={{ color: 'var(--loss)' }}>-${trade.amount.toFixed(2)}</span>
                </div>
                <div className="text-[10px] leading-relaxed italic text-[var(--text-dim)]">
                  Reason: &ldquo;{trade.stopLossReason || 'Standard/Technical hit'}&rdquo;
                </div>
                <div className="text-[9px] font-mono text-[var(--text-dim)]">
                  {new Date(trade.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
