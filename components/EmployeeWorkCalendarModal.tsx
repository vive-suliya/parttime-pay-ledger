import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Employee, WorkRecord } from '../types';
import { getWorkRecordsByMonth } from '../utils/storage';
import { calculateWorkHours } from '../utils/dateUtils';
import { getCurrentMonth } from '../utils/dateUtils';
import { SimpleCalendar } from './SimpleCalendar';

interface EmployeeWorkCalendarModalProps {
  visible: boolean;
  employee: Employee | null;
  onClose: () => void;
}

export const EmployeeWorkCalendarModal: React.FC<EmployeeWorkCalendarModalProps> = ({
  visible,
  employee,
  onClose,
}) => {
  const [markedDates, setMarkedDates] = useState<Record<string, { marked: boolean }>>({});
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);

  useEffect(() => {
    if (visible && employee) {
      loadWorkRecords();
    }
  }, [visible, employee]);

  // visible이 변경될 때마다 데이터 새로고침
  useEffect(() => {
    if (visible && employee) {
      loadWorkRecords();
    }
  }, [visible]);

  const loadWorkRecords = async () => {
    if (!employee) return;

    const currentMonth = getCurrentMonth();
    const records = await getWorkRecordsByMonth(
      currentMonth.year,
      currentMonth.month
    );

    const employeeRecords = records.filter(
      (r) => r.employeeId === employee.id
    );
    setWorkRecords(employeeRecords);

    const marked: Record<string, { marked: boolean }> = {};
    employeeRecords.forEach((record) => {
      const dateStr = String(record.date || '');
      if (dateStr && dateStr.length === 10) {
        marked[dateStr] = {
          marked: true,
        };
      }
    });

    setMarkedDates(marked);
  };

  const formatHours = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) {
      return `${h}시간`;
    }
    return `${h}시간 ${m}분`;
  };

  const totalHours = workRecords.reduce((sum, record) => {
    return sum + calculateWorkHours(record.startTime, record.endTime);
  }, 0);

  if (!employee) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{employee.name} 근무 내역</Text>
            <Text style={styles.modalSubtitle}>
              총 근무 시간: {formatHours(totalHours)}
            </Text>
          </View>

          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.calendarContainer}>
              <SimpleCalendar
                onDayPress={() => { }}
                markedDates={markedDates}
              />
            </View>

            <View style={styles.workListContainer}>
              <Text style={styles.workListTitle}>근무 일정</Text>
              {workRecords.length === 0 ? (
                <Text style={styles.emptyText}>이번달 근무 기록이 없습니다.</Text>
              ) : (
                <View style={styles.workList}>
                  {workRecords.map((record) => {
                    const hours = calculateWorkHours(record.startTime, record.endTime);
                    return (
                      <View key={record.id} style={styles.workItem}>
                        <Text style={styles.workDate}>{record.date}</Text>
                        <Text style={styles.workTime}>
                          {record.startTime} ~ {record.endTime}
                        </Text>
                        <Text style={styles.workHours}>{formatHours(hours)}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '85%',
    padding: 20,
    flexDirection: 'column',
  },
  modalHeader: {
    marginBottom: 15,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  calendarContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    marginBottom: 15,
    padding: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  scrollContainer: {
    flexGrow: 1,
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  dateHoursContainer: {
    marginBottom: 20,
  },
  dateHoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  dateHoursList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateHoursItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: '30%',
    marginRight: 8,
    marginBottom: 8,
  },
  dateHoursDate: {
    fontSize: 12,
    color: '#666',
    marginRight: 6,
  },
  dateHoursValue: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  workListContainer: {
    marginBottom: 20,
  },
  workListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  workList: {
    // 스크롤뷰 안에서 전체 표시
  },
  workItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  workDate: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
  },
  workTime: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  workHours: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  calendarPlaceholder: {
    padding: 20,
    alignItems: 'center',
  },
  calendarPlaceholderText: {
    fontSize: 16,
    color: '#666',
  },
});
