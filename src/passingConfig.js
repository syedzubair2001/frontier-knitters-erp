// Passing (Bill Approval) Module Configuration & Mock Data

export const PASSING_PARTY_TYPES = ['Supplier', 'Customer', 'Work Division'];

export const PASSING_INVOICE_TYPES = [
  'All',
  'Contractor Invoice',
  'Purchase Invoice',
  'Process Invoice',
  'General Invoice',
  'General Delivery',
];

export const PASSING_INVOICE_TYPES_ENTRY = [
  'Contractor Invoice',
  'Purchase Invoice',
  'Process Invoice',
  'General Invoice',
  'General Delivery',
];

export const PASSING_SUPPLIERS = [
  'All Suppliers',
  'Vardhman Yarns Ltd',
  'Coats Threads India',
  'Premier Dyes & Chemicals',
  'Apex Processing Mills',
  'Super Knitting Works',
];

export const PASSING_CUSTOMERS = [
  'Zara / Inditex S.A.',
  'H&M Sourcing Asia',
  'Nike Global Retail',
  'Adidas Sourcing Ltd',
  'Puma Garments International',
];

export const PASSING_WORK_DIVISIONS = [
  'Dyeing Unit - A',
  'Knitting Mill - 2',
  'Garment Finishing - B',
  'Yarn Processing - 1',
];

export const PASSING_ENTERED_BY = [
  'Admin User',
  'John Doe (Accounts)',
  'Rajesh Kumar (Finance)',
  'Priya Sharma (Store)',
];

export const PASSING_ITEM_TYPES = [
  'Article',
  'Dynes Fabric',
  'Garments',
  'Yarn',
  'Accessories',
  'Other',
];

export const PASSING_PROCESSES = [
  'Yarn Dyeing',
  'Knitting',
  'Fabric Dyeing',
  'Printing',
  'Stitching',
  'Compacting',
  'Washing',
  'N/A',
];

export const PASSING_SUP_INV_NOS = [
  'All',
  'SINV-88210',
  'SINV-88211',
  'SINV-9901',
  'SINV-44102',
  'DYE-7719',
];

export const PASSING_INVOICE_NOS = [
  'All',
  'PINV-2026-901',
  'PINV-2026-902',
  'PINV-2026-903',
  'GEN-INV-101',
  'CIN-44102',
];

export const DEFAULT_INVOICE_DETAILS = [
  {
    id: 'inv-1',
    supInvNo: 'SINV-88210',
    invoiceDate: '2026-09-15',
    invoiceNo: 'PINV-2026-901',
    invoiceType: 'Purchase Invoice',
    amount: 50000.00,
    debit: 0.00,
    tds: 1000.00,
    balance: 49000.00,
    billPassAmount: 49000.00,
    discountAmount: 0.00,
    adjust: 0.00,
    selected: true,
  },
  {
    id: 'inv-2',
    supInvNo: 'SINV-88211',
    invoiceDate: '2026-09-14',
    invoiceNo: 'PINV-2026-902',
    invoiceType: 'Purchase Invoice',
    amount: 32000.00,
    debit: 500.00,
    tds: 640.00,
    balance: 30860.00,
    billPassAmount: 30860.00,
    discountAmount: 0.00,
    adjust: 0.00,
    selected: true,
  },
];

export const DEFAULT_PO_DETAILS = [
  {
    id: 'po-1',
    orderNo: 'ORD-2026-101',
    poDate: '2026-09-01',
    grnNo: 'GRN-2026-044',
    grnDate: '2026-09-10',
    item: 'Combed Cotton Yarn 30s',
    color: 'Raw White',
    size: '30s',
    receiveQty: 1000,
    amount: 250000.00,
    accQtyRate: 250.00,
  },
  {
    id: 'po-2',
    orderNo: 'ORD-2026-102',
    poDate: '2026-09-02',
    grnNo: 'GRN-2026-048',
    grnDate: '2026-09-12',
    item: 'Polyester Thread Spools',
    color: 'Navy Blue',
    size: '120d',
    receiveQty: 500,
    amount: 45000.00,
    accQtyRate: 90.00,
  },
];

export const DEFAULT_PROCESS_ORD_DETAILS = [
  {
    id: 'prc-1',
    processOrdNo: 'POC-2026-551',
    issueQty: 1200,
    returnQty: 50,
    recptQty: 1120,
    balQty: 30,
    balPct: '2.5%',
  },
  {
    id: 'prc-2',
    processOrdNo: 'POC-2026-555',
    issueQty: 800,
    returnQty: 20,
    recptQty: 770,
    balQty: 10,
    balPct: '1.25%',
  },
];

export const INITIAL_PASSING_RECORDS = [
  {
    id: 1,
    billApprovalNo: 'FKS/BAP00001',
    approvalDate: '2026-09-16',
    partyDate: '2026-09-15',
    supplierInvoiceNo: 'SINV-88210',
    partyType: 'Supplier',
    party: 'Vardhman Yarns Ltd',
    approver: 'Rajesh Kumar (Finance)',
    refNo: 'REF-VY-102',
    invoiceType: 'Purchase Invoice',
    enteredBy: 'Rajesh Kumar (Finance)',
    itemType: 'Yarn',
    process: 'Yarn Dyeing',
    remarks: 'Yarn purchase invoice approved for payment schedule',
    invoiceDetails: DEFAULT_INVOICE_DETAILS,
    poDetails: DEFAULT_PO_DETAILS,
    processOrdDetails: DEFAULT_PROCESS_ORD_DETAILS,
  },
  {
    id: 2,
    billApprovalNo: 'FKS/BAP00002',
    approvalDate: '2026-09-15',
    partyDate: '2026-09-14',
    supplierInvoiceNo: 'CIN-44102',
    partyType: 'Supplier',
    party: 'Super Knitting Works',
    approver: 'John Doe (Accounts)',
    refNo: 'REF-SKW-55',
    invoiceType: 'Contractor Invoice',
    enteredBy: 'John Doe (Accounts)',
    itemType: 'Garments',
    process: 'Knitting',
    remarks: 'Contractor jobwork invoice under verification',
    invoiceDetails: DEFAULT_INVOICE_DETAILS,
    poDetails: DEFAULT_PO_DETAILS,
    processOrdDetails: DEFAULT_PROCESS_ORD_DETAILS,
  },
  {
    id: 3,
    billApprovalNo: 'FKS/BAP00003',
    approvalDate: '2026-09-14',
    partyDate: '2026-09-12',
    supplierInvoiceNo: 'DYE-7719',
    partyType: 'Work Division',
    party: 'Dyeing Unit - A',
    approver: 'Admin User',
    refNo: 'REF-WD-99',
    invoiceType: 'Process Invoice',
    enteredBy: 'Admin User',
    itemType: 'Dynes Fabric',
    process: 'Fabric Dyeing',
    remarks: 'Internal dyeing process bill passed',
    invoiceDetails: DEFAULT_INVOICE_DETAILS,
    poDetails: DEFAULT_PO_DETAILS,
    processOrdDetails: DEFAULT_PROCESS_ORD_DETAILS,
  },
];
