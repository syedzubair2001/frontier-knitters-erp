import { useState } from 'react';
import Navbar from '../components/Navbar';
import { getSession } from '../auth';
import {
  ORDER_TYPES,
  STYLE_TYPES,
  ORDER_CATEGORY_LIST,
  CUSTOMER_LIST,
  PROCESS_LIST,
  PROCESSOR_LIST,
  WORK_DIVISION_LIST,
  ITEM_LIST,
  COLOR_LIST,
  SIZE_LIST,
  ITEM_GROUP_LIST,
  STORE_LIST,
} from '../misqueryConfig';

const COMPANY_FULL_LIST = ['-- All --', 'FRONTIER FASHIONS', 'FRONTIER KNITTERS (P) LTD', 'FRONTIER PRINTING'];

export default function MisqueryWorkflowReceiptStatus() {
  const session = getSession() || { username: 'superadmin', role: 'Super Admin' };

  // ── Top dropdowns (same line) ──
  const [orderType, setOrderType] = useState('--All--');
  const [styleType, setStyleType] = useState('--All--');
  const [orderCategory, setOrderCategory] = useState('--All--');

  // ── Radio + Dropdown combos ──
  const [activeCompany, setActiveCompany] = useState(false);
  const [company, setCompany] = useState('-- All --');
  const [activeCustomer, setActiveCustomer] = useState(false);
  const [customer, setCustomer] = useState('-- All --');
  const [activeProcess, setActiveProcess] = useState(false);
  const [process, setProcess] = useState('-- All --');
  const [activeProcessor, setActiveProcessor] = useState(false);
  const [processor, setProcessor] = useState('-- All --');
  const [activeWorkDivision, setActiveWorkDivision] = useState(false);
  const [workDivision, setWorkDivision] = useState('-- All --');
  const [activeItem, setActiveItem] = useState(false);
  const [item, setItem] = useState('-- All --');
  const [activeColor, setActiveColor] = useState(false);
  const [color, setColor] = useState('-- All --');
  const [activeSize, setActiveSize] = useState(false);
  const [size, setSize] = useState('-- All --');

  // ── Dropdown only ──
  const [itemGroup, setItemGroup] = useState('-- All --');
  const [store, setStore] = useState('-- All --');

  // ── Input fields ──
  const [orderNo, setOrderNo] = useState('');
  const [refNo, setRefNo] = useState('');
  const [receiptNo, setReceiptNo] = useState('');
  const [processOrderNo, setProcessOrderNo] = useState('');

  // ── Date type radio ──
  const [dateType, setDateType] = useState('Buyer Order Date');

  // ── Dates ──
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // ── Display checkboxes ──
  const [dispItem, setDispItem] = useState(false);
  const [dispColor, setDispColor] = useState(false);
  const [dispSize, setDispSize] = useState(false);
  const [dispProductNo, setDispProductNo] = useState(false);
  const [dispProductName, setDispProductName] = useState(false);

  // ── Status radio ──
  const [status, setStatus] = useState('All');

  // ── Invoice radio ──
  const [invoiceStatus, setInvoiceStatus] = useState('Both');

  // ── Quality radio ──
  const [qualityStatus, setQualityStatus] = useState('All');

  // ── Bottom checkboxes ──
  const [issueDetails, setIssueDetails] = useState(false);
  const [exportData, setExportData] = useState(false);

  // ── Table state ──
  const [submitted, setSubmitted] = useState(false);
  const [displayFrom, setDisplayFrom] = useState('');
  const [displayTo, setDisplayTo] = useState('');

  const handleClear = () => {
    setOrderType('--All--'); setStyleType('--All--'); setOrderCategory('--All--');
    setActiveCompany(false); setCompany('-- All --');
    setActiveCustomer(false); setCustomer('-- All --');
    setActiveProcess(false); setProcess('-- All --');
    setActiveProcessor(false); setProcessor('-- All --');
    setActiveWorkDivision(false); setWorkDivision('-- All --');
    setActiveItem(false); setItem('-- All --');
    setActiveColor(false); setColor('-- All --');
    setActiveSize(false); setSize('-- All --');
    setItemGroup('-- All --'); setStore('-- All --');
    setOrderNo(''); setRefNo(''); setReceiptNo(''); setProcessOrderNo('');
    setDateType('Buyer Order Date');
    setFromDate(''); setToDate('');
    setDispItem(false); setDispColor(false); setDispSize(false);
    setDispProductNo(false); setDispProductName(false);
    setStatus('All');
    setInvoiceStatus('Both');
    setQualityStatus('All');
    setIssueDetails(false); setExportData(false);
    setSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setDisplayFrom(fromDate);
    setDisplayTo(toDate);
  };

  const radioDropdownFields = [
    { label: 'Company',       active: activeCompany,       setActive: setActiveCompany,       value: company,       setValue: setCompany,       list: COMPANY_FULL_LIST },
    { label: 'Customer',      active: activeCustomer,      setActive: setActiveCustomer,      value: customer,      setValue: setCustomer,      list: ['-- All --'].concat(CUSTOMER_LIST.slice(1)) },
    { label: 'Process',       active: activeProcess,       setActive: setActiveProcess,       value: process,       setValue: setProcess,       list: ['-- All --'].concat(PROCESS_LIST.slice(1)) },
    { label: 'Processor',     active: activeProcessor,     setActive: setActiveProcessor,     value: processor,     setValue: setProcessor,     list: ['-- All --'].concat(PROCESSOR_LIST.slice(1)) },
    { label: 'Work Division', active: activeWorkDivision,  setActive: setActiveWorkDivision,  value: workDivision,  setValue: setWorkDivision,  list: ['-- All --'].concat(WORK_DIVISION_LIST.slice(1)) },
    { label: 'Item',          active: activeItem,          setActive: setActiveItem,          value: item,          setValue: setItem,          list: ['-- All --'].concat(ITEM_LIST.slice(1)) },
    { label: 'Color',         active: activeColor,         setActive: setActiveColor,         value: color,         setValue: setColor,         list: ['-- All --'].concat(COLOR_LIST.slice(1)) },
    { label: 'Size',          active: activeSize,          setActive: setActiveSize,          value: size,          setValue: setSize,          list: ['-- All --'].concat(SIZE_LIST.slice(1)) },
  ];

  const sectionBox = { padding: 16, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 };
  const radioRow = { display: 'flex', flexWrap: 'wrap', gap: 16 };
  const radioLabel = { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' };
  const sectionTitle = { display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar session={session} />

      <main style={{ maxWidth: 1500, margin: '0 auto', padding: '24px 20px 60px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          🧾 Receipt Status
        </h1>

        {/* ── QUERY FORM ── */}
        {!submitted && (
          <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a8a', margin: '0 0 16px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
              Query Options <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginLeft: 10 }}>Fields &#8594;</span>
            </h2>

            {/* Row 1 — Top dropdowns same line */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div className="field">
                <label>Order Type</label>
                <select className="inp" value={orderType} onChange={e => setOrderType(e.target.value)}>
                  {ORDER_TYPES.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Style Type</label>
                <select className="inp" value={styleType} onChange={e => setStyleType(e.target.value)}>
                  {STYLE_TYPES.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Order Category</label>
                <select className="inp" value={orderCategory} onChange={e => setOrderCategory(e.target.value)}>
                  {ORDER_CATEGORY_LIST.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2 — Radio + Dropdown combos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px 24px', marginBottom: 20, backgroundColor: '#f1f5f9', padding: 16, borderRadius: 8 }}>
              {radioDropdownFields.map(({ label, active, setActive, value, setValue, list }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 120 }}>
                    <input type="radio" checked={active} onChange={() => setActive(!active)} onClick={() => setActive(!active)} />
                    {label}
                  </label>
                  <select className="inp" value={value} onChange={e => setValue(e.target.value)} style={{ flex: 1 }}>
                    {list.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>

            {/* Row 3 — Dropdown only */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div className="field">
                <label>Item Group</label>
                <select className="inp" value={itemGroup} onChange={e => setItemGroup(e.target.value)}>
                  {['-- All --'].concat(ITEM_GROUP_LIST.slice(1)).map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Store</label>
                <select className="inp" value={store} onChange={e => setStore(e.target.value)}>
                  {['-- All --'].concat(STORE_LIST.slice(1)).map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* Row 4 — Input fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div className="field">
                <label>Order No</label>
                <input type="text" className="inp" placeholder="%" value={orderNo} onChange={e => setOrderNo(e.target.value)} />
              </div>
              <div className="field">
                <label>Ref No</label>
                <input type="text" className="inp" placeholder="%" value={refNo} onChange={e => setRefNo(e.target.value)} />
              </div>
              <div className="field">
                <label>Receipt No</label>
                <input type="text" className="inp" placeholder="%" value={receiptNo} onChange={e => setReceiptNo(e.target.value)} />
              </div>
              <div className="field">
                <label>Process Order No</label>
                <input type="text" className="inp" placeholder="%" value={processOrderNo} onChange={e => setProcessOrderNo(e.target.value)} />
              </div>
            </div>

            {/* Row 5 — Date type + dates */}
            <div style={{ ...sectionBox, marginBottom: 20 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 14 }}>
                {['Buyer Order Date', 'Shipment Date', 'Receipt Date'].map(d => (
                  <label key={d} style={radioLabel}>
                    <input type="radio" name="dateType" checked={dateType === d} onChange={() => setDateType(d)} />
                    {d}
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="field" style={{ flex: 1, minWidth: 160, margin: 0 }}>
                  <label>From Date</label>
                  <input type="date" className="inp" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                </div>
                <span style={{ color: '#94a3b8', marginTop: 24 }}>to</span>
                <div className="field" style={{ flex: 1, minWidth: 160, margin: 0 }}>
                  <label>To Date</label>
                  <input type="date" className="inp" value={toDate} onChange={e => setToDate(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Row 6 — Display checkboxes */}
            <div style={{ ...sectionBox, marginBottom: 20 }}>
              <span style={sectionTitle}>Display</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                {[
                  ['Item',        dispItem,        setDispItem],
                  ['Color',       dispColor,       setDispColor],
                  ['Size',        dispSize,        setDispSize],
                  ['Product No',  dispProductNo,   setDispProductNo],
                  ['Product Name',dispProductName, setDispProductName],
                ].map(([lbl, val, setter]) => (
                  <label key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    <input type="checkbox" checked={val} onChange={e => setter(e.target.checked)} style={{ width: 15, height: 15, accentColor: '#2563eb' }} />
                    {lbl}
                  </label>
                ))}
              </div>
            </div>

            {/* Row 7 — Status + Invoice + Quality */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>

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

              {/* Invoice */}
              <div style={{ ...sectionBox, border: '2px solid #e2e8f0' }}>
                <span style={sectionTitle}>Invoice</span>
                <div style={radioRow}>
                  {['Not Made', 'Made', 'Both'].map(s => (
                    <label key={s} style={radioLabel}>
                      <input type="radio" name="invoiceStatus" checked={invoiceStatus === s} onChange={() => setInvoiceStatus(s)} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              {/* Quality */}
              <div style={{ ...sectionBox, border: '2px solid #e2e8f0' }}>
                <span style={sectionTitle}>Quality</span>
                <div style={radioRow}>
                  {['Made', 'Not Made', 'Partial', 'All'].map(s => (
                    <label key={s} style={radioLabel}>
                      <input type="radio" name="qualityStatus" checked={qualityStatus === s} onChange={() => setQualityStatus(s)} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 8 — Bottom checkboxes + Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
                {/* Issue Details bordered checkbox */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#7c3aed', cursor: 'pointer', padding: '6px 14px', border: '1px solid #ddd6fe', borderRadius: 6, backgroundColor: '#f5f3ff' }}>
                  <input type="checkbox" checked={issueDetails} onChange={e => setIssueDetails(e.target.checked)} style={{ width: 15, height: 15, accentColor: '#7c3aed' }} />
                  Issue Details
                </label>
                {/* Export checkbox */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#16a34a', cursor: 'pointer' }}>
                  <input type="checkbox" checked={exportData} onChange={e => setExportData(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#16a34a' }} />
                  Export
                </label>
              </div>

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
              <div style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Receipt Status — Results</h3>
                  {(displayFrom || displayTo) && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                      {dateType}: {displayFrom || '-'} to {displayTo || '-'}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', backgroundColor: '#dbeafe', padding: '4px 12px', borderRadius: 20 }}>
                  Records: 0
                </span>
              </div>

              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', minWidth: 1100, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>S.No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Order No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Ref No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Receipt No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Process Order No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Customer</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Process</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Receipt Date</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Invoice</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Quality</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={11} style={{ padding: 32, textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                        Receipt Status data will be displayed here.
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
