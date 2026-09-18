// Misquery Module Configuration & Data Definitions

export const MISQUERY_MENU = [
  {
    group: true, key: 'misqueryGroup', label: 'MISQUERY', icon: '🔍',
    children: [
      {
        group: true, key: 'analysis', label: 'ANALYSIS', icon: '📊',
        children: [
          { key: 'tracking', label: 'TRACKING', icon: '⏱️', route: '/misquery/tracking' },
        ],
      },
      {
        group: true, key: 'inventory', label: 'INVENTORY', icon: '📦',
        children: [
          { key: 'stores-indent', label: 'STORES INDENT', icon: '📋', route: '/misquery/stores-indent' },
          { key: 'stores-issue', label: 'STORES ISSUE', icon: '📤', route: '/misquery/stores-issue' },
          { key: 'stock', label: 'STOCK', icon: '📦', route: '/misquery/stock' },
          { key: 'work-in-progress', label: 'WORK IN PROGRESS', icon: '⏳', route: '/misquery/work-in-progress' },
          { key: 'day-book', label: 'DAY BOOK', icon: '📖', route: '/misquery/day-book' },
        ],
      },
      {
        group: true, key: 'work-flow', label: 'WORK FLOW', icon: '🔄',
        children: [
          { key: 'workflow-order-summary', label: 'ORDER SUMMARY', icon: '📝', route: '/misquery/workflow-order-summary' },
          { key: 'workflow-summary', label: 'SUMMARY', icon: '📊', route: '/misquery/workflow-summary' },
          { key: 'workflow-pending-orders', label: 'PENDING ORDERS', icon: '⏳', route: '/misquery/workflow-pending-orders' },
          { key: 'workflow-process-iss-rec', label: 'PROCESS/ISS/REC', icon: '🔁', route: '/misquery/workflow-process-iss-rec' },
          { key: 'workflow-receipt-status', label: 'RECEIPT STATUS', icon: '🧾', route: '/misquery/workflow-receipt-status' },
          { key: 'workflow-issue-summary', label: 'ISSUE SUMMARY', icon: '📌', route: '/misquery/workflow-issue-summary' },
          { key: 'workflow-production-summary', label: 'PRODUCTION SUMMARY', icon: '🏭', route: '/misquery/workflow-production-summary' },
        ],
      },
      {
        group: true, key: 'logistics', label: 'LOGISTICS', icon: '🚢',
        children: [
          { key: 'logistics-order-summary', label: 'ORDER SUMMARY', icon: '📝', route: '/misquery/logistics-order-summary' },
          { key: 'logistics-invoice-summary', label: 'INVOICE SUMMARY', icon: '🧾', route: '/misquery/logistics-invoice-summary' },
          { key: 'register-invoice-register', label: 'INVOICE REGISTER', icon: '📓', route: '/misquery/register-invoice-register' },
          { key: 'logistics-invoice-detail', label: 'INVOICE DETAIL', icon: '📄', route: '/misquery/logistics-invoice-detail' },
        ],
      },
    ],
  },
];

export const ORDER_TYPES = ['--All--', 'Bulk', 'Sample', 'WareHouse', 'Group'];
export const STYLE_TYPES = ['--All--', 'fabric knits', 'Fabric Oven', 'garment'];
export const ORDER_OPTIONS = ['--All--', 'Job Order', 'Knits-Garment-Export', 'Knitted Fabric'];

