import { NextResponse } from 'next/server';
import { sql, init, FIELDS, clean } from '../../../lib/db';
import { SEED } from '../../../lib/seed';

export const dynamic = 'force-dynamic';

// Carga tus inversiones iniciales solo si la tabla está vacía. Abre /api/seed una vez.
export async function GET() {
  await init();
  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM holdings`;
  if (n > 0) return NextResponse.json({ skipped: true, existing: n });
  const ph = FIELDS.map((_, i) => '$' + (i + 1)).join(',');
  for (const x of SEED) await sql.query(`INSERT INTO holdings (${FIELDS.join(',')}) VALUES (${ph})`, clean(x));
  return NextResponse.json({ inserted: SEED.length });
}
