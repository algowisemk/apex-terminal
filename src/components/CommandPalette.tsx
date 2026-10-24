"use client";

import React, { useEffect, useState } from "react";
import { Search, X, TrendingUp, Zap, Bot, ArrowRight } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSymbol: (symbol: string) => void;
  onSelectDesk: (desk: "markets" | "options" | "quant" | "ai") => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onSelectSymbol,
  onSelectDesk,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickCommands = [
    { label: "Switch to NVDA (Alpaca Equities)", symbol: "NVDA", type: "symbol" },
    { label: "Switch to BTC-PERP (Deribit Derivatives)", symbol: "BTC-PERP", type: "symbol" },
    { label: "Switch to ETH-PERP (Delta Futures)", symbol: "ETH-PERP", type: "symbol" },
    { label: "Switch to SPY (S&P 500 ETF)", symbol: "SPY", type: "symbol" },
    { label: "Open Derivatives & Greeks Desk", desk: "options", type: "desk" },
    { label: "Open AI Agent Research Desk", desk: "ai", type: "desk" },
    { label: "Open Quant Lab & Volatility Calculator", desk: "quant", type: "desk" },
  ];

  const filtered = quickCommands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-20 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-lg border border-zinc-800 bg-zinc-950 p-2 shadow-2xl font-mono text-xs">
        {/* Search Input */}
        <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
          <Search className="h-4 w-4 text-zinc-400" />
          <input
            autoFocus
            type="text"
            placeholder="Type a ticker (e.g. NVDA, BTC) or desk command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="mt-2 max-h-72 overflow-y-auto divide-y divide-zinc-900/60">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (item.type === "symbol" && item.symbol) {
                  onSelectSymbol(item.symbol);
                } else if (item.type === "desk" && item.desk) {
                  onSelectDesk(item.desk as any);
                }
                onClose();
              }}
              className="flex items-center justify-between px-3 py-2.5 text-zinc-300 hover:bg-zinc-900 cursor-pointer rounded transition-colors"
            >
              <div className="flex items-center gap-2">
                {item.type === "symbol" ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                ) : item.desk === "ai" ? (
                  <Bot className="h-3.5 w-3.5 text-indigo-400" />
                ) : (
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                )}
                <span>{item.label}</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-zinc-600" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
