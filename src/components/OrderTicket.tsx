"use client";

import React, { useState } from "react";
import { OrderPayload, AccountSummary } from "@/lib/types";
import { ArrowUpRight, ArrowDownRight, Wallet, CheckCircle } from "lucide-react";

interface OrderTicketProps {
  symbol: string;
  account: AccountSummary | null;
}

export function OrderTicket({ symbol, account }: OrderTicketProps) {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT" | "STOP">("LIMIT");
  const [qty, setQty] = useState("10");
  const [limitPrice, setLimitPrice] = useState("138.50");
  const [broker, setBroker] = useState<"ALPACA" | "DERIBIT" | "DELTA">("ALPACA");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const estimatedTotal = parseFloat(qty || "0") * parseFloat(limitPrice || "0");

  return (
    <div className="flex h-full flex-col border-l border-zinc-800 bg-zinc-950 font-mono text-xs select-none">
      {/* Broker & Account Badge */}
      <div className="border-b border-zinc-800 p-3 bg-zinc-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <Wallet className="h-4 w-4 text-amber-500" />
            <span>EXECUTION DESK</span>
          </div>
          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400 border border-emerald-500/20">
            {account?.status === "connected" ? "PAPER ACTIVE" : "SIMULATOR"}
          </span>
        </div>

        {/* Account Balances */}
        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
          <div>
            <div>EQUITY:</div>
            <div className="font-bold text-zinc-100">
              ${account?.equity?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "100,000.00"}
            </div>
          </div>
          <div>
            <div>BUYING POWER:</div>
            <div className="font-bold text-zinc-100">
              ${account?.buyingPower?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "170,500.00"}
            </div>
          </div>
        </div>
      </div>

      {/* Order Ticket Form */}
      <form onSubmit={handleSubmit} className="flex-1 p-3 space-y-3">
        {/* Router Selector */}
        <div>
          <label className="text-[10px] text-zinc-500 block mb-1">EXECUTION ROUTE</label>
          <div className="grid grid-cols-3 gap-1">
            {(["ALPACA", "DERIBIT", "DELTA"] as const).map((b) => (
              <button
                type="button"
                key={b}
                onClick={() => setBroker(b)}
                className={`py-1 text-center rounded text-[10px] border ${
                  broker === b
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-400 font-bold"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Side Tabs (BUY / SELL) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSide("BUY")}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded font-bold transition-colors ${
              side === "BUY"
                ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>BUY / LONG</span>
          </button>
          <button
            type="button"
            onClick={() => setSide("SELL")}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded font-bold transition-colors ${
              side === "SELL"
                ? "bg-rose-500 text-zinc-950 shadow-md shadow-rose-500/20"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            }`}
          >
            <ArrowDownRight className="h-4 w-4" />
            <span>SELL / SHORT</span>
          </button>
        </div>

        {/* Order Type */}
        <div>
          <label className="text-[10px] text-zinc-500 block mb-1">ORDER TYPE</label>
          <div className="grid grid-cols-3 gap-1">
            {(["MARKET", "LIMIT", "STOP"] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setOrderType(t)}
                className={`py-1 text-center rounded text-[10px] border ${
                  orderType === t
                    ? "border-zinc-500 bg-zinc-800 text-zinc-100 font-semibold"
                    : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="text-[10px] text-zinc-500 block mb-1">QUANTITY</label>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-amber-500/50 focus:outline-none"
          />
        </div>

        {/* Limit Price */}
        {orderType !== "MARKET" && (
          <div>
            <label className="text-[10px] text-zinc-500 block mb-1">LIMIT PRICE (USD)</label>
            <input
              type="number"
              step="0.01"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-amber-500/50 focus:outline-none"
            />
          </div>
        )}

        {/* Summary */}
        <div className="rounded border border-zinc-850 bg-zinc-900/60 p-2.5 space-y-1 text-[11px] text-zinc-400">
          <div className="flex justify-between">
            <span>Symbol:</span>
            <span className="font-bold text-zinc-200">{symbol}</span>
          </div>
          <div className="flex justify-between">
            <span>Est. Value:</span>
            <span className="font-bold text-zinc-200">${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span>Routing:</span>
            <span className="text-amber-400">{broker} Gateway</span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`w-full py-2 rounded font-bold tracking-wider transition-all ${
            side === "BUY"
              ? "bg-emerald-600 hover:bg-emerald-500 text-zinc-950"
              : "bg-rose-600 hover:bg-rose-500 text-zinc-950"
          }`}
        >
          {side} {qty} {symbol}
        </button>

        {submitted && (
          <div className="flex items-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-400 text-[11px]">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Order routed to {broker} successfully!</span>
          </div>
        )}
      </form>
    </div>
  );
}
