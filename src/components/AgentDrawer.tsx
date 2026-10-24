"use client";

import React, { useState } from "react";
import { Bot, Sparkles, FileText, Send, CheckCircle2 } from "lucide-react";

interface AgentDrawerProps {
  symbol: string;
}

export function AgentDrawer({ symbol }: AgentDrawerProps) {
  const [prompt, setPrompt] = useState(`Draft comprehensive investment memo and risk skew for ${symbol}`);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const handleRunAgent = () => {
    setAnalyzing(true);
    setReport(null);

    // Simulate multi-agent planning, tool-calling, and memo drafting
    setTimeout(() => {
      setReport(`### EXECUTIVE INVESTMENT MEMO: ${symbol}
**Agent Cluster:** Fundamental Analyst + Derivatives Volatility Desk + Macro Monitor
**Date:** ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}

---

#### 1. Executive Thesis
${symbol} presents an asymmetric risk/reward opportunity at current price levels. Momentum indicators across 1H and 4H timeframes signal strong institutional accumulation with elevated open interest on out-of-the-money call strikes.

#### 2. Key Valuation & Order Flow Metrics
* **Support / Resistance:** Primary support established at 20-EMA; resistance clustered at recent 52-week volume weighted high.
* **Derivatives Skew:** 25-Delta Call skew is trading at +3.8 vol points over Puts, reflecting directional upside speculation.
* **Volume Profile:** 24h volume exceeded 10-day moving average by +24.6%, validating upward price discovery.

#### 3. Recommended Trade Structure
* **Directional Strategy:** Bull Call Spread or Long Spot with tight stop-loss below local volume shelf.
* **Risk Parameter:** Maximum position size allocation of 3.5% portfolio equity. Stop loss placed at -4.2% from entry.
`);
      setAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col bg-zinc-950 font-mono text-xs select-none p-3 space-y-3">
      {/* Agent Desk Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-amber-400" />
          <span className="font-bold text-zinc-200">AI AGENTIC RESEARCH DESK</span>
        </div>
        <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-400 border border-indigo-500/20">
          MULTI-AGENT ACTIVE
        </span>
      </div>

      {/* Prompt Input */}
      <div className="rounded border border-zinc-800 bg-zinc-900/60 p-2.5 space-y-2">
        <label className="text-[10px] text-zinc-400 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>RESEARCH AGENT OBJECTIVE</span>
        </label>
        <textarea
          rows={2}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full rounded border border-zinc-800 bg-zinc-950 p-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
        />
        <div className="flex justify-end">
          <button
            onClick={handleRunAgent}
            disabled={analyzing}
            className="flex items-center gap-1.5 rounded bg-amber-500 hover:bg-amber-400 px-3 py-1 font-bold text-zinc-950 transition-colors"
          >
            {analyzing ? (
              <>
                <span className="animate-spin text-zinc-950">●</span>
                <span>DELEGATING AGENTS...</span>
              </>
            ) : (
              <>
                <Send className="h-3 w-3" />
                <span>EXECUTE RESEARCH NOTE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Agent Output Report */}
      <div className="flex-1 overflow-y-auto rounded border border-zinc-850 bg-zinc-900/40 p-4">
        {report ? (
          <div className="prose prose-invert prose-xs max-w-none space-y-2 text-zinc-300">
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] pb-2 border-b border-zinc-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Multi-Agent Sourced Note Generated</span>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-zinc-200 bg-transparent p-0 border-0">
              {report}
            </pre>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-zinc-500 space-y-2">
            <FileText className="h-8 w-8 text-zinc-600" />
            <p>Ask the agent desk to generate a fundamental memo, calculate implied volatility skew, or synthesize earnings filings.</p>
          </div>
        )}
      </div>
    </div>
  );
}
