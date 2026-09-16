// General Invoice Page — Purchase & Stores > Invoice > General
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../auth';
import Navbar from '../components/Navbar';
import {
  SUPPLIER_LIST, INVOICE_TYPES, INVOICE_CATEGORIES, CURRENCY_TYPES,
  APPROVAL_STATUSES, GENERAL_INVOICE_PER_PAGE_OPTIONS, GENERAL_INVOICE_DOWNLOAD_TYPES,
  GENERAL_INVOICE_COLUMNS,
} from '../generalInvoiceConfig';
import { listGeneralInvoices, saveGeneralInvoice, deleteGeneralInvoice } from '../generalInvoiceService';
import { listBillInwards } from '../billInwardService';

function generateInvoiceNo() {
  const num = Math.floor(100 + Math.random() * 900);
  return `GINV-2026-${num}`;
}

function makeBlankForm() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: '',
    invoiceNo: generateInvoiceNo(),
    invoiceDate: today,
    supplier: SUPPLIER_LIST[0] || 'Cotton Craft Synthetics Ltd',
    supplierInvoiceNo: '',
    supplierInvoiceDate: today,
    curType: 'INR',
    curAmount: '',
    exchangeRate: '1.0',
    convertedAmount: '',
    invoiceType: 'Item',
    categoryType: 'General',
    billInwardNo: '',
    amount: '',
    process: '',
    approval: 'Approved',
  };
}

const PAGE_SIZE_DEFAULT = 10;

