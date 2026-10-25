# Mis Inversiones

Next.js 15 + Postgres (Neon) para llevar acciones, ETF, CDT y cuentas de ahorro.

- **Precios de acciones y ETF:** Finnhub, se refrescan al abrir la app y cada 60 s mientras está abierta.
- **TRM:** datos.gov.co (oficial), con respaldo a open.er-api.com.
- **Rendimientos de CDT y ahorros:** calculados por tasa E.A. (diario y acumulado).
- **Acceso:** protegido con una contraseña (`APP_PASSWORD`).

## Local

```bash
npm install
cp .env.example .env.local   # completa las variables
npm run dev
```
Abre http://localhost:3000, entra con tu contraseña y visita `/api/seed` una sola vez para cargar tus posiciones iniciales.

## Deploy en Vercel

1. Sube el proyecto a GitHub e impórtalo en Vercel.
2. **Storage → Neon (Postgres)**: conéctalo al proyecto; Vercel agrega `DATABASE_URL`. Las tablas se crean solas.
3. Crea una clave gratuita en https://finnhub.io y agrégala como `FINNHUB_API_KEY`.
4. Define `APP_PASSWORD` y `CRON_SECRET` en Environment Variables.
5. Deploy, entra, y abre `/api/seed` una vez.

El cron de `vercel.json` actualiza precios de lunes a viernes a las 22:00 UTC (plan Hobby permite 1 vez al día).

## Notas
- Los tickers deben ser los de EE. UU. (NVDA, QQQ, SMH...). Edita el ticker de cada posición si difiere.
- Los precios de Finnhub plan gratis son del último trade/cierre de EE. UU.; fuera de horario muestran el cierre.
- Plenti: las cajitas se modelan como ahorro con tasa fija; el saldo se edita manualmente.
