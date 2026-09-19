import { useState } from 'react';
import Navbar from '../components/Navbar';
import { getSession } from '../auth';
import { CUSTOMER_LIST, INITIAL_COMMISSION_REGISTER } from '../misqueryConfig';
import BlueSelect from '../components/BlueSelect';

// Commission Register dropdown lists
const COMMISSION_COMPANY_LIST = ['-- All --', 'FRONTIER FASHIONS', 'FRONTIER KNITTERS (P) LTD', 'FRONTIER PRINTING'];
const COMMISSION_CUSTOMER_LIST = ['-- All --', ...CUSTOMER_LIST.filter((c) => c !== '--Select--')];
const COMMISSION_SUPPLIER_LIST = ['-- All --', 'Lakshmi Yarns & Synthetics Pvt Ltd', 'Cotton Craft Synthetics Ltd', 'Apex Spinners & Weavers', 'Vardhman Yarns & Threads', 'Sun Dyes & Chemicals Ltd', 'Global Tex Equipment Spares'];
const COMMISSION_INVOICE_TYPE_LIST = ['-- Both --', 'Export Invoice', 'General Invoice', 'Process Invoice', 'Contract Invoice'];
const COMMISSION_PAY_MODE_LIST = ['-- All --', 'Cash', 'Cheque', 'DD', 'Transfer', 'Net Banking', 'Not Applicable'];

const INVOICE_STATUS_OPTIONS = ['Active', 'Closed', 'Valid', 'Cancel', 'All'];

const STATUS_COLORS = {
  Active: { bg: '#dcfce7', color: '#166534' },
  Closed: { bg: '#e2e8f0', color: '#475569' },
  Valid: { bg: '#dbeafe', color: '#1d4ed8' },
  Cancel: { bg: '#fee2e2', color: '#b91c1c' },
};

