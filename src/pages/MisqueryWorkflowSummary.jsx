import { useState } from 'react';
import Navbar from '../components/Navbar';
import { getSession } from '../auth';
import {
  ORDER_TYPES,
  STYLE_TYPES,
  ORDER_CATEGORY_LIST,
  COMPANY_LIST,
  CUSTOMER_LIST,
  UNIT_SUPPLIER_LIST,
  STYLE_LIST,
  MERCHANDISER_LIST,
  MANAGER_LIST,
  PROCESS_LIST,
  PROCESSOR_LIST,
  EMPLOYEE_LIST
} from '../misqueryConfig';

export default function MisqueryWorkflowSummary() {
  const session = getSession() || { username: 'superadmin', role: 'Super Admin' };

  // Top Dropdowns (same line)
  const [orderType, setOrderType] = useState('--All--');
  const [styleType, setStyleType] = useState('--All--');
  const [orderCategory, setOrderCategory] = useState('--All--');

  // Radio + Dropdowns
  const [activeCompany, setActiveCompany] = useState(false);
  const [company, setCompany] = useState('--Select--');
  const [activeCustomer, setActiveCustomer] = useState(false);
  const [customer, setCustomer] = useState('--Select--');
  const [activeProdUnit, setActiveProdUnit] = useState(false);
  const [prodUnit, setProdUnit] = useState('--Select--');
  const [activeStyle, setActiveStyle] = useState(false);
  const [style, setStyle] = useState('--Select--');
  const [activeMerchandiser, setActiveMerchandiser] = useState(false);
  const [merchandiser, setMerchandiser] = useState('--Select--');
  const [activeManager, setActiveManager] = useState(false);
  const [manager, setManager] = useState('--Select--');
  const [activeProcess, setActiveProcess] = useState(false);
  const [processType, setProcessType] = useState('--Select--');
  const [activeProcessor, setActiveProcessor] = useState(false);
  const [processor, setProcessor] = useState('--Select--');
  const [activeEmployee, setActiveEmployee] = useState(false);
  const [employee, setEmployee] = useState('--Select--');

  // Inputs
  const [orderNo, setOrderNo] = useState('');
  const [refNo, setRefNo] = useState('');

  // Date type radio
  const [dateType, setDateType] = useState('Delivery Date'); // 'Delivery Date', 'Order Date'

  // Dates
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Radios
  const [status, setStatus] = useState('All'); // 'Active', 'Closed', 'Valid', 'Cancel', 'All'

  // Checkbox (Border Line)
  const [viewDetails, setViewDetails] = useState(false);

  // Downside Checkbox
  const [exportData, setExportData] = useState(false);

  // Table Data
  const [submitted, setSubmitted] = useState(false);
  const [displayFrom, setDisplayFrom] = useState('');
  const [displayTo, setDisplayTo] = useState('');

  const handleClear = () => {
    setOrderType('--All--'); setStyleType('--All--'); setOrderCategory('--All--');
    
    setActiveCompany(false); setCompany('--Select--');
    setActiveCustomer(false); setCustomer('--Select--');
    setActiveProdUnit(false); setProdUnit('--Select--');
    setActiveStyle(false); setStyle('--Select--');
    setActiveMerchandiser(false); setMerchandiser('--Select--');
    setActiveManager(false); setManager('--Select--');
    setActiveProcess(false); setProcessType('--Select--');
    setActiveProcessor(false); setProcessor('--Select--');
    setActiveEmployee(false); setEmployee('--Select--');
    
    setOrderNo(''); setRefNo('');
    
    setDateType('Delivery Date');
    setFromDate(''); setToDate('');
    
    setStatus('All');
    setViewDetails(false);
    setExportData(false);
    
    setSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setDisplayFrom(fromDate);
    setDisplayTo(toDate);
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar session={session} />

      <main style={{ maxWidth: 1500, margin: '0 auto', padding: '24px 20px 60px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          📊 production Status
        </h1>

        {/* QUERY OPTIONS FORM */}
        {!submitted && (
          <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a8a', margin: '0 0 16px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
              Query Options <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginLeft: 10 }}>Fields ➔</span>
            </h2>

            {/* Row 1: Top Dropdowns (Same Line) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div className="field">
                <label>Order Type</label>
                <select className="inp" value={orderType} onChange={e => setOrderType(e.target.value)}>
                  {ORDER_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Style Type</label>
                <select className="inp" value={styleType} onChange={e => setStyleType(e.target.value)}>
                  {STYLE_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Order Category</label>
                <select className="inp" value={orderCategory} onChange={e => setOrderCategory(e.target.value)}>
                  {ORDER_CATEGORY_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2: Radio + Dropdown Combinations */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px 24px', marginBottom: 20, backgroundColor: '#f1f5f9', padding: 16, borderRadius: 8 }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 140 }}>
                  <input type="radio" checked={activeCompany} onChange={() => setActiveCompany(!activeCompany)} onClick={() => setActiveCompany(!activeCompany)} />
                  Company
                </label>
                <select className="inp" value={company} onChange={e => setCompany(e.target.value)} style={{ flex: 1 }}>
                  {COMPANY_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 140 }}>
                  <input type="radio" checked={activeCustomer} onChange={() => setActiveCustomer(!activeCustomer)} onClick={() => setActiveCustomer(!activeCustomer)} />
                  Customer
                </label>
                <select className="inp" value={customer} onChange={e => setCustomer(e.target.value)} style={{ flex: 1 }}>
                  {CUSTOMER_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 140 }}>
                  <input type="radio" checked={activeProdUnit} onChange={() => setActiveProdUnit(!activeProdUnit)} onClick={() => setActiveProdUnit(!activeProdUnit)} />
                  Production Unit
                </label>
                <select className="inp" value={prodUnit} onChange={e => setProdUnit(e.target.value)} style={{ flex: 1 }}>
                  {UNIT_SUPPLIER_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 140 }}>
                  <input type="radio" checked={activeStyle} onChange={() => setActiveStyle(!activeStyle)} onClick={() => setActiveStyle(!activeStyle)} />
                  Style
                </label>
                <select className="inp" value={style} onChange={e => setStyle(e.target.value)} style={{ flex: 1 }}>
                  {STYLE_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 140 }}>
                  <input type="radio" checked={activeMerchandiser} onChange={() => setActiveMerchandiser(!activeMerchandiser)} onClick={() => setActiveMerchandiser(!activeMerchandiser)} />
                  Merchandiser
                </label>
                <select className="inp" value={merchandiser} onChange={e => setMerchandiser(e.target.value)} style={{ flex: 1 }}>
                  {MERCHANDISER_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 140 }}>
                  <input type="radio" checked={activeManager} onChange={() => setActiveManager(!activeManager)} onClick={() => setActiveManager(!activeManager)} />
                  Manager
                </label>
                <select className="inp" value={manager} onChange={e => setManager(e.target.value)} style={{ flex: 1 }}>
                  {MANAGER_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 140 }}>
                  <input type="radio" checked={activeProcess} onChange={() => setActiveProcess(!activeProcess)} onClick={() => setActiveProcess(!activeProcess)} />
                  Process
                </label>
                <select className="inp" value={processType} onChange={e => setProcessType(e.target.value)} style={{ flex: 1 }}>
                  {PROCESS_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 140 }}>
                  <input type="radio" checked={activeProcessor} onChange={() => setActiveProcessor(!activeProcessor)} onClick={() => setActiveProcessor(!activeProcessor)} />
                  Processor
                </label>
                <select className="inp" value={processor} onChange={e => setProcessor(e.target.value)} style={{ flex: 1 }}>
                  {PROCESSOR_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 140 }}>
                  <input type="radio" checked={activeEmployee} onChange={() => setActiveEmployee(!activeEmployee)} onClick={() => setActiveEmployee(!activeEmployee)} />
                  Employee
                </label>
                <select className="inp" value={employee} onChange={e => setEmployee(e.target.value)} style={{ flex: 1 }}>
                  {EMPLOYEE_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            {/* Row 3: Text Inputs */}
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

            {/* Row 4: Dates & Radios */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 20 }}>
              
              <div style={{ padding: 16, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    <input type="radio" name="dateType" checked={dateType === 'Delivery Date'} onChange={() => setDateType('Delivery Date')} />
                    Delivery Date
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    <input type="radio" name="dateType" checked={dateType === 'Order Date'} onChange={() => setDateType('Order Date')} />
                    Order Date
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="field" style={{ flex: 1, margin: 0 }}>
                    <label>From Date</label>
                    <input type="date" className="inp" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                  </div>
                  <span style={{ color: '#94a3b8', marginTop: 24 }}>to</span>
                  <div className="field" style={{ flex: 1, margin: 0 }}>
                    <label>To Date</label>
                    <input type="date" className="inp" value={toDate} onChange={e => setToDate(e.target.value)} />
                  </div>
                </div>
              </div>

              <div style={{ padding: 16, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase' }}>Status</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                    {['Active', 'Closed', 'Valid', 'Cancel', 'All'].map(s => (
                      <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                        <input type="radio" name="status" checked={status === s} onChange={() => setStatus(s)} />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ width: '100%', height: 1, backgroundColor: '#e2e8f0' }}></div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase' }}>Options</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    <input type="checkbox" checked={viewDetails} onChange={e => setViewDetails(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
                    View Details
                  </label>
                </div>
              </div>

            </div>

            {/* Row 5: Additional Options & Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#16a34a', cursor: 'pointer' }}>
                  <input type="checkbox" checked={exportData} onChange={(e) => setExportData(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#16a34a' }} />
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

        {/* RESULTS TABLE */}
        {submitted && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <button 
                type="button" 
                onClick={() => setSubmitted(false)}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #94a3b8', backgroundColor: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                ⬅ Modify Query
              </button>
            </div>
            
            <div style={{ backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>production Status : Value</h3>
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
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Order Info</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Style Details</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Merchandiser</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Production Unit</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>Related production Status data will be displayed here.</td></tr>
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
