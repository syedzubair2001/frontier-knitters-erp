// Requisition screen — Purchase & Stores > Purchase > Requisition
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../auth';
import Navbar from '../components/Navbar';
import {
  PURCHASE_DOWNLOAD_TYPES, ORDER_TYPES, REQ_TYPES, UNIT_OPTIONS,
  REQUISITION_COLUMNS, ORDER_LOOKUP_COLUMNS,
} from '../purchaseConfig';
import { listRequisitions, saveRequisitions, loadOrderLookup } from '../requisitionService';
import BlueSelect from '../components/BlueSelect';

const PAGE_SIZE = 10;

export default function Requisition() {
  const nav = useNavigate();
  const [session, setSession] = useState(null);
  const [rows, setRows] = useState(listRequisitions);

  // Top filter panel
  const [orderTypeF, setOrderTypeF] = useState('');
  const [reqTypeF, setReqTypeF] = useState('');
  const [unit, setUnit] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusF, setStatusF] = useState('All');
  const [msg, setMsg] = useState('');

  // Order No lookup (dropdown-table search)
  const [orderNo, setOrderNo] = useState('');
  const [lookupTerm, setLookupTerm] = useState('');
  const [lookupOpen, setLookupOpen] = useState(false);
  const orders = useMemo(() => loadOrderLookup(), []);

  // Result grid
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [downloadType, setDownloadType] = useState('csv');
  const [selected, setSelected] = useState({});

  useEffect(() => {
    const s = getSession();
    if (!s || !s.username || !s.role) { logout(); nav('/login'); return; }
    setSession(s);
  }, [nav]);

  useEffect(() => { saveRequisitions(rows); }, [rows]); // persist edits, mail flags

  if (!session) {
    return <div style={{ color: '#627d98', padding: 40, fontFamily: 'Segoe UI,Arial' }}>Loading… please wait</div>;
  }

  const filtered = useMemo(() => {
    const t = orderNo.trim().toLowerCase();
    return rows.filter((r) => {
      if (orderTypeF && r.orderType !== orderTypeF) return false;
      if (reqTypeF && (r.reqType || '').toUpperCase() !== reqTypeF.toUpperCase()) return false;
      if (fromDate && r.date && r.date < fromDate) return false;
      if (toDate && r.date && r.date > toDate) return false;
      if (statusF === 'Approved' && !r.approved) return false;
      if (statusF === 'Pending' && r.approved) return false;
      if (t && !String(r.orderNo || '').toLowerCase().includes(t) && !String(r.requisitionNo || '').toLowerCase().includes(t)) return false;
      return true;
    }).filter((r) => Object.entries(filters).every(([k, v]) => !v || String(r[k] ?? '').toLowerCase().includes(v.toLowerCase())));
  }, [rows, orderTypeF, reqTypeF, fromDate, toDate, statusF, orderNo, filters]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const pickedOrders = lookupTerm.trim()
    ? orders.filter((o) => ORDER_LOOKUP_COLUMNS.some((c) => String(o[c.key] || '').toLowerCase().includes(lookupTerm.trim().toLowerCase())))
    : orders;

  const pickOrder = (o) => { setOrderNo(o.orderNo); setLookupOpen(false); setLookupTerm(''); };
  const toggleRow = (id) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const countSelected = Object.values(selected).filter(Boolean).length;

  const mailRows = (ids) => {
    const next = rows.map((r) => (ids.includes(r.id) ? { ...r, mailApproved: true } : r));
    setRows(next);
    setMsg(`Approval mail sent for ${ids.length} requisition(s) ✅`);
  };
  const mailOne = (id) => {
    const row = rows.find((r) => r.id === id);
    mailRows(row && row.mailApproved ? [] : [id]);
  };
  const mailAll = () => {
    const ids = filtered.map((r) => r.id);
    if (!ids.length) { setMsg('No requisitions to mail.'); return; }
    setSelected({});
    mailRows(ids);
  };

  const exportRows = () => {
    const head = ['S.No', ...REQUISITION_COLUMNS.map((c) => c.label), 'Status'];
    const lines = filtered.map((r, i) => [i + 1, r.requisitionNo, r.orderNo, r.date, r.orderType, r.unitOrSupplier, r.budget, r.approved ? 'Approved' : 'Pending']
      .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [head.join(','), ...lines].join('\n');
    if (downloadType === 'csv') {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'requisitions.csv'; a.click();
      URL.revokeObjectURL(url);
      setMsg('Exported to CSV ✅');
    } else {
      setMsg(`Export to ${downloadType.toUpperCase()} is wired for the backend API (demo only for now).`);
    }
  };

  return (
    <div className="wrap">
      <Navbar session={session} />

      <div className="crumbbar">
        <span className="crumb">PURCHASE & STORES</span><span className="crumb-sep">&gt;</span>
        <span className="crumb">PURCHASE</span><span className="crumb-sep">&gt;</span>
        <span className="crumb on">REQUISITION</span>
        <div className="crumb-right">
          <button className="btn-outline sm" onClick={() => nav('/dashboard')}>📊 Dashboard</button>
        </div>
      </div>

      <div className="erp-body">
        <main className="erp-main">
          <div className="fpanel">
            <div className="fpanel-title">Search / Filter</div>
            <div className="fpanel-row">
              <div className="field">
                <label>Order Type</label>
                <BlueSelect value={orderTypeF} onChange={(e) => { setOrderTypeF(e.target.value); setPage(1); }}>
                  <option value="">— All —</option>
                  {ORDER_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
                </BlueSelect>
              </div>
              <div className="field">
                <label>Req Type</label>
                <BlueSelect value={reqTypeF} onChange={(e) => { setReqTypeF(e.target.value); setPage(1); }}>
                  <option value="">— All —</option>
                  {REQ_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
                </BlueSelect>
              </div>
              <div className="field">
                <label>Unit</label>
                <BlueSelect value={unit} onChange={(e) => setUnit(e.target.value)}>
                  <option value="">— Select —</option>
                  {UNIT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </BlueSelect>
              </div>
              <div className="field"><label>From Date</label><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></div>
              <div className="field"><label>To Date</label><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></div>

              <div className="field lookup">
                <label>Order No</label>
                <input
                  value={orderNo}
                  placeholder="Type / search order…"
                  onChange={(e) => { setOrderNo(e.target.value); setLookupTerm(e.target.value); setLookupOpen(true); }}
                  onFocus={() => setLookupOpen(true)}
                  onBlur={() => setTimeout(() => setLookupOpen(false), 200)}
                />
                {lookupOpen && (
                  <div className="lookup-table">
                    <table>
                      <thead>
                        <tr>{ORDER_LOOKUP_COLUMNS.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
                      </thead>
                      <tbody>
                        {pickedOrders.map((o, i) => (
                          <tr key={i} onMouseDown={() => pickOrder(o)}>
                            {ORDER_LOOKUP_COLUMNS.map((c) => <td key={c.key}>{o[c.key] || ''}</td>)}
                          </tr>
                        ))}
                        {!pickedOrders.length && <tr><td colSpan={ORDER_LOOKUP_COLUMNS.length} className="empty">No matching order</td></tr>}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="field">
                <label>Status</label>
                <div className="radio-pills">
                  <label className="chk"><input type="radio" name="reqStatus" checked={statusF === 'Approved'} onChange={() => { setStatusF('Approved'); setPage(1); }} /> Approved</label>
                  <label className="chk"><input type="radio" name="reqStatus" checked={statusF === 'Pending'} onChange={() => { setStatusF('Pending'); setPage(1); }} /> Pending</label>
                  <label className="chk"><input type="radio" name="reqStatus" checked={statusF === 'All'} onChange={() => { setStatusF('All'); setPage(1); }} /> All</label>
                </div>
              </div>
            </div>
          </div>

          <div className="toolbar">
            <span className="icon-btn" title="Download">⬇️</span>
            <BlueSelect className="dsel" value={downloadType} onChange={(e) => setDownloadType(e.target.value)}>
              {PURCHASE_DOWNLOAD_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
            </BlueSelect>
            <button className="btn-outline sm" onClick={exportRows}>Export</button>
            <button className="btn-outline sm" title="Print view" onClick={() => window.print()}>🖨️ Print View</button>
            <button className="btn-outline sm" onClick={mailAll}>📧 Mail Approval</button>
            {msg && <span className="msg ok">{msg}</span>}
          </div>

          <div className="tblbox">
            <table className="tbl slick">
              <thead>
                <tr>
                  <th className="rowsel">
                    <input
                      type="checkbox"
                      title="Select all"
                      checked={paged.length > 0 && paged.every((r) => selected[r.id])}
                      onChange={() => {
                        const n = { ...selected };
                        paged.forEach((r) => { n[r.id] = !(paged.length > 0 && paged.every((x) => selected[x.id])); });
                        setSelected(n);
                      }}
                    />
                  </th>
                  <th className="sn">S.No</th>
                  {REQUISITION_COLUMNS.map((c) => (
                    <th key={c.key}>
                      {c.label}
                      {c.searchable ? (
                        <input
                          className="col-search"
                          placeholder={`Search ${c.label}`}
                          value={filters[c.key] || ''}
                          onChange={(e) => { setFilters({ ...filters, [c.key]: e.target.value }); setPage(1); }}
                        />
                      ) : null}
                    </th>
                  ))}
                  <th>Mail</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((r, i) => (
                  <tr key={r.id}>
                    <td><input type="checkbox" checked={!!selected[r.id]} onChange={() => toggleRow(r.id)} /></td>
                    <td>{(safePage - 1) * PAGE_SIZE + i + 1}</td>
                    <td><b>{r.requisitionNo}</b></td>
                    <td>{r.orderNo}</td>
                    <td>{r.date}</td>
                    <td>{r.orderType}</td>
                    <td>{r.unitOrSupplier}</td>
                    <td className="right">{(Number(r.budget) || 0).toLocaleString()}</td>
                    <td>
                      <span
                        className={'mail-ic' + (r.mailApproved ? ' sent' : '')}
                        title={r.mailApproved ? 'Mail sent' : 'Send approval mail'}
                        onClick={() => mailOne(r.id)}
                      >
                        {r.mailApproved ? '📧✓' : '📧'}
                      </span>
                    </td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={REQUISITION_COLUMNS.length + 3} className="empty">No data to display — adjust the filters above.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="pager">
            <button className="btn-outline sm" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>‹ Prev</button>
            <span>Page {safePage} of {pages} · {filtered.length} record{filtered.length === 1 ? '' : 's'} · {countSelected} selected</span>
            <button className="btn-outline sm" disabled={safePage >= pages} onClick={() => setPage(safePage + 1)}>Next ›</button>
          </div>

          <div className="fpanel note">
            <small className="muted">Columns like Unit, Style and merchandiser come from the Order / Unit masters. Per-column search works on every grid column above.</small>
          </div>
        </main>
      </div>
    </div>
  );
}