import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './screens/HomeScreen';
import { EmployeeScreen } from './screens/EmployeeScreen';
import { MonthlySalaryScreen } from './screens/MonthlySalaryScreen';
import { QuickTimeSettingsScreen } from './screens/QuickTimeSettingsScreen';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#3182F6',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: '급여 관리',
            headerRight: () => (
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  onPress={() => {
                    try {
                      navigation.navigate('QuickTimeSettings');
                    } catch (error) {
                      console.error('Error navigating to QuickTimeSettings:', error);
                    }
                  }}
                  style={[styles.headerButton, styles.quickTimeButton]}
                >
                  <Text style={styles.headerButtonText}>간편설정</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Employee')}
                  style={[styles.headerButton, { marginLeft: 8 }]}
                >
                  <Text style={styles.headerButtonText}>직원</Text>
                </TouchableOpacity>
              </View>
            ),
          })}
        />
        <Stack.Screen
          name="Employee"
          component={EmployeeScreen}
          options={{
            title: '직원 관리',
          }}
        />
        <Stack.Screen
          name="MonthlySalary"
          component={MonthlySalaryScreen}
          options={{
            title: '월별 급여 내역',
          }}
        />
        <Stack.Screen
          name="QuickTimeSettings"
          component={QuickTimeSettingsScreen}
          options={{
            title: '간편 시간 설정',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  quickTimeButton: {
    marginRight: 0,
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
