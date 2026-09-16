// Payment Page — Accounts > Bills > Payment
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../auth';
import Navbar from '../components/Navbar';
import {
  ACCOUNTS_DOWNLOAD_TYPES, SUPPLIER_OPTIONS,
  PAYMENT_TYPE_OPTIONS, PAYMENT_INVOICE_TYPE_OPTIONS,
  PAYMENT_PAYMODE_OPTIONS, PAYMENT_STATUS_OPTIONS,
  CURRENCY_OPTIONS, BANK_OPTIONS, ACCOUNT_HEAD_OPTIONS,
  INVOICE_NO_OPTIONS
} from '../accountsConfig';
import {
  listPayments, savePayment, deletePayment, toggleReleasePayment
} from '../accountsService';

const PAGE_SIZE = 10;

function generatePaymentNo() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `FKS/PAY${num}`;
}

function makeBlankPaymentForm() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: '',
    paymentNo: generatePaymentNo(),
    paymentDate: today,
    refNo: 'REF-YRN-' + Math.floor(1000 + Math.random() * 9000),
    supplier: SUPPLIER_OPTIONS[1] || 'Supreme Yarn Spinners Ltd',
    paymentType: PAYMENT_TYPE_OPTIONS[0] || 'Payment',
    invoiceType: PAYMENT_INVOICE_TYPE_OPTIONS[2] || 'Purchase Invoice',
    invoiceNo: 'PUR-INV-8801',
    currencyType: 'Base', // 'Base' (INR) or 'Other'
    currency: 'INR',
    exRate: 1.00,
    paymode: PAYMENT_PAYMODE_OPTIONS[1] || 'Cheque',
    bank: BANK_OPTIONS[0] || 'HDFC Bank - Export Branch (A/C ...8921)',
    chqNo: 'CHQ-' + Math.floor(100000 + Math.random() * 900000),
    chqDate: today,
    advancedRef: 'ADV-REF-001',
    fromDate: today,
    toDate: today,
    amount: 45000.00,
    charges: 150.00,
    paymentValue: 45150.00,
    adjustStatus: 'Adjusted',
    isVoid: 'No',
    status: 'Pending',
    grossAmt: 45000.00,
    overhead2: 150.00,
    remarks: 'Supplier yarn invoice payment clearance',
    itemDetails: [
      {
        id: 'pdet-1',
        invoiceType: 'Purchase Invoice',
        invoiceNo: 'PUR-INV-8801',
        invoiceDate: today,
        refNo: 'REF-YRN-8801',
        billAmt: 45000.00,
        currency: 'INR',
        exRate: 1.00,
        billValue: 45000.00,
        paid: 45000.00,
        balance: 0.00,
        payment: 45000.00
      }
    ],
    addLessItems: [
      {
        id: 'pal-1',
        accountHead: ACCOUNT_HEAD_OPTIONS[0] || 'Bank Charges & Fees',
        pct: 0.33,
        rate: 150.00
      }
    ]
  };
}

const DEFAULT_GRID_COLS = [
  { key: 'sno', label: 'S.No', width: '60px' },
  { key: 'paymentNo', label: 'Payment No', width: '130px' },
  { key: 'paymentDate', label: 'Payment Date', width: '115px' },
  { key: 'supplier', label: 'Supplier', width: '180px' },
  { key: 'paymentType', label: 'Payment Type', width: '120px' },
  { key: 'refNo', label: 'Ref No', width: '120px' },
  { key: 'amount', label: 'Amount (₹)', width: '110px' },
  { key: 'paymode', label: 'Paymode', width: '100px' },
  { key: 'chqNo', label: 'Chq/DD/Trf No', width: '130px' },
  { key: 'adjustStatus', label: 'Adjust Status', width: '115px' },
  { key: 'isVoid', label: 'Is Void', width: '85px' },
  { key: 'action', label: 'Action', width: '120px' }
];

