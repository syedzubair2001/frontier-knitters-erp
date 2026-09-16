/**
 * Indent data service — Purchase & Stores > Store > Indent.
 * localStorage-backed, same pattern as requisitionService.js.
 *
 * @typedef {{
 *   id: string,
 *   indentNo: string,
 *   date: string,
 *   refNo: string,
 *   unit: string,
 *   type: string,
 *   orderNo: string,
 *   indentBy: string,
 *   approved: boolean
 * }} Indent
 */

const KEY = 'fk_indents';

/** @type {Indent[]} */
const seedRows = [
  { id: 'IN1', indentNo: 'IND-1001', date: '2026-09-01', refNo: 'REF-001', unit: 'Unit 1', type: 'Direct',    orderNo: 'ORD-2001', indentBy: 'Ahmed Raza',  approved: true  },
  { id: 'IN2', indentNo: 'IND-1002', date: '2026-09-03', refNo: 'REF-002', unit: 'Unit 2', type: 'Indirect',  orderNo: 'ORD-2002', indentBy: 'Sana Malik',  approved: true  },
  { id: 'IN3', indentNo: 'IND-1003', date: '2026-09-05', refNo: 'REF-003', unit: 'Unit 1', type: 'Emergency', orderNo: 'ORD-2003', indentBy: 'Ali Hassan',  approved: false },
  { id: 'IN4', indentNo: 'IND-1004', date: '2026-09-08', refNo: 'REF-004', unit: 'Unit 2', type: 'Planned',   orderNo: 'ORD-2001', indentBy: 'Kamran Butt', approved: false },
  { id: 'IN5', indentNo: 'IND-1005', date: '2026-09-10', refNo: 'REF-005', unit: 'Unit 1', type: 'Direct',    orderNo: 'ORD-2004', indentBy: 'Sana Malik',  approved: true  },
  { id: 'IN6', indentNo: 'IND-1006', date: '2026-09-12', refNo: 'REF-006', unit: 'Unit 3', type: 'Indirect',  orderNo: 'ORD-2002', indentBy: 'Usman Tariq', approved: false },
];

/** @returns {Indent[]} */
function read() {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function write(rows) {
  try {
    localStorage.setItem(KEY, JSON.stringify(rows));
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, msg: 'Could not save indent data.' };
  }
}

/** List all indents; seeds sample rows on first open. */
export function listIndents() {
  const arr = read();
  return arr.length ? arr : JSON.parse(JSON.stringify(seedRows));
}

/** Get one indent by id. */
export function getIndent(id) {
  return read().find((r) => r.id === id);
}

/** Create or update an indent. */
export function saveIndent(indent) {
  const all = read().length ? read() : JSON.parse(JSON.stringify(seedRows));
  const now = new Date().toISOString();
  if (indent.id) {
    const idx = all.findIndex((r) => r.id === indent.id);
    if (idx >= 0) { all[idx] = { ...indent, updatedAt: now }; }
    else { all.push({ ...indent, createdAt: now }); }
  } else {
    all.push({ ...indent, id: `IN${Date.now().toString(36).toUpperCase()}`, createdAt: now });
  }
  const w = write(all);
  if (!w.ok) return w;
  return { ok: true, msg: indent.id ? 'Indent updated ✅' : 'Indent saved ✅' };
}

/** Delete an indent by id. */
export function deleteIndent(id) {
  const all = listIndents();
  const next = all.filter((r) => r.id !== id);
  if (next.length === all.length) return { ok: false, msg: 'Indent not found.' };
  const w = write(next);
  if (!w.ok) return w;
  return { ok: true, msg: 'Indent deleted.' };
}
