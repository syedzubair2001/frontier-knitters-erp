// LocalStorage service for Accounts > Bills > Adjustment module
import { MOCK_ADJUSTMENTS, MOCK_PAYMENTS } from './accountsConfig.js';

const STORAGE_KEY = 'frontier_accounts_adjustments_v1';
const PAYMENT_STORAGE_KEY = 'frontier_accounts_payments_v1';

export function listAdjustments() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ADJUSTMENTS));
    return MOCK_ADJUSTMENTS;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse adjustments from storage', e);
    return MOCK_ADJUSTMENTS;
  }
}

export function saveAdjustment(record) {
  const list = listAdjustments();
  let updated;
  if (record.id) {
    updated = list.map(item => (item.id === record.id ? { ...item, ...record } : item));
  } else {
    const newId = Date.now();
    const voucherNo = record.voucherNo || `RCP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord = { ...record, id: newId, voucherNo };
    updated = [newRecord, ...list];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteAdjustment(id) {
  const list = listAdjustments();
  const updated = list.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/* ── PAYMENT SERVICE ── */
export function listPayments() {
  const raw = localStorage.getItem(PAYMENT_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(MOCK_PAYMENTS));
    return MOCK_PAYMENTS;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse payments from storage', e);
    return MOCK_PAYMENTS;
  }
}

export function savePayment(record) {
  const list = listPayments();
  let updated;
  if (record.id) {
    updated = list.map(item => (item.id === record.id ? { ...item, ...record } : item));
  } else {
    const newId = Date.now();
    const paymentNo = record.paymentNo || `FKS/PAY${String(Math.floor(10000 + Math.random() * 90000)).slice(0, 5)}`;
    const newRecord = { ...record, id: newId, paymentNo };
    updated = [newRecord, ...list];
  }
  localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deletePayment(id) {
  const list = listPayments();
  const updated = list.filter(item => item.id !== id);
  localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function toggleReleasePayment(id) {
  const list = listPayments();
  const updated = list.map(item => {
    if (item.id === id) {
      const nextStatus = item.status === 'Released' ? 'Pending' : 'Released';
      return { ...item, status: nextStatus };
    }
    return item;
  });
  localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

