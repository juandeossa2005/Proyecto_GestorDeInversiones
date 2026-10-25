import './globals.css';

export const metadata = { title: 'Mis Inversiones', description: 'Portafolio personal: acciones, ETF, CDT y ahorros' };

export default function RootLayout({ children }) {
  return (<html lang="es"><body>{children}</body></html>);
}
