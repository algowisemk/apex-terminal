export type AssetClass = "equity" | "crypto" | "option" | "future";

export interface TickerSummary {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change24hPercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  assetClass: AssetClass;
  exchange: "ALPACA" | "DERIBIT" | "DELTA";
}

export interface Candle {
  time: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface OptionGreeks {
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
  rho?: number;
}

export interface OptionContract {
  instrumentName: string;
  underlying: string;
  strike: number;
  expiration: string;
  type: "CALL" | "PUT";
  markPrice: number;
  bidPrice: number;
  askPrice: number;
  volume24h: number;
  openInterest: number;
  iv: number; // Implied Volatility %
  greeks: OptionGreeks;
  exchange: "DERIBIT" | "DELTA";
}

export interface AccountSummary {
  broker: "ALPACA" | "DERIBIT" | "DELTA";
  status: "connected" | "demo" | "error";
  currency: string;
  equity: number;
  cash: number;
  buyingPower: number;
  unrealizedPnL: number;
  marginUsed: number;
}

export interface OrderPayload {
  broker: "ALPACA" | "DERIBIT" | "DELTA";
  symbol: string;
  side: "BUY" | "SELL";
  type: "MARKET" | "LIMIT" | "STOP";
  qty: number;
  limitPrice?: number;
  stopPrice?: number;
  timeInForce: "day" | "gtc" | "ioc";
}
