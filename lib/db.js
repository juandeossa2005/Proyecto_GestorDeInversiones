import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL);

export const FIELDS = ['type','platform','name','ticker','cur','units','avg','price','principal','rate','start_date','end_date','balance','invested','note'];

let ready;
export function init() {
  ready ||= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS holdings (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL, platform TEXT NOT NULL, name TEXT NOT NULL,
      ticker TEXT, cur TEXT NOT NULL DEFAULT 'USD',
      units DOUBLE PRECISION, avg DOUBLE PRECISION, price DOUBLE PRECISION,
      principal DOUBLE PRECISION, rate DOUBLE PRECISION,
      start_date TEXT, end_date TEXT,
      balance DOUBLE PRECISION, invested DOUBLE PRECISION, note TEXT,
      price_updated_at TIMESTAMPTZ
    )`;
    await sql`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`;
  })();
  return ready;
}

export const clean = (b) => FIELDS.map((k) => (b[k] === '' || b[k] === undefined ? null : b[k]));
