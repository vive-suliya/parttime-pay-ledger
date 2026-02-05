import AsyncStorage from '@react-native-async-storage/async-storage';
import { Employee, WorkRecord, QuickTimeSettings } from '../types';

const STORAGE_KEYS = {
  EMPLOYEES: 'employees',
  WORK_RECORDS: 'workRecords',
  QUICK_TIME_SETTINGS: 'quickTimeSettings',
};

// Employee storage
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting employees:', error);
    return [];
  }
};

export const saveEmployees = async (employees: Employee[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  } catch (error) {
    console.error('Error saving employees:', error);
  }
};

export const addEmployee = async (employee: Employee): Promise<void> => {
  const employees = await getEmployees();
  employees.push(employee);
  await saveEmployees(employees);
};

export const updateEmployee = async (employee: Employee): Promise<void> => {
  const employees = await getEmployees();
  const index = employees.findIndex((e) => e.id === employee.id);
  if (index !== -1) {
    employees[index] = employee;
    await saveEmployees(employees);
  }
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
  const employees = await getEmployees();
  const filtered = employees.filter((e) => e.id !== employeeId);
  await saveEmployees(filtered);
};

// WorkRecord storage
export const getWorkRecords = async (): Promise<WorkRecord[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.WORK_RECORDS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting work records:', error);
    return [];
  }
};

export const saveWorkRecords = async (records: WorkRecord[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.WORK_RECORDS, JSON.stringify(records));
  } catch (error) {
    console.error('Error saving work records:', error);
  }
};

export const addWorkRecord = async (record: WorkRecord): Promise<void> => {
  const records = await getWorkRecords();
  records.push(record);
  await saveWorkRecords(records);
};

export const updateWorkRecord = async (record: WorkRecord): Promise<void> => {
  const records = await getWorkRecords();
  const index = records.findIndex((r) => r.id === record.id);
  if (index !== -1) {
    records[index] = record;
    await saveWorkRecords(records);
  }
};

export const deleteWorkRecord = async (recordId: string): Promise<void> => {
  const records = await getWorkRecords();
  const filtered = records.filter((r) => r.id !== recordId);
  await saveWorkRecords(filtered);
};

export const getWorkRecordsByDate = async (date: string): Promise<WorkRecord[]> => {
  const records = await getWorkRecords();
  return records.filter((r) => r.date === date);
};

export const getWorkRecordsByMonth = async (year: number, month: number): Promise<WorkRecord[]> => {
  const records = await getWorkRecords();
  const monthStr = month.toString().padStart(2, '0');
  return records.filter((r) => {
    const recordDate = r.date.split('-');
    return recordDate[0] === year.toString() && recordDate[1] === monthStr;
  });
};

// QuickTimeSettings storage
export const getQuickTimeSettings = async (): Promise<QuickTimeSettings> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.QUICK_TIME_SETTINGS);
    if (data) {
      return JSON.parse(data);
    }
    // 기본값
    return {
      morning: {
        startTime: { hours: 9, minutes: 0 },
        endTime: { hours: 12, minutes: 0 },
      },
      lunch: {
        startTime: { hours: 12, minutes: 0 },
        endTime: { hours: 15, minutes: 0 },
      },
      dinner: {
        startTime: { hours: 18, minutes: 0 },
        endTime: { hours: 21, minutes: 0 },
      },
    };
  } catch (error) {
    console.error('Error getting quick time settings:', error);
    return {
      morning: {
        startTime: { hours: 9, minutes: 0 },
        endTime: { hours: 12, minutes: 0 },
      },
      lunch: {
        startTime: { hours: 12, minutes: 0 },
        endTime: { hours: 15, minutes: 0 },
      },
      dinner: {
        startTime: { hours: 18, minutes: 0 },
        endTime: { hours: 21, minutes: 0 },
      },
    };
  }
};

export const saveQuickTimeSettings = async (settings: QuickTimeSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.QUICK_TIME_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving quick time settings:', error);
  }
};
