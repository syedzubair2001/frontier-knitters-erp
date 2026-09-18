import { useState } from 'react';
import Navbar from '../components/Navbar';
import { getSession } from '../auth';
import {
  CUSTOMER_LIST,
  STYLE_LIST,
  CONSIGNEE_LIST,
  AGENT_LIST,
  SHIPMENT_MODE_LIST,
  CURRENCY_LIST,
  SYSTEM_LIST,
} from '../misqueryConfig';

const COMPANY_FULL_LIST = ['-- All --', 'FRONTIER FASHIONS', 'FRONTIER KNITTERS (P) LTD', 'FRONTIER PRINTING'];

export default function MisqueryLogisticsOrderSummary() {
  const session = getSession() || { username: 'superadmin', role: 'Super Admin' };

  // ── Radio + Dropdown combos ──
  const [activeCompany,      setActiveCompany]      = useState(false);
  const [company,            setCompany]            = useState('-- All --');
  const [activeCustomer,     setActiveCustomer]     = useState(false);
  const [customer,           setCustomer]           = useState('-- All --');
  const [activeConsignee,    setActiveConsignee]    = useState(false);
  const [consignee,          setConsignee]          = useState('-- All --');
  const [activeStyle,        setActiveStyle]        = useState(false);
  const [style,              setStyle]              = useState('-- All --');
  const [activeAgent,        setActiveAgent]        = useState(false);
  const [agent,              setAgent]              = useState('-- All --');
  const [activeShipmentMode, setActiveShipmentMode] = useState(false);
  const [shipmentMode,       setShipmentMode]       = useState('-- All --');
  const [activeCurrency,     setActiveCurrency]     = useState(false);
  const [currency,           setCurrency]           = useState('-- All --');
  const [activeSystem,       setActiveSystem]       = useState(false);
  const [system,             setSystem]             = useState('-- All --');

  // ── Input fields ──
  const [orderNo, setOrderNo] = useState('');
  const [refNo,   setRefNo]   = useState('');

  // ── Status radio ──
  const [status, setStatus] = useState('All');

  // ── Order Entry ──
  const [pendingOnly, setPendingOnly] = useState(false);

  // ── Dates ──
  const [fromDate, setFromDate] = useState('');
  const [toDate,   setToDate]   = useState('');

  // ── Export checkbox ──
  const [exportData, setExportData] = useState(false);

  // ── Table state ──
  const [submitted,   setSubmitted]   = useState(false);
  const [displayFrom, setDisplayFrom] = useState('');
  const [displayTo,   setDisplayTo]   = useState('');

  const handleClear = () => {
    setActiveCompany(false);      setCompany('-- All --');
    setActiveCustomer(false);     setCustomer('-- All --');
    setActiveConsignee(false);    setConsignee('-- All --');
    setActiveStyle(false);        setStyle('-- All --');
    setActiveAgent(false);        setAgent('-- All --');
    setActiveShipmentMode(false); setShipmentMode('-- All --');
    setActiveCurrency(false);     setCurrency('-- All --');
    setActiveSystem(false);       setSystem('-- All --');
    setOrderNo(''); setRefNo('');
    setStatus('All');
    setPendingOnly(false);
    setFromDate(''); setToDate('');
    setExportData(false);
    setSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setDisplayFrom(fromDate);
    setDisplayTo(toDate);
  };

  const radioDropdownFields = [
    { label: 'Company',          active: activeCompany,      setActive: setActiveCompany,      value: company,      setValue: setCompany,      list: COMPANY_FULL_LIST },
    { label: 'Customer',         active: activeCustomer,     setActive: setActiveCustomer,     value: customer,     setValue: setCustomer,     list: ['-- All --'].concat(CUSTOMER_LIST.slice(1)) },
    { label: 'Consignee',        active: activeConsignee,    setActive: setActiveConsignee,    value: consignee,    setValue: setConsignee,    list: CONSIGNEE_LIST },
    { label: 'Style',            active: activeStyle,        setActive: setActiveStyle,        value: style,        setValue: setStyle,        list: ['-- All --'].concat(STYLE_LIST.slice(1)) },
    { label: 'Agent',            active: activeAgent,        setActive: setActiveAgent,        value: agent,        setValue: setAgent,        list: AGENT_LIST },
    { label: 'Mode of Shipment', active: activeShipmentMode, setActive: setActiveShipmentMode, value: shipmentMode, setValue: setShipmentMode, list: SHIPMENT_MODE_LIST },
    { label: 'Currency',         active: activeCurrency,     setActive: setActiveCurrency,     value: currency,     setValue: setCurrency,     list: CURRENCY_LIST },
    { label: 'System',           active: activeSystem,       setActive: setActiveSystem,       value: system,       setValue: setSystem,       list: SYSTEM_LIST },
  ];

  const sectionBox  = { padding: 16, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 };
  const radioRow    = { display: 'flex', flexWrap: 'wrap', gap: 16 };
  const radioLabel  = { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' };
  const sectionTitle= { display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar session={session} />

      <main style={{ maxWidth: 1500, margin: '0 auto', padding: '24px 20px 60px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          📝 Order Summary
        </h1>

        {/* ── QUERY FORM ── */}
        {!submitted && (
          <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a8a', margin: '0 0 16px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
              Query Options <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginLeft: 10 }}>Fields &#8594;</span>
            </h2>

            {/* Row 1 — Radio + Dropdown combos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px 24px', marginBottom: 20, backgroundColor: '#f1f5f9', padding: 16, borderRadius: 8 }}>
              {radioDropdownFields.map(({ label, active, setActive, value, setValue, list }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 140 }}>
                    <input type="radio" checked={active} onChange={() => setActive(!active)} onClick={() => setActive(!active)} />
                    {label}
                  </label>
                  <select className="inp" value={value} onChange={e => setValue(e.target.value)} style={{ flex: 1 }}>
                    {list.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>

            {/* Row 2 — Input fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div className="field">
                <label>Order No</label>
                <input type="text" className="inp" placeholder="Enter Order No" value={orderNo} onChange={e => setOrderNo(e.target.value)} />
              </div>
              <div className="field">
                <label>Ref No</label>
                <input type="text" className="inp" placeholder="Enter Ref No" value={refNo} onChange={e => setRefNo(e.target.value)} />
              </div>
            </div>

            {/* Row 3 — Status + Order Entry + Dates in a grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>

              {/* Status */}
              <div style={sectionBox}>
                <span style={sectionTitle}>Status</span>
                <div style={radioRow}>
                  {['Active', 'Closed', 'Valid', 'Cancel', 'All'].map(s => (
                    <label key={s} style={radioLabel}>
                      <input type="radio" name="status" checked={status === s} onChange={() => setStatus(s)} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              {/* Order Entry */}
              <div style={sectionBox}>
                <span style={sectionTitle}>Order Entry</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={pendingOnly}
                    onChange={e => setPendingOnly(e.target.checked)}
                    style={{ width: 15, height: 15, accentColor: '#f59e0b' }}
                  />
                  Pending
                </label>
              </div>

              {/* From / To Date */}
              <div style={sectionBox}>
                <span style={sectionTitle}>Date Range</span>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="field" style={{ flex: 1, minWidth: 140, margin: 0 }}>
                    <label>From Date</label>
                    <input type="date" className="inp" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                  </div>
                  <span style={{ color: '#94a3b8', marginTop: 20 }}>to</span>
                  <div className="field" style={{ flex: 1, minWidth: 140, margin: 0 }}>
                    <label>To Date</label>
                    <input type="date" className="inp" value={toDate} onChange={e => setToDate(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4 — Export + Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#16a34a', cursor: 'pointer' }}>
                <input type="checkbox" checked={exportData} onChange={e => setExportData(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#16a34a' }} />
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
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Order Summary — Results</h3>
                  {(displayFrom || displayTo) && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                      Date: {displayFrom || '-'} to {displayTo || '-'}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {pendingOnly && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#d97706', backgroundColor: '#fef3c7', padding: '3px 10px', borderRadius: 20 }}>
                      Pending Only
                    </span>
                  )}
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', backgroundColor: '#dbeafe', padding: '4px 12px', borderRadius: 20 }}>
                    Records: 0
                  </span>
                </div>
              </div>

              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', minWidth: 1100, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>S.No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Order No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Ref No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Customer</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Consignee</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Style</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Agent</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Mode of Shipment</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Currency</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>System</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={11} style={{ padding: 32, textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                        Order Summary data will be displayed here.
                      </td>
                    </tr>
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
