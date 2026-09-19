// Collection Page — Accounts > Bills > Collection
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../auth';
import Navbar from '../components/Navbar';
import BlueSelect from '../components/BlueSelect';
import {
  ACCOUNTS_DOWNLOAD_TYPES, PARTY_TYPE_OPTIONS, CUSTOMER_OPTIONS,
  VOUCHER_TYPE_OPTIONS, VOUCHER_NO_OPTIONS, RECEIPT_TYPE_OPTIONS
} from '../accountsConfig';

const APPROVAL_OPTIONS = ['Both', 'Approved', 'Pending'];
const EXCEL_FORMAT_OPTIONS = ['CSV', 'PDF', 'XLS', 'RTF'];

const COLLECTION_COLUMNS = [
  { key: 'sno', label: 'S.No', defaultWidth: 60 },
  { key: 'receiptNo', label: 'Receipt No', defaultWidth: 140 },
  { key: 'receiptDate', label: 'Receipt Date', defaultWidth: 130 },
  { key: 'customer', label: 'Customer', defaultWidth: 200 },
  { key: 'type', label: 'Type', defaultWidth: 110 },
  { key: 'refNo', label: 'Ref No', defaultWidth: 130 },
  { key: 'amount', label: 'Amount', defaultWidth: 120 },
  { key: 'payMode', label: 'Pay Mode', defaultWidth: 120 },
  { key: 'chqNo', label: 'Chq/DD/Trf No', defaultWidth: 150 },
  { key: 'chqDate', label: 'Chq/DD/Trf Date', defaultWidth: 140 },
  { key: 'adjustStatus', label: 'Adjust Status', defaultWidth: 130 },
  { key: 'isVoid', label: 'Is Void', defaultWidth: 90 },
  { key: 'action', label: 'Action', defaultWidth: 110 },
];

const MOCK_COLLECTIONS = [
  {
    id: 1, receiptNo: 'RCP-2026-101', receiptDate: '2026-09-10',
    customer: 'Zara / Inditex S.A.', partyType: 'Customer',
    type: 'Receipt', refNo: 'REF-ZAR-901', amount: 15000.00,
    payMode: 'Transfer', chqNo: 'TRF-9884210', chqDate: '2026-09-10',
    adjustStatus: 'Adjusted', isVoid: 'No', approval: 'Approved',
  },
  {
    id: 2, receiptNo: 'RCP-2026-102', receiptDate: '2026-09-12',
    customer: 'H&M Sourcing Asia', partyType: 'Customer',
    type: 'Credit Note', refNo: 'REF-HM-441', amount: 22000.00,
    payMode: 'Cheque', chqNo: 'CHQ-3321908', chqDate: '2026-09-12',
    adjustStatus: 'Pending', isVoid: 'No', approval: 'Pending',
  },
  {
    id: 3, receiptNo: 'RCP-2026-103', receiptDate: '2026-09-14',
    customer: 'Nike Global Retail', partyType: 'Customer',
    type: 'Receipt', refNo: 'REF-NKE-882', amount: 8500.00,
    payMode: 'Cash', chqNo: '-', chqDate: '-',
    adjustStatus: 'Adjusted', isVoid: 'No', approval: 'Approved',
  },
];

const PAGE_SIZE = 10;

