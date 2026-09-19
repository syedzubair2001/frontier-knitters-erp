// Despatch Page — Sales & Shipment > Exports > Despatch
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../auth';
import Navbar from '../components/Navbar';
import {
  BUYER_LIST, JOB_ORDER_LIST, SUPPLIER_LIST, FORWARDER_LIST, SHIP_MODES,
  TYPE_OPTIONS, APPROVAL_TYPES, CARTON_PACKING_OPTIONS, DESPATCH_PER_PAGE_OPTIONS,
  DESPATCH_DOWNLOAD_TYPES, DESPATCH_COLUMNS,
} from '../salesConfig';
import { listDespatches, saveDespatch, deleteDespatch } from '../salesService';
import BlueSelect from '../components/BlueSelect';

function generateDespatchNo() {
  const num = Math.floor(100 + Math.random() * 900);
  return `DSP-2026-${num}`;
}

function makeBlankForm() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: '',
    despatchNo: generateDespatchNo(),
    despatchDate: today,
    customer: BUYER_LIST[0] || 'Nike Global Retail',
    jobOrderNo: JOB_ORDER_LIST[0] || 'JO-2026-8801',
    supplier: SUPPLIER_LIST[0] || 'Cotton Craft Synthetics Ltd',
    forwarder: FORWARDER_LIST[0] || 'DHL Express Global',
    shipMode: SHIP_MODES[0] || 'Air Freight',
    type: 'Both',
    invoiceNo: '',
    despatchQty: '',
    value: '',
    cartonPacking: 'Yes',
    approval: 'Approved',
    remarks: '',
  };
}

const PAGE_SIZE_DEFAULT = 10;

