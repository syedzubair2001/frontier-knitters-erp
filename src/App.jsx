import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
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
import DocumentsTeam from './pages/DocumentsTeam';
import MisqueryOrderSummary from './pages/MisqueryOrderSummary';
import MisqueryStoresIndent from './pages/MisqueryStoresIndent';
import MisqueryStoresIssue from './pages/MisqueryStoresIssue';
import MisqueryStock from './pages/MisqueryStock';
import MisqueryWip from './pages/MisqueryWip';
import MisqueryDayBook from './pages/MisqueryDayBook';
import MisqueryWorkflowOrderSummary from './pages/MisqueryWorkflowOrderSummary';
import MisqueryWorkflowSummary from './pages/MisqueryWorkflowSummary';
import MisqueryWorkflowPendingOrders from './pages/MisqueryWorkflowPendingOrders';
import MisqueryWorkflowProcessIssRec from './pages/MisqueryWorkflowProcessIssRec';
import MisqueryWorkflowReceiptStatus from './pages/MisqueryWorkflowReceiptStatus';
import MisqueryWorkflowIssueSummary from './pages/MisqueryWorkflowIssueSummary';
import MisqueryWorkflowProductionSummary from './pages/MisqueryWorkflowProductionSummary';
import MisqueryLogisticsOrderSummary from './pages/MisqueryLogisticsOrderSummary';
import MisqueryLogisticsInvoiceSummary from './pages/MisqueryLogisticsInvoiceSummary';
import MisqueryInvoiceRegister from './pages/MisqueryInvoiceRegister';
import MisqueryLogisticsInvoiceDetail from './pages/MisqueryLogisticsInvoiceDetail';
import MisqueryLogisticsDespatchStatement from './pages/MisqueryLogisticsDespatchStatement';
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/home" element={<Navigate to="/dashboard" replace />} />
          <Route path="/misquery/tracking" element={<MisqueryOrderSummary />} />
          <Route path="/misquery/stores-indent" element={<MisqueryStoresIndent />} />
          <Route path="/misquery/stores-issue" element={<MisqueryStoresIssue />} />
          <Route path="/misquery/stock" element={<MisqueryStock />} />
          <Route path="/misquery/work-in-progress" element={<MisqueryWip />} />
          <Route path="/misquery/day-book" element={<MisqueryDayBook />} />
          <Route path="/misquery/workflow-order-summary" element={<MisqueryWorkflowOrderSummary />} />
          <Route path="/misquery/workflow-summary" element={<MisqueryWorkflowSummary />} />
          <Route path="/misquery/workflow-pending-orders" element={<MisqueryWorkflowPendingOrders />} />
          <Route path="/misquery/workflow-process-iss-rec" element={<MisqueryWorkflowProcessIssRec />} />
          <Route path="/misquery/workflow-receipt-status" element={<MisqueryWorkflowReceiptStatus />} />
          <Route path="/misquery/workflow-issue-summary" element={<MisqueryWorkflowIssueSummary />} />
          <Route path="/misquery/workflow-production-summary" element={<MisqueryWorkflowProductionSummary />} />
          <Route path="/misquery/logistics-order-summary" element={<MisqueryLogisticsOrderSummary />} />
          <Route path="/misquery/logistics-invoice-summary" element={<MisqueryLogisticsInvoiceSummary />} />
          <Route path="/misquery/register-invoice-register" element={<MisqueryInvoiceRegister />} />
          <Route path="/misquery/logistics-invoice-detail" element={<MisqueryLogisticsInvoiceDetail />} />
          <Route path="/misquery/logistics-despatch-statement" element={<MisqueryLogisticsDespatchStatement />} />
          <Route path="/documents-team" element={<DocumentsTeam />} />
          <Route path="/documents-team/:section" element={<DocumentsTeam />} />
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
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}