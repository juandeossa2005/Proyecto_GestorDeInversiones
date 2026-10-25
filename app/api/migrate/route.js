import { NextResponse } from 'next/server';
import { sql, init } from '../../../lib/db';

export const dynamic = 'force-dynamic';

// Migración de una sola vez: Plenti pasa de "ahorro" a CDT en USD y Dale acumula por día.
export async function GET() {
  try {
    await init();
    const out = {};
    const pl = await sql`SELECT id FROM holdings WHERE platform='Plenti' AND type='savings' ORDER BY id`;
    const P = [[39.34, '2026-10-14', '2027-01-14'], [37.53, '2026-09-29', '2026-12-29'], [40.15, '2026-09-15', '2026-12-15'], [38.97, '2026-08-28', '2026-11-28'], [39.78, '2026-08-15', '2026-11-15']];
    if (pl.length === 5) {
      for (let i = 0; i < 5; i++) {
        const [p, a, b] = P[i];
        await sql`UPDATE holdings SET type='cdt', name=${'CDT 3 meses (' + (i + 1) + ')'}, principal=${p}, rate=8, start_date=${a}, end_date=${b}, balance=NULL, invested=NULL, note='Cajita a término fijo' WHERE id=${pl[i].id}`;
      }
      out.plenti = 'convertidas a CDT';
    } else out.plenti = `omitido (${pl.length} cajitas como ahorro)`;
    const d = await sql`UPDATE holdings SET balance_date='2026-10-25', rate_type='NOMINAL' WHERE platform='Dale' AND type='savings' AND balance_date IS NULL RETURNING id`;
    out.dale = d.length ? 'acumulación diaria activada' : 'omitido';
    return NextResponse.json(out);
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
