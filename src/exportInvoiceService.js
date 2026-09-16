// Export Invoice Service — LocalStorage CRUD with mock seed data
import { MOCK_EXPORT_INVOICES } from './exportInvoiceConfig';

const STORAGE_KEY = 'fk_export_invoices';

export function listExportInvoices() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_EXPORT_INVOICES));
      return MOCK_EXPORT_INVOICES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_EXPORT_INVOICES));
    return MOCK_EXPORT_INVOICES;
  } catch (err) {
    console.error('Error reading export invoices from localStorage:', err);
    return MOCK_EXPORT_INVOICES;
  }
}

export function saveExportInvoice(record) {
  try {
    const current = listExportInvoices();
    let updated;
    if (record.id) {
      updated = current.map((item) => (item.id === record.id ? { ...item, ...record } : item));
    } else {
      const newRecord = {
        ...record,
        id: 'expinv-' + Date.now(),
        status: record.status || 'Pending',
      };
      updated = [newRecord, ...current];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { ok: true, msg: `Export Invoice "${record.exportInvNo}" saved successfully!` };
  } catch (err) {
    console.error('Error saving export invoice:', err);
    return { ok: false, msg: 'Failed to save export invoice.' };
  }
}

export function deleteExportInvoice(id) {
  try {
    const current = listExportInvoices();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { ok: true, msg: 'Export Invoice deleted successfully.' };
  } catch (err) {
    console.error('Error deleting export invoice:', err);
    return { ok: false, msg: 'Failed to delete export invoice.' };
  }
}
