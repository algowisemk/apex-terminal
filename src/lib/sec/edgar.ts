/**
 * Official U.S. SEC EDGAR API Client (100% Free, Direct Government Data)
 * Fetches audited 10-K, 10-Q, 8-K filings and US-GAAP financial facts.
 */

const SEC_USER_AGENT = "ApexTerminal research@apexterminal.io";

interface CIKMapping {
  cik_str: number;
  ticker: string;
  title: string;
}

let tickerCache: Record<string, string> = {
  NVDA: "0001045810",
  AAPL: "0000320193",
  MSFT: "0000789019",
  TSLA: "0001318605",
  AMZN: "0001018724",
  GOOGL: "0001652044",
  SPY: "0000884394",
};

export async function getCIK(ticker: string): Promise<string | null> {
  const upper = ticker.toUpperCase();
  if (tickerCache[upper]) return tickerCache[upper];

  try {
    const res = await fetch("https://www.sec.gov/files/company_tickers.json", {
      headers: { "User-Agent": SEC_USER_AGENT },
      next: { revalidate: 86400 }, // Cache 24 hours
    });
    if (!res.ok) return null;
    const data = await res.json();
    const list: CIKMapping[] = Object.values(data);
    const match = list.find((item) => item.ticker.toUpperCase() === upper);
    if (!match) return null;

    const cik10 = match.cik_str.toString().padStart(10, "0");
    tickerCache[upper] = cik10;
    return cik10;
  } catch (err) {
    console.error("SEC CIK resolution error:", err);
    return null;
  }
}

export interface SecFiling {
  form: string;
  filingDate: string;
  reportDate: string;
  accessionNumber: string;
  primaryDocument: string;
  description: string;
  secUrl: string;
}

export async function getRecentFilings(ticker: string): Promise<SecFiling[]> {
  const cik = await getCIK(ticker);
  if (!cik) return [];

  try {
    const res = await fetch(`https://data.sec.gov/submissions/CIK${cik}.json`, {
      headers: { "User-Agent": SEC_USER_AGENT },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const recent = data.filings?.recent;
    if (!recent || !recent.form) return [];

    const filings: SecFiling[] = [];
    const count = Math.min(recent.form.length, 25);

    for (let i = 0; i < count; i++) {
      const form = recent.form[i];
      // Filter to major investment reports: 10-K, 10-Q, 8-K, Form 4
      if (["10-K", "10-Q", "8-K", "4"].includes(form)) {
        const accession = recent.accessionNumber[i];
        const rawAccession = accession.replace(/-/g, "");
        const doc = recent.primaryDocument[i];
        const secUrl = `https://www.sec.gov/Archives/edgar/data/${parseInt(cik, 10)}/${rawAccession}/${doc}`;

        filings.push({
          form,
          filingDate: recent.filingDate[i],
          reportDate: recent.reportDate[i] || recent.filingDate[i],
          accessionNumber: accession,
          primaryDocument: doc,
          description: recent.primaryDocDescription[i] || `${form} Filing`,
          secUrl,
        });
      }
    }

    return filings;
  } catch (err) {
    console.error("SEC filings error:", err);
    return [];
  }
}

export interface AuditedFinancialMetric {
  label: string;
  value: number;
  unit: string;
  form: string;
  filedDate: string;
  periodEnd: string;
}

export async function getAuditedFinancials(ticker: string) {
  const cik = await getCIK(ticker);
  if (!cik) return null;

  try {
    const res = await fetch(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`, {
      headers: { "User-Agent": SEC_USER_AGENT },
      next: { revalidate: 7200 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const gaap = json.facts?.["us-gaap"];
    if (!gaap) return null;

    const extractLatest = (conceptNames: string[], label: string): AuditedFinancialMetric | null => {
      for (const name of conceptNames) {
        const concept = gaap[name];
        if (concept && concept.units?.USD) {
          const entries = concept.units.USD;
          // Filter to 10-K / 10-Q forms
          const valid = entries.filter((e: any) => e.form === "10-K" || e.form === "10-Q");
          if (valid.length > 0) {
            const latest = valid[valid.length - 1];
            return {
              label,
              value: latest.val,
              unit: "USD",
              form: latest.form,
              filedDate: latest.filed,
              periodEnd: latest.end,
            };
          }
        }
      }
      return null;
    };

    return {
      entityName: json.entityName,
      cik,
      metrics: {
        revenue: extractLatest(
          ["RevenueFromContractWithCustomerExcludingAssessedTax", "Revenues", "SalesRevenueNet"],
          "Total Revenue"
        ),
        netIncome: extractLatest(["NetIncomeLoss", "ProfitLoss"], "Net Income"),
        grossProfit: extractLatest(["GrossProfit"], "Gross Profit"),
        cashAndEquivalents: extractLatest(
          ["CashAndCashEquivalentsAtCarryingValue", "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents"],
          "Cash & Equivalents"
        ),
        totalAssets: extractLatest(["Assets"], "Total Assets"),
        longTermDebt: extractLatest(["LongTermDebtNoncurrent", "LongTermDebt"], "Long-Term Debt"),
      },
    };
  } catch (err) {
    console.error("SEC facts error:", err);
    return null;
  }
}
