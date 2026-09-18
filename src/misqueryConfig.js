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


// Dummy data for the Order Summary table
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
