// Sales & Shipment module config — dropdown lists, column defs, menu tree, and mock data
import { SUPPLIER_LIST } from './billInwardConfig';

export { SUPPLIER_LIST };

export const BUYER_LIST = [
  'Nike Global Retail',
  'Adidas Sourcing Ltd',
  'Puma Garments International',
  'H&M Sourcing Asia',
  'Zara / Inditex Group',
];

export const FORWARDER_LIST = [
  'DHL Express Global',
  'FedEx International',
  'Maersk Logistics',
  'DB Schenker India',
  'Kuehne + Nagel',
];

export const JOB_ORDER_LIST = [
  'JO-2026-8801',
  'JO-2026-8802',
  'JO-2026-8803',
  'JO-2026-8804',
];

export const SHIP_MODES = ['Air Freight', 'Sea Freight', 'Road Transport'];
export const TYPE_OPTIONS = ['Order', 'Invoice', 'Both'];
export const APPROVAL_TYPES = ['Both', 'Approved', 'Pending'];
export const CARTON_PACKING_OPTIONS = ['Both', 'Yes', 'No'];
export const DESPATCH_PER_PAGE_OPTIONS = [5, 10, 20, 50];
export const DESPATCH_DOWNLOAD_TYPES = ['csv', 'pdf', 'xls', 'rtf'];

// Full navigation tree for the top "Sales & Shipment" dropdown menu
export const SALES_SHIPMENT_MENU = [
  {
    group: true, key: 'exports', label: 'EXPORTS', icon: '🚢',
    children: [
      { key: 'despatch', label: 'DESPATCH', icon: '📦', route: '/sales/export/despatch' },
      { key: 'exportInvoice', label: 'EXPORT INVOICE', icon: '📑', route: '/sales/export/invoice' },
    ],
  },
  {
    group: true, key: 'shipment', label: 'SHIPMENT', icon: '🏬',
    children: [
      { key: 'finishWarehouseTransfer', label: 'FINISH WAREHOUSE TRANSFER', icon: '🔄', route: '/sales/shipment/finish-warehouse-transfer' },
    ],
  },
];

export const DESPATCH_COLUMNS = [
  { key: 'sno', label: 'S.No', searchable: false, width: '60px' },
  { key: 'despatchNo', label: 'Despatch No', searchable: true },
  { key: 'despatchDate', label: 'Despatch Date', searchable: true },
  { key: 'customer', label: 'Customer', searchable: true },
  { key: 'supplier', label: 'Supplier', searchable: true },
  { key: 'forwarder', label: 'Forwarder', searchable: true },
  { key: 'shipMode', label: 'Ship Mode', searchable: true },
  { key: 'despatchQty', label: 'Despatch Qty', searchable: true },
  { key: 'value', label: 'Value (₹)', searchable: true },
  { key: 'action', label: 'Action', searchable: false, width: '110px' },
];

export const MOCK_DESPATCHES = [
  {
    id: 'dsp-101',
    despatchNo: 'DSP-2026-101',
    despatchDate: '2026-09-10',
    customer: 'Nike Global Retail',
    jobOrderNo: 'JO-2026-8801',
    supplier: 'Cotton Craft Synthetics Ltd',
    forwarder: 'DHL Express Global',
    shipMode: 'Air Freight',
    type: 'Both',
    invoiceNo: 'EXP-INV-9901',
    despatchQty: '12500',
    value: '1875000.00',
    cartonPacking: 'Yes',
    approval: 'Approved',
    remarks: 'Container 40ft HQ dispatched',
  },
  {
    id: 'dsp-102',
    despatchNo: 'DSP-2026-102',
    despatchDate: '2026-09-12',
    customer: 'Adidas Sourcing Ltd',
    jobOrderNo: 'JO-2026-8802',
    supplier: 'Apex Spinners & Weavers',
    forwarder: 'Maersk Logistics',
    shipMode: 'Sea Freight',
    type: 'Order',
    invoiceNo: 'EXP-INV-9902',
    despatchQty: '8400',
    value: '1260000.00',
    cartonPacking: 'Yes',
    approval: 'Pending',
    remarks: 'Port delivery scheduled',
  },
  {
    id: 'dsp-103',
    despatchNo: 'DSP-2026-103',
    despatchDate: '2026-09-14',
    customer: 'Puma Garments International',
    jobOrderNo: 'JO-2026-8803',
    supplier: 'Vardhman Yarns & Threads',
    forwarder: 'FedEx International',
    shipMode: 'Air Freight',
    type: 'Invoice',
    invoiceNo: 'EXP-INV-9903',
    despatchQty: '6200',
    value: '930000.00',
    cartonPacking: 'No',
    approval: 'Approved',
    remarks: 'Special polybag hanging shipment',
  },
];
