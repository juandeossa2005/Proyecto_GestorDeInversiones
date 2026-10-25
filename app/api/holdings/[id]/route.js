import { NextResponse } from 'next/server';
import { sql, init, FIELDS, clean } from '../../../../lib/db';

export async function PUT(req, { params }) {
  await init();
  const { id } = await params;
  const b = await req.json();
  const set = FIELDS.map((k, i) => `${k}=$${i + 1}`).join(',');
  await sql.query(`UPDATE holdings SET ${set} WHERE id=$${FIELDS.length + 1}`, [...clean(b), id]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  await init();
  const { id } = await params;
  await sql`DELETE FROM holdings WHERE id=${id}`;
  return NextResponse.json({ ok: true });
}
