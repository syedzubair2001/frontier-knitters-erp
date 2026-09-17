import { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import { getSession } from '../auth';
import {
  ORDER_TYPES,
  STYLE_TYPES,
  ORDER_OPTIONS,
  COMPANY_LIST,
  CUSTOMER_LIST,
  UNIT_SUPPLIER_LIST,
  STYLE_LIST,
  MERCHANDISER_LIST,
  MANAGER_LIST,
  TEAM_LIST,
  BRAND_LIST,
  INITIAL_ORDER_SUMMARY
} from '../misqueryConfig';

export default function MisqueryOrderSummary() {
  const session = getSession() || { username: 'superadmin', role: 'Super Admin' };
  
  // Filter states
  const [orderType, setOrderType] = useState('--All--');
  const [styleType, setStyleType] = useState('--All--');
  const [orderOpt, setOrderOpt] = useState('--All--');

  // Radio toggles for dropdowns
  const [activeCompany, setActiveCompany] = useState(false);
  const [company, setCompany] = useState('--Select--');
  
  const [activeCustomer, setActiveCustomer] = useState(false);
  const [customer, setCustomer] = useState('--Select--');

  const [unitSupType, setUnitSupType] = useState(''); // 'Unit' or 'Supplier'
  const [unitSup, setUnitSup] = useState('--Select--');

  const [activeStyle, setActiveStyle] = useState(false);
  const [style, setStyle] = useState('--Select--');

  const [activeMerchandiser, setActiveMerchandiser] = useState(false);
  const [merchandiser, setMerchandiser] = useState('--Select--');

  const [activeManager, setActiveManager] = useState(false);
  const [manager, setManager] = useState('--Select--');

  const [activeTeam, setActiveTeam] = useState(false);
  const [team, setTeam] = useState('--Select--');

  const [activeBrand, setActiveBrand] = useState(false);
  const [brand, setBrand] = useState('--Select--');

  // Inputs
  const [orderNo, setOrderNo] = useState('');
  const [refNo, setRefNo] = useState('');
  const [styleRefNo, setStyleRefNo] = useState('');

  // Date filters
  const [dateType, setDateType] = useState('orderDate'); // 'orderDate' or 'shipmentDate'
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Status Radios
  const [status, setStatus] = useState('All'); // 'Active', 'Closed', 'Valid Cancel', 'All'

  // Other Radios
  const [garmentType, setGarmentType] = useState('Include'); // 'Include', 'Exclude'
  const [internalExternal, setInternalExternal] = useState('Internal'); // 'Internal', 'External'
  const [orderDisplay, setOrderDisplay] = useState('Asc'); // 'Asc', 'Dec'
  const [exportData, setExportData] = useState(false);

  // Table Data
  const [records, setRecords] = useState(INITIAL_ORDER_SUMMARY);
  const [submitted, setSubmitted] = useState(false);
  const [displayFrom, setDisplayFrom] = useState('');
  const [displayTo, setDisplayTo] = useState('');

  const handleClear = () => {
    setOrderType('--All--');
    setStyleType('--All--');
    setOrderOpt('--All--');
    setActiveCompany(false);
    setCompany('--Select--');
    setActiveCustomer(false);
    setCustomer('--Select--');
    setUnitSupType('');
    setUnitSup('--Select--');
    setActiveStyle(false);
    setStyle('--Select--');
    setActiveMerchandiser(false);
    setMerchandiser('--Select--');
    setActiveManager(false);
    setManager('--Select--');
    setActiveTeam(false);
    setTeam('--Select--');
    setActiveBrand(false);
    setBrand('--Select--');
    setOrderNo('');
    setRefNo('');
    setStyleRefNo('');
    setDateType('orderDate');
    setFromDate('');
    setToDate('');
    setStatus('All');
    setGarmentType('Include');
    setInternalExternal('Internal');
    setOrderDisplay('Asc');
    setExportData(false);
    setSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setDisplayFrom(fromDate);
    setDisplayTo(toDate);
    // In a real app, you would fetch or filter data here based on states.
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar session={session} />

      <main style={{ maxWidth: 1500, margin: '0 auto', padding: '24px 20px 60px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          📝 Order Summary
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
              <label>Order</label>
              <select className="inp" value={orderOpt} onChange={e => setOrderOpt(e.target.value)}>
                {ORDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2: Radios + Dropdowns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px 24px', marginBottom: 20, backgroundColor: '#f1f5f9', padding: 16, borderRadius: 8 }}>
            
            {/* Company */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 100 }}>
                <input type="radio" checked={activeCompany} onChange={() => setActiveCompany(!activeCompany)} onClick={() => setActiveCompany(!activeCompany)} />
                Company
              </label>
              <select className="inp" value={company} onChange={e => setCompany(e.target.value)} style={{ flex: 1 }}>
                {COMPANY_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            {/* Customer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 100 }}>
                <input type="radio" checked={activeCustomer} onChange={() => setActiveCustomer(!activeCustomer)} onClick={() => setActiveCustomer(!activeCustomer)} />
                Customer
              </label>
              <select className="inp" value={customer} onChange={e => setCustomer(e.target.value)} style={{ flex: 1 }}>
                {CUSTOMER_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            {/* Unit / Supplier */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 140 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="radio" name="unitSup" checked={unitSupType === 'Unit'} onChange={() => setUnitSupType('Unit')} />
                  Unit
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="radio" name="unitSup" checked={unitSupType === 'Supplier'} onChange={() => setUnitSupType('Supplier')} />
                  Supplier
                </label>
              </div>
              <select className="inp" value={unitSup} onChange={e => setUnitSup(e.target.value)} style={{ flex: 1 }}>
                {UNIT_SUPPLIER_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            {/* Style */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 100 }}>
                <input type="radio" checked={activeStyle} onChange={() => setActiveStyle(!activeStyle)} onClick={() => setActiveStyle(!activeStyle)} />
                Style
              </label>
              <select className="inp" value={style} onChange={e => setStyle(e.target.value)} style={{ flex: 1 }}>
                {STYLE_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            {/* Merchandiser */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 110 }}>
                <input type="radio" checked={activeMerchandiser} onChange={() => setActiveMerchandiser(!activeMerchandiser)} onClick={() => setActiveMerchandiser(!activeMerchandiser)} />
                Merchandiser
              </label>
              <select className="inp" value={merchandiser} onChange={e => setMerchandiser(e.target.value)} style={{ flex: 1 }}>
                {MERCHANDISER_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            {/* Manager */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 100 }}>
                <input type="radio" checked={activeManager} onChange={() => setActiveManager(!activeManager)} onClick={() => setActiveManager(!activeManager)} />
                Manager
              </label>
              <select className="inp" value={manager} onChange={e => setManager(e.target.value)} style={{ flex: 1 }}>
                {MANAGER_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            {/* Team */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 100 }}>
                <input type="radio" checked={activeTeam} onChange={() => setActiveTeam(!activeTeam)} onClick={() => setActiveTeam(!activeTeam)} />
                Team
              </label>
              <select className="inp" value={team} onChange={e => setTeam(e.target.value)} style={{ flex: 1 }}>
                {TEAM_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 100 }}>
                <input type="radio" checked={activeBrand} onChange={() => setActiveBrand(!activeBrand)} onClick={() => setActiveBrand(!activeBrand)} />
                Brand
              </label>
              <select className="inp" value={brand} onChange={e => setBrand(e.target.value)} style={{ flex: 1 }}>
                {BRAND_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
            <div className="field">
              <label>Style Ref No</label>
              <input type="text" className="inp" placeholder="Enter Style Ref No" value={styleRefNo} onChange={e => setStyleRefNo(e.target.value)} />
            </div>
          </div>

          {/* Row 4: Dates & Status */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 20, alignItems: 'flex-start' }}>
            
            <div style={{ padding: 12, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, flex: 1, minWidth: 320 }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="radio" name="dateType" checked={dateType === 'orderDate'} onChange={() => setDateType('orderDate')} />
                  Buyer Order Date
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="radio" name="dateType" checked={dateType === 'shipmentDate'} onChange={() => setDateType('shipmentDate')} />
                  Shipment Date
                </label>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>From Date</label>
                  <input type="date" className="inp" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>To Date</label>
                  <input type="date" className="inp" value={toDate} onChange={e => setToDate(e.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ padding: 12, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, flex: 1, minWidth: 320 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase' }}>Status</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {['Active', 'Closed', 'Valid Cancel', 'All'].map(s => (
                  <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    <input type="radio" name="status" checked={status === s} onChange={() => setStatus(s)} />
                    {s}
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Row 5: Additional Options & Actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Garment Type:</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="radio" name="garmentType" checked={garmentType === 'Include'} onChange={() => setGarmentType('Include')} /> Include
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="radio" name="garmentType" checked={garmentType === 'Exclude'} onChange={() => setGarmentType('Exclude')} /> Exclude
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Type:</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="radio" name="ieType" checked={internalExternal === 'Internal'} onChange={() => setInternalExternal('Internal')} /> Internal
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="radio" name="ieType" checked={internalExternal === 'External'} onChange={() => setInternalExternal('External')} /> External
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Order Display:</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="radio" name="orderDisplay" checked={orderDisplay === 'Asc'} onChange={() => setOrderDisplay('Asc')} /> Asc
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="radio" name="orderDisplay" checked={orderDisplay === 'Dec'} onChange={() => setOrderDisplay('Dec')} /> Dec
                </label>
              </div>

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
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Order Summary : Value</h3>
                {(displayFrom || displayTo) && (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                    Date: {displayFrom || '-'} to {displayTo || '-'}
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
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Order Info</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>Images</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Customer</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Unit / Sup</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Ship Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Work Order No</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>Consumption <br/><span style={{ fontSize: 11, color: '#64748b' }}>(Planned : Actual)</span></th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Status <br/><span style={{ fontSize: 11, color: '#64748b' }}>(BOM | Budget | Stock | Issue)</span></th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, width: 100 }}>Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan={10} style={{ padding: 32, textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>No records found for the given query.</td></tr>
                  ) : (
                    records.map((r, idx) => (
                      <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={{ padding: '10px 12px' }}>{r.sNo}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1e40af' }}>{r.orderInfo}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <div style={{ width: 40, height: 40, backgroundColor: '#e2e8f0', borderRadius: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                            👕
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>{r.customer}</td>
                        <td style={{ padding: '10px 12px' }}>{r.unitSup}</td>
                        <td style={{ padding: '10px 12px' }}>{r.shipDate}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.workOrderNo}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>
                          <span style={{ color: '#3b82f6' }}>{r.consumptionPlanned}</span> : <span style={{ color: '#10b981' }}>{r.consumptionActual}</span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 11, fontWeight: 600 }}>
                            <div><span style={{ color: '#64748b' }}>BOM:</span> {r.statusBom}</div>
                            <div><span style={{ color: '#64748b' }}>Budg:</span> {r.statusBudget}</div>
                            <div><span style={{ color: '#64748b' }}>Stk:</span> {r.statusStock}</div>
                            <div><span style={{ color: '#64748b' }}>Iss:</span> {r.statusIssue}</div>
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <button style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #3b82f6', backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))
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
