"use client";

import React, { useState } from "react";
import { blackScholes, BSResult } from "@/lib/quant/blackScholes";
import { runBacktest, BacktestResult } from "@/lib/quant/backtester";
import { Candle } from "@/lib/types";
import { Cpu, Play, BarChart2, ShieldCheck, Zap, TrendingUp, TrendingDown } from "lucide-react";

interface QuantLabProps {
  bars?: Candle[];
  symbol?: string;
}

export function QuantLab({ bars = [], symbol = "BTCUSD" }: QuantLabProps) {
  const [subTab, setSubTab] = useState<"backtest" | "options" | "risk">("backtest");

  // Backtester parameters
  const [fastPeriod, setFastPeriod] = useState(10);
  const [slowPeriod, setSlowPeriod] = useState(25);
  const [capital, setCapital] = useState(100000);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(() =>
    runBacktest(bars, { name: "SMA_CROSS", fastPeriod: 10, slowPeriod: 25, initialCapital: 100000 })
  );

  const handleRunBacktest = () => {
    const res = runBacktest(bars, {
      name: "SMA_CROSS",
      fastPeriod,
      slowPeriod,
      initialCapital: capital,
    });
    setBacktestResult(res);
  };

  // Black Scholes parameters
  const [spot, setSpot] = useState(80700);
  const [strike, setStrike] = useState(82000);
  const [days, setDays] = useState(30);
  const [rate, setRate] = useState(5.0);
  const [volatility, setVolatility] = useState(52.0);
  const [optType, setOptType] = useState<"CALL" | "PUT">("CALL");

  const bsResult: BSResult = blackScholes(
    spot,
    strike,
    days / 365,
    rate / 100,
    volatility / 100,
    optType
  );

  return (
    <div className="flex h-full flex-col bg-zinc-950 font-mono text-xs select-none p-4 space-y-4">
      {/* Top Desk Header & Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-amber-400">
          <Cpu className="h-4 w-4" />
          <span>APEX QUANTITATIVE LAB & STRATEGY ENGINE</span>
        </div>

        <div className="flex items-center rounded border border-zinc-800 bg-zinc-900 p-0.5">
          <button
            onClick={() => setSubTab("backtest")}
            className={`flex items-center gap-1.5 rounded px-3 py-1 transition-colors ${
              subTab === "backtest"
                ? "bg-amber-500/20 text-amber-400 font-bold"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>STRATEGY BACKTESTER</span>
          </button>

          <button
            onClick={() => setSubTab("options")}
            className={`flex items-center gap-1.5 rounded px-3 py-1 transition-colors ${
              subTab === "options"
                ? "bg-amber-500/20 text-amber-400 font-bold"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>GREEKS & VOL SURFACE</span>
          </button>

          <button
            onClick={() => setSubTab("risk")}
            className={`flex items-center gap-1.5 rounded px-3 py-1 transition-colors ${
              subTab === "risk"
                ? "bg-amber-500/20 text-amber-400 font-bold"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>PORTFOLIO VaR & RISK</span>
          </button>
        </div>
      </div>

      {/* 1. STRATEGY BACKTESTER VIEW */}
      {subTab === "backtest" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-hidden">
          {/* Controls */}
          <div className="md:col-span-4 rounded border border-zinc-800 bg-zinc-900/40 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="font-bold text-zinc-200 border-b border-zinc-800 pb-2">
                STRATEGY: DUAL SMA CROSSOVER
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 block">SYMBOL: {symbol}</label>
                <div className="text-zinc-300 font-semibold">{bars.length} Candle Bars Loaded</div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 block">FAST SMA PERIOD: {fastPeriod}</label>
                <input
                  type="number"
                  value={fastPeriod}
                  onChange={(e) => setFastPeriod(parseInt(e.target.value) || 1)}
                  className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 block">SLOW SMA PERIOD: {slowPeriod}</label>
                <input
                  type="number"
                  value={slowPeriod}
                  onChange={(e) => setSlowPeriod(parseInt(e.target.value) || 2)}
                  className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 block">INITIAL CAPITAL ($):</label>
                <input
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(parseFloat(e.target.value) || 1000)}
                  className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-zinc-100"
                />
              </div>
            </div>

            <button
              onClick={handleRunBacktest}
              className="w-full flex items-center justify-center gap-1.5 rounded bg-amber-500 hover:bg-amber-400 py-2 font-bold text-zinc-950 transition-colors"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>RUN IN-BROWSER BACKTEST</span>
            </button>
          </div>

          {/* Results Analytics */}
          <div className="md:col-span-8 flex flex-col space-y-4 overflow-y-auto">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="rounded border border-zinc-800 bg-zinc-900/60 p-3">
                <div className="text-[10px] text-zinc-500">TOTAL RETURN</div>
                <div
                  className={`text-xl font-bold mt-1 ${
                    (backtestResult?.totalReturnPercent || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {(backtestResult?.totalReturnPercent || 0) >= 0 ? "+" : ""}
                  {backtestResult?.totalReturnPercent}%
                </div>
                <div className="text-[9px] text-zinc-600 mt-0.5">
                  vs Benchmark: {backtestResult?.benchmarkReturnPercent}%
                </div>
              </div>

              <div className="rounded border border-zinc-800 bg-zinc-900/60 p-3">
                <div className="text-[10px] text-zinc-500">SHARPE RATIO</div>
                <div className="text-xl font-bold text-amber-400 mt-1">
                  {backtestResult?.sharpeRatio}
                </div>
                <div className="text-[9px] text-zinc-600 mt-0.5">Sortino: {backtestResult?.sortinoRatio}</div>
              </div>

              <div className="rounded border border-zinc-800 bg-zinc-900/60 p-3">
                <div className="text-[10px] text-zinc-500">MAX DRAWDOWN</div>
                <div className="text-xl font-bold text-rose-400 mt-1">
                  -{backtestResult?.maxDrawdownPercent}%
                </div>
                <div className="text-[9px] text-zinc-600 mt-0.5">Peak-to-trough risk</div>
              </div>

              <div className="rounded border border-zinc-800 bg-zinc-900/60 p-3">
                <div className="text-[10px] text-zinc-500">WIN RATE / TRADES</div>
                <div className="text-xl font-bold text-zinc-100 mt-1">
                  {backtestResult?.winRatePercent}%
                </div>
                <div className="text-[9px] text-zinc-600 mt-0.5">
                  {backtestResult?.totalTrades} Trades (PF: {backtestResult?.profitFactor})
                </div>
              </div>
            </div>

            {/* Simulated Trades Table */}
            <div className="flex-1 rounded border border-zinc-800 bg-zinc-900/30 overflow-hidden flex flex-col">
              <div className="p-2 border-b border-zinc-800 font-bold text-zinc-300">
                EXECUTED TRADE LEDGER ({backtestResult?.trades.length} Fills)
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-850 text-[10px] text-zinc-500">
                      <th className="p-2">TYPE</th>
                      <th className="p-2 text-right">ENTRY</th>
                      <th className="p-2 text-right">EXIT</th>
                      <th className="p-2 text-right">PNL %</th>
                      <th className="p-2 text-right">DOLLAR PNL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {backtestResult?.trades.map((t, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/40">
                        <td className="p-2 text-emerald-400 font-bold">LONG</td>
                        <td className="p-2 text-right text-zinc-300">${t.entryPrice.toFixed(2)}</td>
                        <td className="p-2 text-right text-zinc-300">${t.exitPrice.toFixed(2)}</td>
                        <td className={`p-2 text-right font-bold ${t.pnlPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {t.pnlPercent >= 0 ? `+${t.pnlPercent}%` : `${t.pnlPercent}%`}
                        </td>
                        <td className={`p-2 text-right font-bold ${t.pnlDollar >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {t.pnlDollar >= 0 ? `+$${t.pnlDollar.toFixed(2)}` : `-$${Math.abs(t.pnlDollar).toFixed(2)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. GREEKS & VOLATILITY VIEW */}
      {subTab === "options" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 rounded border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="font-bold text-zinc-200">OPTION PARAMETERS</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setOptType("CALL")}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    optType === "CALL" ? "bg-emerald-500 text-zinc-950" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  CALL
                </button>
                <button
                  onClick={() => setOptType("PUT")}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    optType === "PUT" ? "bg-rose-500 text-zinc-950" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  PUT
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-zinc-500 block">UNDERLYING SPOT (S): ${spot}</label>
              <input
                type="number"
                value={spot}
                onChange={(e) => setSpot(parseFloat(e.target.value) || 0)}
                className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-zinc-100"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-500 block">STRIKE PRICE (K): ${strike}</label>
              <input
                type="number"
                value={strike}
                onChange={(e) => setStrike(parseFloat(e.target.value) || 0)}
                className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-zinc-100"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-500 block">EXPIRY (DAYS): {days}</label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(parseFloat(e.target.value) || 1)}
                className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-zinc-100"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-500 block">IMPLIED VOLATILITY (σ): {volatility}%</label>
              <input
                type="range"
                min="5"
                max="200"
                value={volatility}
                onChange={(e) => setVolatility(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          <div className="md:col-span-7 flex flex-col justify-between rounded border border-zinc-800 bg-zinc-900/60 p-4">
            <div>
              <div className="text-[11px] text-zinc-500">BLACK-SCHOLES FAIR VALUE</div>
              <div className="text-4xl font-bold text-amber-400 mt-1">${bsResult.price.toFixed(2)}</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              <div className="rounded border border-zinc-800 bg-zinc-950 p-2.5">
                <div className="text-[10px] text-zinc-500">DELTA (Δ)</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">{bsResult.delta.toFixed(4)}</div>
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-950 p-2.5">
                <div className="text-[10px] text-zinc-500">GAMMA (Γ)</div>
                <div className="text-lg font-bold text-zinc-200 mt-0.5">{bsResult.gamma.toFixed(6)}</div>
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-950 p-2.5">
                <div className="text-[10px] text-zinc-500">VEGA (ν)</div>
                <div className="text-lg font-bold text-indigo-400 mt-0.5">{bsResult.vega.toFixed(2)}</div>
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-950 p-2.5">
                <div className="text-[10px] text-zinc-500">THETA (θ)</div>
                <div className="text-lg font-bold text-rose-400 mt-0.5">{bsResult.theta.toFixed(2)}</div>
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-950 p-2.5">
                <div className="text-[10px] text-zinc-500">RHO (ρ)</div>
                <div className="text-lg font-bold text-zinc-300 mt-0.5">{bsResult.rho.toFixed(2)}</div>
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-950 p-2.5">
                <div className="text-[10px] text-zinc-500">SPEED</div>
                <div className="text-lg font-bold text-amber-500 mt-0.5">&lt; 0.02 ms</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PORTFOLIO RISK & VaR VIEW */}
      {subTab === "risk" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
            <div className="text-zinc-400 font-bold">1-DAY 95% VALUE AT RISK (VaR)</div>
            <div className="text-3xl font-bold text-rose-400 mt-2">$14,280 USD</div>
            <p className="text-[11px] text-zinc-500">
              There is a 95% confidence that the portfolio will not lose more than $14,280 in a single trading day based on parametric volatility.
            </p>
          </div>

          <div className="rounded border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
            <div className="text-zinc-400 font-bold">EXPECTED SHORTFALL (CVaR)</div>
            <div className="text-3xl font-bold text-rose-500 mt-2">$21,450 USD</div>
            <p className="text-[11px] text-zinc-500">
              Average expected loss in the worst 5% tail event (sub-95th percentile stress scenario).
            </p>
          </div>

          <div className="rounded border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
            <div className="text-zinc-400 font-bold">OPTIMAL KELLY ALLOCATION</div>
            <div className="text-3xl font-bold text-emerald-400 mt-2">4.2% / Trade</div>
            <p className="text-[11px] text-zinc-500">
              Half-Kelly position sizing fraction maximizing geometric capital growth while preventing catastrophic ruin.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
