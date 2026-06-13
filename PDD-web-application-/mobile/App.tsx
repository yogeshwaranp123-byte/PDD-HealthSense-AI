import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  DMMono_400Regular,
} from '@expo-google-fonts/dm-mono';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from './src/store/authStore';
import { RootNavigator } from './src/navigation/RootNavigator';
import { theme, Typography } from './src/utils/theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    DMMono_400Regular,
  });

  const { checkAuth } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkAuth().finally(() => setAuthChecked(true));
  }, []);

  if (!fontsLoaded || !authChecked) {
    return (
      <View style={styles.splash}>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <Text style={styles.splashWordmark}>HS</Text>
        <Text style={styles.splashSub}>HEALTHSENSE</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider style={{ backgroundColor: theme.background.primary }}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={{ flex: 1, backgroundColor: theme.background.primary }}>
        <RootNavigator />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: theme.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  splashWordmark: {
    fontFamily: 'PlayfairDisplay_300Light',
    fontSize: 64,
    color: theme.text.accent,
    letterSpacing: -2,
  },
  splashSub: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: theme.text.tertiary,
    letterSpacing: 8,
  },
});
