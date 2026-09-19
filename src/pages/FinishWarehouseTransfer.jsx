// Finish Warehouse Transfer Page — Sales & Shipment > SHIPMENT > Finish Warehouse Transfer
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../auth';
import Navbar from '../components/Navbar';
import {
  STORE_OPTIONS, ORDER_NO_OPTIONS, ENTRY_NO_OPTIONS, CUSTOMER_OPTIONS,
  ORDER_TYPES, TRANSFER_DOWNLOAD_FORMATS, FINISH_TRANSFER_COLUMNS
} from '../finishWarehouseTransferConfig';
import {
  listFinishWarehouseTransfers, saveFinishWarehouseTransfer, deleteFinishWarehouseTransfer
} from '../finishWarehouseTransferService';
import BlueSelect from '../components/BlueSelect';

function generateEntryNo() {
  const num = Math.floor(100 + Math.random() * 900);
  return `FWT-2026-${num}`;
}

function makeBlankForm() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: '',
    transNo: generateEntryNo(),
    date: today,
    refNo: 'REF-' + Math.floor(1000 + Math.random() * 9000),
    customer: CUSTOMER_OPTIONS[1] || 'Zara / Inditex S.A.',
    orderNo: ORDER_NO_OPTIONS[1] || 'ORD-2026-901',
    style: 'Cotton Crew Neck Tee',
    orderType: ORDER_TYPES[0] || 'Bulk Order',
    deliveryDetails: 'Direct warehouse transfer for shipping consolidation',
    remarks: 'Goods inspected and passed quality check',
    store: STORE_OPTIONS[1] || 'Main Finished Warehouse - Unit 1',
    items: [
      {
        id: 'item-1',
        shipDate: today,
        destination: 'Barcelona Port, Spain',
        loading: 'Chennai Sea Port',
        discharge: 'Barcelona Port',
        productNo: 'PRD-TSH-001',
        productName: 'Men Knit T-Shirt - Navy L',
        orderQty: 5000,
        balanceQty: 1000,
        transferQty: 1000
      }
    ],
    storeDetails: [
      {
        id: 'store-1',
        transNo: 'STR-TR-501',
        date: today,
        supplier: 'Frontier Knitting Mill Unit 2',
        process: 'Finishing & Ironing',
        stockQty: 2500,
        transferQty: 1000
      }
    ]
  };
}

const PAGE_SIZE_DEFAULT = 10;

