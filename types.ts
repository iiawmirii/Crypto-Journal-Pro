export type TradeResult = 'gain' | 'loss';

export interface Trade {
  id: string;
  pair: string;
  timestamp: number;
  resultType: TradeResult;
  amount: number;
  rrr: number;
  reason: string;
  imageUrl?: string;
  stopLossHit?: boolean;
  stopLossReason?: string;
  direction?: 'long' | 'short';
  entryPrice?: number;
  stopPrice?: number;
}

export interface Stats {
  daily: number;
  threeDay: number;
  weekly: number;
  monthly: number;
  allTime: number;
}
