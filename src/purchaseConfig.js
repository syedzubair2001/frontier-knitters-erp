// Purchase & Stores module config — menus, option lists and grid column definitions.
export const PURCHASE_DOWNLOAD_TYPES = ['pdf', 'xls', 'xlsx', 'rtf', 'csv'];

export const ORDER_TYPES = ['BULK', 'SAMPLE', 'WAREHOUSE', 'GROUP'];
export const REQ_TYPES = ['UNIT', 'SUPPLIER'];
// Unit master options — currently sample values, to be replaced by the Unit master later
export const UNIT_OPTIONS = ['Unit 1', 'Unit 2'];

export const REQUISITION_COLUMNS = [
  { key: 'requisitionNo', label: 'Requistion.No', searchable: true },
  { key: 'orderNo', label: 'Order. No', searchable: true },
  { key: 'date', label: 'Date', searchable: true },
  { key: 'orderType', label: 'Order Type', searchable: true },
  { key: 'unitOrSupplier', label: 'Unit or Supplier', searchable: true },
  { key: 'budget', label: 'Budget', searchable: true },
];

// Search-table dropdown shown under the "Order No" field on the Requisition screen
export const ORDER_LOOKUP_COLUMNS = [
  { key: 'orderNo', label: 'Order no' },
  { key: 'refNo', label: 'Ref no' },
  { key: 'style', label: 'Style' },
  { key: 'customer', label: 'Customer' },
  { key: 'merchandiser', label: 'Merchandiser' },
  { key: 'orderType', label: 'Order type' },
];

// Full navigation tree for the "Purchase & Stores" top menu
export const PURCHASE_STORES_MENU = [
  {
    group: true, key: 'purchase', label: 'PURCHASE', icon: '📥',
    children: [
      { key: 'requisition', label: 'REQUISITION', route: '/purchase/requisition' },
      { key: 'order', label: 'ORDER', route: '/module/order' },
      { key: 'general', label: 'GENERAL', route: '/module/general' },
      { key: 'grnVendor', label: 'GRN-VENDOR', route: '/module/grn-vendor' },
      { key: 'grnCustomer', label: 'GRN-CUSTOMER', route: '/module/grn-customer' },
      { key: 'return', label: 'RETURN', route: '/module/return' },
      { key: 'vendorQuotation', label: 'VENDOR QUOTATION', route: '/module/vendor-quotation' },
      { key: 'poAllocation', label: 'PO ALLOCATION', route: '/module/po-allocation' },
    ],
  },
  {
    group: true, key: 'store', label: 'STORE', icon: '🏬',
    children: [
      { key: 'stock',  label: 'STOCK',  icon: '📦', route: '/module/stock' },
      { key: 'indent', label: 'INDENT', icon: '📋', route: '/store/indent' },
    ],
  },
  {
    group: true, key: 'invoice', label: 'INVOICE', icon: '🧾',
    children: [
      {
        group: true, key: 'inward', label: 'INWARD', icon: '📥',
        children: [
          { key: 'billInward', label: 'BILL INWARD', icon: '📄', route: '/purchase/bill-inward' },
        ],
      },
      { key: 'invoiceGeneral', label: 'GENERAL', icon: '📑', route: '/purchase/invoice/general' },
    ],
  },
  { key: 'internal', label: 'INTERNAL', icon: '🏠', route: '/module/internal' },
  { key: 'external', label: 'EXTERNAL', icon: '🌍', route: '/module/external' },
  { key: 'invoiceAndGate', label: 'INVOICE & GATE', icon: '🧾', route: '/module/invoice-gate' },
];