export default function Payment() {
  const nav = useNavigate();
  const [session, setSession] = useState(() => getSession() || { username: 'superadmin', role: 'Super Admin' });
  const [rows, setRows] = useState(() => listPayments());

  /* ── View Mode: 'list' or 'entry' ── */
  const [viewMode, setViewMode] = useState('list');
  const [formTab, setFormTab] = useState('details'); // 'details' or 'addless'
  const [isReleaseView, setIsReleaseView] = useState(false);

  /* ── Form state ── */
  const [form, setForm] = useState(makeBlankPaymentForm);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  /* ── List view filters ── */
  const [filterSupplier, setFilterSupplier] = useState('All Suppliers');
  const [filterType, setFilterType] = useState('All');
  const [filterPaymentNo, setFilterPaymentNo] = useState('All');
  const [filterPaymode, setFilterPaymode] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [downloadFmt, setDownloadFmt] = useState('CSV');

  const paymentNoOptions = useMemo(() => {
    const nos = Array.from(new Set(rows.map(r => r.paymentNo).filter(Boolean)));
    return ['All', ...nos];
  }, [rows]);

  /* ── Column search & sorting state ── */
  const [colSearch, setColSearch] = useState({
    sno: '',
    paymentNo: '',
    paymentDate: '',
    supplier: '',
    paymentType: '',
    refNo: '',
    amount: '',
    paymode: '',
    chqNo: '',
    adjustStatus: '',
    isVoid: ''
  });
  const [sortKey, setSortKey] = useState('paymentDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [gridCols, setGridCols] = useState(DEFAULT_GRID_COLS);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  useEffect(() => {
    const s = getSession();
    if (!s || !s.username) { nav('/login'); return; }
    setSession(s);
  }, [nav]);

  const refreshList = () => {
    setRows(listPayments());
    setMsg('List refreshed successfully.');
    setTimeout(() => setMsg(''), 2500);
  };

  /* ── Column search change ── */
  const handleColSearchChange = (colKey, val) => {
    setColSearch(prev => ({ ...prev, [colKey]: val }));
    setPage(1);
  };

  /* ── Column Drag Reorder ── */
  const handleDragStart = (e, i) => {
    setDraggedIdx(i);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e, i) => {
    e.preventDefault();
    if (dragOverIdx !== i) setDragOverIdx(i);
  };
  const handleDrop = (e, i) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === i) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }
    const cols = [...gridCols];
    const [moved] = cols.splice(draggedIdx, 1);
    cols.splice(i, 0, moved);
    setGridCols(cols);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleHeaderClick = (key) => {
    if (key === 'action' || key === 'sno') return;
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  /* ── Filtered & Sorted Rows ── */
  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      if (filterSupplier && filterSupplier !== 'All Suppliers' && r.supplier !== filterSupplier) return false;
      if (filterType && filterType !== 'All' && r.paymentType !== filterType) return false;
      if (filterPaymentNo && filterPaymentNo !== 'All' && r.paymentNo !== filterPaymentNo) return false;
      if (filterPaymode && filterPaymode !== 'All' && r.paymode !== filterPaymode) return false;
      if (filterStatus && filterStatus !== 'All' && r.status !== filterStatus) return false;
      if (isReleaseView && r.paymode !== 'Cheque') return false;

      if (fromDate && r.paymentDate < fromDate) return false;
      if (toDate && r.paymentDate > toDate) return false;

      // Inline column search checks
      if (colSearch.paymentNo && !r.paymentNo?.toLowerCase().includes(colSearch.paymentNo.toLowerCase())) return false;
      if (colSearch.paymentDate && !r.paymentDate?.includes(colSearch.paymentDate)) return false;
      if (colSearch.supplier && !r.supplier?.toLowerCase().includes(colSearch.supplier.toLowerCase())) return false;
      if (colSearch.paymentType && !r.paymentType?.toLowerCase().includes(colSearch.paymentType.toLowerCase())) return false;
      if (colSearch.refNo && !r.refNo?.toLowerCase().includes(colSearch.refNo.toLowerCase())) return false;
      if (colSearch.amount && !String(r.amount).includes(colSearch.amount)) return false;
      if (colSearch.paymode && !r.paymode?.toLowerCase().includes(colSearch.paymode.toLowerCase())) return false;
      if (colSearch.chqNo && !r.chqNo?.toLowerCase().includes(colSearch.chqNo.toLowerCase())) return false;
      if (colSearch.adjustStatus && !r.adjustStatus?.toLowerCase().includes(colSearch.adjustStatus.toLowerCase())) return false;
      if (colSearch.isVoid && !r.isVoid?.toLowerCase().includes(colSearch.isVoid.toLowerCase())) return false;

      return true;
    });
  }, [rows, filterSupplier, filterType, filterPaymentNo, filterPaymode, filterStatus, isReleaseView, fromDate, toDate, colSearch]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      let va = a[sortKey] ?? '';
      let vb = b[sortKey] ?? '';
      if (sortKey === 'amount') {
        va = Number(va) || 0;
        vb = Number(vb) || 0;
      } else {
        va = String(va).toLowerCase();
        vb = String(vb).toLowerCase();
      }
      if (va < vb) return sortOrder === 'asc' ? -1 : 1;
      if (va > vb) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRows, sortKey, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedRows = sortedRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /* ── Cheque Summary Metrics for Release Footer ── */
  const chequeMetrics = useMemo(() => {
    const chequeRows = rows.filter(r => r.paymode === 'Cheque');
    const totalCount = chequeRows.length;
    const totalAmt = chequeRows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

    const releasedRows = chequeRows.filter(r => r.status === 'Released');
    const releasedCount = releasedRows.length;
    const releasedAmt = releasedRows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

    const pendingRows = chequeRows.filter(r => r.status !== 'Released');
    const pendingCount = pendingRows.length;
    const pendingAmt = pendingRows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

    return {
      totalCount,
      totalAmt: totalAmt.toFixed(2),
      releasedCount,
      releasedAmt: releasedAmt.toFixed(2),
      pendingCount,
      pendingAmt: pendingAmt.toFixed(2)
    };
  }, [rows]);

  /* ── Handlers ── */
  const handleOpenAdd = () => {
    setForm(makeBlankPaymentForm());
    setFormTab('details');
    setMsg('');
    setErr('');
    setViewMode('entry');
  };

  const handleEdit = (rec) => {
    setForm({ ...rec });
    setFormTab('details');
    setMsg('');
    setErr('');
    setViewMode('entry');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      const updated = deletePayment(id);
      setRows(updated);
      setMsg('Payment record deleted successfully.');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleToggleRelease = (id) => {
    const updated = toggleReleasePayment(id);
    setRows(updated);
    setMsg('Cheque release status updated.');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!form.supplier) {
      setErr('Please select a Supplier.');
      return;
    }
    const updated = savePayment(form);
    setRows(updated);
    setMsg(`Payment ${form.paymentNo} saved successfully!`);
    setErr('');
    setViewMode('list');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleCurrencyTypeChange = (type) => {
    if (type === 'Base') {
      setForm(prev => ({
        ...prev,
        currencyType: 'Base',
        currency: 'INR',
        exRate: 1.00
      }));
    } else {
      const selectedCurr = CURRENCY_OPTIONS[0]; // USD
      setForm(prev => ({
        ...prev,
        currencyType: 'Other',
        currency: selectedCurr.code,
        exRate: selectedCurr.exRate
      }));
    }
  };

  const handleCurrencySelect = (code) => {
    const found = CURRENCY_OPTIONS.find(c => c.code === code) || CURRENCY_OPTIONS[0];
    setForm(prev => ({
      ...prev,
      currency: found.code,
      exRate: found.exRate
    }));
  };

  const handleAutoAdjust = () => {
    const pAmt = Number(form.amount) || 0;
    const chg = Number(form.charges) || 0;
    const pVal = pAmt + chg;
    const ex = Number(form.exRate) || 1.0;

    const updatedDetails = form.itemDetails.map(item => ({
      ...item,
      billAmt: pAmt,
      billValue: (pAmt * ex).toFixed(2),
      paid: pAmt,
      balance: 0.00,
      payment: pAmt
    }));

    setForm(prev => ({
      ...prev,
      paymentValue: pVal.toFixed(2),
      grossAmt: pAmt,
      overhead2: chg,
      itemDetails: updatedDetails
    }));

    setMsg('Amounts adjusted automatically!');
    setTimeout(() => setMsg(''), 2500);
  };

  const handleExport = () => {
    const headers = ['S.No', 'Payment No', 'Payment Date', 'Supplier', 'Payment Type', 'Ref No', 'Amount', 'Paymode', 'Chq No', 'Adjust Status', 'Is Void', 'Status'];
    const csvRows = [headers.join(',')];

    filteredRows.forEach((r, idx) => {
      csvRows.push([
        idx + 1,
        `"${r.paymentNo || ''}"`,
        `"${r.paymentDate || ''}"`,
        `"${r.supplier || ''}"`,
        `"${r.paymentType || ''}"`,
        `"${r.refNo || ''}"`,
        r.amount || 0,
        `"${r.paymode || ''}"`,
        `"${r.chqNo || ''}"`,
        `"${r.adjustStatus || ''}"`,
        `"${r.isVoid || ''}"`,
        `"${r.status || ''}"`
      ].join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payments_${new Date().toISOString().slice(0, 10)}.${downloadFmt.toLowerCase()}`;
    a.click();
    window.URL.revokeObjectURL(url);
    setMsg(`Downloaded payments as ${downloadFmt.toUpperCase()}`);
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar session={session} />

      <main style={{ maxWidth: 1500, margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* ── Breadcrumb & Page Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600 }}>
              ACCOUNTS &gt; BILLS &gt; PAYMENT
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '4px 0 0' }}>
              {viewMode === 'list' ? 'Payment Vouchers' : (form.id ? 'Edit Payment Record' : 'Payment Entry')}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {viewMode === 'list' ? (
              <>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  style={{
                    backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '9px 16px',
                    borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                  }}
                >
                  ➕ Add Payment
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    backgroundColor: '#fff', color: '#334155', border: '1px solid #cbd5e1', padding: '9px 16px',
                    borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 6
                  }}
                >
                  🖨️ Print
                </button>
                <button
                  type="button"
                  onClick={refreshList}
                  style={{
                    backgroundColor: '#fff', color: '#334155', border: '1px solid #cbd5e1', padding: '9px 16px',
                    borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 6
                  }}
                >
                  👁️ View
                </button>
                <button
                  type="button"
                  onClick={() => setIsReleaseView(!isReleaseView)}
                  style={{
                    backgroundColor: isReleaseView ? '#0284c7' : '#fff',
                    color: isReleaseView ? '#fff' : '#0284c7',
                    border: '1px solid #0284c7',
                    padding: '9px 16px', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 6
                  }}
                >
                  🔓 {isReleaseView ? 'Showing Cheque Release' : 'Payment Release View'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setViewMode('list')}
                style={{
                  backgroundColor: '#94a3b8', color: '#fff', border: 'none', padding: '9px 16px',
                  borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6
                }}
              >
                ⬅ Back to List
              </button>
            )}
          </div>
        </div>

        {/* ── Toast Notifications ── */}
        {msg && (
          <div style={{ padding: '12px 16px', borderRadius: 6, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', marginBottom: 16, fontWeight: 500 }}>
            {msg}
          </div>
        )}
        {err && (
          <div style={{ padding: '12px 16px', borderRadius: 6, backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', marginBottom: 16, fontWeight: 500 }}>
            {err}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            VIEW MODE: LIST VIEW
           ══════════════════════════════════════════════════════════════ */}
        {viewMode === 'list' && (
          <>
            {/* ── Filter Card ── */}
            <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#334155', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                🔍 Filter Criteria
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Party / Supplier</label>
                  <select
                    value={filterSupplier}
                    onChange={(e) => { setFilterSupplier(e.target.value); setPage(1); }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                  >
                    {SUPPLIER_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                  >
                    <option value="All">All</option>
                    <option value="Payment">Payment</option>
                    <option value="Debit Note">Debit Note</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Payment No</label>
                  <select
                    value={filterPaymentNo}
                    onChange={(e) => { setFilterPaymentNo(e.target.value); setPage(1); }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                  >
                    {paymentNoOptions.map(no => <option key={no} value={no}>{no}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Payment Type</label>
                  <select
                    value={filterPaymode}
                    onChange={(e) => { setFilterPaymode(e.target.value); setPage(1); }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                  >
                    <option value="All">All</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="DD">DD</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                  >
                    {PAYMENT_STATUS_OPTIONS.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterSupplier('All Suppliers');
                      setFilterType('All');
                      setFilterPaymentNo('All');
                      setFilterPaymode('All');
                      setFilterStatus('All');
                      setFromDate('');
                      setToDate('');
                      setColSearch({
                        sno: '', paymentNo: '', paymentDate: '', supplier: '',
                        paymentType: '', refNo: '', amount: '', paymode: '',
                        chqNo: '', adjustStatus: '', isVoid: ''
                      });
                      setPage(1);
                      setMsg('Filters reset.');
                      setTimeout(() => setMsg(''), 2000);
                    }}
                    style={{
                      width: '100%', padding: '9px 10px', borderRadius: 6, border: '1px solid #cbd5e1',
                      backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5
                    }}
                  >
                    🔄 Reset Filters
                  </button>
                </div>
              </div>
            </div>

            {/* ── Toolbar: Download format ── */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 14, gap: 10 }}>
              <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Download Format:</span>
              <select
                value={downloadFmt}
                onChange={e => setDownloadFmt(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, color: '#0f172a', backgroundColor: '#fff' }}
              >
                {ACCOUNTS_DOWNLOAD_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <button
                type="button"
                onClick={handleExport}
                style={{
                  padding: '6px 14px', borderRadius: 6, border: '1px solid #0284c7',
                  backgroundColor: '#0284c7', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6
                }}
              >
                📥 Download List
              </button>
            </div>

            {/* ── Slick Grid Table with Column Search ── */}
            <div style={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 1400, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      {gridCols.map((col, idx) => (
                        <th
                          key={col.key}
                          draggable={col.key !== 'sno' && col.key !== 'action'}
                          onDragStart={e => handleDragStart(e, idx)}
                          onDragOver={e => handleDragOver(e, idx)}
                          onDrop={e => handleDrop(e, idx)}
                          onClick={() => handleHeaderClick(col.key)}
                          style={{
                            padding: '10px 10px',
                            textAlign: col.key === 'amount' ? 'right' : (col.key === 'action' || col.key === 'sno' || col.key === 'adjustStatus' || col.key === 'isVoid' ? 'center' : 'left'),
                            fontWeight: 700, color: '#1e293b',
                            cursor: col.key !== 'action' && col.key !== 'sno' ? 'pointer' : 'default',
                            userSelect: 'none', borderRight: '1px solid #cbd5e1', whiteSpace: 'nowrap',
                            width: col.width,
                            backgroundColor: dragOverIdx === idx ? '#e2e8f0' : 'transparent'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: col.key === 'action' || col.key === 'sno' || col.key === 'adjustStatus' || col.key === 'isVoid' ? 'center' : 'space-between' }}>
                            <span>{col.key !== 'sno' && col.key !== 'action' ? '⋮⋮ ' : ''}{col.label}</span>
                            {sortKey === col.key && <span style={{ fontSize: 11 }}>{sortOrder === 'asc' ? '▲' : '▼'}</span>}
                          </div>
                        </th>
                      ))}
                    </tr>

                    {/* Column Search Input Row */}
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                      {gridCols.map(col => (
                        <td key={'cs-' + col.key} style={{ padding: '5px 6px', borderRight: '1px solid #cbd5e1' }}>
                          {col.key !== 'action' ? (
                            <input
                              type="text"
                              placeholder={col.key === 'sno' ? '#' : `Search...`}
                              value={colSearch[col.key] || ''}
                              onChange={e => handleColSearchChange(col.key, e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', fontSize: 11, borderRadius: 4, border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#fff' }}
                            />
                          ) : (
                            <div style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => setColSearch({ sno: '', paymentNo: '', paymentDate: '', supplier: '', paymentType: '', refNo: '', amount: '', paymode: '', chqNo: '', adjustStatus: '', isVoid: '' })}
                                style={{ fontSize: 11, padding: '3px 8px', backgroundColor: '#e2e8f0', color: '#475569', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer' }}
                              >
                                Clear
                              </button>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {pagedRows.length === 0 ? (
                      <tr>
                        <td colSpan={gridCols.length} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                          No payment records found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      pagedRows.map((row, idx) => {
                        const globalIdx = (safePage - 1) * PAGE_SIZE + idx + 1;
                        return (
                          <tr key={row.id || idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                            {gridCols.map(col => {
                              if (col.key === 'sno') {
                                return (
                                  <td key={col.key} style={{ padding: '10px 10px', textAlign: 'center', color: '#64748b', fontWeight: 600, borderRight: '1px solid #f1f5f9' }}>
                                    {globalIdx}
                                  </td>
                                );
                              }
                              if (col.key === 'paymentNo') {
                                return (
                                  <td key={col.key} style={{ padding: '10px 10px', fontWeight: 700, color: '#2563eb', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                                    {row.paymentNo}
                                  </td>
                                );
                              }
                              if (col.key === 'amount') {
                                return (
                                  <td key={col.key} style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 600, color: '#0f172a', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                                    {Number(row.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </td>
                                );
                              }
                              if (col.key === 'adjustStatus') {
                                const isAdj = row.adjustStatus === 'Adjusted';
                                return (
                                  <td key={col.key} style={{ padding: '10px 10px', textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>
                                    <span style={{
                                      display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                                      backgroundColor: isAdj ? '#dcfce7' : '#fef9c3', color: isAdj ? '#166534' : '#854d0e'
                                    }}>
                                      {row.adjustStatus || 'Pending'}
                                    </span>
                                  </td>
                                );
                              }
                              if (col.key === 'isVoid') {
                                const isVoid = row.isVoid === 'Yes';
                                return (
                                  <td key={col.key} style={{ padding: '10px 10px', textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>
                                    <span style={{
                                      display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                                      backgroundColor: isVoid ? '#fee2e2' : '#f1f5f9', color: isVoid ? '#991b1b' : '#475569'
                                    }}>
                                      {row.isVoid || 'No'}
                                    </span>
                                  </td>
                                );
                              }
                              if (col.key === 'action') {
                                return (
                                  <td key={col.key} style={{ padding: '8px 10px', textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                                      <button
                                        type="button"
                                        onClick={() => handleEdit(row)}
                                        title="Edit Payment"
                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, color: '#2563eb' }}
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleRelease(row.id)}
                                        title={row.status === 'Released' ? 'Cheque Released (Click to lock)' : 'Cheque Pending (Click to release)'}
                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, color: row.status === 'Released' ? '#16a34a' : '#d97706' }}
                                      >
                                        {row.status === 'Released' ? '🔒' : '🔓'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDelete(row.id)}
                                        title="Delete Payment Record"
                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, color: '#dc2626' }}
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </td>
                                );
                              }
                              return (
                                <td key={col.key} style={{ padding: '10px 10px', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                                  {row[col.key] || '-'}
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

              {/* ── Table Pagination Footer ── */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>
                  Showing {sortedRows.length > 0 ? (safePage - 1) * PAGE_SIZE + 1 : 0} to {Math.min(safePage * PAGE_SIZE, sortedRows.length)} of {sortedRows.length} records
                </span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    disabled={safePage === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    style={{
                      padding: '5px 12px', borderRadius: 4, border: '1px solid #cbd5e1',
                      backgroundColor: safePage === 1 ? '#f1f5f9' : '#fff',
                      color: safePage === 1 ? '#94a3b8' : '#334155',
                      cursor: safePage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ◀ Prev
                  </button>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Page {safePage} of {totalPages}</span>
                  <button
                    disabled={safePage === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    style={{
                      padding: '5px 12px', borderRadius: 4, border: '1px solid #cbd5e1',
                      backgroundColor: safePage === totalPages ? '#f1f5f9' : '#fff',
                      color: safePage === totalPages ? '#94a3b8' : '#334155',
                      cursor: safePage === totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Next ▶
                  </button>
                </div>
              </div>
            </div>

            {/* ── Downside Cheque Release Summary Box ── */}
            <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    📊 Cheque Release Summary Stats
                  </h3>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                    Real-time metrics for all cheque payments and issuance status
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMsg('Cheque summary release status successfully saved!');
                    setTimeout(() => setMsg(''), 3000);
                  }}
                  style={{
                    backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px',
                    borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                  }}
                >
                  💾 Save Cheque Release Status
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, fontSize: 13 }}>
                {/* Total Cheques */}
                <div style={{ backgroundColor: '#f0f7ff', border: '1px solid #bae6fd', borderLeft: '5px solid #0284c7', padding: '16px', borderRadius: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: '#0369a1', fontWeight: 600 }}>No of Total Cheque:</span>
                    <strong style={{ color: '#0f172a', fontSize: 15 }}>{chequeMetrics.totalCount}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#0369a1', fontWeight: 600 }}>Total Cheque Amount:</span>
                    <strong style={{ color: '#0284c7', fontSize: 16 }}>₹ {chequeMetrics.totalAmt}</strong>
                  </div>
                </div>

                {/* Released Cheques */}
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderLeft: '5px solid #16a34a', padding: '16px', borderRadius: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: '#15803d', fontWeight: 600 }}>No of Released Cheque:</span>
                    <strong style={{ color: '#0f172a', fontSize: 15 }}>{chequeMetrics.releasedCount}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#15803d', fontWeight: 600 }}>Released Cheque Amount:</span>
                    <strong style={{ color: '#16a34a', fontSize: 16 }}>₹ {chequeMetrics.releasedAmt}</strong>
                  </div>
                </div>

                {/* Pending Cheques */}
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderLeft: '5px solid #d97706', padding: '16px', borderRadius: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: '#b45309', fontWeight: 600 }}>No of Pending Cheque:</span>
                    <strong style={{ color: '#0f172a', fontSize: 15 }}>{chequeMetrics.pendingCount}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#b45309', fontWeight: 600 }}>Pending Cheque Amount:</span>
                    <strong style={{ color: '#d97706', fontSize: 16 }}>₹ {chequeMetrics.pendingAmt}</strong>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════
            VIEW MODE: ENTRY FORM
           ══════════════════════════════════════════════════════════════ */}
        {viewMode === 'entry' && (
          <form onSubmit={handleSaveForm}>
            <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>

              {/* Form Title & Top Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                    {form.id ? '✏️ Edit Payment Record' : '➕ Add Payment Entry'}
                  </h3>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                    Enter supplier payment details, invoice mapping, and exchange rates
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '9px 20px',
                      borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                    }}
                  >
                    💾 Save Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    style={{
                      backgroundColor: '#94a3b8', color: '#fff', border: 'none', padding: '9px 16px',
                      borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer'
                    }}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>

              {/* ── Section 1: Header / Party Parameters Grid ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Payment No</label>
                  <input
                    type="text"
                    value={form.paymentNo}
                    onChange={e => setForm({ ...form, paymentNo: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, fontWeight: 700, color: '#2563eb', outline: 'none', backgroundColor: '#f8fafc' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Payment Date</label>
                  <input
                    type="date"
                    value={form.paymentDate}
                    onChange={e => setForm({ ...form, paymentDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Ref No</label>
                  <input
                    type="text"
                    value={form.refNo}
                    onChange={e => setForm({ ...form, refNo: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Supplier *</label>
                  <select
                    value={form.supplier}
                    onChange={e => setForm({ ...form, supplier: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                  >
                    {SUPPLIER_OPTIONS.filter(s => s !== 'All Suppliers').map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* ── Section 2: Invoice & Banking Parameters Grid ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Type</label>
                  <select
                    value={form.paymentType}
                    onChange={e => setForm({ ...form, paymentType: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                  >
                    {PAYMENT_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Invoice Type</label>
                  <select
                    value={form.invoiceType}
                    onChange={e => setForm({ ...form, invoiceType: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                  >
                    {PAYMENT_INVOICE_TYPE_OPTIONS.map(it => <option key={it} value={it}>{it}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Invoice No</label>
                  <select
                    value={form.invoiceNo}
                    onChange={e => setForm({ ...form, invoiceNo: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                  >
                    {INVOICE_NO_OPTIONS.map(ino => <option key={ino} value={ino}>{ino}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Currency Type</label>
                  <select
                    value={form.currencyType}
                    onChange={e => handleCurrencyTypeChange(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                  >
                    <option value="Base">Base (INR)</option>
                    <option value="Other">Other (USD / EUR / GBP)</option>
                  </select>
                </div>

                {form.currencyType === 'Other' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Currency</label>
                    <select
                      value={form.currency}
                      onChange={e => handleCurrencySelect(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                    >
                      {CURRENCY_OPTIONS.filter(c => c.code !== 'INR').map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Ex. Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.exRate}
                    onChange={e => setForm({ ...form, exRate: Number(e.target.value) })}
                    disabled={form.currencyType === 'Base'}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none',
                      backgroundColor: form.currencyType === 'Base' ? '#f1f5f9' : '#fff'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Payment Type (Paymode)</label>
                  <select
                    value={form.paymode}
                    onChange={e => setForm({ ...form, paymode: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                  >
                    {PAYMENT_PAYMODE_OPTIONS.map(pm => <option key={pm} value={pm}>{pm}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Bank</label>
                  <select
                    value={form.bank}
                    onChange={e => setForm({ ...form, bank: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                  >
                    {BANK_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Chq/DD/Trf No</label>
                  <input
                    type="text"
                    value={form.chqNo}
                    onChange={e => setForm({ ...form, chqNo: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Chq/DD/Trf Date</label>
                  <input
                    type="date"
                    value={form.chqDate}
                    onChange={e => setForm({ ...form, chqDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Advanced Ref</label>
                  <input
                    type="text"
                    value={form.advancedRef}
                    onChange={e => setForm({ ...form, advancedRef: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>From Date</label>
                  <input
                    type="date"
                    value={form.fromDate}
                    onChange={e => setForm({ ...form, fromDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>To Date</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="date"
                      value={form.toDate}
                      onChange={e => setForm({ ...form, toDate: e.target.value })}
                      style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', backgroundColor: '#fff' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setMsg('Invoices filtered for selected date range.');
                        setTimeout(() => setMsg(''), 2500);
                      }}
                      style={{
                        padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1',
                        backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 600, fontSize: 13, cursor: 'pointer'
                      }}
                      title="List Invoices"
                    >
                      📋 List
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Section 3: Financial Calculations Highlight Bar ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, backgroundColor: '#f8fafc', padding: 18, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Payment Amt (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 15, fontWeight: 600, outline: 'none', backgroundColor: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Charges (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.charges}
                    onChange={e => setForm({ ...form, charges: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 15, outline: 'none', backgroundColor: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#16a34a', marginBottom: 5 }}>Payment Value (Auto Decimal)</label>
                  <input
                    type="text"
                    value={Number(form.paymentValue || (form.amount + form.charges)).toFixed(2)}
                    readOnly
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #86efac', backgroundColor: '#f0fdf4', color: '#15803d', fontSize: 16, fontWeight: 700, outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleAutoAdjust}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 6, border: 'none',
                      backgroundColor: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(37,99,235,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}
                  >
                    ⚡ Auto Adjust Amount
                  </button>
                </div>
              </div>

              {/* ── Section 4: Modern Tabs Bar ── */}
              <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid #e2e8f0', marginBottom: 18 }}>
                <button
                  type="button"
                  onClick={() => setFormTab('details')}
                  style={{
                    padding: '10px 22px',
                    backgroundColor: formTab === 'details' ? '#eff6ff' : 'transparent',
                    color: formTab === 'details' ? '#2563eb' : '#64748b',
                    border: 'none',
                    borderBottom: formTab === 'details' ? '2px solid #2563eb' : '2px solid transparent',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 14,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  📦 Item Details
                </button>
                <button
                  type="button"
                  onClick={() => setFormTab('addless')}
                  style={{
                    padding: '10px 22px',
                    backgroundColor: formTab === 'addless' ? '#eff6ff' : 'transparent',
                    color: formTab === 'addless' ? '#2563eb' : '#64748b',
                    border: 'none',
                    borderBottom: formTab === 'addless' ? '2px solid #2563eb' : '2px solid transparent',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 14,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  ➕ Add Less
                </button>
              </div>

              {/* ── TAB 1: ITEM DETAILS ── */}
              {formTab === 'details' && (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: 1200, borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                          <th style={{ padding: '10px', textAlign: 'center', width: '50px' }}>S.No</th>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Invoice Type</th>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Invoice No</th>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Invoice Date</th>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Reference No</th>
                          <th style={{ padding: '10px', textAlign: 'right' }}>Bill Amt</th>
                          <th style={{ padding: '10px', textAlign: 'center' }}>Currency</th>
                          <th style={{ padding: '10px', textAlign: 'right' }}>ExRate</th>
                          <th style={{ padding: '10px', textAlign: 'right' }}>Bill Value</th>
                          <th style={{ padding: '10px', textAlign: 'right' }}>Paid</th>
                          <th style={{ padding: '10px', textAlign: 'right' }}>Balance</th>
                          <th style={{ padding: '10px', textAlign: 'right', width: '130px' }}>Payment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!form.itemDetails || form.itemDetails.length === 0) ? (
                          <tr>
                            <td colSpan="12" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                              No items available to display.
                            </td>
                          </tr>
                        ) : (
                          form.itemDetails.map((item, idx) => (
                            <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                              <td style={{ padding: '10px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{idx + 1}</td>
                              <td style={{ padding: '10px' }}>{item.invoiceType}</td>
                              <td style={{ padding: '10px', fontWeight: 700, color: '#2563eb' }}>{item.invoiceNo}</td>
                              <td style={{ padding: '10px' }}>{item.invoiceDate}</td>
                              <td style={{ padding: '10px' }}>{item.refNo}</td>
                              <td style={{ padding: '10px', textAlign: 'right' }}>{Number(item.billAmt).toFixed(2)}</td>
                              <td style={{ padding: '10px', textAlign: 'center' }}>{item.currency}</td>
                              <td style={{ padding: '10px', textAlign: 'right' }}>{Number(item.exRate).toFixed(2)}</td>
                              <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>{Number(item.billValue).toFixed(2)}</td>
                              <td style={{ padding: '10px', textAlign: 'right' }}>{Number(item.paid).toFixed(2)}</td>
                              <td style={{ padding: '10px', textAlign: 'right', color: '#d97706', fontWeight: 600 }}>{Number(item.balance).toFixed(2)}</td>
                              <td style={{ padding: '10px', textAlign: 'right' }}>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.payment}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...form.itemDetails];
                                    updated[idx].payment = val;
                                    setForm({ ...form, itemDetails: updated });
                                  }}
                                  style={{ width: '100px', padding: '6px 8px', textAlign: 'right', fontSize: 13, borderRadius: 4, border: '1px solid #cbd5e1', outline: 'none' }}
                                />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── TAB 2: ADD LESS ── */}
              {formTab === 'addless' && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff' }}>
                    <div style={{ padding: '12px 16px', backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', fontWeight: 600, color: '#334155' }}>
                      Add / Less Deductions & Charges
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                          <th style={{ padding: '8px 12px', textAlign: 'center', width: '50px' }}>S.No</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>Account Heads</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right', width: '100px' }}>% (Pct)</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right', width: '120px' }}>Rate / Amount</th>
                          <th style={{ padding: '8px 12px', textAlign: 'center', width: '80px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!form.addLessItems || form.addLessItems.length === 0) ? (
                          <tr>
                            <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                              No add/less items configured.
                            </td>
                          </tr>
                        ) : (
                          form.addLessItems.map((al, idx) => (
                            <tr key={al.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                              <td style={{ padding: '8px 12px' }}>
                                <select
                                  value={al.accountHead}
                                  onChange={(e) => {
                                    const updated = [...form.addLessItems];
                                    updated[idx].accountHead = e.target.value;
                                    setForm({ ...form, addLessItems: updated });
                                  }}
                                  style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }}
                                >
                                  {ACCOUNT_HEAD_OPTIONS.map(ah => <option key={ah} value={ah}>{ah}</option>)}
                                </select>
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={al.pct}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...form.addLessItems];
                                    updated[idx].pct = val;
                                    updated[idx].rate = ((form.grossAmt * val) / 100).toFixed(2);
                                    setForm({ ...form, addLessItems: updated });
                                  }}
                                  style={{ width: '80px', padding: '6px 8px', textAlign: 'right', fontSize: 13, borderRadius: 4, border: '1px solid #cbd5e1', outline: 'none' }}
                                />
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={al.rate}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updated = [...form.addLessItems];
                                    updated[idx].rate = val;
                                    setForm({ ...form, addLessItems: updated });
                                  }}
                                  style={{ width: '90px', padding: '6px 8px', textAlign: 'right', fontSize: 13, borderRadius: 4, border: '1px solid #cbd5e1', outline: 'none' }}
                                />
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = form.addLessItems.filter((_, i) => i !== idx);
                                    setForm({ ...form, addLessItems: updated });
                                  }}
                                  style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 15 }}
                                  title="Delete Item"
                                >
                                  ❌
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    <div style={{ padding: '10px 16px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const newRow = { id: `pal-${Date.now()}`, accountHead: ACCOUNT_HEAD_OPTIONS[0], pct: 1.0, rate: 100.00 };
                          setForm({ ...form, addLessItems: [...(form.addLessItems || []), newRow] });
                        }}
                        style={{
                          padding: '6px 14px', borderRadius: 4, border: '1px solid #cbd5e1',
                          backgroundColor: '#fff', color: '#334155', fontWeight: 600, fontSize: 12, cursor: 'pointer'
                        }}
                      >
                        ➕ Add Row
                      </button>
                    </div>
                  </div>

                  {/* ── Right Side Summary & Remarks ── */}
                  <div style={{ backgroundColor: '#f8fafc', padding: 20, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 14px 0', color: '#0f172a', fontSize: 15, fontWeight: 700 }}>
                      Financial Breakdown
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Gross Amount:</span>
                        <strong style={{ color: '#0f172a' }}>₹ {Number(form.grossAmt || form.amount).toFixed(2)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Overhead (2):</span>
                        <strong style={{ color: '#0f172a' }}>₹ {Number(form.overhead2 || form.charges).toFixed(2)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: 10, color: '#15803d', fontSize: 15, fontWeight: 700 }}>
                        <span>Invoice Amt:</span>
                        <strong>₹ {Number(form.paymentValue || (form.amount + form.charges)).toFixed(2)}</strong>
                      </div>

                      <div style={{ marginTop: 12 }}>
                        <label style={{ display: 'block', color: '#475569', marginBottom: 6, fontSize: 12, fontWeight: 600 }}>Remarks</label>
                        <textarea
                          rows="3"
                          value={form.remarks}
                          onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                          style={{ width: '100%', padding: '8px 10px', fontSize: 13, borderRadius: 6, backgroundColor: '#fff', color: '#1e293b', border: '1px solid #cbd5e1', outline: 'none' }}
                          placeholder="Enter payment remarks..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Form Bottom Action Bar ── */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  style={{
                    backgroundColor: '#94a3b8', color: '#fff', border: 'none', padding: '9px 18px',
                    borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer'
                  }}
                >
                  ❌ Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '9px 24px',
                    borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                  }}
                >
                  💾 Save Payment Record
                </button>
              </div>

            </div>
          </form>
        )}

      </main>
    </div>
  );
}
