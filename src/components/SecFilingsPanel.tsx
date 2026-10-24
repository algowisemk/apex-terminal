"use client";

import React, { useState, useEffect } from "react";
import { FileText, ExternalLink, RefreshCw, Landmark, ShieldCheck, DollarSign } from "lucide-react";

interface SecFilingsPanelProps {
  symbol: string;
}

export function SecFilingsPanel({ symbol }: SecFilingsPanelProps) {
  const [ticker, setTicker] = useState(symbol.includes("BTC") ? "NVDA" : symbol);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filterForm, setFilterForm] = useState<string>("ALL");

  const fetchSecData = async (targetTicker: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sec?ticker=${targetTicker}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("SEC fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cleanTicker = symbol.includes("BTC") || symbol.includes("ETH") ? "NVDA" : symbol;
    setTicker(cleanTicker);
    fetchSecData(cleanTicker);
  }, [symbol]);

  const filings = data?.filings || [];
  const filteredFilings =
    filterForm === "ALL" ? filings : filings.filter((f: any) => f.form === filterForm);

  const metrics = data?.financials?.metrics;

  return (
    <div className="flex h-full flex-col bg-zinc-950 font-mono text-xs select-none p-4 space-y-4">
      {/* Desk Top Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Landmark className="h-4 w-4" />
            <span>U.S. SEC EDGAR OFFICIAL FILINGS & 10-K STATEMENTS</span>
          </div>
          <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
            {data?.financials?.entityName || ticker} (CIK: {data?.cik || "Resolving..."})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Stock Switcher */}
          <div className="flex items-center gap-1">
            {["NVDA", "AAPL", "MSFT", "TSLA", "SPY"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTicker(t);
                  fetchSecData(t);
                }}
                className={`rounded px-2 py-0.5 text-[11px] font-bold transition-colors ${
                  ticker === t
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "text-zinc-500 hover:text-zinc-300 bg-zinc-900"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchSecData(ticker)}
            disabled={loading}
            className="flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-zinc-300 hover:text-zinc-100"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin text-amber-400" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 1. Audited US-GAAP Financial Facts Cards */}
      <div>
        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>AUDITED US-GAAP FINANCIALS (DIRECT FROM SEC 10-K / 10-Q)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { label: "REVENUE", data: metrics?.revenue },
            { label: "NET INCOME", data: metrics?.netIncome },
            { label: "GROSS PROFIT", data: metrics?.grossProfit },
            { label: "CASH & EQUIV", data: metrics?.cashAndEquivalents },
            { label: "TOTAL ASSETS", data: metrics?.totalAssets },
            { label: "LONG-TERM DEBT", data: metrics?.longTermDebt },
          ].map((item, idx) => (
            <div key={idx} className="rounded border border-zinc-850 bg-zinc-900/60 p-2.5">
              <div className="text-[10px] text-zinc-500 truncate">{item.label}</div>
              <div className="text-base font-bold text-zinc-100 mt-1 truncate">
                {item.data?.value ? `$${(item.data.value / 1e9).toFixed(2)}B` : "N/A"}
              </div>
              <div className="text-[9px] text-zinc-500 mt-0.5 truncate">
                {item.data ? `${item.data.form} (${item.data.periodEnd})` : "—"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Official Filings Table */}
      <div className="flex-1 flex flex-col rounded border border-zinc-800 bg-zinc-900/30 overflow-hidden">
        {/* Filter bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 bg-zinc-900/60">
          <div className="flex items-center gap-2 text-zinc-300 font-semibold">
            <FileText className="h-3.5 w-3.5 text-amber-400" />
            <span>SUBMISSIONS ARCHIVE ({filteredFilings.length} Filings)</span>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-zinc-500">Filter:</span>
            {["ALL", "10-K", "10-Q", "8-K", "4"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterForm(f)}
                className={`rounded px-2 py-0.5 text-[10px] ${
                  filterForm === f
                    ? "bg-amber-500/20 text-amber-400 font-bold"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-850 bg-zinc-900/80 text-[10px] text-zinc-500">
                <th className="py-2 px-3">FORM TYPE</th>
                <th className="py-2 px-3">FILING DATE</th>
                <th className="py-2 px-3">REPORT PERIOD</th>
                <th className="py-2 px-4">ACCESSION NUMBER</th>
                <th className="py-2 px-4">DESCRIPTION</th>
                <th className="py-2 px-3 text-right">SEC ARCHIVE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 font-mono">
              {filteredFilings.map((filing: any, idx: number) => {
                const isAnnual = filing.form === "10-K";
                const isQuarterly = filing.form === "10-Q";
                const isMaterial = filing.form === "8-K";

                return (
                  <tr key={idx} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="py-2 px-3">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          isAnnual
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : isQuarterly
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : isMaterial
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {filing.form}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-zinc-300">{filing.filingDate}</td>
                    <td className="py-2 px-3 text-zinc-400">{filing.reportDate}</td>
                    <td className="py-2 px-4 text-zinc-400 text-[11px]">{filing.accessionNumber}</td>
                    <td className="py-2 px-4 text-zinc-200 truncate max-w-xs">
                      {filing.description}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <a
                        href={filing.secUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
                      >
                        <span>View Document</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
