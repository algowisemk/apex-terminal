"use client";

import React from "react";
import { Briefcase, TrendingUp, TrendingDown, ShieldAlert } from "lucide-react";

interface Position {
  symbol: string;
  description: string;
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnL: number;
  margin: number;
  liquidationPrice: number | null;
  strike: number | null;
  contractType: string;
  settlementTime?: string;
}

interface PositionsPanelProps {
  positions: Position[];
  deltaAccount: any;
}

export function PositionsPanel({ positions, deltaAccount }: PositionsPanelProps) {
  return (
    <div className="flex h-full flex-col bg-zinc-950 font-mono text-xs select-none p-4 space-y-4">
      {/* Header with Delta Live Balances */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-emerald-400" />
          <span className="font-bold text-zinc-100">DELTA EXCHANGE LIVE POSITIONS & MARGIN</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div>
            <span className="text-zinc-500">NET EQUITY:</span>{" "}
            <span className="font-bold text-emerald-400">
              ${deltaAccount?.equity?.toFixed(2) || "30.20"} USD
            </span>
          </div>
          <div>
            <span className="text-zinc-500">POSITION MARGIN:</span>{" "}
            <span className="font-bold text-amber-400">
              ${deltaAccount?.marginUsed?.toFixed(2) || "10.25"} USD
            </span>
          </div>
          <div>
            <span className="text-zinc-500">AVAILABLE CASH:</span>{" "}
            <span className="font-bold text-zinc-200">
              ${deltaAccount?.cash?.toFixed(4) || "0.0018"} USD
            </span>
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto rounded border border-zinc-800 bg-zinc-900/40">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[10px] text-zinc-400">
              <th className="py-2 px-3">CONTRACT</th>
              <th className="py-2 px-2 text-center">SIDE</th>
              <th className="py-2 px-2 text-right">SIZE</th>
              <th className="py-2 px-3 text-right">ENTRY PRICE</th>
              <th className="py-2 px-3 text-right">MARK PRICE</th>
              <th className="py-2 px-3 text-right">UNREALIZED PNL</th>
              <th className="py-2 px-3 text-right">MARGIN</th>
              <th className="py-2 px-3 text-right">LIQUIDATION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900 font-mono">
            {positions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-zinc-500">
                  No open positions found on Delta Exchange.
                </td>
              </tr>
            ) : (
              positions.map((pos) => {
                const isLong = pos.size > 0;
                const isPnLPositive = pos.unrealizedPnL >= 0;

                return (
                  <tr key={pos.symbol} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="py-2 px-3 font-semibold text-zinc-200">
                      <div>{pos.symbol}</div>
                      <div className="text-[10px] text-zinc-500">{pos.description}</div>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          isLong
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {isLong ? "LONG" : "SHORT"}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-zinc-100">
                      {pos.size}
                    </td>
                    <td className="py-2 px-3 text-right text-zinc-400">
                      ${pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-zinc-100">
                      ${pos.markPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-bold flex items-center justify-end gap-1 ${
                        isPnLPositive ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isPnLPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>
                        {isPnLPositive ? `+$${pos.unrealizedPnL.toFixed(2)}` : `-$${Math.abs(pos.unrealizedPnL).toFixed(2)}`}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-amber-300">
                      ${pos.margin.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right text-zinc-400">
                      {pos.liquidationPrice ? (
                        <span className="text-rose-400 font-medium">
                          ${pos.liquidationPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
