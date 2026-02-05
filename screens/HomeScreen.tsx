import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { WorkRecordModal } from '../components/WorkRecordModal';
import { WorkRecordListModal } from '../components/WorkRecordListModal';
import { SimpleCalendar } from '../components/SimpleCalendar';
import { Employee, WorkRecord } from '../types';
import {
  getEmployees,
  getWorkRecordsByDate,
  getWorkRecordsByMonth,
} from '../utils/storage';
import { calculateMonthlyTotal, calculateEmployeeSalary } from '../utils/salaryCalculator';
import { formatDate, getCurrentMonth } from '../utils/dateUtils';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [listModalVisible, setListModalVisible] = useState(false);
  const [workRecordModalVisible, setWorkRecordModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WorkRecord | null>(null);
  const [monthlyTotal, setMonthlyTotal] = useState({ totalSalary: 0, taxDeduction: 0 });
  const [markedDates, setMarkedDates] = useState<Record<string, { marked: boolean }>>({});
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  useEffect(() => {
    loadData();
  }, []);

  // 화면이 포커스될 때마다 직원 목록을 다시 로드
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    if (employees.length > 0) {
      loadMonthlySummary();
      loadMarkedDates();
    }
  }, [employees, selectedMonth]);

  const loadData = async () => {
    const empData = await getEmployees();
    setEmployees(empData);
  };

  const loadMonthlySummary = async () => {
    if (employees.length === 0) return;

    const workRecords = await getWorkRecordsByMonth(
      selectedMonth.year,
      selectedMonth.month
    );

    const salaries = employees.map((emp) =>
      calculateEmployeeSalary(emp, workRecords)
    );

    const total = calculateMonthlyTotal(salaries);
    setMonthlyTotal({
      totalSalary: total.totalSalary,
      taxDeduction: total.taxDeduction,
    });
  };

  const loadMarkedDates = async () => {
    const workRecords = await getWorkRecordsByMonth(
      selectedMonth.year,
      selectedMonth.month
    );

    const marked: Record<string, { marked: boolean }> = {};
    workRecords.forEach((record) => {
      const dateStr = String(record.date || '');
      if (dateStr && dateStr.length === 10 && !marked[dateStr]) {
        marked[dateStr] = {
          marked: true,
        };
      }
    });

    setMarkedDates(marked);
  };


  const handleDayPress = async (day: any) => {
    const date = day.dateString;
    setSelectedDate(date);
    setListModalVisible(true);
  };

  const handleAddWorkRecord = () => {
    setEditingRecord(null);
    setWorkRecordModalVisible(true);
  };

  const handleEditWorkRecord = (record: WorkRecord) => {
    setEditingRecord(record);
    setWorkRecordModalVisible(true);
  };

  const handleModalSave = async () => {
    await loadMonthlySummary();
    await loadMarkedDates();
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.calendarContainer}>
          <SimpleCalendar
            onDayPress={(date) => handleDayPress({ dateString: date })}
            markedDates={markedDates}
            onMonthChange={(year, month) => {
              setSelectedMonth({ year, month });
            }}
            initialYear={selectedMonth.year}
            initialMonth={selectedMonth.month}
          />
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>총 지급 급여</Text>
            <Text style={styles.summaryAmount}>
              {formatCurrency(monthlyTotal.totalSalary)}
            </Text>
          </View>

          <View style={[styles.summaryCard, { marginRight: 0 }]}>
            <Text style={styles.summaryLabel}>실 지급액</Text>
            <Text style={styles.summaryTax}>
              {formatCurrency(monthlyTotal.totalSalary - monthlyTotal.taxDeduction)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.monthlyButton}
          onPress={() => navigation.navigate('MonthlySalary', { initialMonth: selectedMonth })}
        >
          <Text style={styles.monthlyButtonText}>이번달 얼마?</Text>
        </TouchableOpacity>
      </ScrollView>

      <WorkRecordListModal
        visible={listModalVisible}
        date={selectedDate}
        employees={employees}
        onClose={() => setListModalVisible(false)}
        onAdd={() => {
          setListModalVisible(false);
          handleAddWorkRecord();
        }}
        onEdit={handleEditWorkRecord}
        onRefresh={async () => {
          await handleModalSave();
        }}
      />

      <WorkRecordModal
        visible={workRecordModalVisible}
        date={selectedDate}
        employees={employees}
        onClose={() => {
          setWorkRecordModalVisible(false);
          setEditingRecord(null);
        }}
        onSave={async () => {
          await handleModalSave();
          setWorkRecordModalVisible(false);
          setListModalVisible(true);
        }}
        editingRecord={editingRecord}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F6',
  },
  scrollView: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginRight: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8B95A1',
    marginBottom: 8,
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3182F6',
    letterSpacing: -0.5,
  },
  summaryTax: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F04452',
    letterSpacing: -0.5,
  },
  monthlyButton: {
    backgroundColor: '#3182F6',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#3182F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  monthlyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  calendarPlaceholder: {
    padding: 24,
    alignItems: 'center',
  },
  calendarPlaceholderText: {
    fontSize: 16,
    color: '#8B95A1',
    marginBottom: 12,
  },
  dateButton: {
    backgroundColor: '#3182F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
  },
  dateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
