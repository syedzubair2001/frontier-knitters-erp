// Stock screen — Purchase & Stores > Store > Stock.
// Shows the store master + store-wise stock. The Indent screen fetches its
// Store dropdown and Store / Stock Type / Avail Qty values from this same data
// (see src/stockService.js).
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../auth';
import Navbar from '../components/Navbar';
import BlueSelect from '../components/BlueSelect';
import {
  listStores, storesWithStock, listStockRows, stockSummary, STOCK_TYPES,
} from '../stockService';

const money = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Stock() {
  const nav = useNavigate();
  const [session, setSession] = useState(null);

  const [rows] = useState(() => listStockRows());
  const [storeMaster] = useState(() => listStores());
  const [summary] = useState(() => stockSummary());

  const [filterStore, setFilterStore] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const s = getSession();
    if (!s || !s.username || !s.role) { logout(); nav('/login'); return; }
    setSession(s);
  }, [nav]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filterStore && r.store !== filterStore) return false;
      if (filterType && r.stockType !== filterType) return false;
      if (q && !(`${r.productNo} ${r.productName} ${r.productType}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [rows, filterStore, filterType, search]);

  const totals = useMemo(() => ({
    qty: filtered.reduce((s, r) => s + Number(r.qty || 0), 0),
    value: filtered.reduce((s, r) => s + Number(r.qty || 0) * Number(r.rate || 0), 0),
  }), [filtered]);

  if (!session) {
    return <div style={{ color: '#627d98', padding: 40, fontFamily: 'Segoe UI,Arial' }}>Loading… please wait</div>;
  }

  const clearFilters = () => { setFilterStore(''); setFilterType(''); setSearch(''); };

  return (
    <div className="wrap">
      <Navbar session={session} />

      <div className="pagehead">
        <h2>📦 Stock</h2>
        <p className="sub">Store-wise stock of the system — the Indent screen fetches its Store list from here.</p>
      </div>

      <div className="content">
        {/* Store master + per-store totals (this is "which place has what") */}
        <div className="legacy-items-tblwrap" style={{ marginTop: 0 }}>
          <table className="legacy-tbl">
            <thead>
              <tr>
                <th style={{ width: 40 }}>Sno</th>
                <th>Store</th>
                <th>Items</th>
                <th>Stock Qty</th>
                <th>Stock Value</th>
                <th style={{ width: 120 }}>Has Stock</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s, i) => (
                <tr key={s.store}>
                  <td>{i + 1}</td>
                  <td style={{ textAlign: 'left' }}><b>{s.store}</b></td>
                  <td>{s.items}</td>
                  <td>{s.qty.toLocaleString('en-US')}</td>
                  <td>{money(s.value)}</td>
                  <td>{s.qty > 0 ? '✅ Yes' : '— Nil'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '12px' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1e3a60' }}>Stores in system ({storeMaster.length}):</span>
          {storeMaster.map((s) => (
            <span
              key={s}
              style={{
                fontSize: 11.5, fontWeight: 600, color: '#1e3a60', background: '#e3edf7',
                border: '1px solid #b0c4de', borderRadius: 12, padding: '2px 10px',
              }}
            >
              {s}
            </span>
          ))}
          <span style={{ fontSize: 11.5, color: '#64748b' }}>
            · stores holding stock: <b>{storesWithStock().length}</b>
          </span>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', margin: '0 12px 12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: '#1e3a60' }}>Store</label>
            <BlueSelect style={{ width: 190 }} value={filterStore} onChange={(e) => setFilterStore(e.target.value)}>
              <option value="">-- All Stores --</option>
              {storeMaster.map((s) => <option key={s} value={s}>{s}</option>)}
            </BlueSelect>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: '#1e3a60' }}>Stock Type</label>
            <BlueSelect style={{ width: 160 }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">-- All Types --</option>
              {STOCK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </BlueSelect>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: '#1e3a60' }}>Product</label>
            <input
              type="text"
              placeholder="Product No / Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 220, padding: '6px 10px', border: '1px solid #b8c7d9', borderRadius: 3, fontSize: 13 }}
            />
          </div>

          <button type="button" className="btn-outline sm" onClick={clearFilters}>Clear</button>
        </div>

        {/* Store-wise stock grid */}
        <div className="legacy-items-tblwrap">
          <table className="legacy-tbl">
            <thead>
              <tr>
                <th style={{ width: 40 }}>Sno</th>
                <th>Store</th>
                <th>Stock Type</th>
                <th>Product Type</th>
                <th>Product No</th>
                <th>Product Name</th>
                <th>Uom</th>
                <th>Stock Qty</th>
                <th>Rate</th>
                <th>Stock Value</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id || `${r.store}-${r.productNo}-${i}`}>
                  <td>{i + 1}</td>
                  <td style={{ textAlign: 'left' }}>{r.store}</td>
                  <td>{r.stockType}</td>
                  <td>{r.productType}</td>
                  <td><b>{r.productNo}</b></td>
                  <td style={{ textAlign: 'left' }}>{r.productName}</td>
                  <td>{r.uom}</td>
                  <td><b>{Number(r.qty || 0).toLocaleString('en-US')}</b></td>
                  <td>{money(r.rate)}</td>
                  <td>{money(Number(r.qty || 0) * Number(r.rate || 0))}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={10} className="empty-td">No stock data to display</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, margin: '10px 12px 24px', fontSize: 12.5, fontWeight: 600, color: '#1e3a60' }}>
          <span>Records: <b>{filtered.length}</b></span>
          <span>Total Stock Qty: <b>{totals.qty.toLocaleString('en-US')}</b></span>
          <span>Total Stock Value: <b>{money(totals.value)}</b></span>
        </div>
      </div>
    </div>
  );
}

