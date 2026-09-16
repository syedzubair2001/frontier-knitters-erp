// Accounts & Bills > Adjustment module config, mock data, and dropdown options

export const ACCOUNTS_DOWNLOAD_TYPES = ['CSV', 'PDF', 'XLS', 'RTF'];

export const ACCOUNTS_MENU = [
  {
    group: true, key: 'bills', label: 'BILLS', icon: '🧾',
    children: [
      { key: 'adjustment', label: 'ADJUSTMENT', icon: '⚖️', route: '/accounts/bills/adjustment' },
      { key: 'collection', label: 'COLLECTION', icon: '💰', route: '/accounts/bills/collection' },
      { key: 'payment', label: 'PAYMENT', icon: '💳', route: '/accounts/bills/payment' },
      { key: 'passing', label: 'PASSING', icon: '✅', route: '/accounts/bills/passing' },
    ],
  },
];

export const PARTY_TYPE_OPTIONS = ['Customer', 'Supplier'];

export const CUSTOMER_OPTIONS = [
  'All Customers',
  'Zara / Inditex S.A.',
  'H&M Sourcing Asia',
  'Nike Global Retail',
  'Adidas Sourcing Ltd',
  'Puma Garments International'
];

export const VOUCHER_TYPE_OPTIONS = ['Receipt', 'Credit Note', 'Debit Note'];

export const VOUCHER_NO_OPTIONS = [
  'All Vouchers',
  'RCP-2026-101',
  'RCP-2026-102',
  'RCP-2026-103',
  'CRN-2026-501'
];

export const STATUS_OPTIONS = ['All', 'Pending', 'Adjusted'];

export const INVOICE_TYPE_OPTIONS = ['Open Sales', 'Sales Invoice'];

export const INVOICE_NO_OPTIONS = [
  'EXP-INV-9901',
  'EXP-INV-9902',
  'EXP-INV-9903',
  'EXP-INV-9904'
];

export const CURRENCY_OPTIONS = [
  { code: 'USD', name: 'US Dollar ($)', factor: 1.0, exRate: 83.50 },
  { code: 'EUR', name: 'Euro (€)', factor: 1.08, exRate: 91.20 },
  { code: 'GBP', name: 'British Pound (£)', factor: 1.27, exRate: 106.40 },
  { code: 'INR', name: 'Indian Rupee (₹)', factor: 0.012, exRate: 1.00 }
];

export const RECEIPT_TYPE_OPTIONS = ['Cash', 'Cheque', 'DD', 'Transfer', 'Not Applicable'];

export const BANK_OPTIONS = [
  'HDFC Bank - Export Branch (A/C ...8921)',
  'State Bank of India - Commercial Branch (A/C ...4402)',
  'ICICI Bank - Overseas Operations (A/C ...1190)',
  'Axis Bank - Forex Dept (A/C ...6671)'
];

export const ACCOUNT_HEAD_OPTIONS = [
  'Bank Charges & Fees',
  'Foreign Exchange Loss / Gain',
  'Discount Allowed',
  'Shortage / Damage Allowance',
  'TDS / Tax Deducted'
];

export const ADJUSTMENT_COLUMNS = [
  { key: 'sno', label: 'S.No', defaultWidth: 70 },
  { key: 'voucherNo', label: 'Voucher No', defaultWidth: 140 },
  { key: 'voucherDate', label: 'Voucher Date', defaultWidth: 130 },
  { key: 'customer', label: 'Customer', defaultWidth: 200 },
  { key: 'refNo', label: 'Ref No', defaultWidth: 130 },
  { key: 'amount', label: 'Amount ($)', defaultWidth: 130 },
  { key: 'adjusted', label: 'Adjusted ($)', defaultWidth: 130 },
  { key: 'advance', label: 'Advance ($)', defaultWidth: 130 },
  { key: 'action', label: 'Action', defaultWidth: 110 }
];

