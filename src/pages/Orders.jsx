import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../auth';
import Navbar from '../components/Navbar';
import BlueSelect from '../components/BlueSelect';

const defaultRows = [
  { buyer: 'H&M', style: 'ST-1001', desc: 'Ladies Polo Shirt', fabric: 'Cotton 100%', qty: 5000, rate: 4.5, date: '2026-09-01', delivery: '2026-10-15', status: 'New' },
  { buyer: 'Next', style: 'ST-1002', desc: 'Mens Cargo Pant', fabric: 'Cotton Twill', qty: 3000, rate: 6.2, date: '2026-09-05', delivery: '2026-10-20', status: 'In Cutting' },
];

function loadMasters() {
  try {
    const raw = localStorage.getItem('fk_masters');
    if (!raw) return { buyers: ['H&M', 'Next'], fabrics: ['Cotton 100%', 'Cotton Twill'] };
    const m = JSON.parse(raw);
    return {
      buyers: m.buyers ? m.buyers.map((x) => x.name) : ['H&M'],
      fabrics: m.fabrics ? m.fabrics.map((x) => x.name) : ['Cotton 100%'],
    };
  } catch {
    return { buyers: ['H&M', 'Next'], fabrics: ['Cotton 100%', 'Cotton Twill'] };
  }
}

function loadRows() {
  try {
    const raw = localStorage.getItem('fk_orders');
    if (!raw) return defaultRows;
    const saved = JSON.parse(raw);
    if (Array.isArray(saved) && saved.length) return saved;
    return defaultRows;
  } catch {
    return defaultRows;
  }
}

export default function Orders() {
  const nav = useNavigate();
  const [session, setSession] = useState(null);
  const [rows, setRows] = useState(loadRows);
  const masters = loadMasters();
  const [buyer, setBuyer] = useState(masters.buyers[0] || 'H&M');
  const [style, setStyle] = useState('');
  const [desc, setDesc] = useState('');
  const [fabric, setFabric] = useState(masters.fabrics[0] || 'Cotton 100%');
  const [qty, setQty] = useState('');
  const [rate, setRate] = useState('');
  const [date, setDate] = useState('');
  const [delivery, setDelivery] = useState('');
  const [status, setStatus] = useState('New');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const s = getSession();
    if (!s || !s.username || !s.role) { logout(); nav('/login'); return; }
    setSession(s);
  }, [nav]);

  if (!session) {
    return <div style={{ color: '#627d98', padding: 40, fontFamily: 'Segoe UI,Arial' }}>Loading… please wait</div>;
  }

  const saveRows = (next) => {
    try { localStorage.setItem('fk_orders', JSON.stringify(next)); } catch (e) { console.error(e); }
    setRows(next);
  };

  const addRow = (e) => {
    e.preventDefault();
    if (!style || !qty) { setMsg('Style No and Quantity are required'); return; }
    const row = { buyer, style, desc, fabric, qty: Number(qty), rate: Number(rate) || 0, date, delivery, status };
    const next = [...rows, row];
    saveRows(next);
    setMsg(`Order ${style} added ✅`);
    setStyle(''); setDesc(''); setQty(''); setRate(''); setDate(''); setDelivery('');
  };

  const delRow = (i) => saveRows(rows.filter((_, x) => x !== i));

  const editStatus = (i, val) => {
    const next = rows.map((r, x) => (x === i ? { ...r, status: val } : r));
    saveRows(next);
  };

  const total = rows.reduce((s, r) => s + (Number(r.qty) || 0) * (Number(r.rate) || 0), 0);
  return (
    <div className="wrap">
      <Navbar session={session} />

      <div className="pagehead">
        <h2>📦 Orders</h2>
      </div>

      <div className="body">
        <form className="frm" onSubmit={addRow}>
          <h3>➕ Add New Order (Excel row)</h3>
          <label>Buyer</label>
          <BlueSelect value={buyer} onChange={(e) => setBuyer(e.target.value)}>
            {masters.buyers.map((b) => <option key={b} value={b}>{b}</option>)}
          </BlueSelect>
          <label>Style No</label>
          <input value={style} onChange={(e) => setStyle(e.target.value)} placeholder="ST-1003" />
          <label>Description</label>
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Mens T-Shirt" />
          <label>Fabric</label>
          <BlueSelect value={fabric} onChange={(e) => setFabric(e.target.value)}>
            {masters.fabrics.map((f) => <option key={f} value={f}>{f}</option>)}
          </BlueSelect>
          <label>Order Qty</label>
          <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="5000" />
          <label>Rate / Unit</label>
          <input type="number" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="4.50" />
          <label>Order Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <label>Delivery Date</label>
          <input type="date" value={delivery} onChange={(e) => setDelivery(e.target.value)} />
          <button className="btn-primary" type="submit">SAVE ORDER</button>
          {msg && <p className="msg ok">{msg}</p>}
        </form>

        <div className="tblbox">
          <div className="tblhead">
            <h3>📄 Orders List <span className="count">{rows.length} rows</span></h3>
            <div className="tsum">Total Value: <b>$ {total.toLocaleString()}</b></div>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>#</th><th>Buyer</th><th>Style No</th><th>Description</th><th>Fabric</th>
                <th>Qty</th><th>Rate</th><th>Amount</th><th>Order Date</th><th>Delivery</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{r.buyer}</td>
                  <td><b>{r.style}</b></td>
                  <td>{r.desc}</td>
                  <td>{r.fabric}</td>
                  <td>{r.qty}</td>
                  <td>{r.rate}</td>
                  <td><b>$ {((Number(r.qty) || 0) * (Number(r.rate) || 0)).toLocaleString()}</b></td>
                  <td>{r.date || '-'}</td>
                  <td>{r.delivery || '-'}</td>
                  <td>
                    <BlueSelect className="status" value={r.status || 'New'} onChange={(e) => editStatus(i, e.target.value)}>
                      <option>New</option><option>In Cutting</option><option>In Stitching</option>
                      <option>In QC</option><option>Packed</option><option>Shipped</option>
                    </BlueSelect>
                  </td>
                  <td><button className="del" onClick={() => delRow(i)}>🗑️</button></td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={12} className="empty">No orders yet — add your first order above ⬆️</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}