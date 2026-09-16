/**
 * Customer data service.
 *
 * Persistence boundary for the Customer module. Mirrors the pattern used by
 * src/auth.js (localStorage-backed storage methods returning {ok,msg,...}).
 * The documented REST API (docs/customer-api.md) maps 1:1 onto these methods,
 * so a real backend can replace this file without touching the UI.
 */
import { makeCustomer, makeAddress, validateCustomer } from './customerModel';

const KEY = 'fk_customers';

/** @returns {import('./customerModel').Customer[]} */
function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeAll(customers) {
  try {
    localStorage.setItem(KEY, JSON.stringify(customers));
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, msg: 'Could not save customer data. Storage may be full or unavailable.' };
  }
}

/** List all customers sorted by name (list view default). */
export function listCustomers() {
  return readAll().sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
}

/** Get one customer by id, or undefined. */
export function getCustomer(id) {
  return readAll().find((c) => c.id === id);
}

/**
 * Create or update a customer. All shared validation runs here (client side).
 * @param {import('./customerModel').Customer} input - customer fields (id set for updates)
 * @param {import('./customerModel').Address[]} addresses - address rows
 */
export function saveCustomer(input, addresses = []) {
  const now = new Date().toISOString();
  const customer = makeCustomer({
    ...input,
    addresses: (addresses || []).map((a) => makeAddress(a)),
  });

  const val = validateCustomer(customer);
  if (!val.ok) {
    return { ok: false, msg: 'Please fix the highlighted fields.', errors: val.errors };
  }

  const all = readAll();
  const idx = all.findIndex((c) => c.id === customer.id);
  if (idx >= 0) {
    customer.createdAt = all[idx].createdAt;
    customer.updatedAt = now;
    all[idx] = customer;
  } else {
    customer.id = customer.id || `CUS-${Date.now().toString(36).toUpperCase()}`;
    customer.createdAt = now;
    customer.updatedAt = now;
    all.push(customer);
  }

  const w = writeAll(all);
  if (!w.ok) return w;
  return { ok: true, msg: idx >= 0 ? 'Customer updated ✅' : 'Customer saved ✅', customer };
}

/** Delete a customer by id. */
export function deleteCustomer(id) {
  const all = readAll();
  const next = all.filter((c) => c.id !== id);
  if (next.length === all.length) return { ok: false, msg: 'Customer not found.' };
  const w = writeAll(next);
  if (!w.ok) return w;
  return { ok: true, msg: 'Customer deleted.' };
}