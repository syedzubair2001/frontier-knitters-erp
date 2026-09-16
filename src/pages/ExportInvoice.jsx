// Export Invoice Page — Exports & Shipment > Exports > Export Invoice
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../auth';
import Navbar from '../components/Navbar';
import {
  BUYER_LIST, FORWARDER_LIST, SHIP_MODES, ORDER_TYPES, INVOICE_TYPES,
  AGAINST_OPTIONS, ORDER_CAT_OPTIONS, CURRENCY_LIST, CONSIGNEE_LIST, DELIVERY_ADDRESSES,
  EXPORT_INVOICE_PER_PAGE, EXPORT_INVOICE_DOWNLOAD_TYPES, EXPORT_INVOICE_COLUMNS,
} from '../exportInvoiceConfig';
import { listExportInvoices, saveExportInvoice, deleteExportInvoice } from '../exportInvoiceService';

function generateExportInvNo() {
  const num = Math.floor(100 + Math.random() * 900);
  return `EXP-INV-2026-${num}`;
}

function makeBlankForm() {
  const today = new Date().toISOString().slice(0, 10);
  const cur = CURRENCY_LIST[0]; // USD default
  return {
    id: '',
    exportInvNo: generateExportInvNo(),
    date: today,
    against: 'Order',
    orderCat: 'Export',
    orderNo: 'ORD-2026-8801',
    packListNo: 'PK-9901',
    buyer: BUYER_LIST[0] || 'Nike Global Retail',
    mode: SHIP_MODES[0] || 'Air',
    currency: cur.code,
    exchangeRate: String(cur.defaultRate),
    factor: String(cur.factor),
    consignee: CONSIGNEE_LIST[0],
    delAddress: DELIVERY_ADDRESSES[0],
    country: 'USA',
    system: 'ERP-v2',
    invQty: '12500',
    invValue: '25000.00',
    invValueINR: '2087500.00',
    refNo: 'REF-9901',
    despatchQty: '12500',
    shipBillNo: 'SB-88201',
    shipBillDate: today,
    billNo: 'BL-9901',
    billDate: today,
    billRefNo: 'BREF-101',
    billRefDate: today,
    icDate: today,
    dbkClaimed: '25000.00',
    dbkReceived: '25000.00',
    epCopyStatus: 'Done',
    epCopyNo: 'EP-55101',
    epCopyDate: today,
    transporter: 'VRL Logistics',
    transInvNo: 'TR-4401',
    transInvDate: today,
    transInvAmount: '45000.00',
    invForwarder: 'DHL Express Global',
    forwarderInvNo: 'FWD-8821',
    forwarderInvDate: today,
    forwarderInvAmount: '68000.00',
    brcNo: 'BRC-77101',
    brcDate: today,
    vesselName: 'Ever Given v.102',
    etd: today,
    eta: today,
    preparedBy: 'Documentation Team',
    roslClaimed: '12500.00',
    roslReceived: '12500.00',
    meisClaimed: '18000.00',
    meisReceived: '18000.00',
    igstClaimed: '375000.00',
    igstReceived: '375000.00',
    status: 'Pending',
    items: [
      { id: 1, orderNo: 'ORD-2026-8801', date: today, jobOrderNo: 'JO-2026-8801', jobOrderDate: today, qty: '12500' }
    ]
  };
}

const PAGE_SIZE_DEFAULT = 10;

