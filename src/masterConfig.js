// Master sub-module configuration — single source of truth for the Masters dropdown + Masters page
export const MASTER_LIST = [
  { key: 'buyers',       icon: '🏢', title: 'Buyer',            plural: 'Buyers',            labels: ['Buyer Name *', 'Country', 'Contact / Email'], place: ['Buyer name', 'Country', 'Email'], head: ['#', 'Buyer Name', 'Country', 'Contact / Email'], fields: ['name', 'country', 'contact'] },
  { key: 'fabrics',      icon: '🧶', title: 'Fabric',           plural: 'Fabrics',           labels: ['Fabric Name *', 'Type', 'Unit'], place: ['Fabric name'], head: ['#', 'Fabric Name', 'Type', 'Unit'], fields: ['name', 'type', 'unit'], opts: [null, ['Knitted', 'Woven'], ['Kg', 'Meter', 'Yard']] },
  { key: 'styles',       icon: '👕', title: 'Style',            plural: 'Styles',            labels: ['Style Code *', 'Category', 'Description'], place: ['ST-1003'], head: ['#', 'Style Code', 'Category', 'Description'], fields: ['code', 'category', 'desc'], opts: [null, ['T-Shirt', 'Polo', 'Shirt', 'Bottom', 'Hoodie', 'Jacket'], null] },
  { key: 'company',      icon: '🏢', title: 'Company',          plural: 'Companies',         labels: ['Company Name *', 'Address', 'Contact / Email'], place: ['Company name', 'Address', 'Email / mobile'], head: ['#', 'Company Name', 'Address', 'Contact / Email'], fields: ['name', 'address', 'contact'] },
  { key: 'employee',     icon: '👷', title: 'Employee',         plural: 'Employees',         labels: ['Employee Name *', 'Department', 'Designation'], place: ['Employee name', 'Department', 'Designation'], head: ['#', 'Employee Name', 'Department', 'Designation'], fields: ['name', 'department', 'designation'], opts: [null, ['Merchandising', 'Cutting', 'Stitching', 'QC', 'Packing', 'Store', 'Accounts', 'HR', 'Admin'], null] },
  { key: 'territory',    icon: '🗺️', title: 'Territory',        plural: 'Territories',       labels: ['Territory Name *', 'Region', 'Sales Rep / Code'], place: ['Territory name', 'Region', 'Rep or code'], head: ['#', 'Territory Name', 'Region', 'Sales Rep / Code'], fields: ['name', 'region', 'rep'] },
  { key: 'statutory',    icon: '📋', title: 'Statutory',        plural: 'Statutories',       labels: ['Register Name *', 'Code / Number', 'Type'], place: ['Register name'], head: ['#', 'Register Name', 'Code / Number', 'Type'], fields: ['name', 'code', 'type'], opts: [null, null, ['GST', 'PF', 'ESI', 'TDS', 'Professional Tax', 'Factory License']] },
  { key: 'product',      icon: '👚', title: 'Product',          plural: 'Products',          labels: ['Product Name *', 'Category', 'Description'], place: ['Product name', 'Category', 'Description'], head: ['#', 'Product Name', 'Category', 'Description'], fields: ['name', 'category', 'desc'] },
  { key: 'item',         icon: '🧷', title: 'Item',             plural: 'Items',             labels: ['Item Name *', 'Category', 'Unit'], place: ['Item name', 'Category'], head: ['#', 'Item Name', 'Category', 'Unit'], fields: ['name', 'category', 'unit'], opts: [null, ['Fabric', 'Trims', 'Thread', 'Buttons', 'Packaging', 'Others'], ['Kg', 'Meter', 'Yard', 'Pcs', 'Doz', 'Gross', 'Set']] },
  { key: 'workflow',     icon: '⚙️', title: 'Workflow Step',    plural: 'Workflow Steps',    labels: ['Step Name *', 'Department', 'Sequence'], place: ['Step name', 'Department', '01'], head: ['#', 'Step Name', 'Department', 'Sequence'], fields: ['name', 'department', 'sequence'], opts: [null, ['Merchandising', 'Cutting', 'Stitching', 'QC', 'Packing', 'Store', 'Accounts', 'HR', 'Admin'], null] },
  { key: 'commercials',  icon: '💰', title: 'Commercial',       plural: 'Commercials',       labels: ['Term Name *', 'Rate / Value', 'Type'], place: ['Term name'], head: ['#', 'Term Name', 'Rate / Value', 'Type'], fields: ['name', 'value', 'type'], opts: [null, null, ['Commission', 'Discount', 'Overheads', 'Freight', 'Insurance', 'Markup']] },
  { key: 'quality',      icon: '✅', title: 'Quality Parameter',plural: 'Quality Parameters', labels: ['Parameter *', 'Standard / Tolerance', 'Method'], place: ['Parameter'], head: ['#', 'Parameter', 'Standard / Tolerance', 'Method'], fields: ['parameter', 'standard', 'method'] },
  { key: 'orderElements',icon: '📝', title: 'Order Element',    plural: 'Order Elements',    labels: ['Element Name *', 'Type', 'Unit / Options'], place: ['Element name'], head: ['#', 'Element Name', 'Type', 'Unit / Options'], fields: ['name', 'type', 'unit'], opts: [null, ['Size', 'Colour', 'Qty', 'Bundle', 'Ratio'], ['Pcs', 'Doz', 'Set', '%']] },
  { key: 'warehouse',    icon: '🏭', title: 'Warehouse',        plural: 'Warehouses',        labels: ['Warehouse Name *', 'Location', 'In-charge'], place: ['Warehouse name', 'Location', 'In-charge'], head: ['#', 'Warehouse Name', 'Location', 'In-charge'], fields: ['name', 'location', 'incharge'] },
];

// Keyed map so the Masters page can look up a sub-menu by URL param
export const MASTER_STEPS = Object.fromEntries(MASTER_LIST.map((m) => [m.key, m]));

// PARTY group (MASTER > PARTY) — labels & short codes per the screenshot spec
export const PARTY_MENU = [
  { key: 'customer',  label: 'CUSTOMER',  code: 'BUY', route: '/masters/customer' },
  { key: 'consignee', label: 'CONSIGNEE', code: 'CNE', route: '/module/consignee' },
  { key: 'supplier',  label: 'SUPPLIER',  code: 'SPD', route: '/module/supplier' },
  { key: 'bank',      label: 'BANK',      code: 'BNK', route: '/module/bank' },
  { key: 'transport', label: 'TRANSPORT', code: 'TRN', route: '/module/transport' },
];

// Top navigation menu: PARTY group + all other master sub-menus
export const MASTER_MENU = [
  { group: true, key: 'party', label: 'PARTY', icon: '🤝', children: PARTY_MENU },
  ...MASTER_LIST.map((m) => ({ key: m.key, label: m.plural, icon: m.icon, route: `/masters/${m.key}` })),
];