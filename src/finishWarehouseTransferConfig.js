// Config for Finish Warehouse Transfer module

export const STORE_OPTIONS = [
  'All Stores',
  'Main Finished Warehouse - Unit 1',
  'Central Export Warehouse',
  'Finishing & Packing Store A',
  'Garment Logistics Center - Tirupur'
];

export const ORDER_NO_OPTIONS = [
  'All Orders',
  'ORD-2026-901',
  'ORD-2026-902',
  'ORD-2026-903',
  'ORD-2026-904',
  'ORD-2026-905'
];

export const ENTRY_NO_OPTIONS = [
  'All Entries',
  'FWT-2026-101',
  'FWT-2026-102',
  'FWT-2026-103',
  'FWT-2026-104'
];

export const CUSTOMER_OPTIONS = [
  'All Customers',
  'Zara / Inditex S.A.',
  'H&M Sourcing Asia',
  'Nike Global Trading',
  'Adidas Sourcing Ltd',
  'Puma Apparel International'
];

export const ORDER_TYPES = [
  'Bulk Order',
  'Sample Order',
  'Warehouse Stock Transfer',
  'Urgent Re-order'
];

export const TRANSFER_DOWNLOAD_FORMATS = ['CSV', 'PDF', 'XLS', 'RTF'];

export const FINISH_TRANSFER_COLUMNS = [
  { key: 'sno', label: 'S.No', defaultWidth: 70 },
  { key: 'transNo', label: 'Trans No', defaultWidth: 140 },
  { key: 'date', label: 'Date', defaultWidth: 120 },
  { key: 'customer', label: 'Customer', defaultWidth: 200 },
  { key: 'orderNo', label: 'Order No', defaultWidth: 140 },
  { key: 'refNo', label: 'Ref. No', defaultWidth: 130 },
  { key: 'style', label: 'Style', defaultWidth: 150 },
  { key: 'orderType', label: 'Order Type', defaultWidth: 150 },
  { key: 'action', label: 'Action', defaultWidth: 120 }
];

export const MOCK_FINISH_TRANSFERS = [
  {
    id: 1,
    transNo: 'FWT-2026-101',
    date: '2026-09-10',
    customer: 'Zara / Inditex S.A.',
    orderNo: 'ORD-2026-901',
    refNo: 'REF-ZAR-881',
    style: 'Cotton Crew Neck Tee',
    orderType: 'Bulk Order',
    deliveryDetails: 'Dispatch via Express Freight to Warehouse B',
    remarks: 'Inspected and verified before packing',
    store: 'Main Finished Warehouse - Unit 1',
    items: [
      {
        id: 'item-1',
        shipDate: '2026-09-15',
        destination: 'Barcelona Port, Spain',
        loading: 'Chennai Sea Port',
        discharge: 'Barcelona Port',
        productNo: 'PRD-TSH-001',
        productName: 'Men Knit T-Shirt - Navy L',
        orderQty: 5000,
        balanceQty: 1000,
        transferQty: 1000
      },
      {
        id: 'item-2',
        shipDate: '2026-09-15',
        destination: 'Barcelona Port, Spain',
        loading: 'Chennai Sea Port',
        discharge: 'Barcelona Port',
        productNo: 'PRD-TSH-002',
        productName: 'Men Knit T-Shirt - Black M',
        orderQty: 4000,
        balanceQty: 800,
        transferQty: 800
      }
    ],
    storeDetails: [
      {
        id: 'store-1',
        transNo: 'STR-TR-501',
        date: '2026-09-10',
        supplier: 'Frontier Knitting Mill Unit 2',
        process: 'Finishing & Ironing',
        stockQty: 2500,
        transferQty: 1800
      }
    ]
  },
  {
    id: 2,
    transNo: 'FWT-2026-102',
    date: '2026-09-12',
    customer: 'H&M Sourcing Asia',
    orderNo: 'ORD-2026-902',
    refNo: 'REF-HM-442',
    style: 'Fleece Pullover Hoodie',
    orderType: 'Bulk Order',
    deliveryDetails: 'Deliver to Hamburg Distribution Hub',
    remarks: 'Priority transfer for Q3 export shipping',
    store: 'Central Export Warehouse',
    items: [
      {
        id: 'item-3',
        shipDate: '2026-09-20',
        destination: 'Hamburg Port, Germany',
        loading: 'Tuticorin Port',
        discharge: 'Hamburg Port',
        productNo: 'PRD-HOD-105',
        productName: 'Unisex Hoodie - Heather Grey S',
        orderQty: 3000,
        balanceQty: 1500,
        transferQty: 1500
      }
    ],
    storeDetails: [
      {
        id: 'store-2',
        transNo: 'STR-TR-502',
        date: '2026-09-12',
        supplier: 'In-House Packing Store',
        process: 'Polybag & Carton Packing',
        stockQty: 3000,
        transferQty: 1500
      }
    ]
  },
  {
    id: 3,
    transNo: 'FWT-2026-103',
    date: '2026-09-14',
    customer: 'Nike Global Trading',
    orderNo: 'ORD-2026-903',
    refNo: 'REF-NKE-909',
    style: 'Dri-Fit Polo Shirt',
    orderType: 'Sample Order',
    deliveryDetails: 'Air freight sample dispatch to Portland HQ',
    remarks: 'Approved sample lot for high density transfer',
    store: 'Finishing & Packing Store A',
    items: [
      {
        id: 'item-4',
        shipDate: '2026-09-18',
        destination: 'Portland Cargo Terminal',
        loading: 'Bengaluru Cargo Airport',
        discharge: 'Portland Airport',
        productNo: 'PRD-POL-201',
        productName: 'Performance Mesh Polo - Red XL',
        orderQty: 200,
        balanceQty: 50,
        transferQty: 50
      }
    ],
    storeDetails: [
      {
        id: 'store-3',
        transNo: 'STR-TR-503',
        date: '2026-09-14',
        supplier: 'Sample Development Dept',
        process: 'Quality Control & Tagging',
        stockQty: 100,
        transferQty: 50
      }
    ]
  }
];
