export const TY = { stock: 'Acciones', etf: 'ETF', cdt: 'CDT', savings: 'Ahorros' };
export const today = () => new Date().toISOString().slice(0, 10);
export const days = (a, b) => Math.max(0, (new Date(b) - new Date(a)) / 864e5);
export const ea = (r) => Math.pow(1 + r / 100, 1 / 365) - 1;

// v = valor actual, c = costo, p = ganancia/pérdida, d = rendimiento diario (moneda nativa)
export function calc(x) {
  let v = 0, c = 0, d = 0;
  if (x.type === 'stock' || x.type === 'etf') { v = x.units * x.price; c = x.units * x.avg; }
  else if (x.type === 'cdt') {
    const t = Math.min(days(x.start_date, today()), days(x.start_date, x.end_date));
    c = x.principal; v = c * Math.pow(1 + x.rate / 100, t / 365); d = v * ea(x.rate);
  } else { v = x.balance; c = x.invested || x.balance; d = v * ea(x.rate); }
  return { v, c, p: v - c, d };
}
