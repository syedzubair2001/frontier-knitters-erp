




// Sales & Despatch Service — LocalStorage CRUD with mock seed data
import { MOCK_DESPATCHES } from './salesConfig';

const STORAGE_KEY = 'fk_despatch_records';

export function listDespatches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DESPATCHES));
      return MOCK_DESPATCHES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DESPATCHES));
    return MOCK_DESPATCHES;
  } catch (err) {
    console.error('Error reading despatch records from localStorage:', err);
    return MOCK_DESPATCHES;
  }
}

export function saveDespatch(record) {
  try {
    const current = listDespatches();
    let updated;
    if (record.id) {
      updated = current.map((item) => (item.id === record.id ? { ...item, ...record } : item));
    } else {
      const newRecord = {
        ...record,
        id: 'dsp-' + Date.now(),
        approval: record.approval || 'Approved',
      };
      updated = [newRecord, ...current];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { ok: true, msg: `Despatch "${record.despatchNo}" saved successfully!` };
  } catch (err) {
    console.error('Error saving despatch record:', err);
    return { ok: false, msg: 'Failed to save despatch record.' };
  }
}

export function deleteDespatch(id) {
  try {
    const current = listDespatches();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { ok: true, msg: 'Despatch record deleted successfully.' };
  } catch (err) {
    console.error('Error deleting despatch record:', err);
    return { ok: false, msg: 'Failed to delete despatch record.' };
  }
}
