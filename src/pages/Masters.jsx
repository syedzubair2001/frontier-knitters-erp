import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../auth';

const seed = {
  buyers: [
    { name: 'H&M', country: 'Sweden', contact: 'hm@buyer.com' },
    { name: 'Next', country: 'UK', contact: 'next@buyer.com' },
    { name: 'Zara', country: 'Spain', contact: 'zara@buyer.com' },
    { name: 'Target', country: 'USA', contact: 'target@buyer.com' },
  ],
  fabrics: [
    { name: 'Cotton 100%', type: 'Knitted', unit: 'Kg' },
    { name: 'Polyester', type: 'Knitted', unit: 'Kg' },
    { name: 'Cotton Twill', type: 'Woven', unit: 'Meter' },
    { name: 'Cotton-Lycra', type: 'Knitted', unit: 'Kg' },
  ],
  styles: [
    { code: 'ST-1001', category: 'T-Shirt', desc: 'Ladies Polo Shirt' },
    { code: 'ST-1002', category: 'Bottom', desc: 'Mens Cargo Pant' },
  ],
};

function loadMaster() {
  try {
    const raw = localStorage.getItem('fk_masters');
    if (!raw) return JSON.parse(JSON.stringify(seed));
    const saved = JSON.parse(raw);
    if (saved && saved.buyers && saved.fabrics && saved.styles) return saved;
    return JSON.parse(JSON.stringify(seed));
  } catch {
    return JSON.parse(JSON.stringify(seed));
  }
}

export default function Masters() {
  const nav = useNavigate();
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState('buyers');
  const [data, setData] = useState(loadMaster);
  const [a, setA] = useState(''); // field 1
  const [b, setB] = useState(''); // field 2
  const [c, setC] = useState(''); // field 3
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const s = getSession();
    if (!s || !s.username || !s.role) { logout(); nav('/login'); return; }
    setSession(s);
  }, [nav]);

  if (!session) {
    return <div style={{ color: '#627d98', padding: 40, fontFamily: 'Segoe UI,Arial' }}>Loading… please wait</div>;
  }

  const save = (next) => {
    try { localStorage.setItem('fk_masters', JSON.stringify(next)); } catch (e) { console.error(e); }
    setData(next);
  };

  const add = (e) => {
    e.preventDefault();
    const key = tab;
    const obj = key === 'buyers' ? { name: a, country: b, contact: c }
      : key === 'fabrics' ? { name: a, type: b, unit: c }
      : { code: a, category: b, desc: c };
    if (!a) { setMsg('Please fill the required field'); return; }
    save({ ...data, [key]: [...data[key], obj] });
    setMsg('Saved ✅');
    setA(''); setB(''); setC('');
  };

  const del = (kind, i) => save({ ...data, [kind]: data[kind].filter((_, x) => x !== i) });

  const steps = {
    buyers: { icon: '🏢', title: 'Buyer', labels: ['Buyer Name *', 'Country', 'Contact / Email'], place: ['Buyer name', 'Country', 'Email'], head: ['#', 'Buyer Name', 'Country', 'Contact / Email'], fields: ['name', 'country', 'contact'] },
    fabrics: { icon: '🧶', title: 'Fabric', labels: ['Fabric Name *', 'Type', 'Unit'], place: ['Fabric name'], head: ['#', 'Fabric Name', 'Type', 'Unit'], fields: ['name', 'type', 'unit'], opts: [null, ['Knitted', 'Woven'], ['Kg', 'Meter', 'Yard']] },
    styles: { icon: '👕', title: 'Style', labels: ['Style Code *', 'Category', 'Description'], place: ['ST-1003'], head: ['#', 'Style Code', 'Category', 'Description'], fields: ['code', 'category', 'desc'], opts: [null, ['T-Shirt', 'Polo', 'Shirt', 'Bottom', 'Hoodie', 'Jacket'], null] },
  };
  const st = steps[tab];
  const vals = [a, b, c];
return (
    <div className="wrap">
      <header className="top">
        <div className="top-left">
          <h1>🧵 Frontier Knitters Pvt Ltd</h1>
          <h2>🗂️ Module 1: Masters</h2>
        </div>
        <div className="userbox">
          <div className="avatar">{session.username.charAt(0).toUpperCase()}</div>
          <span className="badge role">{session.username} · {session.role}</span>
          <button className="btn-outline" onClick={() => nav('/home')}>📋 Modules</button>
          <button className="btn-outline" onClick={() => { logout(); nav('/login'); }}>Logout</button>
        </div>
      </header>

      <div className="tabs">
        {Object.keys(steps).map((k) => (
          <button key={k} className={tab === k ? 'tab on' : 'tab'} onClick={() => { setTab(k); setA(''); setB(''); setC(''); }}>
            {steps[k].icon} {steps[k].title}s
          </button>
        ))}
      </div>

      <div className="body">
        <form className="frm" onSubmit={add}>
          <h3>➕ Add {st.title}</h3>
          {['a', 'b', 'c'].map((f, i) => {
            const setter = f === 'a' ? setA : f === 'b' ? setB : setC;
            const opts = (st.opts || [])[i];
            return (
              <div key={f}>
                <label>{st.labels[i]}</label>
                {opts ? (
                  <select value={vals[i]} onChange={(e) => setter(e.target.value)}>
                    {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input value={vals[i]} onChange={(e) => setter(e.target.value)} placeholder={st.place[i]} />
                )}
              </div>
            );
          })}
          <button className="btn-primary" type="submit">SAVE {st.title.toUpperCase()}</button>
          {msg && <p className="msg ok">{msg}</p>}
        </form>

        <div className="tblbox">
          <div className="tblhead">
            <h3>📄 {st.title}s List <span className="count">{data[tab].length} rows</span></h3>
          </div>
          <table className="tbl">
            <thead>
              <tr>{st.head.map((h) => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {data[tab].map((row, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  {st.fields.map((f) => <td key={f}>{f === 'code' ? <b>{row[f]}</b> : row[f]}</td>)}
                  <td><button className="del" onClick={() => del(tab, i)}>🗑️</button></td>
                </tr>
              ))}
              {!data[tab].length && <tr><td colSpan={6} className="empty">No {st.title}s yet — add above ⬆️</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}