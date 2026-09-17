import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getSession, logout } from '../auth';
import { ACCOUNTS_DOWNLOAD_TYPES } from '../accountsConfig';
import {
  PASSING_PARTY_TYPES,
  PASSING_INVOICE_TYPES,
  PASSING_INVOICE_TYPES_ENTRY,
  PASSING_SUPPLIERS,
  PASSING_CUSTOMERS,
  PASSING_WORK_DIVISIONS,
  PASSING_ENTERED_BY,
  PASSING_ITEM_TYPES,
  PASSING_PROCESSES,
  PASSING_SUP_INV_NOS,
  PASSING_INVOICE_NOS,
  DEFAULT_INVOICE_DETAILS,
  DEFAULT_PO_DETAILS,
  DEFAULT_PROCESS_ORD_DETAILS,
} from '../passingConfig';
import {
  getPassingRecords,
  addPassingRecord,
  updatePassingRecord,
  deletePassingRecord,
} from '../passingService';

export default function Passing() {
  const nav = useNavigate();
  const [session, setSession] = useState(() => getSession() || { username: 'superadmin', role: 'Super Admin' });
  const [records, setRecords] = useState(() => getPassingRecords());
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'add' | 'edit' | 'view'
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Modal State for Party Selection before Add
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPartyType, setSelectedPartyType] = useState('Supplier');

  // Filter state
  const [filters, setFilters] = useState({
    billApprovalNo: 'All',
    invoiceType: 'All',
    supplier: 'All Suppliers',
    type: 'All',
    fromDate: '2026-09-01',
    toDate: '2026-09-30',
    downloadFormat: 'CSV',
  });

  // Table Column Search state for list view
  const [colFilters, setColFilters] = useState({
    sNo: '',
    billApprovalNo: '',
    approvalDate: '',
    partyDate: '',
    supplierInvoiceNo: '',
    party: '',
    approver: '',
  });

  // Pagination state
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState('');

  // Form State for BILL PASS entry
  const [formData, setFormData] = useState({
    billApprovalNo: '',
    approvalDate: new Date().toISOString().split('T')[0],
    refNo: '',
    partyType: 'Supplier',
    party: '',
    invoiceType: 'Contractor Invoice',
    enteredBy: 'Admin User',
    itemType: 'Article',
    process: 'Yarn Dyeing',
    supInvNo: 'All',
    invoiceNo: 'All',
    fromDate: '',
    remarks: '',
    invoiceDetails: DEFAULT_INVOICE_DETAILS,
    poDetails: DEFAULT_PO_DETAILS,
    processOrdDetails: DEFAULT_PROCESS_ORD_DETAILS,
  });

  useEffect(() => {
    const s = getSession();
    if (!s || !s.username || !s.role) {
      logout();
      nav('/login');
      return;
    }
    setSession(s);
  }, [nav]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleColFilterChange = (field, value) => {
    setColFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      billApprovalNo: 'All',
      invoiceType: 'All',
      supplier: 'All Suppliers',
      type: 'All',
      fromDate: '2026-09-01',
      toDate: '2026-09-30',
      downloadFormat: 'CSV',
    });
    setColFilters({
      sNo: '',
      billApprovalNo: '',
      approvalDate: '',
      partyDate: '',
      supplierInvoiceNo: '',
      party: '',
      approver: '',
    });
    setPage(1);
  };

  // Bill Approval Nos for filter dropdown
  const billApprovalNoOptions = useMemo(() => {
    const list = Array.from(new Set(records.map((r) => r.billApprovalNo)));
    return ['All', ...list];
  }, [records]);

  // Filtered records for list view
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (filters.billApprovalNo !== 'All' && r.billApprovalNo !== filters.billApprovalNo) return false;
      if (filters.invoiceType !== 'All' && r.invoiceType !== filters.invoiceType) return false;
      if (filters.supplier !== 'All Suppliers' && r.party !== filters.supplier) return false;
      if (filters.type !== 'All' && r.partyType !== filters.type) return false;
      if (filters.fromDate && r.approvalDate < filters.fromDate) return false;
      if (filters.toDate && r.approvalDate > filters.toDate) return false;

      // Column specific search filters
      if (colFilters.sNo && !String(r.id).toLowerCase().includes(colFilters.sNo.toLowerCase())) return false;
      if (colFilters.billApprovalNo && !r.billApprovalNo.toLowerCase().includes(colFilters.billApprovalNo.toLowerCase())) return false;
      if (colFilters.approvalDate && !r.approvalDate.toLowerCase().includes(colFilters.approvalDate.toLowerCase())) return false;
      if (colFilters.partyDate && !(r.partyDate || '').toLowerCase().includes(colFilters.partyDate.toLowerCase())) return false;
      if (colFilters.supplierInvoiceNo && !(r.supplierInvoiceNo || '').toLowerCase().includes(colFilters.supplierInvoiceNo.toLowerCase())) return false;
      if (colFilters.party && !r.party.toLowerCase().includes(colFilters.party.toLowerCase())) return false;
      if (colFilters.approver && !(r.approver || '').toLowerCase().includes(colFilters.approver.toLowerCase())) return false;

      return true;
    });
  }, [records, filters, colFilters]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / perPage) || 1;
  const safePage = Math.min(page, totalPages);
  const pagedRecords = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return filteredRecords.slice(start, start + perPage);
  }, [filteredRecords, safePage, perPage]);

  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  const handleConfirmPartyType = () => {
    setShowAddModal(false);
    const nextNo = `FKS/BAP${String(records.length + 1).padStart(5, '0')}`;
    let defaultParty = '';
    if (selectedPartyType === 'Supplier') defaultParty = PASSING_SUPPLIERS[1];
    else if (selectedPartyType === 'Customer') defaultParty = PASSING_CUSTOMERS[0];
    else defaultParty = PASSING_WORK_DIVISIONS[0];

    setFormData({
      billApprovalNo: nextNo,
      approvalDate: new Date().toISOString().split('T')[0],
      refNo: '',
      partyType: selectedPartyType,
      party: defaultParty,
      invoiceType: 'Contractor Invoice',
      enteredBy: 'Admin User',
      itemType: 'Article',
      process: 'Yarn Dyeing',
      supInvNo: 'All',
      invoiceNo: 'All',
      fromDate: '',
      remarks: '',
      invoiceDetails: JSON.parse(JSON.stringify(DEFAULT_INVOICE_DETAILS)),
      poDetails: JSON.parse(JSON.stringify(DEFAULT_PO_DETAILS)),
      processOrdDetails: JSON.parse(JSON.stringify(DEFAULT_PROCESS_ORD_DETAILS)),
    });
    setViewMode('add');
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setFormData({
      ...record,
      invoiceDetails: record.invoiceDetails || JSON.parse(JSON.stringify(DEFAULT_INVOICE_DETAILS)),
      poDetails: record.poDetails || JSON.parse(JSON.stringify(DEFAULT_PO_DETAILS)),
      processOrdDetails: record.processOrdDetails || JSON.parse(JSON.stringify(DEFAULT_PROCESS_ORD_DETAILS)),
    });
    setViewMode('edit');
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setFormData({
      ...record,
      invoiceDetails: record.invoiceDetails || JSON.parse(JSON.stringify(DEFAULT_INVOICE_DETAILS)),
      poDetails: record.poDetails || JSON.parse(JSON.stringify(DEFAULT_PO_DETAILS)),
      processOrdDetails: record.processOrdDetails || JSON.parse(JSON.stringify(DEFAULT_PROCESS_ORD_DETAILS)),
    });
    setViewMode('view');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this bill approval record?')) {
      const updated = deletePassingRecord(id);
      setRecords(updated);
      setMsg('Bill Approval record deleted successfully.');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* ── Invoices Table Row Operations ── */
  const handleInvoiceRowChange = (id, field, value) => {
    setFormData((prev) => {
      const updated = prev.invoiceDetails.map((row) => {
        if (row.id !== id) return row;
        const newRow = { ...row, [field]: value };
        if (field === 'amount' || field === 'debit' || field === 'tds') {
          const amt = parseFloat(field === 'amount' ? value : row.amount) || 0;
          const dbt = parseFloat(field === 'debit' ? value : row.debit) || 0;
          const tdsVal = parseFloat(field === 'tds' ? value : row.tds) || 0;
          newRow.balance = Math.max(0, amt - dbt - tdsVal);
          newRow.billPassAmount = newRow.balance;
        }
        return newRow;
      });
      return { ...prev, invoiceDetails: updated };
    });
  };

  const handleAddInvoiceRow = () => {
    const newId = `inv-${Date.now()}`;
    const newRow = {
      id: newId,
      supInvNo: 'SINV-' + Math.floor(10000 + Math.random() * 90000),
      invoiceDate: new Date().toISOString().split('T')[0],
      invoiceNo: 'PINV-' + Math.floor(1000 + Math.random() * 9000),
      invoiceType: formData.invoiceType || 'Purchase Invoice',
      amount: 10000.00,
      debit: 0.00,
      tds: 200.00,
      balance: 9800.00,
      billPassAmount: 9800.00,
      discountAmount: 0.00,
      adjust: 0.00,
      selected: true,
    };
    setFormData((prev) => ({ ...prev, invoiceDetails: [...prev.invoiceDetails, newRow] }));
  };

  const handleRemoveInvoiceRow = (id) => {
    setFormData((prev) => ({
      ...prev,
      invoiceDetails: prev.invoiceDetails.filter((r) => r.id !== id),
    }));
  };

  /* ── PO Detail Table Row Operations ── */
  const handlePORowChange = (id, field, value) => {
    setFormData((prev) => {
      const updated = prev.poDetails.map((row) => (row.id === id ? { ...row, [field]: value } : row));
      return { ...prev, poDetails: updated };
    });
  };

  const handleAddPORow = () => {
    const newId = `po-${Date.now()}`;
    const newRow = {
      id: newId,
      orderNo: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      poDate: new Date().toISOString().split('T')[0],
      grnNo: 'GRN-' + Math.floor(1000 + Math.random() * 9000),
      grnDate: new Date().toISOString().split('T')[0],
      item: 'Sample Garment / Yarn Item',
      color: 'Navy',
      size: 'L',
      receiveQty: 100,
      amount: 15000.00,
      accQtyRate: 150.00,
    };
    setFormData((prev) => ({ ...prev, poDetails: [...prev.poDetails, newRow] }));
  };

  const handleRemovePORow = (id) => {
    setFormData((prev) => ({
      ...prev,
      poDetails: prev.poDetails.filter((r) => r.id !== id),
    }));
  };

  /* ── Process Ord Detail Table Row Operations ── */
  const handleProcessRowChange = (id, field, value) => {
    setFormData((prev) => {
      const updated = prev.processOrdDetails.map((row) => (row.id === id ? { ...row, [field]: value } : row));
      return { ...prev, processOrdDetails: updated };
    });
  };

  const handleAddProcessRow = () => {
    const newId = `prc-${Date.now()}`;
    const newRow = {
      id: newId,
      processOrdNo: 'POC-' + Math.floor(1000 + Math.random() * 9000),
      issueQty: 500,
      returnQty: 10,
      recptQty: 485,
      balQty: 5,
      balPct: '1.0%',
    };
    setFormData((prev) => ({ ...prev, processOrdDetails: [...prev.processOrdDetails, newRow] }));
  };

  const handleRemoveProcessRow = (id) => {
    setFormData((prev) => ({
      ...prev,
      processOrdDetails: prev.processOrdDetails.filter((r) => r.id !== id),
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.party) {
      alert('Please select a Party');
      return;
    }

    if (viewMode === 'add') {
      const created = addPassingRecord({
        ...formData,
        approver: formData.enteredBy,
        supplierInvoiceNo: formData.invoiceDetails[0]?.supInvNo || 'SINV-001',
      });
      setRecords(getPassingRecords());
      setMsg(`Bill Approval ${created.billApprovalNo} created successfully!`);
    } else if (viewMode === 'edit') {
      const updated = updatePassingRecord(selectedRecord.id, formData);
      setRecords(updated);
      setMsg(`Bill Approval ${formData.billApprovalNo} updated successfully!`);
    }
    setViewMode('list');
    setTimeout(() => setMsg(''), 3000);
  };

  const getPartyOptions = (type) => {
    if (type === 'Supplier') return PASSING_SUPPLIERS.filter((s) => s !== 'All Suppliers');
    if (type === 'Customer') return PASSING_CUSTOMERS;
    return PASSING_WORK_DIVISIONS;
  };

  const handleDownload = () => {
    setMsg(`Downloaded Bill Approval List as ${filters.downloadFormat.toUpperCase()}`);
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar session={session} />

      <main style={{ maxWidth: 1450, margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* Breadcrumb Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600 }}>
              ACCOUNTS &gt; BILLS &gt; PASSING
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '4px 0 0' }}>
              {viewMode === 'list' ? 'Bill Approval List' : 'Bill Pass'}
            </h1>
          </div>

          {viewMode === 'list' ? (
            <button
              onClick={handleOpenAddModal}
              style={{
                backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '9px 16px',
                borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                boxShadow: '0 2px 4px rgba(37,99,235,0.2)', width: 'auto', whiteSpace: 'nowrap', flexShrink: 0
              }}
            >
              ➕ Add Passing
            </button>
          ) : (
            <button
              onClick={() => setViewMode('list')}
              style={{
                backgroundColor: '#94a3b8', color: '#fff', border: 'none', padding: '9px 16px',
                borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                width: 'auto', whiteSpace: 'nowrap', flexShrink: 0
              }}
            >
              ⬅ Back to Approval List
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
            {/* Filter Section Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#334155', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                🔍 Filter Criteria
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, alignItems: 'end' }}>

                {/* Bill Approval No Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Bill Approval No</label>
                  <select
                    value={filters.billApprovalNo}
                    onChange={(e) => handleFilterChange('billApprovalNo', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  >
                    {billApprovalNoOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Invoice Type Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Invoice Type</label>
                  <select
                    value={filters.invoiceType}
                    onChange={(e) => handleFilterChange('invoiceType', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  >
                    {PASSING_INVOICE_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>


                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Supplier</label>
                  <select
                    value={filters.supplier}
                    onChange={(e) => handleFilterChange('supplier', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  >
                    {PASSING_SUPPLIERS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Type Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  >
                    <option value="All">All</option>
                    {PASSING_PARTY_TYPES.map((pt) => (
                      <option key={pt} value={pt}>{pt}</option>
                    ))}
                  </select>
                </div>

                {/* From Date */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>From Date</label>
                  <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  />
                </div>

                {/* To Date */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>To Date</label>
                  <input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) => handleFilterChange('toDate', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  />
                </div>

                {/* Reset Button */}
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
                <select
                  value={filters.downloadFormat}
                  onChange={(e) => handleFilterChange('downloadFormat', e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, color: '#0f172a' }}
                >
                  {ACCOUNTS_DOWNLOAD_TYPES.map((fmt) => (
                    <option key={fmt} value={fmt}>{fmt}</option>
                  ))}
                </select>
                <button
                  onClick={handleDownload}
                  style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #0284c7', backgroundColor: '#0284c7', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  📥 Download
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => alert('Printing list view of Bill Approvals...')}
                  style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #475569', backgroundColor: '#ffffff', color: '#334155', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  🖨️ Print List
                </button>
                <button
                  onClick={() => alert(`Total Records: ${filteredRecords.length}`)}
                  style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #475569', backgroundColor: '#ffffff', color: '#334155', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  👁️ View List ({filteredRecords.length})
                </button>
              </div>
            </div>

            {/* Records Table */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', minWidth: 1100, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1', width: 60 }}>S.No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Bill Approval No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Approval Date</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Party Date</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Supplier Inv No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Party</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Approver</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#1e293b', width: 120 }}>Actions</th>
                    </tr>

                    {/* Per-column Search Row */}
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>
                        <input
                          type="text"
                          placeholder="Search..."
                          value={colFilters.sNo}
                          onChange={(e) => handleColFilterChange('sNo', e.target.value)}
                          style={{ width: '100%', padding: '4px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }}
                        />
                      </td>
                      <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>
                        <input
                          type="text"
                          placeholder="Search No..."
                          value={colFilters.billApprovalNo}
                          onChange={(e) => handleColFilterChange('billApprovalNo', e.target.value)}
                          style={{ width: '100%', padding: '4px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }}
                        />
                      </td>
                      <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>
                        <input
                          type="text"
                          placeholder="Search Date..."
                          value={colFilters.approvalDate}
                          onChange={(e) => handleColFilterChange('approvalDate', e.target.value)}
                          style={{ width: '100%', padding: '4px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }}
                        />
                      </td>
                      <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>
                        <input
                          type="text"
                          placeholder="Search Date..."
                          value={colFilters.partyDate}
                          onChange={(e) => handleColFilterChange('partyDate', e.target.value)}
                          style={{ width: '100%', padding: '4px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }}
                        />
                      </td>
                      <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>
                        <input
                          type="text"
                          placeholder="Search Inv No..."
                          value={colFilters.supplierInvoiceNo}
                          onChange={(e) => handleColFilterChange('supplierInvoiceNo', e.target.value)}
                          style={{ width: '100%', padding: '4px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }}
                        />
                      </td>
                      <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>
                        <input
                          type="text"
                          placeholder="Search Party..."
                          value={colFilters.party}
                          onChange={(e) => handleColFilterChange('party', e.target.value)}
                          style={{ width: '100%', padding: '4px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }}
                        />
                      </td>
                      <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>
                        <input
                          type="text"
                          placeholder="Search Approver..."
                          value={colFilters.approver}
                          onChange={(e) => handleColFilterChange('approver', e.target.value)}
                          style={{ width: '100%', padding: '4px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }}
                        />
                      </td>
                      <td style={{ padding: '6px 8px' }}></td>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRecords.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '36px 12px', color: '#64748b' }}>
                          No bill approval records found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      pagedRecords.map((r, idx) => {
                        const globalIdx = (safePage - 1) * perPage + idx + 1;
                        return (
                          <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                            <td style={{ padding: '10px 12px', color: '#64748b', fontWeight: 600, borderRight: '1px solid #f1f5f9' }}>{globalIdx}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 600, color: '#2563eb', borderRight: '1px solid #f1f5f9' }}>{r.billApprovalNo}</td>
                            <td style={{ padding: '10px 12px', color: '#1e293b', borderRight: '1px solid #f1f5f9' }}>{r.approvalDate}</td>
                            <td style={{ padding: '10px 12px', color: '#1e293b', borderRight: '1px solid #f1f5f9' }}>{r.partyDate || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#334155', borderRight: '1px solid #f1f5f9' }}>{r.supplierInvoiceNo || '-'}</td>
                            <td style={{ padding: '10px 12px', color: '#1e293b', borderRight: '1px solid #f1f5f9' }}>
                              <span style={{ fontWeight: 500 }}>{r.party}</span>
                              <span style={{ marginLeft: 6, fontSize: 11, backgroundColor: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: 4 }}>
                                {r.partyType}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', color: '#475569', borderRight: '1px solid #f1f5f9' }}>{r.approver || '-'}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <button
                                  onClick={() => handleView(r)}
                                  title="View Details"
                                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15 }}
                                >
                                  👁️
                                </button>
                                <button
                                  onClick={() => handleEdit(r)}
                                  title="Edit Record"
                                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, color: '#2563eb' }}
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDelete(r.id)}
                                  title="Delete Record"
                                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, color: '#dc2626' }}
                                >
                                  🗑️
                                </button>
                                <button
                                  onClick={() => alert(`Printing Bill Approval ${r.billApprovalNo}...`)}
                                  title="Print Record"
                                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, color: '#0284c7' }}
                                >
                                  🖨️
                                </button>
                              </div>
                            </td>
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
                  Showing {filteredRecords.length > 0 ? (safePage - 1) * perPage + 1 : 0} to {Math.min(safePage * perPage, filteredRecords.length)} of {filteredRecords.length} records
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    disabled={safePage === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid #cbd5e1', backgroundColor: safePage === 1 ? '#f1f5f9' : '#fff', cursor: safePage === 1 ? 'not-allowed' : 'pointer', fontSize: 13 }}
                  >
                    ◀ Prev
                  </button>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Page {safePage} of {totalPages}</span>
                  <button
                    disabled={safePage === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid #cbd5e1', backgroundColor: safePage === totalPages ? '#f1f5f9' : '#fff', cursor: safePage === totalPages ? 'not-allowed' : 'pointer', fontSize: 13 }}
                  >
                    Next ▶
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ADD POPUP MODAL (Select Party Type) */}
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: 8, maxWidth: 440, width: '100%', padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  🏢 Select Party Type
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{ border: 'none', background: 'transparent', fontSize: 18, fontWeight: 700, color: '#64748b', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <p style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>
                Please select the party category for creating this Bill Pass approval entry:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, backgroundColor: '#f8fafc', padding: 16, borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 20 }}>
                {PASSING_PARTY_TYPES.map((pt) => (
                  <label
                    key={pt}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#1e293b', cursor: 'pointer', padding: 6, borderRadius: 4 }}
                  >
                    <input
                      type="radio"
                      name="partyTypeRadio"
                      value={pt}
                      checked={selectedPartyType === pt}
                      onChange={(e) => setSelectedPartyType(e.target.value)}
                      style={{ width: 16, height: 16, accentColor: '#2563eb', cursor: 'pointer' }}
                    />
                    <span>{pt}</span>
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#334155', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPartyType}
                  style={{ padding: '8px 20px', borderRadius: 6, border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}
                >
                  Submit &amp; Proceed
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ENTRY / EDIT / VIEW FORM ("BILL PASS") */}
        {(viewMode === 'add' || viewMode === 'edit' || viewMode === 'view') && (
          <form onSubmit={handleSave} style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  📄 Bill Pass ({formData.partyType})
                </h2>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                  Enter party invoice, approval dates, PO references, item types, and amounts for passing.
                </p>
              </div>
              <span style={{ fontSize: 12, backgroundColor: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>
                Mode: {viewMode.toUpperCase()}
              </span>
            </div>

            {/* Header Row 1: Bill Approval No, Approval Date, Ref No, Party Dropdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16, backgroundColor: '#f8fafc', padding: 16, borderRadius: 6, border: '1px solid #f1f5f9' }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Bill Approval No</label>
                <input
                  type="text"
                  value={formData.billApprovalNo}
                  disabled
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#e2e8f0', fontSize: 14, color: '#2563eb', fontWeight: 700, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Bill Approval Date *</label>
                <input
                  type="date"
                  value={formData.approvalDate}
                  disabled={viewMode === 'view'}
                  onChange={(e) => handleFormChange('approvalDate', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Ref No</label>
                <input
                  type="text"
                  placeholder="Enter Ref No"
                  value={formData.refNo}
                  disabled={viewMode === 'view'}
                  onChange={(e) => handleFormChange('refNo', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  {formData.partyType} *
                </label>
                <select
                  value={formData.party}
                  disabled={viewMode === 'view'}
                  onChange={(e) => handleFormChange('party', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none', fontWeight: 600 }}
                  required
                >
                  <option value="">-- Select {formData.partyType} --</option>
                  {getPartyOptions(formData.partyType).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Header Row 2: Invoice Type, Entered By, Item Type, Process, Sup Inv No, Invoice No, From Date */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24, backgroundColor: '#ffffff', padding: 16, borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Invoice Type</label>
                <select
                  value={formData.invoiceType}
                  disabled={viewMode === 'view'}
                  onChange={(e) => handleFormChange('invoiceType', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                >
                  {PASSING_INVOICE_TYPES_ENTRY.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Entered By</label>
                <select
                  value={formData.enteredBy}
                  disabled={viewMode === 'view'}
                  onChange={(e) => handleFormChange('enteredBy', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                >
                  {PASSING_ENTERED_BY.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Item Type</label>
                <select
                  value={formData.itemType}
                  disabled={viewMode === 'view'}
                  onChange={(e) => handleFormChange('itemType', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                >
                  {PASSING_ITEM_TYPES.map((it) => (
                    <option key={it} value={it}>{it}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Process</label>
                <select
                  value={formData.process}
                  disabled={viewMode === 'view'}
                  onChange={(e) => handleFormChange('process', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                >
                  {PASSING_PROCESSES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Sup Inv No</label>
                <select
                  value={formData.supInvNo}
                  disabled={viewMode === 'view'}
                  onChange={(e) => handleFormChange('supInvNo', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                >
                  {PASSING_SUP_INV_NOS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Invoice No</label>
                <select
                  value={formData.invoiceNo}
                  disabled={viewMode === 'view'}
                  onChange={(e) => handleFormChange('invoiceNo', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                >
                  {PASSING_INVOICE_NOS.map((inv) => (
                    <option key={inv} value={inv}>{inv}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>From</label>
                <input
                  type="text"
                  placeholder="Enter From"
                  value={formData.fromDate}
                  disabled={viewMode === 'view'}
                  onChange={(e) => handleFormChange('fromDate', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
                />
              </div>
            </div>

            {/* TABLE 1: MAIN INVOICES TABLE */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  🧾 Invoice Details Table
                </h3>
                {viewMode !== 'view' && (
                  <button
                    type="button"
                    onClick={handleAddInvoiceRow}
                    style={{ padding: '6px 12px', borderRadius: 6, border: 'none', backgroundColor: '#2563eb', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    ➕ Add Invoice Row
                  </button>
                )}
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: 6 }}>
                <table style={{ width: '100%', minWidth: 1250, borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Sup Inv No</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Invoice Date</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Invoice No</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Invoice Type</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Amount</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Debit</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>TDS</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Balance</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Bill Pass Amount</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Discount Amount</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Adjust</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: '#334155' }}>Select</th>
                      {viewMode !== 'view' && <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: '#334155' }}>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.invoiceDetails.length === 0 ? (
                      <tr>
                        <td colSpan={13} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                          No invoice rows added.
                        </td>
                      </tr>
                    ) : (
                      formData.invoiceDetails.map((inv) => (
                        <tr key={inv.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={inv.supInvNo}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handleInvoiceRowChange(inv.id, 'supInvNo', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="date"
                              value={inv.invoiceDate}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handleInvoiceRowChange(inv.id, 'invoiceDate', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={inv.invoiceNo}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handleInvoiceRowChange(inv.id, 'invoiceNo', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <select
                              value={inv.invoiceType}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handleInvoiceRowChange(inv.id, 'invoiceType', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            >
                              {PASSING_INVOICE_TYPES_ENTRY.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="number"
                              value={inv.amount}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handleInvoiceRowChange(inv.id, 'amount', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="number"
                              value={inv.debit}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handleInvoiceRowChange(inv.id, 'debit', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="number"
                              value={inv.tds}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handleInvoiceRowChange(inv.id, 'tds', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600, color: '#334155' }}>
                            ₹{Number(inv.balance || 0).toFixed(2)}
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="number"
                              value={inv.billPassAmount}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handleInvoiceRowChange(inv.id, 'billPassAmount', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right', fontWeight: 700, color: '#2563eb' }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="number"
                              value={inv.discountAmount}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handleInvoiceRowChange(inv.id, 'discountAmount', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="number"
                              value={inv.adjust}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handleInvoiceRowChange(inv.id, 'adjust', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={inv.selected}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handleInvoiceRowChange(inv.id, 'selected', e.target.checked)}
                              style={{ accentColor: '#2563eb', cursor: 'pointer', width: 16, height: 16 }}
                            />
                          </td>
                          {viewMode !== 'view' && (
                            <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveInvoiceRow(inv.id)}
                                style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontSize: 14 }}
                              >
                                🗑️
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABLE 2: PO DETAIL */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  📦 PO Detail
                </h3>
                {viewMode !== 'view' && (
                  <button
                    type="button"
                    onClick={handleAddPORow}
                    style={{ padding: '6px 12px', borderRadius: 6, border: 'none', backgroundColor: '#2563eb', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    ➕ Add PO Detail
                  </button>
                )}
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: 6 }}>
                <table style={{ width: '100%', minWidth: 1100, borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Order No</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>PO Date</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>GRN No</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>GRN Date</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Item</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Color</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Size</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Receive Qty</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Amount (₹)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Acc Qty Rate</th>
                      {viewMode !== 'view' && <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: '#334155' }}>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.poDetails.length === 0 ? (
                      <tr>
                        <td colSpan={11} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                          No PO detail rows added.
                        </td>
                      </tr>
                    ) : (
                      formData.poDetails.map((po) => (
                        <tr key={po.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={po.orderNo}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handlePORowChange(po.id, 'orderNo', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="date"
                              value={po.poDate}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handlePORowChange(po.id, 'poDate', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={po.grnNo}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handlePORowChange(po.id, 'grnNo', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="date"
                              value={po.grnDate}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handlePORowChange(po.id, 'grnDate', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={po.item}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handlePORowChange(po.id, 'item', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={po.color}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handlePORowChange(po.id, 'color', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={po.size}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handlePORowChange(po.id, 'size', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="number"
                              value={po.receiveQty}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handlePORowChange(po.id, 'receiveQty', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="number"
                              value={po.amount}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handlePORowChange(po.id, 'amount', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="number"
                              value={po.accQtyRate}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handlePORowChange(po.id, 'accQtyRate', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                            />
                          </td>
                          {viewMode !== 'view' && (
                            <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleRemovePORow(po.id)}
                                style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontSize: 14 }}
                              >
                                🗑️
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABLE 3: PROCESS ORD DETAIL */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  ⚙️ Process Ord Detail
                </h3>
                {viewMode !== 'view' && (
                  <button
                    type="button"
                    onClick={handleAddProcessRow}
                    style={{ padding: '6px 12px', borderRadius: 6, border: 'none', backgroundColor: '#2563eb', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    ➕ Add Process Row
                  </button>
                )}
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: 6 }}>
                <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Process Ord No</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Issue Qty</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Return Qty</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Recpt Qty</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Bal Qty</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Bal %</th>
                      {viewMode !== 'view' && <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: '#334155' }}>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.processOrdDetails.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                          No process order detail rows added.
                        </td>
                      </tr>
                    ) : (
                      formData.processOrdDetails.map((prc) => (
                        <tr key={prc.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={prc.processOrdNo}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handleProcessRowChange(prc.id, 'processOrdNo', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="number"
                              value={prc.issueQty}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handleProcessRowChange(prc.id, 'issueQty', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="number"
                              value={prc.returnQty}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handleProcessRowChange(prc.id, 'returnQty', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="number"
                              value={prc.recptQty}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handleProcessRowChange(prc.id, 'recptQty', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="number"
                              value={prc.balQty}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handleProcessRowChange(prc.id, 'balQty', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={prc.balPct}
                              disabled={viewMode === 'view'}
                              onChange={(e) => handleProcessRowChange(prc.id, 'balPct', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, textAlign: 'right' }}
                            />
                          </td>
                          {viewMode !== 'view' && (
                            <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveProcessRow(prc.id)}
                                style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontSize: 14 }}
                              >
                                🗑️
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Remarks */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Remarks</label>
              <textarea
                rows="2"
                placeholder="Enter approval details or observations..."
                value={formData.remarks}
                disabled={viewMode === 'view'}
                onChange={(e) => handleFormChange('remarks', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                style={{ padding: '9px 18px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#334155', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              {viewMode !== 'view' && (
                <button
                  type="submit"
                  style={{ padding: '9px 28px', borderRadius: 6, border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}
                >
                  SAVE
                </button>
              )}
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
