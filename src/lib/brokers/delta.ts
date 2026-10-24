/**
 * Delta Exchange API Client
 * Real-time Crypto Derivatives, Perpetuals, Futures, Wallet Balances, and Live Positions
 */

import crypto from "crypto";

const DELTA_URL = process.env.DELTA_BASE_URL || "https://api.india.delta.exchange";
const API_KEY = process.env.DELTA_API_KEY || "";
const API_SECRET = process.env.DELTA_API_SECRET || "";

function signRequest(method: string, path: string, body = "") {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const message = method + timestamp + path + body;
  const signature = crypto.createHmac("sha256", API_SECRET).update(message).digest("hex");
  return {
    "api-key": API_KEY,
    "timestamp": timestamp,
    "signature": signature,
    "Content-Type": "application/json",
  };
}

export async function getDeltaAccount() {
  if (!API_KEY || !API_SECRET) {
    return {
      broker: "DELTA" as const,
      status: "demo" as const,
      equity: 30.20,
      cash: 10.36,
      buyingPower: 200.0,
      unrealizedPnL: 0,
      marginUsed: 10.25,
      currency: "USD",
    };
  }

  try {
    const path = "/v2/wallet/balances";
    const res = await fetch(`${DELTA_URL}${path}`, {
      headers: signRequest("GET", path),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Delta API error: ${res.statusText}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.code || "Delta auth failed");

    const usdBalance = json.result?.find((b: any) => b.asset_symbol === "USD");
    const netEquity = parseFloat(json.meta?.net_equity || "0");
    const balance = parseFloat(usdBalance?.balance || "0");
    const available = parseFloat(usdBalance?.available_balance || "0");
    const positionMargin = parseFloat(usdBalance?.position_margin || "0");

    return {
      broker: "DELTA" as const,
      status: "connected" as const,
      userId: usdBalance?.user_id,
      equity: netEquity || balance,
      cash: available,
      buyingPower: available * 20, // 20x default leverage
      marginUsed: positionMargin,
      unrealizedPnL: netEquity - balance,
      currency: "USD",
    };
  } catch (err: any) {
    console.error("Delta account fetch error:", err.message);
    return {
      broker: "DELTA" as const,
      status: "error" as const,
      error: err.message,
      equity: 0,
      cash: 0,
      buyingPower: 0,
      marginUsed: 0,
      unrealizedPnL: 0,
      currency: "USD",
    };
  }
}

export async function getDeltaPositions() {
  if (!API_KEY || !API_SECRET) return [];

  try {
    const path = "/v2/positions/margined";
    const res = await fetch(`${DELTA_URL}${path}`, {
      headers: signRequest("GET", path),
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch Delta positions");
    const json = await res.json();
    if (!json.success) return [];

    return (json.result || []).map((pos: any) => ({
      symbol: pos.product_symbol,
      description: pos.product?.description || pos.product_symbol,
      size: pos.size,
      entryPrice: parseFloat(pos.entry_price || "0"),
      markPrice: parseFloat(pos.mark_price || "0"),
      unrealizedPnL: parseFloat(pos.unrealized_pnl || "0"),
      margin: parseFloat(pos.margin || "0"),
      liquidationPrice: pos.liquidation_price ? parseFloat(pos.liquidation_price) : null,
      strike: pos.product?.strike_price ? parseFloat(pos.product.strike_price) : null,
      contractType: pos.product?.contract_type || "option",
      settlementTime: pos.product?.settlement_time,
    }));
  } catch (err) {
    console.error("Delta positions error:", err);
    return [];
  }
}

export async function getDeltaTickers() {
  try {
    const res = await fetch(`${DELTA_URL}/v2/tickers`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Delta API unreachable");
    const json = await res.json();
    const data = json.result || [];

    const majorSymbols = ["BTCUSD", "ETHUSD", "SOLUSD", "XRPUSD", "DOGEUSD", "AVAXUSD"];
    const filtered = data.filter((t: any) =>
      majorSymbols.includes(t.symbol) || t.contract_type === "perpetual_futures"
    );

    return (filtered.length > 0 ? filtered : data).slice(0, 30).map((t: any) => ({
      symbol: t.symbol,
      markPrice: parseFloat(t.mark_price || t.close || 0),
      close24h: parseFloat(t.close || 0),
      open24h: parseFloat(t.open || 0),
      volume24h: parseFloat(t.volume || 0),
      high24h: parseFloat(t.high || t.mark_high_24h || 0),
      low24h: parseFloat(t.low || t.mark_low_24h || 0),
      change24hPercent: parseFloat(t.mark_change_24h || t.ltp_change_24h || 0),
      fundingRate: parseFloat(t.funding_rate || 0),
    }));
  } catch (err) {
    console.error("Delta fetch error:", err);
    return [];
  }
}
