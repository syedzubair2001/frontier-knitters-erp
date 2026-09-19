import { useState } from 'react';
import Navbar from '../components/Navbar';
import { getSession } from '../auth';
import BlueSelect from '../components/BlueSelect';
import {
  ORDER_TYPES,
  STYLE_TYPES,
  COMPANY_LIST,
  CUSTOMER_LIST,
  UNIT_SUPPLIER_LIST,
  ITEM_GROUP_LIST,
  MERCHANDISER_LIST,
  STYLE_LIST,
  ITEM_TYPE_LIST,
  STORE_LIST,
  ITEM_LIST,
  COLOR_LIST,
  SIZE_LIST,
  MANUFACTURER_LIST,
  PRODUCT_CATEGORY_LIST,
  ITEM_CATEGORY_LIST,
  PROCESS_LIST,
  SUB_GROUP_LIST,
  STOCK_TYPE_LIST
} from '../misqueryConfig';

export default function MisqueryStock() {
  const session = getSession() || { username: 'superadmin', role: 'Super Admin' };

  // Top Radio
  const [wiseType, setWiseType] = useState('Group Wise');

  // Dropdowns
  const [company, setCompany] = useState('--Select--');
  const [item, setItem] = useState('--Select--');
  const [color, setColor] = useState('--Select--');
  const [supplier, setSupplier] = useState('--Select--');
  const [size, setSize] = useState('--Select--');
  const [customer, setCustomer] = useState('--Select--');
  const [manufacturer, setManufacturer] = useState('--Select--');
  const [unit, setUnit] = useState('--Select--');
  const [productCategory, setProductCategory] = useState('--Select--');
  const [store, setStore] = useState('--Select--');
  const [itemCategory, setItemCategory] = useState('--Select--');
  const [itemGroup, setItemGroup] = useState('--Select--');
  const [processType, setProcessType] = useState('--Select--');
  const [subGroup, setSubGroup] = useState('--Select--');
  const [merchandiser, setMerchandiser] = useState('--Select--');
  const [itemType, setItemType] = useState('--Select--');
  const [stockType, setStockType] = useState('--Select--');
  const [orderType, setOrderType] = useState('--All--');
  const [style, setStyle] = useState('--Select--');

  // Text Inputs
  const [orderNo, setOrderNo] = useState('');
  const [refNo, setRefNo] = useState('');
  const [barcodeNo, setBarcodeNo] = useState('');
  const [date, setDate] = useState('');

  // Checkboxes Group
  const [stockNilBalance, setStockNilBalance] = useState(false);
  const [stockNilValue, setStockNilValue] = useState(false);
  const [itemSummary, setItemSummary] = useState(false);
  const [groupSummary, setGroupSummary] = useState(false);
  const [itemTotal, setItemTotal] = useState(false);
  const [scrollOption, setScrollOption] = useState(false);
  const [withImage, setWithImage] = useState(false);

  // Bottom Checkboxes
  const [exportData, setExportData] = useState(false);
  const [barcodeStock, setBarcodeStock] = useState(false);

  // Table Data
  const [submitted, setSubmitted] = useState(false);
  const [displayDate, setDisplayDate] = useState('');

  const handleClear = () => {
    setWiseType('Group Wise');
    setCompany('--Select--'); setItem('--Select--'); setColor('--Select--');
    setSupplier('--Select--'); setSize('--Select--'); setCustomer('--Select--');
    setManufacturer('--Select--'); setUnit('--Select--'); setProductCategory('--Select--');
    setStore('--Select--'); setItemCategory('--Select--'); setItemGroup('--Select--');
    setProcessType('--Select--'); setSubGroup('--Select--'); setMerchandiser('--Select--');
    setItemType('--Select--'); setStockType('--Select--'); setOrderType('--All--');
    setStyle('--Select--');
    
    setOrderNo(''); setRefNo(''); setBarcodeNo(''); setDate('');
    
    setStockNilBalance(false); setStockNilValue(false); setItemSummary(false);
    setGroupSummary(false); setItemTotal(false); setScrollOption(false); setWithImage(false);
    
    setExportData(false); setBarcodeStock(false);
    
    setSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setDisplayDate(date);
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar session={session} />

      <main style={{ maxWidth: 1500, margin: '0 auto', padding: '24px 20px 60px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          📦 Stock
        </h1>

        {/* QUERY OPTIONS FORM */}
        {!submitted && (
          <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a8a', margin: '0 0 16px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
              Query Options <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginLeft: 10 }}>Fields ➔</span>
            </h2>

            {/* Row 1: Wise Type Radios */}
            <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 20px' }}>
                {[
                  'Group Wise', 'Size Wise', 'Supplier Wise', 'Store Wise',
                  'Process Wise', 'Merchandiser Wise', 'Buyer Order Wise', 'Despatch Order Wise'
                ].map(opt => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    <input type="radio" checked={wiseType === opt} onChange={() => setWiseType(opt)} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* Row 2: Dropdowns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px 24px', marginBottom: 20, backgroundColor: '#f1f5f9', padding: 16, borderRadius: 8 }}>
              
              <div className="field" style={{ margin: 0 }}>
                <label>Company</label>
                <BlueSelect className="inp" value={company} onChange={e => setCompany(e.target.value)}>
                  {COMPANY_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>
              
              <div className="field" style={{ margin: 0 }}>
                <label>Item</label>
                <BlueSelect className="inp" value={item} onChange={e => setItem(e.target.value)}>
                  {ITEM_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Color</label>
                <BlueSelect className="inp" value={color} onChange={e => setColor(e.target.value)}>
                  {COLOR_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Supplier</label>
                <BlueSelect className="inp" value={supplier} onChange={e => setSupplier(e.target.value)}>
                  {UNIT_SUPPLIER_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Size</label>
                <BlueSelect className="inp" value={size} onChange={e => setSize(e.target.value)}>
                  {SIZE_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Customer</label>
                <BlueSelect className="inp" value={customer} onChange={e => setCustomer(e.target.value)}>
                  {CUSTOMER_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Manufacturer</label>
                <BlueSelect className="inp" value={manufacturer} onChange={e => setManufacturer(e.target.value)}>
                  {MANUFACTURER_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Unit</label>
                <BlueSelect className="inp" value={unit} onChange={e => setUnit(e.target.value)}>
                  {UNIT_SUPPLIER_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Product Category</label>
                <BlueSelect className="inp" value={productCategory} onChange={e => setProductCategory(e.target.value)}>
                  {PRODUCT_CATEGORY_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Store</label>
                <BlueSelect className="inp" value={store} onChange={e => setStore(e.target.value)}>
                  {STORE_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Item Category</label>
                <BlueSelect className="inp" value={itemCategory} onChange={e => setItemCategory(e.target.value)}>
                  {ITEM_CATEGORY_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Item Group</label>
                <BlueSelect className="inp" value={itemGroup} onChange={e => setItemGroup(e.target.value)}>
                  {ITEM_GROUP_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Process</label>
                <BlueSelect className="inp" value={processType} onChange={e => setProcessType(e.target.value)}>
                  {PROCESS_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Sub Group</label>
                <BlueSelect className="inp" value={subGroup} onChange={e => setSubGroup(e.target.value)}>
                  {SUB_GROUP_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Merchandiser</label>
                <BlueSelect className="inp" value={merchandiser} onChange={e => setMerchandiser(e.target.value)}>
                  {MERCHANDISER_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Item Type</label>
                <BlueSelect className="inp" value={itemType} onChange={e => setItemType(e.target.value)}>
                  {ITEM_TYPE_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Stock Type</label>
                <BlueSelect className="inp" value={stockType} onChange={e => setStockType(e.target.value)}>
                  {STOCK_TYPE_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Order Type</label>
                <BlueSelect className="inp" value={orderType} onChange={e => setOrderType(e.target.value)}>
                  {ORDER_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </BlueSelect>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>Style</label>
                <BlueSelect className="inp" value={style} onChange={e => setStyle(e.target.value)}>
                  {STYLE_LIST.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
                <label>Barcode No</label>
                <input type="text" className="inp" placeholder="Enter Barcode No" value={barcodeNo} onChange={e => setBarcodeNo(e.target.value)} />
              </div>
              <div className="field">
                <label>Date</label>
                <input type="date" className="inp" value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </div>

            {/* Row 4: Checkboxes Group */}
            <div style={{ backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={stockNilBalance} onChange={e => setStockNilBalance(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
                  Stock With Nil Balance
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={stockNilValue} onChange={e => setStockNilValue(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
                  Stock With Nil Value
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={itemSummary} onChange={e => setItemSummary(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
                  Item Summary
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={groupSummary} onChange={e => setGroupSummary(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
                  Group Summary
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={itemTotal} onChange={e => setItemTotal(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
                  Item Total
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={scrollOption} onChange={e => setScrollOption(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
                  Scroll Option
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={withImage} onChange={e => setWithImage(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
                  With Image
                </label>
              </div>
            </div>

            {/* Row 5: Additional Options & Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#16a34a', cursor: 'pointer' }}>
                  <input type="checkbox" checked={exportData} onChange={(e) => setExportData(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#16a34a' }} />
                  Export
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#9333ea', cursor: 'pointer' }}>
                  <input type="checkbox" checked={barcodeStock} onChange={(e) => setBarcodeStock(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#9333ea' }} />
                  Barcode Stock
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
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Stock : Value</h3>
                  {displayDate && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                      As of Date: {displayDate}
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
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Group / Type</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Item Details</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Store / Supplier</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Stock Qty</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Stock Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>Related Stock data will be displayed here.</td></tr>
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
