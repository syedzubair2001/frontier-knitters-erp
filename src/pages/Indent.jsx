// Indent screen — Purchase & Stores > Store > Indent
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../auth';
import Navbar from '../components/Navbar';
import {
  INDENT_TYPES, INDENT_APPROVAL, INDENT_UNITS, INDENT_BY_OPTIONS,
  ITEM_GROUPS, PRODUCT_TYPES, PRODUCT_CATALOG, REASON_OPTIONS, ORDER_NO_LIST,
  INDENT_PER_PAGE_OPTIONS, INDENT_DOWNLOAD_TYPES, INDENT_COLUMNS, INDENT_STORES,
} from '../indentConfig';
import { listIndents, saveIndent, deleteIndent } from '../indentService';
import { loadOrderLookup } from '../requisitionService';
import BlueSelect from '../components/BlueSelect';

function generateIndentNo() {
  const num = Math.floor(100 + Math.random() * 900);
  return `FKS/IND00${num}`;
}

function makeBlankIndentForm() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: '',
    indentNo: generateIndentNo(),
    indentDate: today,
    refNo: '',
    unit: INDENT_UNITS[0],
    type: 'Open',
    orderNo: ORDER_NO_LIST[0],
    reqDt: today,
    indentBy: INDENT_BY_OPTIONS[0],
    itemGroup: ITEM_GROUPS[0],
    approved: false,
    items: [],
  };
}

function makeBlankItemInput() {
  const today = new Date().toISOString().slice(0, 10);
  const firstProd = PRODUCT_CATALOG[0];
  return {
    productType: firstProd.type,
    productNo: firstProd.code,
    productName: firstProd.name,
    uom: firstProd.uom,
    store: INDENT_STORES[0],
    reqQty: '',
    reqDate: today,
    remarks: '',
    reason: REASON_OPTIONS[0],
  };
}

const PAGE_SIZE_DEFAULT = 10;