export const COMPANY_LIST = ['--Select--', 'Frontier Knitters', 'ABC Exports', 'Global Garments'];
export const CUSTOMER_LIST = ['--Select--', 'Nike Global', 'Adidas', 'Puma'];
export const UNIT_SUPPLIER_LIST = ['--Select--', 'Unit 1', 'Unit 2', 'Supplier A', 'Supplier B'];
export const STYLE_LIST = ['--Select--', 'ST-1001', 'ST-1002', 'ST-1003'];
export const MERCHANDISER_LIST = ['--Select--', 'Sana Malik', 'Ahmed Raza', 'Ali Hassan'];
export const MANAGER_LIST = ['--Select--', 'John Doe', 'Jane Smith', 'Bob Williams'];
export const TEAM_LIST = ['--Select--', 'Team Alpha', 'Team Export', 'Team Knits'];
export const BRAND_LIST = ['--Select--', 'Nike', 'Adidas Original', 'Puma Sport'];
export const ITEM_GROUP_LIST = ['--Select--', 'Yarn', 'Fabric', 'Accessories', 'Chemicals'];
export const INDENT_BY_LIST = ['--Select--', 'Admin', 'Store Keeper', 'Production Head'];
export const WORK_DIVISION_LIST = ['--Select--', 'Cutting', 'Sewing', 'Finishing', 'Packing'];
export const DEPARTMENT_LIST = ['--Select--', 'HR', 'IT', 'Production', 'Logistics'];
export const EMPLOYEE_LIST = ['--Select--', 'Emp 101', 'Emp 102', 'Emp 103'];
export const ITEM_TYPE_LIST = ['--Select--', 'Raw Material', 'Work in Progress', 'Finished Goods'];
export const STORE_LIST = ['--Select--', 'Main Store', 'Sub Store A', 'Sub Store B', 'Scrap Yard'];
export const ITEM_LIST = ['--Select--', 'Item 1', 'Item 2', 'Item 3'];
export const COLOR_LIST = ['--Select--', 'Red', 'Blue', 'Green', 'Black', 'White'];
export const SIZE_LIST = ['--Select--', 'S', 'M', 'L', 'XL', 'XXL'];
export const MANUFACTURER_LIST = ['--Select--', 'Mfg A', 'Mfg B', 'Mfg C'];
export const PRODUCT_CATEGORY_LIST = ['--Select--', 'Mens', 'Womens', 'Kids'];
export const ITEM_CATEGORY_LIST = ['--Select--', 'Category 1', 'Category 2'];
export const PROCESS_LIST = ['--Select--', 'Knitting', 'Dyeing', 'Printing'];
export const SUB_GROUP_LIST = ['--Select--', 'Sub Group A', 'Sub Group B'];
export const STOCK_TYPE_LIST = ['--Select--', 'Fresh', 'Damage', 'Scrap'];
export const ORDER_CATEGORY_LIST = ['--Select--', 'Category A', 'Category B'];
export const PROCESSOR_LIST = ['--Select--', 'Processor 1', 'Processor 2'];
export const COORDINATOR_LIST = ['--Select--', 'Coord A', 'Coord B'];
export const SEASON_LIST = ['-- All --', 'Spring 2026', 'Summer 2026', 'Autumn 2026', 'Winter 2026'];
export const STYLE_GROUP_LIST = ['-- All --', 'Knits', 'Woven', 'Denim', 'Jersey'];
export const BUYER_LIST = ['-- All --', 'Nike Global', 'Adidas', 'Puma', 'H&M', 'Zara'];
export const CONSIGNEE_LIST = ['-- All --', 'Consignee A', 'Consignee B', 'Consignee C'];
export const AGENT_LIST = ['-- All --', 'Agent 1', 'Agent 2', 'Agent 3'];
export const SHIPMENT_MODE_LIST = ['-- All --', 'Sea', 'Air', 'Courier', 'Road', 'Rail'];
export const CURRENCY_LIST = ['-- All --', 'USD', 'EUR', 'GBP', 'INR', 'AED'];
export const SYSTEM_LIST = ['-- All --', 'System A', 'System B', 'System C'];
export const PORT_OF_LOADING_LIST = ['-- All --', 'Nhava Sheva', 'Mundra', 'Chennai', 'Kolkata', 'Cochin'];
export const PORT_OF_DISCHARGE_LIST = ['-- All --', 'New York', 'Rotterdam', 'Hamburg', 'Singapore', 'Dubai'];
export const DESTINATION_LIST = ['-- All --', 'USA', 'UK', 'Germany', 'Netherlands', 'Australia', 'Canada'];
export const COUNTRY_LIST = ['-- All --', 'USA', 'UK', 'Germany', 'Bangladesh', 'Sri Lanka', 'China', 'India', 'UAE', 'Turkey'];


