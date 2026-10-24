"use client";

import React, { useState, useEffect } from "react";
import { OptionContract } from "@/lib/types";
import { Zap, Layers, RefreshCw } from "lucide-react";

interface OptionsMatrixProps {
  underlying: string;
}

export function OptionsMatrix({ underlying }: OptionsMatrixProps) {
  const [currency, setCurrency] = useState<"BTC" | "ETH">("BTC");
  const [options, setOptions] = useState<OptionContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "CALLS" | "PUTS">("ALL");

  const fetchOptions = async (curr: "BTC" | "ETH") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/market?action=options&symbol=${curr}`);
      const data = await res.json();
      setOptions(data.options || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const defaultCurr = underlying.includes("ETH") ? "ETH" : "BTC";
    setCurrency(defaultCurr);
    fetchOptions(defaultCurr);
  }, [underlying]);

  // Group by strike for cross-table matrix
  const strikes = Array.from(new Set(options.map((o) => o.strike))).sort((a, b) => a - b);

  return (
    <div className="flex h-full flex-col bg-zinc-950 font-mono text-xs select-none">
      {/* Options Top Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2 bg-zinc-900/40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Zap className="h-4 w-4" />
            <span>DERIBIT & DELTA OPTIONS CHAIN</span>
          </div>

          <div className="flex items-center rounded border border-zinc-800 bg-zinc-900 p-0.5">
            <button
              onClick={() => { setCurrency("BTC"); fetchOptions("BTC"); }}
              className={`rounded px-2 py-0.5 text-xs transition-colors ${
                currency === "BTC" ? "bg-amber-500/20 text-amber-400 font-semibold" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              BTC-OPTIONS
            </button>
            <button
              onClick={() => { setCurrency("ETH"); fetchOptions("ETH"); }}
              className={`rounded px-2 py-0.5 text-xs transition-colors ${
                currency === "ETH" ? "bg-amber-500/20 text-amber-400 font-semibold" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              ETH-OPTIONS
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
            <Layers className="h-3.5 w-3.5 text-zinc-500" />
            <span>Filter:</span>
            {(["ALL", "CALLS", "PUTS"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded px-1.5 py-0.5 text-[10px] ${
                  activeTab === tab ? "bg-zinc-800 text-zinc-100 font-semibold" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchOptions(currency)}
            disabled={loading}
            className="flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-zinc-400 hover:text-zinc-200"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin text-amber-400" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Options Chain Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60 text-[10px] text-zinc-400 font-medium">
              <th className="py-1.5 px-3">INSTRUMENT</th>
              <th className="py-1.5 px-2 text-center">TYPE</th>
              <th className="py-1.5 px-3 text-right">STRIKE</th>
              <th className="py-1.5 px-3 text-right">MARK</th>
              <th className="py-1.5 px-3 text-right">BID/ASK</th>
              <th className="py-1.5 px-2 text-right">IV%</th>
              <th className="py-1.5 px-2 text-right">DELTA (Δ)</th>
              <th className="py-1.5 px-2 text-right">GAMMA (Γ)</th>
              <th className="py-1.5 px-2 text-right">VEGA (ν)</th>
              <th className="py-1.5 px-2 text-right">THETA (θ)</th>
              <th className="py-1.5 px-3 text-right">OI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/80 font-mono">
            {options
              .filter((o) => activeTab === "ALL" || o.type === (activeTab === "CALLS" ? "CALL" : "PUT"))
              .map((opt) => {
                const isCall = opt.type === "CALL";
                return (
                  <tr
                    key={opt.instrumentName}
                    className="hover:bg-zinc-900/40 transition-colors text-zinc-300"
                  >
                    <td className="py-1 px-3 font-semibold text-zinc-200">
                      {opt.instrumentName}
                    </td>
                    <td className="py-1 px-2 text-center">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          isCall
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {opt.type}
                      </span>
                    </td>
                    <td className="py-1 px-3 text-right font-bold text-amber-400">
                      ${opt.strike.toLocaleString()}
                    </td>
                    <td className="py-1 px-3 text-right font-medium text-zinc-100">
                      ${opt.markPrice.toFixed(2)}
                    </td>
                    <td className="py-1 px-3 text-right text-zinc-400 text-[11px]">
                      {opt.bidPrice} / {opt.askPrice}
                    </td>
                    <td className="py-1 px-2 text-right text-indigo-400 font-medium">
                      {opt.iv}%
                    </td>
                    <td className={`py-1 px-2 text-right ${opt.greeks.delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {opt.greeks.delta >= 0 ? `+${opt.greeks.delta}` : opt.greeks.delta}
                    </td>
                    <td className="py-1 px-2 text-right text-zinc-400">
                      {opt.greeks.gamma}
                    </td>
                    <td className="py-1 px-2 text-right text-amber-300">
                      {opt.greeks.vega}
                    </td>
                    <td className="py-1 px-2 text-right text-rose-400">
                      {opt.greeks.theta}
                    </td>
                    <td className="py-1 px-3 text-right text-zinc-500 text-[11px]">
                      {opt.openInterest.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
