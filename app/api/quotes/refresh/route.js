import { NextResponse } from 'next/server';
import { sql, init } from '../../../../lib/db';
import { getQuote, getTRM } from '../../../../lib/quotes';

export const dynamic = 'force-dynamic';

async function run() {
  await init();
  const rows = await sql`SELECT DISTINCT ticker FROM holdings WHERE type IN ('stock','etf') AND ticker IS NOT NULL AND ticker <> ''`;
  const quotes = await Promise.all(rows.map(async (r) => [r.ticker, await getQuote(r.ticker)]));
  let updated = 0;
  for (const [ticker, price] of quotes) {
    if (price) { await sql`UPDATE holdings SET price=${price}, price_updated_at=now() WHERE ticker=${ticker}`; updated++; }
  }
  const trm = await getTRM();
  if (trm) {
    await sql`INSERT INTO settings (key,value) VALUES ('trm',${String(trm.value)}) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`;
    await sql`INSERT INTO settings (key,value) VALUES ('trm_source',${trm.source}) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`;
  }
  await sql`INSERT INTO settings (key,value) VALUES ('refreshed_at',${new Date().toISOString()}) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`;
  return NextResponse.json({ updated, total: rows.length, trm: trm?.value ?? null, finnhub: !!process.env.FINNHUB_API_KEY });
}

export const GET = run;
export const POST = run;
