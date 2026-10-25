// Precio de acciones/ETF (Finnhub, plan gratuito: 60 llamadas/min)
export async function getQuote(symbol) {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`, { cache: 'no-store' });
    const j = await r.json();
    return j.c > 0 ? j.c : null;
  } catch { return null; }
}

// TRM oficial (datos.gov.co) con respaldo a tasa de mercado
export async function getTRM() {
  try {
    const r = await fetch('https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=1&$order=vigenciadesde%20DESC', { cache: 'no-store' });
    const j = await r.json();
    const v = parseFloat(j?.[0]?.valor);
    if (v > 0) return { value: v, source: 'TRM oficial' };
  } catch {}
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD', { cache: 'no-store' });
    const j = await r.json();
    if (j?.rates?.COP) return { value: j.rates.COP, source: 'open.er-api.com' };
  } catch {}
  return null;
}
