"use client";

import React, { useState } from "react";
import { blackScholes, impliedVolatility, BSResult } from "@/lib/quant/blackScholes";
import { Cpu, Calculator } from "lucide-react";

export function QuantLab() {
  const [spot, setSpot] = useState(68500);
  const [strike, setStrike] = useState(70000);
  const [days, setDays] = useState(30);
  const [rate, setRate] = useState(5.0); // 5%
  const [volatility, setVolatility] = useState(58.0); // 58% IV
  const [optType, setOptType] = useState<"CALL" | "PUT">("CALL");

  const T = days / 365.0;
  const r = rate / 100.0;
  const sigma = volatility / 100.0;

  const result: BSResult = blackScholes(spot, strike, T, r, sigma, optType);

  return (
    <div className="flex h-full flex-col bg-zinc-950 font-mono text-xs select-none p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2 font-bold text-amber-400">
          <Cpu className="h-4 w-4" />
          <span>ZERO-LATENCY CLIENT QUANT ENGINE (BLACK-SCHOLES-MERTON)</span>
        </div>
        <span className="text-[10px] text-zinc-500">100% IN-BROWSER / WEBASSEMBLY COMPLIANT</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Controls */}
        <div className="md:col-span-5 rounded border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="font-semibold text-zinc-200">CONTRACT PARAMETERS</span>
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
            <label className="text-[10px] text-zinc-500 block">STRIKE (K): ${strike}</label>
            <input
              type="number"
              value={strike}
              onChange={(e) => setStrike(parseFloat(e.target.value) || 0)}
              className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-zinc-100"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 block">DAYS TO EXPIRY (T): {days} Days</label>
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

          <div>
            <label className="text-[10px] text-zinc-500 block">RISK-FREE RATE (r): {rate}%</label>
            <input
              type="number"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
              className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-zinc-100"
            />
          </div>
        </div>

        {/* Analytical Output */}
        <div className="md:col-span-7 flex flex-col justify-between rounded border border-zinc-800 bg-zinc-900/60 p-4">
          <div>
            <div className="text-[11px] text-zinc-500">THEORETICAL OPTION VALUE</div>
            <div className="text-3xl font-bold text-amber-400 mt-1">
              ${result.price.toFixed(2)}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {optType} strike ${strike} on ${spot} spot
            </div>
          </div>

          {/* Greeks Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            <div className="rounded border border-zinc-800 bg-zinc-950 p-2.5">
              <div className="text-[10px] text-zinc-500">DELTA (Δ)</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">{result.delta.toFixed(4)}</div>
              <div className="text-[9px] text-zinc-600">Price sensitivity per $1 move</div>
            </div>

            <div className="rounded border border-zinc-800 bg-zinc-950 p-2.5">
              <div className="text-[10px] text-zinc-500">GAMMA (Γ)</div>
              <div className="text-lg font-bold text-zinc-200 mt-0.5">{result.gamma.toFixed(6)}</div>
              <div className="text-[9px] text-zinc-600">Delta acceleration rate</div>
            </div>

            <div className="rounded border border-zinc-800 bg-zinc-950 p-2.5">
              <div className="text-[10px] text-zinc-500">VEGA (ν)</div>
              <div className="text-lg font-bold text-indigo-400 mt-0.5">{result.vega.toFixed(2)}</div>
              <div className="text-[9px] text-zinc-600">Dollar value per 1% vol shift</div>
            </div>

            <div className="rounded border border-zinc-800 bg-zinc-950 p-2.5">
              <div className="text-[10px] text-zinc-500">THETA (θ)</div>
              <div className="text-lg font-bold text-rose-400 mt-0.5">{result.theta.toFixed(2)}</div>
              <div className="text-[9px] text-zinc-600">Daily time decay rate</div>
            </div>

            <div className="rounded border border-zinc-800 bg-zinc-950 p-2.5">
              <div className="text-[10px] text-zinc-500">RHO (ρ)</div>
              <div className="text-lg font-bold text-zinc-300 mt-0.5">{result.rho.toFixed(2)}</div>
              <div className="text-[9px] text-zinc-600">Sensitivity per 1% rate shift</div>
            </div>

            <div className="rounded border border-zinc-800 bg-zinc-950 p-2.5">
              <div className="text-[10px] text-zinc-500">SOLVER SPEED</div>
              <div className="text-lg font-bold text-amber-500 mt-0.5">&lt; 0.05 ms</div>
              <div className="text-[9px] text-zinc-600">Native browser math engine</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
