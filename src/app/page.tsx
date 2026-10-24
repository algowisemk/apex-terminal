"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { WatchlistPanel } from "@/components/WatchlistPanel";
import { OptionsMatrix } from "@/components/OptionsMatrix";
import { PositionsPanel } from "@/components/PositionsPanel";
import { OrderTicket } from "@/components/OrderTicket";
import { AgentDrawer } from "@/components/AgentDrawer";
import { QuantLab } from "@/components/QuantLab";
import { CommandPalette } from "@/components/CommandPalette";
import { AuthModal } from "@/components/AuthModal";
import { createClient } from "@/lib/supabase/client";
import { TickerSummary, Candle, AccountSummary } from "@/lib/types";

// Dynamically import ChartPanel with ssr: false to prevent Canvas / Webpack SSR conflicts on Vercel
const ChartPanel = dynamic(
  () => import("@/components/ChartPanel").then((mod) => mod.ChartPanel),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-zinc-950 font-mono text-xs text-zinc-600">
        INITIALIZING TRADINGVIEW ENGINE...
      </div>
    ),
  }
);

export default function TerminalHome() {
  const [activeTab, setActiveTab] = useState<"markets" | "options" | "quant" | "ai" | "positions">("markets");
  const [activeSymbol, setActiveSymbol] = useState("BTCUSD");
  const [timeframe, setTimeframe] = useState("1H");
  const [watchlist, setWatchlist] = useState<TickerSummary[]>([]);
  const [bars, setBars] = useState<Candle[]>([]);
  const [accounts, setAccounts] = useState<{ alpaca: AccountSummary | null; delta: any }>({
    alpaca: null,
    delta: null,
  });
  const [positions, setPositions] = useState<any[]>([]);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [apiStatus, setApiStatus] = useState({
    alpaca: false,
    deribit: true,
    delta: false,
  });

  // Safely initialize Supabase on client
  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        setCurrentUser(data.user || null);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
        setCurrentUser(session?.user || null);
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } catch (e) {
      console.warn("Supabase init deferred:", e);
    }
  }, []);

  // Fetch initial market overview data
  useEffect(() => {
    async function loadOverview() {
      try {
        const res = await fetch("/api/market?action=overview");
        const data = await res.json();
        setWatchlist(data.watchlist || []);
        setAccounts({
          alpaca: data.accounts?.alpaca || null,
          delta: data.accounts?.delta || null,
        });
        setPositions(data.positions?.delta || []);
        setApiStatus({
          alpaca: data.accounts?.alpaca?.status === "connected",
          deribit: true,
          delta: data.accounts?.delta?.status === "connected",
        });
      } catch (err) {
        console.error("Failed to load market overview", err);
      }
    }
    loadOverview();
  }, []);

  // Fetch candlestick bars when activeSymbol or timeframe changes
  useEffect(() => {
    async function loadBars() {
      try {
        const res = await fetch(`/api/market?action=bars&symbol=${activeSymbol}&timeframe=${timeframe}`);
        const data = await res.json();
        setBars(data.bars || []);
      } catch (err) {
        console.error("Failed to load bars", err);
      }
    }
    loadBars();
  }, [activeSymbol, timeframe]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-black text-zinc-100 font-sans">
      {/* 1. Global Terminal Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSymbol={activeSymbol}
        onOpenCommand={() => setIsCommandOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        positionsCount={positions.length}
        apiStatus={apiStatus}
      />

      {/* 2. Main Terminal Grid Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Watchlist (Pinned across tabs) */}
        <div className="w-72 flex-shrink-0">
          <WatchlistPanel
            watchlist={watchlist}
            activeSymbol={activeSymbol}
            onSelectSymbol={(sym) => setActiveSymbol(sym)}
          />
        </div>

        {/* Center / Right: Dynamic Desk View */}
        <div className="flex flex-1 overflow-hidden">
          {activeTab === "markets" && (
            <>
              <div className="flex-1 overflow-hidden">
                <ChartPanel
                  symbol={activeSymbol}
                  bars={bars}
                  timeframe={timeframe}
                  setTimeframe={setTimeframe}
                />
              </div>
              <div className="w-80 flex-shrink-0">
                <OrderTicket symbol={activeSymbol} account={accounts.alpaca} />
              </div>
            </>
          )}

          {activeTab === "options" && (
            <div className="flex-1 overflow-hidden">
              <OptionsMatrix underlying={activeSymbol} />
            </div>
          )}

          {activeTab === "positions" && (
            <div className="flex-1 overflow-hidden">
              <PositionsPanel positions={positions} deltaAccount={accounts.delta} />
            </div>
          )}

          {activeTab === "quant" && (
            <div className="flex-1 overflow-hidden">
              <QuantLab bars={bars} symbol={activeSymbol} />
            </div>
          )}

          {activeTab === "ai" && (
            <div className="flex-1 overflow-hidden">
              <AgentDrawer symbol={activeSymbol} />
            </div>
          )}
        </div>
      </div>

      {/* Command Palette Modal (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectSymbol={(sym) => setActiveSymbol(sym)}
        onSelectDesk={(desk) => setActiveTab(desk)}
      />

      {/* Supabase Auth & Keys Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChanged={(user) => setCurrentUser(user)}
      />
    </div>
  );
}
