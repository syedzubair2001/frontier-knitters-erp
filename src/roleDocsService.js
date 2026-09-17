/**
 * Role Documents / Access Control service (same localStorage pattern as other modules).
 * Documents are assigned per role & team; a logged-in user only ever sees the
 * documents granted to their role.
 */
import { ROLES } from './roles';

/** Teams (separate from roles — a document belongs to a team, a role is granted to a role) */
export const TEAMS = ['Purchase', 'Merchandising', 'Production', 'QC', 'Store', 'Accounts', 'Warehouse', 'Admin'];

/** Every document in the ERP that can be shown/hidden per role */
export const ROLE_DOCUMENTS = [
  { key: 'dashboard', label: 'Dashboard Overview' },
  { key: 'masters', label: 'Masters', group: true },
  { key: 'customer', label: 'Party — Customer (BUY)' },
  { key: 'consignee', label: 'Party — Consignee (CNE)' },
  { key: 'supplier', label: 'Party — Supplier (SPD)' },
  { key: 'bank', label: 'Party — Bank (BNK)' },
  { key: 'transport', label: 'Party — Transport (TRN)' },
  { key: 'orders', label: 'Orders' },
  { key: 'requisition', label: 'Purchase — Requisition' },
  { key: 'purchase-order', label: 'Purchase — Order' },
  { key: 'purchase-general', label: 'Purchase — General' },
  { key: 'grn-vendor', label: 'Purchase — GRN Vendor' },
  { key: 'grn-customer', label: 'Purchase — GRN Customer' },
  { key: 'return', label: 'Purchase — Return' },
  { key: 'vendor-quotation', label: 'Purchase — Vendor Quotation' },
  { key: 'po-allocation', label: 'Purchase — PO Allocation' },
  { key: 'stock', label: 'Stores — Stock' },
  { key: 'store', label: 'Stores — Store' },
  { key: 'indent', label: 'Stores — Indent' },
  { key: 'bill-inward', label: 'Invoice — Bill Inward' },
  { key: 'general-invoice', label: 'Invoice — General Invoice' },
  { key: 'export-despatch', label: 'Exports — Despatch' },
  { key: 'export-invoice', label: 'Exports — Export Invoice' },
  { key: 'finish-warehouse-transfer', label: 'Shipment — Finish Warehouse Transfer' },
  { key: 'adjustment', label: 'Accounts — Receipt Adjustment' },
  { key: 'collection', label: 'Accounts — Collection Receipts' },
  { key: 'payment', label: 'Accounts — Supplier Payments' },
  { key: 'passing', label: 'Accounts — Bill Approval Passing' },
  { key: 'internal', label: 'Stores — Internal' },
  { key: 'external', label: 'Stores — External' },
  { key: 'invoice-gate', label: 'Stores — Invoice & Gate' },
  { key: 'documents-team', label: 'Documents Team', group: true },
  { key: 'order-booking', label: 'Documents Team — Order & Booking' },
  { key: 'invoice-shipment', label: 'Documents Team — Invoice & Shipment' },
  { key: 'shipping-bill', label: 'Documents Team — Shipping Bill' },
  { key: 'forwarding', label: 'Documents Team — Forwarding' },
  { key: 'clearing', label: 'Documents Team — Clearing' },
  { key: 'transport', label: 'Documents Team — Transport' },
  { key: 'fob-cost', label: 'Documents Team — FOB Cost' },
  { key: 'payment-realisation', label: 'Documents Team — Payment & Realisation' },
  { key: 'foreign-currency', label: 'Documents Team — Foreign Currency' },
  { key: 'brc', label: 'Documents Team — BRC' },
  { key: 'documents-reports', label: 'Documents Team — Documents Reports' },
];

const KEY = 'fk_role_docs';

export function roleOptions() {
  return Object.values(ROLES);
}

