const s = (type, platform, name, ticker, units, avg, price) => ({ type, platform, name, ticker, cur: 'USD', units, avg, price });
const addYear = (d) => { const x = new Date(d + 'T00:00:00'); x.setFullYear(x.getFullYear() + 1); return x.toISOString().slice(0, 10); };

export const SEED = [
  s('stock','XTB','Alphabet','GOOGL',0.6045,266.45,320.23), s('stock','XTB','Nvidia','NVDA',1.8406,196.07,210.99),
  s('stock','XTB','Apple','AAPL',0.0836,298.76,347.60), s('stock','XTB','Amazon','AMZN',0.1298,228.23,247.94),
  s('stock','XTB','ASGN','ASGN',1.2326,32.54,43.37), s('stock','XTB','Axcelis Technologies','ACLS',0.2972,134.57,105.79),
  s('stock','XTB','Onto Innovation','ONTO',0.1287,310.78,197.39), s('stock','XTB','Skyworks','SWKS',0.47,85.09,83.18),
  s('etf','eToro','VanEck Semiconductor','SMH',0.21853,415.28038,527.20), s('etf','eToro','Vanguard Information Technology','VGT',1.71342,102.13489,119.17),
  s('etf','eToro','Invesco QQQ','QQQ',0.18745,640.17232,704.40), s('etf','eToro','SPDR S&P 500 Growth','SPYG',2.87854,107.70723,118.16),
  s('etf','eToro','Vanguard FTSE Developed Markets','VEA',3.07365,65.06918,69.05),
  ...['2026-08-15','2026-08-28','2026-09-15','2026-09-29','2026-10-14'].map((d) => ({
    type: 'cdt', platform: 'Bold', name: 'CDT 12 meses', cur: 'COP', principal: 125000, rate: 12.5, start_date: d, end_date: addYear(d) })),
  ...[39.43135,37.73631,40.49006,39.44951,40.38001].map((b, i) => ({
    type: 'savings', platform: 'Plenti', name: `Cajita ${i + 1} (3 meses)`, cur: 'USD', balance: b, rate: 8, note: 'Tasa a término fijo' })),
  { type: 'savings', platform: 'Dale', name: 'Cuenta de ahorro', cur: 'COP', balance: 3026743.90, invested: 2950841.52, rate: 10, note: 'Rendimientos diarios' },
];
