import { NextResponse } from 'next/server';
import { token } from '../../../lib/auth';

export async function POST(req) {
  const { password } = await req.json();
  if (!process.env.APP_PASSWORD || password !== process.env.APP_PASSWORD)
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('auth', await token(), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
  return res;
}