export default function FinishWarehouseTransfer() {
  const nav = useNavigate();
  const [session, setSession] = useState(() => getSession() || { username: 'superadmin', role: 'Super Admin' });
  const [rows, setRows] = useState(() => listFinishWarehouseTransfers());

  // View mode: 'list' or 'entry'
  const [viewMode, setViewMode] = useState('list');

  /* ── Form State ── */
  const [form, setForm] = useState(makeBlankForm);
  const [entryMsg, setEntryMsg] = useState('');
  const [entryErr, setEntryErr] = useState('');
  const [selectedOrderNoLookup, setSelectedOrderNoLookup] = useState('');

  /* ── Filter state for List view ── */
  const [filterOrderNo, setFilterOrderNo] = useState('');
  const [filterStore, setFilterStore] = useState('');
  const [filterEntryNo, setFilterEntryNo] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  /* ── List view toolbar & grid ── */
  const [downloadType, setDownloadType] = useState('CSV');
  const [msg, setMsg] = useState('');
  const [colFilters, setColFilters] = useState({});
  const [perPage, setPerPage] = useState(PAGE_SIZE_DEFAULT);
  const [page, setPage] = useState(1);
  const [printRecord, setPrintRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);

  /* ── Dynamic Slick Grid state ── */
  const [gridCols, setGridCols] = useState(() => FINISH_TRANSFER_COLUMNS);
  const [draggedColIndex, setDraggedColIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [sortKey, setSortKey] = useState('transNo');
  const [sortOrder, setSortOrder] = useState('desc');

  /* ── Auth & seed records ── */
  useEffect(() => {
    const s = getSession();
    if (!s || !s.username || !s.role) { logout(); nav('/login'); return; }
    setSession(s);

    const records = listFinishWarehouseTransfers();
    setRows(records || []);
  }, [nav]);

  /* ── List view filtering ── */
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterOrderNo && filterOrderNo !== 'All Orders' && r.orderNo !== filterOrderNo) return false;
      if (filterStore && filterStore !== 'All Stores' && r.store !== filterStore) return false;
      if (filterEntryNo && filterEntryNo !== 'All Entries' && r.transNo !== filterEntryNo) return false;

      const recDate = r.date;
      if (fromDate && recDate && recDate < fromDate) return false;
      if (toDate && recDate && recDate > toDate) return false;

      return Object.entries(colFilters).every(([k, v]) => {
        if (!v) return true;
        const val = r[k];
        return String(val || '').toLowerCase().includes(v.toLowerCase());
      });
    });
  }, [rows, filterOrderNo, filterStore, filterEntryNo, fromDate, toDate, colFilters]);

  /* ── Dynamic Slick Grid Sorting ── */
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA = a[sortKey] ?? '';
      let valB = b[sortKey] ?? '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortOrder]);

  if (!session) {
    return <div style={{ color: '#627d98', padding: 40, fontFamily: 'Inter, sans-serif' }}>Loading… please wait</div>;
  }

  const pages = Math.max(1, Math.ceil(sorted.length / perPage));
  const safePage = Math.min(page, pages);
  const paged = sorted.slice((safePage - 1) * perPage, safePage * perPage);

  /* ── Grid Header Sort Handler ── */
  const handleHeaderClick = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  /* ── Grid Header Drag & Drop Handler ── */
  const handleDragStart = (e, index) => {
    setDraggedColIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedColIndex === null || draggedColIndex === index) {
      setDraggedColIndex(null);
      setDragOverIndex(null);
      return;
    }
    const updatedCols = [...gridCols];
    const [movedCol] = updatedCols.splice(draggedColIndex, 1);
    updatedCols.splice(index, 0, movedCol);
    setGridCols(updatedCols);
    setDraggedColIndex(null);
    setDragOverIndex(null);
  };

  /* ── Reset Filters ── */
  const resetFilters = () => {
    setFilterOrderNo('');
    setFilterStore('');
    setFilterEntryNo('');
    setFromDate('');
    setToDate('');
    setColFilters({});
    setPage(1);
    setMsg('Filters cleared.');
    setTimeout(() => setMsg(''), 3000);
  };

  /* ── Handlers for Form & Items ── */
  const handleAddNewRecord = () => {
    setForm(makeBlankForm());
    setEntryMsg('');
    setEntryErr('');
    setViewMode('entry');
  };

  const handleEditRecord = (rec) => {
    setForm(JSON.parse(JSON.stringify(rec)));
    setEntryMsg('');
    setEntryErr('');
    setViewMode('entry');
  };

  const handleDeleteRecord = (id) => {
    if (window.confirm('Are you sure you want to delete this Finish Warehouse Transfer record?')) {
      const updated = deleteFinishWarehouseTransfer(id);
      setRows(updated);
      setMsg('Record deleted successfully.');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  /* ── Item Operations ── */
  const handleAddItem = () => {
    const today = new Date().toISOString().slice(0, 10);
    const newItem = {
      id: 'item-' + Date.now(),
      shipDate: today,
      destination: 'Hamburg Port, Germany',
      loading: 'Chennai Sea Port',
      discharge: 'Hamburg Port',
      productNo: selectedOrderNoLookup ? `PRD-${selectedOrderNoLookup.slice(-3)}` : 'PRD-NEW-001',
      productName: 'Knit Polo Shirt - White L',
      orderQty: 1000,
      balanceQty: 500,
      transferQty: 500
    };
    setForm(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  const handleRemoveItem = (itemId) => {
    setForm(prev => ({
      ...prev,
      items: (prev.items || []).filter(i => i.id !== itemId)
    }));
  };

  const handleItemChange = (itemId, field, val) => {
    setForm(prev => ({
      ...prev,
      items: (prev.items || []).map(item => item.id === itemId ? { ...item, [field]: val } : item)
    }));
  };

  /* ── Store Detail Operations ── */
  const handleAddStoreDetail = () => {
    const today = new Date().toISOString().slice(0, 10);
    const newStoreDetail = {
      id: 'store-' + Date.now(),
      transNo: `STR-TR-${Math.floor(100 + Math.random() * 900)}`,
      date: today,
      supplier: 'Frontier Finishing Dept',
      process: 'Final Steam Iron & Tagging',
      stockQty: 2000,
      transferQty: 500
    };
    setForm(prev => ({
      ...prev,
      storeDetails: [...(prev.storeDetails || []), newStoreDetail]
    }));
  };

  const handleRemoveStoreDetail = (storeId) => {
    setForm(prev => ({
      ...prev,
      storeDetails: (prev.storeDetails || []).filter(s => s.id !== storeId)
    }));
  };

  const handleStoreDetailChange = (storeId, field, val) => {
    setForm(prev => ({
      ...prev,
      storeDetails: (prev.storeDetails || []).map(sd => sd.id === storeId ? { ...sd, [field]: val } : sd)
    }));
  };

  /* ── Save Form ── */
  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!form.transNo || !form.customer) {
      setEntryErr('Please fill in required fields: Entry No and Customer.');
      return;
    }
    try {
      const updatedList = saveFinishWarehouseTransfer(form);
      setRows(updatedList);
      setEntryMsg('Finish Warehouse Transfer saved successfully!');
      setTimeout(() => {
        setViewMode('list');
        setMsg('Record saved successfully.');
        setTimeout(() => setMsg(''), 3000);
      }, 800);
    } catch (err) {
      setEntryErr('Failed to save record. Please try again.');
    }
  };

  /* ── Export Handler ── */
  const handleDownload = () => {
    if (downloadType === 'CSV' || downloadType === 'XLS') {
      const headers = gridCols.filter(c => c.key !== 'action').map(c => c.label);
      const csvRows = [headers.join(',')];
      sorted.forEach((r, idx) => {
        const rowVal = [
          idx + 1,
          `"${r.transNo || ''}"`,
          `"${r.date || ''}"`,
          `"${r.customer || ''}"`,
          `"${r.orderNo || ''}"`,
          `"${r.refNo || ''}"`,
          `"${r.style || ''}"`,
          `"${r.orderType || ''}"`
        ];
        csvRows.push(rowVal.join(','));
      });
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Finish_Warehouse_Transfer_List.${downloadType.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg(`Downloaded list as ${downloadType.toUpperCase()}`);
    } else {
      setMsg(`Preparing ${downloadType.toUpperCase()} file download...`);
      setTimeout(() => {
        alert(`Downloaded Finish Warehouse Transfer list as ${downloadType.toUpperCase()}`);
        setMsg('');
      }, 600);
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar session={session} />

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px 60px' }}>
        
        {/* Breadcrumb Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600 }}>
              Sales & Shipment &gt; SHIPMENT &gt; FINISH WAREHOUSE TRANSFER
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '4px 0 0' }}>
              {viewMode === 'list' ? 'Finish Warehouse Transfer' : (form.id ? 'Edit Finish Warehouse Transfer' : 'Add Finish Warehouse Transfer')}
            </h1>
          </div>
          {viewMode === 'list' ? (
            <button
              onClick={handleAddNewRecord}
              style={{
                backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '9px 16px',
                borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                boxShadow: '0 2px 4px rgba(37,99,235,0.2)', width: 'auto', whiteSpace: 'nowrap', flexShrink: 0
              }}
            >
              ➕ Add Finish Transfer
            </button>
          ) : (
            <button
              onClick={() => setViewMode('list')}
              style={{
                backgroundColor: '#94a3b8', color: '#fff', border: 'none', padding: '10px 18px',
                borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6
              }}
            >
              ⬅ Back to List
            </button>
          )}
        </div>

        {msg && (
          <div style={{ padding: '12px 16px', borderRadius: 6, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', marginBottom: 16, fontWeight: 500 }}>
            {msg}
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <>
            {/* Filter Section */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#334155', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                🔍 Filter Criteria
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, alignItems: 'end' }}>
                
                {/* Order No Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Order No</label>
                  <BlueSelect
                    value={filterOrderNo}
                    onChange={(e) => setFilterOrderNo(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  >
                    {ORDER_NO_OPTIONS.map((opt) => (
                      <option key={opt} value={opt === 'All Orders' ? '' : opt}>{opt}</option>
                    ))}
                  </BlueSelect>
                </div>

                {/* Store Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Store</label>
                  <BlueSelect
                    value={filterStore}
                    onChange={(e) => setFilterStore(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  >
                    {STORE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt === 'All Stores' ? '' : opt}>{opt}</option>
                    ))}
                  </BlueSelect>
                </div>

                {/* Entry No Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Entry No</label>
                  <BlueSelect
                    value={filterEntryNo}
                    onChange={(e) => setFilterEntryNo(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  >
                    {ENTRY_NO_OPTIONS.map((opt) => (
                      <option key={opt} value={opt === 'All Entries' ? '' : opt}>{opt}</option>
                    ))}
                  </BlueSelect>
                </div>

                {/* From Date */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  />
                </div>

                {/* To Date */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  />
                </div>

                {/* Reset Filters */}
                <div>
                  <button
                    onClick={resetFilters}
                    style={{
                      width: '100%', padding: '9px 14px', borderRadius: 6, border: '1px solid #cbd5e1',
                      backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}
                  >
                    🔄 Reset Filters
                  </button>
                </div>

              </div>
            </div>

            {/* List Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>Download Format:</span>
                <BlueSelect
                  value={downloadType}
                  onChange={(e) => setDownloadType(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, color: '#0f172a' }}
                >
                  {TRANSFER_DOWNLOAD_FORMATS.map((fmt) => (
                    <option key={fmt} value={fmt}>{fmt}</option>
                  ))}
                </BlueSelect>
                <button
                  onClick={handleDownload}
                  style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #0284c7', backgroundColor: '#0284c7', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  📥 Download
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => alert('Printing list view of Finish Warehouse Transfer...')}
                  style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #475569', backgroundColor: '#ffffff', color: '#334155', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  🖨️ Print List
                </button>
                <button
                  onClick={() => alert(`Total Records: ${sorted.length}`)}
                  style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #475569', backgroundColor: '#ffffff', color: '#334155', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  👁️ View List
                </button>
              </div>
            </div>

            {/* Dynamic Slick Grid Table */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', minWidth: 1200, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      {gridCols.map((col, idx) => {
                        const isSort = sortKey === col.key;
                        return (
                          <th
                            key={col.key}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDrop={(e) => handleDrop(e, idx)}
                            onClick={() => col.key !== 'action' && col.key !== 'sno' && handleHeaderClick(col.key)}
                            style={{
                              padding: '10px 12px',
                              textAlign: col.key === 'action' ? 'center' : 'left',
                              fontWeight: 700,
                              color: '#1e293b',
                              cursor: col.key !== 'action' && col.key !== 'sno' ? 'pointer' : 'default',
                              userSelect: 'none',
                              backgroundColor: dragOverIndex === idx ? '#e2e8f0' : 'transparent',
                              borderRight: '1px solid #cbd5e1',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: col.key === 'action' ? 'center' : 'space-between', gap: 6 }}>
                              <span>⋮⋮ {col.label}</span>
                              {isSort && (<span>{sortOrder === 'asc' ? '▲' : '▼'}</span>)}
                            </div>
                          </th>
                        );
                      })}
                    </tr>

                    {/* Per-column Search Row */}
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                      {gridCols.map((col) => (
                        <td key={'search-' + col.key} style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>
                          {col.key !== 'action' && col.key !== 'sno' ? (
                            <input
                              type="text"
                              placeholder={`Search ${col.label}...`}
                              value={colFilters[col.key] || ''}
                              onChange={(e) => setColFilters(prev => ({ ...prev, [col.key]: e.target.value }))}
                              style={{
                                width: '100%', padding: '4px 8px', fontSize: 12, borderRadius: 4,
                                border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a'
                              }}
                            />
                          ) : null}
                        </td>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {paged.length === 0 ? (
                      <tr>
                        <td colSpan={gridCols.length} style={{ textAlign: 'center', padding: '36px 12px', color: '#64748b' }}>
                          No Finish Warehouse Transfer records found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      paged.map((row, idx) => {
                        const globalIndex = (safePage - 1) * perPage + idx + 1;
                        return (
                          <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                            {gridCols.map((col) => {
                              if (col.key === 'sno') {
                                return (
                                  <td key={col.key} style={{ padding: '10px 12px', color: '#64748b', fontWeight: 600, borderRight: '1px solid #f1f5f9' }}>
                                    {globalIndex}
                                  </td>
                                );
                              }
                              if (col.key === 'action') {
                                return (
                                  <td key={col.key} style={{ padding: '8px 12px', textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                      <button
                                        onClick={() => handleEditRecord(row)}
                                        title="Edit Record"
                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, color: '#2563eb' }}
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        onClick={() => setPrintRecord(row)}
                                        title="Print Record"
                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, color: '#0284c7' }}
                                      >
                                        🖨️
                                      </button>
                                      <button
                                        onClick={() => handleDeleteRecord(row.id)}
                                        title="Delete Record"
                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, color: '#dc2626' }}
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </td>
                                );
                              }

                              return (
                                <td key={col.key} style={{ padding: '10px 12px', color: '#1e293b', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                                  {row[col.key] || '-'}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: 13 }}>
                <div style={{ color: '#64748b' }}>
                  Showing {sorted.length > 0 ? (safePage - 1) * perPage + 1 : 0} to {Math.min(safePage * perPage, sorted.length)} of {sorted.length} records
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    disabled={safePage === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid #cbd5e1', backgroundColor: safePage === 1 ? '#f1f5f9' : '#fff', cursor: safePage === 1 ? 'not-allowed' : 'pointer', fontSize: 13 }}
                  >
                    ◀ Prev
                  </button>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Page {safePage} of {pages}</span>
                  <button
                    disabled={safePage === pages}
                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                    style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid #cbd5e1', backgroundColor: safePage === pages ? '#f1f5f9' : '#fff', cursor: safePage === pages ? 'not-allowed' : 'pointer', fontSize: 13 }}
                  >
                    Next ▶
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ADD / EDIT FORM VIEW */}
        {viewMode === 'entry' && (
          <form onSubmit={handleSaveForm} style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            
            <div style={{ borderBottom: '1px solid #e2e8f0', pb: 16, marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                📋 Finish Warehouse Transfer Heading
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                Enter transfer header info, order delivery item specifications, and store details.
              </p>
            </div>

            {entryErr && (
              <div style={{ padding: '10px 14px', borderRadius: 6, backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', marginBottom: 16, fontSize: 13 }}>
                {entryErr}
              </div>
            )}

            {entryMsg && (
              <div style={{ padding: '10px 14px', borderRadius: 6, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', marginBottom: 16, fontSize: 13 }}>
                {entryMsg}
              </div>
            )}

            {/* Header Fields Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24, backgroundColor: '#f8fafc', padding: 16, borderRadius: 6, border: '1px solid #f1f5f9' }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Entry No *</label>
                <input
                  type="text"
                  value={form.transNo}
                  onChange={(e) => setForm({ ...form, transNo: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Ref No</label>
                <input
                  type="text"
                  value={form.refNo}
                  onChange={(e) => setForm({ ...form, refNo: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Customer Dropdown *</label>
                <BlueSelect
                  value={form.customer}
                  onChange={(e) => setForm({ ...form, customer: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  required
                >
                  {CUSTOMER_OPTIONS.filter(c => c !== 'All Customers').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </BlueSelect>
              </div>
            </div>

            {/* Middle Fields: Delivery Details & Remarks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Delivery Details</label>
                <textarea
                  rows={3}
                  value={form.deliveryDetails}
                  onChange={(e) => setForm({ ...form, deliveryDetails: e.target.value })}
                  placeholder="Enter delivery instructions, vessel/truck reference..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Remarks</label>
                <textarea
                  rows={3}
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  placeholder="Enter transfer remarks or special packing notes..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Delivery Details Tab / Section */}
            <div style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: 18, marginBottom: 24, backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  📦 Delivery Details Tab
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>Order No Lookup:</span>
                  <BlueSelect
                    value={selectedOrderNoLookup}
                    onChange={(e) => setSelectedOrderNoLookup(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, color: '#0f172a' }}
                  >
                    {ORDER_NO_OPTIONS.map((opt) => (
                      <option key={opt} value={opt === 'All Orders' ? '' : opt}>{opt}</option>
                    ))}
                  </BlueSelect>
                  
                  <button
                    type="button"
                    onClick={handleAddItem}
                    style={{
                      backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '6px 14px',
                      borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                    }}
                  >
                    ➕ Order No List Button (Add Row)
                  </button>
                </div>
              </div>

              {/* Scrollable Order Details Table */}
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 6 }}>
                <table style={{ width: '100%', minWidth: 1400, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '10px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Ship Date</th>
                      <th style={{ padding: '10px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Destination</th>
                      <th style={{ padding: '10px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Loading</th>
                      <th style={{ padding: '10px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Discharge</th>
                      <th style={{ padding: '10px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Product No</th>
                      <th style={{ padding: '10px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Product Name</th>
                      <th style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Order Qty</th>
                      <th style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Balance Qty</th>
                      <th style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Transfer Qty</th>
                      <th style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700, color: '#334155' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!form.items || form.items.length === 0) ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', padding: '24px 12px', color: '#64748b' }}>
                          No order delivery items added. Click "Order No List Button (Add Row)" above.
                        </td>
                      </tr>
                    ) : (
                      form.items.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="date"
                              value={item.shipDate}
                              onChange={(e) => handleItemChange(item.id, 'shipDate', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={item.destination}
                              onChange={(e) => handleItemChange(item.id, 'destination', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={item.loading}
                              onChange={(e) => handleItemChange(item.id, 'loading', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={item.discharge}
                              onChange={(e) => handleItemChange(item.id, 'discharge', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={item.productNo}
                              onChange={(e) => handleItemChange(item.id, 'productNo', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={item.productName}
                              onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="number"
                              value={item.orderQty}
                              onChange={(e) => handleItemChange(item.id, 'orderQty', Number(e.target.value))}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="number"
                              value={item.balanceQty}
                              onChange={(e) => handleItemChange(item.id, 'balanceQty', Number(e.target.value))}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="number"
                              value={item.transferQty}
                              onChange={(e) => handleItemChange(item.id, 'transferQty', Number(e.target.value))}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc2626', fontSize: 14 }}
                              title="Delete Item"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Downside Store Details Section */}
            <div style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: 18, marginBottom: 24, backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                    🏬 Downside Store Details
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>Store Dropdown:</span>
                    <BlueSelect
                      value={form.store}
                      onChange={(e) => setForm({ ...form, store: e.target.value })}
                      style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, color: '#0f172a' }}
                    >
                      {STORE_OPTIONS.filter(s => s !== 'All Stores').map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </BlueSelect>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddStoreDetail}
                  style={{
                    backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '6px 14px',
                    borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                  }}
                >
                  ➕ Add Store Detail Row
                </button>
              </div>

              {/* Store Details Table */}
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 6 }}>
                <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '10px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Trans No</th>
                      <th style={{ padding: '10px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Date</th>
                      <th style={{ padding: '10px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Supplier</th>
                      <th style={{ padding: '10px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Process</th>
                      <th style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Stock Qty</th>
                      <th style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Transfer Qty</th>
                      <th style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700, color: '#334155' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!form.storeDetails || form.storeDetails.length === 0) ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '24px 12px', color: '#64748b' }}>
                          No store detail records attached. Click "Add Store Detail Row" above.
                        </td>
                      </tr>
                    ) : (
                      form.storeDetails.map((sd) => (
                        <tr key={sd.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={sd.transNo}
                              onChange={(e) => handleStoreDetailChange(sd.id, 'transNo', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="date"
                              value={sd.date}
                              onChange={(e) => handleStoreDetailChange(sd.id, 'date', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={sd.supplier}
                              onChange={(e) => handleStoreDetailChange(sd.id, 'supplier', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={sd.process}
                              onChange={(e) => handleStoreDetailChange(sd.id, 'process', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="number"
                              value={sd.stockQty}
                              onChange={(e) => handleStoreDetailChange(sd.id, 'stockQty', Number(e.target.value))}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="number"
                              value={sd.transferQty}
                              onChange={(e) => handleStoreDetailChange(sd.id, 'transferQty', Number(e.target.value))}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveStoreDetail(sd.id)}
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc2626', fontSize: 14 }}
                              title="Delete Row"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Save & Cancel Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                style={{
                  padding: '10px 20px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9',
                  color: '#334155', fontWeight: 600, fontSize: 14, cursor: 'pointer'
                }}
              >
                ✖ Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 24px', borderRadius: 6, border: 'none', backgroundColor: '#2563eb',
                  color: '#ffffff', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                }}
              >
                💾 Save Finish Warehouse Transfer
              </button>
            </div>

          </form>
        )}

        {/* PRINT MODAL PREVIEW */}
        {printRecord && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
            <div style={{ backgroundColor: '#fff', borderRadius: 8, maxWidth: 650, width: '100%', padding: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', pb: 12, mb: 16 }}>
                <h3 style={{ margin: 0, fontSize: 18, color: '#0f172a' }}>🖨️ Finish Warehouse Transfer Slip</h3>
                <button onClick={() => setPrintRecord(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>✕</button>
              </div>

              <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, marginBottom: 20 }}>
                <p><strong>Transfer No:</strong> {printRecord.transNo}</p>
                <p><strong>Date:</strong> {printRecord.date}</p>
                <p><strong>Customer:</strong> {printRecord.customer}</p>
                <p><strong>Order No:</strong> {printRecord.orderNo} | <strong>Ref No:</strong> {printRecord.refNo}</p>
                <p><strong>Style:</strong> {printRecord.style} ({printRecord.orderType})</p>
                <p><strong>Store:</strong> {printRecord.store}</p>
                <p><strong>Delivery Details:</strong> {printRecord.deliveryDetails || 'N/A'}</p>
                <p><strong>Remarks:</strong> {printRecord.remarks || 'N/A'}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button onClick={() => setPrintRecord(null)} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#334155', cursor: 'pointer' }}>Close</button>
                <button onClick={() => { alert('Print job sent to default printer.'); setPrintRecord(null); }} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Print Slip</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