export const MOCK_ADJUSTMENTS = [
  {
    id: 1,
    voucherNo: 'RCP-2026-101',
    voucherDate: '2026-09-10',
    refNo: 'REF-ZAR-901',
    customer: 'Zara / Inditex S.A.',
    partyType: 'Customer',
    voucherType: 'Receipt',
    status: 'Adjusted',
    invoiceType: 'Sales Invoice',
    invoiceNo: 'EXP-INV-9901',
    currency: 'USD',
    exRate: 83.50,
    receiptType: 'Transfer',
    bank: 'HDFC Bank - Export Branch (A/C ...8921)',
    chqNo: 'TRF-9884210',
    chqDate: '2026-09-10',
    fromDate: '2026-09-01',
    toDate: '2026-09-15',
    amount: 15000.00,
    adjusted: 14500.00,
    advance: 500.00,
    remarks: 'Full settlement for shipment EXP-INV-9901 less bank fees',
    details: [
      {
        id: 'det-1',
        invoiceType: 'Sales Invoice',
        invoiceNo: 'EXP-INV-9901',
        invoiceDate: '2026-09-02',
        billAmount: 15000.00,
        currency: 'USD',
        exRate: 83.50,
        billValue: 1252500.00,
        received: 14500.00,
        balance: 0.00,
        receipt: 14500.00,
        discount: 500.00
      }
    ],
    adjustItems: [
      {
        id: 'adj-1',
        accountHead: 'Bank Charges & Fees',
        pct: 2.0,
        amount: 300.00
      },
      {
        id: 'adj-2',
        accountHead: 'Discount Allowed',
        pct: 1.33,
        amount: 200.00
      }
    ]
  },
  {
    id: 2,
    voucherNo: 'RCP-2026-102',
    voucherDate: '2026-09-12',
    refNo: 'REF-HM-441',
    customer: 'H&M Sourcing Asia',
    partyType: 'Customer',
    voucherType: 'Receipt',
    status: 'Pending',
    invoiceType: 'Sales Invoice',
    invoiceNo: 'EXP-INV-9902',
    currency: 'EUR',
    exRate: 91.20,
    receiptType: 'Transfer',
    bank: 'State Bank of India - Commercial Branch (A/C ...4402)',
    chqNo: 'TRF-3321908',
    chqDate: '2026-09-12',
    fromDate: '2026-09-05',
    toDate: '2026-09-15',
    amount: 22000.00,
    adjusted: 20000.00,
    advance: 2000.00,
    remarks: 'Part payment received via swift transfer',
    details: [
      {
        id: 'det-2',
        invoiceType: 'Sales Invoice',
        invoiceNo: 'EXP-INV-9902',
        invoiceDate: '2026-09-05',
        billAmount: 22000.00,
        currency: 'EUR',
        exRate: 91.20,
        billValue: 2006400.00,
        received: 20000.00,
        balance: 2000.00,
        receipt: 20000.00,
        discount: 0.00
      }
    ],
    adjustItems: [
      {
        id: 'adj-3',
        accountHead: 'Foreign Exchange Loss / Gain',
        pct: 1.0,
        amount: 200.00
      }
    ]
  },
  {
    id: 3,
    voucherNo: 'RCP-2026-103',
    voucherDate: '2026-09-14',
    refNo: 'REF-NKE-882',
    customer: 'Nike Global Retail',
    partyType: 'Customer',
    voucherType: 'Receipt',
    status: 'Adjusted',
    invoiceType: 'Open Sales',
    invoiceNo: 'EXP-INV-9903',
    currency: 'USD',
    exRate: 83.50,
    receiptType: 'Cheque',
    bank: 'ICICI Bank - Overseas Operations (A/C ...1190)',
    chqNo: 'CHQ-554109',
    chqDate: '2026-09-14',
    fromDate: '2026-09-10',
    toDate: '2026-09-20',
    amount: 8500.00,
    adjusted: 8500.00,
    advance: 0.00,
    remarks: 'Sample batch receipt cleared',
    details: [
      {
        id: 'det-3',
        invoiceType: 'Open Sales',
        invoiceNo: 'EXP-INV-9903',
        invoiceDate: '2026-09-10',
        billAmount: 8500.00,
        currency: 'USD',
        exRate: 83.50,
        billValue: 709750.00,
        received: 8500.00,
        balance: 0.00,
        receipt: 8500.00,
        discount: 0.00
      }
    ],
    adjustItems: []
  }
];

export const SUPPLIER_OPTIONS = [
  'All Suppliers',
  'Supreme Yarn Spinners Ltd',
  'Coats Threads India',
  'Premier Dyes & Chemicals',
  'South India Cotton Mills',
  'Sri Lakshmi Trims & Buttons'
];

export const PAYMENT_TYPE_OPTIONS = ['Payment', 'Debit Note'];