// Dummy data for the Order Summary table
// Dummy data for the Invoice Register table (Misquery > Register > Invoice Register)
export const INITIAL_INVOICE_REGISTER = [
  {
    id: 'invreg-1',
    sNo: '1',
    invoiceNo: 'EXP-INV-2026-101',
    orderNo: 'ORD-2026-4401',
    refNo: 'REF-9901',
    company: 'FRONTIER KNITTERS (P) LTD',
    customer: 'Nike Global',
    country: 'USA',
    despatchDate: '2026-09-10',
    status: 'Active',
  },
  {
    id: 'invreg-2',
    sNo: '2',
    invoiceNo: 'EXP-INV-2026-102',
    orderNo: 'ORD-2026-4402',
    refNo: 'REF-9902',
    company: 'FRONTIER FASHIONS',
    customer: 'Adidas',
    country: 'Germany',
    despatchDate: '2026-09-12',
    status: 'Active',
  },
  {
    id: 'invreg-3',
    sNo: '3',
    invoiceNo: 'EXP-INV-2026-103',
    orderNo: 'ORD-2026-4403',
    refNo: 'REF-9903',
    company: 'FRONTIER KNITTERS (P) LTD',
    customer: 'Puma',
    country: 'UK',
    despatchDate: '2026-09-14',
    status: 'Closed',
  },
  {
    id: 'invreg-4',
    sNo: '4',
    invoiceNo: 'EXP-INV-2026-104',
    orderNo: 'ORD-2026-4404',
    refNo: 'REF-9904',
    company: 'FRONTIER PRINTING',
    customer: 'H&M',
    country: 'China',
    despatchDate: '2026-09-16',
    status: 'Valid',
  },
  {
    id: 'invreg-5',
    sNo: '5',
    invoiceNo: 'EXP-INV-2026-105',
    orderNo: 'ORD-2026-4405',
    refNo: 'REF-9905',
    company: 'FRONTIER FASHIONS',
    customer: 'Zara',
    country: 'India',
    despatchDate: '2026-09-18',
    status: 'Cancel',
  },
  {
    id: 'invreg-6',
    sNo: '6',
    invoiceNo: 'EXP-INV-2026-106',
    orderNo: 'ORD-2026-4406',
    refNo: 'REF-9906',
    company: 'FRONTIER KNITTERS (P) LTD',
    customer: 'Nike Global',
    country: 'UAE',
    despatchDate: '2026-09-20',
    status: 'Active',
  },
];

// Dummy data for the Invoice Detail table (Misquery > Logistics > Invoice Detail)
export const INITIAL_INVOICE_DETAIL = [
  {
    id: 'invdet-1',
    sNo: '1',
    invoiceNo: 'EXP-INV-2026-201',
    orderNo: 'ORD-2026-4501',
    refNo: 'REF-2101',
    company: 'FRONTIER KNITTERS (P) LTD',
    customer: 'Nike Global',
    invoiceDate: '2026-09-11',
    status: 'Active',
  },
  {
    id: 'invdet-2',
    sNo: '2',
    invoiceNo: 'EXP-INV-2026-202',
    orderNo: 'ORD-2026-4502',
    refNo: 'REF-2102',
    company: 'FRONTIER FASHIONS',
    customer: 'Adidas',
    invoiceDate: '2026-09-12',
    status: 'Active',
  },
  {
    id: 'invdet-3',
    sNo: '3',
    invoiceNo: 'EXP-INV-2026-203',
    orderNo: 'ORD-2026-4503',
    refNo: 'REF-2103',
    company: 'FRONTIER KNITTERS (P) LTD',
    customer: 'Puma',
    invoiceDate: '2026-09-13',
    status: 'Closed',
  },
  {
    id: 'invdet-4',
    sNo: '4',
    invoiceNo: 'EXP-INV-2026-204',
    orderNo: 'ORD-2026-4504',
    refNo: 'REF-2104',
    company: 'FRONTIER PRINTING',
    customer: 'H&M',
    invoiceDate: '2026-09-15',
    status: 'Valid',
  },
  {
    id: 'invdet-5',
    sNo: '5',
    invoiceNo: 'EXP-INV-2026-205',
    orderNo: 'ORD-2026-4505',
    refNo: 'REF-2105',
    company: 'FRONTIER FASHIONS',
    customer: 'Zara',
    invoiceDate: '2026-09-17',
    status: 'Cancel',
  },
  {
    id: 'invdet-6',
    sNo: '6',
    invoiceNo: 'EXP-INV-2026-206',
    orderNo: 'ORD-2026-4506',
    refNo: 'REF-2106',
    company: 'FRONTIER KNITTERS (P) LTD',
    customer: 'Nike Global',
    invoiceDate: '2026-09-19',
    status: 'Active',
  },
];

export const INITIAL_ORDER_SUMMARY = [
  {
    id: 'os-1',
    sNo: '1',
    orderInfo: 'ORD-2026-4401 | 12500 Pcs',
    customer: 'Nike Global Retail',
    unitSup: 'Unit 1',
    shipDate: '2026-10-15',
    workOrderNo: 'WO-8812',
    consumptionPlanned: '2.50',
    consumptionActual: '2.45',
    statusBom: 'Approved',
    statusBudget: 'In-Limits',
    statusStock: 'Available',
    statusIssue: 'None',
  },
  {
    id: 'os-2',
    sNo: '2',
    orderInfo: 'ORD-2026-4402 | 8400 Pcs',
    customer: 'Adidas Sourcing Ltd',
    unitSup: 'Unit 2',
    shipDate: '2026-10-25',
    workOrderNo: 'WO-8815',
    consumptionPlanned: '1.80',
    consumptionActual: '1.82',
    statusBom: 'Pending',
    statusBudget: 'Exceeded',
    statusStock: 'Shortage',
    statusIssue: 'Fabric Delay',
  },
];