export default function Collection() {
  const nav = useNavigate();
  const [session, setSession] = useState(() => getSession() || { username: 'superadmin', role: 'Super Admin' });
  const [rows, setRows] = useState(() => {
    const raw = localStorage.getItem('frontier_collections_v1');
    if (!raw) {
      localStorage.setItem('frontier_collections_v1', JSON.stringify(MOCK_COLLECTIONS));
      return MOCK_COLLECTIONS;
    }
    try { return JSON.parse(raw); } catch { return MOCK_COLLECTIONS; }
  });

  /* ── Add Popup Modal State ── */
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalPartyType, setModalPartyType] = useState('Customer');

  /* ── Filters ── */
  const [filterPartyType, setFilterPartyType] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterReceiptNo, setFilterReceiptNo] = useState('');
  const [filterReceiptType, setFilterReceiptType] = useState('');
  const [filterApproval, setFilterApproval] = useState('Both');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [downloadFmt, setDownloadFmt] = useState('CSV');

  /* ── Grid state ── */
  const [gridCols, setGridCols] = useState(() => COLLECTION_COLUMNS);
  const [colFilters, setColFilters] = useState({});
  const [sortKey, setSortKey] = useState('receiptNo');
  const [sortOrder, setSortOrder] = useState('desc');
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const s = getSession();
    if (!s || !s.username || !s.role) { logout(); nav('/login'); return; }
    setSession(s);
  }, [nav]);

  /* ── Filter + Sort ── */
  const filtered = useMemo(() => rows.filter(r => {
    if (filterPartyType && r.partyType !== filterPartyType) return false;
    if (filterCustomer && filterCustomer !== 'All Customers' && r.customer !== filterCustomer) return false;
    if (filterType && filterType !== 'All' && r.type !== filterType) return false;
    if (filterReceiptNo && filterReceiptNo !== 'All Vouchers' && r.receiptNo !== filterReceiptNo) return false;
    if (filterReceiptType && filterReceiptType !== 'All' && r.payMode !== filterReceiptType) return false;
    if (filterApproval && filterApproval !== 'Both' && r.approval !== filterApproval) return false;
    if (fromDate && r.receiptDate < fromDate) return false;
    if (toDate && r.receiptDate > toDate) return false;
    return Object.entries(colFilters).every(([k, v]) => {
      if (!v) return true;
      return String(r[k] || '').toLowerCase().includes(v.toLowerCase());
    });
  }), [rows, filterPartyType, filterCustomer, filterType, filterReceiptNo, filterReceiptType, filterApproval, fromDate, toDate, colFilters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va = a[sortKey] ?? '', vb = b[sortKey] ?? '';
      if (sortKey === 'amount') { va = Number(va); vb = Number(vb); }
      else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
      if (va < vb) return sortOrder === 'asc' ? -1 : 1;
      if (va > vb) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortOrder]);

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const paged = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleHeaderClick = (key) => {
    if (sortKey === key) setSortOrder(p => p === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortOrder('asc'); }
  };

  const handleDragStart = (e, i) => { setDraggedIdx(i); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e, i) => { e.preventDefault(); if (dragOverIdx !== i) setDragOverIdx(i); };
  const handleDrop = (e, i) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === i) { setDraggedIdx(null); setDragOverIdx(null); return; }
    const cols = [...gridCols];
    const [moved] = cols.splice(draggedIdx, 1);
    cols.splice(i, 0, moved);
    setGridCols(cols);
    setDraggedIdx(null); setDragOverIdx(null);
  };

  const handleDownload = () => {
    if (downloadFmt === 'CSV' || downloadFmt === 'XLS') {
      const headers = gridCols.filter(c => c.key !== 'action').map(c => c.label);
      const csvRows = [headers.join(',')];
      sorted.forEach((r, i) => csvRows.push([
        i + 1, `"${r.receiptNo}"`, `"${r.receiptDate}"`, `"${r.customer}"`,
        `"${r.type}"`, `"${r.refNo}"`, r.amount, `"${r.payMode}"`,
        `"${r.chqNo}"`, `"${r.chqDate}"`, `"${r.adjustStatus}"`, `"${r.isVoid}"`
      ].join(',')));
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `Collections.${downloadFmt.toLowerCase()}`; a.click();
      URL.revokeObjectURL(url);
    } else {
      alert(`Downloading as ${downloadFmt}`);
    }
    setMsg(`Downloaded as ${downloadFmt}`);
    setTimeout(() => setMsg(''), 3000);
  };

  /* ── Add Modal Submit ── */
  const handleModalSubmit = () => {
    setShowAddModal(false);
    // Navigate to Adjustment page for the selected party type
    if (modalPartyType === 'Customer') {
      nav('/accounts/bills/adjustment');
    } else {
      nav('/accounts/bills/adjustment');
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar session={session} />

      <main style={{ maxWidth: 1500, margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* Breadcrumb Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600 }}>
              ACCOUNTS &gt; BILLS &gt; COLLECTION
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '4px 0 0' }}>
              Collection Receipts
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => { setShowAddModal(true); setModalPartyType('Customer'); }}
              style={{
                backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '9px 16px',
                borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'
              }}
            >
              ➕ Add Collection
            </button>
            <button
              onClick={() => alert('Printing collection list...')}
              style={{
                backgroundColor: '#fff', color: '#334155', border: '1px solid #cbd5e1', padding: '9px 16px',
                borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'
              }}
            >
              🖨️ Print
            </button>
            <button
              onClick={() => alert(`Total: ${sorted.length} records`)}
              style={{
                backgroundColor: '#fff', color: '#334155', border: '1px solid #cbd5e1', padding: '9px 16px',
                borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'
              }}
            >
              👁️ View
            </button>
          </div>
        </div>

        {msg && (
          <div style={{ padding: '10px 16px', borderRadius: 6, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', marginBottom: 16, fontWeight: 500 }}>
            {msg}
          </div>
        )}

        {/* Filter Section */}
        <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#334155', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            🔍 Filter Criteria
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, alignItems: 'end' }}>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Type</label>
              <BlueSelect value={filterPartyType} onChange={e => setFilterPartyType(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }}>
                <option value="">All Types</option>
                {PARTY_TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </BlueSelect>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Customer</label>
              <BlueSelect value={filterCustomer} onChange={e => setFilterCustomer(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }}>
                {CUSTOMER_OPTIONS.map(o => <option key={o} value={o === 'All Customers' ? '' : o}>{o}</option>)}
              </BlueSelect>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Voucher Type</label>
              <BlueSelect value={filterType} onChange={e => setFilterType(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }}>
                <option value="">All</option>
                {VOUCHER_TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </BlueSelect>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Receipt No</label>
              <BlueSelect value={filterReceiptNo} onChange={e => setFilterReceiptNo(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }}>
                {VOUCHER_NO_OPTIONS.map(o => <option key={o} value={o === 'All Vouchers' ? '' : o}>{o}</option>)}
              </BlueSelect>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Receipt Type</label>
              <BlueSelect value={filterReceiptType} onChange={e => setFilterReceiptType(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }}>
                <option value="">All</option>
                {RECEIPT_TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </BlueSelect>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Approval</label>
              <BlueSelect value={filterApproval} onChange={e => setFilterApproval(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }}>
                {APPROVAL_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </BlueSelect>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>From Date</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>To Date</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }} />
            </div>

            <div>
              <button
                onClick={() => { setFilterPartyType(''); setFilterCustomer(''); setFilterType(''); setFilterReceiptNo(''); setFilterReceiptType(''); setFilterApproval('Both'); setFromDate(''); setToDate(''); setColFilters({}); setPage(1); setMsg('Filters cleared.'); setTimeout(() => setMsg(''), 2000); }}
                style={{
                  width: '100%', padding: '9px 10px', borderRadius: 6, border: '1px solid #cbd5e1',
                  backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5
                }}
              >
                🔄 Reset
              </button>
            </div>

          </div>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 14, gap: 10 }}>
          <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Excel Format:</span>
          <BlueSelect value={downloadFmt} onChange={e => setDownloadFmt(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, color: '#0f172a' }}>
            {EXCEL_FORMAT_OPTIONS.map(f => <option key={f}>{f}</option>)}
          </BlueSelect>
          <button onClick={handleDownload}
            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #0284c7', backgroundColor: '#0284c7', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            📥 Download
          </button>
        </div>

        {/* Dynamic Slick Grid Table */}
        <div style={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 1500, borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  {gridCols.map((col, idx) => (
                    <th key={col.key}
                      draggable
                      onDragStart={e => handleDragStart(e, idx)}
                      onDragOver={e => handleDragOver(e, idx)}
                      onDrop={e => handleDrop(e, idx)}
                      onClick={() => col.key !== 'action' && col.key !== 'sno' && handleHeaderClick(col.key)}
                      style={{
                        padding: '10px 10px', textAlign: col.key === 'amount' ? 'right' : (col.key === 'action' ? 'center' : 'left'),
                        fontWeight: 700, color: '#1e293b', cursor: col.key !== 'action' && col.key !== 'sno' ? 'pointer' : 'default',
                        userSelect: 'none', borderRight: '1px solid #cbd5e1', whiteSpace: 'nowrap',
                        backgroundColor: dragOverIdx === idx ? '#e2e8f0' : 'transparent'
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: col.key === 'action' ? 'center' : 'space-between' }}>
                        <span>⋮⋮ {col.label}</span>
                        {sortKey === col.key && <span style={{ fontSize: 11 }}>{sortOrder === 'asc' ? '▲' : '▼'}</span>}
                      </div>
                    </th>
                  ))}
                </tr>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                  {gridCols.map(col => (
                    <td key={'s-' + col.key} style={{ padding: '5px 7px', borderRight: '1px solid #cbd5e1' }}>
                      {col.key !== 'action' && col.key !== 'sno' ? (
                        <input
                          type="text" placeholder={`Search...`}
                          value={colFilters[col.key] || ''}
                          onChange={e => setColFilters(p => ({ ...p, [col.key]: e.target.value }))}
                          style={{ width: '100%', padding: '3px 7px', fontSize: 11, borderRadius: 4, border: '1px solid #cbd5e1', outline: 'none' }}
                        />
                      ) : null}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={gridCols.length} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                      No collection records found.
                    </td>
                  </tr>
                ) : paged.map((row, idx) => {
                  const gidx = (safePage - 1) * PAGE_SIZE + idx + 1;
                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      {gridCols.map(col => {
                        if (col.key === 'sno') return <td key={col.key} style={{ padding: '10px 10px', color: '#64748b', fontWeight: 600, borderRight: '1px solid #f1f5f9' }}>{gidx}</td>;
                        if (col.key === 'action') return (
                          <td key={col.key} style={{ padding: '8px 10px', textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                              <button onClick={() => nav('/accounts/bills/adjustment')} title="Edit" style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, color: '#2563eb' }}>✏️</button>
                              <button onClick={() => alert(`Print: ${row.receiptNo}`)} title="Print" style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, color: '#0284c7' }}>🖨️</button>
                              <button onClick={() => {
                                if (window.confirm('Delete this record?')) {
                                  const updated = rows.filter(r => r.id !== row.id);
                                  localStorage.setItem('frontier_collections_v1', JSON.stringify(updated));
                                  setRows(updated);
                                }
                              }} title="Delete" style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, color: '#dc2626' }}>🗑️</button>
                            </div>
                          </td>
                        );
                        if (col.key === 'amount') return (
                          <td key={col.key} style={{ padding: '10px 10px', textAlign: 'right', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                            {Number(row[col.key] || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        );
                        if (col.key === 'adjustStatus') {
                          const isAdj = row[col.key] === 'Adjusted';
                          return (
                            <td key={col.key} style={{ padding: '10px 10px', borderRight: '1px solid #f1f5f9' }}>
                              <span style={{
                                display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                                backgroundColor: isAdj ? '#dcfce7' : '#fef9c3', color: isAdj ? '#166534' : '#854d0e'
                              }}>{row[col.key]}</span>
                            </td>
                          );
                        }
                        if (col.key === 'isVoid') {
                          const isVoid = row[col.key] === 'Yes';
                          return (
                            <td key={col.key} style={{ padding: '10px 10px', borderRight: '1px solid #f1f5f9' }}>
                              <span style={{
                                display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                                backgroundColor: isVoid ? '#fee2e2' : '#f1f5f9', color: isVoid ? '#991b1b' : '#475569'
                              }}>{row[col.key]}</span>
                            </td>
                          );
                        }
                        return <td key={col.key} style={{ padding: '10px 10px', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>{row[col.key] || '-'}</td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: 13 }}>
            <span style={{ color: '#64748b' }}>
              Showing {sorted.length > 0 ? (safePage - 1) * PAGE_SIZE + 1 : 0} to {Math.min(safePage * PAGE_SIZE, sorted.length)} of {sorted.length} records
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button disabled={safePage === 1} onClick={() => setPage(p => p - 1)}
                style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid #cbd5e1', backgroundColor: safePage === 1 ? '#f1f5f9' : '#fff', cursor: safePage === 1 ? 'not-allowed' : 'pointer' }}>
                ◀ Prev
              </button>
              <span style={{ fontWeight: 600, color: '#334155', lineHeight: '30px' }}>Page {safePage} of {pages}</span>
              <button disabled={safePage === pages} onClick={() => setPage(p => p + 1)}
                style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid #cbd5e1', backgroundColor: safePage === pages ? '#f1f5f9' : '#fff', cursor: safePage === pages ? 'not-allowed' : 'pointer' }}>
                Next ▶
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* ADD PARTY TYPE MODAL */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20
        }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 12, width: 360, padding: '28px 32px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                ➕ Add New Collection
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: '#64748b', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            {/* Party Type Radio Selector */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 14 }}>
                Select Party Type to continue:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Customer', 'Supplier'].map(type => (
                  <label key={type} style={{
                    display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                    padding: '12px 16px', borderRadius: 8, border: `2px solid ${modalPartyType === type ? '#2563eb' : '#e2e8f0'}`,
                    backgroundColor: modalPartyType === type ? '#eff6ff' : '#f8fafc',
                    transition: 'all 0.15s ease'
                  }}>
                    <input
                      type="radio"
                      name="partyType"
                      value={type}
                      checked={modalPartyType === type}
                      onChange={() => setModalPartyType(type)}
                      style={{ accentColor: '#2563eb', width: 16, height: 16 }}
                    />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: modalPartyType === type ? '#1d4ed8' : '#1e293b' }}>
                        {type === 'Customer' ? '🏢 Customer' : '🏭 Supplier'}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                        {type === 'Customer' ? 'Buyer / Export customer receipt' : 'Vendor / Supplier payment receipt'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: '9px 18px', borderRadius: 6, border: '1px solid #cbd5e1',
                  backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 600, fontSize: 14, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                style={{
                  padding: '9px 22px', borderRadius: 6, border: 'none',
                  backgroundColor: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(37,99,235,0.3)'
                }}
              >
                Proceed →
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
