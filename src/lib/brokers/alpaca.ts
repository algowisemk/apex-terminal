/**
 * Alpaca Markets API Client
 * Supports Equities, Crypto, Real-time Bars, Account Balances, Paper & Live Orders
 */

const ALPACA_KEY = process.env.ALPACA_API_KEY || "";
const ALPACA_SECRET = process.env.ALPACA_API_SECRET || "";
const BASE_URL = process.env.ALPACA_BASE_URL || "https://paper-api.alpaca.markets";
const DATA_URL = process.env.ALPACA_DATA_URL || "https://data.alpaca.markets";

function getHeaders() {
  return {
    "APCA-API-KEY-ID": ALPACA_KEY,
    "APCA-API-SECRET-KEY": ALPACA_SECRET,
    "Content-Type": "application/json",
  };
}

export async function getAlpacaAccount() {
  if (!ALPACA_KEY || !ALPACA_SECRET) {
    return {
      broker: "ALPACA" as const,
      status: "demo" as const,
      equity: 100000.0,
      cash: 85250.0,
      buyingPower: 170500.0,
      unrealizedPnL: 0,
      marginUsed: 0,
      currency: "USD",
    };
  }

  try {
    const res = await fetch(`${BASE_URL}/v2/account`, {
      headers: getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Alpaca error: ${res.statusText}`);
    const data = await res.json();
    return {
      broker: "ALPACA" as const,
      status: "connected" as const,
      accountNumber: data.account_number,
      equity: parseFloat(data.equity || data.portfolio_value || "0"),
      cash: parseFloat(data.cash || "0"),
      buyingPower: parseFloat(data.buying_power || "0"),
      unrealizedPnL: parseFloat(data.equity || "0") - parseFloat(data.last_equity || data.equity || "0"),
      marginUsed: parseFloat(data.initial_margin || "0"),
      currency: data.currency || "USD",
    };
  } catch (err: any) {
    return {
      broker: "ALPACA" as const,
      status: "error" as const,
      error: err.message,
      equity: 0,
      cash: 0,
      buyingPower: 0,
      unrealizedPnL: 0,
      marginUsed: 0,
      currency: "USD",
    };
  }
}

export async function getAlpacaBars(symbol: string, timeframe = "1Hour", limit = 100) {
  if (!ALPACA_KEY || !ALPACA_SECRET) {
    return generateDemoBars(symbol, limit);
  }

  try {
    const isCrypto =
      symbol.includes("/") ||
      symbol.includes("PERP") ||
      symbol.startsWith("BTC") ||
      symbol.startsWith("ETH") ||
      symbol.startsWith("SOL");

    // Start 14 days ago so off-hours and weekend requests have bars
    const start = new Date(Date.now() - 14 * 86400000).toISOString();

    let endpoint = "";
    if (isCrypto) {
      const cryptoPair = symbol.includes("/") ? symbol : `${symbol.replace("-PERP", "")}/USD`;
      endpoint = `${DATA_URL}/v1beta3/crypto/us/bars?symbols=${encodeURIComponent(
        cryptoPair
      )}&timeframe=${timeframe}&limit=${limit}&start=${start}`;
    } else {
      endpoint = `${DATA_URL}/v2/stocks/${encodeURIComponent(
        symbol
      )}/bars?timeframe=${timeframe}&limit=${limit}&feed=iex&start=${start}`;
    }

    const res = await fetch(endpoint, {
      headers: getHeaders(),
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`Alpaca Data error: ${res.statusText}`);
    const data = await res.json();

    const rawBars = isCrypto
      ? data.bars?.[symbol.includes("/") ? symbol : `${symbol.replace("-PERP", "")}/USD`]
      : data.bars;

    if (!rawBars || !Array.isArray(rawBars) || rawBars.length === 0) {
      return generateDemoBars(symbol, limit);
    }

    return rawBars.map((b: any) => ({
      time: Math.floor(new Date(b.t).getTime() / 1000),
      open: b.o,
      high: b.h,
      low: b.l,
      close: b.c,
      volume: b.v,
    }));
  } catch (err) {
    console.error("Alpaca fetch failed, falling back to simulator:", err);
    return generateDemoBars(symbol, limit);
  }
}

function generateDemoBars(symbol: string, count: number) {
  const bars = [];
  let basePrice = symbol.includes("BTC")
    ? 80500
    : symbol.includes("ETH")
    ? 2650
    : symbol.includes("NVDA")
    ? 218
    : symbol.includes("SPY")
    ? 585
    : 180;
  const now = Math.floor(Date.now() / 1000);
  const interval = 3600;

  for (let i = count; i >= 0; i--) {
    const time = now - i * interval;
    const volatility = basePrice * 0.008;
    const change = (Math.random() - 0.49) * volatility;
    const open = basePrice;
    const close = basePrice + change;
    const high = Math.max(open, close) + Math.random() * (volatility * 0.5);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.5);
    basePrice = close;

    bars.push({
      time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 50000 + 10000),
    });
  }
  return bars;
}