export default function ExportInvoice() {
  const nav = useNavigate();
  const [session, setSession] = useState(() => getSession() || { username: 'superadmin', role: 'Super Admin' });
  const [rows, setRows] = useState(() => listExportInvoices());

  // View mode: 'list' or 'entry'
  const [viewMode, setViewMode] = useState('list');

  // Sub-tabs at top of list view: 'Invoice' or 'Bank'
  const [activeSubTab, setActiveSubTab] = useState('Invoice');

  /* ── Form State ── */
  const [form, setForm] = useState(makeBlankForm);
  const [entryMsg, setEntryMsg] = useState('');
  const [entryErr, setEntryErr] = useState('');

  /* ── Filter state for List view ── */
  const [filterStatus, setFilterStatus]       = useState('All');
  const [filterOrderType, setFilterOrderType] = useState('');
  const [filterInvType, setFilterInvType]     = useState('');
  const [filterOrderNo, setFilterOrderNo]     = useState('');
  const [filterRefNo, setFilterRefNo]         = useState('');
  const [filterStyle, setFilterStyle]         = useState('');
  const [filterCustomer, setFilterCustomer]   = useState('');
  const [filterShipMode, setFilterShipMode]   = useState('');
  const [fromDate, setFromDate]               = useState('');
  const [toDate, setToDate]                   = useState('');

  /* ── List view toolbar & grid ── */
  const [downloadType, setDownloadType] = useState('csv');
  const [msg, setMsg]                   = useState('');
  const [colFilters, setColFilters]     = useState({});
  const [perPage, setPerPage]           = useState(PAGE_SIZE_DEFAULT);
  const [page, setPage]                 = useState(1);
  const [printRecord, setPrintRecord]   = useState(null);

  /* ── Dynamic Slick Grid state ── */
  const [gridCols, setGridCols]                 = useState(() => EXPORT_INVOICE_COLUMNS);
  const [draggedColIndex, setDraggedColIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex]     = useState(null);
  const [sortKey, setSortKey]                   = useState('exportInvNo');
  const [sortOrder, setSortOrder]               = useState('desc');

  /* ── Auth & seed records ── */
  useEffect(() => {
    const s = getSession();
    if (s) setSession(s);
    const records = listExportInvoices();
    setRows(records || []);
  }, [nav]);

  /* ── Auto calculate Inv Value INR on Currency/Ex.Rate change ── */
  const handleCurrencyChange = (cCode) => {
    const found = CURRENCY_LIST.find((c) => c.code === cCode) || CURRENCY_LIST[0];
    const qty = parseFloat(form.invQty || 0);
    const val = parseFloat(form.invValue || 0);
    const inrVal = (val * found.defaultRate).toFixed(2);
    setForm((prev) => ({
      ...prev,
      currency: found.code,
      exchangeRate: String(found.defaultRate),
      factor: String(found.factor),
      invValueINR: inrVal,
    }));
  };

  /* ── Add / Remove item in entry form ── */
  const handleAddItemRow = () => {
    const today = new Date().toISOString().slice(0, 10);
    const newItem = {
      id: Date.now(),
      orderNo: form.orderNo || 'ORD-2026-8801',
      date: today,
      jobOrderNo: 'JO-2026-880' + (form.items.length + 1),
      jobOrderDate: today,
      qty: '1000',
    };
    setForm((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleRemoveItemRow = (id) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((it) => it.id !== id) }));
  };

  /* ── List view filtering ── */
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterStatus !== 'All' && r.status !== filterStatus) return false;
      if (filterCustomer && r.buyer !== filterCustomer) return false;
      if (filterShipMode && r.mode !== filterShipMode) return false;
      if (filterOrderNo && !String(r.orderNo || '').toLowerCase().includes(filterOrderNo.toLowerCase())) return false;
      if (filterRefNo && !String(r.refNo || '').toLowerCase().includes(filterRefNo.toLowerCase())) return false;

      const recDate = r.date;
      if (fromDate && recDate && recDate < fromDate) return false;
      if (toDate && recDate && recDate > toDate) return false;

      return Object.entries(colFilters).every(([k, v]) => {
        if (!v) return true;
        const val = r[k];
        return String(val || '').toLowerCase().includes(v.toLowerCase());
      });
    });
  }, [rows, filterStatus, filterCustomer, filterShipMode, filterOrderNo, filterRefNo, fromDate, toDate, colFilters]);

  /* ── Dynamic Slick Grid Sorting ── */
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA = a[sortKey] ?? '';
      let valB = b[sortKey] ?? '';
      if (['invQty', 'invValue', 'invValueINR', 'despatchQty'].includes(sortKey)) {
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

  /* ── Form Submit ── */
  const handleSave = (e) => {
    e.preventDefault();
    setEntryErr('');
    if (!form.exportInvNo.trim()) { setEntryErr('Export Inv No is required.'); return; }
    if (!form.date) { setEntryErr('Invoice Date is required.'); return; }
    if (!form.buyer) { setEntryErr('Buyer / Customer is required.'); return; }
    if (!form.invValue || Number(form.invValue) <= 0) { setEntryErr('Valid Invoice Value is required.'); return; }

    const res = saveExportInvoice(form);
    if (res.ok) {
      setRows(listExportInvoices());
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
    if (!window.confirm(`Delete Export Invoice "${r.exportInvNo}"?`)) return;
    const res = deleteExportInvoice(r.id);
    setRows(listExportInvoices());
    setMsg(res.msg);
  };

  const handleExport = () => {
    if (downloadType === 'csv') {
      const head = ['S.No', 'Export Inv No', 'Date', 'Buyer', 'Country', 'Mode', 'Currency', 'Ex. Rate', 'Inv Qty', 'Inv Value', 'Inv Value (INR)', 'Order No', 'Ref No'];
      const lines = filtered.map((r, i) =>
        [
          i + 1,
          r.exportInvNo,
          r.date,
          r.buyer,
          r.country,
          r.mode,
          r.currency,
          r.exchangeRate,
          r.invQty,
          r.invValue,
          r.invValueINR,
          r.orderNo,
          r.refNo,
        ]
          .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
          .join(',')
      );
      const csv = [head.join(','), ...lines].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'export_invoices.csv';
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Exported to CSV ✅');
    } else {
      setMsg(`Export format ${downloadType.toUpperCase()} exported ✅`);
    }
  };

  const renderCellContent = (row, colKey, index) => {
    if (colKey === 'sno') return index + 1;
    if (colKey === 'exportInvNo') return <b>{row.exportInvNo}</b>;
    if (colKey === 'date') return row.date || '—';
    if (colKey === 'buyer') return row.buyer || '—';
    if (colKey === 'invValue') return `${row.currency || '$'} ${Number(row.invValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (colKey === 'invValueINR') return `₹ ${Number(row.invValueINR || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (colKey === 'action') {
      return (
        <div style={{ display: 'flex', gap: 4 }}>
          <button type="button" className="btn-icon" title="Print Export Invoice" onClick={() => setPrintRecord(row)}>🖨️</button>
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

  const selectedCur = CURRENCY_LIST.find((c) => c.code === form.currency) || CURRENCY_LIST[0];

  return (
    <div className="wrap">
      <Navbar session={session} />

      {/* Breadcrumb */}
      <div className="crumbbar">
        <span className="crumb">EXPORTS &amp; SHIPMENT</span>
        <span className="crumb-sep">&gt;</span>
        <span className="crumb">EXPORTS</span>
        <span className="crumb-sep">&gt;</span>
        <span className="crumb active">EXPORT INVOICE</span>
      </div>

      <div className="main">
        {/* Toggle Mode Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0, color: '#0f2942', fontSize: '1.25rem', fontWeight: 700 }}>
            📑 Export Invoice Management
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn-toggle ${viewMode === 'entry' ? 'active' : ''}`}
              onClick={openNewEntry}
            >
              ➕ Add Export Invoice
            </button>
            <button
              type="button"
              className={`btn-toggle ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 Export Invoice List ({rows.length})
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
            MODE 1: ADD / EDIT EXPORT INVOICE ENTRY FORM
           ══════════════════════════════════════════════════════════════ */}
        {viewMode === 'entry' && (
          <div className="legacy-indent-card">
            <div className="legacy-card-header">
              <span className="legacy-title">📋 Export Invoice Entry Form</span>
              <span className="legacy-sub">Exports &amp; Shipment &gt; Exports &gt; Export Invoice Entry</span>
            </div>

            {entryErr && <div className="alert alert-error">{entryErr}</div>}
            {entryMsg && <div className="alert alert-success">{entryMsg}</div>}

            <form onSubmit={handleSave}>
              {/* Header Fields Grid */}
              <div className="legacy-top-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                <div className="field">
                  <label>Export Inv No <span className="req">*</span></label>
                  <input
                    type="text"
                    className="inp"
                    value={form.exportInvNo}
                    onChange={(e) => setForm({ ...form, exportInvNo: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label>Invoice Date <span className="req">*</span></label>
                  <input
                    type="date"
                    className="inp"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label>Against <span className="req">*</span></label>
                  <select
                    className="inp"
                    value={form.against}
                    onChange={(e) => setForm({ ...form, against: e.target.value })}
                  >
                    {AGAINST_OPTIONS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Order Cat <span className="req">*</span></label>
                  <select
                    className="inp"
                    value={form.orderCat}
                    onChange={(e) => setForm({ ...form, orderCat: e.target.value })}
                  >
                    {ORDER_CAT_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Order No <span className="req">*</span></label>
                  <input
                    type="text"
                    className="inp"
                    placeholder="e.g. ORD-2026-8801"
                    value={form.orderNo}
                    onChange={(e) => setForm({ ...form, orderNo: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label>Pack List No</label>
                  <input
                    type="text"
                    className="inp"
                    placeholder="e.g. PK-9901"
                    value={form.packListNo}
                    onChange={(e) => setForm({ ...form, packListNo: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label>Customer / Buyer <span className="req">*</span></label>
                  <select
                    className="inp"
                    value={form.buyer}
                    onChange={(e) => setForm({ ...form, buyer: e.target.value })}
                  >
                    {BUYER_LIST.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Shipment Mode <span className="req">*</span></label>
                  <select
                    className="inp"
                    value={form.mode}
                    onChange={(e) => setForm({ ...form, mode: e.target.value })}
                  >
                    {SHIP_MODES.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Currency & Consignee Info Box */}
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 6, margin: '14px 0', border: '1px solid #cbd5e1' }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>💱 Currency &amp; Consignee Details</span>
                  <span className="req">*</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  <div className="field">
                    <label>Currency Dropdown <span className="req">*</span></label>
                    <select
                      className="inp"
                      value={form.currency}
                      onChange={(e) => handleCurrencyChange(e.target.value)}
                    >
                      {CURRENCY_LIST.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Curr Symbol / Ex. Rate <span className="req">*</span></label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ padding: '6px 10px', background: '#e2e8f0', borderRadius: 6, fontSize: '0.85rem', fontWeight: 700 }}>
                        {selectedCur.symbol}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        className="inp"
                        value={form.exchangeRate}
                        onChange={(e) => setForm({ ...form, exchangeRate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Factor (* Factor is *) <span className="req">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      className="inp"
                      value={form.factor}
                      onChange={(e) => setForm({ ...form, factor: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Consignee <span className="req">*</span></label>
                    <select
                      className="inp"
                      value={form.consignee}
                      onChange={(e) => setForm({ ...form, consignee: e.target.value })}
                    >
                      {CONSIGNEE_LIST.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field" style={{ gridColumn: 'span 4' }}>
                    <label>Delivery Address</label>
                    <select
                      className="inp"
                      value={form.delAddress}
                      onChange={(e) => setForm({ ...form, delAddress: e.target.value })}
                    >
                      {DELIVERY_ADDRESSES.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Items Table inside Form */}
              <div style={{ background: '#ffffff', padding: 14, borderRadius: 6, marginBottom: 14, border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>
                    📦 Export Invoice Line Items
                  </span>
                  <button type="button" className="btn-outline sm" onClick={handleAddItemRow}>
                    ➕ Add Item Row
                  </button>
                </div>

                <div className="tbl-wrap">
                  <table className="tbl slick">
                    <thead>
                      <tr>
                        <th style={{ width: 60 }}>S.No</th>
                        <th>Order No</th>
                        <th>Date</th>
                        <th>Job Order No</th>
                        <th>Job Order Date</th>
                        <th>Qty</th>
                        <th style={{ width: 80 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((it, idx) => (
                        <tr key={it.id || idx}>
                          <td>{idx + 1}</td>
                          <td>
                            <input
                              type="text"
                              className="inp"
                              style={{ padding: '4px 6px', fontSize: '0.8rem' }}
                              value={it.orderNo}
                              onChange={(e) => {
                                const newItems = [...form.items];
                                newItems[idx].orderNo = e.target.value;
                                setForm({ ...form, items: newItems });
                              }}
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              className="inp"
                              style={{ padding: '4px 6px', fontSize: '0.8rem' }}
                              value={it.date}
                              onChange={(e) => {
                                const newItems = [...form.items];
                                newItems[idx].date = e.target.value;
                                setForm({ ...form, items: newItems });
                              }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="inp"
                              style={{ padding: '4px 6px', fontSize: '0.8rem' }}
                              value={it.jobOrderNo}
                              onChange={(e) => {
                                const newItems = [...form.items];
                                newItems[idx].jobOrderNo = e.target.value;
                                setForm({ ...form, items: newItems });
                              }}
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              className="inp"
                              style={{ padding: '4px 6px', fontSize: '0.8rem' }}
                              value={it.jobOrderDate}
                              onChange={(e) => {
                                const newItems = [...form.items];
                                newItems[idx].jobOrderDate = e.target.value;
                                setForm({ ...form, items: newItems });
                              }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="inp"
                              style={{ padding: '4px 6px', fontSize: '0.8rem' }}
                              value={it.qty}
                              onChange={(e) => {
                                const newItems = [...form.items];
                                newItems[idx].qty = e.target.value;
                                setForm({ ...form, items: newItems });
                              }}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-icon danger"
                              disabled={form.items.length <= 1}
                              onClick={() => handleRemoveItemRow(it.id)}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Invoice Value & Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div className="field">
                  <label>Total Inv Qty <span className="req">*</span></label>
                  <input
                    type="number"
                    className="inp"
                    value={form.invQty}
                    onChange={(e) => setForm({ ...form, invQty: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label>Inv Value ({form.currency}) <span className="req">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    className="inp"
                    value={form.invValue}
                    onChange={(e) => {
                      const v = e.target.value;
                      const ex = parseFloat(form.exchangeRate || 1);
                      setForm({
                        ...form,
                        invValue: v,
                        invValueINR: (parseFloat(v || 0) * ex).toFixed(2),
                      });
                    }}
                  />
                </div>

                <div className="field">
                  <label>Inv Value in INR (Auto)</label>
                  <input
                    type="text"
                    className="inp"
                    disabled
                    value={`₹ ${form.invValueINR}`}
                    style={{ background: '#e2e8f0', color: '#334155', fontWeight: 600 }}
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                <button type="button" className="btn-outline sm" onClick={() => setViewMode('list')}>
                  ✖ Cancel
                </button>
                <button type="submit" className="btn-primary sm">
                  💾 Save Export Invoice
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            MODE 2: DYNAMIC SLICK GRID LIST VIEW WITH SUB-TABS & BOTTOM ACTIONS
           ══════════════════════════════════════════════════════════════ */}
        {viewMode === 'list' && (
          <div className="card-page">
            {/* Header Sub-Tabs: Invoice vs Bank */}
            <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid #cbd5e1', marginBottom: 14 }}>
              <button
                type="button"
                style={{
                  padding: '8px 20px',
                  border: 'none',
                  borderBottom: activeSubTab === 'Invoice' ? '3px solid #0f2942' : 'none',
                  background: 'transparent',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: activeSubTab === 'Invoice' ? '#0f2942' : '#64748b',
                  cursor: 'pointer',
                }}
                onClick={() => setActiveSubTab('Invoice')}
              >
                📑 Invoice View
              </button>
              <button
                type="button"
                style={{
                  padding: '8px 20px',
                  border: 'none',
                  borderBottom: activeSubTab === 'Bank' ? '3px solid #0f2942' : 'none',
                  background: 'transparent',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: activeSubTab === 'Bank' ? '#0f2942' : '#64748b',
                  cursor: 'pointer',
                }}
                onClick={() => setActiveSubTab('Bank')}
              >
                🏦 Bank &amp; Realization View
              </button>
            </div>

            {/* Top Filter Panel */}
            <div className="filter-panel" style={{ background: '#f8fafc', padding: 16, borderRadius: 6, marginBottom: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
                  🔍 Filter Export Invoices
                </div>
                <button
                  type="button"
                  className="btn-outline sm"
                  style={{ padding: '3px 10px', fontSize: '0.78rem' }}
                  onClick={() => {
                    setFilterStatus('All');
                    setFilterOrderType('');
                    setFilterInvType('');
                    setFilterOrderNo('');
                    setFilterRefNo('');
                    setFilterStyle('');
                    setFilterCustomer('');
                    setFilterShipMode('');
                    setFromDate('');
                    setToDate('');
                    setColFilters({});
                    setPage(1);
                  }}
                >
                  🔄 Reset Filters
                </button>
              </div>

              {/* Status Radio Pills */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Status:</span>
                {['All', 'Pending', 'Done', 'Amend'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    style={{
                      padding: '4px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: 16,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: filterStatus === st ? '#0f2942' : '#ffffff',
                      color: filterStatus === st ? '#ffffff' : '#334155',
                    }}
                    onClick={() => { setFilterStatus(st); setPage(1); }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                <div className="field">
                  <label>Order Type</label>
                  <select className="inp" value={filterOrderType} onChange={(e) => { setFilterOrderType(e.target.value); setPage(1); }}>
                    <option value="">-- All Order Types --</option>
                    {ORDER_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Invoice Type</label>
                  <select className="inp" value={filterInvType} onChange={(e) => { setFilterInvType(e.target.value); setPage(1); }}>
                    <option value="">-- All Inv Types --</option>
                    {INVOICE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Order No</label>
                  <input
                    type="text"
                    className="inp"
                    placeholder="Search Order No..."
                    value={filterOrderNo}
                    onChange={(e) => { setFilterOrderNo(e.target.value); setPage(1); }}
                  />
                </div>

                <div className="field">
                  <label>Ref No</label>
                  <input
                    type="text"
                    className="inp"
                    placeholder="Search Ref No..."
                    value={filterRefNo}
                    onChange={(e) => { setFilterRefNo(e.target.value); setPage(1); }}
                  />
                </div>

                <div className="field">
                  <label>Customer</label>
                  <select className="inp" value={filterCustomer} onChange={(e) => { setFilterCustomer(e.target.value); setPage(1); }}>
                    <option value="">-- All Customers --</option>
                    {BUYER_LIST.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Shipment Mode</label>
                  <select className="inp" value={filterShipMode} onChange={(e) => { setFilterShipMode(e.target.value); setPage(1); }}>
                    <option value="">-- All Modes --</option>
                    {SHIP_MODES.map((m) => (
                      <option key={m} value={m}>{m}</option>
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
                  {EXPORT_INVOICE_DOWNLOAD_TYPES.map((d) => (
                    <option key={d} value={d}>{d.toUpperCase()}</option>
                  ))}
                </select>
                <button type="button" className="btn-secondary" onClick={handleExport}>
                  📥 Download
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn-primary sm" onClick={openNewEntry}>
                  ➕ Add Export Invoice
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
              <table className="tbl slick" style={{ minWidth: 5200 }}>
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
                        No Export Invoice records found matching criteria.
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
            <div className="pager" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Per Page:</span>
                <select className="inp inline-select" value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
                  {EXPORT_INVOICE_PER_PAGE.map((opt) => (
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

            {/* Downside Action Buttons Bar */}
            <div style={{ background: '#f1f5f9', padding: 12, borderRadius: 6, marginTop: 16, border: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                ⚡ Quick Export Actions:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Attach', 'Despatch', 'Ship', 'Claim', 'Realize', 'DBK Sup', 'EPCopy', 'EPCG', 'T.Inv', 'F.Inv'].map((btnLabel) => (
                  <button
                    key={btnLabel}
                    type="button"
                    className="btn-outline sm"
                    style={{ fontSize: '0.8rem', padding: '4px 12px' }}
                    onClick={() => setMsg(`Action "${btnLabel}" triggered successfully! ✅`)}
                  >
                    {btnLabel}
                  </button>
                ))}
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
                  EXPORT INVOICE VOUCHER
                </h4>
              </div>

              <div className="print-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '16px 0', fontSize: '0.9rem' }}>
                <div><strong>Export Inv No:</strong> {printRecord.exportInvNo}</div>
                <div><strong>Date:</strong> {printRecord.date}</div>
                <div><strong>Buyer / Customer:</strong> {printRecord.buyer}</div>
                <div><strong>Destination Country:</strong> {printRecord.country}</div>
                <div><strong>Shipment Mode:</strong> {printRecord.mode}</div>
                <div><strong>Order No:</strong> {printRecord.orderNo}</div>
                <div><strong>Currency / Ex.Rate:</strong> {printRecord.currency} ({printRecord.exchangeRate})</div>
                <div><strong>Inv Qty:</strong> {printRecord.invQty}</div>
                <div style={{ gridColumn: 'span 2' }}>
                  <strong>Inv Value ({printRecord.currency}):</strong> {printRecord.currency} {Number(printRecord.invValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <strong>Inv Value in INR:</strong> ₹ {Number(printRecord.invValueINR || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div><strong>Consignee:</strong> {printRecord.consignee}</div>
                <div><strong>Del Address:</strong> {printRecord.delAddress}</div>
              </div>

              <div className="print-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                <button type="button" className="btn-outline" onClick={() => setPrintRecord(null)}>
                  Close
                </button>
                <button type="button" className="btn-primary" onClick={() => window.print()}>
                  🖨️ Print Export Invoice
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
