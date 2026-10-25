import { NextResponse } from 'next/server';
import { sql, init, FIELDS, clean } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  await init();
  const items = await sql`SELECT * FROM holdings ORDER BY type, platform, id`;
  const st = await sql`SELECT key, value FROM settings`;
  const settings = Object.fromEntries(st.map((r) => [r.key, r.value]));
  return NextResponse.json({ items, settings });
}

export async function POST(req) {
  await init();
  const b = await req.json();
  const ph = FIELDS.map((_, i) => '$' + (i + 1)).join(',');
  const r = await sql.query(`INSERT INTO holdings (${FIELDS.join(',')}) VALUES (${ph}) RETURNING id`, clean(b));
  return NextResponse.json({ id: r[0].id });
}
