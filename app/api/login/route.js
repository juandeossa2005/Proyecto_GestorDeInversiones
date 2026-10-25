import { NextResponse } from 'next/server';
import { token } from '../../../lib/auth';

export async function POST(req) {
  const { password } = await req.json();
  const expected = (process.env.APP_PASSWORD || '').trim();
  if (!expected)
    return NextResponse.json({ error: 'APP_PASSWORD no está configurada en el servidor' }, { status: 500 });
  if ((password || '').trim() !== expected)
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('auth', await token(), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
  return res;
}
