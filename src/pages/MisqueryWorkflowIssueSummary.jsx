import { useState } from 'react';
import Navbar from '../components/Navbar';
import { getSession } from '../auth';
import BlueSelect from '../components/BlueSelect';
import {
  CUSTOMER_LIST,
  PROCESS_LIST,
  PROCESSOR_LIST,
  WORK_DIVISION_LIST,
  STORE_LIST,
  ITEM_TYPE_LIST,
  ITEM_LIST,
  COLOR_LIST,
  SIZE_LIST,
} from '../misqueryConfig';

const COMPANY_LIST_ALL  = ['-- All --', 'FRONTIER FASHIONS', 'FRONTIER KNITTERS (P) LTD', 'FRONTIER PRINTING'];
const TYPE_LIST         = ['-- All --', 'Issue', 'Return', 'Transfer'];
const UOM_LIST          = ['-- All --', 'PCS', 'MTR', 'KGS', 'YDS', 'LTR'];
const CLOSURE_LIST      = ['-- All --', 'Open', 'Closed'];
const PRODUCT_TYPE_LIST = ['-- All --', 'Finished Goods', 'Semi-Finished', 'Raw Material'];
const ISSUE_NO_LIST     = ['-- All --', 'ISS-001', 'ISS-002', 'ISS-003'];
const LINE_NO_LIST      = ['-- All --', '1', '2', '3', '4', '5'];
const EXPORT_FORMATS    = ['Excel', 'CSV', 'HTML'];

