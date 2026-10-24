/**
 * Apex Vectorized Client-Side Strategy Backtester
 * Runs in-browser with zero backend latency.
 */

import { Candle } from "@/lib/types";

export interface StrategyParams {
  name: "SMA_CROSS" | "RSI_MEAN_REVERSION" | "MOMENTUM_BREAKOUT";
  fastPeriod?: number; // e.g. 10
  slowPeriod?: number; // e.g. 30
  rsiPeriod?: number; // e.g. 14
  rsiOversold?: number; // e.g. 30
  rsiOverbought?: number; // e.g. 70
  initialCapital?: number; // e.g. $100,000
}

export interface Trade {
  entryTime: number;
  exitTime: number;
  entryPrice: number;
  exitPrice: number;
  side: "LONG" | "SHORT";
  pnlPercent: number;
  pnlDollar: number;
}

export interface BacktestResult {
  strategyName: string;
  initialCapital: number;
  finalEquity: number;
  totalReturnPercent: number;
  benchmarkReturnPercent: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdownPercent: number;
  winRatePercent: number;
  totalTrades: number;
  profitFactor: number;
  equityCurve: { time: number; equity: number; benchmark: number }[];
  trades: Trade[];
}

export function runBacktest(candles: Candle[], params: StrategyParams): BacktestResult {
  const initialCapital = params.initialCapital || 100000;
  if (!candles || candles.length < 20) {
    return createEmptyResult(params.name, initialCapital);
  }

  const closes = candles.map((c) => c.close);
  const times = candles.map((c) => (typeof c.time === "number" ? c.time : Math.floor(new Date(c.time).getTime() / 1000)));

  let capital = initialCapital;
  let inPosition = false;
  let entryPrice = 0;
  let entryTime = 0;
  const trades: Trade[] = [];
  const equityCurve: { time: number; equity: number; benchmark: number }[] = [];
  const benchmarkInitial = closes[0];

  const fastP = params.fastPeriod || 10;
  const slowP = params.slowPeriod || 30;

  // Simple Moving Averages
  const fastSMA = calculateSMA(closes, fastP);
  const slowSMA = calculateSMA(closes, slowP);

  let peakEquity = initialCapital;
  let maxDrawdown = 0;
  const returns: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    const price = closes[i];
    const time = times[i];
    const prevPrice = i > 0 ? closes[i - 1] : price;

    // Trading signals (SMA Crossover)
    let signal = 0; // 1 = Buy, -1 = Sell
    if (i >= slowP) {
      if (fastSMA[i] > slowSMA[i] && fastSMA[i - 1] <= slowSMA[i - 1]) {
        signal = 1; // Golden Cross
      } else if (fastSMA[i] < slowSMA[i] && fastSMA[i - 1] >= slowSMA[i - 1]) {
        signal = -1; // Death Cross
      }
    }

    // Execute signals
    if (signal === 1 && !inPosition) {
      inPosition = true;
      entryPrice = price;
      entryTime = time;
    } else if (signal === -1 && inPosition) {
      inPosition = false;
      const pnlPercent = ((price - entryPrice) / entryPrice) * 100;
      const pnlDollar = capital * (pnlPercent / 100);
      capital += pnlDollar;
      trades.push({
        entryTime,
        exitTime: time,
        entryPrice,
        exitPrice: price,
        side: "LONG",
        pnlPercent: parseFloat(pnlPercent.toFixed(2)),
        pnlDollar: parseFloat(pnlDollar.toFixed(2)),
      });
    }

    // Current Mark-to-Market Equity
    const currentEquity = inPosition ? capital + capital * ((price - entryPrice) / entryPrice) : capital;
    if (currentEquity > peakEquity) peakEquity = currentEquity;
    const dd = ((peakEquity - currentEquity) / peakEquity) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;

    if (i > 0) {
      returns.push((currentEquity - equityCurve[i - 1].equity) / equityCurve[i - 1].equity);
    }

    equityCurve.push({
      time,
      equity: parseFloat(currentEquity.toFixed(2)),
      benchmark: parseFloat((initialCapital * (price / benchmarkInitial)).toFixed(2)),
    });
  }

  // Quant metrics calculation
  const totalReturn = ((capital - initialCapital) / initialCapital) * 100;
  const benchmarkReturn = ((closes[closes.length - 1] - benchmarkInitial) / benchmarkInitial) * 100;
  const winningTrades = trades.filter((t) => t.pnlDollar > 0);
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;

  const grossProfit = winningTrades.reduce((acc, t) => acc + t.pnlDollar, 0);
  const grossLoss = Math.abs(trades.filter((t) => t.pnlDollar < 0).reduce((acc, t) => acc + t.pnlDollar, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.0 : 1.0;

  // Annualized Sharpe & Sortino
  const meanReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance = returns.reduce((acc, r) => acc + Math.pow(r - meanReturn, 2), 0) / (returns.length || 1);
  const stdDev = Math.sqrt(variance);
  const downsideVariance = returns.filter((r) => r < 0).reduce((acc, r) => acc + Math.pow(r, 2), 0) / (returns.length || 1);
  const downsideDev = Math.sqrt(downsideVariance);

  const annualizedFactor = Math.sqrt(252 * 6.5); // Hourly to annual
  const sharpe = stdDev > 0 ? (meanReturn / stdDev) * annualizedFactor : 0;
  const sortino = downsideDev > 0 ? (meanReturn / downsideDev) * annualizedFactor : 0;

  return {
    strategyName: params.name,
    initialCapital,
    finalEquity: parseFloat(capital.toFixed(2)),
    totalReturnPercent: parseFloat(totalReturn.toFixed(2)),
    benchmarkReturnPercent: parseFloat(benchmarkReturn.toFixed(2)),
    sharpeRatio: parseFloat(sharpe.toFixed(2)),
    sortinoRatio: parseFloat(sortino.toFixed(2)),
    maxDrawdownPercent: parseFloat(maxDrawdown.toFixed(2)),
    winRatePercent: parseFloat(winRate.toFixed(1)),
    totalTrades: trades.length,
    profitFactor: parseFloat(profitFactor.toFixed(2)),
    equityCurve,
    trades,
  };
}

function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(data[i]);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      sma.push(sum / period);
    }
  }
  return sma;
}

function createEmptyResult(strategyName: string, initialCapital: number): BacktestResult {
  return {
    strategyName,
    initialCapital,
    finalEquity: initialCapital,
    totalReturnPercent: 0,
    benchmarkReturnPercent: 0,
    sharpeRatio: 0,
    sortinoRatio: 0,
    maxDrawdownPercent: 0,
    winRatePercent: 0,
    totalTrades: 0,
    profitFactor: 0,
    equityCurve: [],
    trades: [],
  };
}
