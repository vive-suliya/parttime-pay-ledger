export interface Employee {
  id: string;
  name: string;
}

export interface WorkRecord {
  id: string;
  date: string; // YYYY-MM-DD format
  employeeId: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface SalaryInfo {
  totalHours: number;
  totalSalary: number;
  taxDeduction: number;
  netSalary: number;
}

export interface EmployeeSalary {
  employee: Employee;
  salaryInfo: SalaryInfo;
  workRecords: WorkRecord[];
}

export interface QuickTimeSettings {
  morning: {
    startTime: { hours: number; minutes: number };
    endTime: { hours: number; minutes: number };
  };
  lunch: {
    startTime: { hours: number; minutes: number };
    endTime: { hours: number; minutes: number };
  };
  dinner: {
    startTime: { hours: number; minutes: number };
    endTime: { hours: number; minutes: number };
  };
}
