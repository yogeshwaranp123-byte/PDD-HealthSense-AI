import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { CustomTabBar } from './CustomTabBar';

// Auth
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Onboarding
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';

// Main
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { PredictScreen } from '../screens/predict/PredictScreen';
import { ResultScreen } from '../screens/result/ResultScreen';
import { HistoryScreen } from '../screens/history/HistoryScreen';
import { RiskTrendScreen } from '../screens/history/RiskTrendScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';
import { HospitalsScreen } from '../screens/hospitals/HospitalsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

import { theme } from '../utils/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background.primary,
          borderTopWidth: 0,
        },
      }}
    >
      <Tab.Screen name="Home"      component={HomeStack} />
      <Tab.Screen name="Predict"   component={PredictStack} />
      <Tab.Screen name="Chat"      component={ChatScreen} />
      <Tab.Screen name="Hospitals" component={HospitalsScreen} />
      <Tab.Screen name="Profile"   component={ProfileStack} />
    </Tab.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
        contentStyle: { backgroundColor: theme.background.primary },
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Predict"   component={PredictScreen} />
      <Stack.Screen name="Result"    component={ResultScreen} />
    </Stack.Navigator>
  );
}

function PredictStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
        contentStyle: { backgroundColor: theme.background.primary },
      }}
    >
      <Stack.Screen name="PredictMain" component={PredictScreen} />
      <Stack.Screen name="Result"      component={ResultScreen} />
      <Stack.Screen name="HistoryList" component={HistoryScreen} />
      <Stack.Screen name="RiskTrend"   component={RiskTrendScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
        contentStyle: { backgroundColor: theme.background.primary },
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Settings"    component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: theme.text.accent,
          background: theme.background.primary,
          card: theme.background.secondary,
          text: theme.text.primary,
          border: theme.border.default,
          notification: theme.text.accent,
        },
        fonts: {
          regular: { fontFamily: 'DMSans_400Regular', fontWeight: '400' },
          medium: { fontFamily: 'DMSans_500Medium', fontWeight: '500' },
          bold: { fontFamily: 'DMSans_700Bold', fontWeight: '700' },
          heavy: { fontFamily: 'DMSans_700Bold', fontWeight: '700' },
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login"      component={LoginScreen} />
            <Stack.Screen name="Register"   component={RegisterScreen} />
          </>
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
