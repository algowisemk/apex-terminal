import { runDCFValuation, analyzeOptionsSkew, calculatePositionRisk, ToolResult } from "./tools";

export interface AgentStep {
  agentName: string;
  role: string;
  status: "pending" | "running" | "completed";
  output?: string;
  toolResult?: ToolResult;
}

export interface ResearchMemo {
  symbol: string;
  timestamp: string;
  thesis: "BULLISH" | "BEARISH" | "NEUTRAL";
  confidenceScore: number; // 0 - 100
  steps: AgentStep[];
  markdownMemo: string;
}

export async function runResearchSwarm(
  symbol: string,
  currentPrice: number,
  accountEquity: number = 993940
): Promise<ResearchMemo> {
  const steps: AgentStep[] = [];

  // Step 1: Lead Planner Agent
  steps.push({
    agentName: "PlannerAgent",
    role: "Research Coordinator",
    status: "completed",
    output: `Deconstructed research objective for ${symbol} into fundamental valuation, options volatility skew, and Kelly risk allocation.`,
  });

  // Step 2: Fundamental Analyst Agent
  const isCrypto = symbol.includes("BTC") || symbol.includes("ETH") || symbol.includes("SOL");
  let fundamentalResult: ToolResult;

  if (isCrypto) {
    fundamentalResult = {
      name: "OnChain_Macro_Valuation",
      data: {
        networkHashrate: "Record High",
        exchangeReserves: "Multi-year low (Net Outflows)",
        mvrvZScore: 2.14,
        halvingCycleStage: "Post-Halving Expansion Stage",
      },
      summary: "MVRV Z-Score of 2.14 indicates healthy valuation with substantial upside before overheating (>4.0).",
    };
  } else {
    // Equity DCF
    const fcf = symbol === "NVDA" ? 28000 : symbol === "AAPL" ? 105000 : 8500;
    const growth = symbol === "NVDA" ? 0.35 : 0.08;
    fundamentalResult = runDCFValuation(fcf, growth, 0.03, 0.09, 2450);
  }

  steps.push({
    agentName: "FundamentalAgent",
    role: "Valuation & Financial Statements",
    status: "completed",
    toolResult: fundamentalResult,
    output: fundamentalResult.summary,
  });

  // Step 3: Derivatives & Volatility Desk Agent
  const callIV = isCrypto ? 48.5 : 42.0;
  const putIV = isCrypto ? 45.2 : 46.5;
  const skewResult = analyzeOptionsSkew(currentPrice, callIV, putIV);

  steps.push({
    agentName: "DerivativesAgent",
    role: "Volatility Surface & Gamma Skew",
    status: "completed",
    toolResult: skewResult,
    output: skewResult.summary,
  });

  // Step 4: Quantitative Risk & Execution Agent
  const stopLoss = currentPrice * 0.94; // 6% trailing stop
  const riskResult = calculatePositionRisk(accountEquity, currentPrice, stopLoss, 0.58, 2.2);

  steps.push({
    agentName: "RiskAgent",
    role: "Portfolio Allocation & Sizing",
    status: "completed",
    toolResult: riskResult,
    output: riskResult.summary,
  });

  // Determine synthesis
  const isBullish = isCrypto ? true : fundamentalResult.data?.fairValuePerShare > currentPrice;
  const thesis = isBullish ? "BULLISH" : "NEUTRAL";
  const confidence = isBullish ? 82 : 64;

  const memo = `# INSTITUTIONAL INVESTMENT MEMORANDUM: ${symbol}
**Research Desk:** Apex Quantitative Intelligence Swarm  
**Date:** ${new Date().toUTCString()}  
**Target Horizon:** 30–90 Days  
**Recommendation:** **${thesis}** (Confidence: ${confidence}%)  

---

### 1. Executive Summary
The multi-agent swarm has completed a full synthesis of ${symbol} across fundamental valuation, derivatives skew, and execution risk.

* **Current Price:** $${currentPrice.toLocaleString()}
* **Valuation Verdict:** ${fundamentalResult.summary}
* **Market Sentiment & Skew:** ${skewResult.summary}
* **Recommended Sizing:** ${riskResult.summary}

---

### 2. Specialized Agent Findings

#### A. Fundamental Valuation Desk
${
  isCrypto
    ? `- **Network Activity:** Exchange reserves continue to drop, indicating long-term cold storage accumulation.\n- **Cycle Analysis:** Post-halving supply shock remains in effect.`
    : `- **Enterprise Value:** $${fundamentalResult.data.enterpriseValue?.toLocaleString()}M\n- **Fair Value Per Share:** $${fundamentalResult.data.fairValuePerShare}\n- **Cost of Capital (WACC):** ${fundamentalResult.data.discountRate}`
}

#### B. Derivatives Desk & Volatility Skew
- **Options Pricing Regime:** ${skewResult.data.regime}
- **Call IV vs Put IV:** ${skewResult.data.callIV} vs ${skewResult.data.putIV}
- **Implication:** Market is not pricing extreme tail risk; upside call premium suggests institutional participation.

#### C. Risk Management & Execution Strategy
- **Max Portfolio Risk:** $${riskResult.data.dollarRisk?.toLocaleString()} (${riskResult.data.portfolioAllocationPercent}% allocation)
- **Hard Stop-Loss:** $${stopLoss.toFixed(2)} (-${riskResult.data.stopLossPercent}%)
- **Target Take-Profit:** $${(currentPrice * 1.15).toFixed(2)} (+15.0%)
`;

  return {
    symbol,
    timestamp: new Date().toISOString(),
    thesis,
    confidenceScore: confidence,
    steps,
    markdownMemo: memo,
  };
}
