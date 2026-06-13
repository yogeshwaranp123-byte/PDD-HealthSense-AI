import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { theme, Typography, Spacing, Radius } from '../../utils/theme';

const { height } = Dimensions.get('window');
const HERO_H = height * 0.40;

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    const safeEmail = email.trim() || 'tester@healthsense.ai';
    const safePassword = password || 'test1234';
    await login(safeEmail, safePassword);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Hero image */}
      <View style={[styles.hero, { height: HERO_H }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80' }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={400}
        />
        <LinearGradient
          colors={['transparent', theme.background.primary]}
          locations={[0.3, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Wordmark */}
        <View style={[styles.wordmark, { top: insets.top + 20 }]}>
          <Text style={styles.wordmarkText}>HS</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Headline */}
          <Text style={styles.headline}>Welcome{'\n'}back.</Text>
          <Text style={styles.subheadline}>Sign in to continue your health journey.</Text>

          {/* Error banner */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError}>
                <Text style={styles.errorDismiss}>dismiss</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Fields */}
          <View style={styles.fields}>
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="doctor@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              rightElement={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.showHide}>{showPassword ? 'hide' : 'show'}</Text>
                </TouchableOpacity>
              }
            />
          </View>

          <Button label="Continue" onPress={handleLogin} loading={isLoading} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>No account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Create one</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.testNote}>Testing mode active — tap Continue to enter instantly.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background.primary },
  flex: { flex: 1 },
  hero: {
    width: '100%',
    overflow: 'hidden',
  },
  wordmark: {
    position: 'absolute',
    left: Spacing.lg,
  },
  wordmarkText: {
    fontFamily: Typography.fontFamily.displayLight,
    fontSize: Typography.fontSize.xxl,
    color: theme.text.accent,
    letterSpacing: -1,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  headline: {
    fontFamily: Typography.fontFamily.displayLight,
    fontSize: Typography.fontSize.display,
    color: theme.text.primary,
    letterSpacing: -1,
    lineHeight: Typography.fontSize.display * 1.2,
    marginBottom: 12,
  },
  subheadline: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.md,
    color: theme.text.secondary,
    lineHeight: Typography.fontSize.md * 1.65,
    marginBottom: Spacing.xxl,
  },
  errorBanner: {
    backgroundColor: theme.background.secondary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: theme.semantic.danger,
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  errorText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.sm,
    color: theme.semantic.danger,
    flex: 1,
  },
  errorDismiss: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
    paddingLeft: 8,
  },
  fields: { marginBottom: Spacing.xl },
  showHide: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.accent,
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.sm,
    color: theme.text.secondary,
  },
  footerLink: {
    fontFamily: Typography.fontFamily.label,
    fontSize: Typography.fontSize.sm,
    color: theme.text.accent,
  },
  testNote: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
    textAlign: 'center',
    marginTop: Spacing.xl,
    letterSpacing: 0.3,
  },
});