export default function Indent() {
  const nav = useNavigate();
  const [session, setSession] = useState(null);
  const [rows, setRows] = useState(() => listIndents());
  const orders = useMemo(() => loadOrderLookup(), []);

  // View state: 'entry' (Entry Screen as in screenshot) or 'list' (List Grid View)
  const [viewMode, setViewMode] = useState('entry');

  /* ── Indent Entry Form state ── */
  const [form, setForm] = useState(makeBlankIndentForm);
  const [itemInput, setItemInput] = useState(makeBlankItemInput);
  const [entryMsg, setEntryMsg] = useState('');
  const [entryErr, setEntryErr] = useState('');

  /* ── Filter state for List view ── */
  const [filterType, setFilterType] = useState('');
  const [filterOrder, setFilterOrder] = useState('');
  const [filterOrderNo, setFilterOrderNo] = useState('');
  const [filterIndentBy, setFilterIndentBy] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [approval, setApproval] = useState('Both');

  /* ── List view toolbar & grid ── */
  const [downloadType, setDownloadType] = useState('csv');
  const [msg, setMsg]                   = useState('');
  const [colFilters, setColFilters]     = useState({});
  const [perPage, setPerPage]           = useState(PAGE_SIZE_DEFAULT);
  const [page, setPage]                 = useState(1);
  const [printRecord, setPrintRecord]   = useState(null);

  /* ── Dynamic Slick Grid state ── */
  const [gridCols, setGridCols]                 = useState(() => INDENT_COLUMNS);
  const [draggedColIndex, setDraggedColIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex]     = useState(null);
  const [sortKey, setSortKey]                   = useState('indentNo');
  const [sortOrder, setSortOrder]               = useState('asc');

  /* ── Auth guard ── */
  useEffect(() => {
    const s = getSession();
    if (!s || !s.username || !s.role) { logout(); nav('/login'); return; }
    setSession(s);
  }, [nav]);

  /* ── List view filtering ── */
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterType && r.type !== filterType) return false;
      if (filterOrder && r.orderNo !== filterOrder) return false;
      if (filterOrderNo && !String(r.orderNo || '').toLowerCase().includes(filterOrderNo.toLowerCase())) return false;
      if (filterIndentBy && !String(r.indentBy || '').toLowerCase().includes(filterIndentBy.toLowerCase())) return false;
      if (fromDate && r.date && r.date < fromDate) return false;
      if (toDate && r.date && r.date > toDate) return false;
      if (approval === 'Approved' && !r.approved) return false;
      if (approval === 'Pending' && r.approved) return false;
      return Object.entries(colFilters).every(([k, v]) => !v || String(r[k] ?? '').toLowerCase().includes(v.toLowerCase()));
    });
  }, [rows, filterType, filterOrder, filterOrderNo, filterIndentBy, fromDate, toDate, approval, colFilters]);

  /* ── Dynamic Slick Grid Sorting & Formatting ── */
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA = a[sortKey] ?? '';
      let valB = b[sortKey] ?? '';
      if (sortKey === 'approved') {
        valA = a.approved ? 'Approved' : 'Pending';
        valB = b.approved ? 'Approved' : 'Pending';
      }
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortOrder]);

  if (!session) {
    return <div style={{ color: '#627d98', padding: 40, fontFamily: 'Segoe UI,Arial' }}>Loading… please wait</div>;
  }

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

  /* ── Item Input Handlers ── */
  const handleProductNoChange = (code) => {
    const prod = PRODUCT_CATALOG.find((p) => p.code === code);
    if (prod) {
      setItemInput((prev) => ({
        ...prev,
        productNo: prod.code,
        productName: prod.name,
        productType: prod.type,
        uom: prod.uom,
      }));
    } else {
      setItemInput((prev) => ({ ...prev, productNo: code }));
    }
  };

  const addItemToGrid = () => {
    setEntryErr('');
    if (!itemInput.productNo) { setEntryErr('Please select a Product No.'); return; }
    if (!itemInput.reqQty || Number(itemInput.reqQty) <= 0) { setEntryErr('Please enter a valid Request Qty.'); return; }

    const newItem = {
      id: Date.now().toString(),
      productType: itemInput.productType,
      productNo: itemInput.productNo,
      productName: itemInput.productName,
      reqDate: itemInput.reqDate,
      reqQty: Number(itemInput.reqQty),
      uom: itemInput.uom,
      store: itemInput.store,
      remarks: itemInput.remarks,
      reason: itemInput.reason,
    };

    setForm((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    // Reset item input
    setItemInput(makeBlankItemInput());
    setEntryMsg('Item added to grid ✅');
    setTimeout(() => setEntryMsg(''), 2500);
  };

  const removeItemFromGrid = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const clearItemInput = () => {
    setItemInput(makeBlankItemInput());
  };

  /* ── Save Complete Indent ── */
  const handleSaveIndent = () => {
    setEntryErr('');
    if (!form.indentNo.trim()) { setEntryErr('Indent No is required.'); return; }
    if (!form.indentDate) { setEntryErr('Indent Date is required.'); return; }
    if (!form.unit) { setEntryErr('Unit is required.'); return; }
    if (!form.type) { setEntryErr('Type is required.'); return; }
    if (!form.indentBy) { setEntryErr('Indent By is required.'); return; }
    if (!form.items.length) { setEntryErr('Please add at least 1 item to the grid before saving.'); return; }

    const recordToSave = {
      ...form,
      date: form.indentDate, // Map for list compatibility
      id: form.id || '',
    };

    const res = saveIndent(recordToSave);
    if (res.ok) {
      setRows(listIndents());
      setMsg(res.msg);
      // Reset form and show list view or stay ready
      setForm(makeBlankIndentForm());
      setItemInput(makeBlankItemInput());
      setViewMode('list');
    } else {
      setEntryErr(res.msg);
    }
  };

  const pages    = Math.max(1, Math.ceil(sorted.length / perPage));
  const safePage = Math.min(page, pages);
  const paged    = sorted.slice((safePage - 1) * perPage, safePage * perPage);

  const renderCellContent = (row, colKey) => {
    if (colKey === 'indentNo') return <b>{row.indentNo}</b>;
    if (colKey === 'date') return row.date || row.indentDate || '—';
    if (colKey === 'type') {
      return (
        <span className={`indent-type-badge indent-type-${(row.type || '').toLowerCase()}`}>
          {row.type}
        </span>
      );
    }
    if (colKey === 'approved') {
      return (
        <span className={`indent-status ${row.approved ? 'approved' : 'pending'}`}>
          {row.approved ? '✅ Approved' : '⏳ Pending'}
        </span>
      );
    }
    if (colKey === 'action') {
      return (
        <div style={{ display: 'flex', gap: 4 }}>
          <button type="button" className="btn-icon" title="Print Indent" onClick={() => handlePrintRow(row)}>🖨️</button>
          <button type="button" className="btn-icon" title="Edit Indent" onClick={() => openEditEntry(row)}>✏️</button>
          <button type="button" className="btn-icon danger" title="Delete Indent" onClick={() => handleDelete(row)}>🗑️</button>
        </div>
      );
    }
    return row[colKey] || '—';
  };

  const openNewEntry = () => {
    setForm(makeBlankIndentForm());
    setItemInput(makeBlankItemInput());
    setEntryErr('');
    setEntryMsg('');
    setViewMode('entry');
  };

  const openEditEntry = (r) => {
    setForm({
      ...r,
      indentDate: r.date || r.indentDate || '',
      items: Array.isArray(r.items) ? r.items : [],
    });
    setItemInput(makeBlankItemInput());
    setEntryErr('');
    setEntryMsg('');
    setViewMode('entry');
  };

  const handlePrintRow = (r) => {
    setPrintRecord(r);
  };

  const handleDelete = (r) => {
    if (!window.confirm(`Delete indent "${r.indentNo}"?`)) return;
    const res = deleteIndent(r.id);
    setRows(listIndents());
    setMsg(res.msg);
  };

  const handleExport = () => {
    if (downloadType === 'csv') {
      const head = ['S.No', 'Indent No', 'Date', 'Ref No', 'Unit', 'Type', 'Order No', 'Indent By', 'Status'];
      const lines = filtered.map((r, i) =>
        [i + 1, r.indentNo, r.date, r.refNo, r.unit, r.type, r.orderNo, r.indentBy, r.approved ? 'Approved' : 'Pending']
          .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
      );
      const csv = [head.join(','), ...lines].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'indents.csv'; a.click();
      URL.revokeObjectURL(url);
      setMsg('Exported to CSV ✅');
    } else {
      setMsg(`Export to ${downloadType.toUpperCase()} — available with backend API.`);
    }
  };

  const setCol = (key, val) => { setColFilters((f) => ({ ...f, [key]: val })); setPage(1); };

  return (
    <div className="wrap">
      <Navbar session={session} />

      {/* Breadcrumb */}
      <div className="crumbbar">
        <span className="crumb">PURCHASE &amp; STORES</span>
        <span className="crumb-sep">&gt;</span>
        <span className="crumb">STORE</span>
        <span className="crumb-sep">&gt;</span>
        <span className="crumb on">INDENT</span>
        <div className="crumb-right">
          <button className="btn-outline sm" onClick={() => nav('/dashboard')}>📊 Dashboard</button>
        </div>
      </div>

      <div className="erp-body">
        <main className="erp-main">

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* 1. INDENT ENTRY SCREEN (MATCHES LEGACY SCREENSHOT EXACTLY)        */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {viewMode === 'entry' && (
            <div className="legacy-indent-card">
              {/* Header bar */}
              <div className="legacy-card-head">
                <div style={{ width: 60 }}></div>
                <h3>Indent</h3>
                <button type="button" className="list-btn" onClick={() => setViewMode('list')}>
                  📋 LIST
                </button>
              </div>

              {/* Panel 1: Top Yellowish Header Bar */}
              <div className="legacy-top-bar">
                <div className="inline-field">
                  <label>Indent No</label>
                  <input
                    type="text"
                    style={{ width: 140, fontWeight: 700 }}
                    value={form.indentNo}
                    onChange={(e) => setForm({ ...form, indentNo: e.target.value })}
                  />
                </div>

                <div className="inline-field">
                  <label>Indent Dt</label>
                  <input
                    type="date"
                    style={{ width: 130 }}
                    value={form.indentDate}
                    onChange={(e) => setForm({ ...form, indentDate: e.target.value })}
                  />
                </div>

                <div className="inline-field">
                  <label>Ref No</label>
                  <input
                    type="text"
                    style={{ width: 150 }}
                    value={form.refNo}
                    onChange={(e) => setForm({ ...form, refNo: e.target.value })}
                  />
                </div>

                <div className="inline-field">
                  <label>Unit</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <BlueSelect
                      style={{ width: 160 }}
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    >
                      {INDENT_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </BlueSelect>
                    <button type="button" className="btn-outline sm" style={{ padding: '2px 6px', fontSize: 12 }}>+</button>
                  </div>
                </div>
              </div>

              {/* Panel 2: Middle Form Fields */}
              <div className="legacy-mid-form">
                <div className="legacy-mid-grid">
                  <div className="legacy-field">
                    <label><span className="req-star">*</span> Type</label>
                    <BlueSelect value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                      {INDENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </BlueSelect>
                  </div>

                  <div className="legacy-field">
                    <label><span className="req-star">*</span> Order No</label>
                    <BlueSelect value={form.orderNo} onChange={(e) => setForm({ ...form, orderNo: e.target.value })}>
                      {ORDER_NO_LIST.map((o) => <option key={o} value={o}>{o}</option>)}
                      {orders.map((o) => <option key={o.orderNo} value={o.orderNo}>{o.orderNo} · {o.customer}</option>)}
                    </BlueSelect>
                  </div>

                  <div className="legacy-field">
                    <label><span className="req-star">*</span> Req Dt</label>
                    <input
                      type="date"
                      value={form.reqDt}
                      onChange={(e) => setForm({ ...form, reqDt: e.target.value })}
                    />
                  </div>

                  <div className="legacy-field">
                    <label><span className="req-star">*</span> Indent By</label>
                    <BlueSelect value={form.indentBy} onChange={(e) => setForm({ ...form, indentBy: e.target.value })}>
                      {INDENT_BY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </BlueSelect>
                  </div>

                  <div className="legacy-field">
                    <label>Item Group</label>
                    <BlueSelect value={form.itemGroup} onChange={(e) => setForm({ ...form, itemGroup: e.target.value })}>
                      {ITEM_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </BlueSelect>
                  </div>
                </div>
              </div>

              {/* Panel 3: Single Item Entry Row */}
              <div className="legacy-item-box">
                <div className="legacy-item-inputs">
                  <div className="legacy-item-col">
                    <label>Product Type</label>
                    <BlueSelect
                      value={itemInput.productType}
                      onChange={(e) => setItemInput({ ...itemInput, productType: e.target.value })}
                    >
                      {PRODUCT_TYPES.map((pt) => <option key={pt} value={pt}>{pt}</option>)}
                    </BlueSelect>
                  </div>

                  <div className="legacy-item-col" style={{ gridColumn: 'span 2' }}>
                    <label>Product No / Product Name</label>
                    <BlueSelect
                      value={itemInput.productNo}
                      onChange={(e) => handleProductNoChange(e.target.value)}
                    >
                      {PRODUCT_CATALOG.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.code} - {p.name}
                        </option>
                      ))}
                    </BlueSelect>
                  </div>

                  <div className="legacy-item-col">
                    <label>Uom</label>
                    <input type="text" readOnly value={itemInput.uom} style={{ background: '#f1f5f9' }} />
                  </div>

                  <div className="legacy-item-col">
                    <label>Store</label>
                    <BlueSelect
                      value={itemInput.store}
                      onChange={(e) => setItemInput({ ...itemInput, store: e.target.value })}
                    >
                      {INDENT_STORES.map((st) => <option key={st} value={st}>{st}</option>)}
                    </BlueSelect>
                  </div>

                  <div className="legacy-item-col">
                    <label>Req Qty</label>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={itemInput.reqQty}
                      onChange={(e) => setItemInput({ ...itemInput, reqQty: e.target.value })}
                    />
                  </div>

                  <div className="legacy-item-col">
                    <label>Req Date</label>
                    <input
                      type="date"
                      value={itemInput.reqDate}
                      onChange={(e) => setItemInput({ ...itemInput, reqDate: e.target.value })}
                    />
                  </div>

                  <div className="legacy-item-col">
                    <label>Remarks</label>
                    <input
                      type="text"
                      placeholder="Remarks"
                      value={itemInput.remarks}
                      onChange={(e) => setItemInput({ ...itemInput, remarks: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: '#4a5568' }}>Reason:</span>
                    <BlueSelect
                      style={{ fontSize: 11.5, padding: '3px 8px', border: '1px solid #b8c7d9', borderRadius: 2 }}
                      value={itemInput.reason}
                      onChange={(e) => setItemInput({ ...itemInput, reason: e.target.value })}
                    >
                      {REASON_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </BlueSelect>
                  </div>

                  <div className="legacy-item-btns">
                    <button type="button" className="btn-legacy-add" onClick={addItemToGrid}>
                      Add
                    </button>
                    <button type="button" className="btn-legacy-clear" onClick={clearItemInput}>
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {entryErr && <p className="msg err" style={{ margin: '0 14px 10px 14px' }}>{entryErr}</p>}
              {entryMsg && <p className="msg ok" style={{ margin: '0 14px 10px 14px' }}>{entryMsg}</p>}

              {/* Panel 4: Items Table */}
              <div className="legacy-items-tblwrap">
                <table className="legacy-tbl">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>Sno</th>
                      <th>Product Type</th>
                      <th>Product No</th>
                      <th>Product Name</th>
                      <th>Store</th>
                      <th>Req Date</th>
                      <th>Req Qty</th>
                      <th>Uom</th>
                      <th>Remarks</th>
                      <th>Reason</th>
                      <th style={{ width: 70 }}>Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((it, idx) => (
                      <tr key={it.id || idx}>
                        <td>{idx + 1}</td>
                        <td>{it.productType}</td>
                        <td><b>{it.productNo}</b></td>
                        <td style={{ textAlign: 'left' }}>{it.productName}</td>
                        <td>{it.store || '—'}</td>
                        <td>{it.reqDate}</td>
                        <td><b>{it.reqQty}</b></td>
                        <td>{it.uom}</td>
                        <td style={{ textAlign: 'left' }}>{it.remarks || '—'}</td>
                        <td style={{ textAlign: 'left' }}>{it.reason || '—'}</td>
                        <td>
                          <button
                            type="button"
                            className="del"
                            title="Remove item"
                            onClick={() => removeItemFromGrid(idx)}
                          >🗑️</button>
                        </td>
                      </tr>
                    ))}
                    {!form.items.length && (
                      <tr>
                        <td colSpan={11} className="empty-td">
                          No data to display
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Panel 5: Bottom Right Save Button */}
              <div className="legacy-foot-bar">
                <button type="button" className="btn-legacy-save" onClick={handleSaveIndent}>
                  Save
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* 2. INDENT LIST / SLICK GRID SCREEN                                */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {viewMode === 'list' && (
            <>
              {/* ═══ FILTER PANEL ═══ */}
              <div className="fpanel">
                <div className="fpanel-title">🔍 Search / Filter</div>
                <div className="fpanel-row">

                  <div className="field">
                    <label>Type</label>
                    <BlueSelect value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}>
                      <option value="">— All —</option>
                      {INDENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </BlueSelect>
                  </div>

                  <div className="field">
                    <label>Order</label>
                    <BlueSelect value={filterOrder} onChange={(e) => { setFilterOrder(e.target.value); setPage(1); }}>
                      <option value="">— All —</option>
                      {orders.map((o) => <option key={o.orderNo} value={o.orderNo}>{o.orderNo} · {o.customer}</option>)}
                    </BlueSelect>
                  </div>

                  <div className="field">
                    <label>Order No</label>
                    <input
                      value={filterOrderNo}
                      placeholder="Type order no…"
                      onChange={(e) => { setFilterOrderNo(e.target.value); setPage(1); }}
                    />
                  </div>

                  <div className="field">
                    <label>Indent By</label>
                    <BlueSelect value={filterIndentBy} onChange={(e) => { setFilterIndentBy(e.target.value); setPage(1); }}>
                      <option value="">— All —</option>
                      {INDENT_BY_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </BlueSelect>
                  </div>

                  <div className="field">
                    <label>From Date</label>
                    <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} />
                  </div>

                  <div className="field">
                    <label>To Date</label>
                    <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} />
                  </div>

                  <div className="field">
                    <label>Approval</label>
                    <BlueSelect value={approval} onChange={(e) => { setApproval(e.target.value); setPage(1); }}>
                      {INDENT_APPROVAL.map((a) => <option key={a} value={a}>{a}</option>)}
                    </BlueSelect>
                  </div>

                </div>
              </div>

              {/* ═══ TOOLBAR ═══ */}
              <div className="toolbar indent-toolbar">
                <div className="toolbar-left">
                  <span className="icon-btn" title="Download">⬇️</span>
                  <BlueSelect className="dsel" value={downloadType} onChange={(e) => setDownloadType(e.target.value)}>
                    {INDENT_DOWNLOAD_TYPES.map((d) => <option key={d} value={d}>{d.toUpperCase()}</option>)}
                  </BlueSelect>
                  <button className="btn-outline sm" onClick={handleExport}>⬇️ Download</button>
                </div>
                <div className="toolbar-right">
                  <button className="btn-primary sm" id="indent-add-btn" onClick={openNewEntry}>➕ Add</button>
                  <button className="btn-outline sm" onClick={() => window.print()}>🖨️ Print</button>
                  <button className="btn-outline sm" onClick={() => setViewMode('entry')}>👁️ View Entry</button>
                </div>
                {msg && <span className="msg ok">{msg}</span>}
              </div>

              {/* ═══ DYNAMIC SLICK GRID TABLE ═══ */}
              <div className="tblbox">
                <div className="tblhead">
                  <h3>
                    📋 Indent List
                    <span className="count">{sorted.length} records</span>
                    {(fromDate || toDate) && (
                      <span className="count" style={{ background: '#fff3cd', color: '#856404', marginLeft: 6 }}>
                        {fromDate && `From: ${fromDate}`}{fromDate && toDate && ' — '}{toDate && `To: ${toDate}`}
                      </span>
                    )}
                  </h3>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#627d98' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      Rows per page:
                      <BlueSelect
                        className="dsel"
                        style={{ padding: '4px 8px', fontSize: 12 }}
                        value={perPage}
                        onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                      >
                        {INDENT_PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                      </BlueSelect>
                    </label>
                  </div>
                </div>

                <table className="tbl slick">
                  <thead>
                    <tr>
                      <th className="sn" style={{ width: 45 }}>S.No</th>
                      {gridCols.map((c, idx) => (
                        <th
                          key={c.key}
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          className={dragOverIndex === idx ? 'drag-over' : ''}
                          title="Click to sort • Drag header to reorder column"
                          style={{ width: c.width || 'auto' }}
                        >
                          <div className="th-content" onClick={() => handleHeaderClick(c.key)}>
                            <span>{c.label}</span>
                            <span className="sort-icon">
                              {sortKey === c.key ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                            </span>
                          </div>
                          {c.searchable && (
                            <input
                              className="col-search"
                              placeholder={`Filter ${c.label}…`}
                              value={colFilters[c.key] || ''}
                              onChange={(e) => setCol(c.key, e.target.value)}
                            />
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((r, i) => (
                      <tr key={r.id}>
                        <td>{(safePage - 1) * perPage + i + 1}</td>
                        {gridCols.map((c) => (
                          <td key={c.key}>{renderCellContent(r, c.key)}</td>
                        ))}
                      </tr>
                    ))}
                    {!sorted.length && (
                      <tr>
                        <td colSpan={gridCols.length + 1} className="empty">
                          No data to display — adjust filters or click <b>➕ Add</b> to create a new indent.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ═══ PAGINATION ═══ */}
              <div className="pager">
                <button
                  className="btn-outline sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage(safePage - 1)}
                >‹ Prev</button>
                <span>
                  Page <b>{safePage}</b> of <b>{pages}</b> &nbsp;·&nbsp;
                  {sorted.length} record{sorted.length === 1 ? '' : 's'}
                </span>
                <button
                  className="btn-outline sm"
                  disabled={safePage >= pages}
                  onClick={() => setPage(safePage + 1)}
                >Next ›</button>
              </div>
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* 3. ROW PRINT MODAL VOUCHER OVERLAY                               */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {printRecord && (
            <div className="print-modal-overlay">
              <div className="print-modal-card">
                <div className="print-modal-body">
                  <div className="print-company-header">
                    <h2>FRONTIER KNITTERS (P) LTD</h2>
                    <p>Garment Manufacturing &amp; Export Division • Store Indent Voucher</p>
                  </div>

                  <div className="print-doc-title">STORE INDENT DOCUMENT</div>

                  <div className="print-grid">
                    <div className="print-grid-item"><b>Indent No:</b> <span>{printRecord.indentNo}</span></div>
                    <div className="print-grid-item"><b>Indent Date:</b> <span>{printRecord.date || printRecord.indentDate}</span></div>
                    <div className="print-grid-item"><b>Ref No:</b> <span>{printRecord.refNo || '—'}</span></div>
                    <div className="print-grid-item"><b>Unit:</b> <span>{printRecord.unit}</span></div>
                    <div className="print-grid-item"><b>Type:</b> <span>{printRecord.type}</span></div>
                    <div className="print-grid-item"><b>Order No:</b> <span>{printRecord.orderNo || '—'}</span></div>
                    <div className="print-grid-item"><b>Indent By:</b> <span>{printRecord.indentBy}</span></div>
                    <div className="print-grid-item"><b>Approval:</b> <span>{printRecord.approved ? '✅ Approved' : '⏳ Pending'}</span></div>
                  </div>

                  <div className="legacy-items-tblwrap" style={{ margin: '16px 0', border: '1px solid #94a3b8' }}>
                    <table className="legacy-tbl">
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}>Sno</th>
                          <th>Product Type</th>
                          <th>Product No</th>
                          <th>Product Name</th>
                          <th>Store</th>
                          <th>Req Date</th>
                          <th>Req Qty</th>
                          <th>Uom</th>
                          <th>Remarks / Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(printRecord.items) && printRecord.items.length > 0 ? (
                          printRecord.items.map((it, idx) => (
                            <tr key={it.id || idx}>
                              <td>{idx + 1}</td>
                              <td>{it.productType}</td>
                              <td><b>{it.productNo}</b></td>
                              <td style={{ textAlign: 'left' }}>{it.productName}</td>
                              <td>{it.store || '—'}</td>
                              <td>{it.reqDate}</td>
                              <td><b>{it.reqQty}</b></td>
                              <td>{it.uom}</td>
                              <td>{it.remarks ? `${it.remarks} (${it.reason})` : it.reason || '—'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td>1</td>
                            <td>General Store Item</td>
                            <td><b>{printRecord.refNo || 'PRD-STORE'}</b></td>
                            <td style={{ textAlign: 'left' }}>General Store Material Requirement</td>
                            <td>Main Store</td>
                            <td>{printRecord.date}</td>
                            <td><b>100</b></td>
                            <td>Pcs</td>
                            <td>Stock Replenishment</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="print-signatures">
                    <div>Prepared By: __________________</div>
                    <div>Checked By: __________________</div>
                    <div>Approved By: __________________</div>
                  </div>
                </div>

                <div className="print-actions">
                  <button className="btn-primary sm" onClick={() => window.print()}>🖨️ Print Voucher</button>
                  <button className="btn-outline sm" onClick={() => setPrintRecord(null)}>✕ Close</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
