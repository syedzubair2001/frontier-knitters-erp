import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSession, logout } from '../auth';
import Navbar from '../components/Navbar';
import { MASTER_STEPS } from '../masterConfig';
import BlueSelect from '../components/BlueSelect';

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
  company: [
    { name: 'Frontier Knitters Pvt Ltd', address: 'Port Qasim, Karachi', contact: 'info@frontierknitters.com' },
  ],
  party: [
    { name: 'H&M', type: 'Buyer', contact: 'hm@buyer.com' },
    { name: 'Karachi Dyeing Works', type: 'Job Work', contact: 'kdw@dyeing.pk' },
  ],
  employee: [
    { name: 'Ahmed Raza', department: 'Stitching', designation: 'Line Supervisor' },
    { name: 'Sana Malik', department: 'Merchandising', designation: 'Merchandiser' },
  ],
  territory: [
    { name: 'Karachi Central', region: 'Sindh', rep: 'AR-01' },
  ],
  statutory: [
    { name: 'GST Registration', code: 'GST-24-00123', type: 'GST' },
    { name: 'PF Account', code: 'PKPF-88912', type: 'PF' },
  ],
  product: [
    { name: 'Ladies Polo Shirt', category: 'T-Shirt', desc: 'Pima cotton polo' },
  ],
  item: [
    { name: 'Zipper RW-08', category: 'Trims', unit: 'Pcs' },
    { name: 'Main Label', category: 'Trims', unit: 'Pcs' },
  ],
  workflow: [
    { name: 'Order Entry', department: 'Merchandising', sequence: '01' },
    { name: 'Fabric Cutting', department: 'Cutting', sequence: '03' },
  ],
  commercials: [
    { name: 'Buying Commission', value: '5%', type: 'Commission' },
  ],
  quality: [
    { name: 'Stitch Density', standard: '10-12 SPI', method: 'Visual / Gauge' },
  ],
  orderElements: [
    { name: 'Size Ratio', type: 'Size', unit: 'S-M-L-XL' },
  ],
  warehouse: [
    { name: 'Main Garment Store', location: 'Unit 1, 2nd Floor', incharge: 'Store Team' },
  ],
};

function loadMaster() {
  try {
    const raw = localStorage.getItem('fk_masters');
    if (!raw) return JSON.parse(JSON.stringify(seed));
    const saved = JSON.parse(raw);
    if (saved && typeof saved === 'object') {
      // Merge with seed so any NEW tab missing from old saved data still gets defaults
      return { ...JSON.parse(JSON.stringify(seed)), ...saved };
    }
    return JSON.parse(JSON.stringify(seed));
  } catch {
    return JSON.parse(JSON.stringify(seed));
  }
}

export default function Masters() {
  const nav = useNavigate();
  const [session, setSession] = useState(null);
  const { sub } = useParams();
  const tab = MASTER_STEPS[sub] ? sub : 'buyers';
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
    const st = steps[tab];
    const obj = {};
    st.fields.forEach((f, i) => { obj[f] = [a, b, c][i]; });
    if (!a) { setMsg(`Please fill the required field: ${st.labels[0]}`); return; }
    save({ ...data, [tab]: [...data[tab], obj] });
    setMsg('Saved ✅');
    setA(''); setB(''); setC('');
  };

  const del = (kind, i) => save({ ...data, [kind]: data[kind].filter((_, x) => x !== i) });

  const steps = MASTER_STEPS;
  const st = steps[tab];
  const vals = [a, b, c];
return (
    <div className="wrap">
      <Navbar session={session} />

      <div className="pagehead">
        <h2>{st.icon} Masters ▸ {st.plural} <span className="count">{data[tab].length} rows</span></h2>
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
                  <BlueSelect value={vals[i]} onChange={(e) => setter(e.target.value)}>
                    {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                  </BlueSelect>
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
            <h3>📄 {(st.plural || st.title + 's')} List <span className="count">{data[tab].length} rows</span></h3>
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
              {!data[tab].length && <tr><td colSpan={6} className="empty">No {(st.plural || st.title + 's')} yet — add above ⬆️</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}