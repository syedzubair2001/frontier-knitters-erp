import { useState } from 'react';
import Navbar from '../components/Navbar';
import { getSession } from '../auth';
import BlueSelect from '../components/BlueSelect';
import {
  CUSTOMER_LIST,
  PROCESS_LIST,
  PROCESSOR_LIST,
  WORK_DIVISION_LIST,
} from '../misqueryConfig';

const COMPANY_LIST_ALL  = ['-- All --', 'FRONTIER FASHIONS', 'FRONTIER KNITTERS (P) LTD', 'FRONTIER PRINTING'];
const TYPE_LIST         = ['-- All --', 'Issue', 'Return', 'Transfer'];
const UOM_LIST          = ['-- All --', 'PCS', 'MTR', 'KGS', 'YDS', 'LTR'];
const CLOSURE_LIST      = ['-- All --', 'Open', 'Closed'];
const RECEIPT_NO_LIST   = ['-- All --', 'REC-001', 'REC-002', 'REC-003'];
const EXPORT_FORMATS    = ['Excel', 'CSV', 'HTML'];
const DISPLAY_OPTIONS   = ['Supplier', 'Work Division', 'Contractor', 'All'];

export default function MisqueryWorkflowProductionSummary() {
  const session = getSession() || { username: 'superadmin', role: 'Super Admin' };

  // ── Dropdowns ──
  const [company,   setCompany]   = useState('-- All --');
  const [customer,  setCustomer]  = useState('-- All --');
  const [process,   setProcess]   = useState('-- All --');
  const [processor, setProcessor] = useState('-- All --');
  const [workDiv,   setWorkDiv]   = useState('-- All --');
  const [type,      setType]      = useState('-- All --');
  const [uom,       setUom]       = useState('-- All --');
  const [closure,   setClosure]   = useState('-- All --');

  // ── Input fields ──
  const [productNo, setProductNo] = useState('');
  const [orderNo,   setOrderNo]   = useState('');

  // ── Receipt No dropdown ──
  const [receiptNo, setReceiptNo] = useState('-- All --');

  // ── Display radio ──
  const [display, setDisplay] = useState('All');

  // ── Dates ──
  const [fromDate, setFromDate] = useState('');
  const [toDate,   setToDate]   = useState('');

  // ── Export dropdown ──
  const [exportFormat, setExportFormat] = useState('Excel');

  // ── Table state ──
  const [submitted,   setSubmitted]   = useState(false);
  const [displayFrom, setDisplayFrom] = useState('');
  const [displayTo,   setDisplayTo]   = useState('');

  const handleClear = () => {
    setCompany('-- All --'); setCustomer('-- All --'); setProcess('-- All --');
    setProcessor('-- All --'); setWorkDiv('-- All --'); setType('-- All --');
    setUom('-- All --'); setClosure('-- All --');
    setProductNo(''); setOrderNo('');
    setReceiptNo('-- All --');
    setDisplay('All');
    setFromDate(''); setToDate('');
    setExportFormat('Excel');
    setSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setDisplayFrom(fromDate);
    setDisplayTo(toDate);
  };

  const ddStyle  = { padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, color: '#1e293b', backgroundColor: '#fff', width: '100%' };
  const inpStyle = { padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, color: '#1e293b', backgroundColor: '#fff', width: '100%' };
  const lblStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 };
  const fieldBox = { display: 'flex', flexDirection: 'column' };
  const sep      = { height: 1, backgroundColor: '#e2e8f0', margin: '16px 0' };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar session={session} />

      <main style={{ maxWidth: 1500, margin: '0 auto', padding: '24px 20px 60px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          🏭 Production Summary
        </h1>

        {/* ── QUERY FORM ── */}
        {!submitted && (
          <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a8a', margin: '0 0 16px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
              Query Options <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginLeft: 10 }}>Fields &#8594;</span>
            </h2>

            {/* ── Section A: Main dropdowns ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px 16px' }}>
              {[
                ['Company',       company,   setCompany,   COMPANY_LIST_ALL],
                ['Customer',      customer,  setCustomer,  ['-- All --'].concat(CUSTOMER_LIST.slice(1))],
                ['Process',       process,   setProcess,   ['-- All --'].concat(PROCESS_LIST.slice(1))],
                ['Processor',     processor, setProcessor, ['-- All --'].concat(PROCESSOR_LIST.slice(1))],
                ['Work Division', workDiv,   setWorkDiv,   ['-- All --'].concat(WORK_DIVISION_LIST.slice(1))],
                ['Type',          type,      setType,      TYPE_LIST],
                ['UOM',           uom,       setUom,       UOM_LIST],
                ['Closure',       closure,   setClosure,   CLOSURE_LIST],
              ].map(([lbl, val, setter, list]) => (
                <div key={lbl} style={fieldBox}>
                  <label style={lblStyle}>{lbl}</label>
                  <BlueSelect style={ddStyle} value={val} onChange={e => setter(e.target.value)}>
                    {list.map(o => <option key={o}>{o}</option>)}
                  </BlueSelect>
                </div>
              ))}
            </div>

            <div style={sep} />

            {/* ── Section B: Input fields ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px 16px' }}>
              <div style={fieldBox}>
                <label style={lblStyle}>Product No</label>
                <input style={inpStyle} type="text" placeholder="Enter Product No" value={productNo} onChange={e => setProductNo(e.target.value)} />
              </div>
              <div style={fieldBox}>
                <label style={lblStyle}>Order No</label>
                <input style={inpStyle} type="text" placeholder="Enter Order No" value={orderNo} onChange={e => setOrderNo(e.target.value)} />
              </div>
            </div>

            <div style={sep} />

            {/* ── Section C: Receipt No dropdown ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px 16px' }}>
              <div style={fieldBox}>
                <label style={lblStyle}>Receipt No</label>
                <BlueSelect style={ddStyle} value={receiptNo} onChange={e => setReceiptNo(e.target.value)}>
                  {RECEIPT_NO_LIST.map(o => <option key={o}>{o}</option>)}
                </BlueSelect>
              </div>
            </div>

            <div style={sep} />

            {/* ── Section D: Display radio ── */}
            <div style={{ padding: '14px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Display</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                {DISPLAY_OPTIONS.map(d => (
                  <label key={d} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    <input type="radio" name="display" checked={display === d} onChange={() => setDisplay(d)} />
                    {d}
                  </label>
                ))}
              </div>
            </div>

            <div style={sep} />

            {/* ── Section E: Dates ── */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={fieldBox}>
                <label style={lblStyle}>From Date</label>
                <input style={{ ...inpStyle, width: 180 }} type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
              </div>
              <span style={{ color: '#94a3b8', paddingBottom: 6 }}>to</span>
              <div style={fieldBox}>
                <label style={lblStyle}>To Date</label>
                <input style={{ ...inpStyle, width: 180 }} type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
              </div>
            </div>

            <div style={sep} />

            {/* ── Section F: Export + Actions ── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>Export</label>
                <BlueSelect
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #86efac', fontSize: 13, color: '#15803d', fontWeight: 600, backgroundColor: '#f0fdf4', minWidth: 120, cursor: 'pointer' }}
                  value={exportFormat}
                  onChange={e => setExportFormat(e.target.value)}
                >
                  {EXPORT_FORMATS.map(f => <option key={f}>{f}</option>)}
                </BlueSelect>
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
              <div style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                    Production Summary — {display}
                  </h3>
                  {(displayFrom || displayTo) && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                      Date: {displayFrom || '-'} to {displayTo || '-'}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', backgroundColor: '#dbeafe', padding: '4px 12px', borderRadius: 20 }}>
                  Records: 0
                </span>
              </div>

              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', minWidth: 1000, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>S.No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Order No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Product No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Receipt No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Customer</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Process</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Processor</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Work Division</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Type</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>UOM</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Closure</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={11} style={{ padding: 32, textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                        Production Summary data will be displayed here.
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