export default function Despatch() {
  const nav = useNavigate();
  const [session, setSession] = useState(() => getSession() || { username: 'superadmin', role: 'Super Admin' });
  const [rows, setRows] = useState(() => listDespatches());

  // View mode: 'list' or 'entry'
  const [viewMode, setViewMode] = useState('list');

  /* ── Add Button Popup Modal State ── */
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalPackingType, setModalPackingType] = useState('Carton Box Packing');

  /* ── Form State ── */
  const [form, setForm] = useState(makeBlankForm);
  const [entryMsg, setEntryMsg] = useState('');
  const [entryErr, setEntryErr] = useState('');

  /* ── Filter state for List view ── */
  const [filterBuyer, setFilterBuyer]               = useState('');
  const [filterJobOrder, setFilterJobOrder]         = useState('');
  const [filterSupplier, setFilterSupplier]         = useState('');
  const [filterType, setFilterType]                 = useState('');
  const [filterInvoiceNo, setFilterInvoiceNo]       = useState('');
  const [filterApproval, setFilterApproval]         = useState('Both');
  const [fromDate, setFromDate]                     = useState('');
  const [toDate, setToDate]                         = useState('');
  const [filterCartonPacking, setFilterCartonPacking] = useState('Both');

  /* ── List view toolbar & grid ── */
  const [downloadType, setDownloadType] = useState('csv');
  const [msg, setMsg]                   = useState('');
  const [colFilters, setColFilters]     = useState({});
  const [perPage, setPerPage]           = useState(PAGE_SIZE_DEFAULT);
  const [page, setPage]                 = useState(1);
  const [printRecord, setPrintRecord]   = useState(null);

  /* ── Dynamic Slick Grid state ── */
  const [gridCols, setGridCols]                 = useState(() => DESPATCH_COLUMNS);
  const [draggedColIndex, setDraggedColIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex]     = useState(null);
  const [sortKey, setSortKey]                   = useState('despatchNo');
  const [sortOrder, setSortOrder]               = useState('desc');

  /* ── Auth & seed records ── */
  useEffect(() => {
    const s = getSession();
    if (!s || !s.username || !s.role) { logout(); nav('/login'); return; }
    setSession(s);

    const records = listDespatches();
    setRows(records || []);
  }, [nav]);

  /* ── List view filtering ── */
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterBuyer && r.customer !== filterBuyer) return false;
      if (filterJobOrder && r.jobOrderNo !== filterJobOrder) return false;
      if (filterSupplier && r.supplier !== filterSupplier) return false;
      if (filterType && r.type !== filterType) return false;
      if (filterInvoiceNo && !r.invoiceNo.toLowerCase().includes(filterInvoiceNo.toLowerCase())) return false;
      if (filterApproval && filterApproval !== 'Both' && r.approval !== filterApproval) return false;
      if (filterCartonPacking && filterCartonPacking !== 'Both' && r.cartonPacking !== filterCartonPacking) return false;

      const recDate = r.despatchDate || r.date;
      if (fromDate && recDate && recDate < fromDate) return false;
      if (toDate && recDate && recDate > toDate) return false;

      return Object.entries(colFilters).every(([k, v]) => {
        if (!v) return true;
        const val = r[k];
        return String(val || '').toLowerCase().includes(v.toLowerCase());
      });
    });
  }, [rows, filterBuyer, filterJobOrder, filterSupplier, filterType, filterInvoiceNo, filterApproval, filterCartonPacking, fromDate, toDate, colFilters]);

  /* ── Dynamic Slick Grid Sorting ── */
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA = a[sortKey] ?? '';
      let valB = b[sortKey] ?? '';
      if (sortKey === 'value' || sortKey === 'despatchQty') {
        valA = Number(a[sortKey] || 0);
        valB = Number(b[sortKey] || 0);
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
    return <div style={{ color: '#627d98', padding: 40, fontFamily: 'Sora, sans-serif' }}>Loading… please wait</div>;
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

  /* ── Add Modal Handlers ── */
  const handleAddModalSubmit = () => {
    const blank = makeBlankForm();
    blank.cartonPacking = modalPackingType === 'Carton Box Packing' ? 'Yes' : 'No';
    setForm(blank);
    setEntryErr('');
    setEntryMsg('');
    setShowAddModal(false);
    setViewMode('entry');
  };

  /* ── Form Submit ── */
  const handleSave = (e) => {
    e.preventDefault();
    setEntryErr('');
    if (!form.despatchNo.trim()) { setEntryErr('Despatch No is required.'); return; }
    if (!form.despatchDate) { setEntryErr('Despatch Date is required.'); return; }
    if (!form.customer) { setEntryErr('Buyer/Customer is required.'); return; }
    if (!form.despatchQty || Number(form.despatchQty) <= 0) { setEntryErr('Valid Despatch Qty is required.'); return; }

    const res = saveDespatch(form);
    if (res.ok) {
      setRows(listDespatches());
      setMsg(res.msg);
      setForm(makeBlankForm());
      setViewMode('list');
    } else {
      setEntryErr(res.msg);
    }
  };

  const openEditEntry = (r) => {
    setForm({ ...r });
    setEntryErr('');
    setEntryMsg('');
    setViewMode('entry');
  };

  const handleDelete = (r) => {
    if (!window.confirm(`Delete Despatch record "${r.despatchNo}"?`)) return;
    const res = deleteDespatch(r.id);
    setRows(listDespatches());
    setMsg(res.msg);
  };

  const handleExport = () => {
    if (downloadType === 'csv') {
      const head = ['S.No', 'Despatch No', 'Despatch Date', 'Customer', 'Supplier', 'Forwarder', 'Ship Mode', 'Despatch Qty', 'Value', 'Approval'];
      const lines = filtered.map((r, i) =>
        [
          i + 1,
          r.despatchNo,
          r.despatchDate,
          r.customer,
          r.supplier,
          r.forwarder,
          r.shipMode,
          r.despatchQty,
          r.value,
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
      a.download = 'despatch_records.csv';
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Exported to CSV ✅');
    } else {
      setMsg(`Export format ${downloadType.toUpperCase()} exported ✅`);
    }
  };

  const renderCellContent = (row, colKey, index) => {
    if (colKey === 'sno') return index + 1;
    if (colKey === 'despatchNo') return <b>{row.despatchNo}</b>;
    if (colKey === 'despatchDate') return row.despatchDate || '—';
    if (colKey === 'customer') return row.customer || '—';
    if (colKey === 'supplier') return row.supplier || '—';
    if (colKey === 'forwarder') return row.forwarder || '—';
    if (colKey === 'shipMode') return row.shipMode || '—';
    if (colKey === 'despatchQty') return Number(row.despatchQty || 0).toLocaleString();
    if (colKey === 'value') return `₹ ${Number(row.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (colKey === 'action') {
      return (
        <div style={{ display: 'flex', gap: 4 }}>
          <button type="button" className="btn-icon" title="Print Despatch Note" onClick={() => setPrintRecord(row)}>🖨️</button>
          <button type="button" className="btn-icon" title="Edit Record" onClick={() => openEditEntry(row)}>✏️</button>
          <button type="button" className="btn-icon danger" title="Delete Record" onClick={() => handleDelete(row)}>🗑️</button>
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
        <span className="crumb">SALES &amp; SHIPMENT</span>
        <span className="crumb-sep">&gt;</span>
        <span className="crumb">EXPORTS</span>
        <span className="crumb-sep">&gt;</span>
        <span className="crumb active">DESPATCH</span>
      </div>

      <div className="main">
        {/* Toggle Mode Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0, color: '#0f2942', fontSize: '1.25rem', fontWeight: 700 }}>
            🚢 Export Despatch Management
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn-toggle ${viewMode === 'entry' ? 'active' : ''}`}
              onClick={() => setShowAddModal(true)}
            >
              ➕ Add Despatch
            </button>
            <button
              type="button"
              className={`btn-toggle ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 Despatch List Grid ({rows.length})
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
            ADD BUTTON TYPE SELECTION POPUP MODAL
           ══════════════════════════════════════════════════════════════ */}
        {showAddModal && (
          <div className="print-modal-overlay">
            <div className="print-modal-card" style={{ maxWidth: 450, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: 10 }}>
                <h3 style={{ margin: 0, color: '#0f2942', fontSize: '1.05rem', fontWeight: 700 }}>
                  📦 Select Despatch Type
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
                >
                  ✖
                </button>
              </div>

              <div style={{ margin: '18px 0' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#334155', marginBottom: 10 }}>
                  Despatch Packing Category:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="modalPackingType"
                      value="Carton Box Packing"
                      checked={modalPackingType === 'Carton Box Packing'}
                      onChange={(e) => setModalPackingType(e.target.value)}
                    />
                    <span><strong>Carton Box Packing</strong> (Standard export box packing)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="modalPackingType"
                      value="Other Packing"
                      checked={modalPackingType === 'Other Packing'}
                      onChange={(e) => setModalPackingType(e.target.value)}
                    />
                    <span><strong>Other Packing</strong> (Polybag / Hanging / Loose)</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
                <button type="button" className="btn-outline sm" onClick={() => setShowAddModal(false)}>
                  Close
                </button>
                <button type="button" className="btn-primary sm" onClick={handleAddModalSubmit}>
                  Submit &amp; Proceed
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            MODE 1: ADD / EDIT DESPATCH ENTRY FORM
           ══════════════════════════════════════════════════════════════ */}
        {viewMode === 'entry' && (
          <div className="legacy-indent-card">
            <div className="legacy-card-header">
              <span className="legacy-title">📋 Despatch Entry Form</span>
              <span className="legacy-sub">Sales &amp; Shipment &gt; Exports &gt; Despatch Entry</span>
            </div>

            {entryErr && <div className="alert alert-error">{entryErr}</div>}
            {entryMsg && <div className="alert alert-success">{entryMsg}</div>}

            <form onSubmit={handleSave}>
              {/* Header Fields Section */}
              <div className="legacy-top-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                <div className="field">
                  <label>Despatch No <span className="req">*</span></label>
                  <input
                    type="text"
                    className="inp"
                    value={form.despatchNo}
                    onChange={(e) => setForm({ ...form, despatchNo: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Despatch Date <span className="req">*</span></label>
                  <input
                    type="date"
                    className="inp"
                    value={form.despatchDate}
                    onChange={(e) => setForm({ ...form, despatchDate: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Buyer / Customer <span className="req">*</span></label>
                  <BlueSelect
                    className="inp"
                    value={form.customer}
                    onChange={(e) => setForm({ ...form, customer: e.target.value })}
                  >
                    {BUYER_LIST.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </BlueSelect>
                </div>
                <div className="field">
                  <label>Job Order No <span className="req">*</span></label>
                  <BlueSelect
                    className="inp"
                    value={form.jobOrderNo}
                    onChange={(e) => setForm({ ...form, jobOrderNo: e.target.value })}
                  >
                    {JOB_ORDER_LIST.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </BlueSelect>
                </div>
              </div>

              {/* Main Fields Grid */}
              <div style={{ background: '#ffffff', padding: 14, borderRadius: 6, margin: '14px 0', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <div className="field">
                    <label>Supplier <span className="req">*</span></label>
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

                  <div className="field">
                    <label>Forwarder <span className="req">*</span></label>
                    <BlueSelect
                      className="inp"
                      value={form.forwarder}
                      onChange={(e) => setForm({ ...form, forwarder: e.target.value })}
                    >
                      {FORWARDER_LIST.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </BlueSelect>
                  </div>

                  <div className="field">
                    <label>Ship Mode <span className="req">*</span></label>
                    <BlueSelect
                      className="inp"
                      value={form.shipMode}
                      onChange={(e) => setForm({ ...form, shipMode: e.target.value })}
                    >
                      {SHIP_MODES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </BlueSelect>
                  </div>

                  <div className="field">
                    <label>Despatch Type <span className="req">*</span></label>
                    <BlueSelect
                      className="inp"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                      {TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </BlueSelect>
                  </div>

                  <div className="field">
                    <label>Invoice No</label>
                    <input
                      type="text"
                      className="inp"
                      placeholder="e.g. EXP-INV-9901"
                      value={form.invoiceNo}
                      onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Carton Box Packing <span className="req">*</span></label>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', height: 36 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.88rem' }}>
                        <input
                          type="radio"
                          name="formCartonPacking"
                          value="Yes"
                          checked={form.cartonPacking === 'Yes'}
                          onChange={(e) => setForm({ ...form, cartonPacking: e.target.value })}
                        />
                        <span>Yes</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.88rem' }}>
                        <input
                          type="radio"
                          name="formCartonPacking"
                          value="No"
                          checked={form.cartonPacking === 'No'}
                          onChange={(e) => setForm({ ...form, cartonPacking: e.target.value })}
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  <div className="field">
                    <label>Despatch Qty (Pcs) <span className="req">*</span></label>
                    <input
                      type="number"
                      className="inp"
                      placeholder="0"
                      value={form.despatchQty}
                      onChange={(e) => setForm({ ...form, despatchQty: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Total Value (₹) <span className="req">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      className="inp"
                      placeholder="0.00"
                      value={form.value}
                      onChange={(e) => setForm({ ...form, value: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Approval Status</label>
                    <BlueSelect
                      className="inp"
                      value={form.approval}
                      onChange={(e) => setForm({ ...form, approval: e.target.value })}
                    >
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                    </BlueSelect>
                  </div>

                  <div className="field" style={{ gridColumn: 'span 3' }}>
                    <label>Remarks / Shipment Notes</label>
                    <input
                      type="text"
                      className="inp"
                      placeholder="Enter despatch remarks or shipment instructions..."
                      value={form.remarks}
                      onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                <button type="button" className="btn-outline sm" onClick={() => setViewMode('list')}>
                  ✖ Cancel
                </button>
                <button type="submit" className="btn-primary sm">
                  💾 Save Despatch
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
                  🔍 Filter Despatch Records
                </div>
                <button
                  type="button"
                  className="btn-outline sm"
                  style={{ padding: '3px 10px', fontSize: '0.78rem' }}
                  onClick={() => {
                    setFilterBuyer('');
                    setFilterJobOrder('');
                    setFilterSupplier('');
                    setFilterType('');
                    setFilterInvoiceNo('');
                    setFilterApproval('Both');
                    setFilterCartonPacking('Both');
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
                  <label>Buyer</label>
                  <BlueSelect className="inp" value={filterBuyer} onChange={(e) => { setFilterBuyer(e.target.value); setPage(1); }}>
                    <option value="">-- All Buyers --</option>
                    {BUYER_LIST.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </BlueSelect>
                </div>

                <div className="field">
                  <label>Job Order No</label>
                  <BlueSelect className="inp" value={filterJobOrder} onChange={(e) => { setFilterJobOrder(e.target.value); setPage(1); }}>
                    <option value="">-- All Job Orders --</option>
                    {JOB_ORDER_LIST.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </BlueSelect>
                </div>

                <div className="field">
                  <label>Supplier</label>
                  <BlueSelect className="inp" value={filterSupplier} onChange={(e) => { setFilterSupplier(e.target.value); setPage(1); }}>
                    <option value="">-- All Suppliers --</option>
                    {SUPPLIER_LIST.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </BlueSelect>
                </div>

                <div className="field">
                  <label>Type</label>
                  <BlueSelect className="inp" value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}>
                    <option value="">-- All Types --</option>
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </BlueSelect>
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
                  <label>Approval</label>
                  <BlueSelect className="inp" value={filterApproval} onChange={(e) => { setFilterApproval(e.target.value); setPage(1); }}>
                    {APPROVAL_TYPES.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </BlueSelect>
                </div>

                <div className="field">
                  <label>Carton Box Packing</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', height: 32 }}>
                    {CARTON_PACKING_OPTIONS.map((opt) => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="cartonPackingRadio"
                          value={opt}
                          checked={filterCartonPacking === opt}
                          onChange={(e) => { setFilterCartonPacking(e.target.value); setPage(1); }}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
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
                  {DESPATCH_DOWNLOAD_TYPES.map((d) => (
                    <option key={d} value={d}>{d.toUpperCase()}</option>
                  ))}
                </BlueSelect>
                <button type="button" className="btn-secondary" onClick={handleExport}>
                  📥 Download
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn-primary sm" onClick={() => setShowAddModal(true)}>
                  ➕ Add Despatch
                </button>
                <button type="button" className="btn-outline sm" onClick={() => window.print()}>
                  🖨️ Print List
                </button>
                <button type="button" className="btn-outline sm" onClick={() => setViewMode('list')}>
                  👁️ View List
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
                        No Despatch records found matching criteria.
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
                  {DESPATCH_PER_PAGE_OPTIONS.map((opt) => (
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
                <h3>FRONTIER KNITTERS PRIVATE LIMITED</h3>
                <p>123 Cotton Mill Road, Tirupur - 641602 · GSTIN: 33AAAAA0000A1Z5</p>
                <hr />
                <h4 style={{ margin: '8px 0', textTransform: 'uppercase', color: '#0f2942' }}>
                  EXPORT DESPATCH NOTE VOUCHER
                </h4>
              </div>

              <div className="print-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '16px 0', fontSize: '0.9rem' }}>
                <div><strong>Despatch No:</strong> {printRecord.despatchNo}</div>
                <div><strong>Despatch Date:</strong> {printRecord.despatchDate}</div>
                <div><strong>Customer / Buyer:</strong> {printRecord.customer}</div>
                <div><strong>Job Order No:</strong> {printRecord.jobOrderNo}</div>
                <div><strong>Supplier:</strong> {printRecord.supplier}</div>
                <div><strong>Forwarder:</strong> {printRecord.forwarder}</div>
                <div><strong>Ship Mode:</strong> {printRecord.shipMode}</div>
                <div><strong>Invoice No:</strong> {printRecord.invoiceNo}</div>
                <div><strong>Despatch Qty:</strong> {printRecord.despatchQty} pcs</div>
                <div><strong>Carton Packing:</strong> {printRecord.cartonPacking}</div>
                <div style={{ gridColumn: 'span 2' }}>
                  <strong>Total Value:</strong> ₹ {Number(printRecord.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                  🖨️ Print Despatch Note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