/** Default role permissions if not customized in Role Documents */
function defaults() {
  const map = {};
  const docTeamKeys = [
    'documents-team', 'order-booking', 'invoice-shipment', 'shipping-bill',
    'forwarding', 'clearing', 'transport', 'fob-cost', 'payment-realisation',
    'foreign-currency', 'brc', 'documents-reports',
  ];
  roleOptions().forEach((r) => {
    map[r] = {};
    ROLE_DOCUMENTS.forEach((d) => {
      if (r === ROLES.SUPER_ADMIN || r === ROLES.ADMIN) {
        map[r][d.key] = true;
      } else if (r === 'DOCUMENT' || r === ROLES.DOCUMENT || r === ROLES.Document) {
        // DOCUMENT role gets Home, Stores -> Indent, Bill Inward, General Invoice, Export Despatch, Export Invoice, Finish Warehouse Transfer, Adjustment, Collection, Payment, Passing, AND Documents Team
        map[r][d.key] = (
          d.key === 'home' ||
          d.key === 'indent' ||
          d.key === 'bill-inward' ||
          d.key === 'general-invoice' ||
          d.key === 'export-despatch' ||
          d.key === 'export-invoice' ||
          d.key === 'finish-warehouse-transfer' ||
          d.key === 'adjustment' ||
          d.key === 'collection' ||
          d.key === 'payment' ||
          d.key === 'passing' ||
          docTeamKeys.includes(d.key)
        );
      } else if (r === ROLES.STORE_KEEPER) {
        map[r][d.key] = ['home', 'stock', 'store', 'indent', 'internal', 'external', 'invoice-gate', 'finish-warehouse-transfer'].includes(d.key);
      } else if (r === ROLES.MERCHANDISER) {
        map[r][d.key] = ['home', 'customer', 'consignee', 'orders', 'requisition', 'purchase-order'].includes(d.key);
      } else if (r === ROLES.ACCOUNTS) {
        map[r][d.key] = ['home', 'bank', 'invoice-gate', 'adjustment', 'collection', 'payment', 'passing'].includes(d.key);
      } else {
        map[r][d.key] = true;
      }
    });
  });
  return map;
}

export function loadRoleDocs() {
  const def = defaults();
  try {
    const obj = JSON.parse(localStorage.getItem(KEY));
    if (!obj || typeof obj !== 'object') return def;
    // Deep-merge so every role always exists and new documents default to allowed
    Object.keys(def).forEach((r) => {
      if (!obj[r] || typeof obj[r] !== 'object') obj[r] = { ...def[r] };
      else {
        Object.keys(def[r]).forEach((k) => {
          if (!(k in obj[r])) obj[r][k] = def[r][k];
        });
      }
    });
    return obj;
  } catch {
    return def;
  }
}

export function saveRoleDocs(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, msg: 'Could not save role documents.' };
  }
}

/** Does the given role have access to the document key? */
export function canUseRole(role, docKey) {
  if (role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN) return true;
  if (docKey === 'home' || docKey === 'dashboard') return true; // Dashboard is common for all roles
  
  const docTeamKeys = [
    'documents-team', 'order-booking', 'invoice-shipment', 'shipping-bill',
    'forwarding', 'clearing', 'transport', 'fob-cost', 'payment-realisation',
    'foreign-currency', 'brc', 'documents-reports',
  ];
  if ((role === 'DOCUMENT' || role === ROLES.DOCUMENT) && docTeamKeys.includes(docKey)) {
    const data = loadRoleDocs();
    if (data[role] && data[role][docKey] !== undefined) {
      return !!data[role][docKey];
    }
    return true;
  }

  const data = loadRoleDocs();
  return !!(data[role] && data[role][docKey]);
}

/** Map a navigation menu key to the permission document key. */
export function docKeyFor(menuKey) {
  const map = {
    masters: 'masters', buyers: 'masters', fabrics: 'masters', styles: 'masters', company: 'masters',
    employee: 'masters', territory: 'masters', statutory: 'masters', product: 'masters', item: 'masters',
    workflow: 'masters', commercials: 'masters', quality: 'masters', orderElements: 'masters', warehouse: 'masters',
    customer: 'customer', consignee: 'consignee', supplier: 'supplier', bank: 'bank', transport: 'transport',
    requisition: 'requisition', order: 'purchase-order', general: 'purchase-general',
    grnVendor: 'grn-vendor', grnCustomer: 'grn-customer', return: 'return',
    vendorQuotation: 'vendor-quotation', poAllocation: 'po-allocation',
    stock: 'stock', store: 'store', indent: 'indent', billInward: 'bill-inward', invoiceGeneral: 'general-invoice', generalInvoice: 'general-invoice', despatch: 'export-despatch', exportDespatch: 'export-despatch', exportInvoice: 'export-invoice', finishWarehouseTransfer: 'finish-warehouse-transfer', 'finish-warehouse-transfer': 'finish-warehouse-transfer', adjustment: 'adjustment', collection: 'collection', payment: 'payment', passing: 'passing', internal: 'internal', external: 'external', invoiceAndGate: 'invoice-gate',
    orders: 'orders',
    'order-booking': 'order-booking',
    'invoice-shipment': 'invoice-shipment',
    'shipping-bill': 'shipping-bill',
    'forwarding': 'forwarding',
    'clearing': 'clearing',
    'transport': 'transport',
    'fob-cost': 'fob-cost',
    'payment-realisation': 'payment-realisation',
    'foreign-currency': 'foreign-currency',
    'brc': 'brc',
    'documents-reports': 'documents-reports',
    'documents-team': 'documents-team',
  };
  return map[menuKey] || null;
}