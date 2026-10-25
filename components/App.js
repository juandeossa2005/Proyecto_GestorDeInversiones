'use client';
import { useEffect, useState, useCallback } from 'react';
import { TY, calc, days, ea, today } from '../lib/calc';

const COL = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)'];
const NUM = ['units', 'avg', 'price', 'principal', 'balance', 'invested', 'rate'];
const EMPTY = { type: 'stock', platform: '', name: '', ticker: '', cur: 'USD' };
const pc = (p, c) => (c ? ((p / c) * 100).toFixed(2) + '%' : '-');
const cls = (n) => (n >= 0 ? 'up' : 'dn');

export default function App() {
  const [items, setItems] = useState([]);
  const [st, setSt] = useState({});
  const [disp, setDisp] = useState('COP');
  const [tab, setTab] = useState('res');
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const trm = parseFloat(st.trm) || 4000;

  const load = useCallback(async () => {
    const r = await fetch('/api/holdings');
    if (r.ok) { const j = await r.json(); setItems(j.items); setSt(j.settings); }
  }, []);

  const refresh = useCallback(async () => {
    setBusy(true);
    try {
      const r = await (await fetch('/api/quotes/refresh', { method: 'POST' })).json();
      setMsg(r.finnhub ? `${r.updated}/${r.total} precios actualizados` : 'Falta FINNHUB_API_KEY: solo se actualizó la TRM');
      await load();
    } catch { setMsg('No se pudo actualizar'); }
    setBusy(false);
  }, [load]);

  useEffect(() => {
    load().then(refresh);
    const t = setInterval(refresh, 60000);
    return () => clearInterval(t);
  }, [load, refresh]);

  const cv = (n, cur) => (cur === disp ? n : disp === 'COP' ? n * trm : n / trm);
  const money = (n, cur = disp) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: cur, minimumFractionDigits: cur === 'COP' ? 0 : 2, maximumFractionDigits: cur === 'COP' ? 0 : 2 }).format(n);
  const tot = (list) => list.reduce((a, x) => { const k = calc(x); a.v += cv(k.v, x.cur); a.c += cv(k.c, x.cur); a.d += cv(k.d, x.cur); return a; }, { v: 0, c: 0, d: 0 });

  async function save() {
    const o = { ...form };
    if (!o.name || !o.platform) return alert('Completa nombre y plataforma');
    NUM.forEach((k) => { o[k] = o[k] === '' || o[k] == null ? null : +o[k]; });
    await fetch(o.id ? `/api/holdings/${o.id}` : '/api/holdings', { method: o.id ? 'PUT' : 'POST', body: JSON.stringify(o) });
    setForm(null); load();
  }
  async function del(id) { if (confirm('¿Eliminar esta posición?')) { await fetch(`/api/holdings/${id}`, { method: 'DELETE' }); load(); } }
  async function setPrice(x, v) { await fetch(`/api/holdings/${x.id}`, { method: 'PUT', body: JSON.stringify({ ...x, price: +v }) }); load(); }

  const T = tot(items), P = T.v - T.c;
  const group = (f) => { const m = {}; items.forEach((x) => { const k = f(x); m[k] = (m[k] || 0) + cv(calc(x).v, x.cur); }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };

  function Resumen() {
    const bt = group((x) => TY[x.type]), bp = group((x) => x.platform);
    let off = 0;
    const prox = items.filter((x) => x.type === 'cdt' && x.end_date >= today()).sort((a, b) => (a.end_date < b.end_date ? -1 : 1)).slice(0, 5);
    return (<>
      <div className="g">
        <div className="c"><div className="k">Valor total</div><div className="v">{money(T.v)}</div></div>
        <div className="c"><div className="k">Ganancia / pérdida</div><div className={'v ' + cls(P)}>{money(P)}</div><div className={'k ' + cls(P)}>{pc(P, T.c)}</div></div>
        <div className="c"><div className="k">Rendimiento diario estimado</div><div className="v up">{money(T.d)}</div><div className="k">CDT y ahorros</div></div>
        <div className="c"><div className="k">Posiciones</div><div className="v">{items.length}</div></div>
      </div>
      <div className="g g3">
        <div className="c"><div className="k">Distribución por tipo</div>
          <div className="row">
            <svg width="150" height="150" viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)' }}>
              {bt.map((e, i) => { const s = T.v ? (e[1] / T.v) * 100 : 0; const o = off; off += s;
                return <circle key={e[0]} r="15.9155" cx="21" cy="21" fill="none" stroke={COL[i % 4]} strokeWidth="6" strokeDasharray={`${s} ${100 - s}`} strokeDashoffset={-o} />; })}
            </svg>
            <div className="lg">{bt.map((e, i) => <div key={e[0]}><i style={{ background: COL[i % 4] }} />{e[0]} · {T.v ? ((e[1] / T.v) * 100).toFixed(1) : 0}%</div>)}</div>
          </div></div>
        <div className="c"><div className="k" style={{ marginBottom: 8 }}>Por plataforma</div>
          {bp.map((e) => <div key={e[0]}><div className="between"><span>{e[0]}</span><b>{money(e[1])}</b></div><div className="pb"><b style={{ width: (T.v ? (e[1] / T.v) * 100 : 0) + '%' }} /></div></div>)}</div>
        <div className="c"><div className="k" style={{ marginBottom: 8 }}>Próximos vencimientos de CDT</div>
          {prox.length ? prox.map((x) => <div key={x.id} className="between"><span>{x.platform} · {x.end_date}</span><b>{money(calc(x).v, x.cur)}</b></div>) : <div className="empty">Sin CDT activos</div>}</div>
      </div>
    </>);
  }

  function Lista({ t }) {
    const L = items.filter((x) => x.type === t);
    if (!L.length) return <div className="c empty">Aún no tienes posiciones aquí.</div>;
    const S = tot(L);
    const acts = (x) => <td><button onClick={() => setForm({ ...x })}>✎</button> <button className="x" onClick={() => del(x.id)}>✕</button></td>;
    let head, rows;
    if (t === 'stock' || t === 'etf') {
      head = ['Activo', 'Plataforma', 'Unid.', 'Prom. compra', 'Precio actual', 'Valor', 'G/P', 'G/P %'];
      rows = L.map((x) => { const k = calc(x); return (
        <tr key={x.id}><td><b>{x.ticker}</b> {x.name}</td><td>{x.platform}</td><td>{x.units}</td><td>{x.avg}</td>
          <td><input style={{ width: 100, textAlign: 'right', padding: '4px 6px' }} type="number" step="any" defaultValue={x.price} key={x.price} onBlur={(e) => +e.target.value !== x.price && setPrice(x, e.target.value)} /></td>
          <td>{money(k.v, x.cur)}</td><td className={cls(k.p)}>{money(k.p, x.cur)}</td><td className={cls(k.p)}>{pc(k.p, k.c)}</td>{acts(x)}</tr>); });
    } else if (t === 'cdt') {
      head = ['CDT', 'Plataforma', 'Capital', 'Tasa E.A.', 'Vence', 'Valor hoy', 'Ganancia', 'Al vencimiento'];
      rows = L.map((x) => { const k = calc(x); const fin = x.principal * Math.pow(1 + x.rate / 100, days(x.start_date, x.end_date) / 365); return (
        <tr key={x.id}><td>{x.name}</td><td>{x.platform}</td><td>{money(x.principal, x.cur)}</td><td>{x.rate}%</td><td>{x.end_date}</td>
          <td>{money(k.v, x.cur)}</td><td className="up">{money(k.p, x.cur)}</td><td>{money(fin, x.cur)}</td>{acts(x)}</tr>); });
    } else {
      head = ['Cuenta', 'Plataforma', 'Saldo', 'Tasa E.A.', 'Rend. diario', 'Rend. mensual est.', 'Nota'];
      rows = L.map((x) => { const k = calc(x); return (
        <tr key={x.id}><td>{x.name}</td><td>{x.platform}</td><td>{money(x.balance, x.cur)}</td><td>{x.rate}%</td>
          <td className="up">{money(k.d, x.cur)}</td><td className="up">{money(k.v * (Math.pow(1 + ea(x.rate), 30) - 1), x.cur)}</td><td>{x.note}</td>{acts(x)}</tr>); });
    }
    return (<>
      <div className="g"><div className="c"><div className="k">Valor</div><div className="v">{money(S.v)}</div></div>
        <div className="c"><div className="k">Ganancia / pérdida</div><div className={'v ' + cls(S.v - S.c)}>{money(S.v - S.c)}</div></div></div>
      <div className="c sc"><table><thead><tr>{head.map((h) => <th key={h}>{h}</th>)}<th /></tr></thead><tbody>{rows}</tbody></table></div>
    </>);
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const F = ({ k, label, type = 'text', cls: c = '' }) => <div className={c}><label>{label}</label><input type={type} step="any" value={form[k] ?? ''} onChange={set(k)} /></div>;

  return (
    <div className="w">
      <header>
        <h1>💼 Mis Inversiones</h1>
        <div className="bar">
          <span className="k">TRM {new Intl.NumberFormat('es-CO').format(trm)}{st.refreshed_at && ' · ' + new Date(st.refreshed_at).toLocaleTimeString('es-CO')}</span>
          <select style={{ width: 'auto' }} value={disp} onChange={(e) => setDisp(e.target.value)}><option>COP</option><option>USD</option></select>
          <button onClick={refresh} disabled={busy}>{busy ? 'Actualizando…' : '⟳ Actualizar'}</button>
          <button className="p" onClick={() => setForm({ ...EMPTY, type: TY[tab] ? tab : 'stock' })}>+ Agregar</button>
        </div>
      </header>
      {msg && <p className="k" style={{ marginTop: -6 }}>{msg}</p>}
      <div className="tabs">{[['res', 'Resumen'], ['stock', 'Acciones'], ['etf', 'ETF'], ['cdt', 'CDT'], ['savings', 'Ahorros']].map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
      {tab === 'res' ? <Resumen /> : <Lista t={tab} />}
      {form && (
        <div className="modal" onClick={(e) => e.target === e.currentTarget && setForm(null)}>
          <div className="c">
            <h3 style={{ marginTop: 0 }}>{form.id ? 'Editar' : 'Agregar'} inversión</h3>
            <div className="f">
              <div className="full"><label>Tipo</label><select value={form.type} onChange={set('type')}><option value="stock">Acción</option><option value="etf">ETF</option><option value="cdt">CDT</option><option value="savings">Cuenta de ahorro / cajita</option></select></div>
              <F k="platform" label="Plataforma" />
              <div><label>Moneda</label><select value={form.cur} onChange={set('cur')}><option>USD</option><option>COP</option></select></div>
              <F k="name" label="Nombre" cls="full" />
              {(form.type === 'stock' || form.type === 'etf') && (<>
                <F k="ticker" label="Ticker (ej. NVDA, QQQ)" /><F k="units" label="Unidades" type="number" />
                <F k="avg" label="Precio promedio de compra" type="number" /><F k="price" label="Precio actual (se actualiza solo)" type="number" /></>)}
              {form.type === 'cdt' && (<>
                <F k="principal" label="Capital invertido" type="number" /><F k="rate" label="Tasa E.A. (%)" type="number" />
                <F k="start_date" label="Inicio" type="date" /><F k="end_date" label="Vencimiento" type="date" /></>)}
              {form.type === 'savings' && (<>
                <F k="balance" label="Saldo actual" type="number" /><F k="invested" label="Aportado (opcional)" type="number" />
                <F k="rate" label="Tasa E.A. (%)" type="number" /></>)}
              <F k="note" label="Nota" cls="full" />
            </div>
            <div className="bar" style={{ marginTop: 14, justifyContent: 'flex-end' }}>
              <button onClick={() => setForm(null)}>Cancelar</button><button className="p" onClick={save}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
