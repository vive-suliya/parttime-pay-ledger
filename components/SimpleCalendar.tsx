import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SimpleCalendarProps {
  onDayPress: (date: string) => void;
  markedDates?: Record<string, { marked?: boolean }>;
  onMonthChange?: (year: number, month: number) => void;
  initialYear?: number;
  initialMonth?: number;
}

export const SimpleCalendar: React.FC<SimpleCalendarProps> = ({
  onDayPress,
  markedDates = {},
  onMonthChange,
  initialYear,
  initialMonth,
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = React.useState(
    initialMonth !== undefined ? initialMonth - 1 : today.getMonth()
  );
  const [currentYear, setCurrentYear] = React.useState(
    initialYear || today.getFullYear()
  );

  // initialYear나 initialMonth가 변경되면 업데이트
  React.useEffect(() => {
    if (initialYear !== undefined && initialMonth !== undefined) {
      setCurrentYear(initialYear);
      setCurrentMonth(initialMonth - 1);
    }
  }, [initialYear, initialMonth]);

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number): string => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  };

  const isToday = (year: number, month: number, day: number): boolean => {
    const today = new Date();
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    );
  };

  const isMarked = (dateStr: string): boolean => {
    return markedDates[dateStr]?.marked === true;
  };

  const goToPreviousMonth = () => {
    let newMonth = currentMonth;
    let newYear = currentYear;
    if (currentMonth === 0) {
      newMonth = 11;
      newYear = currentYear - 1;
    } else {
      newMonth = currentMonth - 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    if (onMonthChange) {
      onMonthChange(newYear, newMonth + 1);
    }
  };

  const goToNextMonth = () => {
    let newMonth = currentMonth;
    let newYear = currentYear;
    if (currentMonth === 11) {
      newMonth = 0;
      newYear = currentYear + 1;
    } else {
      newMonth = currentMonth + 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    if (onMonthChange) {
      onMonthChange(newYear, newMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    const newMonth = today.getMonth();
    const newYear = today.getFullYear();
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    if (onMonthChange) {
      onMonthChange(newYear, newMonth + 1);
    }
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const renderDays = () => {
    const days = [];
    const totalCells = 42; // 6주 * 7일

    // 빈 셀 (이전 달의 마지막 날들)
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell}>
          <Text style={styles.emptyDayText}></Text>
        </View>
      );
    }

    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(currentYear, currentMonth, day);
      const marked = isMarked(dateStr);
      const today = isToday(currentYear, currentMonth, day);

      days.push(
        <TouchableOpacity
          key={`day-${day}`}
          style={[
            styles.dayCell,
            today && styles.todayCell,
            marked && styles.markedCell,
          ]}
          onPress={() => onDayPress(dateStr)}
        >
          <Text
            style={[
              styles.dayText,
              today && styles.todayText,
              marked && styles.markedText,
            ]}
          >
            {day}
          </Text>
          {marked && <View style={styles.markedDot} />}
        </TouchableOpacity>
      );
    }

    // 나머지 빈 셀
    const remainingCells = totalCells - days.length;
    for (let i = 0; i < remainingCells; i++) {
      days.push(
        <View key={`empty-after-${i}`} style={styles.dayCell}>
          <Text style={styles.emptyDayText}></Text>
        </View>
      );
    }

    return days;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <View style={styles.monthYearContainer}>
          <Text style={styles.monthYearText}>{currentYear}년 {currentMonth + 1}월</Text>
          <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
            <Text style={styles.todayButtonText}>오늘</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekDaysContainer}>
        {weekDays.map((day, index) => (
          <View key={day} style={styles.weekDayCell}>
            <Text
              style={[
                styles.weekDayText,
                index === 0 && styles.sundayText,
                index === 6 && styles.saturdayText,
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.daysContainer}>{renderDays()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
  },
  navButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333333',
  },
  monthYearContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthYearText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#191F28',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  todayButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#3182F6',
    borderRadius: 20,
  },
  todayButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F6',
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B95A1',
  },
  sundayText: {
    color: '#F04452',
  },
  saturdayText: {
    color: '#3182F6',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 4,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingTop: 10,
  },
  dayText: {
    fontSize: 16,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    color: '#191F28',
    fontWeight: '500',
    marginBottom: 20,
    // paddingTop: 10
  },
  todayCell: {
    backgroundColor: '#3182F6',
    borderRadius: 14,
  },
  todayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  markedCell: {
    backgroundColor: '#EEF3FF',
    borderRadius: 12,
  },
  markedText: {
    color: '#3182F6',
    fontWeight: '600',
  },
  markedDot: {
    position: 'absolute',
    bottom: 8,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#3182F6',
  },
  emptyDayText: {
    color: 'transparent',
  },
});
