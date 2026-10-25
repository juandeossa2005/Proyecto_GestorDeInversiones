export const TY = { stock: 'Acciones', etf: 'ETF', cdt: 'CDT', savings: 'Ahorros' };
// Fecha local (no UTC) para que el día cambie a medianoche en Colombia
export const today = () => new Date().toLocaleDateString('en-CA');
export const days = (a, b) => Math.max(0, Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5));
export const ea = (r) => Math.pow(1 + r / 100, 1 / 365) - 1;
// Tasa diaria: E.A. (efectiva anual) o NOMINAL (tasa/365, como Dale)
export const dailyRate = (x) => (x.rate_type === 'NOMINAL' ? x.rate / 100 / 365 : ea(x.rate));

// v = valor hoy, c = costo/aportado, p = ganancia, d = rendimiento de un día (moneda nativa)
export function calc(x) {
  let v = 0, c = 0, d = 0;
  if (x.type === 'stock' || x.type === 'etf') { v = x.units * x.price; c = x.units * x.avg; }
  else if (x.type === 'cdt') {
    const t = Math.min(days(x.start_date, today()), days(x.start_date, x.end_date));
    c = x.principal; v = c * Math.pow(1 + x.rate / 100, t / 365); d = v * ea(x.rate);
  } else {
    const t = x.balance_date ? days(x.balance_date, today()) : 0;
    v = x.balance * Math.pow(1 + dailyRate(x), t);
    c = x.invested || x.balance; d = v * dailyRate(x);
  }
  return { v, c, p: v - c, d };
}
