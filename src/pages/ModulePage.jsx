import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSession } from '../auth';
import Navbar from '../components/Navbar';
import { MODULE_LIST } from '../roles';
import ExportInvoice from './ExportInvoice';
import Despatch from './Despatch';
import GeneralInvoice from './GeneralInvoice';
import BillInward from './BillInward';
import Indent from './Indent';
import Requisition from './Requisition';
import FinishWarehouseTransfer from './FinishWarehouseTransfer';
import Adjustment from './Adjustment';
import Collection from './Collection';
import Payment from './Payment';

export default function ModulePage() {
  const { key } = useParams();
  const nav = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const s = getSession();
    if (!s || !s.username || !s.role) { nav('/login'); return; }
    setSession(s);
  }, [nav]);

  if (key === 'payment') return <Payment />;
  if (key === 'collection') return <Collection />;
  if (key === 'adjustment') return <Adjustment />;
  if (key === 'finish-warehouse-transfer' || key === 'finishWarehouseTransfer') return <FinishWarehouseTransfer />;
  if (key === 'export-invoice' || key === 'exportInvoice') return <ExportInvoice />;
  if (key === 'despatch') return <Despatch />;
  if (key === 'invoice-general' || key === 'general' || key === 'purchase-general') return <GeneralInvoice />;
  if (key === 'bill-inward' || key === 'billInward') return <BillInward />;
  if (key === 'indent') return <Indent />;
  if (key === 'requisition') return <Requisition />;

  if (!session) {
    return <div style={{ color: '#627d98', padding: 40, fontFamily: 'Sora, sans-serif' }}>Loading… please wait</div>;
  }

  const mod = MODULE_LIST.find((m) => m.key === key) || { key, label: key, icon: '📁', desc: '' };

  return (
    <div className="wrap">
      <Navbar session={session} />

      <div className="pagehead">
        <h2>{mod.icon} {mod.label}</h2>
      </div>

      <div className="content">
        <div className="hero">
          <h2>{mod.icon} {mod.label} Module</h2>
          <p>{mod.desc || 'Module configuration'}</p>
        </div>
      </div>
    </div>
  );
}