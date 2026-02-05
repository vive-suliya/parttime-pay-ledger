import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TimeSlider } from './TimeSlider';
import { Employee, WorkRecord, QuickTimeSettings } from '../types';
import { formatTime, parseTime } from '../utils/dateUtils';
import { addWorkRecord, updateWorkRecord, getWorkRecordsByDate, getQuickTimeSettings } from '../utils/storage';

interface WorkRecordModalProps {
  visible: boolean;
  date: string;
  employees: Employee[];
  onClose: () => void;
  onSave: () => void;
  editingRecord?: WorkRecord | null;
}

export const WorkRecordModal: React.FC<WorkRecordModalProps> = ({
  visible,
  date,
  employees,
  onClose,
  onSave,
  editingRecord,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [startHours, setStartHours] = useState(9);
  const [startMinutes, setStartMinutes] = useState(0);
  const [endHours, setEndHours] = useState(18);
  const [endMinutes, setEndMinutes] = useState(0);
  const [quickTimes, setQuickTimes] = useState<QuickTimeSettings>({
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
  });

  useEffect(() => {
    if (visible) {
      loadQuickTimes();
      if (editingRecord) {
        setSelectedEmployeeId(editingRecord.employeeId);
        const start = parseTime(editingRecord.startTime);
        const end = parseTime(editingRecord.endTime);
        setStartHours(start.hours);
        setStartMinutes(start.minutes);
        setEndHours(end.hours);
        setEndMinutes(end.minutes);
      } else {
        // 새로 추가된 직원이 있으면 첫 번째 직원 선택
        if (employees.length > 0) {
          setSelectedEmployeeId(employees[0].id);
        } else {
          setSelectedEmployeeId('');
        }
        setStartHours(9);
        setStartMinutes(0);
        setEndHours(18);
        setEndMinutes(0);
      }
    }
  }, [visible, editingRecord, employees]);

  const loadQuickTimes = async () => {
    try {
      const settings = await getQuickTimeSettings();
      // 설정이 올바른 형식인지 확인
      if (settings &&
        settings.morning && settings.morning.startTime && settings.morning.endTime &&
        settings.lunch && settings.lunch.startTime && settings.lunch.endTime &&
        settings.dinner && settings.dinner.startTime && settings.dinner.endTime) {
        setQuickTimes(settings);
      } else {
        console.warn('Invalid quick time settings format, using defaults');
        // 기본값 설정
        setQuickTimes({
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
        });
      }
    } catch (error) {
      console.error('Error loading quick times:', error);
      // 기본값 설정
      setQuickTimes({
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
      });
    }
  };

  const handleQuickTime = (type: 'morning' | 'lunch' | 'dinner') => {
    try {
      if (!quickTimes || !quickTimes[type]) {
        console.warn('Quick times not loaded yet');
        return;
      }

      const time = quickTimes[type];
      if (time && time.startTime && time.endTime) {
        const startHours = time.startTime.hours ?? 9;
        const startMinutes = time.startTime.minutes ?? 0;
        const endHours = time.endTime.hours ?? 18;
        const endMinutes = time.endTime.minutes ?? 0;

        setStartHours(startHours);
        setStartMinutes(startMinutes);
        setEndHours(endHours);
        setEndMinutes(endMinutes);
      }
    } catch (error) {
      console.error('Error handling quick time:', error);
      // 기본값으로 설정
      setStartHours(9);
      setStartMinutes(0);
      setEndHours(18);
      setEndMinutes(0);
    }
  };

  const handleSave = async () => {
    if (!selectedEmployeeId) {
      Alert.alert('오류', '직원을 선택해주세요.');
      return;
    }

    const startTime = formatTime(startHours, startMinutes);
    const endTime = formatTime(endHours, endMinutes);

    // Validate time (allow overnight work)
    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;
    // Allow same time or end before start (overnight work)
    if (endTotal === startTotal) {
      Alert.alert('오류', '시작 시간과 종료 시간이 같을 수 없습니다.');
      return;
    }

    const record: WorkRecord = {
      id: editingRecord?.id || `${date}-${selectedEmployeeId}-${Date.now()}`,
      date,
      employeeId: selectedEmployeeId,
      startTime,
      endTime,
    };

    if (editingRecord) {
      await updateWorkRecord(record);
    } else {
      await addWorkRecord(record);
    }

    onSave();
    onClose();
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
            <Text style={styles.modalTitle}>
              {editingRecord ? '근무 기록 수정' : '근무 기록 추가'}
            </Text>
            <Text style={styles.modalDate}>{date}</Text>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>직원 선택</Text>
              <Picker
                selectedValue={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
                style={styles.picker}
              >
                {employees.map((emp) => (
                  <Picker.Item key={emp.id} label={emp.name} value={emp.id} />
                ))}
              </Picker>
            </View>

            <View style={styles.quickTimeContainer}>
              <Text style={styles.quickTimeLabel}>빠른 시간 설정</Text>
              <View style={styles.quickTimeButtons}>
                <TouchableOpacity
                  style={styles.quickTimeButton}
                  onPress={() => {
                    try {
                      handleQuickTime('morning');
                    } catch (error) {
                      console.error('Error in morning button:', error);
                    }
                  }}
                >
                  <Text style={styles.quickTimeButtonText}>🌅 아침</Text>
                  <Text style={styles.quickTimeButtonTime}>
                    {(() => {
                      try {
                        if (quickTimes?.morning?.startTime && quickTimes?.morning?.endTime) {
                          return `${formatTime(quickTimes.morning.startTime.hours || 9, quickTimes.morning.startTime.minutes || 0)} ~ ${formatTime(quickTimes.morning.endTime.hours || 12, quickTimes.morning.endTime.minutes || 0)}`;
                        }
                      } catch (e) {
                        console.error('Error formatting morning time:', e);
                      }
                      return '09:00 ~ 12:00';
                    })()}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickTimeButton}
                  onPress={() => {
                    try {
                      handleQuickTime('lunch');
                    } catch (error) {
                      console.error('Error in lunch button:', error);
                    }
                  }}
                >
                  <Text style={styles.quickTimeButtonText}>🍽️ 점심</Text>
                  <Text style={styles.quickTimeButtonTime}>
                    {(() => {
                      try {
                        if (quickTimes?.lunch?.startTime && quickTimes?.lunch?.endTime) {
                          return `${formatTime(quickTimes.lunch.startTime.hours || 12, quickTimes.lunch.startTime.minutes || 0)} ~ ${formatTime(quickTimes.lunch.endTime.hours || 15, quickTimes.lunch.endTime.minutes || 0)}`;
                        }
                      } catch (e) {
                        console.error('Error formatting lunch time:', e);
                      }
                      return '12:00 ~ 15:00';
                    })()}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickTimeButton, { marginRight: 0 }]}
                  onPress={() => {
                    try {
                      handleQuickTime('dinner');
                    } catch (error) {
                      console.error('Error in dinner button:', error);
                    }
                  }}
                >
                  <Text style={styles.quickTimeButtonText}>🌙 저녁</Text>
                  <Text style={styles.quickTimeButtonTime}>
                    {(() => {
                      try {
                        if (quickTimes?.dinner?.startTime && quickTimes?.dinner?.endTime) {
                          return `${formatTime(quickTimes.dinner.startTime.hours || 18, quickTimes.dinner.startTime.minutes || 0)} ~ ${formatTime(quickTimes.dinner.endTime.hours || 21, quickTimes.dinner.endTime.minutes || 0)}`;
                        }
                      } catch (e) {
                        console.error('Error formatting dinner time:', e);
                      }
                      return '18:00 ~ 21:00';
                    })()}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TimeSlider
              label="근무 시작 시간"
              hours={startHours}
              minutes={startMinutes}
              onTimeChange={(h, m) => {
                setStartHours(h);
                setStartMinutes(m);
              }}
            />

            <TimeSlider
              label="근무 종료 시간"
              hours={endHours}
              minutes={endMinutes}
              onTimeChange={(h, m) => {
                setEndHours(h);
                setEndMinutes(m);
              }}
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>저장</Text>
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    padding: 22,
    borderBottomWidth: 2,
    borderBottomColor: '#F0E6D8',
    backgroundColor: '#FFF8F0',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalDate: {
    fontSize: 17,
    color: '#666666',
    marginTop: 6,
    fontWeight: '500',
  },
  modalBody: {
    padding: 22,
  },
  pickerContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333333',
  },
  picker: {
    backgroundColor: '#FFF8F0',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#F0E6D8',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: '#F0E6D8',
    backgroundColor: '#FFF8F0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 18,
    backgroundColor: '#E0E0E0',
    borderRadius: 14,
    marginRight: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 18,
    backgroundColor: '#2E7D32',
    borderRadius: 14,
    marginLeft: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quickTimeContainer: {
    marginBottom: 24,
    padding: 18,
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F0E6D8',
  },
  quickTimeLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 14,
  },
  quickTimeButtons: {
    flexDirection: 'row',
  },
  quickTimeButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F0E6D8',
    marginRight: 10,
  },
  quickTimeButtonText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 6,
    fontWeight: '600',
  },
  quickTimeButtonTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E65100',
    marginTop: 4,
  },
});