export default function GeneralInvoice() {
  const nav = useNavigate();
  const [session, setSession] = useState(() => getSession() || { username: 'superadmin', role: 'Super Admin' });
  const [rows, setRows] = useState(() => listGeneralInvoices());
  const [billInwardList, setBillInwardList] = useState([]);

  // View mode: 'list' or 'entry'
  const [viewMode, setViewMode] = useState('list');

  /* ── Form State ── */
  const [form, setForm] = useState(makeBlankForm);
  const [entryMsg, setEntryMsg] = useState('');
  const [entryErr, setEntryErr] = useState('');

  /* ── Filter state for List view ── */
  const [filterSupplier, setFilterSupplier]     = useState('');
  const [filterInvoiceNo, setFilterInvoiceNo]   = useState('');
  const [filterBillInwNo, setFilterBillInwNo]   = useState('');
  const [filterApproval, setFilterApproval]     = useState('All');
  const [filterInvoiceType, setFilterInvoiceType] = useState('');
  const [fromDate, setFromDate]                 = useState('');
  const [toDate, setToDate]                     = useState('');

  /* ── List view toolbar & grid ── */
  const [downloadType, setDownloadType] = useState('csv');
  const [msg, setMsg]                   = useState('');
  const [colFilters, setColFilters]     = useState({});
  const [perPage, setPerPage]           = useState(PAGE_SIZE_DEFAULT);
  const [page, setPage]                 = useState(1);
  const [printRecord, setPrintRecord]   = useState(null);

  /* ── Dynamic Slick Grid state ── */
  const [gridCols, setGridCols]                 = useState(() => GENERAL_INVOICE_COLUMNS);
  const [draggedColIndex, setDraggedColIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex]     = useState(null);
  const [sortKey, setSortKey]                   = useState('invoiceNo');
  const [sortOrder, setSortOrder]               = useState('desc');

  /* ── Auth & seed records ── */
  useEffect(() => {
    const s = getSession();
    if (!s || !s.username || !s.role) { logout(); nav('/login'); return; }
    setSession(s);

    // Fetch records
    const records = listGeneralInvoices();
    setRows(records || []);

    // Fetch existing bill inwards for dropdown linking
    const bList = listBillInwards();
    setBillInwardList(bList || []);
  }, [nav]);

  /* ── Calculate Converted Amount on CurAmount/ExchangeRate change ── */
  useEffect(() => {
    const amt = parseFloat(form.curAmount || 0);
    const rate = parseFloat(form.exchangeRate || 1);
    if (!isNaN(amt) && !isNaN(rate)) {
      const calc = (amt * rate).toFixed(2);
      setForm((prev) => ({ ...prev, convertedAmount: calc }));
    }
  }, [form.curAmount, form.exchangeRate]);

  /* ── Auto Fill Amount from Bill Inward Selection ── */
  const handleBillInwardChange = (bNo) => {
    const found = billInwardList.find((b) => b.billInwNo === bNo);
    setForm((prev) => ({
      ...prev,
      billInwardNo: bNo,
      amount: found ? String(found.amount || '') : prev.amount,
      supplier: (found && found.supplier) ? found.supplier : (found && found.party ? found.party : prev.supplier),
    }));
  };

  /* ── List view filtering ── */
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterSupplier && r.supplier !== filterSupplier) return false;
      if (filterInvoiceNo && !r.invoiceNo.toLowerCase().includes(filterInvoiceNo.toLowerCase())) return false;
      if (filterBillInwNo && r.billInwardNo !== filterBillInwNo) return false;
      if (filterApproval && filterApproval !== 'All' && r.approval !== filterApproval) return false;
      if (filterInvoiceType && r.invoiceType !== filterInvoiceType) return false;

      const recDate = r.invoiceDate || r.date;
      if (fromDate && recDate && recDate < fromDate) return false;
      if (toDate && recDate && recDate > toDate) return false;

      return Object.entries(colFilters).every(([k, v]) => {
        if (!v) return true;
        const val = r[k];
        return String(val || '').toLowerCase().includes(v.toLowerCase());
      });
    });
  }, [rows, filterSupplier, filterInvoiceNo, filterBillInwNo, filterApproval, filterInvoiceType, fromDate, toDate, colFilters]);

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

  /* ── Dynamic Slick Grid Handlers ── */
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

  /* ── Form Submit ── */
  const handleSave = (e) => {
    e.preventDefault();
    setEntryErr('');
    if (!form.invoiceNo.trim()) { setEntryErr('Invoice No is required.'); return; }
    if (!form.invoiceDate) { setEntryErr('Invoice Date is required.'); return; }
    if (!form.supplier) { setEntryErr('Supplier is required.'); return; }
    if (!form.supplierInvoiceNo.trim()) { setEntryErr('Supplier Invoice No is required.'); return; }

    const res = saveGeneralInvoice(form);
    if (res.ok) {
      setRows(listGeneralInvoices());
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
    setForm({ ...r });
    setEntryErr('');
    setEntryMsg('');
    setViewMode('entry');
  };

  const handleDelete = (r) => {
    if (!window.confirm(`Delete General Invoice "${r.invoiceNo}"?`)) return;
    const res = deleteGeneralInvoice(r.id);
    setRows(listGeneralInvoices());
    setMsg(res.msg);
  };

  const handleExport = () => {
    if (downloadType === 'csv') {
      const head = ['S.No', 'Invoice No', 'Invoice Date', 'Supplier', 'Supplier Invoice No', 'Bill Inward No', 'Amount', 'Invoice Type', 'Approval'];
      const lines = filtered.map((r, i) =>
        [
          i + 1,
          r.invoiceNo,
          r.invoiceDate,
          r.supplier,
          r.supplierInvoiceNo,
          r.billInwardNo,
          r.amount,
          r.invoiceType,
          r.approval,
        ]
          .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
          .join(',')
      );
      const csv = [head.join(','), ...lines].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'general_invoices.csv';
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Exported to CSV ✅');
    } else {
      setMsg(`Export format ${downloadType.toUpperCase()} exported ✅`);
    }
  };

  const renderCellContent = (row, colKey, index) => {
    if (colKey === 'sno') return index + 1;
    if (colKey === 'invoiceNo') return <b>{row.invoiceNo}</b>;
    if (colKey === 'invoiceDate') return row.invoiceDate || '—';
    if (colKey === 'supplier') return row.supplier || '—';
    if (colKey === 'supplierInvoiceNo') return row.supplierInvoiceNo || '—';
    if (colKey === 'billInwardNo') return row.billInwardNo || '—';
    if (colKey === 'amount') return `₹ ${Number(row.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (colKey === 'approval') {
      const isApproved = row.approval === 'Approved';
      return (
        <span style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: '0.78rem',
          fontWeight: 600,
          background: isApproved ? '#dcfce7' : '#fef3c7',
          color: isApproved ? '#166534' : '#92400e',
        }}>
          {row.approval || 'Approved'}
        </span>
      );
    }
    if (colKey === 'action') {
      return (
        <div style={{ display: 'flex', gap: 4 }}>
          <button type="button" className="btn-icon" title="Print Invoice Voucher" onClick={() => setPrintRecord(row)}>🖨️</button>
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
        <span className="crumb active">GENERAL INVOICE</span>
      </div>

      <div className="main">
        {/* Toggle Mode Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0, color: '#0f2942', fontSize: '1.25rem', fontWeight: 700 }}>
            📑 General Invoice Management
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn-toggle ${viewMode === 'entry' ? 'active' : ''}`}
              onClick={openNewEntry}
            >
              ➕ Add General Invoice
            </button>
            <button
              type="button"
              className={`btn-toggle ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 General Invoice List Grid ({rows.length})
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
            MODE 1: ADD / EDIT GENERAL INVOICE ENTRY FORM
           ══════════════════════════════════════════════════════════════ */}
        {viewMode === 'entry' && (
          <div className="legacy-indent-card">
            <div className="legacy-card-header">
              <span className="legacy-title">📋 General Invoice</span>
              <span className="legacy-sub">Purchase &amp; Stores &gt; Invoice &gt; General Invoice Entry</span>
            </div>

            {entryErr && <div className="alert alert-error">{entryErr}</div>}
            {entryMsg && <div className="alert alert-success">{entryMsg}</div>}

            <form onSubmit={handleSave}>
              {/* Header Fields Section */}
              <div className="legacy-top-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                <div className="field">
                  <label>Invoice No <span className="req">*</span></label>
                  <input
                    type="text"
                    className="inp"
                    value={form.invoiceNo}
                    onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Invoice Date <span className="req">*</span></label>
                  <input
                    type="date"
                    className="inp"
                    value={form.invoiceDate}
                    onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Supplier <span className="req">*</span></label>
                  <select
                    className="inp"
                    value={form.supplier}
                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  >
                    {SUPPLIER_LIST.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Supplier Invoice No <span className="req">*</span></label>
                  <input
                    type="text"
                    className="inp"
                    placeholder="e.g. SUP-INV-9901"
                    value={form.supplierInvoiceNo}
                    onChange={(e) => setForm({ ...form, supplierInvoiceNo: e.target.value })}
                  />
                </div>
              </div>

              {/* Invoice Info Section with * Asterisk */}
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 6, margin: '14px 0', border: '1px solid #cbd5e1' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>💳 Invoice Info</span>
                  <span className="req">*</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                  <div className="field">
                    <label>Supplier Invoice Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="inp"
                      value={form.supplierInvoiceDate}
                      onChange={(e) => setForm({ ...form, supplierInvoiceDate: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Currency Type <span className="req">*</span></label>
                    <select
                      className="inp"
                      value={form.curType}
                      onChange={(e) => setForm({ ...form, curType: e.target.value })}
                    >
                      {CURRENCY_TYPES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Currency Amount <span className="req">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      className="inp"
                      placeholder="0.00"
                      value={form.curAmount}
                      onChange={(e) => setForm({ ...form, curAmount: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Exchange Rate <span className="req">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      className="inp"
                      placeholder="1.0"
                      value={form.exchangeRate}
                      onChange={(e) => setForm({ ...form, exchangeRate: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Converted Amount (Calculated)</label>
                    <input
                      type="text"
                      className="inp"
                      disabled
                      value={form.convertedAmount ? `₹ ${form.convertedAmount}` : ''}
                      style={{ background: '#e2e8f0', color: '#334155', fontWeight: 600 }}
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Type Selector — Horizontal INSIDE the form */}
              <div style={{ background: '#ffffff', padding: 14, borderRadius: 6, marginBottom: 14, border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155', marginBottom: 8 }}>
                  📌 Invoice Type Selector
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: 4, borderRadius: 6, border: '1px solid #cbd5e1' }}>
                    {INVOICE_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        style={{
                          padding: '6px 14px',
                          border: 'none',
                          borderRadius: 4,
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: form.invoiceType === type ? '#0f2942' : 'transparent',
                          color: form.invoiceType === type ? '#ffffff' : '#475569',
                          transition: 'all 0.15s ease-in-out',
                        }}
                        onClick={() => setForm({ ...form, invoiceType: type })}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Type Category:</label>
                    <select
                      className="inp"
                      style={{ minWidth: 140 }}
                      value={form.categoryType}
                      onChange={(e) => setForm({ ...form, categoryType: e.target.value })}
                    >
                      {INVOICE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Bill Inward & Process Details Section */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div className="field">
                  <label>Bill Inward No (Dropdown)</label>
                  <select
                    className="inp"
                    value={form.billInwardNo}
                    onChange={(e) => handleBillInwardChange(e.target.value)}
                  >
                    <option value="">-- Select Bill Inward No --</option>
                    {billInwardList.map((b) => (
                      <option key={b.id || b.billInwNo} value={b.billInwNo}>
                        {b.billInwNo} ({b.supplier || b.party} - ₹{b.amount})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Amount (Disabled - Auto Filled)</label>
                  <input
                    type="text"
                    className="inp"
                    disabled
                    placeholder="Auto-filled from Bill Inward"
                    value={form.amount ? `₹ ${form.amount}` : ''}
                    style={{ background: '#e2e8f0', color: '#334155', fontWeight: 600 }}
                  />
                </div>

                <div className="field">
                  <label>Process / Remarks</label>
                  <input
                    type="text"
                    className="inp"
                    placeholder="Enter process details or notes..."
                    value={form.process}
                    onChange={(e) => setForm({ ...form, process: e.target.value })}
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                <button type="button" className="btn-outline sm" onClick={() => setViewMode('list')}>
                  ✖ Cancel
                </button>
                <button type="submit" className="btn-primary sm">
                  💾 Save General Invoice
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            MODE 2: DYNAMIC SLICK GRID LIST VIEW
           ══════════════════════════════════════════════════════════════ */}
        {viewMode === 'list' && (
          <div className="card-page">
            {/* Top Filter Panel */}
            <div className="filter-panel" style={{ background: '#f8fafc', padding: 16, borderRadius: 6, marginBottom: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
                  🔍 Filter General Invoice Records
                </div>
                <button
                  type="button"
                  className="btn-outline sm"
                  style={{ padding: '3px 10px', fontSize: '0.78rem' }}
                  onClick={() => {
                    setFilterSupplier('');
                    setFilterInvoiceNo('');
                    setFilterBillInwNo('');
                    setFilterApproval('All');
                    setFilterInvoiceType('');
                    setFromDate('');
                    setToDate('');
                    setColFilters({});
                    setPage(1);
                  }}
                >
                  🔄 Reset Filters
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                <div className="field">
                  <label>Supplier</label>
                  <select className="inp" value={filterSupplier} onChange={(e) => { setFilterSupplier(e.target.value); setPage(1); }}>
                    <option value="">-- All Suppliers --</option>
                    {SUPPLIER_LIST.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Invoice No</label>
                  <input
                    type="text"
                    className="inp"
                    placeholder="Search Invoice No..."
                    value={filterInvoiceNo}
                    onChange={(e) => { setFilterInvoiceNo(e.target.value); setPage(1); }}
                  />
                </div>

                <div className="field">
                  <label>Bill Inward No</label>
                  <select className="inp" value={filterBillInwNo} onChange={(e) => { setFilterBillInwNo(e.target.value); setPage(1); }}>
                    <option value="">-- All Bill Inwards --</option>
                    {billInwardList.map((b) => (
                      <option key={b.billInwNo} value={b.billInwNo}>{b.billInwNo}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Approval</label>
                  <select className="inp" value={filterApproval} onChange={(e) => { setFilterApproval(e.target.value); setPage(1); }}>
                    {APPROVAL_STATUSES.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Invoice Type</label>
                  <select className="inp" value={filterInvoiceType} onChange={(e) => { setFilterInvoiceType(e.target.value); setPage(1); }}>
                    <option value="">-- All Types --</option>
                    {INVOICE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
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
                <select className="inp inline-select" value={downloadType} onChange={(e) => setDownloadType(e.target.value)}>
                  {GENERAL_INVOICE_DOWNLOAD_TYPES.map((d) => (
                    <option key={d} value={d}>{d.toUpperCase()}</option>
                  ))}
                </select>
                <button type="button" className="btn-secondary" onClick={handleExport}>
                  📥 Download
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn-primary sm" onClick={openNewEntry}>
                  ➕ Add General Invoice
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
                        No General Invoice records found matching criteria.
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
                <select className="inp inline-select" value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
                  {GENERAL_INVOICE_PER_PAGE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
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
                <h3>FRONTIER KNITTERS PRIVATE LIMITED</h3>
                <p>123 Cotton Mill Road, Tirupur - 641602 · GSTIN: 33AAAAA0000A1Z5</p>
                <hr />
                <h4 style={{ margin: '8px 0', textTransform: 'uppercase', color: '#0f2942' }}>
                  GENERAL INVOICE VOUCHER
                </h4>
              </div>

              <div className="print-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '16px 0', fontSize: '0.9rem' }}>
                <div><strong>Invoice No:</strong> {printRecord.invoiceNo}</div>
                <div><strong>Invoice Date:</strong> {printRecord.invoiceDate}</div>
                <div><strong>Supplier:</strong> {printRecord.supplier}</div>
                <div><strong>Supplier Invoice No:</strong> {printRecord.supplierInvoiceNo}</div>
                <div><strong>Supplier Invoice Date:</strong> {printRecord.supplierInvoiceDate}</div>
                <div><strong>Bill Inward No:</strong> {printRecord.billInwardNo}</div>
                <div><strong>Currency / Exchange:</strong> {printRecord.curType} (Rate: {printRecord.exchangeRate})</div>
                <div><strong>Invoice Type:</strong> {printRecord.invoiceType} ({printRecord.categoryType})</div>
                <div><strong>Approval:</strong> {printRecord.approval}</div>
                <div style={{ gridColumn: 'span 2' }}>
                  <strong>Total Amount:</strong> ₹ {Number(printRecord.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <strong>Process / Remarks:</strong> {printRecord.process || 'None'}
                </div>
              </div>

              <div className="print-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                <button type="button" className="btn-outline" onClick={() => setPrintRecord(null)}>
                  Close
                </button>
                <button type="button" className="btn-primary" onClick={() => window.print()}>
                  🖨️ Print Invoice
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
