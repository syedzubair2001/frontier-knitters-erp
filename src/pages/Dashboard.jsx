import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getSession, logout } from '../auth';
import Navbar from '../components/Navbar';
import { ROLES } from '../roles';
import { ROLE_DOCUMENTS, canUseRole } from '../roleDocsService';

// Service getters for dynamic document statistics & activity feeds
import { getPassingRecords } from '../passingService';
import { listBillInwards } from '../billInwardService';
import { listIndents } from '../indentService';
import { listGeneralInvoices } from '../generalInvoiceService';
import { listExportInvoices } from '../exportInvoiceService';
import { listDespatches } from '../salesService';
import { listFinishWarehouseTransfers } from '../finishWarehouseTransferService';
import { listAdjustments, listPayments } from '../accountsService';
import { listRequisitions } from '../requisitionService';
import { listCustomers } from '../customerService';

/** Map document keys to exact routes and display metadata */
const DOC_META = {
  'home':                       { label: 'Dashboard Overview', icon: '📊', route: '/dashboard', category: 'General' },
  'dashboard':                  { label: 'Dashboard Overview', icon: '📊', route: '/dashboard', category: 'General' },
  'customer':                   { label: 'Party — Customer (BUY)', icon: '🏢', route: '/masters/customer', category: 'Masters' },
  'consignee':                  { label: 'Party — Consignee (CNE)', icon: '📦', route: '/module/consignee', category: 'Masters' },
  'supplier':                   { label: 'Party — Supplier (SPD)', icon: '🏭', route: '/module/supplier', category: 'Masters' },
  'bank':                       { label: 'Party — Bank (BNK)', icon: '🏦', route: '/module/bank', category: 'Masters' },
  'transport':                  { label: 'Party — Transport (TRN)', icon: '🚚', route: '/module/transport', category: 'Masters' },
  'orders':                     { label: 'Buyer Orders', icon: '📦', route: '/orders', category: 'Sales' },
  'requisition':                { label: 'Purchase — Requisition', icon: '📥', route: '/purchase/requisition', category: 'Purchase' },
  'purchase-order':             { label: 'Purchase — Order', icon: '📑', route: '/module/order', category: 'Purchase' },
  'purchase-general':           { label: 'Purchase — General', icon: '📄', route: '/module/general', category: 'Purchase' },
  'grn-vendor':                 { label: 'Purchase — GRN Vendor', icon: '🚚', route: '/module/grn-vendor', category: 'Purchase' },
  'grn-customer':               { label: 'Purchase — GRN Customer', icon: '📦', route: '/module/grn-customer', category: 'Purchase' },
  'return':                     { label: 'Purchase — Return', icon: '↩️', route: '/module/return', category: 'Purchase' },
  'vendor-quotation':           { label: 'Purchase — Vendor Quotation', icon: '💬', route: '/module/vendor-quotation', category: 'Purchase' },
  'po-allocation':              { label: 'Purchase — PO Allocation', icon: '📊', route: '/module/po-allocation', category: 'Purchase' },
  'stock':                      { label: 'Stores — Stock', icon: '📦', route: '/module/stock', category: 'Store' },
  'store':                      { label: 'Stores — Store Registry', icon: '🏬', route: '/module/store', category: 'Store' },
  'indent':                     { label: 'Stores — Material Indent', icon: '📋', route: '/store/indent', category: 'Store' },
  'bill-inward':                { label: 'Invoice — Bill Inward', icon: '📄', route: '/purchase/bill-inward', category: 'Invoice' },
  'general-invoice':            { label: 'Invoice — General Invoice', icon: '📑', route: '/purchase/invoice/general', category: 'Invoice' },
  'export-despatch':            { label: 'Exports — Despatch', icon: '📦', route: '/sales/export/despatch', category: 'Exports' },
  'export-invoice':             { label: 'Exports — Export Invoice', icon: '🚢', route: '/sales/export/invoice', category: 'Exports' },
  'finish-warehouse-transfer':  { label: 'Shipment — Finish Warehouse Transfer', icon: '🔄', route: '/sales/shipment/finish-warehouse-transfer', category: 'Shipment' },
  'adjustment':                 { label: 'Accounts — Receipt Adjustment', icon: '⚖️', route: '/accounts/bills/adjustment', category: 'Accounts' },
  'collection':                 { label: 'Accounts — Collection Receipts', icon: '💰', route: '/accounts/bills/collection', category: 'Accounts' },
  'payment':                    { label: 'Accounts — Supplier Payments', icon: '💳', route: '/accounts/bills/payment', category: 'Accounts' },
  'passing':                    { label: 'Accounts — Bill Approval Passing', icon: '✅', route: '/accounts/bills/passing', category: 'Accounts' },
  'internal':                   { label: 'Stores — Internal', icon: '🏠', route: '/module/internal', category: 'Store' },
  'external':                   { label: 'Stores — External', icon: '🌍', route: '/module/external', category: 'Store' },
  'invoice-gate':               { label: 'Stores — Invoice & Gate', icon: '🧾', route: '/module/invoice-gate', category: 'Store' },
};

