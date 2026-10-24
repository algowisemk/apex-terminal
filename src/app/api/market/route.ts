import { NextResponse } from "next/server";
import { getAlpacaAccount, getAlpacaBars } from "@/lib/brokers/alpaca";
import { getDeribitOptionChain, getDeribitIndexPrice } from "@/lib/brokers/deribit";
import { getDeltaTickers, getDeltaAccount, getDeltaPositions } from "@/lib/brokers/delta";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "overview";
  const symbol = searchParams.get("symbol") || "NVDA";

  // 1. Candlestick Bars
  if (action === "bars") {
    const bars = await getAlpacaBars(symbol);
    return NextResponse.json({ symbol, bars });
  }

  // 2. Options Chain
  if (action === "options") {
    const currency = symbol.includes("ETH") ? "ETH" : "BTC";
    const options = await getDeribitOptionChain(currency);
    return NextResponse.json({ currency, options });
  }

  // 3. Live Overview across all connected brokers
  const [alpacaAccount, deltaAccount, deltaPositions, deltaTickers, deribitBtcIndex, deribitEthIndex] =
    await Promise.all([
      getAlpacaAccount(),
      getDeltaAccount(),
      getDeltaPositions(),
      getDeltaTickers(),
      getDeribitIndexPrice("BTC"),
      getDeribitIndexPrice("ETH"),
    ]);

  const liveWatchlist = [
    {
      symbol: "BTCUSD",
      name: "Bitcoin Perpetual",
      price: deribitBtcIndex || 80700,
      change24h: 1250,
      change24hPercent: 1.57,
      high24h: 82035,
      low24h: 80414,
      volume24h: 184500000,
      assetClass: "future" as const,
      exchange: "DELTA" as const,
    },
    {
      symbol: "ETHUSD",
      name: "Ethereum Perpetual",
      price: deribitEthIndex || 2650,
      change24h: -32,
      change24hPercent: -1.20,
      high24h: 2710,
      low24h: 2620,
      volume24h: 84200000,
      assetClass: "future" as const,
      exchange: "DELTA" as const,
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      price: 218.18,
      change24h: 4.52,
      change24hPercent: 2.12,
      high24h: 221.4,
      low24h: 216.0,
      volume24h: 48920100,
      assetClass: "equity" as const,
      exchange: "ALPACA" as const,
    },
    {
      symbol: "SPY",
      name: "SPDR S&P 500 ETF",
      price: 585.12,
      change24h: 3.88,
      change24hPercent: 0.67,
      high24h: 586.8,
      low24h: 582.1,
      volume24h: 64102900,
      assetClass: "equity" as const,
      exchange: "ALPACA" as const,
    },
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 231.40,
      change24h: -1.15,
      change24hPercent: -0.49,
      high24h: 233.2,
      low24h: 230.1,
      volume24h: 38201500,
      assetClass: "equity" as const,
      exchange: "ALPACA" as const,
    },
  ];

  for (const dt of deltaTickers.slice(0, 5)) {
    if (!liveWatchlist.some((w) => w.symbol === dt.symbol)) {
      liveWatchlist.push({
        symbol: dt.symbol,
        name: `${dt.symbol} Contract`,
        price: dt.markPrice,
        change24h: dt.markPrice - dt.open24h,
        change24hPercent: dt.change24hPercent || 0,
        high24h: dt.high24h,
        low24h: dt.low24h,
        volume24h: dt.volume24h,
        assetClass: "future" as const,
        exchange: "DELTA" as const,
      });
    }
  }

  return NextResponse.json({
    accounts: {
      alpaca: alpacaAccount,
      delta: deltaAccount,
    },
    positions: {
      delta: deltaPositions,
    },
    watchlist: liveWatchlist,
    deltaTickers,
    deribitIndex: { BTC: deribitBtcIndex, ETH: deribitEthIndex },
    serverTime: new Date().toISOString(),
  });
}
