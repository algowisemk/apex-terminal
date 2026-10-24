import { NextResponse } from "next/server";
import { getRecentFilings, getAuditedFinancials, getCIK } from "@/lib/sec/edgar";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker") || "NVDA";
  const action = searchParams.get("action") || "overview";

  try {
    const cik = await getCIK(ticker);

    if (action === "filings") {
      const filings = await getRecentFilings(ticker);
      return NextResponse.json({ ticker, cik, filings });
    }

    if (action === "facts") {
      const financials = await getAuditedFinancials(ticker);
      return NextResponse.json({ ticker, cik, financials });
    }

    // Default overview: both filings and audited financial line items
    const [filings, financials] = await Promise.all([
      getRecentFilings(ticker),
      getAuditedFinancials(ticker),
    ]);

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      cik,
      financials,
      filings,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("SEC API route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
