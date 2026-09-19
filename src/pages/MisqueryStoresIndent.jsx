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
  INDENT_BY_LIST
} from '../misqueryConfig';

export default function MisqueryStoresIndent() {
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

  const [activeCustomer, setActiveCustomer] = useState(false);
  const [customer, setCustomer] = useState('--Select--');

  const [activeItemGroup, setActiveItemGroup] = useState(false);
  const [itemGroup, setItemGroup] = useState('--Select--');

  const [activeIndentBy, setActiveIndentBy] = useState(false);
  const [indentBy, setIndentBy] = useState('--Select--');

  // Inputs
  const [orderNo, setOrderNo] = useState('');
  const [refNo, setRefNo] = useState('');
  const [indentNo, setIndentNo] = useState('');

  // Date filters
  const [dateType, setDateType] = useState('indentDate'); // 'indentDate' or 'requiredDate'
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Status Radios
  const [status, setStatus] = useState('All'); // 'Active', 'Closed', 'Valid Cancel', 'All'

  // Type Radios
  const [orderTypeOpt, setOrderTypeOpt] = useState('Both'); // 'Order', 'Open', 'Both'

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
    setActiveCompany(false);
    setCompany('--Select--');
    setActiveUnit(false);
    setUnit('--Select--');
    setActiveCustomer(false);
    setCustomer('--Select--');
    setActiveItemGroup(false);
    setItemGroup('--Select--');
    setActiveIndentBy(false);
    setIndentBy('--Select--');
    setOrderNo('');
    setRefNo('');
    setIndentNo('');
    setDateType('indentDate');
    setFromDate('');
    setToDate('');
    setStatus('All');
    setOrderTypeOpt('Both');
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
          📋 Indent Register
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
              
              {/* Company */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 100 }}>
                  <input type="radio" checked={activeCompany} onChange={() => setActiveCompany(!activeCompany)} onClick={() => setActiveCompany(!activeCompany)} />
                  Company
                </label>
                <BlueSelect className="inp" value={company} onChange={e => setCompany(e.target.value)} style={{ flex: 1 }}>
                  {COMPANY_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              {/* Unit */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 100 }}>
                  <input type="radio" checked={activeUnit} onChange={() => setActiveUnit(!activeUnit)} onClick={() => setActiveUnit(!activeUnit)} />
                  Unit
                </label>
                <BlueSelect className="inp" value={unit} onChange={e => setUnit(e.target.value)} style={{ flex: 1 }}>
                  {UNIT_SUPPLIER_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              {/* Customer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 100 }}>
                  <input type="radio" checked={activeCustomer} onChange={() => setActiveCustomer(!activeCustomer)} onClick={() => setActiveCustomer(!activeCustomer)} />
                  Customer
                </label>
                <BlueSelect className="inp" value={customer} onChange={e => setCustomer(e.target.value)} style={{ flex: 1 }}>
                  {CUSTOMER_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              {/* Item Group */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 100 }}>
                  <input type="radio" checked={activeItemGroup} onChange={() => setActiveItemGroup(!activeItemGroup)} onClick={() => setActiveItemGroup(!activeItemGroup)} />
                  Item Group
                </label>
                <BlueSelect className="inp" value={itemGroup} onChange={e => setItemGroup(e.target.value)} style={{ flex: 1 }}>
                  {ITEM_GROUP_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              {/* Indent by */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', minWidth: 100 }}>
                  <input type="radio" checked={activeIndentBy} onChange={() => setActiveIndentBy(!activeIndentBy)} onClick={() => setActiveIndentBy(!activeIndentBy)} />
                  Indent By
                </label>
                <BlueSelect className="inp" value={indentBy} onChange={e => setIndentBy(e.target.value)} style={{ flex: 1 }}>
                  {INDENT_BY_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
              <div className="field">
                <label>Indent No</label>
                <input type="text" className="inp" placeholder="Enter Indent No" value={indentNo} onChange={e => setIndentNo(e.target.value)} />
              </div>
            </div>

            {/* Row 4: Dates & Status */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 20, alignItems: 'flex-start' }}>
              
              <div style={{ padding: 12, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, flex: 1, minWidth: 320 }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    <input type="radio" name="dateType" checked={dateType === 'indentDate'} onChange={() => setDateType('indentDate')} />
                    Indent Date
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    <input type="radio" name="dateType" checked={dateType === 'requiredDate'} onChange={() => setDateType('requiredDate')} />
                    Required Date
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minWidth: 320 }}>
                <div style={{ padding: 12, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
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

            </div>

            {/* Row 5: Additional Options & Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
                
                <div style={{ display: 'flex', gap: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Type:</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    <input type="radio" name="orderTypeOpt" checked={orderTypeOpt === 'Order'} onChange={() => setOrderTypeOpt('Order')} /> Order
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    <input type="radio" name="orderTypeOpt" checked={orderTypeOpt === 'Open'} onChange={() => setOrderTypeOpt('Open')} /> Open
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    <input type="radio" name="orderTypeOpt" checked={orderTypeOpt === 'Both'} onChange={() => setOrderTypeOpt('Both')} /> Both
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
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Indent Register : Value</h3>
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
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Indent No & Date</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Order Info</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Item Group</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Requested By</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>Related Indent data will be displayed here.</td></tr>
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
