import { WorkRecord, Employee, SalaryInfo, EmployeeSalary } from '../types';
import { calculateWorkHours } from './dateUtils';

const HOURLY_WAGE = 13000;
const TAX_RATE = 0.033; // 3.3%

export const calculateSalary = (workHours: number): SalaryInfo => {
  const totalSalary = workHours * HOURLY_WAGE;
  const taxDeduction = totalSalary * TAX_RATE;
  const netSalary = totalSalary - taxDeduction;
  
  return {
    totalHours: workHours,
    totalSalary: Math.round(totalSalary),
    taxDeduction: Math.round(taxDeduction),
    netSalary: Math.round(netSalary),
  };
};

export const calculateEmployeeSalary = (
  employee: Employee,
  workRecords: WorkRecord[]
): EmployeeSalary => {
  const employeeRecords = workRecords.filter((r) => r.employeeId === employee.id);
  
  let totalHours = 0;
  employeeRecords.forEach((record) => {
    totalHours += calculateWorkHours(record.startTime, record.endTime);
  });
  
  const salaryInfo = calculateSalary(totalHours);
  
  return {
    employee,
    salaryInfo,
    workRecords: employeeRecords,
  };
};

export const calculateMonthlyTotal = (employeeSalaries: EmployeeSalary[]): SalaryInfo => {
  let totalHours = 0;
  let totalSalary = 0;
  
  employeeSalaries.forEach((empSalary) => {
    totalHours += empSalary.salaryInfo.totalHours;
    totalSalary += empSalary.salaryInfo.totalSalary;
  });
  
  const taxDeduction = totalSalary * TAX_RATE;
  const netSalary = totalSalary - taxDeduction;
  
  return {
    totalHours,
    totalSalary: Math.round(totalSalary),
    taxDeduction: Math.round(taxDeduction),
    netSalary: Math.round(netSalary),
  };
};
