import { useState } from 'react';
import Navbar from '../components/Navbar';
import { getSession } from '../auth';
import { CUSTOMER_LIST, COUNTRY_LIST, INITIAL_INVOICE_REGISTER } from '../misqueryConfig';

// Register companies per the Invoice Register spec
const INVOICE_REGISTER_COMPANY_LIST = ['-- All --', 'FRONTIER FASHIONS', 'FRONTIER KNITTERS (P) LTD', 'FRONTIER PRINTING'];

const INVOICE_REGISTER_CUSTOMER_LIST = ['-- All --', ...CUSTOMER_LIST.filter((c) => c !== '--Select--')];

const INVOICE_STATUS_OPTIONS = ['Active', 'Closed', 'Valid', 'Cancel', 'All'];

const STATUS_COLORS = {
  Active: { bg: '#dcfce7', color: '#166534' },
  Closed: { bg: '#e2e8f0', color: '#475569' },
  Valid: { bg: '#dbeafe', color: '#1d4ed8' },
  Cancel: { bg: '#fee2e2', color: '#b91c1c' },
};

export default function MisqueryInvoiceRegister() {
  const session = getSession() || { username: 'superadmin', role: 'Super Admin' };

  // ── Radio + Dropdown combos ──
  const [activeCompany,  setActiveCompany]  = useState(false);
  const [company,        setCompany]        = useState('-- All --');
  const [activeCustomer, setActiveCustomer] = useState(false);
  const [customer,       setCustomer]       = useState('-- All --');
  const [activeCountry,  setActiveCountry]  = useState(false);
  const [country,        setCountry]        = useState('-- All --');

  // ── Input fields (wildcard % search) ──
  const [orderNo,   setOrderNo]   = useState('');
  const [refNo,     setRefNo]     = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');

  // ── Status radio ──
  const [invoiceStatus, setInvoiceStatus] = useState('All');

  // ── Despatch Date range ──
  const [fromDate, setFromDate] = useState('');
  const [toDate,   setToDate]   = useState('');

  // ── Export checkbox ──
  const [exportData, setExportData] = useState(false);

  // ── Table state ──
  const [submitted,   setSubmitted]   = useState(false);
  const [records,     setRecords]     = useState([]);
  const [displayFrom, setDisplayFrom] = useState('');
  const [displayTo,   setDisplayTo]   = useState('');

  const handleClear = () => {
    setActiveCompany(false);       setCompany('-- All --');
    setActiveCustomer(false);      setCustomer('-- All --');
    setActiveCountry(false);       setCountry('-- All --');
    setOrderNo('');
    setRefNo('');
    setInvoiceNo('');
    setInvoiceStatus('All');
    setFromDate('');
    setToDate('');
    setExportData(false);
    setSubmitted(false);
    setRecords([]);
    setDisplayFrom('');
    setDisplayTo('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDisplayFrom(fromDate);
    setDisplayTo(toDate);

    const tOrder = orderNo.trim().toLowerCase();
    const tRef = refNo.trim().toLowerCase();
    const tInv = invoiceNo.trim().toLowerCase();

    const filtered = INITIAL_INVOICE_REGISTER.filter((r) => {
      if (activeCompany && company !== '-- All --' && r.company !== company) return false;
      if (activeCustomer && customer !== '-- All --' && r.customer !== customer) return false;
      if (activeCountry && country !== '-- All --' && r.country !== country) return false;
      if (tOrder && !String(r.orderNo || '').toLowerCase().includes(tOrder)) return false;
      if (tRef && !String(r.refNo || '').toLowerCase().includes(tRef)) return false;
      if (tInv && !String(r.invoiceNo || '').toLowerCase().includes(tInv)) return false;
      if (invoiceStatus !== 'All' && r.status !== invoiceStatus) return false;
      if (fromDate && r.despatchDate && r.despatchDate < fromDate) return false;
      if (toDate && r.despatchDate && r.despatchDate > toDate) return false;
      return true;
    });

    setRecords(filtered);
    setSubmitted(true);
  };

  const radioDropdown = (label, active, setActive, value, setValue, options) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 90 }}>
        <input type="radio" checked={active} onChange={() => setActive(!active)} onClick={() => setActive(!active)} />
        {label}
      </label>
      <select className="inp" value={value} onChange={(e) => setValue(e.target.value)} style={{ flex: 1 }}>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar session={session} />

      <main style={{ maxWidth: 1500, margin: '0 auto', padding: '24px 20px 60px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          📓 Invoice Register
        </h1>

        {/* QUERY OPTIONS FORM */}
        {!submitted && (
          <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a8a', margin: '0 0 16px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
              Query Options <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginLeft: 10 }}>Fields ➔</span>
            </h2>

            {/* Row 1 — Radio + Dropdown combos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px 24px', marginBottom: 20, backgroundColor: '#f1f5f9', padding: 16, borderRadius: 8 }}>
              {radioDropdown('Company', activeCompany, setActiveCompany, company, setCompany, INVOICE_REGISTER_COMPANY_LIST)}
              {radioDropdown('Customer', activeCustomer, setActiveCustomer, customer, setCustomer, INVOICE_REGISTER_CUSTOMER_LIST)}
              {radioDropdown('Country', activeCountry, setActiveCountry, country, setCountry, COUNTRY_LIST)}
            </div>

            {/* Row 2 — Wildcard text inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div className="field">
                <label>Order No (%)</label>
                <input type="text" className="inp" placeholder="e.g. ORD-2026-4401" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} />
              </div>
              <div className="field">
                <label>Ref No (%)</label>
                <input type="text" className="inp" placeholder="e.g. REF-9901" value={refNo} onChange={(e) => setRefNo(e.target.value)} />
              </div>
              <div className="field">
                <label>Invoice No (%)</label>
                <input type="text" className="inp" placeholder="e.g. EXP-INV-2026-101" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
              </div>
            </div>
{/* Row 3 — Status radios + Despatch Date range */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
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

              <div style={{ padding: 16, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Despatch Date</span>
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
            </div>

            {/* Row 4 — Export + Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#16a34a', cursor: 'pointer' }}>
                <input type="checkbox" checked={exportData} onChange={(e) => setExportData(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#16a34a' }} />
                Export
              </label>
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
{/* ── RESULTS TABLE (Tracking style) ── */}
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

            <div style={{ backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Invoice Register — {invoiceStatus}</h3>
                  {(displayFrom || displayTo) && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                      Despatch Date: {displayFrom || '-'} to {displayTo || '-'}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', backgroundColor: '#dbeafe', padding: '4px 12px', borderRadius: 20 }}>
                  Records: {records.length}
                </span>
              </div>

              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', minWidth: 1200, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>S.No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Invoice No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Order No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Ref No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Company</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Customer</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Country</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Despatch Date</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ padding: 32, textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
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
                            <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.orderNo}</td>
                            <td style={{ padding: '10px 12px' }}>{r.refNo}</td>
                            <td style={{ padding: '10px 12px' }}>{r.company}</td>
                            <td style={{ padding: '10px 12px' }}>{r.customer}</td>
                            <td style={{ padding: '10px 12px' }}>{r.country}</td>
                            <td style={{ padding: '10px 12px' }}>{r.despatchDate}</td>
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
          </div>
        )}
      </main>
    </div>
  );
}