import { useState } from 'react';
import Navbar from '../components/Navbar';
import { getSession } from '../auth';
import { CUSTOMER_LIST, INITIAL_INV_PROFIT_STATEMENT } from '../misqueryConfig';
import BlueSelect from '../components/BlueSelect';

const PROFIT_COMPANY_LIST = ['-- All --', 'FRONTIER FASHIONS', 'FRONTIER KNITTERS (P) LTD', 'FRONTIER PRINTING'];
const PROFIT_BUYER_LIST = ['-- All --', ...CUSTOMER_LIST.filter((c) => c !== '--Select--')];
const INVOICE_STATUS_OPTIONS = ['Active', 'Closed', 'Valid', 'Cancel', 'All'];
const STATUS_COLORS = {
  Active: { bg: '#dcfce7', color: '#166534' },
  Closed: { bg: '#e2e8f0', color: '#475569' },
  Valid: { bg: '#dbeafe', color: '#1d4ed8' },
  Cancel: { bg: '#fee2e2', color: '#b91c1c' },
};

export default function MisqueryLogisticsInvProfitStatement() {
  const session = getSession() || { username: 'superadmin', role: 'Super Admin' };
  const [activeCompany, setActiveCompany] = useState(false);
  const [company, setCompany] = useState('-- All --');
  const [activeBuyer, setActiveBuyer] = useState(false);
  const [buyer, setBuyer] = useState('-- All --');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState('All');
  const [exportChecked, setExportChecked] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [records, setRecords] = useState([]);
  const [displayFrom, setDisplayFrom] = useState('');
  const [displayTo, setDisplayTo] = useState('');

  const handleClear = () => {
    setActiveCompany(false); setCompany('-- All --');
    setActiveBuyer(false); setBuyer('-- All --');
    setInvoiceNo(''); setFromDate(''); setToDate('');
    setInvoiceStatus('All'); setExportChecked(false);
    setSubmitted(false); setRecords([]);
    setDisplayFrom(''); setDisplayTo('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDisplayFrom(fromDate); setDisplayTo(toDate);
    const tInv = invoiceNo.trim().toLowerCase();
    const filtered = INITIAL_INV_PROFIT_STATEMENT.filter((r) => {
      if (activeCompany && company !== '-- All --' && r.company !== company) return false;
      if (activeBuyer && buyer !== '-- All --' && r.buyer !== buyer) return false;
      if (tInv && !String(r.invoiceNo || '').toLowerCase().includes(tInv)) return false;
      if (invoiceStatus !== 'All' && r.status !== invoiceStatus) return false;
      if (fromDate && r.invoiceDate && r.invoiceDate < fromDate) return false;
      if (toDate && r.invoiceDate && r.invoiceDate > toDate) return false;
      return true;
    });
    setRecords(filtered); setSubmitted(true);
  };

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

  const totalInvoiceValue = records.reduce((s, r) => s + (Number(r.invoiceValue) || 0), 0);
  const totalProfit = records.reduce((s, r) => s + (Number(r.profit) || 0), 0);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar session={session} />
      <main style={{ maxWidth: 1600, margin: '0 auto', padding: '24px 20px 60px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          📈 Invoice Wise Profitability Statement
        </h1>
        {!submitted && (
          <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a8a', margin: '0 0 16px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
              Query Options <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginLeft: 10 }}>Fields </span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px 24px', marginBottom: 20, backgroundColor: '#f1f5f9', padding: 16, borderRadius: 8 }}>
              {radioDropdown('Company', activeCompany, setActiveCompany, company, setCompany, PROFIT_COMPANY_LIST)}
              {radioDropdown('Buyer', activeBuyer, setActiveBuyer, buyer, setBuyer, PROFIT_BUYER_LIST)}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', minWidth: 110 }}>Invoice no</label>
                <input type="text" className="inp" placeholder="e.g. EXP-INV-2026-401" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} style={{ flex: 1 }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div style={{ padding: 16, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice Date</span>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="field" style={{ flex: 1, minWidth: 140, margin: 0 }}>
                    <label>From</label>
                    <input type="date" className="inp" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div className="field" style={{ flex: 1, minWidth: 140, margin: 0 }}>
                    <label>To</label>
                    <input type="date" className="inp" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
              <div style={{ padding: 16, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {INVOICE_STATUS_OPTIONS.map((opt) => (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                      <input type="radio" name="invProfitStatus" checked={invoiceStatus === opt} onChange={() => setInvoiceStatus(opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ padding: 16, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, display: 'flex', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={exportChecked} onChange={(e) => setExportChecked(e.target.checked)} style={{ width: 16, height: 16 }} />
                  Export
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn" style={{ padding: '10px 28px', fontSize: 14, fontWeight: 700 }}>Submit</button>
              <button type="button" onClick={handleClear} style={{ padding: '10px 24px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Clear</button>
            </div>
          </form>
        )}
        {submitted && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
              <button type="button" onClick={() => setSubmitted(false)} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #94a3b8', backgroundColor: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                &#8592; Modify Query
              </button>
            </div>
            <div style={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Invoice Wise Profitability Statement — {invoiceStatus}</h3>
                  {(displayFrom || displayTo) && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                      Invoice Date: {displayFrom || '-'} to {displayTo || '-'}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', backgroundColor: '#dbeafe', padding: '4px 12px', borderRadius: 20 }}>Records: {records.length}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f766e', backgroundColor: '#ccfbf1', padding: '4px 12px', borderRadius: 20 }}>Total Invoice Value: {totalInvoiceValue.toLocaleString()}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#166534', backgroundColor: '#dcfce7', padding: '4px 12px', borderRadius: 20 }}>Total Profit: {totalProfit.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', minWidth: 1300, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>S.No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Invoice No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Invoice Date</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Company</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Buyer</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Order No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Qty</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Invoice Value</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Cost</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Profit</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Profit %</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length === 0 ? (
                      <tr><td colSpan={12} style={{ padding: 32, textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>No records found for the selected query options.</td></tr>
                    ) : records.map((r, idx) => (
                      <tr key={r.id || idx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '10px 12px' }}>{r.sNo || idx + 1}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.invoiceNo}</td>
                        <td style={{ padding: '10px 12px' }}>{r.invoiceDate}</td>
                        <td style={{ padding: '10px 12px' }}>{r.company}</td>
                        <td style={{ padding: '10px 12px' }}>{r.buyer}</td>
                        <td style={{ padding: '10px 12px' }}>{r.orderNo}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.qty}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.invoiceValue}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.cost}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#166534' }}>{r.profit}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{r.profitPct}%</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, backgroundColor: (STATUS_COLORS[r.status] || {}).bg || '#f1f5f9', color: (STATUS_COLORS[r.status] || {}).color || '#475569' }}>{r.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}