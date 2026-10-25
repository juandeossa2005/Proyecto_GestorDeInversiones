import { NextResponse } from 'next/server';
import { token } from './lib/auth';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (pathname === '/login' || pathname === '/api/login') return NextResponse.next();

  const cron = process.env.CRON_SECRET;
  if (cron && req.headers.get('authorization') === `Bearer ${cron}`) return NextResponse.next();

  if (req.cookies.get('auth')?.value === (await token())) return NextResponse.next();

  if (pathname.startsWith('/api')) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.redirect(new URL('/login', req.url));
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
