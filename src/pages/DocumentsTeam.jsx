import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getSession, logout } from '../auth';
import {
  DOCUMENTS_TEAM_SECTIONS,
  BUYERS_LIST,
  MERCHANTS_LIST,
  TEAMS_LIST,
  UNITS_LIST,
  SHPT_TERMS,
  SHPT_MODES,
  CURRENCIES,
  FORWARDERS_LIST,
  CHA_LIST,
  TRANSPORTERS_LIST,
  DOC_TEAM_DOWNLOAD_TYPES,
} from '../documentsTeamConfig';
import BlueSelect from '../components/BlueSelect';
import {
  listDocTeamSection,
  saveDocTeamRecord,
  deleteDocTeamRecord,
} from '../documentsTeamService';

export default function DocumentsTeam() {
  const nav = useNavigate();
  const { section: routeSection } = useParams();

  const [session, setSession] = useState(() => getSession() || { username: 'superadmin', role: 'Super Admin' });
  const [activeSection, setActiveSection] = useState(routeSection || 'order-booking');
  const [records, setRecords] = useState([]);
  const [msg, setMsg] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit' | 'view'
  const [formData, setFormData] = useState({});

  // Search & Filter State for Reports & List View
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadFormat, setDownloadFormat] = useState('CSV');
  const [fromDate, setFromDate] = useState('2026-09-01');
  const [toDate, setToDate] = useState('2026-09-30');

  useEffect(() => {
    const s = getSession();
    if (!s || !s.username || !s.role) {
      logout();
      nav('/login');
      return;
    }
    setSession(s);
  }, [nav]);

  useEffect(() => {
    if (routeSection) {
      setActiveSection(routeSection);
    }
  }, [routeSection]);

  // Load records whenever activeSection changes
  useEffect(() => {
    if (activeSection !== 'documents-reports') {
      const data = listDocTeamSection(activeSection);
      setRecords(data);
    }
  }, [activeSection]);

  const handleTabChange = (key) => {
    setActiveSection(key);
    nav(`/documents-team/${key}`);
  };

  const handleFormChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormData({});
    setShowModal(true);
  };

  const handleOpenEdit = (rec) => {
    setModalMode('edit');
    setFormData({ ...rec });
    setShowModal(true);
  };

  const handleOpenView = (rec) => {
    setModalMode('view');
    setFormData({ ...rec });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      const res = deleteDocTeamRecord(activeSection, id);
      if (res.ok) {
        setRecords(res.updated);
        setMsg(res.msg);
        setTimeout(() => setMsg(''), 3000);
      }
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const res = saveDocTeamRecord(activeSection, formData);
    if (res.ok) {
      setRecords(listDocTeamSection(activeSection));
      setShowModal(false);
      setMsg(res.msg);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    const term = searchTerm.toLowerCase();
    return records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(term))
    );
  }, [records, searchTerm]);

  // Combined Reports Data for "Documents Reports" tab
  const reportsData = useMemo(() => {
    if (activeSection !== 'documents-reports') return [];
    const obList = listDocTeamSection('order-booking');
    const invList = listDocTeamSection('invoice-shipment');
    const sbList = listDocTeamSection('shipping-bill');
    const fwdList = listDocTeamSection('forwarding');

    return obList.map((ob, idx) => {
      const inv = invList[idx] || {};
      const sb = sbList[idx] || {};
      const fwd = fwdList[idx] || {};
      return {
        id: ob.id,
        orderNo: ob.orderNo,
        buyer: ob.buyer,
        style: ob.style,
        color: ob.color,
        oQty: ob.oQty,
        cur: ob.cur,
        valueInCur: ob.valueInCur,
        invoiceNo: inv.invoiceNo || '-',
        invDate: inv.invDate || '-',
        shippedQty: inv.shippedQty || '-',
        sbNo: sb.sbNo || '-',
        sbDate: sb.date || '-',
        fobValueInr: sb.fobValueInr || '-',
        forwarder: fwd.forwarderName || '-',
      };
    });
  }, [activeSection]);

  const filteredReports = useMemo(() => {
    if (!searchTerm) return reportsData;
    const term = searchTerm.toLowerCase();
    return reportsData.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(term))
    );
  }, [reportsData, searchTerm]);

  const handleDownload = () => {
    alert(`Downloaded Documents Team Reports as ${downloadFormat.toUpperCase()}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar session={session} />

      <main style={{ maxWidth: 1450, margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* Page Breadcrumb Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 600 }}>
              DOCUMENTS TEAM &gt; {DOCUMENTS_TEAM_SECTIONS.find((s) => s.key === activeSection)?.label.toUpperCase()}
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              📄 Documents Team — {DOCUMENTS_TEAM_SECTIONS.find((s) => s.key === activeSection)?.label}
            </h1>
          </div>

          {activeSection !== 'documents-reports' && (
            <button
              onClick={handleOpenAdd}
              style={{
                backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '9px 16px',
                borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
              }}
            >
              ➕ Add {DOCUMENTS_TEAM_SECTIONS.find((s) => s.key === activeSection)?.label} Entry
            </button>
          )}
        </div>

        {msg && (
          <div style={{ padding: '12px 16px', borderRadius: 6, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', marginBottom: 16, fontWeight: 500 }}>
            {msg}
          </div>
        )}

        {/* 11 Sub-Section Tabs Bar */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {DOCUMENTS_TEAM_SECTIONS.map((sec) => (
            <button
              key={sec.key}
              onClick={() => handleTabChange(sec.key)}
              style={{
                padding: '8px 14px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: activeSection === sec.key ? '#2563eb' : '#f8fafc',
                color: activeSection === sec.key ? '#ffffff' : '#475569',
                fontWeight: activeSection === sec.key ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <span>{sec.icon}</span> {sec.label}
            </button>
          ))}
        </div>

        {/* Toolbar: Search, Filters & Action Controls */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>Search:</span>
            <input
              type="text"
              placeholder={`Search ${DOCUMENTS_TEAM_SECTIONS.find((s) => s.key === activeSection)?.label}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 360, padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Download Format:</span>
            <BlueSelect
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, color: '#0f172a' }}
            >
              {DOC_TEAM_DOWNLOAD_TYPES.map((fmt) => (
                <option key={fmt} value={fmt}>{fmt}</option>
              ))}
            </BlueSelect>
            <button
              onClick={handleDownload}
              style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #0284c7', backgroundColor: '#0284c7', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              📥 Download
            </button>
            <button
              onClick={handlePrint}
              style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #475569', backgroundColor: '#ffffff', color: '#334155', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              🖨️ Print View
            </button>
          </div>
        </div>

        {/* SECTION TABLE VIEWS */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', width: '100%' }}>

            {/* TAB 1: Order & Booking */}
            {activeSection === 'order-booking' && (
              <table style={{ width: '100%', minWidth: 1600, borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>S.No</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Del Dt</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>OCN No</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Buyer</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Merchant</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Team</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Unit</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Order No</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Style</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Color</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>O.Qty</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Pcs/Pks/Sets</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Val in Cur</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Booked Val INR</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Shpt Terms</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr><td colSpan={16} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No Order &amp; Booking records found.</td></tr>
                  ) : (
                    filteredRecords.map((r, idx) => (
                      <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={{ padding: '10px 12px' }}>{r.sNo || idx + 1}</td>
                        <td style={{ padding: '10px 12px' }}>{r.delDt}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#2563eb' }}>{r.ocnNo}</td>
                        <td style={{ padding: '10px 12px' }}>{r.buyer}</td>
                        <td style={{ padding: '10px 12px' }}>{r.merchant}</td>
                        <td style={{ padding: '10px 12px' }}>{r.team}</td>
                        <td style={{ padding: '10px 12px' }}>{r.unit}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.orderNo}</td>
                        <td style={{ padding: '10px 12px' }}>{r.style}</td>
                        <td style={{ padding: '10px 12px' }}>{r.color}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{r.oQty}</td>
                        <td style={{ padding: '10px 12px' }}>{r.pcsPacksSets}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.cur} {r.valueInCur}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹ {r.bookedValueInr}</td>
                        <td style={{ padding: '10px 12px' }}>{r.shptTerms} ({r.shptMode})</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <button onClick={() => handleOpenView(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14 }}>👁️</button>
                          <button onClick={() => handleOpenEdit(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#2563eb' }}>✏️</button>
                          <button onClick={() => handleDelete(r.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#dc2626' }}>🗑️</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* TAB 2: Invoice & Shipment */}
            {activeSection === 'invoice-shipment' && (
              <table style={{ width: '100%', minWidth: 1600, borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Invoice No</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Inv Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Shipped Qty</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Ctns</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>CBM</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Agent Comm %</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>S.Price / Pcs</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Inv Value</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Shipped Against INR</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Pmt Terms</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>POL - POD</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>BL/AWB No</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>BL Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr><td colSpan={14} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No Invoice &amp; Shipment records found.</td></tr>
                  ) : (
                    filteredRecords.map((r, idx) => (
                      <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#2563eb' }}>{r.invoiceNo}</td>
                        <td style={{ padding: '10px 12px' }}>{r.invDate}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{r.shippedQty}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.ctns}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.cbm}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.buyerAgentCommPct}%</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.sPricePerPcs}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{r.invValue}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹ {r.shippedAgainstInrValue}</td>
                        <td style={{ padding: '10px 12px' }}>{r.pmtTerms}</td>
                        <td style={{ padding: '10px 12px' }}>{r.pol} ➔ {r.pod}</td>
                        <td style={{ padding: '10px 12px' }}>{r.blAwbNumber}</td>
                        <td style={{ padding: '10px 12px' }}>{r.blAwbDate}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <button onClick={() => handleOpenView(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14 }}>👁️</button>
                          <button onClick={() => handleOpenEdit(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#2563eb' }}>✏️</button>
                          <button onClick={() => handleDelete(r.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#dc2626' }}>🗑️</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* TAB 3: Shipping Bill */}
            {activeSection === 'shipping-bill' && (
              <table style={{ width: '100%', minWidth: 1500, borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>SB No</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>SB Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Freight</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>FOB Value FC</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>SB Ex.Rate</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>FOB Value INR</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>HS Code</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>DBK %</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>DBK Amt</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>EGM No &amp; Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>DBK Recvd Amt</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr><td colSpan={12} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No Shipping Bill records found.</td></tr>
                  ) : (
                    filteredRecords.map((r, idx) => (
                      <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#2563eb' }}>{r.sbNo}</td>
                        <td style={{ padding: '10px 12px' }}>{r.date}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.freiht}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{r.fobValueFc}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.sbExRt}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹ {r.fobValueInr}</td>
                        <td style={{ padding: '10px 12px' }}>{r.hsCode}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.dbkPct}%</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>₹ {r.dbkAmt}</td>
                        <td style={{ padding: '10px 12px' }}>{r.egmNo} ({r.egmDate})</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>₹ {r.dbkReceivedAmount}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <button onClick={() => handleOpenView(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14 }}>👁️</button>
                          <button onClick={() => handleOpenEdit(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#2563eb' }}>✏️</button>
                          <button onClick={() => handleDelete(r.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#dc2626' }}>🗑️</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* TAB 4: Forwarding */}
            {activeSection === 'forwarding' && (
              <table style={{ width: '100%', minWidth: 1100, borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Inward # &amp; Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Forwarder Name</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Bill No</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Bill Amt (₹)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>GST (₹)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Cost / Pce (₹)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No Forwarding records found.</td></tr>
                  ) : (
                    filteredRecords.map((r, idx) => (
                      <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={{ padding: '10px 12px' }}>{r.billHodToIaFit}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.forwarderName}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#2563eb' }}>{r.bllNo}</td>
                        <td style={{ padding: '10px 12px' }}>{r.date}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>₹ {r.billAmt}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹ {r.gst}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>₹ {r.forwardingCostPerPce}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <button onClick={() => handleOpenView(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14 }}>👁️</button>
                          <button onClick={() => handleOpenEdit(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#2563eb' }}>✏️</button>
                          <button onClick={() => handleDelete(r.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#dc2626' }}>🗑️</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* TAB 5: Clearing */}
            {activeSection === 'clearing' && (
              <table style={{ width: '100%', minWidth: 1400, borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Inward # &amp; Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>CHA Name</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Bill No</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Bill Amt (₹)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Cost / Pce</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Fwd &amp; Clr Cost</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Fwd &amp; Clr Budget</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr><td colSpan={9} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No Clearing records found.</td></tr>
                  ) : (
                    filteredRecords.map((r, idx) => (
                      <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={{ padding: '10px 12px' }}>{r.billHodToIaFit}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.chaName}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#2563eb' }}>{r.billNo}</td>
                        <td style={{ padding: '10px 12px' }}>{r.date}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>₹ {r.billAmt}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹ {r.clearingCostPerPce}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>₹ {r.forwardingClearingCost}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>₹ {r.forwardingClearingBudget}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <button onClick={() => handleOpenView(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14 }}>👁️</button>
                          <button onClick={() => handleOpenEdit(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#2563eb' }}>✏️</button>
                          <button onClick={() => handleDelete(r.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#dc2626' }}>🗑️</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* TAB 6: Transport */}
            {activeSection === 'doc-transport' && (
              <table style={{ width: '100%', minWidth: 1300, borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Inward # &amp; Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Transporter</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Bill No</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Bill Amt (₹)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Cost / Pce</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Budget Amt</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Bill HOD Status</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr><td colSpan={9} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No Transport records found.</td></tr>
                  ) : (
                    filteredRecords.map((r, idx) => (
                      <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={{ padding: '10px 12px' }}>{r.billHodToIaFit}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.transporter}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#2563eb' }}>{r.billNo}</td>
                        <td style={{ padding: '10px 12px' }}>{r.date}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>₹ {r.billAmt}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹ {r.tansportBillCostPerPce}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>₹ {r.transportBudgetAmt}</td>
                        <td style={{ padding: '10px 12px' }}>{r.billHodToIa}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <button onClick={() => handleOpenView(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14 }}>👁️</button>
                          <button onClick={() => handleOpenEdit(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#2563eb' }}>✏️</button>
                          <button onClick={() => handleDelete(r.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#dc2626' }}>🗑️</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* TAB 7: FOB Cost */}
            {activeSection === 'fob-cost' && (
              <table style={{ width: '100%', minWidth: 1000, borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Total Bill FOB Cost (₹)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>FOB Cost / Pce (₹)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Total FOB Budget (₹)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>FOB Budget / Pce (₹)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Diff FOB Amt (₹)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Diff FOB / Pce (₹)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No FOB Cost records found.</td></tr>
                  ) : (
                    filteredRecords.map((r, idx) => (
                      <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>₹ {r.totalBillFobCost}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>₹ {r.totalBilFobCostPce}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹ {r.totalFobBudget}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹ {r.fobBudgetPce}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>₹ {r.diffFobAmt}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹ {r.diffFobPce}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <button onClick={() => handleOpenView(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14 }}>👁️</button>
                          <button onClick={() => handleOpenEdit(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#2563eb' }}>✏️</button>
                          <button onClick={() => handleDelete(r.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#dc2626' }}>🗑️</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* TAB 8: Payment & Realisation */}
            {activeSection === 'payment-realisation' && (
              <table style={{ width: '100%', minWidth: 1400, borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Bill ID No</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Disc / Com %</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Remittance Amt</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Remittance Dt</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Realised Cur1</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Total Realised</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Realized Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Bank Charges</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr><td colSpan={10} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No Payment &amp; Realisation records found.</td></tr>
                  ) : (
                    filteredRecords.map((r, idx) => (
                      <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#2563eb' }}>{r.billIdNo}</td>
                        <td style={{ padding: '10px 12px' }}>{r.date}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.discComInterestPct}%</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{r.remittacneAmt}</td>
                        <td style={{ padding: '10px 12px' }}>{r.remittacneDt}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.realisedInCur1}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{r.totalRealised}</td>
                        <td style={{ padding: '10px 12px' }}>{r.realizedDate}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.intermediateBankCharges}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <button onClick={() => handleOpenView(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14 }}>👁️</button>
                          <button onClick={() => handleOpenEdit(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#2563eb' }}>✏️</button>
                          <button onClick={() => handleDelete(r.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#dc2626' }}>🗑️</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* TAB 9: Foreign Currency */}
            {activeSection === 'foreign-currency' && (
              <table style={{ width: '100%', minWidth: 1300, borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>FC Booking No</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Booked Rate</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Booked Value</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Realised Ex.Rate</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Realised Amount INR</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Spot Ex Rate</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Total Realized INR</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No Foreign Currency records found.</td></tr>
                  ) : (
                    filteredRecords.map((r, idx) => (
                      <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#2563eb' }}>{r.fcBookingNo}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.fcBookedRate}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{r.fcBookedValue}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.fcRealisedExRt}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹ {r.fcRealisedAmountInInr}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{r.spotExRate}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹ {r.totalRealizedAmtInr}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <button onClick={() => handleOpenView(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14 }}>👁️</button>
                          <button onClick={() => handleOpenEdit(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#2563eb' }}>✏️</button>
                          <button onClick={() => handleDelete(r.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#dc2626' }}>🗑️</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* TAB 10: BRC */}
            {activeSection === 'brc' && (
              <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>BRC No</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>BRC Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Ex.Rate +/-</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No BRC records found.</td></tr>
                  ) : (
                    filteredRecords.map((r, idx) => (
                      <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#2563eb' }}>{r.brcNo}</td>
                        <td style={{ padding: '10px 12px' }}>{r.brcDate}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: r.exRatePlusMinus?.startsWith('+') ? '#16a34a' : '#dc2626' }}>{r.exRatePlusMinus}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <button onClick={() => handleOpenView(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14 }}>👁️</button>
                          <button onClick={() => handleOpenEdit(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#2563eb' }}>✏️</button>
                          <button onClick={() => handleDelete(r.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#dc2626' }}>🗑️</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* TAB 11: Documents Reports */}
            {activeSection === 'documents-reports' && (
              <table style={{ width: '100%', minWidth: 1600, borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: '#f8fafc', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700 }}>Order No</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700 }}>Buyer</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700 }}>Style &amp; Color</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>Order Qty</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>Order Value</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700 }}>Invoice No</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700 }}>Inv Date</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>Shipped Qty</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700 }}>SB No &amp; Date</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>FOB Value (INR)</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700 }}>Forwarder</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length === 0 ? (
                    <tr><td colSpan={11} style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>No reports data generated.</td></tr>
                  ) : (
                    filteredReports.map((r, idx) => (
                      <tr key={r.id || idx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#2563eb' }}>{r.orderNo}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{r.buyer}</td>
                        <td style={{ padding: '12px 14px' }}>{r.style} ({r.color})</td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>{r.oQty}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>{r.cur} {r.valueInCur}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{r.invoiceNo}</td>
                        <td style={{ padding: '12px 14px' }}>{r.invDate}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>{r.shippedQty}</td>
                        <td style={{ padding: '12px 14px' }}>{r.sbNo} ({r.sbDate})</td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹ {r.fobValueInr}</td>
                        <td style={{ padding: '12px 14px' }}>{r.forwarder}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

          </div>
        </div>

        {/* FORM MODAL FOR ADD / EDIT / VIEW */}
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: 12, maxWidth: 920, width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '20px 24px 24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', border: '1px solid #cbd5e1', position: 'relative' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 20, position: 'sticky', top: 0, backgroundColor: '#ffffff', zIndex: 20, paddingTop: 4 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  📝 {modalMode.toUpperCase()}: {DOCUMENTS_TEAM_SECTIONS.find((s) => s.key === activeSection)?.label}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#64748b', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave}>

                {/* FORM FIELDS FOR Order & Booking */}
                {activeSection === 'order-booking' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>DEL.DT</label><input type="date" value={formData.delDt || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('delDt', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>OCN NO</label><input type="text" value={formData.ocnNo || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('ocnNo', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>SEASON</label><input type="text" value={formData.season || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('season', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600 }}>BUYER</label>
                      <BlueSelect value={formData.buyer || BUYERS_LIST[0]} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('buyer', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                        {BUYERS_LIST.map((b) => <option key={b} value={b}>{b}</option>)}
                      </BlueSelect>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600 }}>MERCHANT</label>
                      <BlueSelect value={formData.merchant || MERCHANTS_LIST[0]} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('merchant', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                        {MERCHANTS_LIST.map((m) => <option key={m} value={m}>{m}</option>)}
                      </BlueSelect>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600 }}>TEAM</label>
                      <BlueSelect value={formData.team || TEAMS_LIST[0]} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('team', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                        {TEAMS_LIST.map((t) => <option key={t} value={t}>{t}</option>)}
                      </BlueSelect>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600 }}>UNIT</label>
                      <BlueSelect value={formData.unit || UNITS_LIST[0]} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('unit', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                        {UNITS_LIST.map((u) => <option key={u} value={u}>{u}</option>)}
                      </BlueSelect>
                    </div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>DC NO</label><input type="text" value={formData.dcNo || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('dcNo', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>ORDER NO</label><input type="text" value={formData.orderNo || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('orderNo', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>STYLE</label><input type="text" value={formData.style || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('style', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>COLOR</label><input type="text" value={formData.color || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('color', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>FABRIC</label><input type="text" value={formData.fabric || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('fabric', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>DESCRIPTION</label><input type="text" value={formData.description || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('description', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>O.QTY</label><input type="text" value={formData.oQty || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('oQty', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>PCS / PACKS / SETS</label><input type="text" value={formData.pcsPacksSets || 'Pcs'} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('pcsPacksSets', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600 }}>CUR</label>
                      <BlueSelect value={formData.cur || CURRENCIES[0]} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('cur', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                        {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </BlueSelect>
                    </div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>Per Pcs/Pks/Sets - Currency</label><input type="text" value={formData.perPcsCur || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('perPcsCur', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>VALUE IN Currency</label><input type="text" value={formData.valueInCur || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('valueInCur', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>BOOKED CONVERSION RATE</label><input type="text" value={formData.bookedConvRate || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('bookedConvRate', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>BOOKED VALUE IN INR</label><input type="text" value={formData.bookedValueInr || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('bookedValueInr', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>PO Delivery Date</label><input type="date" value={formData.poDelDate || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('poDelDate', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>Booking Date</label><input type="date" value={formData.bookingDate || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('bookingDate', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>Online Booking No</label><input type="text" value={formData.onlineBookingNo || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('onlineBookingNo', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600 }}>SHPT TERMS</label>
                      <BlueSelect value={formData.shptTerms || SHPT_TERMS[0]} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('shptTerms', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                        {SHPT_TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </BlueSelect>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600 }}>SHPT MODE</label>
                      <BlueSelect value={formData.shptMode || SHPT_MODES[0]} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('shptMode', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                        {SHPT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                      </BlueSelect>
                    </div>
                  </div>
                )}

                {/* FORM FIELDS FOR Invoice & Shipment */}
                {activeSection === 'invoice-shipment' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>INVOICE NO</label><input type="text" value={formData.invoiceNo || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('invoiceNo', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>INV DATE</label><input type="date" value={formData.invDate || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('invDate', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>SHIPPED QTY</label><input type="text" value={formData.shippedQty || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('shippedQty', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>CTNS</label><input type="text" value={formData.ctns || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('ctns', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>CBM</label><input type="text" value={formData.cbm || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('cbm', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>Buyer Agent's COMM %</label><input type="text" value={formData.buyerAgentCommPct || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('buyerAgentCommPct', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>Commission in Value Factoring</label><input type="text" value={formData.commissionInValueFactoring || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('commissionInValueFactoring', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>AGN COMM PER PCS</label><input type="text" value={formData.agnCommPerPcs || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('agnCommPerPcs', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>FACTORING %</label><input type="text" value={formData.factoringPct || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('factoringPct', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>FACTORING COST PER PCS</label><input type="text" value={formData.factoringCostPerPcs || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('factoringCostPerPcs', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>S.PRICE PER PCS</label><input type="text" value={formData.sPricePerPcs || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('sPricePerPcs', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>COMM VALUE FC</label><input type="text" value={formData.commValueFc || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('commValueFc', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>DISC %</label><input type="text" value={formData.discPct || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('discPct', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>DISC / REBATE VALUE</label><input type="text" value={formData.discRebateValue || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('discRebateValue', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>INV.VALUE</label><input type="text" value={formData.invValue || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('invValue', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>Shipped against INR Value</label><input type="text" value={formData.shippedAgainstInrValue || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('shippedAgainstInrValue', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>EXCESS / SHORT QTY</label><input type="text" value={formData.excessShortQty || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('excessShortQty', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>EXCESS / SHORT %</label><input type="text" value={formData.excessShortPct || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('excessShortPct', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>PMT TERMS</label><input type="text" value={formData.pmtTerms || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('pmtTerms', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>POL</label><input type="text" value={formData.pol || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('pol', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>POD</label><input type="text" value={formData.pod || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('pod', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>FINAL DEST</label><input type="text" value={formData.finalDest || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('finalDest', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>BL/AWB NUMBER</label><input type="text" value={formData.blAwbNumber || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('blAwbNumber', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>BL/AWB DATE</label><input type="date" value={formData.blAwbDate || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('blAwbDate', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>ETD</label><input type="date" value={formData.etd || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('etd', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>ETA</label><input type="date" value={formData.eta || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('eta', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>BL / FCR RCVD DT</label><input type="date" value={formData.blFcrRcvdDt || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('blFcrRcvdDt', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                  </div>
                )}

                {/* FORM FIELDS FOR Shipping Bill */}
                {activeSection === 'shipping-bill' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>SB.NO</label><input type="text" value={formData.sbNo || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('sbNo', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>DATE</label><input type="date" value={formData.date || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('date', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>FREIHT</label><input type="text" value={formData.freiht || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('freiht', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>COM/REBATE</label><input type="text" value={formData.comRebate || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('comRebate', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>FOB VALUE FC</label><input type="text" value={formData.fobValueFc || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('fobValueFc', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>HANGER COST</label><input type="text" value={formData.hangerCost || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('hangerCost', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>SB EX.RT</label><input type="text" value={formData.sbExRt || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('sbExRt', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>FOB VALUE INR</label><input type="text" value={formData.fobValueInr || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('fobValueInr', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>HS CODE</label><input type="text" value={formData.hsCode || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('hsCode', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>DBK%</label><input type="text" value={formData.dbkPct || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('dbkPct', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>DBK AMT</label><input type="text" value={formData.dbkAmt || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('dbkAmt', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>ROTDEP%</label><input type="text" value={formData.rotdepPct || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('rotdepPct', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>ROTDEP AMT</label><input type="text" value={formData.rotdepAmt || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('rotdepAmt', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>ROSCTL %</label><input type="text" value={formData.rosctlPct || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('rosctlPct', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>AMT</label><input type="text" value={formData.amt || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('amt', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>EGM NO</label><input type="text" value={formData.egmNo || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('egmNo', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>EGM DATE</label><input type="date" value={formData.egmDate || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('egmDate', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>DBK SCROLL NO</label><input type="text" value={formData.dbkScrollNo || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('dbkScrollNo', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>SCROLL DATE</label><input type="date" value={formData.scrollDate || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('scrollDate', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>DBK Received Amount</label><input type="text" value={formData.dbkReceivedAmount || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('dbkReceivedAmount', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>DBK Received Date</label><input type="date" value={formData.dbkReceivedDate || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('dbkReceivedDate', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>DBK Difference</label><input type="text" value={formData.dbkDifference || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('dbkDifference', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                  </div>
                )}

                {/* FORM FIELDS FOR Forwarding */}
                {activeSection === 'forwarding' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>BILL HOD TO IA-FIT Inward # &amp; Date</label><input type="text" value={formData.billHodToIaFit || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('billHodToIaFit', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600 }}>FORWARDER NAME</label>
                      <BlueSelect value={formData.forwarderName || FORWARDERS_LIST[0]} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('forwarderName', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                        {FORWARDERS_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
                      </BlueSelect>
                    </div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>BLL NO</label><input type="text" value={formData.bllNo || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('bllNo', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>DATE</label><input type="date" value={formData.date || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('date', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>BILL AMT</label><input type="text" value={formData.billAmt || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('billAmt', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>GST</label><input type="text" value={formData.gst || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('gst', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>NON GST</label><input type="text" value={formData.nonGst || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('nonGst', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>FORWARDING COST PER PCE</label><input type="text" value={formData.forwardingCostPerPce || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('forwardingCostPerPce', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                  </div>
                )}

                {/* FORM FIELDS FOR Clearing */}
                {activeSection === 'clearing' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>BILL HOD TO IA-FIT Inward # &amp; Date</label><input type="text" value={formData.billHodToIaFit || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('billHodToIaFit', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600 }}>CHA NAME</label>
                      <BlueSelect value={formData.chaName || CHA_LIST[0]} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('chaName', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                        {CHA_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
                      </BlueSelect>
                    </div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>BILL NO</label><input type="text" value={formData.billNo || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('billNo', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>DATE</label><input type="date" value={formData.date || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('date', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>BILL AMT</label><input type="text" value={formData.billAmt || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('billAmt', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>GST</label><input type="text" value={formData.gst || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('gst', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>NON GST</label><input type="text" value={formData.nonGst || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('nonGst', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>CLEARING COST PER PCE</label><input type="text" value={formData.clearingCostPerPce || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('clearingCostPerPce', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>FORWARDING &amp; CLEARING COST</label><input type="text" value={formData.forwardingClearingCost || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('forwardingClearingCost', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>FORWARDING &amp; CLEARING COST PER PCE</label><input type="text" value={formData.forwardingClearingCostPerPce || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('forwardingClearingCostPerPce', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>FORWARDING &amp; CLEARING BUDGET</label><input type="text" value={formData.forwardingClearingBudget || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('forwardingClearingBudget', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>FORWARDING &amp; CLEARING BUDGET PER PCE</label><input type="text" value={formData.forwardingClearingBudgetPerPce || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('forwardingClearingBudgetPerPce', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                  </div>
                )}

                {/* FORM FIELDS FOR Transport */}
                {activeSection === 'transport' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>BILL HOD TO IA-FIT Inward # &amp; Date</label><input type="text" value={formData.billHodToIaFit || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('billHodToIaFit', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600 }}>TRANSPORTER</label>
                      <BlueSelect value={formData.transporter || TRANSPORTERS_LIST[0]} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('transporter', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                        {TRANSPORTERS_LIST.map((t) => <option key={t} value={t}>{t}</option>)}
                      </BlueSelect>
                    </div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>BILL NO</label><input type="text" value={formData.billNo || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('billNo', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>DATE</label><input type="date" value={formData.date || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('date', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>BILL AMT</label><input type="text" value={formData.billAmt || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('billAmt', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>GST</label><input type="text" value={formData.gst || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('gst', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>NON GST</label><input type="text" value={formData.nonGst || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('nonGst', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>TANSPORT BILL COST PER PCE</label><input type="text" value={formData.tansportBillCostPerPce || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('tansportBillCostPerPce', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>TRANSPORT BUDGET AMT</label><input type="text" value={formData.transportBudgetAmt || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('transportBudgetAmt', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>TRANSPORT BUDGET PER PCE</label><input type="text" value={formData.transportBudgetPerPce || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('transportBudgetPerPce', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>BILL HOD TO IA</label><input type="text" value={formData.billHodToIa || 'Approved'} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('billHodToIa', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                  </div>
                )}

                {/* FORM FIELDS FOR FOB Cost */}
                {activeSection === 'fob-cost' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>TOTAL BILL FOB COST</label><input type="text" value={formData.totalBillFobCost || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('totalBillFobCost', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>TOTAL BIL FOB COST / PCE</label><input type="text" value={formData.totalBilFobCostPce || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('totalBilFobCostPce', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>TOTAL FOB BUDGET</label><input type="text" value={formData.totalFobBudget || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('totalFobBudget', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>FOB BUDGET / PCE</label><input type="text" value={formData.fobBudgetPce || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('fobBudgetPce', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>DIFF FOB AMT</label><input type="text" value={formData.diffFobAmt || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('diffFobAmt', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>DIFF FOB /PCE</label><input type="text" value={formData.diffFobPce || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('diffFobPce', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                  </div>
                )}

                {/* FORM FIELDS FOR Payment & Realisation */}
                {activeSection === 'payment-realisation' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>BILL ID NO</label><input type="text" value={formData.billIdNo || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('billIdNo', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>DATE</label><input type="date" value={formData.date || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('date', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>DISC/com/INTEREST%</label><input type="text" value={formData.discComInterestPct || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('discComInterestPct', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>DISC/COM/INTEREST AMT</label><input type="text" value={formData.discComInterestAmt || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('discComInterestAmt', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>REMITTACNE AMT</label><input type="text" value={formData.remittacneAmt || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('remittacneAmt', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>REMITTACNE DT</label><input type="date" value={formData.remittacneDt || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('remittacneDt', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>SHORT</label><input type="text" value={formData.short || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('short', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>REALISED IN CUR1</label><input type="text" value={formData.realisedInCur1 || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('realisedInCur1', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>REALISED IN CUR2</label><input type="text" value={formData.realisedInCur2 || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('realisedInCur2', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>TOTAL REALISED</label><input type="text" value={formData.totalRealised || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('totalRealised', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>REALIZED DATE</label><input type="date" value={formData.realizedDate || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('realizedDate', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>INTERMEDIATE BANK CHARGES</label><input type="text" value={formData.intermediateBankCharges || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('intermediateBankCharges', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                  </div>
                )}

                {/* FORM FIELDS FOR Foreign Currency */}
                {activeSection === 'foreign-currency' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>FC BOOKING NO</label><input type="text" value={formData.fcBookingNo || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('fcBookingNo', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>FC BOOKED RATE</label><input type="text" value={formData.fcBookedRate || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('fcBookedRate', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>FC BOOKED VALUE</label><input type="text" value={formData.fcBookedValue || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('fcBookedValue', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>FC REALISED EX.RT</label><input type="text" value={formData.fcRealisedExRt || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('fcRealisedExRt', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>FC REALISED AMOUNT IN INR</label><input type="text" value={formData.fcRealisedAmountInInr || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('fcRealisedAmountInInr', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>SPOT EX RATE</label><input type="text" value={formData.spotExRate || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('spotExRate', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>SPOT REALISED AMOUNT INR</label><input type="text" value={formData.spotRealisedAmountInr || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('spotRealisedAmountInr', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>TOTAL REALIZED AMT INR</label><input type="text" value={formData.totalRealizedAmtInr || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('totalRealizedAmtInr', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                  </div>
                )}

                {/* FORM FIELDS FOR BRC */}
                {activeSection === 'brc' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>BRC NO</label><input type="text" value={formData.brcNo || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('brcNo', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>BRC DATE</label><input type="date" value={formData.brcDate || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('brcDate', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                    <div><label style={{ fontSize: 13, fontWeight: 600 }}>Ex.Rate +/-</label><input type="text" value={formData.exRatePlusMinus || ''} disabled={modalMode === 'view'} onChange={(e) => handleFormChange('exRatePlusMinus', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
                  </div>
                )}

                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#334155', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Close
                  </button>
                  {modalMode !== 'view' && (
                    <button
                      type="submit"
                      style={{ padding: '8px 20px', borderRadius: 6, border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Save {modalMode === 'add' ? 'Record' : 'Changes'}
                    </button>
                  )}
                </div>

              </form>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
