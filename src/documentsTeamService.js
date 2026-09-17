// Documents Team Data Service — LocalStorage persistence for all 11 sub-sections

import {
  INITIAL_ORDER_BOOKINGS,
  INITIAL_INVOICE_SHIPMENTS,
  INITIAL_SHIPPING_BILLS,
  INITIAL_FORWARDING,
  INITIAL_CLEARING,
  INITIAL_TRANSPORT,
  INITIAL_FOB_COST,
  INITIAL_PAYMENT_REALISATION,
  INITIAL_FOREIGN_CURRENCY,
  INITIAL_BRC,
} from './documentsTeamConfig';

const KEYS = {
  'order-booking': 'fk_docteam_order_booking',
  'invoice-shipment': 'fk_docteam_invoice_shipment',
  'shipping-bill': 'fk_docteam_shipping_bill',
  'forwarding': 'fk_docteam_forwarding',
  'clearing': 'fk_docteam_clearing',
  'transport': 'fk_docteam_transport',
  'fob-cost': 'fk_docteam_fob_cost',
  'payment-realisation': 'fk_docteam_payment_realisation',
  'foreign-currency': 'fk_docteam_foreign_currency',
  'brc': 'fk_docteam_brc',
};

const SEEDS = {
  'order-booking': INITIAL_ORDER_BOOKINGS,
  'invoice-shipment': INITIAL_INVOICE_SHIPMENTS,
  'shipping-bill': INITIAL_SHIPPING_BILLS,
  'forwarding': INITIAL_FORWARDING,
  'clearing': INITIAL_CLEARING,
  'transport': INITIAL_TRANSPORT,
  'fob-cost': INITIAL_FOB_COST,
  'payment-realisation': INITIAL_PAYMENT_REALISATION,
  'foreign-currency': INITIAL_FOREIGN_CURRENCY,
  'brc': INITIAL_BRC,
};

export function listDocTeamSection(sectionKey) {
  const key = KEYS[sectionKey];
  const seed = SEEDS[sectionKey] || [];
  if (!key) return seed;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  } catch (err) {
    console.error(`Error reading ${sectionKey} from localStorage:`, err);
    return seed;
  }
}

export function saveDocTeamRecord(sectionKey, record) {
  const key = KEYS[sectionKey];
  if (!key) return { ok: false, msg: 'Invalid section' };

  try {
    const records = listDocTeamSection(sectionKey);
    let updated;
    if (record.id) {
      updated = records.map((r) => (r.id === record.id ? { ...r, ...record } : r));
    } else {
      const newRec = {
        ...record,
        id: `${sectionKey.slice(0, 3)}-${Date.now()}`,
        sNo: record.sNo || String(records.length + 1),
      };
      updated = [...records, newRec];
    }
    localStorage.setItem(key, JSON.stringify(updated));
    return { ok: true, msg: 'Record saved successfully!', updated };
  } catch (err) {
    console.error(`Error saving ${sectionKey} record:`, err);
    return { ok: false, msg: 'Failed to save record.' };
  }
}

export function deleteDocTeamRecord(sectionKey, id) {
  const key = KEYS[sectionKey];
  if (!key) return { ok: false, msg: 'Invalid section' };

  try {
    const records = listDocTeamSection(sectionKey);
    const updated = records.filter((r) => r.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
    return { ok: true, msg: 'Record deleted successfully!', updated };
  } catch (err) {
    console.error(`Error deleting ${sectionKey} record:`, err);
    return { ok: false, msg: 'Failed to delete record.' };
  }
}
