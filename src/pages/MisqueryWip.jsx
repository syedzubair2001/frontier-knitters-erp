import { useState } from 'react';
import Navbar from '../components/Navbar';
import { getSession } from '../auth';
import BlueSelect from '../components/BlueSelect';
import {
  ORDER_TYPES,
  STYLE_TYPES,
  ORDER_CATEGORY_LIST,
  COMPANY_LIST,
  UNIT_SUPPLIER_LIST,
  CUSTOMER_LIST,
  PROCESSOR_LIST,
  WORK_DIVISION_LIST,
  PROCESS_LIST,
  STYLE_LIST,
  COORDINATOR_LIST,
  MERCHANDISER_LIST,
  STORE_LIST,
  COLOR_LIST,
  SIZE_LIST
} from '../misqueryConfig';

export default function MisqueryWip() {
  const session = getSession() || { username: 'superadmin', role: 'Super Admin' };

  // Top Dropdowns
  const [orderType, setOrderType] = useState('--All--');
  const [styleType, setStyleType] = useState('--All--');
  const [orderCategory, setOrderCategory] = useState('--All--');

  // Radio + Dropdowns
  const [activeCompany, setActiveCompany] = useState(false);
  const [company, setCompany] = useState('--Select--');
  const [activeCompanyUnit, setActiveCompanyUnit] = useState(false);
  const [companyUnit, setCompanyUnit] = useState('--Select--');
  const [activeCustomer, setActiveCustomer] = useState(false);
  const [customer, setCustomer] = useState('--Select--');
  const [activeProcessor, setActiveProcessor] = useState(false);
  const [processor, setProcessor] = useState('--Select--');
  const [activeWorkDivision, setActiveWorkDivision] = useState(false);
  const [workDivision, setWorkDivision] = useState('--Select--');
  const [activeProcess, setActiveProcess] = useState(false);
  const [processType, setProcessType] = useState('--Select--');
  const [activeStyle, setActiveStyle] = useState(false);
  const [style, setStyle] = useState('--Select--');
  const [activeProcessCoord, setActiveProcessCoord] = useState(false);
  const [processCoord, setProcessCoord] = useState('--Select--');

  // Dropdown only
  const [merchandiser, setMerchandiser] = useState('--Select--');
  const [fromStore, setFromStore] = useState('--Select--');
  const [color, setColor] = useState('--Select--');
  const [size, setSize] = useState('--Select--');

  // Inputs
  const [orderNo, setOrderNo] = useState('');
  const [refNo, setRefNo] = useState('');

  // Dates
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [validateDate, setValidateDate] = useState(false);
  const [asOnDate, setAsOnDate] = useState('');

  // Radios
  const [orderStatus, setOrderStatus] = useState('All'); // 'Active', 'Closed', 'Valid', 'Cancel', 'All'
  const [displayStatus, setDisplayStatus] = useState('Summary'); // 'Summary', 'Detail', 'Print'
  const [poStatus, setPoStatus] = useState('Both'); // 'Active', 'Closed', 'Both'

  // Checkboxes
  const [processorSummary, setProcessorSummary] = useState(false);
  const [lineDetails, setLineDetails] = useState(false);
  const [wipNilBalance, setWipNilBalance] = useState(false);
  const [showDateDiff, setShowDateDiff] = useState(false);
  
  const [trims, setTrims] = useState(false);
  const [exportData, setExportData] = useState(false);

  // Table Data
  const [submitted, setSubmitted] = useState(false);
  const [displayFrom, setDisplayFrom] = useState('');
  const [displayTo, setDisplayTo] = useState('');

  const handleClear = () => {
    setOrderType('--All--'); setStyleType('--All--'); setOrderCategory('--All--');
    
    setActiveCompany(false); setCompany('--Select--');
    setActiveCompanyUnit(false); setCompanyUnit('--Select--');
    setActiveCustomer(false); setCustomer('--Select--');
    setActiveProcessor(false); setProcessor('--Select--');
    setActiveWorkDivision(false); setWorkDivision('--Select--');
    setActiveProcess(false); setProcessType('--Select--');
    setActiveStyle(false); setStyle('--Select--');
    setActiveProcessCoord(false); setProcessCoord('--Select--');

    setMerchandiser('--Select--'); setFromStore('--Select--'); setColor('--Select--'); setSize('--Select--');

    setOrderNo(''); setRefNo('');
    setFromDate(''); setToDate(''); setValidateDate(false); setAsOnDate('');

    setOrderStatus('All'); setDisplayStatus('Summary'); setPoStatus('Both');

    setProcessorSummary(false); setLineDetails(false); setWipNilBalance(false); setShowDateDiff(false);
    setTrims(false); setExportData(false);

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
          ⏳ Work in Progress
        </h1>

        {/* QUERY OPTIONS FORM */}
        {!submitted && (
          <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a8a', margin: '0 0 16px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
              Query Options <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginLeft: 10 }}>Fields ➔</span>
            </h2>

            {/* Row 1: Top Dropdowns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div className="field">
                <label>Order Type</label>
                <BlueSelect className="inp" value={orderType} onChange={e => setOrderType(e.target.value)}>
                  {ORDER_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>
              <div className="field">
                <label>Style Type</label>
                <BlueSelect className="inp" value={styleType} onChange={e => setStyleType(e.target.value)}>
                  {STYLE_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>
              <div className="field">
                <label>Order Category</label>
                <BlueSelect className="inp" value={orderCategory} onChange={e => setOrderCategory(e.target.value)}>
                  {ORDER_CATEGORY_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>
            </div>

            {/* Row 2: Radio + Dropdown Combinations */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px 24px', marginBottom: 20, backgroundColor: '#f1f5f9', padding: 16, borderRadius: 8 }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 140 }}>
                  <input type="radio" checked={activeCompany} onChange={() => setActiveCompany(!activeCompany)} onClick={() => setActiveCompany(!activeCompany)} />
                  Company
                </label>
                <BlueSelect className="inp" value={company} onChange={e => setCompany(e.target.value)} style={{ flex: 1 }}>
                  {COMPANY_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 140 }}>
                  <input type="radio" checked={activeCompanyUnit} onChange={() => setActiveCompanyUnit(!activeCompanyUnit)} onClick={() => setActiveCompanyUnit(!activeCompanyUnit)} />
                  Company Unit
                </label>
                <BlueSelect className="inp" value={companyUnit} onChange={e => setCompanyUnit(e.target.value)} style={{ flex: 1 }}>
                  {UNIT_SUPPLIER_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 140 }}>
                  <input type="radio" checked={activeCustomer} onChange={() => setActiveCustomer(!activeCustomer)} onClick={() => setActiveCustomer(!activeCustomer)} />
                  Customer
                </label>
                <BlueSelect className="inp" value={customer} onChange={e => setCustomer(e.target.value)} style={{ flex: 1 }}>
                  {CUSTOMER_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 140 }}>
                  <input type="radio" checked={activeProcessor} onChange={() => setActiveProcessor(!activeProcessor)} onClick={() => setActiveProcessor(!activeProcessor)} />
                  Processor
                </label>
                <BlueSelect className="inp" value={processor} onChange={e => setProcessor(e.target.value)} style={{ flex: 1 }}>
                  {PROCESSOR_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 140 }}>
                  <input type="radio" checked={activeWorkDivision} onChange={() => setActiveWorkDivision(!activeWorkDivision)} onClick={() => setActiveWorkDivision(!activeWorkDivision)} />
                  Work Division
                </label>
                <BlueSelect className="inp" value={workDivision} onChange={e => setWorkDivision(e.target.value)} style={{ flex: 1 }}>
                  {WORK_DIVISION_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 140 }}>
                  <input type="radio" checked={activeProcess} onChange={() => setActiveProcess(!activeProcess)} onClick={() => setActiveProcess(!activeProcess)} />
                  Process
                </label>
                <BlueSelect className="inp" value={processType} onChange={e => setProcessType(e.target.value)} style={{ flex: 1 }}>
                  {PROCESS_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 140 }}>
                  <input type="radio" checked={activeStyle} onChange={() => setActiveStyle(!activeStyle)} onClick={() => setActiveStyle(!activeStyle)} />
                  Style
                </label>
                <BlueSelect className="inp" value={style} onChange={e => setStyle(e.target.value)} style={{ flex: 1 }}>
                  {STYLE_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 140 }}>
                  <input type="radio" checked={activeProcessCoord} onChange={() => setActiveProcessCoord(!activeProcessCoord)} onClick={() => setActiveProcessCoord(!activeProcessCoord)} />
                  Process Co-Ordinator
                </label>
                <BlueSelect className="inp" value={processCoord} onChange={e => setProcessCoord(e.target.value)} style={{ flex: 1 }}>
                  {COORDINATOR_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>
            </div>

            {/* Row 3: Standard Dropdowns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>Merchandiser</label>
                <BlueSelect className="inp" value={merchandiser} onChange={e => setMerchandiser(e.target.value)}>
                  {MERCHANDISER_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>From Store</label>
                <BlueSelect className="inp" value={fromStore} onChange={e => setFromStore(e.target.value)}>
                  {STORE_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Color</label>
                <BlueSelect className="inp" value={color} onChange={e => setColor(e.target.value)}>
                  {COLOR_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Size</label>
                <BlueSelect className="inp" value={size} onChange={e => setSize(e.target.value)}>
                  {SIZE_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>
            </div>

            {/* Row 4: Texts and Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div className="field">
                <label>Order No (Wildcard % allowed)</label>
                <input type="text" className="inp" placeholder="Enter Order No" value={orderNo} onChange={e => setOrderNo(e.target.value)} />
              </div>
              <div className="field">
                <label>Ref No</label>
                <input type="text" className="inp" placeholder="Enter Ref No" value={refNo} onChange={e => setRefNo(e.target.value)} />
              </div>

              <div style={{ padding: 12, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', gridColumn: 'span 2' }}>
                <div className="field" style={{ flex: 1, margin: 0 }}>
                  <label>From Date</label>
                  <input type="date" className="inp" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                </div>
                <div className="field" style={{ flex: 1, margin: 0 }}>
                  <label>To Date</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input type="date" className="inp" value={toDate} onChange={e => setToDate(e.target.value)} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                      <input type="checkbox" checked={validateDate} onChange={e => setValidateDate(e.target.checked)} style={{ width: 14, height: 14, accentColor: '#2563eb' }} />
                      Validate
                    </label>
                  </div>
                </div>
              </div>

              <div className="field">
                <label>As On Date</label>
                <input type="date" className="inp" value={asOnDate} onChange={e => setAsOnDate(e.target.value)} />
              </div>
            </div>

            {/* Row 5: Radios and Checkboxes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
              
              <div style={{ padding: 16, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase' }}>Order Status</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  {['Active', 'Closed', 'Valid', 'Cancel', 'All'].map(s => (
                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                      <input type="radio" name="orderStatus" checked={orderStatus === s} onChange={() => setOrderStatus(s)} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ padding: 16, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase' }}>Display</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  {['Summary', 'Detail', 'Print'].map(s => (
                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                      <input type="radio" name="displayStatus" checked={displayStatus === s} onChange={() => setDisplayStatus(s)} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ padding: 16, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase' }}>PO Status</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  {['Active', 'Closed', 'Both'].map(s => (
                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                      <input type="radio" name="poStatus" checked={poStatus === s} onChange={() => setPoStatus(s)} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Row 6: Checkbox Options */}
            <div style={{ backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={processorSummary} onChange={e => setProcessorSummary(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
                  Processor Wise Summary
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={lineDetails} onChange={e => setLineDetails(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
                  Line Wise Details
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={wipNilBalance} onChange={e => setWipNilBalance(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
                  WIP With Nil Balance
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={showDateDiff} onChange={e => setShowDateDiff(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
                  Show Date Difference
                </label>
              </div>
            </div>

            {/* Row 7: Additional Options & Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#d97706', cursor: 'pointer' }}>
                  <input type="checkbox" checked={trims} onChange={(e) => setTrims(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#d97706' }} />
                  Trims
                </label>
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
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>WIP Register : Value</h3>
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
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Process / Info</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Style Details</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Processor</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>WIP Qty</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>Related Work In Progress data will be displayed here.</td></tr>
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
