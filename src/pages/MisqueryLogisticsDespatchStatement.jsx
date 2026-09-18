import { useState } from 'react';
import Navbar from '../components/Navbar';
import { getSession } from '../auth';
import { CUSTOMER_LIST, COUNTRY_LIST, MERCHANDISER_LIST, INITIAL_DESPATCH_STATEMENT } from '../misqueryConfig';

// Despatch Statement dropdown lists
const DESPATCH_COMPANY_LIST = ['-- All --', 'FRONTIER FASHIONS', 'FRONTIER KNITTERS (P) LTD', 'FRONTIER PRINTING'];
const DESPATCH_CUSTOMER_LIST = ['-- All --', ...CUSTOMER_LIST.filter((c) => c !== '--Select--')];
const DESPATCH_UNIT_LIST = ['-- All --', 'Unit 1', 'Unit 2', 'Unit 3'];
const DESPATCH_SUPPLIER_LIST = ['-- All --', 'Lakshmi Yarns & Synthetics Pvt Ltd', 'Cotton Craft Synthetics Ltd', 'Apex Spinners & Weavers', 'Vardhman Yarns & Threads', 'Sun Dyes & Chemicals Ltd', 'Global Tex Equipment Spares'];
const DESPATCH_MERCHANDISER_LIST = ['-- All --', ...MERCHANDISER_LIST.filter((m) => m !== '--Select--')];

const INVOICE_STATUS_OPTIONS = ['Active', 'Closed', 'Valid', 'Cancel', 'All'];

const STATUS_COLORS = {
  Active: { bg: '#dcfce7', color: '#166534' },
  Closed: { bg: '#e2e8f0', color: '#475569' },
  Valid: { bg: '#dbeafe', color: '#1d4ed8' },
  Cancel: { bg: '#fee2e2', color: '#b91c1c' },
};

export default function MisqueryLogisticsDespatchStatement() {
  const session = getSession() || { username: 'superadmin', role: 'Super Admin' };

  // ── Radio + Dropdown combos ──
  const [activeCompany,      setActiveCompany]      = useState(false);
  const [company,            setCompany]            = useState('-- All --');
  const [activeCustomer,     setActiveCustomer]     = useState(false);
  const [customer,           setCustomer]           = useState('-- All --');
  const [activeCountry,      setActiveCountry]      = useState(false);
  const [country,            setCountry]            = useState('-- All --');
  const [activeUnit,         setActiveUnit]         = useState(false);
  const [companyUnit,        setCompanyUnit]        = useState('-- All --');
  const [activeSupplier,     setActiveSupplier]     = useState(false);
  const [supplier,           setSupplier]           = useState('-- All --');
  const [activeMerchandiser, setActiveMerchandiser] = useState(false);
  const [merchandiser,       setMerchandiser]       = useState('-- All --');

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
    setActiveCompany(false);      setCompany('-- All --');
    setActiveCustomer(false);     setCustomer('-- All --');
    setActiveCountry(false);      setCountry('-- All --');
    setActiveUnit(false);         setCompanyUnit('-- All --');
    setActiveSupplier(false);     setSupplier('-- All --');
    setActiveMerchandiser(false); setMerchandiser('-- All --');
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

    const filtered = INITIAL_DESPATCH_STATEMENT.filter((r) => {
      if (activeCompany && company !== '-- All --' && r.company !== company) return false;
      if (activeCustomer && customer !== '-- All --' && r.customer !== customer) return false;
      if (activeCountry && country !== '-- All --' && r.country !== country) return false;
      if (activeUnit && companyUnit !== '-- All --' && r.companyUnit !== companyUnit) return false;
      if (activeSupplier && supplier !== '-- All --' && r.supplier !== supplier) return false;
      if (activeMerchandiser && merchandiser !== '-- All --' && r.merchandiser !== merchandiser) return false;
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
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 110 }}>
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

      <main style={{ maxWidth: 1600, margin: '0 auto', padding: '24px 20px 60px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          🚚 Despatch Statement
        </h1>

        {/* QUERY OPTIONS FORM */}
        {!submitted && (
          <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a8a', margin: '0 0 16px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
              Query Options <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginLeft: 10 }}>Fields ➔</span>
            </h2>

            {/* Row 1 — Radio + Dropdown combos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px 24px', marginBottom: 20, backgroundColor: '#f1f5f9', padding: 16, borderRadius: 8 }}>
              {radioDropdown('Company', activeCompany, setActiveCompany, company, setCompany, DESPATCH_COMPANY_LIST)}
              {radioDropdown('Customer', activeCustomer, setActiveCustomer, customer, setCustomer, DESPATCH_CUSTOMER_LIST)}
              {radioDropdown('Country', activeCountry, setActiveCountry, country, setCountry, COUNTRY_LIST)}
              {radioDropdown('Company_unit', activeUnit, setActiveUnit, companyUnit, setCompanyUnit, DESPATCH_UNIT_LIST)}
              {radioDropdown('Supplier', activeSupplier, setActiveSupplier, supplier, setSupplier, DESPATCH_SUPPLIER_LIST)}
              {radioDropdown('Merchandiser', activeMerchandiser, setActiveMerchandiser, merchandiser, setMerchandiser, DESPATCH_MERCHANDISER_LIST)}
            </div>

            {/* Row 2 — Wildcard text inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div className="field">
                <label>Order No (%)</label>
                <input type="text" className="inp" placeholder="e.g. ORD-2026-4601" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} />
              </div>
              <div className="field">
                <label>Ref No (%)</label>
                <input type="text" className="inp" placeholder="e.g. REF-3101" value={refNo} onChange={(e) => setRefNo(e.target.value)} />
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
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Despatch Statement — {invoiceStatus}</h3>
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
                <table style={{ width: '100%', minWidth: 1500, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>S.No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Despatch No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Invoice No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Order No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Ref No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Company</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Customer</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Country</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Company_unit</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Supplier</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Merchandiser</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Despatch Date</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={13} style={{ padding: 32, textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                          No records found for the given query.
                        </td>
                      </tr>
                    ) : (
                      records.map((r, idx) => {
                        const c = STATUS_COLORS[r.status] || { bg: '#f1f5f9', color: '#475569' };
                        return (
                          <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                            <td style={{ padding: '10px 12px' }}>{idx + 1}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1e40af' }}>{r.despatchNo}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.invoiceNo}</td>
                            <td style={{ padding: '10px 12px' }}>{r.orderNo}</td>
                            <td style={{ padding: '10px 12px' }}>{r.refNo}</td>
                            <td style={{ padding: '10px 12px' }}>{r.company}</td>
                            <td style={{ padding: '10px 12px' }}>{r.customer}</td>
                            <td style={{ padding: '10px 12px' }}>{r.country}</td>
                            <td style={{ padding: '10px 12px' }}>{r.companyUnit}</td>
                            <td style={{ padding: '10px 12px' }}>{r.supplier}</td>
                            <td style={{ padding: '10px 12px' }}>{r.merchandiser}</td>
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