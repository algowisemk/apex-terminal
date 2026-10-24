"use client";

import React, { useState } from "react";
import { TickerSummary } from "@/lib/types";
import { TrendingUp, TrendingDown, Search } from "lucide-react";

interface WatchlistPanelProps {
  watchlist: TickerSummary[];
  activeSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

export function WatchlistPanel({ watchlist, activeSymbol, onSelectSymbol }: WatchlistPanelProps) {
  const [search, setSearch] = useState("");

  const filtered = watchlist.filter(
    (item) =>
      item.symbol.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col border-r border-zinc-800 bg-zinc-950 font-mono text-xs select-none">
      {/* Header & Filter */}
      <div className="border-b border-zinc-800 p-2">
        <div className="flex items-center justify-between pb-1.5">
          <span className="font-semibold text-zinc-300">WATCHLIST</span>
          <span className="text-[10px] text-zinc-500">{filtered.length} PAIRS</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Filter symbols..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded bg-zinc-900 py-1 pl-7 pr-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
        </div>
      </div>

      {/* Table Head */}
      <div className="grid grid-cols-12 border-b border-zinc-850 px-2 py-1 text-[10px] text-zinc-500">
        <span className="col-span-4">SYMBOL</span>
        <span className="col-span-4 text-right">LAST</span>
        <span className="col-span-4 text-right">24H CHG</span>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/60">
        {filtered.map((item) => {
          const isSelected = item.symbol === activeSymbol;
          const isPositive = item.change24hPercent >= 0;

          return (
            <div
              key={item.symbol}
              onClick={() => onSelectSymbol(item.symbol)}
              className={`grid grid-cols-12 items-center px-2 py-2 cursor-pointer transition-colors ${
                isSelected
                  ? "bg-amber-500/10 border-l-2 border-amber-500 text-zinc-100"
                  : "hover:bg-zinc-900/60 text-zinc-400"
              }`}
            >
              <div className="col-span-4">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-zinc-200">{item.symbol}</span>
                  <span className="rounded bg-zinc-800 px-1 text-[9px] text-zinc-400">
                    {item.exchange}
                  </span>
                </div>
                <div className="truncate text-[10px] text-zinc-500">{item.name}</div>
              </div>

              <div className="col-span-4 text-right font-medium text-zinc-200">
                ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              <div className="col-span-4 flex items-center justify-end gap-1 font-medium">
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-rose-400" />
                )}
                <span className={isPositive ? "text-emerald-400" : "text-rose-400"}>
                  {isPositive ? `+${item.change24hPercent}%` : `${item.change24hPercent}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
