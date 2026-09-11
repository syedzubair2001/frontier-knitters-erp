// Garment-based Roles for Frontier Knitters ERP
export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MERCHANDISER: 'Merchandiser',
  PRODUCTION_MANAGER: 'Production Manager',
  CUTTING_MASTER: 'Cutting Master',
  STITCHING_SUPERVISOR: 'Stitching Supervisor',
  QC: 'Quality Checker (QC)',
  STORE_KEEPER: 'Store Keeper',
  PACKING_STAFF: 'Packing Staff',
  ACCOUNTS: 'Accounts',
  HR: 'HR',
};

export const ROLE_LIST = Object.values(ROLES);

// Module roadmap for Frontier Knitters Pvt Ltd
export const MODULE_LIST = [
  { key: 'masters', label: 'Masters', icon: '🗂️', desc: 'Buyers • Fabrics • Styles' },
  { key: 'orders', label: 'Orders', icon: '📦', desc: 'Buyer orders entry' },
  { key: 'cutting', label: 'Cutting', icon: '✂️', desc: 'Fabric cutting' },
  { key: 'stitching', label: 'Stitching', icon: '🧵', desc: 'Sewing lines' },
  { key: 'qc', label: 'QC', icon: '✅', desc: 'Quality check' },
  { key: 'packing', label: 'Packing', icon: '📦', desc: 'Pack & tag' },
  { key: 'shipping', label: 'Shipping', icon: '🚢', desc: 'Ship to buyer' },
  { key: 'invoice', label: 'Invoice & DC', icon: '🧾', desc: 'Invoice / Delivery Challan' },
];