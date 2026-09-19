import { useState } from 'react';
import Navbar from '../components/Navbar';
import { getSession } from '../auth';
import BlueSelect from '../components/BlueSelect';
import {
  ORDER_TYPES,
  STYLE_TYPES,
  ORDER_OPTIONS,
  COMPANY_LIST,
  CUSTOMER_LIST,
  UNIT_SUPPLIER_LIST,
  ITEM_GROUP_LIST,
  WORK_DIVISION_LIST,
  DEPARTMENT_LIST,
  EMPLOYEE_LIST,
  ITEM_TYPE_LIST,
  STORE_LIST
} from '../misqueryConfig';

export default function MisqueryStoresIssue() {
  const session = getSession() || { username: 'superadmin', role: 'Super Admin' };
  
  // Filter states
  const [orderType, setOrderType] = useState('--All--');
  const [styleType, setStyleType] = useState('--All--');
  const [orderOpt, setOrderOpt] = useState('--All--');

  // Radio toggles for dropdowns
  const [activeCompany, setActiveCompany] = useState(false);
  const [company, setCompany] = useState('--Select--');
  
  const [activeUnit, setActiveUnit] = useState(false);
  const [unit, setUnit] = useState('--Select--');

  const [activeSupplier, setActiveSupplier] = useState(false);
  const [supplier, setSupplier] = useState('--Select--');

  const [activeWorkDivision, setActiveWorkDivision] = useState(false);
  const [workDivision, setWorkDivision] = useState('--Select--');

  const [activeDepartment, setActiveDepartment] = useState(false);
  const [department, setDepartment] = useState('--Select--');

  const [activeEmployee, setActiveEmployee] = useState(false);
  const [employee, setEmployee] = useState('--Select--');

  const [activeItemType, setActiveItemType] = useState(false);
  const [itemType, setItemType] = useState('--Select--');

  const [activeItemGroup, setActiveItemGroup] = useState(false);
  const [itemGroup, setItemGroup] = useState('--Select--');

  const [activeFromStore, setActiveFromStore] = useState(false);
  const [fromStore, setFromStore] = useState('--Select--');

  const [activeToStore, setActiveToStore] = useState(false);
  const [toStore, setToStore] = useState('--Select--');

  // Inputs
  const [orderNo, setOrderNo] = useState('');
  const [refNo, setRefNo] = useState('');

  // Date filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Status Radios & Layout
  const [status, setStatus] = useState('All'); // 'Active', 'Closed', 'Valid Cancel', 'All'
  const [layout, setLayout] = useState('Summary'); // 'Summary', 'Detail'

  // Display Radios
  const [displayStatus, setDisplayStatus] = useState('All'); // 'Pending', 'Received', 'All'
  const [displayType, setDisplayType] = useState('All'); // 'Order', 'Indent', 'Open', 'All'

  // Type Radios
  const [typeEntity, setTypeEntity] = useState('All'); // 'Unit', 'Supplier', 'Work Division', 'All'
  const [typeDirection, setTypeDirection] = useState('Both'); // 'Inward', 'Outward', 'Both'

  // Export Checkbox
  const [exportData, setExportData] = useState(false);

  // Table Data
  const [submitted, setSubmitted] = useState(false);
  const [displayFrom, setDisplayFrom] = useState('');
  const [displayTo, setDisplayTo] = useState('');

  const handleClear = () => {
    setOrderType('--All--');
    setStyleType('--All--');
    setOrderOpt('--All--');
    setActiveCompany(false); setCompany('--Select--');
    setActiveUnit(false); setUnit('--Select--');
    setActiveSupplier(false); setSupplier('--Select--');
    setActiveWorkDivision(false); setWorkDivision('--Select--');
    setActiveDepartment(false); setDepartment('--Select--');
    setActiveEmployee(false); setEmployee('--Select--');
    setActiveItemType(false); setItemType('--Select--');
    setActiveItemGroup(false); setItemGroup('--Select--');
    setActiveFromStore(false); setFromStore('--Select--');
    setActiveToStore(false); setToStore('--Select--');
    setOrderNo('');
    setRefNo('');
    setFromDate('');
    setToDate('');
    setStatus('All');
    setLayout('Summary');
    setDisplayStatus('All');
    setDisplayType('All');
    setTypeEntity('All');
    setTypeDirection('Both');
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
          📤 Stores Issue
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
                <label>Order</label>
                <BlueSelect className="inp" value={orderOpt} onChange={e => setOrderOpt(e.target.value)}>
                  {ORDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>
            </div>

            {/* Row 2: Radios + Dropdowns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px 24px', marginBottom: 20, backgroundColor: '#f1f5f9', padding: 16, borderRadius: 8 }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 100 }}>
                  <input type="radio" checked={activeCompany} onChange={() => setActiveCompany(!activeCompany)} onClick={() => setActiveCompany(!activeCompany)} />
                  Company
                </label>
                <BlueSelect className="inp" value={company} onChange={e => setCompany(e.target.value)} style={{ flex: 1 }}>
                  {COMPANY_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', minWidth: 100 }}>
                  Unit
                </label>
                <BlueSelect className="inp" value={unit} onChange={e => setUnit(e.target.value)} style={{ flex: 1 }}>
                  {UNIT_SUPPLIER_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', minWidth: 100 }}>
                  Supplier
                </label>
                <BlueSelect className="inp" value={supplier} onChange={e => setSupplier(e.target.value)} style={{ flex: 1 }}>
                  {UNIT_SUPPLIER_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', minWidth: 100 }}>
                  Work Division
                </label>
                <BlueSelect className="inp" value={workDivision} onChange={e => setWorkDivision(e.target.value)} style={{ flex: 1 }}>
                  {WORK_DIVISION_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', minWidth: 100 }}>
                  Department
                </label>
                <BlueSelect className="inp" value={department} onChange={e => setDepartment(e.target.value)} style={{ flex: 1 }}>
                  {DEPARTMENT_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', minWidth: 100 }}>
                  Employee
                </label>
                <BlueSelect className="inp" value={employee} onChange={e => setEmployee(e.target.value)} style={{ flex: 1 }}>
                  {EMPLOYEE_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', minWidth: 100 }}>
                  Item Type
                </label>
                <BlueSelect className="inp" value={itemType} onChange={e => setItemType(e.target.value)} style={{ flex: 1 }}>
                  {ITEM_TYPE_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', minWidth: 100 }}>
                  Item Group
                </label>
                <BlueSelect className="inp" value={itemGroup} onChange={e => setItemGroup(e.target.value)} style={{ flex: 1 }}>
                  {ITEM_GROUP_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', minWidth: 100 }}>
                  From Store
                </label>
                <BlueSelect className="inp" value={fromStore} onChange={e => setFromStore(e.target.value)} style={{ flex: 1 }}>
                  {STORE_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 100 }}>
                  <input type="radio" checked={activeToStore} onChange={() => setActiveToStore(!activeToStore)} onClick={() => setActiveToStore(!activeToStore)} />
                  To Store
                </label>
                <BlueSelect className="inp" value={toStore} onChange={e => setToStore(e.target.value)} style={{ flex: 1 }}>
                  {STORE_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
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
              <div style={{ padding: 12, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, display: 'flex', gap: 12, alignItems: 'center', gridColumn: 'span 2' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  Issue Date:
                </label>
                <div className="field" style={{ flex: 1, margin: 0 }}>
                  <input type="date" className="inp" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                </div>
                <span style={{ color: '#94a3b8' }}>to</span>
                <div className="field" style={{ flex: 1, margin: 0 }}>
                  <input type="date" className="inp" value={toDate} onChange={e => setToDate(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Row 4: Status / Display / Type Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
              
              {/* Status Block */}
              <div style={{ padding: 16, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
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
                  <div style={{ width: 1, height: 40, backgroundColor: '#cbd5e1' }}></div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase' }}>Layout</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                      {['Summary', 'Detail'].map(s => (
                        <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                          <input type="radio" name="layout" checked={layout === s} onChange={() => setLayout(s)} />
                          {s}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Display Block */}
              <div style={{ padding: 16, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase' }}>Display</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                      {['Pending', 'Received', 'All'].map(s => (
                        <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                          <input type="radio" name="displayStatus" checked={displayStatus === s} onChange={() => setDisplayStatus(s)} />
                          {s}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ width: 1, height: 40, backgroundColor: '#cbd5e1' }}></div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase' }}>Target</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                      {['Order', 'Indent', 'Open', 'All'].map(s => (
                        <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                          <input type="radio" name="displayType" checked={displayType === s} onChange={() => setDisplayType(s)} />
                          {s}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Type Block */}
              <div style={{ padding: 16, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase' }}>Type</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                      {['Unit', 'Supplier', 'Work Division', 'All'].map(s => (
                        <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                          <input type="radio" name="typeEntity" checked={typeEntity === s} onChange={() => setTypeEntity(s)} />
                          {s}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ width: 1, height: 40, backgroundColor: '#cbd5e1' }}></div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase' }}>Direction</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                      {['Inward', 'Outward', 'Both'].map(s => (
                        <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                          <input type="radio" name="typeDirection" checked={typeDirection === s} onChange={() => setTypeDirection(s)} />
                          {s}
                        </label>
                      ))}
                    </div>
                  </div>
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
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Stores Issue : Value</h3>
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
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Issue No & Date</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Order / Ref Info</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Item Group</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Store Info</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>Related Issue data will be displayed here.</td></tr>
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