export default function MisqueryWorkflowIssueSummary() {
  const session = getSession() || { username: 'superadmin', role: 'Super Admin' };

  // ── Section 1 dropdowns ──
  const [company,     setCompany]     = useState('-- All --');
  const [customer,    setCustomer]    = useState('-- All --');
  const [process,     setProcess]     = useState('-- All --');
  const [processor,   setProcessor]   = useState('-- All --');
  const [workDiv,     setWorkDiv]     = useState('-- All --');
  const [type,        setType]        = useState('-- All --');
  const [uom,         setUom]         = useState('-- All --');
  const [closure,     setClosure]     = useState('-- All --');
  const [productType, setProductType] = useState('-- All --');

  // ── Section 2 inputs ──
  const [productNo, setProductNo] = useState('');
  const [orderNo,   setOrderNo]   = useState('');

  // ── Section 3 dropdowns ──
  const [issueNo, setIssueNo] = useState('-- All --');
  const [store,   setStore]   = useState('-- All --');

  // ── Section 4 input ──
  const [processOrderNo, setProcessOrderNo] = useState('');

  // ── Section 5 dropdowns ──
  const [itemType, setItemType] = useState('-- All --');
  const [item,     setItem]     = useState('-- All --');
  const [color,    setColor]    = useState('-- All --');
  const [size,     setSize]     = useState('-- All --');
  const [lineNo,   setLineNo]   = useState('-- All --');

  // ── Dates ──
  const [fromDate, setFromDate] = useState('');
  const [toDate,   setToDate]   = useState('');

  // ── Export dropdown ──
  const [exportFormat, setExportFormat] = useState('Excel');

  // ── Grouping checkbox ──
  const [grouping, setGrouping] = useState(false);

  // ── View radio ──
  const [view, setView] = useState('Summary');

  // ── Table state ──
  const [submitted,   setSubmitted]   = useState(false);
  const [displayFrom, setDisplayFrom] = useState('');
  const [displayTo,   setDisplayTo]   = useState('');

  const handleClear = () => {
    setCompany('-- All --'); setCustomer('-- All --'); setProcess('-- All --');
    setProcessor('-- All --'); setWorkDiv('-- All --'); setType('-- All --');
    setUom('-- All --'); setClosure('-- All --'); setProductType('-- All --');
    setProductNo(''); setOrderNo('');
    setIssueNo('-- All --'); setStore('-- All --');
    setProcessOrderNo('');
    setItemType('-- All --'); setItem('-- All --'); setColor('-- All --');
    setSize('-- All --'); setLineNo('-- All --');
    setFromDate(''); setToDate('');
    setExportFormat('Excel');
    setGrouping(false);
    setView('Summary');
    setSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setDisplayFrom(fromDate);
    setDisplayTo(toDate);
  };

  const ddStyle   = { padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, color: '#1e293b', backgroundColor: '#fff', width: '100%' };
  const inpStyle  = { padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, color: '#1e293b', backgroundColor: '#fff', width: '100%' };
  const lblStyle  = { display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 };
  const fieldBox  = { display: 'flex', flexDirection: 'column' };
  const sectionSep = { height: 1, backgroundColor: '#e2e8f0', margin: '16px 0' };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar session={session} />

      <main style={{ maxWidth: 1500, margin: '0 auto', padding: '24px 20px 60px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          📌 Issue Summary
        </h1>

        {/* ── QUERY FORM ── */}
        {!submitted && (
          <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: 24 }}>

            {/* ── Section A: dropdowns row 1 ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px 16px', marginBottom: 4 }}>
              {[
                ['Company',      company,     setCompany,     COMPANY_LIST_ALL],
                ['Customer',     customer,    setCustomer,    ['-- All --'].concat(CUSTOMER_LIST.slice(1))],
                ['Process',      process,     setProcess,     ['-- All --'].concat(PROCESS_LIST.slice(1))],
                ['Processor',    processor,   setProcessor,   ['-- All --'].concat(PROCESSOR_LIST.slice(1))],
                ['Work Division',workDiv,     setWorkDiv,     ['-- All --'].concat(WORK_DIVISION_LIST.slice(1))],
                ['Type',         type,        setType,        TYPE_LIST],
                ['UOM',          uom,         setUom,         UOM_LIST],
                ['Closure',      closure,     setClosure,     CLOSURE_LIST],
                ['Product Type', productType, setProductType, PRODUCT_TYPE_LIST],
              ].map(([lbl, val, setter, list]) => (
                <div key={lbl} style={fieldBox}>
                  <label style={lblStyle}>{lbl}</label>
                  <BlueSelect style={ddStyle} value={val} onChange={e => setter(e.target.value)}>
                    {list.map(o => <option key={o}>{o}</option>)}
                  </BlueSelect>
                </div>
              ))}
            </div>

            <div style={sectionSep} />

            {/* ── Section B: input fields (Product No, Order No) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px 16px', marginBottom: 4 }}>
              <div style={fieldBox}>
                <label style={lblStyle}>Product No</label>
                <input style={inpStyle} type="text" placeholder="Enter Product No" value={productNo} onChange={e => setProductNo(e.target.value)} />
              </div>
              <div style={fieldBox}>
                <label style={lblStyle}>Order No</label>
                <input style={inpStyle} type="text" placeholder="Enter Order No" value={orderNo} onChange={e => setOrderNo(e.target.value)} />
              </div>
            </div>

            <div style={sectionSep} />

            {/* ── Section C: Issue No + Store dropdowns ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px 16px', marginBottom: 4 }}>
              <div style={fieldBox}>
                <label style={lblStyle}>Issue No</label>
                <BlueSelect style={ddStyle} value={issueNo} onChange={e => setIssueNo(e.target.value)}>
                  {ISSUE_NO_LIST.map(o => <option key={o}>{o}</option>)}
                </BlueSelect>
              </div>
              <div style={fieldBox}>
                <label style={lblStyle}>Store</label>
                <BlueSelect style={ddStyle} value={store} onChange={e => setStore(e.target.value)}>
                  {['-- All --'].concat(STORE_LIST.slice(1)).map(o => <option key={o}>{o}</option>)}
                </BlueSelect>
              </div>
            </div>

            <div style={sectionSep} />

            {/* ── Section D: Process Order No input ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px 16px', marginBottom: 4 }}>
              <div style={fieldBox}>
                <label style={lblStyle}>Process Order No</label>
                <input style={inpStyle} type="text" placeholder="Enter Process Order No" value={processOrderNo} onChange={e => setProcessOrderNo(e.target.value)} />
              </div>
            </div>

            <div style={sectionSep} />

            {/* ── Section E: Item Type, Item, Color, Size, Line No dropdowns ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px 16px', marginBottom: 4 }}>
              {[
                ['Item Type', itemType, setItemType, ['-- All --'].concat(ITEM_TYPE_LIST.slice(1))],
                ['Item',      item,     setItem,     ['-- All --'].concat(ITEM_LIST.slice(1))],
                ['Color',     color,    setColor,    ['-- All --'].concat(COLOR_LIST.slice(1))],
                ['Size',      size,     setSize,     ['-- All --'].concat(SIZE_LIST.slice(1))],
                ['Line No',   lineNo,   setLineNo,   LINE_NO_LIST],
              ].map(([lbl, val, setter, list]) => (
                <div key={lbl} style={fieldBox}>
                  <label style={lblStyle}>{lbl}</label>
                  <BlueSelect style={ddStyle} value={val} onChange={e => setter(e.target.value)}>
                    {list.map(o => <option key={o}>{o}</option>)}
                  </BlueSelect>
                </div>
              ))}
            </div>

            <div style={sectionSep} />

            {/* ── Section F: From/To Date ── */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 4 }}>
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

            <div style={sectionSep} />

            {/* ── Section G: Export dropdown + Grouping checkbox + View radio ── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center', marginBottom: 4 }}>

              {/* Export dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>Export</label>
                <BlueSelect
                  style={{ ...ddStyle, width: 'auto', minWidth: 120, borderColor: '#86efac', color: '#15803d', fontWeight: 600 }}
                  value={exportFormat}
                  onChange={e => setExportFormat(e.target.value)}
                >
                  {EXPORT_FORMATS.map(f => <option key={f}>{f}</option>)}
                </BlueSelect>
              </div>

              {/* Grouping checkbox */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', padding: '6px 14px', border: '1px solid #e2e8f0', borderRadius: 6, backgroundColor: '#f8fafc' }}>
                <input type="checkbox" checked={grouping} onChange={e => setGrouping(e.target.checked)} style={{ width: 15, height: 15, accentColor: '#2563eb' }} />
                Grouping
              </label>

              {/* View radio */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>View</span>
                {['Detail', 'Summary'].map(v => (
                  <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    <input type="radio" name="view" checked={view === v} onChange={() => setView(v)} />
                    {v}
                  </label>
                ))}
              </div>
            </div>

            <div style={sectionSep} />

            {/* ── Actions ── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 4 }}>
              <button type="button" onClick={handleClear} style={{ padding: '8px 20px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Clear
              </button>
              <button type="submit" style={{ padding: '8px 24px', borderRadius: 6, border: 'none', backgroundColor: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}>
                Submit
              </button>
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
                    Issue Summary — {view}
                  </h3>
                  {(displayFrom || displayTo) && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                      Date: {displayFrom || '-'} to {displayTo || '-'}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {grouping && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed', backgroundColor: '#f5f3ff', padding: '3px 10px', borderRadius: 20 }}>
                      Grouped
                    </span>
                  )}
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', backgroundColor: '#dbeafe', padding: '4px 12px', borderRadius: 20 }}>
                    Records: 0
                  </span>
                </div>
              </div>

              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', minWidth: 1000, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>S.No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Issue No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Order No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Process Order No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Customer</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Process</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Item</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Color</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Size</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Qty</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>UOM</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={12} style={{ padding: 32, textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                        Issue Summary data will be displayed here.
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
