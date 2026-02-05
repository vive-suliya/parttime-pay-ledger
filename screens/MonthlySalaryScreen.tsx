import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Employee, EmployeeSalary } from '../types';
import { getEmployees, getWorkRecordsByMonth } from '../utils/storage';
import { calculateEmployeeSalary, calculateMonthlyTotal } from '../utils/salaryCalculator';
import { getCurrentMonth } from '../utils/dateUtils';
import { EmployeeWorkCalendarModal } from '../components/EmployeeWorkCalendarModal';

interface MonthlySalaryScreenProps {
  route?: {
    params?: {
      initialMonth?: { year: number; month: number };
    };
  };
}

export const MonthlySalaryScreen: React.FC<MonthlySalaryScreenProps> = ({ route }) => {
  const [employeeSalaries, setEmployeeSalaries] = useState<EmployeeSalary[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(calculateMonthlyTotal([]));
  const [currentMonth, setCurrentMonth] = useState(
    route?.params?.initialMonth || getCurrentMonth()
  );
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);

  useEffect(() => {
    loadMonthlyData();
  }, [currentMonth]);

  const loadMonthlyData = async () => {
    const employees = await getEmployees();
    const workRecords = await getWorkRecordsByMonth(
      currentMonth.year,
      currentMonth.month
    );

    const salaries = employees.map((emp) =>
      calculateEmployeeSalary(emp, workRecords)
    );

    setEmployeeSalaries(salaries);
    setMonthlyTotal(calculateMonthlyTotal(salaries));
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  const formatHours = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}시간 ${m}분`;
  };

  const goToPreviousMonth = () => {
    if (currentMonth.month === 1) {
      setCurrentMonth({ year: currentMonth.year - 1, month: 12 });
    } else {
      setCurrentMonth({ ...currentMonth, month: currentMonth.month - 1 });
    }
  };

  const goToNextMonth = () => {
    if (currentMonth.month === 12) {
      setCurrentMonth({ year: currentMonth.year + 1, month: 1 });
    } else {
      setCurrentMonth({ ...currentMonth, month: currentMonth.month + 1 });
    }
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(getCurrentMonth());
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthNavButton}>
            <Text style={styles.monthNavButtonText}>{'<'}</Text>
          </TouchableOpacity>
          <View style={styles.monthDisplay}>
            <Text style={styles.title}>
              {currentMonth.year}년 {currentMonth.month}월 급여 내역
            </Text>
            <TouchableOpacity onPress={goToCurrentMonth} style={styles.todayButton}>
              <Text style={styles.todayButtonText}>오늘</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={goToNextMonth} style={styles.monthNavButton}>
            <Text style={styles.monthNavButtonText}>{'>'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>{currentMonth.month}월 총 급여</Text>
        <Text style={styles.totalAmount}>
          {formatCurrency(monthlyTotal.totalSalary)}
        </Text>
        <View style={styles.totalDetails}>
          <Text style={styles.totalDetailText}>
            총 근무 시간: {formatHours(monthlyTotal.totalHours)}
          </Text>
          <Text style={styles.totalDetailText}>
            소득세 공제 (3.3%): {formatCurrency(monthlyTotal.taxDeduction)}
          </Text>
          <Text style={styles.totalDetailText}>
            실지급액: {formatCurrency(monthlyTotal.netSalary)}
          </Text>
        </View>
      </View>

      <View style={styles.employeeSection}>
        <Text style={styles.sectionTitle}>직원별 상세 내역</Text>
        {employeeSalaries.map((empSalary) => (
          <TouchableOpacity
            key={empSalary.employee.id}
            style={styles.employeeCard}
            onPress={() => {
              setSelectedEmployee(empSalary.employee);
              setCalendarModalVisible(true);
            }}
          >
            <Text style={styles.employeeName}>{empSalary.employee.name}</Text>
            <View style={styles.employeeDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>근무 시간:</Text>
                <Text style={styles.detailValue}>
                  {formatHours(empSalary.salaryInfo.totalHours)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>지급 급여:</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(empSalary.salaryInfo.totalSalary)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>소득세 공제 (3.3%):</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(empSalary.salaryInfo.taxDeduction)}
                </Text>
              </View>
              <View style={[styles.detailRow, styles.netSalaryRow]}>
                <Text style={styles.netSalaryLabel}>실지급액:</Text>
                <Text style={styles.netSalaryValue}>
                  {formatCurrency(empSalary.salaryInfo.netSalary)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {employeeSalaries.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{currentMonth.month}월 근무 기록이 없습니다.</Text>
          </View>
        )}
      </View>

      <EmployeeWorkCalendarModal
        visible={calendarModalVisible}
        employee={selectedEmployee}
        onClose={() => {
          setCalendarModalVisible(false);
          setSelectedEmployee(null);
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F6',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthNavButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F4F6',
    borderRadius: 12,
  },
  monthNavButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  monthDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#191F28',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3182F6',
    borderRadius: 16,
  },
  todayButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  totalSection: {
    backgroundColor: '#3182F6',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    shadowColor: '#3182F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -1,
  },
  totalDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 14,
    borderRadius: 12,
  },
  totalDetailText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 6,
    fontWeight: '500',
  },
  employeeSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#191F28',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  employeeCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#191F28',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  employeeDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F2F4F6',
    paddingTop: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8B95A1',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191F28',
  },
  netSalaryRow: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F4F6',
  },
  netSalaryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#191F28',
  },
  netSalaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3182F6',
  },
  emptyContainer: {
    padding: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#8B95A1',
  },
});
