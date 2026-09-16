/**
 * Requisition data service (Purchase & Stores > Purchase > Requisition).
 *
 * localStorage-backed persistence boundary, same pattern as src/customerService.js.
 * The documented backend API can replace this file without touching the UI.
 *
 * @typedef {{
 *   id: string,
 *   requisitionNo: string,
 *   orderNo: string,
 *   date: string,
 *   orderType: string,
 *   reqType: string,
 *   unitOrSupplier: string,
 *   budget: number,
 *   approved: boolean,
 *   mailApproved: boolean
 * }} Requisition
 *
 * @typedef {{
 *   orderNo: string,
 *   refNo: string,
 *   style: string,
 *   customer: string,
 *   merchandiser: string,
 *   orderType: string
 * }} OrderLookupRow
 */

const KEY = 'fk_requisitions';

/** @type {Requisition[]} */
const seedRows = [
  { id: 'R1', requisitionNo: 'RQ-1001', orderNo: 'ORD-2001', date: '2026-09-01', orderType: 'BULK', reqType: 'UNIT', unitOrSupplier: 'Unit 1', budget: 12500, approved: true, mailApproved: false },
  { id: 'R2', requisitionNo: 'RQ-1002', orderNo: 'ORD-2002', date: '2026-09-03', orderType: 'SAMPLE', reqType: 'UNIT', unitOrSupplier: 'Unit 2', budget: 2400, approved: true, mailApproved: true },
  { id: 'R3', requisitionNo: 'RQ-1003', orderNo: 'ORD-2003', date: '2026-09-05', orderType: 'WAREHOUSE', reqType: 'SUPPLIER', unitOrSupplier: 'Karachi Dyeing', budget: 8600, approved: false, mailApproved: false },
  { id: 'R4', requisitionNo: 'RQ-1004', orderNo: 'ORD-2001', date: '2026-09-08', orderType: 'BULK', reqType: 'SUPPLIER', unitOrSupplier: 'Sialkot Fabric', budget: 15250, approved: true, mailApproved: false },
  { id: 'R5', requisitionNo: 'RQ-1005', orderNo: 'ORD-2004', date: '2026-09-10', orderType: 'GROUP', reqType: 'UNIT', unitOrSupplier: 'Unit 1', budget: 4300, approved: false, mailApproved: false },
  { id: 'R6', requisitionNo: 'RQ-1006', orderNo: 'ORD-2002', date: '2026-09-12', orderType: 'SAMPLE', reqType: 'SUPPLIER', unitOrSupplier: 'Lahore Trims', budget: 980, approved: true, mailApproved: false },
];

/** @type {OrderLookupRow[]} */
export const REQUISITION_SAMPLE_ORDERS = [
  { orderNo: 'ORD-2001', refNo: 'REF-901', style: 'ST-1001', customer: 'H&M', merchandiser: 'Sana Malik', orderType: 'BULK' },
  { orderNo: 'ORD-2002', refNo: 'REF-902', style: 'ST-1002', customer: 'Next', merchandiser: 'Ahmed Raza', orderType: 'SAMPLE' },
  { orderNo: 'ORD-2003', refNo: 'REF-903', style: 'ST-1003', customer: 'Zara', merchandiser: 'Ali Hassan', orderType: 'WAREHOUSE' },
  { orderNo: 'ORD-2004', refNo: 'REF-904', style: 'ST-1004', customer: 'Target', merchandiser: 'Sana Malik', orderType: 'GROUP' },
];

/** @returns {Requisition[]} */
function read() {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(rows) {
  try {
    localStorage.setItem(KEY, JSON.stringify(rows));
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, msg: 'Could not save requisition data.' };
  }
}

/** List requisitions; seeds sample rows on very first open. */
export function listRequisitions() {
  const arr = read();
  return arr.length ? arr : JSON.parse(JSON.stringify(seedRows));
}

/** Persist the full requisition set after edits (mail flags, new rows…). */
export function saveRequisitions(rows) {
  return write(rows);
}

/** Order lookup source: live "fk_orders" when present, else sample rows. */
export function loadOrderLookup() {
  try {
    const raw = localStorage.getItem('fk_orders');
    const saved = raw ? JSON.parse(raw) : null;
    if (Array.isArray(saved) && saved.length) {
      return saved.map((o) => ({
        orderNo: o.style || o.orderNo || '',
        refNo: o.refNo || (o.style || ''),
        style: o.style || '',
        customer: o.buyer || '',
        merchandiser: o.merchandiser || '',
        orderType: o.orderType || '',
      }));
    }
  } catch {
    /* fall through to samples */
  }
  return REQUISITION_SAMPLE_ORDERS;
}