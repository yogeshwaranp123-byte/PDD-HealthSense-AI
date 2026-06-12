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
const HERO_H = height * 0.35;

export const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error, clearError } = useAuthStore();
  const insets = useSafeAreaInsets();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) return;
    await register(name.trim(), email.trim(), password);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Hero image */}
      <View style={[styles.hero, { height: HERO_H }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1200&q=80' }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={400}
        />
        <LinearGradient
          colors={['transparent', theme.background.primary]}
          locations={[0.3, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <TouchableOpacity
          style={[styles.backBtn, { top: insets.top + 16 }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.headline}>Create your{'\n'}account.</Text>
          <Text style={styles.subheadline}>Start monitoring your health with AI.</Text>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError}>
                <Text style={styles.errorDismiss}>dismiss</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.fields}>
            <Input label="Full Name" value={name} onChangeText={setName} placeholder="Dr. Jane Smith" />
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

          <Button
            label="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            disabled={!name.trim() || !email.trim() || !password}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
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
  backBtn: {
    position: 'absolute',
    left: Spacing.lg,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 24,
    color: theme.text.primary,
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
});
