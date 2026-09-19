// Adjustment Page — Accounts > Bills > Adjustment
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../auth';
import Navbar from '../components/Navbar';
import {
  ACCOUNTS_DOWNLOAD_TYPES, PARTY_TYPE_OPTIONS, CUSTOMER_OPTIONS,
  VOUCHER_TYPE_OPTIONS, VOUCHER_NO_OPTIONS, STATUS_OPTIONS,
  INVOICE_TYPE_OPTIONS, INVOICE_NO_OPTIONS, CURRENCY_OPTIONS,
  RECEIPT_TYPE_OPTIONS, BANK_OPTIONS, ACCOUNT_HEAD_OPTIONS,
  ADJUSTMENT_COLUMNS
} from '../accountsConfig';
import {
  listAdjustments, saveAdjustment, deleteAdjustment
} from '../accountsService';
import BlueSelect from '../components/BlueSelect';

function generateVoucherNo() {
  const num = Math.floor(100 + Math.random() * 900);
  return `RCP-2026-${num}`;
}

function makeBlankForm() {
  const today = new Date().toISOString().slice(0, 10);
  const defaultCurr = CURRENCY_OPTIONS[0]; // USD
  return {
    id: '',
    voucherNo: generateVoucherNo(),
    voucherDate: today,
    refNo: 'REF-' + Math.floor(1000 + Math.random() * 9000),
    customer: CUSTOMER_OPTIONS[1] || 'Zara / Inditex S.A.',
    partyType: PARTY_TYPE_OPTIONS[0] || 'Customer',
    voucherType: VOUCHER_TYPE_OPTIONS[0] || 'Receipt',
    status: 'Pending',
    invoiceType: INVOICE_TYPE_OPTIONS[1] || 'Sales Invoice',
    invoiceNo: INVOICE_NO_OPTIONS[0] || 'EXP-INV-9901',
    currency: defaultCurr.code,
    exRate: defaultCurr.exRate,
    receiptType: RECEIPT_TYPE_OPTIONS[3] || 'Transfer',
    bank: BANK_OPTIONS[0] || 'HDFC Bank - Export Branch (A/C ...8921)',
    chqNo: 'TRF-' + Math.floor(1000000 + Math.random() * 9000000),
    chqDate: today,
    fromDate: today,
    toDate: today,
    amount: 10000.00,
    adjusted: 9500.00,
    advance: 500.00,
    remarks: 'Receipt adjustment for export invoice clearance',
    details: [
      {
        id: 'det-1',
        invoiceType: 'Sales Invoice',
        invoiceNo: 'EXP-INV-9901',
        invoiceDate: today,
        billAmount: 10000.00,
        currency: defaultCurr.code,
        exRate: defaultCurr.exRate,
        billValue: 835000.00,
        received: 9500.00,
        balance: 500.00,
        receipt: 9500.00,
        discount: 0.00
      }
    ],
    adjustItems: [
      {
        id: 'adj-1',
        accountHead: ACCOUNT_HEAD_OPTIONS[0] || 'Bank Charges & Fees',
        pct: 2.0,
        amount: 200.00
      }
    ]
  };
}

const PAGE_SIZE_DEFAULT = 10;

