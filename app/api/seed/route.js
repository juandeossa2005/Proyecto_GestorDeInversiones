import { NextResponse } from 'next/server';
import { sql, init, FIELDS, clean } from '../../../lib/db';
import { SEED } from '../../../lib/seed';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Carga tus inversiones iniciales solo si la tabla está vacía. Abre /api/seed una vez.
export async function GET() {
  try {
    await init();
    const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM holdings`;
    if (n > 0) return NextResponse.json({ skipped: true, existing: n });

    const rows = SEED.map(clean);
    const m = FIELDS.length;
    const placeholders = rows.map((_, r) => '(' + FIELDS.map((_, c) => '$' + (r * m + c + 1)).join(',') + ')').join(',');
    await sql.query(`INSERT INTO holdings (${FIELDS.join(',')}) VALUES ${placeholders}`, rows.flat());
    return NextResponse.json({ inserted: rows.length });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e), hint: 'Copia este mensaje y envíalo' }, { status: 500 });
  }
}
