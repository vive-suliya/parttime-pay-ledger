import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Employee, WorkRecord } from '../types';
import { getWorkRecordsByDate, deleteWorkRecord } from '../utils/storage';
import { calculateWorkHours } from '../utils/dateUtils';

interface WorkRecordListModalProps {
  visible: boolean;
  date: string;
  employees: Employee[];
  onClose: () => void;
  onAdd: () => void;
  onEdit: (record: WorkRecord) => void;
  onRefresh: () => void;
}

export const WorkRecordListModal: React.FC<WorkRecordListModalProps> = ({
  visible,
  date,
  employees,
  onClose,
  onAdd,
  onEdit,
  onRefresh,
}) => {
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);

  useEffect(() => {
    if (visible) {
      loadWorkRecords();
    }
  }, [visible, date]);

  const loadWorkRecords = async () => {
    try {
      const records = await getWorkRecordsByDate(date);
      setWorkRecords(records || []);
    } catch (error) {
      console.error('Error loading work records:', error);
      setWorkRecords([]);
    }
  };

  const handleDelete = async (recordId: string) => {
    await deleteWorkRecord(recordId);
    await loadWorkRecords();
    onRefresh();
  };

  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee ? employee.name : '알 수 없음';
  };

  const formatHours = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) {
      return `${h}시간`;
    }
    return `${h}시간 ${m}분`;
  };

  const renderWorkRecord = ({ item }: { item: WorkRecord }) => {
    const hours = calculateWorkHours(item.startTime, item.endTime);
    const employeeName = getEmployeeName(item.employeeId);

    return (
      <View style={styles.recordItem}>
        <View style={styles.recordInfo}>
          <Text style={styles.employeeName}>{employeeName}</Text>
          <Text style={styles.workTime}>
            {item.startTime} ~ {item.endTime}
          </Text>
          <Text style={styles.workHours}>{formatHours(hours)}</Text>
        </View>
        <View style={styles.recordActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              onEdit(item);
              onClose();
            }}
          >
            <Text style={styles.editButtonText}>수정</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.deleteButtonText}>삭제</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
            <Text style={styles.modalTitle}>{date} 근무 내역</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={workRecords}
            renderItem={renderWorkRecord}
            keyExtractor={(item) => item.id}
            style={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>등록된 근무 기록이 없습니다</Text>
              </View>
            }
          />

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.addButton} onPress={onAdd}>
              <Text style={styles.addButtonText}>+ 근무 내역 추가</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  list: {
    maxHeight: 400,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recordInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  workTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  workHours: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  recordActions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
