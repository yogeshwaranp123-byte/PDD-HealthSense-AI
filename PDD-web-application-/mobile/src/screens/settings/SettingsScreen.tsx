import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useI18n } from '../../hooks/useI18n';
import { theme, Typography, Spacing, Radius } from '../../utils/theme';

const { height } = Dimensions.get('window');
const HERO_H = height * 0.28;

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
];

// Settings row with spring press
const SettingsRow = ({ icon, label, sub, rightElement, onPress, showBorder = true, danger = false }: any) => (
  <TouchableOpacity
    style={[styles.row, showBorder && styles.rowBorder]}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
  >
    <View style={[styles.rowIconWrap, danger && { backgroundColor: theme.semantic.danger + '18' }]}>
      <Feather name={icon} size={15} color={danger ? theme.semantic.danger : theme.text.accent} />
    </View>
    <View style={styles.rowText}>
      <Text style={[styles.rowLabel, danger && { color: theme.semantic.danger }]}>{label}</Text>
      {sub && <Text style={styles.rowSub}>{sub}</Text>}
    </View>
    {rightElement ?? (
      onPress && <Feather name="chevron-right" size={15} color={theme.text.tertiary} />
    )}
  </TouchableOpacity>
);

export const SettingsScreen = ({ navigation }: any) => {
  const { logout } = useAuthStore();
  const { locale, changeLanguage } = useI18n();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); } },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Permanently', style: 'destructive', onPress: () => Alert.alert('Info', 'Account deletion must be done via support.') },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Your data export will be emailed to your registered address within 24 hours.');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Hero */}
      <View style={[styles.hero, { height: HERO_H + insets.top }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80' }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={400}
        />
        <LinearGradient
          colors={['transparent', theme.background.primary]}
          locations={[0.2, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.heroContent, { paddingTop: insets.top + 16, paddingBottom: Spacing.xl }]}>
          <Text style={styles.heroCategory}>PREFERENCES</Text>
          <Text style={styles.heroHeadline}>Settings</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Language */}
        <Animated.View entering={FadeInDown.delay(0).springify()}>
          <Text style={styles.sectionLabel}>LANGUAGE</Text>
          <View style={styles.card}>
            {LANGUAGES.map((lang, i) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.row, i < LANGUAGES.length - 1 && styles.rowBorder]}
                onPress={() => changeLanguage(lang.code)}
                activeOpacity={0.7}
              >
                <View style={styles.rowIconWrap}>
                  <Feather name="globe" size={15} color={theme.text.accent} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{lang.label}</Text>
                  <Text style={styles.rowSub}>{lang.native}</Text>
                </View>
                <View style={[styles.radio, locale === lang.code && styles.radioActive]}>
                  {locale === lang.code && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Notifications */}
        <Animated.View entering={FadeInDown.delay(60).springify()}>
          <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
          <View style={styles.card}>
            <SettingsRow
              icon="bell"
              label="Push Notifications"
              sub="Health reminders and alerts"
              showBorder={false}
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: theme.border.default, true: theme.text.accent + '80' }}
                  thumbColor={notificationsEnabled ? theme.text.accent : theme.text.tertiary}
                />
              }
            />
          </View>
        </Animated.View>

        {/* Account */}
        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.card}>
            <SettingsRow icon="download" label="Export My Data" sub="Emailed within 24 hours" onPress={handleExportData} />
            <SettingsRow icon="log-out" label="Sign Out" onPress={handleLogout} />
            <SettingsRow icon="trash-2" label="Delete Account" danger showBorder={false} onPress={handleDeleteAccount} />
          </View>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.delay(180).springify()}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <View style={styles.card}>
            <SettingsRow icon="info" label="App Name" rightElement={<Text style={styles.rowValue}>HealthSense AI</Text>} />
            <SettingsRow icon="tag" label="Version" rightElement={<Text style={styles.rowValue}>1.0.0</Text>} />
            <SettingsRow icon="calendar" label="Build" showBorder={false} rightElement={<Text style={styles.rowValue}>2026.05</Text>} />
          </View>
        </Animated.View>

        {/* Legal notice */}
        <Animated.View entering={FadeInDown.delay(240).springify()}>
          <View style={styles.legalBox}>
            <Text style={styles.legalText}>
              HealthSense AI is for informational purposes only and does not constitute medical diagnosis.
              Always consult a qualified healthcare professional for medical decisions.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background.primary },
  hero: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroContent: { paddingHorizontal: Spacing.lg },
  heroCategory: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.accent,
    letterSpacing: 3,
    marginBottom: 8,
  },
  heroHeadline: {
    fontFamily: Typography.fontFamily.displayLight,
    fontSize: Typography.fontSize.xxxl,
    color: theme.text.primary,
    letterSpacing: -1,
  },

  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  sectionLabel: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
    letterSpacing: 2.5,
    marginBottom: 10,
    marginTop: Spacing.lg,
  },

  card: {
    backgroundColor: theme.background.secondary,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: theme.border.subtle,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.border.subtle,
  },
  rowIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: theme.surface.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: {
    fontFamily: Typography.fontFamily.label,
    fontSize: Typography.fontSize.base,
    color: theme.text.primary,
  },
  rowSub: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 10,
    color: theme.text.tertiary,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  rowValue: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
    letterSpacing: 0.3,
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: theme.text.accent },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.text.accent,
  },

  legalBox: {
    marginTop: Spacing.md,
    padding: 16,
    borderRadius: Radius.xl,
    backgroundColor: theme.background.secondary,
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  legalText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 10,
    color: theme.text.tertiary,
    lineHeight: 16,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
