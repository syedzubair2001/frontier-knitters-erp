import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import Masters from './pages/Masters';
import Orders from './pages/Orders';
import ModulePage from './pages/ModulePage';
import CustomerList from './pages/CustomerList';
import CustomerForm from './pages/CustomerForm';
import Requisition from './pages/Requisition';
import RoleDocuments from './pages/RoleDocuments';
import Indent from './pages/Indent';
import BillInward from './pages/BillInward';
import GeneralInvoice from './pages/GeneralInvoice';
import Despatch from './pages/Despatch';
import ExportInvoice from './pages/ExportInvoice';
import FinishWarehouseTransfer from './pages/FinishWarehouseTransfer';
import Adjustment from './pages/Adjustment';
import Collection from './pages/Collection';
import Payment from './pages/Payment';
import Passing from './pages/Passing';
import { seedDefaultAdmin } from './auth';
import './index.css';

export default function App() {
  useEffect(() => { seedDefaultAdmin(); }, []);
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/admin/role-documents" element={<RoleDocuments />} />
          <Route path="/purchase/requisition" element={<Requisition />} />
          <Route path="/store/indent" element={<Indent />} />
          <Route path="/purchase/bill-inward" element={<BillInward />} />
          <Route path="/invoice/inward/bill-inward" element={<BillInward />} />
          <Route path="/purchase/invoice/general" element={<GeneralInvoice />} />
          <Route path="/invoice/general" element={<GeneralInvoice />} />
          <Route path="/module/invoice-general" element={<GeneralInvoice />} />
          <Route path="/sales/export/despatch" element={<Despatch />} />
          <Route path="/export/despatch" element={<Despatch />} />
          <Route path="/module/despatch" element={<Despatch />} />
          <Route path="/sales/export/invoice" element={<ExportInvoice />} />
          <Route path="/export/invoice" element={<ExportInvoice />} />
          <Route path="/module/export-invoice" element={<ExportInvoice />} />
          <Route path="/sales/shipment/finish-warehouse-transfer" element={<FinishWarehouseTransfer />} />
          <Route path="/module/finish-warehouse-transfer" element={<FinishWarehouseTransfer />} />
          <Route path="/accounts/bills/adjustment" element={<Adjustment />} />
          <Route path="/accounts/adjustment" element={<Adjustment />} />
          <Route path="/module/adjustment" element={<Adjustment />} />
          <Route path="/accounts/bills/collection" element={<Collection />} />
          <Route path="/accounts/collection" element={<Collection />} />
          <Route path="/module/collection" element={<Collection />} />
          <Route path="/accounts/bills/payment" element={<Payment />} />
          <Route path="/accounts/payment" element={<Payment />} />
          <Route path="/module/payment" element={<Payment />} />
          <Route path="/accounts/bills/passing" element={<Passing />} />
          <Route path="/accounts/passing" element={<Passing />} />
          <Route path="/module/passing" element={<Passing />} />
          <Route path="/masters/customer" element={<CustomerList />} />
          <Route path="/masters/customer/new" element={<CustomerForm />} />
          <Route path="/masters/customer/:id" element={<CustomerForm />} />
          <Route path="/masters" element={<Navigate to="/masters/buyers" />} />
          <Route path="/masters/:sub" element={<Masters />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/module/:key" element={<ModulePage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}