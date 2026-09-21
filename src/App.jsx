import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingOverlay, { LoadingFallback } from './components/LoadingOverlay';
import AiBot from './components/AiBot';

// Screens are code-split: each one downloads on first visit, so the loading
// animation covers the real load time (and shows clearly on a slow network).
const Signup = lazy(() => import('./pages/Signup'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Masters = lazy(() => import('./pages/Masters'));
const Orders = lazy(() => import('./pages/Orders'));
const ModulePage = lazy(() => import('./pages/ModulePage'));
const CustomerList = lazy(() => import('./pages/CustomerList'));
const CustomerForm = lazy(() => import('./pages/CustomerForm'));
const Requisition = lazy(() => import('./pages/Requisition'));
const RoleDocuments = lazy(() => import('./pages/RoleDocuments'));
const Indent = lazy(() => import('./pages/Indent'));
const BillInward = lazy(() => import('./pages/BillInward'));
const GeneralInvoice = lazy(() => import('./pages/GeneralInvoice'));
const Despatch = lazy(() => import('./pages/Despatch'));
const ExportInvoice = lazy(() => import('./pages/ExportInvoice'));
const FinishWarehouseTransfer = lazy(() => import('./pages/FinishWarehouseTransfer'));
const Adjustment = lazy(() => import('./pages/Adjustment'));
const Collection = lazy(() => import('./pages/Collection'));
const Payment = lazy(() => import('./pages/Payment'));
const Passing = lazy(() => import('./pages/Passing'));
const DocumentsTeam = lazy(() => import('./pages/DocumentsTeam'));
const MisqueryOrderSummary = lazy(() => import('./pages/MisqueryOrderSummary'));
const MisqueryStoresIndent = lazy(() => import('./pages/MisqueryStoresIndent'));
const MisqueryStoresIssue = lazy(() => import('./pages/MisqueryStoresIssue'));
const MisqueryStock = lazy(() => import('./pages/MisqueryStock'));
const Stock = lazy(() => import('./pages/Stock'));
const MisqueryWip = lazy(() => import('./pages/MisqueryWip'));
const MisqueryDayBook = lazy(() => import('./pages/MisqueryDayBook'));
const MisqueryWorkflowOrderSummary = lazy(() => import('./pages/MisqueryWorkflowOrderSummary'));
const MisqueryWorkflowSummary = lazy(() => import('./pages/MisqueryWorkflowSummary'));
const MisqueryWorkflowPendingOrders = lazy(() => import('./pages/MisqueryWorkflowPendingOrders'));
const MisqueryWorkflowProcessIssRec = lazy(() => import('./pages/MisqueryWorkflowProcessIssRec'));
const MisqueryWorkflowReceiptStatus = lazy(() => import('./pages/MisqueryWorkflowReceiptStatus'));
const MisqueryWorkflowIssueSummary = lazy(() => import('./pages/MisqueryWorkflowIssueSummary'));
const MisqueryWorkflowProductionSummary = lazy(() => import('./pages/MisqueryWorkflowProductionSummary'));
const MisqueryLogisticsOrderSummary = lazy(() => import('./pages/MisqueryLogisticsOrderSummary'));
const MisqueryLogisticsInvoiceSummary = lazy(() => import('./pages/MisqueryLogisticsInvoiceSummary'));
const MisqueryInvoiceRegister = lazy(() => import('./pages/MisqueryInvoiceRegister'));
const MisqueryLogisticsInvoiceDetail = lazy(() => import('./pages/MisqueryLogisticsInvoiceDetail'));
const MisqueryLogisticsDespatchStatement = lazy(() => import('./pages/MisqueryLogisticsDespatchStatement'));
const MisqueryLogisticsCommissionRegister = lazy(() => import('./pages/MisqueryLogisticsCommissionRegister'));
const MisqueryLogisticsInvProfitStatement = lazy(() => import('./pages/MisqueryLogisticsInvProfitStatement'));
import { seedDefaultAdmin } from './auth';
import './index.css';

export default function App() {
  useEffect(() => { seedDefaultAdmin(); }, []);
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <LoadingOverlay />
        <Suspense fallback={<LoadingFallback />}>
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
          <Route path="/misquery/logistics-commission-register" element={<MisqueryLogisticsCommissionRegister />} />
          <Route path="/misquery/logistics-inv-profit-statement" element={<MisqueryLogisticsInvProfitStatement />} />
          <Route path="/documents-team" element={<DocumentsTeam />} />
          <Route path="/documents-team/:section" element={<DocumentsTeam />} />
          <Route path="/admin/role-documents" element={<RoleDocuments />} />
          <Route path="/purchase/requisition" element={<Requisition />} />
          <Route path="/store/indent" element={<Indent />} />
          <Route path="/store/stock" element={<Stock />} />
          <Route path="/module/stock" element={<Stock />} />
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
        <AiBot />
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}