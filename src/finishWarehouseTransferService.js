// LocalStorage service for Finish Warehouse Transfer module
import { MOCK_FINISH_TRANSFERS } from './finishWarehouseTransferConfig.js';

const STORAGE_KEY = 'frontier_finish_warehouse_transfers_v1';

export function listFinishWarehouseTransfers() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_FINISH_TRANSFERS));
    return MOCK_FINISH_TRANSFERS;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse finish warehouse transfers from storage', e);
    return MOCK_FINISH_TRANSFERS;
  }
}

export function saveFinishWarehouseTransfer(record) {
  const list = listFinishWarehouseTransfers();
  let updated;
  if (record.id) {
    updated = list.map(item => (item.id === record.id ? { ...item, ...record } : item));
  } else {
    const newId = Date.now();
    const transNo = record.transNo || `FWT-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord = { ...record, id: newId, transNo };
    updated = [newRecord, ...list];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteFinishWarehouseTransfer(id) {
  const list = listFinishWarehouseTransfers();
  const updated = list.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
