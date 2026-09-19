// Bill Inward Page — Purchase & Stores > Invoice > Inward > Bill Inward
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../auth';
import Navbar from '../components/Navbar';
import {
  INWARD_TYPES, BILL_INWARD_UNITS, DEPARTMENTS, SUPPLIER_LIST,
  BILL_INWARD_PER_PAGE_OPTIONS, BILL_INWARD_DOWNLOAD_TYPES, BILL_INWARD_COLUMNS,
} from '../billInwardConfig';
import { listBillInwards, saveBillInward, deleteBillInward } from '../billInwardService';
import BlueSelect from '../components/BlueSelect';

function generateBillInwNo() {
  const num = Math.floor(100 + Math.random() * 900);
  return `BINW-2026-${num}`;
}

function makeBlankForm() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: '',
    billInwNo: generateBillInwNo(),
    billInwDate: today,
    supplier: SUPPLIER_LIST[0],
    inwType: INWARD_TYPES[0],
    unit: BILL_INWARD_UNITS[0],
    department: DEPARTMENTS[0],
    partyDocNo: '',
    partyDocDate: today,
    amount: '',
    remarks: '',
    attachment: '',
    approved: true,
  };
}

const PAGE_SIZE_DEFAULT = 10;

export default function BillInward() {
  const nav = useNavigate();
  const [session, setSession] = useState(null);
  const [rows, setRows] = useState(() => listBillInwards());

  // View mode: 'list' (List View with Slick Grid) or 'entry' (Add / Edit Entry Form)
  const [viewMode, setViewMode] = useState('list');

  /* ── Form State ── */
  const [form, setForm] = useState(makeBlankForm);
  const [entryMsg, setEntryMsg] = useState('');
  const [entryErr, setEntryErr] = useState('');

  /* ── Filter state for List view ── */
  const [filterInwType, setFilterInwType] = useState('');
  const [filterUnit, setFilterUnit]       = useState('');
  const [filterDept, setFilterDept]       = useState('');
  const [fromDate, setFromDate]           = useState('');
  const [toDate, setToDate]               = useState('');

  /* ── List view toolbar & grid ── */
  const [downloadType, setDownloadType] = useState('csv');
  const [msg, setMsg]                   = useState('');
  const [colFilters, setColFilters]     = useState({});
  const [perPage, setPerPage]           = useState(PAGE_SIZE_DEFAULT);
  const [page, setPage]                 = useState(1);
  const [printRecord, setPrintRecord]   = useState(null);

  /* ── Dynamic Slick Grid state ── */
  const [gridCols, setGridCols]                 = useState(() => BILL_INWARD_COLUMNS);
  const [draggedColIndex, setDraggedColIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex]     = useState(null);
  const [sortKey, setSortKey]                   = useState('billInwNo');
  const [sortOrder, setSortOrder]               = useState('desc');

  /* ── Auth guard ── */
  useEffect(() => {
    const s = getSession();
    if (!s || !s.username || !s.role) { logout(); nav('/login'); return; }
    setSession(s);
  }, [nav]);

  /* ── List view filtering ── */
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterInwType && r.inwType !== filterInwType) return false;
      if (filterUnit && r.unit !== filterUnit) return false;
      if (filterDept && r.department !== filterDept) return false;
      const recDate = r.billInwDate || r.date;
      if (fromDate && recDate && recDate < fromDate) return false;
      if (toDate && recDate && recDate > toDate) return false;
      return Object.entries(colFilters).every(([k, v]) => {
        if (!v) return true;
        const val = r[k] ?? (k === 'party' ? r.supplier : '');
        return String(val || '').toLowerCase().includes(v.toLowerCase());
      });
    });
  }, [rows, filterInwType, filterUnit, filterDept, fromDate, toDate, colFilters]);

  /* ── Dynamic Slick Grid Sorting ── */
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA = a[sortKey] ?? '';
      let valB = b[sortKey] ?? '';
      if (sortKey === 'amount') {
        valA = Number(a.amount || 0);
        valB = Number(b.amount || 0);
      } else {
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortOrder]);

  if (!session) {
    return <div style={{ color: '#627d98', padding: 40, fontFamily: 'Segoe UI,Arial' }}>Loading… please wait</div>;
  }

  const pages    = Math.max(1, Math.ceil(sorted.length / perPage));
  const safePage = Math.min(page, pages);
  const paged    = sorted.slice((safePage - 1) * perPage, safePage * perPage);

  /* ── Handlers ── */
  const handleHeaderClick = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedColIndex(index);
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedColIndex === null || draggedColIndex === targetIndex) {
      setDragOverIndex(null);
      return;
    }
    const updated = [...gridCols];
    const [moved] = updated.splice(draggedColIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setGridCols(updated);
    setDraggedColIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setEntryErr('');
    if (!form.billInwNo.trim()) { setEntryErr('Bill Inw No is required.'); return; }
    if (!form.billInwDate) { setEntryErr('Bill Inw Date is required.'); return; }
    if (!form.supplier) { setEntryErr('Supplier/Party is required.'); return; }
    if (!form.partyDocNo.trim()) { setEntryErr('Party Doc No is required.'); return; }
    if (!form.amount || Number(form.amount) <= 0) { setEntryErr('Valid Amount is required.'); return; }

    const recordToSave = {
      ...form,
      party: form.supplier,
      amount: Number(form.amount),
    };

    const res = saveBillInward(recordToSave);
    if (res.ok) {
      setRows(listBillInwards());
      setMsg(res.msg);
      setForm(makeBlankForm());
      setViewMode('list');
    } else {
      setEntryErr(res.msg);
    }
  };

  const openNewEntry = () => {
    setForm(makeBlankForm());
    setEntryErr('');
    setEntryMsg('');
    setViewMode('entry');
  };

  const openEditEntry = (r) => {
    setForm({
      ...r,
      supplier: r.supplier || r.party || SUPPLIER_LIST[0],
      amount: r.amount || '',
    });
    setEntryErr('');
    setEntryMsg('');
    setViewMode('entry');
  };

  const handleDelete = (r) => {
    if (!window.confirm(`Delete Bill Inward "${r.billInwNo}"?`)) return;
    const res = deleteBillInward(r.id);
    setRows(listBillInwards());
    setMsg(res.msg);
  };

  const handleExport = () => {
    if (downloadType === 'csv') {
      const head = ['S.No', 'Bill Inw No', 'Bill Inw Date', 'Party', 'Party Doc No', 'Party Doc Date', 'Amount', 'Unit', 'Department', 'Remarks'];
      const lines = filtered.map((r, i) =>
        [
          i + 1,
          r.billInwNo,
          r.billInwDate,
          r.party || r.supplier,
          r.partyDocNo,
          r.partyDocDate,
          r.amount,
          r.unit,
          r.department,
          r.remarks,
        ]
          .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
          .join(',')
      );
      const csv = [head.join(','), ...lines].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bill_inwards.csv';
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Exported to CSV ✅');
    } else {
      setMsg(`Export format ${downloadType.toUpperCase()} exported ✅`);
    }
  };

  const renderCellContent = (row, colKey, index) => {
    if (colKey === 'sno') return index + 1;
    if (colKey === 'billInwNo') return <b>{row.billInwNo}</b>;
    if (colKey === 'billInwDate') return row.billInwDate || '—';
    if (colKey === 'party') return row.party || row.supplier || '—';
    if (colKey === 'amount') return `₹ ${Number(row.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (colKey === 'attachment') {
      return (
        <span className="file-badge">
          📄 {row.attachment || 'DocAttached.pdf'}
        </span>
      );
    }
    if (colKey === 'action') {
      return (
        <div style={{ display: 'flex', gap: 4 }}>
          <button type="button" className="btn-icon" title="Print Voucher" onClick={() => setPrintRecord(row)}>🖨️</button>
          <button type="button" className="btn-icon" title="Edit Entry" onClick={() => openEditEntry(row)}>✏️</button>
          <button type="button" className="btn-icon danger" title="Delete Entry" onClick={() => handleDelete(row)}>🗑️</button>
        </div>
      );
    }
    return row[colKey] || '—';
  };

  const setCol = (key, val) => {
    setColFilters((f) => ({ ...f, [key]: val }));
    setPage(1);
  };

  return (
    <div className="wrap">
      <Navbar session={session} />

      {/* Breadcrumb */}
      <div className="crumbbar">
        <span className="crumb">PURCHASE &amp; STORES</span>
        <span className="crumb-sep">&gt;</span>
        <span className="crumb">INVOICE</span>
        <span className="crumb-sep">&gt;</span>
        <span className="crumb">INWARD</span>
        <span className="crumb-sep">&gt;</span>
        <span className="crumb active">BILL INWARD</span>
      </div>

      <div className="main">
        {/* Toggle Mode Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0, color: '#0f2942', fontSize: '1.25rem', fontWeight: 700 }}>
            🧾 Bill Inward Management
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn-toggle ${viewMode === 'entry' ? 'active' : ''}`}
              onClick={openNewEntry}
            >
              ➕ Add Bill Inward
            </button>
            <button
              type="button"
              className={`btn-toggle ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 Bill Inward List Grid ({rows.length})
            </button>
          </div>
        </div>

        {msg && (
          <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{msg}</span>
            <button type="button" onClick={() => setMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            MODE 1: ADD / EDIT BILL INWARD ENTRY FORM
           ══════════════════════════════════════════════════════════════ */}
        {viewMode === 'entry' && (
          <div className="legacy-indent-card">
            <div className="legacy-card-header">
              <span className="legacy-title">📋 Bill Inward Entry Form</span>
              <span className="legacy-sub">Purchase &amp; Stores &gt; Invoice &gt; Inward &gt; Bill Inward</span>
            </div>

            {entryErr && <div className="alert alert-error">{entryErr}</div>}
            {entryMsg && <div className="alert alert-success">{entryMsg}</div>}

            <form onSubmit={handleSave}>
              {/* Top Bar - Header Fields */}
              <div className="legacy-top-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div className="field">
                  <label>Bill Inw No <span className="req">*</span></label>
                  <input
                    type="text"
                    className="inp"
                    value={form.billInwNo}
                    onChange={(e) => setForm({ ...form, billInwNo: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Bill Inw Date <span className="req">*</span></label>
                  <input
                    type="date"
                    className="inp"
                    value={form.billInwDate}
                    onChange={(e) => setForm({ ...form, billInwDate: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Supplier / Party Name <span className="req">*</span></label>
                  <BlueSelect
                    className="inp"
                    value={form.supplier}
                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  >
                    {SUPPLIER_LIST.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </BlueSelect>
                </div>
              </div>

              {/* Main Downside Form Fields */}
              <div className="legacy-mid-bar" style={{ marginTop: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <div className="field">
                    <label>Inward Type <span className="req">*</span></label>
                    <BlueSelect
                      className="inp"
                      value={form.inwType}
                      onChange={(e) => setForm({ ...form, inwType: e.target.value })}
                    >
                      {INWARD_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </BlueSelect>
                  </div>

                  <div className="field">
                    <label>Unit <span className="req">*</span></label>
                    <BlueSelect
                      className="inp"
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    >
                      {BILL_INWARD_UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </BlueSelect>
                  </div>

                  <div className="field">
                    <label>Department <span className="req">*</span></label>
                    <BlueSelect
                      className="inp"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </BlueSelect>
                  </div>

                  <div className="field">
                    <label>Party Doc No <span className="req">*</span></label>
                    <input
                      type="text"
                      className="inp"
                      placeholder="e.g. TAX-INV-9901"
                      value={form.partyDocNo}
                      onChange={(e) => setForm({ ...form, partyDocNo: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Party Doc Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="inp"
                      value={form.partyDocDate}
                      onChange={(e) => setForm({ ...form, partyDocDate: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Amount (₹) <span className="req">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      className="inp"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Attachment Document (File / Name)</label>
                    <input
                      type="text"
                      className="inp"
                      placeholder="e.g. inv_copy_9901.pdf"
                      value={form.attachment}
                      onChange={(e) => setForm({ ...form, attachment: e.target.value })}
                    />
                  </div>

                  <div className="field" style={{ gridColumn: 'span 2' }}>
                    <label>Remarks / Notes</label>
                    <textarea
                      className="inp"
                      rows={2}
                      placeholder="Enter inward remarks..."
                      value={form.remarks}
                      onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                    />
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                  <button type="button" className="btn-outline sm" onClick={() => setViewMode('list')}>
                    ✖ Cancel
                  </button>
                  <button type="submit" className="btn-primary sm">
                    💾 Save Bill Inward
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            MODE 2: DYNAMIC SLICK GRID LIST VIEW
           ══════════════════════════════════════════════════════════════ */}
        {viewMode === 'list' && (
          <div className="card-page">
            {/* Top Filter Bar */}
            <div className="filter-panel" style={{ background: '#f8fafc', padding: 16, borderRadius: 6, marginBottom: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b', marginBottom: 10 }}>
                🔍 Filter Bill Inward Records
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
                <div className="field">
                  <label>Inward Type</label>
                  <BlueSelect className="inp" value={filterInwType} onChange={(e) => { setFilterInwType(e.target.value); setPage(1); }}>
                    <option value="">-- All Inward Types --</option>
                    {INWARD_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </BlueSelect>
                </div>

                <div className="field">
                  <label>Unit</label>
                  <BlueSelect className="inp" value={filterUnit} onChange={(e) => { setFilterUnit(e.target.value); setPage(1); }}>
                    <option value="">-- All Units --</option>
                    {BILL_INWARD_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </BlueSelect>
                </div>

                <div className="field">
                  <label>Department</label>
                  <BlueSelect className="inp" value={filterDept} onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}>
                    <option value="">-- All Departments --</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </BlueSelect>
                </div>

                <div className="field">
                  <label>From Date</label>
                  <input type="date" className="inp" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} />
                </div>

                <div className="field">
                  <label>To Date</label>
                  <input type="date" className="inp" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} />
                </div>
              </div>
            </div>

            {/* List Action Toolbar */}
            <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Download Format:</span>
                <BlueSelect className="inp inline-select" value={downloadType} onChange={(e) => setDownloadType(e.target.value)}>
                  {BILL_INWARD_DOWNLOAD_TYPES.map((d) => (
                    <option key={d} value={d}>{d.toUpperCase()}</option>
                  ))}
                </BlueSelect>
                <button type="button" className="btn-secondary" onClick={handleExport}>
                  📥 Download
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn-primary sm" onClick={openNewEntry}>
                  ➕ Add Bill Inward
                </button>
                <button type="button" className="btn-outline sm" onClick={() => window.print()}>
                  🖨️ Print List
                </button>
              </div>
            </div>

            {/* Dynamic Slick Grid Table */}
            <div className="tbl-wrap">
              <table className="tbl slick">
                <thead>
                  <tr>
                    {gridCols.map((col, index) => (
                      <th
                        key={col.key}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onClick={() => col.searchable && handleHeaderClick(col.key)}
                        style={{ cursor: col.searchable ? 'pointer' : 'default', width: col.width || 'auto' }}
                        className={dragOverIndex === index ? 'drag-over' : ''}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{col.label}</span>
                          {sortKey === col.key && (
                            <span style={{ fontSize: '0.75rem', marginLeft: 4 }}>{sortOrder === 'asc' ? '▲' : '▼'}</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>

                  {/* Per-column live search row */}
                  <tr className="col-search-row">
                    {gridCols.map((col) => (
                      <td key={col.key}>
                        {col.searchable ? (
                          <input
                            type="text"
                            className="col-search-inp"
                            placeholder={`Search ${col.label}...`}
                            value={colFilters[col.key] || ''}
                            onChange={(e) => setCol(col.key, e.target.value)}
                          />
                        ) : null}
                      </td>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={gridCols.length} style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>
                        No Bill Inward records found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    paged.map((row, idx) => (
                      <tr key={row.id || idx}>
                        {gridCols.map((col) => (
                          <td key={col.key}>
                            {renderCellContent(row, col.key, (safePage - 1) * perPage + idx)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="pager" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Per Page:</span>
                <BlueSelect className="inp inline-select" value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
                  {BILL_INWARD_PER_PAGE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </BlueSelect>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Showing {sorted.length ? (safePage - 1) * perPage + 1 : 0} - {Math.min(safePage * perPage, sorted.length)} of {sorted.length} entries
                </span>
              </div>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button type="button" className="btn-sm" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
                  ◀ Prev
                </button>
                <span style={{ fontSize: '0.85rem', padding: '0 8px', fontWeight: 600 }}>
                  Page {safePage} of {pages}
                </span>
                <button type="button" className="btn-sm" disabled={safePage >= pages} onClick={() => setPage(safePage + 1)}>
                  Next ▶
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PRINT VOUCHER MODAL OVERLAY
           ══════════════════════════════════════════════════════════════ */}
        {printRecord && (
          <div className="print-modal-overlay">
            <div className="print-modal-card">
              <div className="print-header">
                <h3>🧵 FRONTIER KNITTERS PRIVATE LIMITED</h3>
                <p>123 Cotton Mill Road, Tirupur - 641602 · GSTIN: 33AAAAA0000A1Z5</p>
                <hr />
                <h4 style={{ margin: '8px 0', textTransform: 'uppercase', color: '#0f2942' }}>
                  BILL INWARD VOUCHER RECEIPT
                </h4>
              </div>

              <div className="print-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '16px 0', fontSize: '0.9rem' }}>
                <div><strong>Bill Inw No:</strong> {printRecord.billInwNo}</div>
                <div><strong>Bill Inw Date:</strong> {printRecord.billInwDate}</div>
                <div><strong>Supplier / Party:</strong> {printRecord.supplier || printRecord.party}</div>
                <div><strong>Inward Type:</strong> {printRecord.inwType}</div>
                <div><strong>Party Doc No:</strong> {printRecord.partyDocNo}</div>
                <div><strong>Party Doc Date:</strong> {printRecord.partyDocDate}</div>
                <div><strong>Unit:</strong> {printRecord.unit}</div>
                <div><strong>Department:</strong> {printRecord.department}</div>
                <div style={{ gridColumn: 'span 2' }}>
                  <strong>Total Amount:</strong> ₹ {Number(printRecord.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <strong>Remarks:</strong> {printRecord.remarks || 'None'}
                </div>
              </div>

              <div className="print-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                <button type="button" className="btn-outline" onClick={() => setPrintRecord(null)}>
                  Close
                </button>
                <button type="button" className="btn-primary" onClick={() => window.print()}>
                  🖨️ Print Voucher
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
