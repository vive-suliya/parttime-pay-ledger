import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TimeSliderProps {
  label: string;
  hours: number;
  minutes: number;
  onTimeChange: (hours: number, minutes: number) => void;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({
  label,
  hours,
  minutes,
  onTimeChange,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  });

  const formatTime = (h: number, m: number): string => {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (selectedDate) {
      const newHours = selectedDate.getHours();
      const newMinutes = selectedDate.getMinutes();
      setCurrentDate(selectedDate);
      onTimeChange(newHours, newMinutes);
    }
  };

  // hours나 minutes가 변경되면 currentDate 업데이트
  React.useEffect(() => {
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    setCurrentDate(date);
  }, [hours, minutes]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.timeButton}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.timeDisplay}>{formatTime(hours, minutes)}</Text>
        <Text style={styles.timeHint}>탭하여 시간 선택</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={currentDate}
          mode="time"
          is24Hour={Boolean(true)}
          display={Platform.OS === 'android' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
          style={styles.picker}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333333',
  },
  timeButton: {
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F0E6D8',
  },
  timeDisplay: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
  },
  timeHint: {
    fontSize: 15,
    color: '#888888',
    marginTop: 6,
    fontWeight: '500',
  },
  picker: {
    width: '100%',
  },
});
