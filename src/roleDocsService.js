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
  { key: 'misquery', label: 'Misquery', group: true },
  { key: 'tracking', label: 'Misquery — Tracking' },
  { key: 'stores-indent', label: 'Misquery — Stores Indent' },
  { key: 'stores-issue', label: 'Misquery — Stores Issue' },
  { key: 'stock', label: 'Misquery — Stock' },
  { key: 'work-in-progress', label: 'Misquery — Work in Progress' },
  { key: 'day-book', label: 'Misquery — Day Book' },
  { key: 'work-flow', label: 'Misquery — Work Flow', group: true },
  { key: 'workflow-order-summary', label: 'Misquery — Work Flow — Order Summary' },
  { key: 'workflow-summary', label: 'Misquery — Work Flow — Summary' },
  { key: 'workflow-pending-orders', label: 'Misquery — Work Flow — Pending Orders' },
  { key: 'workflow-process-iss-rec', label: 'Misquery — Work Flow — Process/Iss/Rec' },
  { key: 'workflow-receipt-status', label: 'Misquery — Work Flow — Receipt Status' },
  { key: 'workflow-issue-summary', label: 'Misquery — Work Flow — Issue Summary' },
  { key: 'workflow-production-summary', label: 'Misquery — Work Flow — Production Summary' },
  { key: 'logistics', label: 'Misquery — Logistics', group: true },
  { key: 'logistics-order-summary', label: 'Misquery — Logistics — Order Summary' },
  { key: 'logistics-invoice-summary', label: 'Misquery — Logistics — Invoice Summary' },
  { key: 'register-invoice-register', label: 'Misquery — Logistics — Invoice Register' },
  { key: 'logistics-invoice-detail', label: 'Misquery — Logistics — Invoice Detail' },
  { key: 'logistics-despatch-statement', label: 'Misquery — Logistics — Despatch Statement' },
  { key: 'logistics-commission-register', label: 'Misquery — Logistics — Commission Register' },
  { key: 'logistics-inv-profit-statement', label: 'Misquery — Logistics — Inv/Profit Statement' },
  { key: 'documents-team', label: 'Documents Team', group: true },
  { key: 'order-booking', label: 'Documents Team — Order & Booking' },
  { key: 'invoice-shipment', label: 'Documents Team — Invoice & Shipment' },
  { key: 'shipping-bill', label: 'Documents Team — Shipping Bill' },
  { key: 'forwarding', label: 'Documents Team — Forwarding' },
  { key: 'clearing', label: 'Documents Team — Clearing' },
  { key: 'doc-transport', label: 'Documents Team — Transport' },
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
    'forwarding', 'clearing', 'doc-transport', 'fob-cost', 'payment-realisation',
    'foreign-currency', 'brc', 'documents-reports',
  ];
  roleOptions().forEach((r) => {
    map[r] = {};
    ROLE_DOCUMENTS.forEach((d) => {
      if (r === ROLES.SUPER_ADMIN || r === ROLES.ADMIN) {
        map[r][d.key] = true;
      } else if (r === 'DOCUMENT' || r === ROLES.DOCUMENT || r === ROLES.Document) {
        // DOCUMENT role gets Home, Stores -> Indent, Bill Inward, General Invoice, Export Despatch,
        // Export Invoice, Misquery reports AND Documents Team.
        // NO Accounts documents (Adjustment/Collection/Payment/Passing) — those belong to Accounts role.
        // NO Shipment — Finish Warehouse Transfer (hidden for DOCUMENT role only, others keep it).
        map[r][d.key] = (
          d.key === 'home' ||
          d.key === 'indent' ||
          d.key === 'bill-inward' ||
          d.key === 'general-invoice' ||
          d.key === 'export-despatch' ||
          d.key === 'export-invoice' ||
          d.key === 'misquery' ||
          d.key === 'tracking' ||
          d.key === 'stores-indent' ||
          d.key === 'stores-issue' ||
          d.key === 'stock' ||
          d.key === 'work-in-progress' ||
          d.key === 'day-book' ||
          d.key === 'work-flow' ||
          d.key === 'workflow-order-summary' ||
          d.key === 'workflow-summary' ||
          d.key === 'workflow-pending-orders' ||
          d.key === 'workflow-process-iss-rec' ||
          d.key === 'workflow-receipt-status' ||
          d.key === 'workflow-issue-summary' ||
          d.key === 'workflow-production-summary' ||
          d.key === 'logistics' ||
          d.key === 'logistics-order-summary' ||
          d.key === 'logistics-invoice-summary' ||
          d.key === 'register-invoice-register' ||
          d.key === 'logistics-invoice-detail' ||
          d.key === 'logistics-despatch-statement' ||
          d.key === 'logistics-commission-register' ||
          d.key === 'logistics-inv-profit-statement' ||
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
    return migrateStockV4(migrateShipmentV3(migrateAccountsV2(obj)));
  } catch {
    return def;
  }
}

/* v2 fix: DOCUMENT role must NOT see Accounts documents (Receipt Adjustment,
   Collection, Supplier Payments, Bill Approval Passing). Older saved setups
   included them — this one-time migration clears them so the Accounts menu
   disappears for the DOCUMENT role. Accounts ROLE keeps everything. */
const MIG_V2_KEY = 'fk_role_docs_v2_no_accounts';
function migrateAccountsV2(obj) {
  try {
    if (localStorage.getItem(MIG_V2_KEY) === '1') return obj;
    const docRole = ROLES.DOCUMENT;
    ['adjustment', 'collection', 'payment', 'passing'].forEach((k) => {
      if (obj[docRole]) obj[docRole][k] = false;
    });
    localStorage.setItem(MIG_V2_KEY, '1');
  } catch { /* storage unavailable — skip */ }
  return obj;
}

/* v3 fix: DOCUMENT role must NOT see Shipment — Finish Warehouse Transfer.
   One-time clear of any previously saved grant. Other roles keep it. */
const MIG_V3_KEY = 'fk_role_docs_v3_no_shipment';
function migrateShipmentV3(obj) {
  try {
    if (localStorage.getItem(MIG_V3_KEY) === '1') return obj;
    const docRole = ROLES.DOCUMENT;
    if (obj[docRole]) obj[docRole]['finish-warehouse-transfer'] = false;
    localStorage.setItem(MIG_V3_KEY, '1');
  } catch { /* storage unavailable — skip */ }
  return obj;
}

/* v4 fix: DOCUMENT role must NOT see Stock (Purchase & Stores menu + dashboard
   card). INDENT stays granted for DOCUMENT role. One-time clear of any
   previously saved grant — other roles keep Stock. */
const MIG_V4_KEY = 'fk_role_docs_v4_no_stock';
function migrateStockV4(obj) {
  try {
    if (localStorage.getItem(MIG_V4_KEY) === '1') return obj;
    const docRole = ROLES.DOCUMENT;
    if (obj[docRole]) obj[docRole]['stock'] = false;
    localStorage.setItem(MIG_V4_KEY, '1');
  } catch { /* storage unavailable — skip */ }
  return obj;
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

/* ── Rights (View / Add / Edit / Delete) per role × document ──
   Stored separately under its own key so existing access data stays valid.
   A document with no explicit rights record = FULL rights (old behaviour). */
export const RIGHTS = ['view', 'add', 'edit', 'delete'];
const RIGHTS_KEY = 'fk_role_rights';

function fullRights() {
  return { view: true, add: true, edit: true, delete: true };
}

export function loadRights() {
  try {
    const obj = JSON.parse(localStorage.getItem(RIGHTS_KEY));
    if (obj && typeof obj === 'object') return obj;
  } catch { /* corrupted -> start clean */ }
  return {};
}

export function saveRights(data) {
  try {
    localStorage.setItem(RIGHTS_KEY, JSON.stringify(data));
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, msg: 'Could not save role rights.' };
  }
}

/** Effective rights for a role × document (missing record = full rights). */
export function rightsFor(rightsData, role, docKey) {
  const rec = rightsData && rightsData[role] ? rightsData[role][docKey] : null;
  return rec && typeof rec === 'object' ? { ...fullRights(), ...rec } : fullRights();
}

/** Can this role perform `right` ('view'|'add'|'edit'|'delete') on docKey? */
export function hasRight(role, docKey, right) {
  if (role === ROLES.SUPER_ADMIN) return true;
  if (docKey === 'home' || docKey === 'dashboard') return true;
  if (!canUseRole(role, docKey)) return false; // no access -> no rights at all
  const data = loadRights();
  const rec = data[role] ? data[role][docKey] : null;
  if (!rec || typeof rec !== 'object') return true; // no explicit record = full rights
  return !!rec[right];
}


/** Does the given role have access to the document key? */
export function canUseRole(role, docKey) {
  if (role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN) return true;
  if (docKey === 'home' || docKey === 'dashboard') return true; // Dashboard is common for all roles
  
  const docTeamKeys = [
    'documents-team', 'order-booking', 'invoice-shipment', 'shipping-bill',
    'forwarding', 'clearing', 'doc-transport', 'fob-cost', 'payment-realisation',
    'foreign-currency', 'brc', 'documents-reports',
  ];
  if ((role === 'DOCUMENT' || role === ROLES.DOCUMENT) && docTeamKeys.includes(docKey)) {
    const data = loadRoleDocs();
    if (data[role] && data[role][docKey] !== undefined) {
      return !!data[role][docKey];
    }
    return true;
  }
  
  if ((role === 'DOCUMENT' || role === ROLES.DOCUMENT) && (docKey === 'misquery' || docKey === 'tracking' || docKey === 'stores-indent' || docKey === 'stores-issue' || docKey === 'stock' || docKey === 'work-in-progress' || docKey === 'day-book' || docKey === 'work-flow' || docKey === 'workflow-order-summary' || docKey === 'workflow-summary' || docKey === 'workflow-pending-orders' || docKey === 'workflow-process-iss-rec' || docKey === 'workflow-receipt-status' || docKey === 'workflow-issue-summary' || docKey === 'workflow-production-summary' || docKey === 'logistics' || docKey === 'logistics-order-summary' || docKey === 'logistics-invoice-summary' || docKey === 'register-invoice-register' || docKey === 'logistics-invoice-detail' || docKey === 'logistics-despatch-statement' || docKey === 'logistics-commission-register' || docKey === 'logistics-inv-profit-statement')) {
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
    'doc-transport': 'doc-transport',
    'fob-cost': 'fob-cost',
    'payment-realisation': 'payment-realisation',
    'foreign-currency': 'foreign-currency',
    'brc': 'brc',
    'documents-reports': 'documents-reports',
    'documents-team': 'documents-team',
    'misquery': 'misquery',
    'analysis': 'misquery',
    'inventory': 'misquery',
    'tracking': 'tracking',
    'stores-indent': 'stores-indent',
    'stores-issue': 'stores-issue',
    'stock': 'stock',
    'work-in-progress': 'work-in-progress',
    'day-book': 'day-book',
    'work-flow': 'misquery',
    'workflow-order-summary': 'workflow-order-summary',
    'workflow-summary': 'workflow-summary',
    'workflow-pending-orders': 'workflow-pending-orders',
    'workflow-process-iss-rec': 'workflow-process-iss-rec',
    'workflow-receipt-status': 'workflow-receipt-status',
    'workflow-issue-summary': 'workflow-issue-summary',
    'workflow-production-summary': 'workflow-production-summary',
    'logistics': 'misquery',
    'logistics-order-summary': 'logistics-order-summary',
    'logistics-invoice-summary': 'logistics-invoice-summary',
    'register-invoice-register': 'register-invoice-register',
    'logistics-invoice-detail': 'logistics-invoice-detail',
    'logistics-despatch-statement': 'logistics-despatch-statement',
    'logistics-commission-register': 'logistics-commission-register',
    'logistics-inv-profit-statement': 'logistics-inv-profit-statement',
  };
  return map[menuKey] || null;
}