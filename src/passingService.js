// Passing (Bill Approval) Service for storage management

import { INITIAL_PASSING_RECORDS } from './passingConfig';

const STORAGE_KEY = 'fks_passing_records_v1';

export const getPassingRecords = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PASSING_RECORDS));
      return INITIAL_PASSING_RECORDS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load passing records', err);
    return INITIAL_PASSING_RECORDS;
  }
};

export const savePassingRecords = (records) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save passing records', err);
  }
};

export const addPassingRecord = (record) => {
  const records = getPassingRecords();
  const nextId = records.length > 0 ? Math.max(...records.map((r) => r.id || 0)) + 1 : 1;
  const nextNoNum = records.length + 1;
  const billApprovalNo = record.billApprovalNo || `FKS/BAP${String(nextNoNum).padStart(5, '0')}`;
  
  const newRecord = {
    ...record,
    id: nextId,
    billApprovalNo,
    approvalDate: record.approvalDate || new Date().toISOString().split('T')[0],
  };

  const updated = [newRecord, ...records];
  savePassingRecords(updated);
  return newRecord;
};

export const updatePassingRecord = (id, updatedFields) => {
  const records = getPassingRecords();
  const updated = records.map((rec) => (rec.id === id ? { ...rec, ...updatedFields } : rec));
  savePassingRecords(updated);
  return updated;
};

export const deletePassingRecord = (id) => {
  const records = getPassingRecords();
  const updated = records.filter((rec) => rec.id !== id);
  savePassingRecords(updated);
  return updated;
};
