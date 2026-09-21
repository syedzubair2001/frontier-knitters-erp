/**
 * Stock module data service — Purchase & Stores > Store > Stock.
 * localStorage-backed, same pattern as indentService.js.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * This is the ONE place where Stores and store-wise Stock live. The Stock
 * screen (pages/Stock.jsx) displays it, and the Indent screen FETCHES its
 * Store dropdown + Store/Stock-Type/Available-Qty values from here — no store
 * name is hard-coded inside the Indent screen any more. When the real SQL
 * backend arrives, only the read/write helpers below change.
 *
 * @typedef {{
 *   id: string, store: string, stockType: string, productNo: string,
 *   productName: string, productType: string, uom: string,
 *   qty: number, rate: number
 * }} StockRow
 */

import { PRODUCT_CATALOG } from './indentConfig';

const STORE_KEY = 'fk_stock_stores';
const ROW_KEY = 'fk_stock_rows';

/** Store master — every store that exists in the system (Stock screen list). */
const SEED_STORES = [
  'Main Store',
  'Yarn Store',
  'General Store',
  'Unit 1 Store',
  'Unit 2 Store',
  'Sub Store A',
  'Sub Store B',
  'Scrap Yard',
];

/** Stock types used by the Stock screen filter. */
export const STOCK_TYPES = ['Fresh', 'Damage', 'Scrap'];

/** Store-wise opening stock — the data the Indent screen fetches from. */
const SEED_ROWS = [
  { store: 'Yarn Store',    stockType: 'Fresh',  productNo: 'PRD-YRN-001', qty: 1250,  rate: 320 },
  { store: 'Yarn Store',    stockType: 'Fresh',  productNo: 'PRD-YRN-002', qty: 860,   rate: 295 },
  { store: 'Unit 2 Store',  stockType: 'Fresh',  productNo: 'PRD-YRN-002', qty: 240,   rate: 298 },
  { store: 'General Store', stockType: 'Fresh',  productNo: 'PRD-THD-001', qty: 480,   rate: 165 },
  { store: 'General Store', stockType: 'Fresh',  productNo: 'PRD-BTN-001', qty: 25000, rate: 3.2 },
  { store: 'Unit 1 Store',  stockType: 'Damage', productNo: 'PRD-BTN-001', qty: 900,   rate: 1.5 },
  { store: 'General Store', stockType: 'Fresh',  productNo: 'PRD-ZIP-001', qty: 12000, rate: 6.5 },
  { store: 'General Store', stockType: 'Fresh',  productNo: 'PRD-ELC-001', qty: 3400,  rate: 18 },
  { store: 'Sub Store A',   stockType: 'Fresh',  productNo: 'PRD-LBL-001', qty: 45000, rate: 1.1 },
  { store: 'Sub Store A',   stockType: 'Fresh',  productNo: 'PRD-BAG-001', qty: 30000, rate: 0.9 },
  { store: 'Scrap Yard',    stockType: 'Scrap',  productNo: 'PRD-BAG-001', qty: 150,   rate: 0.2 },
  { store: 'Main Store',    stockType: 'Fresh',  productNo: 'PRD-DYE-001', qty: 540,   rate: 480 },
  { store: 'Main Store',    stockType: 'Fresh',  productNo: 'PRD-A4S-001', qty: 120,   rate: 950 },
  { store: 'Main Store',    stockType: 'Fresh',  productNo: 'PRD-A4S-002', qty: 75,    rate: 1150 },
];

function readJSON(key) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return Array.isArray(v) ? v : null;
  } catch { return null; }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, msg: 'Could not save stock data.' };
  }
}

/** Full store master — never empty (falls back to the seeded list). */
export function listStores() {
  const stored = readJSON(STORE_KEY);
  const arr = (stored && stored.length ? stored : SEED_STORES)
    .map((s) => String(s).trim())
    .filter(Boolean);
  return arr.length ? arr : [...SEED_STORES];
}

/** Add a store to the master (Stock screen hooks in here). */
export function addStore(name) {
  const clean = String(name || '').trim();
  if (!clean) return { ok: false, msg: 'Store name is required.' };
  const all = listStores();
  if (all.includes(clean)) return { ok: false, msg: 'Store already exists.' };
  const w = writeJSON(STORE_KEY, [...all, clean]);
  if (!w.ok) return w;
  return { ok: true, msg: 'Store added ✅' };
}


/** Complete store-wise stock list (seeds + any catalog product not covered). */
function buildSeedRows() {
  const catByCode = new Map(PRODUCT_CATALOG.map((p) => [p.code, p]));
  const rows = SEED_ROWS.map((r, i) => {
    const prod = catByCode.get(r.productNo) || {};
    return {
      id: `ST${String(i + 1).padStart(3, '0')}`,
      store: r.store,
      stockType: r.stockType,
      productNo: r.productNo,
      productName: prod.name || r.productNo,
      productType: prod.type || 'General',
      uom: prod.uom || 'Pcs',
      qty: r.qty,
      rate: r.rate,
    };
  });

  // Every catalog product must exist in stock (even at nil balance), so the
  // Indent screen can always fetch a store + type for the picked product.
  const covered = new Set(rows.filter((r) => Number(r.qty) > 0).map((r) => r.productNo));
  PRODUCT_CATALOG.forEach((p) => {
    if (covered.has(p.code)) return;
    rows.push({
      id: `ST${String(rows.length + 1).padStart(3, '0')}`,
      store: 'Main Store',
      stockType: 'Fresh',
      productNo: p.code,
      productName: p.name,
      productType: p.type,
      uom: p.uom,
      qty: 0,
      rate: 0,
    });
  });
  return rows;
}

/** @returns {StockRow[]} Store-wise stock rows (Stock screen grid). */
export function listStockRows() {
  const stored = readJSON(ROW_KEY);
  if (stored && stored.length) return stored;
  return buildSeedRows();
}

/** Stores that actually hold stock rows — "which place has the item". */
export function storesWithStock() {
  const hit = new Set(listStockRows().filter((r) => Number(r.qty) > 0).map((r) => r.store));
  const ordered = listStores().filter((s) => hit.has(s));
  return ordered.length ? ordered : listStores();
}

/** All stock rows of one product, biggest balance first. */
export function getStockRowsForProduct(productNo) {
  return listStockRows()
    .filter((r) => r.productNo === productNo)
    .sort((a, b) => Number(b.qty) - Number(a.qty));
}

/**
 * Best stock record for a product — used by the Indent screen to FETCH the
 * Store, Stock Type and Available Qty when the user picks the product.
 * @returns {StockRow|null}
 */
export function getStockForProduct(productNo) {
  const rows = getStockRowsForProduct(productNo);
  return rows.length ? rows[0] : null;
}

/**
 * Stock record of one product in ONE store — lets the Indent screen re-fetch
 * Stock Type / Available Qty when the user switches the Store.
 * @returns {StockRow|null}
 */
export function getStockForProductInStore(productNo, store) {
  return listStockRows().find((r) => r.productNo === productNo && r.store === store) || null;
}

/** Store-wise totals for the summary strip. */
export function stockSummary() {
  const rows = listStockRows();
  return listStores().map((store) => {
    const mine = rows.filter((r) => r.store === store);
    return {
      store,
      items: mine.length,
      qty: mine.reduce((s, r) => s + Number(r.qty || 0), 0),
      value: mine.reduce((s, r) => s + Number(r.qty || 0) * Number(r.rate || 0), 0),
    };
  });
}
