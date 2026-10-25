'use client';
import { useState } from 'react';

export default function Login() {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  async function go(e) {
    e.preventDefault();
    const r = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ password: pw }) });
    if (r.ok) location.href = '/'; else setErr('Contraseña incorrecta');
  }
  return (
    <div className="w" style={{ maxWidth: 380, paddingTop: 80 }}>
      <form className="c" onSubmit={go}>
        <h2 style={{ marginTop: 0 }}>💼 Mis Inversiones</h2>
        <input type="password" placeholder="Contraseña" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
        {err && <p className="dn">{err}</p>}
        <button className="p" style={{ marginTop: 12, width: '100%' }}>Entrar</button>
      </form>
    </div>
  );
}
