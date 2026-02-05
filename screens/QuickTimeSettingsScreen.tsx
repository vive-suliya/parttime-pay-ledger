import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { TimeSlider } from '../components/TimeSlider';
import { getQuickTimeSettings, saveQuickTimeSettings } from '../utils/storage';
import { QuickTimeSettings } from '../types';

export const QuickTimeSettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<QuickTimeSettings>({
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
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await getQuickTimeSettings();
      if (savedSettings && 
          savedSettings.morning && savedSettings.morning.startTime && savedSettings.morning.endTime &&
          savedSettings.lunch && savedSettings.lunch.startTime && savedSettings.lunch.endTime &&
          savedSettings.dinner && savedSettings.dinner.startTime && savedSettings.dinner.endTime) {
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Error loading quick time settings:', error);
      // 기본값 유지
    }
  };

  const handleSave = async () => {
    try {
      await saveQuickTimeSettings(settings);
      Alert.alert('저장 완료', '간편 시간 설정이 저장되었습니다.');
    } catch (error) {
      console.error('Error saving quick time settings:', error);
      Alert.alert('오류', '설정 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>간편 시간 설정</Text>
          <Text style={styles.subtitle}>
            근무 시간을 빠르게 설정하기 위한 시간을 미리 지정하세요
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌅 아침</Text>
          <TimeSlider
            label="시작 시간"
            hours={settings?.morning?.startTime?.hours ?? 9}
            minutes={settings?.morning?.startTime?.minutes ?? 0}
            onTimeChange={(hours, minutes) => {
              try {
                setSettings({
                  ...settings,
                  morning: {
                    ...settings.morning,
                    startTime: { hours, minutes },
                  },
                });
              } catch (error) {
                console.error('Error updating morning start time:', error);
              }
            }}
          />
          <TimeSlider
            label="종료 시간"
            hours={settings?.morning?.endTime?.hours ?? 12}
            minutes={settings?.morning?.endTime?.minutes ?? 0}
            onTimeChange={(hours, minutes) => {
              try {
                setSettings({
                  ...settings,
                  morning: {
                    ...settings.morning,
                    endTime: { hours, minutes },
                  },
                });
              } catch (error) {
                console.error('Error updating morning end time:', error);
              }
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍽️ 점심</Text>
          <TimeSlider
            label="시작 시간"
            hours={settings?.lunch?.startTime?.hours ?? 12}
            minutes={settings?.lunch?.startTime?.minutes ?? 0}
            onTimeChange={(hours, minutes) => {
              try {
                setSettings({
                  ...settings,
                  lunch: {
                    ...settings.lunch,
                    startTime: { hours, minutes },
                  },
                });
              } catch (error) {
                console.error('Error updating lunch start time:', error);
              }
            }}
          />
          <TimeSlider
            label="종료 시간"
            hours={settings?.lunch?.endTime?.hours ?? 15}
            minutes={settings?.lunch?.endTime?.minutes ?? 0}
            onTimeChange={(hours, minutes) => {
              try {
                setSettings({
                  ...settings,
                  lunch: {
                    ...settings.lunch,
                    endTime: { hours, minutes },
                  },
                });
              } catch (error) {
                console.error('Error updating lunch end time:', error);
              }
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌙 저녁</Text>
          <TimeSlider
            label="시작 시간"
            hours={settings?.dinner?.startTime?.hours ?? 18}
            minutes={settings?.dinner?.startTime?.minutes ?? 0}
            onTimeChange={(hours, minutes) => {
              try {
                setSettings({
                  ...settings,
                  dinner: {
                    ...settings.dinner,
                    startTime: { hours, minutes },
                  },
                });
              } catch (error) {
                console.error('Error updating dinner start time:', error);
              }
            }}
          />
          <TimeSlider
            label="종료 시간"
            hours={settings?.dinner?.endTime?.hours ?? 21}
            minutes={settings?.dinner?.endTime?.minutes ?? 0}
            onTimeChange={(hours, minutes) => {
              try {
                setSettings({
                  ...settings,
                  dinner: {
                    ...settings.dinner,
                    endTime: { hours, minutes },
                  },
                });
              } catch (error) {
                console.error('Error updating dinner end time:', error);
              }
            }}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
