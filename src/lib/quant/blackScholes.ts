/**
 * High-performance client-side Black-Scholes-Merton Quant engine.
 * Computes theoretical option prices, Greeks (Delta, Gamma, Vega, Theta, Rho),
 * and solves for Implied Volatility (IV) via Newton-Raphson approximation.
 */

// Standard normal cumulative distribution function (Abramowitz and Stegun approx)
export function normCdf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.sqrt(2.0);

  const t = 1.0 / (1.0 + p * absX);
  const erf = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return 0.5 * (1.0 + sign * erf);
}

// Standard normal probability density function
export function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2.0 * Math.PI);
}

export interface BSResult {
  price: number;
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
  rho: number;
}

/**
 * Calculates option price and analytical Greeks.
 * @param S Current underlying price
 * @param K Strike price
 * @param T Time to expiration in years (e.g. 30 days = 30/365)
 * @param r Risk-free interest rate (e.g. 0.05 for 5%)
 * @param sigma Volatility as decimal (e.g. 0.65 for 65% IV)
 * @param type "CALL" | "PUT"
 */
export function blackScholes(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  type: "CALL" | "PUT"
): BSResult {
  if (T <= 0.00001) {
    const intrinsic = type === "CALL" ? Math.max(0, S - K) : Math.max(0, K - S);
    return {
      price: intrinsic,
      delta: type === "CALL" ? (S > K ? 1 : 0) : (S < K ? -1 : 0),
      gamma: 0,
      vega: 0,
      theta: 0,
      rho: 0,
    };
  }

  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;

  const nd1 = normCdf(d1);
  const nd2 = normCdf(d2);
  const npd1 = normPdf(d1);
  const expRT = Math.exp(-r * T);

  let price = 0;
  let delta = 0;
  let rho = 0;
  let theta = 0;

  if (type === "CALL") {
    price = S * nd1 - K * expRT * nd2;
    delta = nd1;
    rho = (K * T * expRT * nd2) / 100; // per 1% change
    theta = (-(S * npd1 * sigma) / (2 * sqrtT) - r * K * expRT * nd2) / 365; // per day
  } else {
    price = K * expRT * normCdf(-d2) - S * normCdf(-d1);
    delta = nd1 - 1;
    rho = (-K * T * expRT * normCdf(-d2)) / 100;
    theta = (-(S * npd1 * sigma) / (2 * sqrtT) + r * K * expRT * normCdf(-d2)) / 365;
  }

  const gamma = npd1 / (S * sigma * sqrtT);
  const vega = (S * sqrtT * npd1) / 100; // 1% change in vol

  return {
    price: Math.max(0, price),
    delta,
    gamma,
    vega,
    theta,
    rho,
  };
}

/**
 * Solve for Implied Volatility given a market option price using Newton-Raphson.
 */
export function impliedVolatility(
  marketPrice: number,
  S: number,
  K: number,
  T: number,
  r: number,
  type: "CALL" | "PUT",
  maxIterations = 50,
  precision = 1e-4
): number {
  let sigma = 0.5; // Initial guess: 50%
  for (let i = 0; i < maxIterations; i++) {
    const res = blackScholes(S, K, T, r, sigma, type);
    const diff = res.price - marketPrice;
    if (Math.abs(diff) < precision) {
      return sigma;
    }
    const vega = res.vega * 100; // unscale from percentage
    if (Math.abs(vega) < 1e-6) break;
    sigma = sigma - diff / vega;
    if (sigma <= 0.001) sigma = 0.001;
    if (sigma > 5.0) sigma = 5.0; // cap at 500%
  }
  return sigma;
}