export default function Adjustment() {
  const nav = useNavigate();
  const [session, setSession] = useState(() => getSession() || { username: 'superadmin', role: 'Super Admin' });
  const [rows, setRows] = useState(() => listAdjustments());

  // View mode: 'list' or 'entry'
  const [viewMode, setViewMode] = useState('list');
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'adjust'

  /* ── Form State ── */
  const [form, setForm] = useState(makeBlankForm);
  const [entryMsg, setEntryMsg] = useState('');
  const [entryErr, setEntryErr] = useState('');

  /* ── Filter state for List view ── */
  const [filterPartyType, setFilterPartyType] = useState('Customer');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterVoucherType, setFilterVoucherType] = useState('');
  const [filterVoucherNo, setFilterVoucherNo] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  /* ── List view toolbar & grid ── */
  const [downloadType, setDownloadType] = useState('CSV');
  const [msg, setMsg] = useState('');
  const [colFilters, setColFilters] = useState({});
  const [perPage, setPerPage] = useState(PAGE_SIZE_DEFAULT);
  const [page, setPage] = useState(1);
  const [printRecord, setPrintRecord] = useState(null);

  /* ── Dynamic Slick Grid state ── */
  const [gridCols, setGridCols] = useState(() => ADJUSTMENT_COLUMNS);
  const [draggedColIndex, setDraggedColIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [sortKey, setSortKey] = useState('voucherNo');
  const [sortOrder, setSortOrder] = useState('desc');

  /* ── Auth & seed records ── */
  useEffect(() => {
    const s = getSession();
    if (!s || !s.username || !s.role) { logout(); nav('/login'); return; }
    setSession(s);

    const records = listAdjustments();
    setRows(records || []);
  }, [nav]);

  /* ── List view filtering ── */
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterPartyType && r.partyType !== filterPartyType) return false;
      if (filterCustomer && filterCustomer !== 'All Customers' && r.customer !== filterCustomer) return false;
      if (filterVoucherType && r.voucherType !== filterVoucherType) return false;
      if (filterVoucherNo && filterVoucherNo !== 'All Vouchers' && r.voucherNo !== filterVoucherNo) return false;
      if (filterStatus && filterStatus !== 'All' && r.status !== filterStatus) return false;

      return Object.entries(colFilters).every(([k, v]) => {
        if (!v) return true;
        const val = r[k];
        return String(val || '').toLowerCase().includes(v.toLowerCase());
      });
    });
  }, [rows, filterPartyType, filterCustomer, filterVoucherType, filterVoucherNo, filterStatus, colFilters]);

  /* ── Dynamic Slick Grid Sorting ── */
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA = a[sortKey] ?? '';
      let valB = b[sortKey] ?? '';
      if (sortKey === 'amount' || sortKey === 'adjusted' || sortKey === 'advance') {
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
    return <div style={{ color: '#627d98', padding: 40, fontFamily: 'Inter, sans-serif' }}>Loading… please wait</div>;
  }

  const pages = Math.max(1, Math.ceil(sorted.length / perPage));
  const safePage = Math.min(page, pages);
  const paged = sorted.slice((safePage - 1) * perPage, safePage * perPage);

  /* ── Grid Header Sort Handler ── */
  const handleHeaderClick = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  /* ── Grid Header Drag & Drop Handler ── */
  const handleDragStart = (e, index) => {
    setDraggedColIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedColIndex === null || draggedColIndex === index) {
      setDraggedColIndex(null);
      setDragOverIndex(null);
      return;
    }
    const updatedCols = [...gridCols];
    const [movedCol] = updatedCols.splice(draggedColIndex, 1);
    updatedCols.splice(index, 0, movedCol);
    setGridCols(updatedCols);
    setDraggedColIndex(null);
    setDragOverIndex(null);
  };

  /* ── Reset Filters ── */
  const resetFilters = () => {
    setFilterPartyType('Customer');
    setFilterCustomer('');
    setFilterVoucherType('');
    setFilterVoucherNo('');
    setFilterStatus('All');
    setColFilters({});
    setPage(1);
    setMsg('Filters reset.');
    setTimeout(() => setMsg(''), 3000);
  };

  /* ── Form Operations ── */
  const handleAddNewRecord = () => {
    setForm(makeBlankForm());
    setEntryMsg('');
    setEntryErr('');
    setActiveTab('details');
    setViewMode('entry');
  };

  const handleEditRecord = (rec) => {
    setForm(JSON.parse(JSON.stringify(rec)));
    setEntryMsg('');
    setEntryErr('');
    setActiveTab('details');
    setViewMode('entry');
  };

  const handleDeleteRecord = (id) => {
    if (window.confirm('Are you sure you want to delete this Adjustment voucher?')) {
      const updated = deleteAdjustment(id);
      setRows(updated);
      setMsg('Adjustment voucher deleted successfully.');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  /* ── Currency Selection Handler ── */
  const handleCurrencyChange = (currCode) => {
    const selectedObj = CURRENCY_OPTIONS.find(c => c.code === currCode) || CURRENCY_OPTIONS[0];
    setForm(prev => {
      const updatedDetails = (prev.details || []).map(det => {
        const billVal = (det.billAmount || 0) * selectedObj.exRate;
        return { ...det, currency: currCode, exRate: selectedObj.exRate, billValue: billVal };
      });
      return {
        ...prev,
        currency: currCode,
        exRate: selectedObj.exRate,
        details: updatedDetails
      };
    });
  };

  /* ── Details Item Operations ── */
  const handleAddDetailItem = () => {
    const today = new Date().toISOString().slice(0, 10);
    const selectedCurr = CURRENCY_OPTIONS.find(c => c.code === form.currency) || CURRENCY_OPTIONS[0];
    const newDet = {
      id: 'det-' + Date.now(),
      invoiceType: form.invoiceType || 'Sales Invoice',
      invoiceNo: form.invoiceNo || 'EXP-INV-9904',
      invoiceDate: today,
      billAmount: 5000.00,
      currency: form.currency,
      exRate: selectedCurr.exRate,
      billValue: 5000.00 * selectedCurr.exRate,
      received: 5000.00,
      balance: 0.00,
      receipt: 5000.00,
      discount: 0.00
    };
    setForm(prev => ({
      ...prev,
      details: [...(prev.details || []), newDet]
    }));
  };

  const handleRemoveDetailItem = (detId) => {
    setForm(prev => ({
      ...prev,
      details: (prev.details || []).filter(d => d.id !== detId)
    }));
  };

  const handleDetailChange = (detId, field, val) => {
    setForm(prev => {
      const updated = (prev.details || []).map(det => {
        if (det.id !== detId) return det;
        const newDet = { ...det, [field]: val };
        if (field === 'billAmount' || field === 'exRate') {
          newDet.billValue = (Number(newDet.billAmount) || 0) * (Number(newDet.exRate) || 1);
        }
        return newDet;
      });
      return { ...prev, details: updated };
    });
  };

  /* ── Adjust Item Operations ── */
  const handleAddAdjustItem = () => {
    const newAdj = {
      id: 'adj-' + Date.now(),
      accountHead: ACCOUNT_HEAD_OPTIONS[0],
      pct: 1.0,
      amount: (form.amount || 0) * 0.01
    };
    setForm(prev => ({
      ...prev,
      adjustItems: [...(prev.adjustItems || []), newAdj]
    }));
  };

  const handleRemoveAdjustItem = (adjId) => {
    setForm(prev => ({
      ...prev,
      adjustItems: (prev.adjustItems || []).filter(a => a.id !== adjId)
    }));
  };

  const handleAdjustItemChange = (adjId, field, val) => {
    setForm(prev => {
      const updated = (prev.adjustItems || []).map(item => {
        if (item.id !== adjId) return item;
        const newItem = { ...item, [field]: val };
        if (field === 'pct') {
          newItem.amount = ((Number(prev.amount) || 0) * (Number(val) || 0)) / 100;
        }
        return newItem;
      });
      return { ...prev, adjustItems: updated };
    });
  };

  /* ── Calculated Totals ── */
  const grossAmount = useMemo(() => {
    return (form.details || []).reduce((sum, item) => sum + (Number(item.billAmount) || 0), 0);
  }, [form.details]);

  const totalAdjustAmount = useMemo(() => {
    return (form.adjustItems || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [form.adjustItems]);

  const netAmount = useMemo(() => {
    return grossAmount - totalAdjustAmount;
  }, [grossAmount, totalAdjustAmount]);

  /* ── Save Adjustment Form ── */
  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!form.voucherNo || !form.customer) {
      setEntryErr('Please fill in required fields: Voucher No and Customer.');
      return;
    }
    try {
      const recordToSave = {
        ...form,
        amount: grossAmount || form.amount,
        adjusted: totalAdjustAmount || form.adjusted,
        advance: Math.max(0, grossAmount - netAmount)
      };
      const updatedList = saveAdjustment(recordToSave);
      setRows(updatedList);
      setEntryMsg('Adjustment voucher saved successfully!');
      setTimeout(() => {
        setViewMode('list');
        setMsg('Adjustment saved successfully.');
        setTimeout(() => setMsg(''), 3000);
      }, 800);
    } catch (err) {
      setEntryErr('Failed to save adjustment record.');
    }
  };

  /* ── Export Handler ── */
  const handleDownload = () => {
    if (downloadType === 'CSV' || downloadType === 'XLS') {
      const headers = gridCols.filter(c => c.key !== 'action').map(c => c.label);
      const csvRows = [headers.join(',')];
      sorted.forEach((r, idx) => {
        const rowVal = [
          idx + 1,
          `"${r.voucherNo || ''}"`,
          `"${r.voucherDate || ''}"`,
          `"${r.customer || ''}"`,
          `"${r.refNo || ''}"`,
          `"${r.amount || 0}"`,
          `"${r.adjusted || 0}"`,
          `"${r.advance || 0}"`
        ];
        csvRows.push(rowVal.join(','));
      });
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Adjustment_Vouchers.${downloadType.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg(`Downloaded list as ${downloadType.toUpperCase()}`);
    } else {
      setMsg(`Preparing ${downloadType.toUpperCase()} file download...`);
      setTimeout(() => {
        alert(`Downloaded Adjustment list as ${downloadType.toUpperCase()}`);
        setMsg('');
      }, 600);
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar session={session} />

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px 60px' }}>
        
        {/* Breadcrumb Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600 }}>
              ACCOUNTS &gt; BILLS &gt; ADJUSTMENT
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '4px 0 0' }}>
              {viewMode === 'list' ? 'Adjustment Vouchers' : (form.id ? 'Edit Receipt Adjustment' : 'Receipt Adjustment')}
            </h1>
          </div>
          {viewMode === 'list' ? (
            <button
              onClick={handleAddNewRecord}
              style={{
                backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '9px 16px',
                borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                boxShadow: '0 2px 4px rgba(37,99,235,0.2)', width: 'auto', whiteSpace: 'nowrap', flexShrink: 0
              }}
            >
              ➕ Add Adjustment
            </button>
          ) : (
            <button
              onClick={() => setViewMode('list')}
              style={{
                backgroundColor: '#94a3b8', color: '#fff', border: 'none', padding: '9px 16px',
                borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                width: 'auto', whiteSpace: 'nowrap', flexShrink: 0
              }}
            >
              ⬅ Back to List
            </button>
          )}
        </div>

        {msg && (
          <div style={{ padding: '12px 16px', borderRadius: 6, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', marginBottom: 16, fontWeight: 500 }}>
            {msg}
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <>
            {/* Filter Section */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#334155', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                🔍 Filter Criteria
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, alignItems: 'end' }}>
                
                {/* Type Dropdown (Customer / Supplier) */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Type</label>
                  <BlueSelect
                    value={filterPartyType}
                    onChange={(e) => setFilterPartyType(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  >
                    {PARTY_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </BlueSelect>
                </div>

                {/* Customer Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Customer</label>
                  <BlueSelect
                    value={filterCustomer}
                    onChange={(e) => setFilterCustomer(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  >
                    {CUSTOMER_OPTIONS.map((opt) => (
                      <option key={opt} value={opt === 'All Customers' ? '' : opt}>{opt}</option>
                    ))}
                  </BlueSelect>
                </div>

                {/* Voucher Type Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Voucher Type</label>
                  <BlueSelect
                    value={filterVoucherType}
                    onChange={(e) => setFilterVoucherType(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  >
                    <option value="">All Voucher Types</option>
                    {VOUCHER_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </BlueSelect>
                </div>

                {/* Voucher No Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Voucher No</label>
                  <BlueSelect
                    value={filterVoucherNo}
                    onChange={(e) => setFilterVoucherNo(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  >
                    {VOUCHER_NO_OPTIONS.map((opt) => (
                      <option key={opt} value={opt === 'All Vouchers' ? '' : opt}>{opt}</option>
                    ))}
                  </BlueSelect>
                </div>

                {/* Status Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Status</label>
                  <BlueSelect
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </BlueSelect>
                </div>

                {/* Reset Filters */}
                <div>
                  <button
                    onClick={resetFilters}
                    style={{
                      width: '100%', padding: '9px 14px', borderRadius: 6, border: '1px solid #cbd5e1',
                      backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}
                  >
                    🔄 Reset Filters
                  </button>
                </div>

              </div>
            </div>

            {/* List Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>Download Format:</span>
                <BlueSelect
                  value={downloadType}
                  onChange={(e) => setDownloadType(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, color: '#0f172a' }}
                >
                  {ACCOUNTS_DOWNLOAD_TYPES.map((fmt) => (
                    <option key={fmt} value={fmt}>{fmt}</option>
                  ))}
                </BlueSelect>
                <button
                  onClick={handleDownload}
                  style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #0284c7', backgroundColor: '#0284c7', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  📥 Download
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => alert('Printing list view of Adjustment vouchers...')}
                  style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #475569', backgroundColor: '#ffffff', color: '#334155', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  🖨️ Print List
                </button>
                <button
                  onClick={() => alert(`Total Records: ${sorted.length}`)}
                  style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #475569', backgroundColor: '#ffffff', color: '#334155', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  👁️ View List
                </button>
              </div>
            </div>

            {/* Dynamic Slick Grid Table */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', minWidth: 1200, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      {gridCols.map((col, idx) => {
                        const isSort = sortKey === col.key;
                        return (
                          <th
                            key={col.key}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDrop={(e) => handleDrop(e, idx)}
                            onClick={() => col.key !== 'action' && col.key !== 'sno' && handleHeaderClick(col.key)}
                            style={{
                              padding: '10px 12px',
                              textAlign: col.key === 'action' ? 'center' : (col.key === 'amount' || col.key === 'adjusted' || col.key === 'advance' ? 'right' : 'left'),
                              fontWeight: 700,
                              color: '#1e293b',
                              cursor: col.key !== 'action' && col.key !== 'sno' ? 'pointer' : 'default',
                              userSelect: 'none',
                              backgroundColor: dragOverIndex === idx ? '#e2e8f0' : 'transparent',
                              borderRight: '1px solid #cbd5e1',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: col.key === 'action' ? 'center' : 'space-between', gap: 6 }}>
                              <span>⋮⋮ {col.label}</span>
                              {isSort && (<span>{sortOrder === 'asc' ? '▲' : '▼'}</span>)}
                            </div>
                          </th>
                        );
                      })}
                    </tr>

                    {/* Per-column Search Row */}
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                      {gridCols.map((col) => (
                        <td key={'search-' + col.key} style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>
                          {col.key !== 'action' && col.key !== 'sno' ? (
                            <input
                              type="text"
                              placeholder={`Search ${col.label}...`}
                              value={colFilters[col.key] || ''}
                              onChange={(e) => setColFilters(prev => ({ ...prev, [col.key]: e.target.value }))}
                              style={{
                                width: '100%', padding: '4px 8px', fontSize: 12, borderRadius: 4,
                                border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a'
                              }}
                            />
                          ) : null}
                        </td>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {paged.length === 0 ? (
                      <tr>
                        <td colSpan={gridCols.length} style={{ textAlign: 'center', padding: '36px 12px', color: '#64748b' }}>
                          No Adjustment vouchers found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      paged.map((row, idx) => {
                        const globalIndex = (safePage - 1) * perPage + idx + 1;
                        return (
                          <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                            {gridCols.map((col) => {
                              if (col.key === 'sno') {
                                return (
                                  <td key={col.key} style={{ padding: '10px 12px', color: '#64748b', fontWeight: 600, borderRight: '1px solid #f1f5f9' }}>
                                    {globalIndex}
                                  </td>
                                );
                              }
                              if (col.key === 'action') {
                                return (
                                  <td key={col.key} style={{ padding: '8px 12px', textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                      <button
                                        onClick={() => handleEditRecord(row)}
                                        title="Edit Record"
                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, color: '#2563eb' }}
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        onClick={() => setPrintRecord(row)}
                                        title="Print Record"
                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, color: '#0284c7' }}
                                      >
                                        🖨️
                                      </button>
                                      <button
                                        onClick={() => handleDeleteRecord(row.id)}
                                        title="Delete Record"
                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, color: '#dc2626' }}
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </td>
                                );
                              }

                              const val = row[col.key];
                              const isNum = col.key === 'amount' || col.key === 'adjusted' || col.key === 'advance';

                              return (
                                <td key={col.key} style={{ padding: '10px 12px', color: '#1e293b', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap', textAlign: isNum ? 'right' : 'left' }}>
                                  {isNum ? Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) : (val || '-')}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: 13 }}>
                <div style={{ color: '#64748b' }}>
                  Showing {sorted.length > 0 ? (safePage - 1) * perPage + 1 : 0} to {Math.min(safePage * perPage, sorted.length)} of {sorted.length} records
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    disabled={safePage === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid #cbd5e1', backgroundColor: safePage === 1 ? '#f1f5f9' : '#fff', cursor: safePage === 1 ? 'not-allowed' : 'pointer', fontSize: 13 }}
                  >
                    ◀ Prev
                  </button>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Page {safePage} of {pages}</span>
                  <button
                    disabled={safePage === pages}
                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                    style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid #cbd5e1', backgroundColor: safePage === pages ? '#f1f5f9' : '#fff', cursor: safePage === pages ? 'not-allowed' : 'pointer', fontSize: 13 }}
                  >
                    Next ▶
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ADD / EDIT FORM VIEW */}
        {viewMode === 'entry' && (
          <form onSubmit={handleSaveForm} style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            
            <div style={{ borderBottom: '1px solid #e2e8f0', pb: 16, marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                🧾 Receipt Adjustment Heading
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                Enter receipt details, currency ex-rates, invoice details, and account head adjustments.
              </p>
            </div>

            {entryErr && (
              <div style={{ padding: '10px 14px', borderRadius: 6, backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', marginBottom: 16, fontSize: 13 }}>
                {entryErr}
              </div>
            )}

            {entryMsg && (
              <div style={{ padding: '10px 14px', borderRadius: 6, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', marginBottom: 16, fontSize: 13 }}>
                {entryMsg}
              </div>
            )}

            {/* Header Row 1: Receipt No, Receipt Date, Ref No, Customer */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16, backgroundColor: '#f8fafc', padding: 16, borderRadius: 6, border: '1px solid #f1f5f9' }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Receipt No *</label>
                <input
                  type="text"
                  value={form.voucherNo}
                  onChange={(e) => setForm({ ...form, voucherNo: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Receipt Date *</label>
                <input
                  type="date"
                  value={form.voucherDate}
                  onChange={(e) => setForm({ ...form, voucherDate: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Ref No</label>
                <input
                  type="text"
                  value={form.refNo}
                  onChange={(e) => setForm({ ...form, refNo: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Customer Dropdown *</label>
                <BlueSelect
                  value={form.customer}
                  onChange={(e) => setForm({ ...form, customer: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  required
                >
                  {CUSTOMER_OPTIONS.filter(c => c !== 'All Customers').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </BlueSelect>
              </div>
            </div>

            {/* Header Row 2: Type, Invoice Type, Invoice No, Currency Type, Ex.Rate, Receipt Type, Bank, Chq Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24, backgroundColor: '#ffffff', padding: 16, borderRadius: 6, border: '1px solid #e2e8f0' }}>
              
              {/* Type Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Type</label>
                <BlueSelect
                  value={form.voucherType}
                  onChange={(e) => setForm({ ...form, voucherType: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                >
                  {VOUCHER_TYPE_OPTIONS.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </BlueSelect>
              </div>

              {/* Invoice Type Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Invoice Type</label>
                <BlueSelect
                  value={form.invoiceType}
                  onChange={(e) => setForm({ ...form, invoiceType: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                >
                  {INVOICE_TYPE_OPTIONS.map(it => (
                    <option key={it} value={it}>{it}</option>
                  ))}
                </BlueSelect>
              </div>

              {/* Invoice No Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Invoice No</label>
                <BlueSelect
                  value={form.invoiceNo}
                  onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                >
                  {INVOICE_NO_OPTIONS.map(ino => (
                    <option key={ino} value={ino}>{ino}</option>
                  ))}
                </BlueSelect>
              </div>

              {/* Currency Type Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Currency Type</label>
                <BlueSelect
                  value={form.currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                >
                  {CURRENCY_OPTIONS.map(c => (
                    <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                  ))}
                </BlueSelect>
              </div>

              {/* Ex. Rate */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Ex. Rate (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.exRate}
                  onChange={(e) => handleCurrencyChange(form.currency)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                />
              </div>

              {/* Receipt Type Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Receipt Type</label>
                <BlueSelect
                  value={form.receiptType}
                  onChange={(e) => setForm({ ...form, receiptType: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                >
                  {RECEIPT_TYPE_OPTIONS.map(rt => (
                    <option key={rt} value={rt}>{rt}</option>
                  ))}
                </BlueSelect>
              </div>

              {/* Bank Dropdown */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Bank</label>
                <BlueSelect
                  value={form.bank}
                  onChange={(e) => setForm({ ...form, bank: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                >
                  {BANK_OPTIONS.map(bk => (
                    <option key={bk} value={bk}>{bk}</option>
                  ))}
                </BlueSelect>
              </div>

              {/* Chq/DD/Trf No */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Chq/DD/Trf No</label>
                <input
                  type="text"
                  value={form.chqNo}
                  onChange={(e) => setForm({ ...form, chqNo: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                />
              </div>

              {/* Chq/DD/Trf Date */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Chq/DD/Trf Date</label>
                <input
                  type="date"
                  value={form.chqDate}
                  onChange={(e) => setForm({ ...form, chqDate: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                />
              </div>

              {/* From Date */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>From Date</label>
                <input
                  type="date"
                  value={form.fromDate}
                  onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                />
              </div>

              {/* To Date */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>To Date</label>
                <input
                  type="date"
                  value={form.toDate}
                  onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                />
              </div>

            </div>

            {/* TAB NAVIGATION: Details & Adjust */}
            <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: 20 }}>
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                style={{
                  padding: '10px 20px', border: 'none', background: 'transparent',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  color: activeTab === 'details' ? '#2563eb' : '#64748b',
                  borderBottom: activeTab === 'details' ? '3px solid #2563eb' : '3px solid transparent',
                  marginBottom: -2
                }}
              >
                📊 Details Tab
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('adjust')}
                style={{
                  padding: '10px 20px', border: 'none', background: 'transparent',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  color: activeTab === 'adjust' ? '#2563eb' : '#64748b',
                  borderBottom: activeTab === 'adjust' ? '3px solid #2563eb' : '3px solid transparent',
                  marginBottom: -2
                }}
              >
                ⚖️ Adjust Tab
              </button>
            </div>

            {/* TAB 1: DETAILS */}
            {activeTab === 'details' && (
              <div style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: 18, marginBottom: 24, backgroundColor: '#ffffff' }}>
                
                {/* Details Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12, backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: 6 }}>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, fontWeight: 600 }}>
                    <div><span style={{ color: '#64748b' }}>Receipt Amount:</span> <span style={{ color: '#0f172a' }}>${(Number(form.amount) || 0).toFixed(2)}</span></div>
                    <div><span style={{ color: '#64748b' }}>Receipt Value:</span> <span style={{ color: '#0f172a' }}>₹{((Number(form.amount) || 0) * (form.exRate || 1)).toFixed(2)}</span></div>
                    <div><span style={{ color: '#64748b' }}>Adjusted Amount:</span> <span style={{ color: '#166534' }}>${(Number(form.adjusted) || 0).toFixed(2)}</span></div>
                    <div><span style={{ color: '#64748b' }}>Advance:</span> <span style={{ color: '#2563eb' }}>${(Number(form.advance) || 0).toFixed(2)}</span></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddDetailItem}
                    style={{
                      backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '7px 16px',
                      borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                    }}
                  >
                    ➕ Adjust / Add Bill Item
                  </button>
                </div>

                {/* Scrollable Details Table */}
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 6 }}>
                  <table style={{ width: '100%', minWidth: 1400, borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '10px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Invoice Type</th>
                        <th style={{ padding: '10px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Invoice No</th>
                        <th style={{ padding: '10px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Invoice Date</th>
                        <th style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Bill Amount</th>
                        <th style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700, color: '#334155' }}>Currency</th>
                        <th style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Ex.Rate</th>
                        <th style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Bill Value (₹)</th>
                        <th style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Received</th>
                        <th style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Balance</th>
                        <th style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Receipt</th>
                        <th style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Discount</th>
                        <th style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700, color: '#334155' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!form.details || form.details.length === 0) ? (
                        <tr>
                          <td colSpan={12} style={{ textAlign: 'center', padding: '24px 12px', color: '#64748b' }}>
                            No invoice details added. Click "Adjust / Add Bill Item" above.
                          </td>
                        </tr>
                      ) : (
                        form.details.map((det) => (
                          <tr key={det.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '6px 8px' }}>
                              <BlueSelect
                                value={det.invoiceType}
                                onChange={(e) => handleDetailChange(det.id, 'invoiceType', e.target.value)}
                                style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                              >
                                {INVOICE_TYPE_OPTIONS.map(it => (
                                  <option key={it} value={it}>{it}</option>
                                ))}
                              </BlueSelect>
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="text"
                                value={det.invoiceNo}
                                onChange={(e) => handleDetailChange(det.id, 'invoiceNo', e.target.value)}
                                style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="date"
                                value={det.invoiceDate}
                                onChange={(e) => handleDetailChange(det.id, 'invoiceDate', e.target.value)}
                                style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="number"
                                value={det.billAmount}
                                onChange={(e) => handleDetailChange(det.id, 'billAmount', Number(e.target.value))}
                                style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600 }}>
                              {det.currency}
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="number"
                                step="0.01"
                                value={det.exRate}
                                onChange={(e) => handleDetailChange(det.id, 'exRate', Number(e.target.value))}
                                style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600, color: '#334155' }}>
                              ₹{(Number(det.billValue) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="number"
                                value={det.received}
                                onChange={(e) => handleDetailChange(det.id, 'received', Number(e.target.value))}
                                style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="number"
                                value={det.balance}
                                onChange={(e) => handleDetailChange(det.id, 'balance', Number(e.target.value))}
                                style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="number"
                                value={det.receipt}
                                onChange={(e) => handleDetailChange(det.id, 'receipt', Number(e.target.value))}
                                style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="number"
                                value={det.discount}
                                onChange={(e) => handleDetailChange(det.id, 'discount', Number(e.target.value))}
                                style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveDetailItem(det.id)}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc2626', fontSize: 14 }}
                                title="Delete Item"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: ADJUST */}
            {activeTab === 'adjust' && (
              <div style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: 18, marginBottom: 24, backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                    ⚖️ Account Head Adjustments Table
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAdjustItem}
                    style={{
                      backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '6px 14px',
                      borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                    }}
                  >
                    ➕ Add Account Head Row
                  </button>
                </div>

                {/* Adjust Items Table */}
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 6, marginBottom: 18 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '10px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Account Heads</th>
                        <th style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>%</th>
                        <th style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Amount ($)</th>
                        <th style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700, color: '#334155' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!form.adjustItems || form.adjustItems.length === 0) ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '24px 12px', color: '#64748b' }}>
                            No account head adjustments added. Click "Add Account Head Row" above.
                          </td>
                        </tr>
                      ) : (
                        form.adjustItems.map((adj) => (
                          <tr key={adj.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '6px 8px' }}>
                              <BlueSelect
                                value={adj.accountHead}
                                onChange={(e) => handleAdjustItemChange(adj.id, 'accountHead', e.target.value)}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 13, color: '#0f172a' }}
                              >
                                {ACCOUNT_HEAD_OPTIONS.map(ah => (
                                  <option key={ah} value={ah}>{ah}</option>
                                ))}
                              </BlueSelect>
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="number"
                                step="0.01"
                                value={adj.pct}
                                onChange={(e) => handleAdjustItemChange(adj.id, 'pct', Number(e.target.value))}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 13, textAlign: 'right' }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="number"
                                step="0.01"
                                value={adj.amount}
                                onChange={(e) => handleAdjustItemChange(adj.id, 'amount', Number(e.target.value))}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 13, textAlign: 'right' }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveAdjustItem(adj.id)}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc2626', fontSize: 14 }}
                                title="Delete Row"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Remarks Field */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Remarks</label>
                  <textarea
                    rows={3}
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                    placeholder="Enter adjustment remarks or bank reference notes..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none', resize: 'vertical' }}
                  />
                </div>
              </div>
            )}

            {/* DOWNSIDE SUMMARY BAR & ACTION BUTTONS */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: 8, padding: '16px 20px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              
              {/* Corner Financial Totals */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 14, fontWeight: 700 }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Gross Amount: </span>
                  <span style={{ color: '#0f172a' }}>${grossAmount.toFixed(2)}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Total Adjust Amount: </span>
                  <span style={{ color: '#dc2626' }}>${totalAdjustAmount.toFixed(2)}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>Net Amount: </span>
                  <span style={{ color: '#166534', fontSize: 16 }}>${netAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Update / Save & Cancel */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '10px 20px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#ffffff',
                    color: '#334155', fontWeight: 600, fontSize: 14, cursor: 'pointer'
                  }}
                >
                  ✖ Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px', borderRadius: 6, border: 'none', backgroundColor: '#2563eb',
                    color: '#ffffff', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                  }}
                >
                  💾 Save / Update Adjustment
                </button>
              </div>

            </div>

          </form>
        )}

        {/* PRINT MODAL PREVIEW */}
        {printRecord && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
            <div style={{ backgroundColor: '#fff', borderRadius: 8, maxWidth: 650, width: '100%', padding: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', pb: 12, mb: 16 }}>
                <h3 style={{ margin: 0, fontSize: 18, color: '#0f172a' }}>🖨️ Receipt Adjustment Voucher Slip</h3>
                <button onClick={() => setPrintRecord(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>✕</button>
              </div>

              <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, marginBottom: 20 }}>
                <p><strong>Voucher No:</strong> {printRecord.voucherNo}</p>
                <p><strong>Voucher Date:</strong> {printRecord.voucherDate}</p>
                <p><strong>Customer:</strong> {printRecord.customer}</p>
                <p><strong>Ref No:</strong> {printRecord.refNo || 'N/A'}</p>
                <p><strong>Voucher Type:</strong> {printRecord.voucherType} | <strong>Status:</strong> {printRecord.status}</p>
                <p><strong>Currency:</strong> {printRecord.currency} (Ex. Rate: {printRecord.exRate})</p>
                <p><strong>Bank:</strong> {printRecord.bank}</p>
                <p><strong>Amount:</strong> ${Number(printRecord.amount || 0).toFixed(2)}</p>
                <p><strong>Adjusted:</strong> ${Number(printRecord.adjusted || 0).toFixed(2)}</p>
                <p><strong>Advance:</strong> ${Number(printRecord.advance || 0).toFixed(2)}</p>
                <p><strong>Remarks:</strong> {printRecord.remarks || 'N/A'}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button onClick={() => setPrintRecord(null)} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#334155', cursor: 'pointer' }}>Close</button>
                <button onClick={() => { alert('Print job sent to default printer.'); setPrintRecord(null); }} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Print Voucher</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
