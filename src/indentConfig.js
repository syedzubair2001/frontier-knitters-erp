// Indent module configuration — Purchase & Stores > Store > Indent

export const INDENT_TYPES = ['Open', 'Planned', 'Direct', 'Indirect'];
export const INDENT_APPROVAL = ['Both', 'Approved', 'Pending'];
export const INDENT_UNITS = ['Unit 1', 'Unit 2', 'Unit 3'];
export const INDENT_BY_OPTIONS = [
  'Syed Zubair', 'Muhammad Ali', 'Ahmed Raza', 'Sana Malik', 'Ali Hassan',
  'Kamran Butt', 'Sara Qureshi', 'Farhan Sheikh', 'Usman Tariq',
];
export const ITEM_GROUPS = [
  'Yarn', 'Dyes & Chemicals', 'Accessories', 'Packing Material', 'Spare Parts', 'General',
];

export const PRODUCT_TYPES = [
  'Yarn', 'Sewing Thread', 'Buttons', 'Zippers', 'Elastic', 'Labels', 'Poly Bags', 'Dyes & Chemicals',
];

export const PRODUCT_CATALOG = [
  { code: 'PRD-YRN-001', name: '30/1 Cotton Combed Yarn', type: 'Yarn', uom: 'Kgs' },
  { code: 'PRD-YRN-002', name: '20/1 Melange Grey Yarn', type: 'Yarn', uom: 'Kgs' },
  { code: 'PRD-THD-001', name: 'Spun Polyester Thread 40/2', type: 'Sewing Thread', uom: 'Cones' },
  { code: 'PRD-BTN-001', name: '18L Resin 4-Hole Button (Navy)', type: 'Buttons', uom: 'Pcs' },
  { code: 'PRD-ZIP-001', name: '#5 Nylon Open-End Zipper 24"', type: 'Zippers', uom: 'Pcs' },
  { code: 'PRD-ELC-001', name: '1.5 Inch Knitted Elastic Roll', type: 'Elastic', uom: 'Mtrs' },
  { code: 'PRD-LBL-001', name: 'Main Brand Woven Label (FK)', type: 'Labels', uom: 'Pcs' },
  { code: 'PRD-BAG-001', name: 'Self-Adhesive Poly Bag 12x15"', type: 'Poly Bags', uom: 'Pcs' },
  { code: 'PRD-DYE-001', name: 'Reactive Blue Dyes B-2G', type: 'Dyes & Chemicals', uom: 'Kgs' },
];

export const REASON_OPTIONS = [
  'Stock Replenishment', 'Production Requirement', 'Urgent Order', 'Sample Requirement', 'Machine Maintenance',
];

export const ORDER_NO_LIST = [
  'FKS/ORD-2026-001', 'FKS/ORD-2026-002', 'FKS/ORD-2026-003', 'FKS/ORD-2026-004', 'DIRECT-STORE',
];

export const INDENT_PER_PAGE_OPTIONS = [10, 25, 50, 100];
export const INDENT_DOWNLOAD_TYPES = ['pdf', 'xls', 'xlsx', 'rtf', 'csv'];

export const INDENT_COLUMNS = [
  { key: 'indentNo',  label: 'Indent No', searchable: true, sortable: true },
  { key: 'date',      label: 'Date',      searchable: true, sortable: true },
  { key: 'refNo',     label: 'Ref No',    searchable: true, sortable: true },
  { key: 'unit',      label: 'Unit',      searchable: true, sortable: true },
  { key: 'type',      label: 'Type',      searchable: true, sortable: true },
  { key: 'orderNo',   label: 'Order No',  searchable: true, sortable: true },
  { key: 'indentBy',  label: 'Indent By', searchable: true, sortable: true },
  { key: 'approved',  label: 'Status',    searchable: true, sortable: true },
  { key: 'action',    label: 'Action',    width: '110px',   searchable: false },
];
