import React, { useState, useMemo } from 'react';
import { Trade } from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Activity, 
  Edit3, 
  ArrowUpRight,
  CalendarDays,
  Target,
  FileSpreadsheet
} from 'lucide-react';
import { motion } from 'motion/react';

interface PnLStatsProps {
  trades: Trade[];
  onEditTrade: (trade: Trade) => void;
}

type RangeOption = '1d' | '3d' | '7d' | '2w' | '1m' | 'custom';

export default function PnLStats({ trades, onEditTrade }: PnLStatsProps) {
  // Date Range Filter States
  const [rangeOption, setRangeOption] = useState<RangeOption>('7d');
  const [customStartDate, setCustomStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // Calendar States
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth()); // 0-11
  const [selectedDayTimestamp, setSelectedDayTimestamp] = useState<number | null>(null);

  // Months labels
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // 1. Filter trades based on selected date range option
  const rangeFilteredTrades = useMemo(() => {
    const now = new Date();
    let startLimitTimestamp = 0;
    let endLimitTimestamp = Infinity;

    if (rangeOption === '1d') {
      const d = new Date();
      d.setDate(now.getDate() - 1);
      d.setHours(0, 0, 0, 0);
      startLimitTimestamp = d.getTime();
    } else if (rangeOption === '3d') {
      const d = new Date();
      d.setDate(now.getDate() - 3);
      d.setHours(0, 0, 0, 0);
      startLimitTimestamp = d.getTime();
    } else if (rangeOption === '7d') {
      const d = new Date();
      d.setDate(now.getDate() - 7);
      d.setHours(0, 0, 0, 0);
      startLimitTimestamp = d.getTime();
    } else if (rangeOption === '2w') {
      const d = new Date();
      d.setDate(now.getDate() - 14);
      d.setHours(0, 0, 0, 0);
      startLimitTimestamp = d.getTime();
    } else if (rangeOption === '1m') {
      const d = new Date();
      d.setMonth(now.getMonth() - 1);
      d.setHours(0, 0, 0, 0);
      startLimitTimestamp = d.getTime();
    } else if (rangeOption === 'custom') {
      const start = new Date(customStartDate);
      start.setHours(0, 0, 0, 0);
      startLimitTimestamp = start.getTime();

      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      endLimitTimestamp = end.getTime();
    }

    return trades.filter(t => t.timestamp >= startLimitTimestamp && t.timestamp <= endLimitTimestamp);
  }, [trades, rangeOption, customStartDate, customEndDate]);

  // 2. Statistics calculation for filtered range
  const computedStats = useMemo(() => {
    const total = rangeFilteredTrades.length;
    const wins = rangeFilteredTrades.filter(t => t.resultType === 'gain');
    const losses = rangeFilteredTrades.filter(t => t.resultType === 'loss');

    const totalWinsCount = wins.length;
    const totalLossesCount = losses.length;
    
    const winRate = total > 0 ? (totalWinsCount / total) * 100 : 0;

    const winAmount = wins.reduce((acc, t) => acc + t.amount, 0);
    const lossAmount = losses.reduce((acc, t) => acc + t.amount, 0);

    const netPnL = winAmount - lossAmount;
    const averagePnL = total > 0 ? netPnL / total : 0;

    const averageWin = totalWinsCount > 0 ? winAmount / totalWinsCount : 0;
    const averageLoss = totalLossesCount > 0 ? lossAmount / totalLossesCount : 0;

    const largestWin = wins.length > 0 ? Math.max(...wins.map(t => t.amount)) : 0;
    const largestLoss = losses.length > 0 ? Math.max(...losses.map(t => t.amount)) : 0;

    const profitFactor = lossAmount > 0 ? winAmount / lossAmount : winAmount > 0 ? Infinity : 0;

    return {
      total,
      winRate,
      netPnL,
      averagePnL,
      averageWin,
      averageLoss,
      largestWin,
      largestLoss,
      profitFactor,
      totalWinsCount,
      totalLossesCount
    };
  }, [rangeFilteredTrades]);

  // 3. Calendar Data Construction
  const calendarCells = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    // Convert Sunday-first (0=Sun, 1=Mon, ..., 6=Sat) to Monday-first (0=Mon, 1=Tue, ..., 6=Sun)
    const startDayOfWeekShifted = (firstDay.getDay() + 6) % 7;

    const cells: { date: Date; isCurrentMonth: boolean }[] = [];

    // Prior Month's trailing days
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

    for (let i = startDayOfWeekShifted - 1; i >= 0; i--) {
      cells.push({
        date: new Date(prevYear, prevMonth, daysInPrevMonth - i),
        isCurrentMonth: false
      });
    }

    // Current Month days
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      cells.push({
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true
      });
    }

    // Next Month days to fill complete grid rows (42 standard cells)
    const totalCellsNeeded = cells.length <= 35 ? 35 : cells.length <= 42 ? 42 : 42;
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    let nextDay = 1;

    while (cells.length < totalCellsNeeded) {
      cells.push({
        date: new Date(nextYear, nextMonth, nextDay++),
        isCurrentMonth: false
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Retrieve trade metrics for a calendar cell
  const getCellMetrics = (day: Date) => {
    const dayTrades = trades.filter(t => {
      const tradeDate = new Date(t.timestamp);
      return tradeDate.getFullYear() === day.getFullYear() &&
             tradeDate.getMonth() === day.getMonth() &&
             tradeDate.getDate() === day.getDate();
    });

    const net = dayTrades.reduce((acc, t) => acc + (t.resultType === 'gain' ? t.amount : -t.amount), 0);
    return {
      trades: dayTrades,
      net,
      hasTrades: dayTrades.length > 0
    };
  };

  // Calendar month change navigation
  const prevMonthAction = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDayTimestamp(null);
  };

  const nextMonthAction = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDayTimestamp(null);
  };

  const selectedDayTrades = useMemo(() => {
    if (selectedDayTimestamp === null) return [];
    const dateObj = new Date(selectedDayTimestamp);
    return trades.filter(t => {
      const dt = new Date(t.timestamp);
      return dt.getFullYear() === dateObj.getFullYear() &&
             dt.getMonth() === dateObj.getMonth() &&
             dt.getDate() === dateObj.getDate();
    });
  }, [trades, selectedDayTimestamp]);

  return (
    <div className="flex flex-col gap-5 select-none" id="pnl-stats-dashboard-tab" style={{ color: 'var(--text)' }}>
      
      {/* SECTION: Header & Date Range Selection */}
      <section className="card p-5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <BarChart3 className="text-blue-500 w-5 h-5" />
            <div>
              <h2 className="text-base font-extrabold tracking-tight">PnL CALCULATIONS & PERFORMANCE STATS</h2>
              <p className="text-xs text-[var(--text-dim)]">Inspect win rates, profit factors, averages, and detailed offline journal analytics.</p>
            </div>
          </div>

          {/* Quick ranges */}
          <div className="ios-segmented-track max-w-lg flex shrink-0">
            <button 
              onClick={() => setRangeOption('1d')} 
              className={`ios-segment-btn ${rangeOption === '1d' ? 'active' : ''}`}
            >
              1D
            </button>
            <button 
              onClick={() => setRangeOption('3d')} 
              className={`ios-segment-btn ${rangeOption === '3d' ? 'active' : ''}`}
            >
              3D
            </button>
            <button 
              onClick={() => setRangeOption('7d')} 
              className={`ios-segment-btn ${rangeOption === '7d' ? 'active' : ''}`}
            >
              7D
            </button>
            <button 
              onClick={() => setRangeOption('2w')} 
              className={`ios-segment-btn ${rangeOption === '2w' ? 'active' : ''}`}
            >
              2W
            </button>
            <button 
              onClick={() => setRangeOption('1m')} 
              className={`ios-segment-btn ${rangeOption === '1m' ? 'active' : ''}`}
            >
              1M
            </button>
            <button 
              onClick={() => setRangeOption('custom')} 
              className={`ios-segment-btn ${rangeOption === 'custom' ? 'active' : ''}`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Date picking input row for Custom mode */}
        {rangeOption === 'custom' && (
          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">Start Date</label>
              <input 
                type="date" 
                value={customStartDate} 
                onChange={e => setCustomStartDate(e.target.value)} 
                className="w-full text-xs font-mono py-1.5 px-2.5 rounded-lg border border-[var(--border)] focus:border-[var(--accent)]"
                style={{ background: 'var(--card-bg)', color: 'var(--text)' }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">End Date</label>
              <input 
                type="date" 
                value={customEndDate} 
                onChange={e => setCustomEndDate(e.target.value)} 
                className="w-full text-xs font-mono py-1.5 px-2.5 rounded-lg border border-[var(--border)] focus:border-[var(--accent)]"
                style={{ background: 'var(--card-bg)', color: 'var(--text)' }}
              />
            </div>
          </div>
        )}

        {/* Grid Stats Deck */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-xl border-2 border-[var(--border)] flex flex-col gap-1 bg-[var(--accent-soft)]">
            <span className="text-[9px] font-bold tracking-widest text-[var(--text-dim)] uppercase flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" /> Net Profit/Loss
            </span>
            <span className={`text-xl font-black font-mono leading-none mt-1 ${computedStats.netPnL >= 0 ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}`}>
              {computedStats.netPnL >= 0 ? '+' : '-'}${Math.abs(computedStats.netPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-[var(--text-dim)] mt-1 font-sans italic">
              {computedStats.totalWinsCount} Wins / {computedStats.totalLossesCount} Losses
            </span>
          </div>

          <div className="p-4 rounded-xl border-2 border-[var(--border)] flex flex-col gap-1 bg-[var(--accent-soft)]">
            <span className="text-[9px] font-bold tracking-widest text-[var(--text-dim)] uppercase flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-teal-400" /> Win Rate Ratio
            </span>
            <motion.span className="text-xl font-black font-mono leading-none mt-1 text-[var(--text)]">
              {computedStats.winRate.toFixed(1)}%
            </motion.span>
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-teal-400" style={{ width: `${computedStats.winRate}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-xl border-2 border-[var(--border)] flex flex-col gap-1 bg-[var(--accent-soft)]">
            <span className="text-[9px] font-bold tracking-widest text-[var(--text-dim)] uppercase flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-indigo-400" /> Avg. profit / Trade
            </span>
            <span className={`text-xl font-black font-mono leading-none mt-1 ${computedStats.averagePnL >= 0 ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}`}>
              {computedStats.averagePnL >= 0 ? '+' : '-'}${Math.abs(computedStats.averagePnL).toFixed(2)}
            </span>
            <span className="text-[10px] text-[var(--text-dim)] mt-1 font-mono uppercase tracking-wide">
              {computedStats.total} TOTAL TRADES
            </span>
          </div>

          <div className="p-4 rounded-xl border-2 border-[var(--border)] flex flex-col gap-1 bg-[var(--accent-soft)]">
            <span className="text-[9px] font-bold tracking-widest text-[var(--text-dim)] uppercase flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-amber-400" /> Profit Factor
            </span>
            <span className="text-xl font-black font-mono leading-none mt-1 text-[var(--text)]">
              {computedStats.profitFactor === Infinity ? '∞' : computedStats.profitFactor.toFixed(2)}
            </span>
            <span className="text-[10px] text-[var(--text-dim)] mt-1 font-sans">
              ratio of gross win to loss
            </span>
          </div>

        </div>

        {/* Detailed Secondary metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
          <div className="flex justify-between items-center px-4 py-2 bg-[var(--input-bg)] rounded-xl border border-[var(--border)] text-xs">
            <span className="text-[var(--text-dim)]">Average Win</span>
            <b className="text-[var(--gain)] font-mono">+${computedStats.averageWin.toFixed(2)}</b>
          </div>
          <div className="flex justify-between items-center px-4 py-2 bg-[var(--input-bg)] rounded-xl border border-[var(--border)] text-xs">
            <span className="text-[var(--text-dim)]">Average Loss</span>
            <b className="text-[var(--loss)] font-mono">-${computedStats.averageLoss.toFixed(2)}</b>
          </div>
          <div className="flex justify-between items-center px-4 py-2 bg-[var(--input-bg)] rounded-xl border border-[var(--border)] text-xs">
            <span className="text-[var(--text-dim)]">Largest Win</span>
            <b className="text-[var(--gain)] font-mono">+${computedStats.largestWin.toFixed(2)}</b>
          </div>
          <div className="flex justify-between items-center px-4 py-2 bg-[var(--input-bg)] rounded-xl border border-[var(--border)] text-xs">
            <span className="text-[var(--text-dim)]">Largest Loss</span>
            <b className="text-[var(--loss)] font-mono">-${computedStats.largestLoss.toFixed(2)}</b>
          </div>
        </div>
      </section>

      {/* SECTION: Calendar Map & Selecting Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Calendar Core Block */}
        <section className="card p-5 lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center checkboard-header border-b pb-3 mb-2" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <CalendarIcon className="text-indigo-400 w-4 h-4" />
              <h3 className="text-xs font-black tracking-widest text-[var(--text-dim)] uppercase">CALENDAR DAILY PNL HEATMAP</h3>
            </div>
            
            {/* Nav controls */}
            <div className="flex items-center gap-1.5 bg-[var(--input-bg)] p-1 rounded-xl border border-[var(--border)]">
              <button 
                onClick={prevMonthAction}
                className="p-1 h-7 w-7 rounded-lg hover:bg-[var(--segment-selected)] text-[var(--text)] transition-all flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider px-2 text-[var(--text)]">
                {months[currentMonth]} {currentYear}
              </span>
              <button 
                onClick={nextMonthAction}
                className="p-1 h-7 w-7 rounded-lg hover:bg-[var(--segment-selected)] text-[var(--text)] transition-all flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 gap-1 text-center select-none">
            {weekdays.map(day => (
              <span key={day} className="text-[10px] font-mono font-black text-[var(--text-dim)] tracking-wider mt-1 uppercase">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell, index) => {
              const { trades: dayTrades, net, hasTrades } = getCellMetrics(cell.date);
              const isSelected = selectedDayTimestamp !== null && 
                                new Date(selectedDayTimestamp).toDateString() === cell.date.toDateString();

              const dayOfWeek = cell.date.getDay(); // 0 is Sunday, 6 is Saturday
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

              let cellStyle: React.CSSProperties = { background: 'var(--input-bg)' };
              let labelStyle = 'text-[var(--text)]';
              let amountStyle = '';

              if (isWeekend) {
                cellStyle = { background: 'var(--bg)', opacity: 0.45 };
                labelStyle = 'text-[var(--text-dim)]';
              }

              if (!cell.isCurrentMonth) {
                labelStyle = 'text-[var(--text-dim)] opacity-40';
                if (!isWeekend) {
                  cellStyle = { ...cellStyle, opacity: 0.4 };
                }
              }

              if (hasTrades) {
                const isGain = net >= 0;
                cellStyle = {
                  background: isGain ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                  borderColor: isGain ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  opacity: isWeekend ? 0.8 : 1
                };
                amountStyle = isGain ? 'text-[var(--gain)]' : 'text-[var(--loss)]';
              }

              if (isSelected) {
                cellStyle = {
                  ...cellStyle,
                  borderColor: 'var(--accent)',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  boxShadow: '0 0 0 2px var(--accent-glow)',
                  opacity: 1
                };
              }

              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => setSelectedDayTimestamp(cell.date.getTime())}
                  className="rounded-xl flex flex-col p-2 min-h-[64px] transition-all justify-between text-left border border-transparent select-none cursor-pointer focus:outline-none hover:border-[var(--accent)]"
                  style={cellStyle}
                >
                  <span className={`text-[10px] font-bold font-mono ${labelStyle}`}>
                    {cell.date.getDate()}
                  </span>
                  
                  {hasTrades && (
                    <div className="flex flex-col gap-0.5 mt-auto">
                      <span className={`text-[9px] font-black font-mono leading-none tracking-tight block ${amountStyle}`}>
                        {net >= 0 ? '+' : '-'}${Math.abs(net).toFixed(0)}
                      </span>
                      {/* dots for individual trades */}
                      <div className="flex gap-0.5 mt-0.5 flex-wrap">
                        {dayTrades.slice(0, 4).map((t, ti) => (
                          <div 
                            key={ti} 
                            className={`w-1 h-1 rounded-full ${t.resultType === 'gain' ? 'bg-[#10b981]' : 'bg-[#f43f5e]'}`} 
                          />
                        ))}
                        {dayTrades.length > 4 && (
                          <span className="text-[6px] text-[var(--text-dim)] font-mono leading-none">+</span>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-[10px] text-[var(--text-dim)] font-mono mt-1 pt-2 border-t border-[var(--border)]">
            <span className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-emerald-500/10 border border-emerald-500/20" /> Green indicates Net Profit
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-rose-500/10 border border-rose-500/20" /> Red indicates Net Loss
            </span>
          </div>
        </section>

        {/* Selected Day details Pane */}
        <section className="card p-5 flex flex-col gap-4">
          <div className="border-b pb-3" style={{ borderColor: 'var(--border)' }}>
            <span className="text-[10px] font-mono font-black text-[var(--text-dim)] block tracking-widest uppercase mb-1">
              DAILY TRADE DETAILS
            </span>
            <h3 className="text-xs font-black text-[var(--text)] uppercase tracking-tight">
              {selectedDayTimestamp ? new Date(selectedDayTimestamp).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Select Day in Calendar'}
            </h3>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[360px] pr-1">
            {selectedDayTimestamp === null ? (
              <div className="text-center py-10 font-sans text-xs text-[var(--text-dim)] leading-relaxed">
                Click any calendar grid slot above to audit specific trade log results, prices or images recorded.
              </div>
            ) : selectedDayTrades.length === 0 ? (
              <div className="text-center py-10 font-sans text-xs text-[var(--text-dim)] leading-relaxed">
                No trades recorded offline on this local calendar date.
              </div>
            ) : (
              selectedDayTrades.map(trade => (
                <div 
                  key={trade.id} 
                  className={`p-3 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] flex flex-col gap-2 relative group hover:border-[var(--accent)] transition-all`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-[var(--text)]">{trade.pair}</span>
                        <span className={`text-[8px] px-1 rounded font-bold uppercase ${trade.direction === 'short' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {trade.direction || 'LONG'}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-[var(--text-dim)] mt-0.5 block">
                        {new Date(trade.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <b className={`text-xs font-black font-mono ${trade.resultType === 'gain' ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}`}>
                        {trade.resultType === 'gain' ? '+' : '-'}${trade.amount.toFixed(2)}
                      </b>
                      {trade.rrr > 0 && (
                        <span className="text-[8px] font-mono font-bold text-[var(--accent)] mt-0.5">RR {trade.rrr}</span>
                      )}
                    </div>
                  </div>

                  {trade.reason && (
                    <p className="text-[10px] text-[var(--text-dim)] line-clamp-1 border-t border-[var(--border)] pt-1.5 font-sans">
                      {trade.reason.replace('[Imported from Calc]', '').trim()}
                    </p>
                  )}

                  {/* prices review inline */}
                  {(trade.entryPrice || trade.stopPrice) && (
                    <div className="grid grid-cols-2 gap-2 text-[9px] font-mono bg-[var(--card-bg)] px-2 py-1 rounded border border-[var(--border)]">
                      <div>Entry: <b className="text-[var(--text)]">${trade.entryPrice || 'N/A'}</b></div>
                      <div>Stop: <b className="text-[var(--text)]">${trade.stopPrice || 'N/A'}</b></div>
                    </div>
                  )}

                  {/* quick edit launcher */}
                  <button
                    type="button"
                    onClick={() => onEditTrade(trade)}
                    className="absolute bottom-2.5 right-2.5 h-6 w-6 rounded-lg bg-[var(--card-bg)] hover:bg-[var(--accent)] text-[var(--text-dim)] hover:text-white border border-[var(--border)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm cursor-pointer"
                    title="Edit trade details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

      </div>

    </div>
  );
}