export const PAYMENT_INVOICE_TYPE_OPTIONS = ['General Invoice', 'Process Invoice', 'Purchase Invoice'];

export const PAYMENT_PAYMODE_OPTIONS = ['Cash', 'Cheque', 'DD', 'Transfer', 'Net Banking'];

export const PAYMENT_STATUS_OPTIONS = ['All', 'Pending', 'Released', 'Approved', 'Cancelled'];

export const MOCK_PAYMENTS = [
  {
    id: 1,
    paymentNo: 'FKS/PAY00001',
    paymentDate: '2026-09-16',
    supplier: 'Supreme Yarn Spinners Ltd',
    paymentType: 'Payment',
    refNo: 'REF-YRN-8801',
    amount: 45000.00,
    paymode: 'Cheque',
    chqNo: 'CHQ-778901',
    chqDate: '2026-09-16',
    adjustStatus: 'Adjusted',
    isVoid: 'No',
    status: 'Pending', // Pending Release
    invoiceType: 'Purchase Invoice',
    invoiceNo: 'PUR-INV-8801',
    currencyType: 'Base', // Base (INR) vs Other
    currency: 'INR',
    exRate: 1.00,
    charges: 150.00,
    paymentValue: 45150.00,
    bank: 'HDFC Bank - Export Branch (A/C ...8921)',
    advancedRef: 'ADV-REF-001',
    fromDate: '2026-09-01',
    toDate: '2026-09-16',
    grossAmt: 45000.00,
    overhead2: 150.00,
    remarks: 'Yarn purchase payment clearance',
    itemDetails: [
      {
        id: 'pdet-1',
        invoiceType: 'Purchase Invoice',
        invoiceNo: 'PUR-INV-8801',
        invoiceDate: '2026-09-05',
        refNo: 'REF-YRN-8801',
        billAmt: 45000.00,
        currency: 'INR',
        exRate: 1.00,
        billValue: 45000.00,
        paid: 45000.00,
        balance: 0.00,
        payment: 45000.00
      }
    ],
    addLessItems: [
      {
        id: 'pal-1',
        accountHead: 'Bank Charges & Fees',
        pct: 0.33,
        rate: 150.00
      }
    ]
  },
  {
    id: 2,
    paymentNo: 'FKS/PAY00002',
    paymentDate: '2026-09-15',
    supplier: 'Coats Threads India',
    paymentType: 'Payment',
    refNo: 'REF-THRD-412',
    amount: 18500.00,
    paymode: 'Cheque',
    chqNo: 'CHQ-778902',
    chqDate: '2026-09-15',
    adjustStatus: 'Pending',
    isVoid: 'No',
    status: 'Released',
    invoiceType: 'General Invoice',
    invoiceNo: 'GEN-INV-3011',
    currencyType: 'Base',
    currency: 'INR',
    exRate: 1.00,
    charges: 0.00,
    paymentValue: 18500.00,
    bank: 'State Bank of India - Commercial Branch (A/C ...4402)',
    advancedRef: '',
    fromDate: '2026-09-01',
    toDate: '2026-09-15',
    grossAmt: 18500.00,
    overhead2: 0.00,
    remarks: 'Thread supplies payment released',
    itemDetails: [],
    addLessItems: []
  },
  {
    id: 3,
    paymentNo: 'FKS/PAY00003',
    paymentDate: '2026-09-14',
    supplier: 'Premier Dyes & Chemicals',
    paymentType: 'Debit Note',
    refNo: 'REF-DYE-992',
    amount: 12000.00,
    paymode: 'Transfer',
    chqNo: 'TRF-554102',
    chqDate: '2026-09-14',
    adjustStatus: 'Adjusted',
    isVoid: 'No',
    status: 'Pending',
    invoiceType: 'Process Invoice',
    invoiceNo: 'PRC-INV-501',
    currencyType: 'Other',
    currency: 'USD',
    exRate: 83.50,
    charges: 50.00,
    paymentValue: 1002050.00,
    bank: 'ICICI Bank - Overseas Operations (A/C ...1190)',
    advancedRef: '',
    fromDate: '2026-09-01',
    toDate: '2026-09-14',
    grossAmt: 12000.00,
    overhead2: 50.00,
    remarks: 'Chemical process debit note settlement',
    itemDetails: [],
    addLessItems: []
  }
];

