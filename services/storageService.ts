import { DailyRecord } from '../types';

const STORAGE_KEY = 'limbu_stall_records';

export const getRecords = (): DailyRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load records", error);
    return [];
  }
};

export const saveRecord = (record: DailyRecord): void => {
  const records = getRecords();
  // Check if record for this date already exists, update it if so, otherwise add new
  const index = records.findIndex(r => r.date === record.date);
  
  if (index >= 0) {
    records[index] = record;
  } else {
    records.push(record);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const deleteRecord = (id: string): void => {
  const records = getRecords();
  const newRecords = records.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
};

export const clearAllRecords = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};