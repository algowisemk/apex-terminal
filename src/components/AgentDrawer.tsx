"use client";

import React, { useState } from "react";
import { ResearchMemo } from "@/lib/agents/orchestrator";
import { Bot, Sparkles, Send, CheckCircle2, FileSpreadsheet, Zap } from "lucide-react";

interface AgentDrawerProps {
  symbol: string;
}

export function AgentDrawer({ symbol }: AgentDrawerProps) {
  const [prompt, setPrompt] = useState(`Analyze ${symbol} across fundamental valuation, options skew, and Kelly risk sizing`);
  const [analyzing, setAnalyzing] = useState(false);
  const [memo, setMemo] = useState<ResearchMemo | null>(null);

  const handleRunAgent = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, prompt }),
      });
      if (!res.ok) throw new Error("Agent swarm generation failed");
      const data = await res.json();
      setMemo(data);
    } catch (err) {
      console.error("Agent run failed:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-zinc-950 font-mono text-xs select-none p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-amber-400" />
          <span className="font-bold text-zinc-200">AI AGENTIC RESEARCH SWARM</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <Zap className="h-3 w-3" />
            <span>GROQ LPU (QWEN-27B) ACTIVE</span>
          </span>
          <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-400 border border-indigo-500/20">
            4 AGENTS
          </span>
        </div>
      </div>

      {/* Prompt Bar */}
      <div className="rounded border border-zinc-800 bg-zinc-900/60 p-2.5 space-y-2">
        <label className="text-[10px] text-zinc-400 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>DIRECTIVE FOR RESEARCH DESK</span>
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
            className="flex items-center gap-1.5 rounded bg-amber-500 hover:bg-amber-400 px-3 py-1.5 font-bold text-zinc-950 transition-colors"
          >
            {analyzing ? (
              <>
                <span className="animate-spin text-zinc-950">●</span>
                <span>SWARM RUNNING (GROQ LPU)...</span>
              </>
            ) : (
              <>
                <Send className="h-3 w-3" />
                <span>DISPATCH AGENT SWARM</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 overflow-hidden">
        {/* Left: Swarm Execution Pipeline (Step by Step) */}
        <div className="md:col-span-4 rounded border border-zinc-850 bg-zinc-900/30 p-3 overflow-y-auto space-y-2">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider pb-1 border-b border-zinc-850">
            AGENT DELEGATION PIPELINE
          </div>

          {!memo && !analyzing && (
            <div className="text-zinc-600 py-6 text-center text-[11px]">
              Hit "Dispatch Agent Swarm" to initiate Planner, Fundamental, Derivatives, and Risk agents on Groq LPU.
            </div>
          )}

          {memo?.steps.map((step, idx) => (
            <div
              key={idx}
              className="rounded border border-zinc-800 bg-zinc-950 p-2.5 space-y-1 transition-all"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-400">{step.agentName}</span>
                <span className="rounded bg-emerald-500/10 px-1 text-[9px] text-emerald-400 font-semibold">
                  COMPLETED
                </span>
              </div>
              <div className="text-[10px] text-zinc-500">{step.role}</div>
              <div className="text-[11px] text-zinc-300 leading-snug pt-1">
                {step.output}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Real Sourced Investment Memo */}
        <div className="md:col-span-8 rounded border border-zinc-850 bg-zinc-900/40 p-4 overflow-y-auto">
          {memo ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-emerald-400 text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-bold">VERIFIED SOURCED MEMORANDUM</span>
                </div>
                <span className="rounded bg-amber-500/10 px-2 py-0.5 text-amber-400 font-bold text-[10px]">
                  THESIS: {memo.thesis} ({memo.confidenceScore}% CONFIDENCE)
                </span>
              </div>

              <div className="prose prose-invert prose-xs max-w-none text-zinc-200">
                <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-zinc-200 bg-transparent p-0 border-0">
                  {memo.markdownMemo}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center text-zinc-500 space-y-2">
              <FileSpreadsheet className="h-8 w-8 text-zinc-600" />
              <p>The Synthesizer Agent will render an executive institutional investment memorandum here once the swarm concludes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
