// General Invoice config — dropdown options, column defs, and seed mock data
import { SUPPLIER_LIST } from './billInwardConfig';

export { SUPPLIER_LIST };

export const INVOICE_TYPES = ['Item', 'Process', 'Other Heads'];
export const INVOICE_CATEGORIES = ['General', 'Other'];
export const CURRENCY_TYPES = ['INR', 'USD', 'EUR', 'GBP'];
export const APPROVAL_STATUSES = ['All', 'Approved', 'Pending'];
export const GENERAL_INVOICE_PER_PAGE_OPTIONS = [5, 10, 20, 50];
export const GENERAL_INVOICE_DOWNLOAD_TYPES = ['csv', 'pdf', 'xls', 'rtf'];

export const GENERAL_INVOICE_COLUMNS = [
  { key: 'sno', label: 'S.No', searchable: false, width: '60px' },
  { key: 'invoiceNo', label: 'Invoice No', searchable: true },
  { key: 'invoiceDate', label: 'Date', searchable: true },
  { key: 'supplier', label: 'Supplier', searchable: true },
  { key: 'supplierInvoiceNo', label: 'Supplier Invoice No', searchable: true },
  { key: 'billInwardNo', label: 'Bill Inward No', searchable: true },
  { key: 'amount', label: 'Amount', searchable: true },
  { key: 'approval', label: 'Approval', searchable: true },
  { key: 'action', label: 'Action', searchable: false, width: '110px' },
];

export const MOCK_GENERAL_INVOICES = [
  {
    id: 'ginv-101',
    invoiceNo: 'GINV-2026-101',
    invoiceDate: '2026-09-10',
    supplier: 'Cotton Craft Synthetics Ltd',
    supplierInvoiceNo: 'SUP-INV-8801',
    supplierInvoiceDate: '2026-09-08',
    curType: 'INR',
    curAmount: '125000.00',
    exchangeRate: '1.0',
    convertedAmount: '125000.00',
    invoiceType: 'Item',
    categoryType: 'General',
    billInwardNo: 'BINW-2026-101',
    amount: '125000.00',
    process: 'Yarn Dyeing Process & Inspection',
    approval: 'Approved',
  },
  {
    id: 'ginv-102',
    invoiceNo: 'GINV-2026-102',
    invoiceDate: '2026-09-12',
    supplier: 'Apex Spinners & Weavers',
    supplierInvoiceNo: 'SUP-INV-9922',
    supplierInvoiceDate: '2026-09-11',
    curType: 'USD',
    curAmount: '1000.00',
    exchangeRate: '83.5',
    convertedAmount: '83500.00',
    invoiceType: 'Process',
    categoryType: 'General',
    billInwardNo: 'BINW-2026-102',
    amount: '83500.00',
    process: 'Compact Spinning Charges',
    approval: 'Pending',
  },
  {
    id: 'ginv-103',
    invoiceNo: 'GINV-2026-103',
    invoiceDate: '2026-09-14',
    supplier: 'Vardhman Yarns & Threads',
    supplierInvoiceNo: 'SUP-INV-4411',
    supplierInvoiceDate: '2026-09-13',
    curType: 'INR',
    curAmount: '240000.00',
    exchangeRate: '1.0',
    convertedAmount: '240000.00',
    invoiceType: 'Other Heads',
    categoryType: 'Other',
    billInwardNo: 'BINW-2026-103',
    amount: '240000.00',
    process: 'Freight & Handling Charges',
    approval: 'Approved',
  },
];
