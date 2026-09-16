// General Invoice Service — LocalStorage CRUD with mock seed data
import { MOCK_GENERAL_INVOICES } from './generalInvoiceConfig';

const STORAGE_KEY = 'fk_general_invoices';

export function listGeneralInvoices() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_GENERAL_INVOICES));
      return MOCK_GENERAL_INVOICES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    // If empty array or invalid, seed default mock data so table always displays items
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_GENERAL_INVOICES));
    return MOCK_GENERAL_INVOICES;
  } catch (err) {
    console.error('Error reading general invoices from localStorage:', err);
    return MOCK_GENERAL_INVOICES;
  }
}

export function saveGeneralInvoice(invoice) {
  try {
    const current = listGeneralInvoices();
    let updated;
    if (invoice.id) {
      updated = current.map((item) => (item.id === invoice.id ? { ...item, ...invoice } : item));
    } else {
      const newRecord = {
        ...invoice,
        id: 'ginv-' + Date.now(),
        approval: invoice.approval || 'Approved',
      };
      updated = [newRecord, ...current];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { ok: true, msg: `General Invoice "${invoice.invoiceNo}" saved successfully!` };
  } catch (err) {
    console.error('Error saving general invoice:', err);
    return { ok: false, msg: 'Failed to save general invoice.' };
  }
}

export function deleteGeneralInvoice(id) {
  try {
    const current = listGeneralInvoices();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { ok: true, msg: 'General Invoice deleted successfully.' };
  } catch (err) {
    console.error('Error deleting general invoice:', err);
    return { ok: false, msg: 'Failed to delete general invoice.' };
  }
}
