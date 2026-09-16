// Customer LIST screen — MASTER > PARTY > CUSTOMER (grid view)
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../auth';
import Navbar from '../components/Navbar';
import { listCustomers, deleteCustomer } from '../customerService';

const PAGE_SIZE = 12;

const COLUMNS = [
  { key: 'category', label: 'Category' },
  { key: 'name', label: 'Name' },
  { key: 'aliasName', label: 'Alias Name' },
  { key: 'taxCategory', label: 'Tax Category' },
  { key: 'commissionPct', label: 'Comm %' },
  { key: 'payTerm', label: 'PayTerm' },
  { key: 'currency', label: 'Currency' },
  { key: 'city', label: 'City' },
  { key: 'phone', label: 'Phone' },
];

function cell(row, key) {
  if (key === 'city') return row.addresses && row.addresses[0] ? row.addresses[0].city : '-';
  if (key === 'phone') return row.addresses && row.addresses[0] ? row.addresses[0].phone : '-';
  return row[key] ?? '';
}

export default function CustomerList() {
  const nav = useNavigate();
  const [session, setSession] = useState(null);
  const [rows, setRows] = useState([]);
  const [term, setTerm] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const s = getSession();
    if (!s || !s.username || !s.role) { logout(); nav('/login'); return; }
    setSession(s);
  }, [nav]);

  useEffect(() => { setRows(listCustomers()); }, []);

  if (!session) {
    return <div style={{ color: '#627d98', padding: 40, fontFamily: 'Segoe UI,Arial' }}>Loading… please wait</div>;
  }

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    let out = rows.filter((r) => {
      if (!includeInactive && !r.isActive) return false;
      if (!t) return true;
      return [String(r.category || ''), String(r.name || ''), String(r.aliasName || ''),
        String(cell(r, 'city')), String(cell(r, 'phone'))].join(' ').toLowerCase().includes(t);
    });
    const dir = sortDir === 'asc' ? 1 : -1;
    return out.slice().sort((a, b) =>
      String(cell(a, sortKey) || '').localeCompare(String(cell(b, sortKey) || ''), undefined, { numeric: true }) * dir);
  }, [rows, term, includeInactive, sortKey, sortDir]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const onSort = (k) => {
    if (sortKey === k) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('asc'); }
    setPage(1);
  };

  const doDelete = (r) => {
    if (!confirm(`Delete customer "${r.name}"?`)) return;
    const res = deleteCustomer(r.id);
    setRows(listCustomers());
    setMsg(res.msg);
  };

  return (
    <div className="wrap">
      <Navbar session={session} />

      <div className="crumbbar">
        <span className="crumb">MASTER</span><span className="crumb-sep">&gt;</span>
        <span className="crumb">PARTY</span><span className="crumb-sep">&gt;</span>
        <span className="crumb on">CUSTOMER</span>
      </div>

      <div className="erp-body">
        <main className="erp-main">
          <div className="ltool">
            <button className="btn-primary sm" onClick={() => nav('/masters/customer/new')}>➕ New Customer</button>
            <input
              className="search"
              placeholder="Search name / alias / category / city…"
              value={term}
              onChange={(e) => { setTerm(e.target.value); setPage(1); }}
            />
            <label className="chk">
              <input type="checkbox" checked={includeInactive} onChange={(e) => { setIncludeInactive(e.target.checked); setPage(1); }} />
              Show Inactive
            </label>
          </div>

          {msg && <p className="msg ok">{msg}</p>}

          <div className="tblbox">
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th>
                  {COLUMNS.map((c) => (
                    <th key={c.key} className="sortable" onClick={() => onSort(c.key)}>
                      {c.label} {sortKey === c.key ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                    </th>
                  ))}
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((r, i) => (
                  <tr key={r.id} className="clickable" onClick={() => nav(`/masters/customer/${r.id}`)}>
                    <td>{(safePage - 1) * PAGE_SIZE + i + 1}</td>
                    {COLUMNS.map((c) => <td key={c.key}>{cell(r, c.key)}</td>)}
                    <td>{r.isActive ? '✓' : '✗'}</td>
                    <td>
                      <button className="del" onClick={(e) => { e.stopPropagation(); nav(`/masters/customer/${r.id}`); }}>✏️</button>
                      <button className="del" onClick={(e) => { e.stopPropagation(); doDelete(r); }}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={COLUMNS.length + 3} className="empty">No data to display — click “New Customer” to add your first record.</td></tr>}
                {rows.length > 0 && !paged.length && <tr><td colSpan={COLUMNS.length + 3} className="empty">No records match your search.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="pager">
            <button className="btn-outline sm" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>‹ Prev</button>
            <span>Page {safePage} of {pages} · {filtered.length} record{filtered.length === 1 ? '' : 's'}</span>
            <button className="btn-outline sm" disabled={safePage >= pages} onClick={() => setPage(safePage + 1)}>Next ›</button>
          </div>
        </main>
      </div>
    </div>
  );
}