// LocalStorage Service for Bill Inward Module
import { MOCK_BILL_INWARDS } from './billInwardConfig';

const KEY = 'fk_bill_inward';

export function listBillInwards() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(MOCK_BILL_INWARDS));
      return MOCK_BILL_INWARDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : MOCK_BILL_INWARDS;
  } catch {
    return MOCK_BILL_INWARDS;
  }
}

export function saveBillInward(record) {
  try {
    const records = listBillInwards();
    const existingIndex = records.findIndex((r) => r.id === record.id || r.billInwNo === record.billInwNo);

    if (existingIndex >= 0) {
      records[existingIndex] = { ...records[existingIndex], ...record };
    } else {
      const newRec = {
        ...record,
        id: record.id || `binw-${Date.now()}`,
        party: record.supplier || record.party || '',
      };
      records.unshift(newRec);
    }

    localStorage.setItem(KEY, JSON.stringify(records));
    return { ok: true, msg: `Bill Inward "${record.billInwNo}" saved successfully!` };
  } catch (e) {
    console.error(e);
    return { ok: false, msg: 'Failed to save Bill Inward.' };
  }
}

export function deleteBillInward(id) {
  try {
    const records = listBillInwards();
    const updated = records.filter((r) => r.id !== id);
    localStorage.setItem(KEY, JSON.stringify(updated));
    return { ok: true, msg: 'Bill Inward deleted successfully!' };
  } catch (e) {
    console.error(e);
    return { ok: false, msg: 'Failed to delete record.' };
  }
}
