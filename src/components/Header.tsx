"use client";

import React from "react";
import { Terminal, Activity, ShieldCheck, Zap, Search, Cpu, Briefcase, User } from "lucide-react";

interface HeaderProps {
  activeTab: "markets" | "options" | "quant" | "ai" | "positions";
  setActiveTab: (tab: "markets" | "options" | "quant" | "ai" | "positions") => void;
  activeSymbol: string;
  onOpenCommand: () => void;
  onOpenAuth: () => void;
  currentUser: any;
  positionsCount: number;
  apiStatus: {
    alpaca: boolean;
    deribit: boolean;
    delta: boolean;
  };
}

export function Header({
  activeTab,
  setActiveTab,
  activeSymbol,
  onOpenCommand,
  onOpenAuth,
  currentUser,
  positionsCount,
  apiStatus,
}: HeaderProps) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-4 py-2 text-xs select-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & Desks */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-mono font-bold tracking-wider text-amber-500">
            <Terminal className="h-4 w-4" />
            <span className="text-sm">APEX//TERMINAL</span>
            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-400 font-normal border border-amber-500/20">
              v0.1-WASM
            </span>
          </div>

          <nav className="flex items-center space-x-1 font-mono">
            {[
              { id: "markets", label: "MARKETS & CHART", icon: Activity },
              { id: "options", label: "DERIVATIVES & GREEKS", icon: Zap },
              { id: "positions", label: `POSITIONS (${positionsCount})`, icon: Briefcase },
              { id: "quant", label: "QUANT LAB", icon: Cpu },
              { id: "ai", label: "AI AGENT DESK", icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors ${
                    isActive
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Center: Quick Command Search */}
        <button
          onClick={onOpenCommand}
          className="flex items-center gap-2 rounded border border-zinc-800 bg-zinc-900/80 px-3 py-1 font-mono text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
        >
          <Search className="h-3.5 w-3.5 text-zinc-500" />
          <span>Active: <strong className="text-zinc-200">{activeSymbol}</strong></span>
          <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">Ctrl+K</kbd>
        </button>

        {/* Right: API Badges & User Profile */}
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" title="Alpaca Markets US Equities">
              <span className={`h-2 w-2 rounded-full ${apiStatus.alpaca ? "bg-emerald-400 animate-pulse" : "bg-amber-500"}`} />
              <span className="text-zinc-400">ALPACA:</span>
              <span className={apiStatus.alpaca ? "text-emerald-400 font-bold" : "text-amber-500"}>
                {apiStatus.alpaca ? "LIVE" : "DEMO"}
              </span>
            </div>

            <span className="text-zinc-700">|</span>

            <div className="flex items-center gap-1.5" title="Deribit Institutional Crypto Options">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-400">DERIBIT:</span>
              <span className="text-emerald-400 font-bold">LIVE</span>
            </div>

            <span className="text-zinc-700">|</span>

            <div className="flex items-center gap-1.5" title="Delta Exchange India Crypto Derivatives">
              <span className={`h-2 w-2 rounded-full ${apiStatus.delta ? "bg-emerald-400 animate-pulse" : "bg-amber-500"}`} />
              <span className="text-zinc-400">DELTA:</span>
              <span className={apiStatus.delta ? "text-emerald-400 font-bold" : "text-amber-500"}>
                {apiStatus.delta ? "LIVE" : "DEMO"}
              </span>
            </div>
          </div>

          {/* User Profile / Supabase Auth Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100 transition-colors"
          >
            <User className="h-3.5 w-3.5 text-amber-500" />
            <span>{currentUser ? currentUser.email.split("@")[0] : "SIGN IN"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