export default function Dashboard() {
  const nav = useNavigate();
  const [session, setSession] = useState(null);

  // Date Range Filter state
  const [fromDate, setFromDate] = useState('2026-09-01');
  const [toDate, setToDate] = useState('2026-09-30');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const s = getSession();
    if (!s || !s.username || !s.role) {
      logout();
      nav('/login');
      return;
    }
    setSession(s);
  }, [nav]);

  // Load dynamic records across modules for counting & date filtering
  const allData = useMemo(() => {
    return {
      passing: getPassingRecords() || [],
      billInward: listBillInwards() || [],
      indent: listIndents() || [],
      generalInvoice: listGeneralInvoices() || [],
      exportInvoice: listExportInvoices() || [],
      despatch: listDespatches() || [],
      transfer: listFinishWarehouseTransfers() || [],
      adjustment: listAdjustments() || [],
      payment: listPayments() || [],
      requisition: listRequisitions() || [],
      customer: listCustomers() || [],
    };
  }, []);

  // Dashboard shows ONLY these working documents (Stores → Exports), per requirement.
  const DASHBOARD_DOC_KEYS = ['stock', 'indent', 'bill-inward', 'general-invoice', 'export-despatch', 'export-invoice'];

  // Filter accessible documents based strictly on user's assigned role permissions
  const permittedDocKeys = useMemo(() => {
    if (!session) return [];
    const isSuper = session.role === ROLES.SUPER_ADMIN;
    const seen = new Set();
    return ROLE_DOCUMENTS
      .filter((d) => d.key !== 'home' && d.key !== 'dashboard' && !d.group)
      .filter((d) => isSuper || canUseRole(session.role, d.key))
      .filter((d) => DASHBOARD_DOC_KEYS.includes(d.key)) // dashboard: only Stores → Exports working docs
      .filter((d) => (seen.has(d.key) ? false : seen.add(d.key))) // 'stock' exists twice in ROLE_DOCUMENTS — keep first
      .map((d) => d.key);
  }, [session]);

  // Calculate live statistics per permitted document for selected [fromDate, toDate]
  const docStats = useMemo(() => {
    const stats = {};
    permittedDocKeys.forEach((key) => {
      let count = 0;
      let totalAmount = 0;

      if (key === 'passing') {
        const matches = allData.passing.filter((r) => (!fromDate || r.approvalDate >= fromDate) && (!toDate || r.approvalDate <= toDate));
        count = matches.length;
      } else if (key === 'bill-inward') {
        const matches = allData.billInward.filter((r) => (!fromDate || (r.billDate || r.date || '') >= fromDate) && (!toDate || (r.billDate || r.date || '') <= toDate));
        count = matches.length;
      } else if (key === 'indent') {
        const matches = allData.indent.filter((r) => (!fromDate || (r.date || '') >= fromDate) && (!toDate || (r.date || '') <= toDate));
        count = matches.length;
      } else if (key === 'general-invoice') {
        const matches = allData.generalInvoice.filter((r) => (!fromDate || (r.invoiceDate || '') >= fromDate) && (!toDate || (r.invoiceDate || '') <= toDate));
        count = matches.length;
      } else if (key === 'export-invoice') {
        const matches = allData.exportInvoice.filter((r) => (!fromDate || (r.invoiceDate || '') >= fromDate) && (!toDate || (r.invoiceDate || '') <= toDate));
        count = matches.length;
      } else if (key === 'export-despatch') {
        const matches = allData.despatch.filter((r) => (!fromDate || (r.despatchDate || '') >= fromDate) && (!toDate || (r.despatchDate || '') <= toDate));
        count = matches.length;
      } else if (key === 'finish-warehouse-transfer') {
        const matches = allData.transfer.filter((r) => (!fromDate || (r.transferDate || r.date || '') >= fromDate) && (!toDate || (r.transferDate || r.date || '') <= toDate));
        count = matches.length;
      } else if (key === 'adjustment') {
        const matches = allData.adjustment.filter((r) => (!fromDate || (r.voucherDate || '') >= fromDate) && (!toDate || (r.voucherDate || '') <= toDate));
        count = matches.length;
      } else if (key === 'payment') {
        const matches = allData.payment.filter((r) => (!fromDate || (r.paymentDate || '') >= fromDate) && (!toDate || (r.paymentDate || '') <= toDate));
        count = matches.length;
      } else if (key === 'requisition') {
        const matches = allData.requisition.filter((r) => (!fromDate || (r.date || '') >= fromDate) && (!toDate || (r.date || '') <= toDate));
        count = matches.length;
      } else if (key === 'customer') {
        count = allData.customer.length;
      } else {
        count = 1; // Fallback mock count for master registries
      }

      stats[key] = { count, totalAmount };
    });
    return stats;
  }, [permittedDocKeys, allData, fromDate, toDate]);

  // Combined activity feed of permitted documents within date window
  const activityFeed = useMemo(() => {
    const list = [];
    if (permittedDocKeys.includes('passing')) {
      allData.passing.forEach((r) => {
        if ((!fromDate || r.approvalDate >= fromDate) && (!toDate || r.approvalDate <= toDate)) {
          list.push({
            id: `pass-${r.id}`,
            docName: 'Bill Approval Passing',
            refNo: r.billApprovalNo,
            date: r.approvalDate,
            party: r.party || r.supplierInvoiceNo || '-',
            status: 'Approved',
            typeKey: 'passing',
            route: '/accounts/bills/passing',
          });
        }
      });
    }

    if (permittedDocKeys.includes('bill-inward')) {
      allData.billInward.forEach((r) => {
        const dt = r.billDate || r.date || '2026-09-10';
        if ((!fromDate || dt >= fromDate) && (!toDate || dt <= toDate)) {
          list.push({
            id: `binw-${r.id}`,
            docName: 'Bill Inward',
            refNo: r.billInwNo || r.id,
            date: dt,
            party: r.party || r.supplier || '-',
            status: r.approval || 'Approved',
            typeKey: 'bill-inward',
            route: '/purchase/bill-inward',
          });
        }
      });
    }

    if (permittedDocKeys.includes('indent')) {
      allData.indent.forEach((r) => {
        if ((!fromDate || r.date >= fromDate) && (!toDate || r.date <= toDate)) {
          list.push({
            id: `ind-${r.id}`,
            docName: 'Store Indent',
            refNo: r.indentNo,
            date: r.date,
            party: `${r.unit || ''} (${r.indentBy || ''})`,
            status: r.approved ? 'Approved' : 'Pending',
            typeKey: 'indent',
            route: '/store/indent',
          });
        }
      });
    }

    if (permittedDocKeys.includes('export-despatch')) {
      allData.despatch.forEach((r) => {
        if ((!fromDate || r.despatchDate >= fromDate) && (!toDate || r.despatchDate <= toDate)) {
          list.push({
            id: `dsp-${r.id}`,
            docName: 'Export Despatch',
            refNo: r.despatchNo,
            date: r.despatchDate,
            party: r.customer || r.supplier || '-',
            status: r.approval || 'Approved',
            typeKey: 'export-despatch',
            route: '/sales/export/despatch',
          });
        }
      });
    }

    if (permittedDocKeys.includes('payment')) {
      allData.payment.forEach((r) => {
        if ((!fromDate || r.paymentDate >= fromDate) && (!toDate || r.paymentDate <= toDate)) {
          list.push({
            id: `pay-${r.id}`,
            docName: 'Supplier Payment',
            refNo: r.paymentNo,
            date: r.paymentDate,
            party: r.supplier || '-',
            status: r.status || 'Pending',
            typeKey: 'payment',
            route: '/accounts/bills/payment',
          });
        }
      });
    }

    // Sort newest date first
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [permittedDocKeys, allData, fromDate, toDate]);

  // Filtered activity feed by search box
  const filteredFeed = useMemo(() => {
    if (!searchTerm) return activityFeed;
    const term = searchTerm.toLowerCase();
    return activityFeed.filter((item) =>
      item.docName.toLowerCase().includes(term) ||
      item.refNo.toLowerCase().includes(term) ||
      item.party.toLowerCase().includes(term) ||
      item.status.toLowerCase().includes(term)
    );
  }, [activityFeed, searchTerm]);

  // Aggregate KPI stats
  const totalPermittedDocs = permittedDocKeys.length;
  const totalWindowRecords = useMemo(() => {
    return Object.values(docStats).reduce((sum, item) => sum + (item.count || 0), 0);
  }, [docStats]);

  const totalApproved = useMemo(() => {
    return activityFeed.filter((a) => a.status === 'Approved' || a.status === 'Released').length;
  }, [activityFeed]);

  const totalPending = useMemo(() => {
    return activityFeed.filter((a) => a.status === 'Pending').length;
  }, [activityFeed]);

  const handleResetDates = () => {
    setFromDate('2026-09-01');
    setToDate('2026-09-30');
    setSearchTerm('');
  };

  if (!session) {
    return (
      <div style={{ padding: 40, fontFamily: 'Inter, sans-serif', color: '#64748b' }}>
        Loading dashboard… please wait.
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar session={session} />

      <main style={{ maxWidth: 1450, margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* Executive Header Banner */}
        <div style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: 12,
          padding: '24px 32px',
          marginBottom: 24,
          boxShadow: '0 10px 15px -3px rgba(15,23,42,0.15)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ backgroundColor: '#2563eb', color: '#ffffff', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Role: {session.role}
              </span>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Frontier Knitters Garment ERP</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: '#f8fafc' }}>
              📊 Executive Role Dashboard
            </h1>
            <p style={{ fontSize: 14, color: '#cbd5e1', margin: '4px 0 0' }}>
              Documents and transaction activity filtered strictly for <strong>{session.username}</strong> ({session.role}).
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Permitted Documents</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8' }}>{totalPermittedDocs} Modules</div>
            </div>
          </div>
        </div>

        {/* Date Range & Search Filter Bar */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 10,
          padding: '18px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              📅 Date Range &amp; Document Filter
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setFromDate('2026-09-01'); setToDate('2026-09-30'); }}
                style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', cursor: 'pointer', color: '#334155' }}
              >
                This Month (Sep 2026)
              </button>
              <button
                onClick={() => { setFromDate(''); setToDate(''); }}
                style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', cursor: 'pointer', color: '#334155' }}
              >
                All Time
              </button>
              <button
                onClick={handleResetDates}
                style={{ padding: '5px 12px', fontSize: 12, fontWeight: 600, borderRadius: 6, border: '1px solid #2563eb', backgroundColor: '#2563eb', color: '#ffffff', cursor: 'pointer' }}
              >
                🔄 Reset Filters
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, alignItems: 'end' }}>
            {/* From Date */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
              />
            </div>

            {/* To Date */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
              />
            </div>

            {/* Search Filter */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Search Documents</label>
              <input
                type="text"
                placeholder="Search ref no, party, status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Executive Metrics Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
          <div style={{ backgroundColor: '#ffffff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Permitted Role Documents</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '6px 0 2px' }}>{totalPermittedDocs}</div>
            <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>Granted to {session.role}</div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Records in Date Range</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#2563eb', margin: '6px 0 2px' }}>{totalWindowRecords}</div>
            <div style={{ fontSize: 12, color: '#475569' }}>
              {fromDate || 'Start'} to {toDate || 'End'}
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Approved / Released</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#16a34a', margin: '6px 0 2px' }}>{totalApproved}</div>
            <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>Cleared for processing</div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Pending Review</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#d97706', margin: '6px 0 2px' }}>{totalPending}</div>
            <div style={{ fontSize: 12, color: '#d97706', fontWeight: 600 }}>Action required</div>
          </div>
        </div>

        {/* Section 1: Role Documents Cards Grid */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              📁 Role Granted Documents ({permittedDocKeys.length})
            </h2>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Click any card to open the document module screen
            </span>
          </div>

          {permittedDocKeys.length === 0 ? (
            <div style={{ backgroundColor: '#ffffff', padding: 32, borderRadius: 8, textAlign: 'center', color: '#64748b', border: '1px solid #e2e8f0' }}>
              No document permissions granted to role <strong>{session.role}</strong>. Please contact Admin.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {permittedDocKeys.map((key) => {
                const meta = DOC_META[key] || { label: key, icon: '📄', route: `/module/${key}`, category: 'General' };
                const stat = docStats[key] || { count: 0 };

                return (
                  <div
                    key={key}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 10,
                      padding: '20px 22px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'space-between',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <span style={{ fontSize: 26 }}>{meta.icon}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                          {meta.category}
                        </span>
                      </div>

                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                        {meta.label}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <span style={{ fontSize: 20, fontWeight: 800, color: '#2563eb' }}>
                          {stat.count}
                        </span>
                        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                          Records in Date Range
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                      <Link
                        to={meta.route}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justify: 'center',
                          width: '100%',
                          padding: '9px 14px',
                          borderRadius: 6,
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: 13,
                          textDecoration: 'none',
                          boxShadow: '0 2px 4px rgba(37,99,235,0.15)'
                        }}
                      >
                        Open Document ➔
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Live Activity Feed Table (Date Range Filtered) */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                📑 Document Activity Feed ({filteredFeed.length})
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0' }}>
                Recent document transactions recorded from <strong>{fromDate || 'Start'}</strong> to <strong>{toDate || 'End'}</strong> for role {session.role}.
              </p>
            </div>
            <span style={{ fontSize: 12, backgroundColor: '#dcfce7', color: '#166534', fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
              Live System Feed
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Document Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Ref / Doc No</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Party / Details</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#475569' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeed.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b' }}>
                      No document transactions found for the selected date range ({fromDate} to {toDate}).
                    </td>
                  </tr>
                ) : (
                  filteredFeed.slice(0, 15).map((item, idx) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{item.docName}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#2563eb' }}>{item.refNo}</td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>{item.date}</td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>{item.party}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 4,
                          backgroundColor: item.status === 'Approved' || item.status === 'Released' ? '#dcfce7' : '#fef3c7',
                          color: item.status === 'Approved' || item.status === 'Released' ? '#166534' : '#92400e',
                        }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <Link
                          to={item.route}
                          style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none', fontSize: 13 }}
                        >
                          View ➔
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