export default function MisqueryLogisticsCommissionRegister() {
  const session = getSession() || { username: 'superadmin', role: 'Super Admin' };

  // ── Radio + Dropdown combos ──
  const [activeCompany,     setActiveCompany]     = useState(false);
  const [company,           setCompany]           = useState('-- All --');
  const [activeInvoiceType, setActiveInvoiceType] = useState(false);
  const [invoiceType,       setInvoiceType]       = useState('-- Both --');
  const [activeCustomer,    setActiveCustomer]    = useState(false);
  const [customer,          setCustomer]          = useState('-- All --');
  const [activeSupplier,    setActiveSupplier]    = useState(false);
  const [supplier,          setSupplier]          = useState('-- All --');
  const [activePayMode,     setActivePayMode]     = useState(false);
  const [payMode,           setPayMode]           = useState('-- All --');

  // ── Radio + Input field ──
  const [activeInvoiceNo, setActiveInvoiceNo] = useState(false);
  const [invoiceNo,       setInvoiceNo]       = useState('');

  // ── From / To dates ──
  const [fromDate, setFromDate] = useState('');
  const [toDate,   setToDate]   = useState('');

  // ── Status radio ──
  const [invoiceStatus, setInvoiceStatus] = useState('All');

  // ── Display checkboxes ──
  const [buyerSummary,    setBuyerSummary]    = useState(false);
  const [supplierSummary, setSupplierSummary] = useState(false);

  // ── Table state ──
  const [submitted,   setSubmitted]   = useState(false);
  const [records,     setRecords]     = useState([]);
  const [displayFrom, setDisplayFrom] = useState('');
  const [displayTo,   setDisplayTo]   = useState('');

  const handleClear = () => {
    setActiveCompany(false);     setCompany('-- All --');
    setActiveInvoiceType(false); setInvoiceType('-- Both --');
    setActiveCustomer(false);    setCustomer('-- All --');
    setActiveSupplier(false);    setSupplier('-- All --');
    setActivePayMode(false);     setPayMode('-- All --');
    setActiveInvoiceNo(false);   setInvoiceNo('');
    setFromDate('');
    setToDate('');
    setInvoiceStatus('All');
    setBuyerSummary(false);
    setSupplierSummary(false);
    setSubmitted(false);
    setRecords([]);
    setDisplayFrom('');
    setDisplayTo('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDisplayFrom(fromDate);
    setDisplayTo(toDate);

    const tInv = invoiceNo.trim().toLowerCase();

    const filtered = INITIAL_COMMISSION_REGISTER.filter((r) => {
      if (activeCompany && company !== '-- All --' && r.company !== company) return false;
      if (activeInvoiceType && invoiceType !== '-- Both --' && r.invoiceType !== invoiceType) return false;
      if (activeCustomer && customer !== '-- All --' && r.customer !== customer) return false;
      if (activeSupplier && supplier !== '-- All --' && r.supplier !== supplier) return false;
      if (activePayMode && payMode !== '-- All --' && r.payMode !== payMode) return false;
      if (tInv && !String(r.invoiceNo || '').toLowerCase().includes(tInv)) return false;
      if (invoiceStatus !== 'All' && r.status !== invoiceStatus) return false;
      if (fromDate && r.invoiceDate && r.invoiceDate < fromDate) return false;
      if (toDate && r.invoiceDate && r.invoiceDate > toDate) return false;
      return true;
    });

    setRecords(filtered);
    setSubmitted(true);
  };

  /** Radio + dropdown combo row */
  const radioDropdown = (label, active, setActive, value, setValue, options) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 110 }}>
        <input type="radio" checked={active} onChange={() => setActive(!active)} onClick={() => setActive(!active)} />
        {label}
      </label>
      <BlueSelect className="inp" value={value} onChange={(e) => setValue(e.target.value)} style={{ flex: 1 }}>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </BlueSelect>
    </div>
  );

  /** Radio + free-text input combo row */
  const radioInput = (label, active, setActive, value, setValue, placeholder) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 110 }}>
        <input type="radio" checked={active} onChange={() => setActive(!active)} onClick={() => setActive(!active)} />
        {label}
      </label>
      <input type="text" className="inp" placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} style={{ flex: 1 }} />
    </div>
  );

  /** Group records for the summary views */
  const groupSum = (rows, key) => {
    const map = new Map();
    rows.forEach((r) => {
      const k = r[key] || '—';
      const prev = map.get(k) || { label: k, invoices: 0, amount: 0 };
      prev.invoices += 1;
      prev.amount += Number(r.commissionAmount) || 0;
      map.set(k, prev);
    });
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  };

  const totalCommission = records.reduce((s, r) => s + (Number(r.commissionAmount) || 0), 0);
  const buyerRows = groupSum(records, 'customer');
  const supplierRows = groupSum(records, 'supplier');

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar session={session} />

      <main style={{ maxWidth: 1600, margin: '0 auto', padding: '24px 20px 60px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          💹 Commission Register
        </h1>

        {/* QUERY OPTIONS FORM */}
        {!submitted && (
          <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a8a', margin: '0 0 16px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
              Query Options <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginLeft: 10 }}>Fields </span>
            </h2>

            {/* Row 1 — Radio + Dropdown / Radio + Input combos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px 24px', marginBottom: 20, backgroundColor: '#f1f5f9', padding: 16, borderRadius: 8 }}>
              {radioDropdown('Company', activeCompany, setActiveCompany, company, setCompany, COMMISSION_COMPANY_LIST)}
              {radioInput('Invoice no', activeInvoiceNo, setActiveInvoiceNo, invoiceNo, setInvoiceNo, 'e.g. EXP-INV-2026-301')}
              {radioDropdown('Invoice Type', activeInvoiceType, setActiveInvoiceType, invoiceType, setInvoiceType, COMMISSION_INVOICE_TYPE_LIST)}
              {radioDropdown('Customer', activeCustomer, setActiveCustomer, customer, setCustomer, COMMISSION_CUSTOMER_LIST)}
              {radioDropdown('Supplier', activeSupplier, setActiveSupplier, supplier, setSupplier, COMMISSION_SUPPLIER_LIST)}
              {radioDropdown('Pay Mode', activePayMode, setActivePayMode, payMode, setPayMode, COMMISSION_PAY_MODE_LIST)}
            </div>

            {/* Row 2 — From / To dates */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div style={{ padding: 16, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</span>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="field" style={{ flex: 1, minWidth: 140, margin: 0 }}>
                    <label>From</label>
                    <input type="date" className="inp" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                  </div>
                  <span style={{ color: '#94a3b8', marginTop: 20 }}>to</span>
                  <div className="field" style={{ flex: 1, minWidth: 140, margin: 0 }}>
                    <label>To</label>
                    <input type="date" className="inp" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                  </div>
                </div>
              </div>

              <div style={{ padding: 16, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 20px' }}>
                  {INVOICE_STATUS_OPTIONS.map((s) => (
                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                      <input type="radio" name="invoiceStatus" checked={invoiceStatus === s} onChange={() => setInvoiceStatus(s)} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3 — Display checkboxes */}
            <div style={{ padding: 16, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 20 }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Display</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 28px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={buyerSummary} onChange={(e) => setBuyerSummary(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
                  Buyer summary
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={supplierSummary} onChange={(e) => setSupplierSummary(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
                  Supplier Summary
                </label>
              </div>
            </div>

            {/* Row 4 — Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={handleClear} style={{ padding: '8px 20px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Clear
                </button>
                <button type="submit" style={{ padding: '8px 24px', borderRadius: 6, border: 'none', backgroundColor: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}>
                  Submit
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ── RESULTS (Tracking style) ── */}
        {submitted && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #94a3b8', backgroundColor: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                &#8592; Modify Query
              </button>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Commission Register — {invoiceStatus}</h3>
                  {(displayFrom || displayTo) && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                      Date: {displayFrom || '-'} to {displayTo || '-'}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', backgroundColor: '#dbeafe', padding: '4px 12px', borderRadius: 20 }}>
                    Records: {records.length}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#166534', backgroundColor: '#dcfce7', padding: '4px 12px', borderRadius: 20 }}>
                    Total Commission: {totalCommission.toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', minWidth: 1400, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>S.No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Invoice No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Invoice Date</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Invoice Type</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Company</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Customer</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Supplier</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Pay Mode</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Currency</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Comm %</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Commission Amt</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={12} style={{ padding: 32, textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                          No records found for the given query.
                        </td>
                      </tr>
                    ) : (
                      records.map((r, idx) => {
                        const c = STATUS_COLORS[r.status] || { bg: '#f1f5f9', color: '#475569' };
                        return (
                          <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                            <td style={{ padding: '10px 12px' }}>{idx + 1}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1e40af' }}>{r.invoiceNo}</td>
                            <td style={{ padding: '10px 12px' }}>{r.invoiceDate}</td>
                            <td style={{ padding: '10px 12px' }}>{r.invoiceType}</td>
                            <td style={{ padding: '10px 12px' }}>{r.company}</td>
                            <td style={{ padding: '10px 12px' }}>{r.customer}</td>
                            <td style={{ padding: '10px 12px' }}>{r.supplier}</td>
                            <td style={{ padding: '10px 12px' }}>{r.payMode}</td>
                            <td style={{ padding: '10px 12px' }}>{r.currency}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.commissionPct}%</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{Number(r.commissionAmount || 0).toLocaleString()}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12, backgroundColor: c.bg, color: c.color }}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Buyer Summary (Display option) */}
            {buyerSummary && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ padding: '14px 20px', backgroundColor: '#ecfdf5', borderBottom: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#065f46' }}>Buyer Summary</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>S.No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Customer</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Invoices</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Commission Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buyerRows.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>No records found for the given query.</td>
                      </tr>
                    ) : (
                      buyerRows.map((g, i) => (
                        <tr key={g.label} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                          <td style={{ padding: '10px 12px' }}>{i + 1}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 600 }}>{g.label}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>{g.invoices}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{g.amount.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Supplier Summary (Display option) */}
            {supplierSummary && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ padding: '14px 20px', backgroundColor: '#eff6ff', borderBottom: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e40af' }}>Supplier Summary</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>S.No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Supplier</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Invoices</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Commission Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierRows.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>No records found for the given query.</td>
                      </tr>
                    ) : (
                      supplierRows.map((g, i) => (
                        <tr key={g.label} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                          <td style={{ padding: '10px 12px' }}>{i + 1}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 600 }}>{g.label}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>{g.invoices}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{g.amount.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}