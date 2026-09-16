// Bill Inward Configuration & Master Lists

export const INWARD_TYPES = [
  'Fabric Inward',
  'Yarn Inward',
  'Accessories Inward',
  'General Store Inward',
  'Dyes & Chemicals Inward',
  'Machinery & Spares Inward',
];

export const BILL_INWARD_UNITS = [
  'Unit 1 - Main Mill',
  'Unit 2 - Processing',
  'Unit 3 - Garments',
  'Central Warehouse',
];

export const DEPARTMENTS = [
  'Store',
  'Knitting',
  'Dyeing & Finishing',
  'Cutting & Sewing',
  'Maintenance',
  'Accounts & Finance',
  'Quality Control',
];

export const SUPPLIER_LIST = [
  'Lakshmi Yarns & Synthetics Pvt Ltd',
  'Coimbatore Spinning Mills Co.',
  'Sri Tirupur Cotton Threads',
  'Apex Needle & Accessories Corp',
  'Sun Dyes & Chemicals Ltd',
  'Global Tex Equipment Spares',
  'Vardhman Yarns & Threads',
];

export const BILL_INWARD_PER_PAGE_OPTIONS = [10, 25, 50, 100];
export const BILL_INWARD_DOWNLOAD_TYPES = ['csv', 'excel', 'pdf'];

export const BILL_INWARD_COLUMNS = [
  { key: 'sno', label: 'S.No', width: '60px' },
  { key: 'billInwNo', label: 'Bill Inw No', searchable: true },
  { key: 'billInwDate', label: 'Bill Inw Date', searchable: true },
  { key: 'party', label: 'Party', searchable: true },
  { key: 'partyDocNo', label: 'Party Doc No', searchable: true },
  { key: 'partyDocDate', label: 'Party Doc Date', searchable: true },
  { key: 'amount', label: 'Amount', searchable: true },
  { key: 'unit', label: 'Unit', searchable: true },
  { key: 'department', label: 'Department', searchable: true },
  { key: 'attachment', label: 'Attachment', searchable: false },
  { key: 'action', label: 'Action', width: '120px' },
];

export const MOCK_BILL_INWARDS = [
  {
    id: 'binw-101',
    billInwNo: 'BINW-2026-001',
    billInwDate: '2026-09-10',
    supplier: 'Lakshmi Yarns & Synthetics Pvt Ltd',
    party: 'Lakshmi Yarns & Synthetics Pvt Ltd',
    inwType: 'Yarn Inward',
    unit: 'Unit 1 - Main Mill',
    department: 'Knitting',
    partyDocNo: 'TAX-INV-88910',
    partyDocDate: '2026-09-08',
    amount: 185000,
    remarks: '40s Combed Cotton Yarn - 50 Bags Received in good condition.',
    attachment: 'tax_inv_88910.pdf',
    approved: true,
  },
  {
    id: 'binw-102',
    billInwNo: 'BINW-2026-002',
    billInwDate: '2026-09-12',
    supplier: 'Coimbatore Spinning Mills Co.',
    party: 'Coimbatore Spinning Mills Co.',
    inwType: 'Yarn Inward',
    unit: 'Unit 2 - Processing',
    department: 'Store',
    partyDocNo: 'CSM/2026/440',
    partyDocDate: '2026-09-11',
    amount: 94500,
    remarks: '30s Carded Yarn shipment.',
    attachment: 'csm_bill_440.pdf',
    approved: true,
  },
  {
    id: 'binw-103',
    billInwNo: 'BINW-2026-003',
    billInwDate: '2026-09-14',
    supplier: 'Sun Dyes & Chemicals Ltd',
    party: 'Sun Dyes & Chemicals Ltd',
    inwType: 'Dyes & Chemicals Inward',
    unit: 'Unit 2 - Processing',
    department: 'Dyeing & Finishing',
    partyDocNo: 'SDC-INV-992',
    partyDocDate: '2026-09-13',
    amount: 240000,
    remarks: 'Reactive Dyes batch 40B.',
    attachment: 'dyes_inv_992.pdf',
    approved: false,
  },
  {
    id: 'binw-104',
    billInwNo: 'BINW-2026-004',
    billInwDate: '2026-09-15',
    supplier: 'Apex Needle & Accessories Corp',
    party: 'Apex Needle & Accessories Corp',
    inwType: 'Accessories Inward',
    unit: 'Unit 1 - Main Mill',
    department: 'Maintenance',
    partyDocNo: 'APX-7712',
    partyDocDate: '2026-09-14',
    amount: 32500,
    remarks: 'Groz-Beckert Needles 1000 Pcs & Sinkers.',
    attachment: 'apex_inv_7712.pdf',
    approved: false,
  },
];
