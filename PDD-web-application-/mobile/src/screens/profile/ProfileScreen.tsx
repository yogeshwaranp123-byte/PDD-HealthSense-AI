import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { theme, Typography, Spacing, Radius } from '../../utils/theme';

const { height } = Dimensions.get('window');
const HERO_H = height * 0.30;

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export const ProfileScreen = ({ navigation }: any) => {
  const { profile, fetchProfile, updateProfile, isLoading } = useUserStore();
  const { logout } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({
    age: '', gender: '', weight: '', height: '',
    blood_type: '', existing_conditions: '', allergies: '',
  });

  useEffect(() => { fetchProfile(); }, []);

  useEffect(() => {
    if (profile) {
      setForm({
        age: profile.age?.toString() ?? '',
        gender: profile.gender ?? '',
        weight: profile.weight?.toString() ?? '',
        height: profile.height?.toString() ?? '',
        blood_type: profile.blood_type ?? '',
        existing_conditions: (profile.existing_conditions ?? []).join(', '),
        allergies: (profile.allergies ?? []).join(', '),
      });
    }
  }, [profile]);

  const setValue = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    const payload: Record<string, any> = {
      age: form.age ? Number(form.age) : undefined,
      gender: form.gender || undefined,
      weight: form.weight ? Number(form.weight) : undefined,
      height: form.height ? Number(form.height) : undefined,
      blood_type: form.blood_type || undefined,
      existing_conditions: form.existing_conditions
        ? form.existing_conditions.split(',').map((s) => s.trim())
        : [],
      allergies: form.allergies ? form.allergies.split(',').map((s) => s.trim()) : [],
    };
    await updateProfile(payload);
    Alert.alert('Saved', 'Profile updated successfully.');
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => { await logout(); },
      },
    ]);
  };

  const initials = (profile?.name ?? 'U').charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Hero */}
      <View style={[styles.hero, { height: HERO_H + insets.top }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80' }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={400}
        />
        <LinearGradient
          colors={['transparent', theme.background.primary]}
          locations={[0.2, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <TouchableOpacity
          style={[styles.logoutBtn, { top: insets.top + 16 }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Feather name="log-out" size={14} color={theme.text.accent} />
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
        <View style={[styles.heroContent, { paddingBottom: Spacing.xl }]}>
          <Text style={styles.heroCategory}>SETTINGS</Text>
          <Text style={styles.heroHeadline}>Health{'\n'}Profile</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar section */}
        <Animated.View entering={FadeInDown.springify()} style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.avatarMeta}>
            <Text style={styles.profileName}>{profile?.name ?? ''}</Text>
            <Text style={styles.profileEmail}>{profile?.email ?? ''}</Text>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        {/* Biometrics section */}
        <Animated.View entering={FadeInDown.delay(60).springify()}>
          <Text style={styles.sectionLabel}>BIOMETRICS</Text>
          <View style={styles.biometricRow}>
            <View style={styles.biometricInput}>
              <Input label="Age" value={form.age} onChangeText={(v) => setValue('age', v)} keyboardType="numeric" />
            </View>
            <View style={styles.biometricInput}>
              <Input label="Weight (kg)" value={form.weight} onChangeText={(v) => setValue('weight', v)} keyboardType="numeric" />
            </View>
            <View style={styles.biometricInput}>
              <Input label="Height (cm)" value={form.height} onChangeText={(v) => setValue('height', v)} keyboardType="numeric" />
            </View>
          </View>
        </Animated.View>

        {/* Gender */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={styles.sectionLabel}>GENDER</Text>
          <View style={styles.chipGrid}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.chip, form.gender === g && styles.chipActive]}
                onPress={() => setValue('gender', g)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, form.gender === g && styles.chipTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Blood type */}
        <Animated.View entering={FadeInDown.delay(140).springify()}>
          <Text style={styles.sectionLabel}>BLOOD TYPE</Text>
          <View style={styles.chipGrid}>
            {BLOOD_TYPES.map((bt) => (
              <TouchableOpacity
                key={bt}
                style={[styles.chip, form.blood_type === bt && styles.chipActive]}
                onPress={() => setValue('blood_type', bt)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, form.blood_type === bt && styles.chipTextActive]}>{bt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Text fields */}
        <Animated.View entering={FadeInDown.delay(180).springify()}>
          <Text style={styles.sectionLabel}>MEDICAL HISTORY</Text>
          <Input
            label="Existing Conditions"
            value={form.existing_conditions}
            onChangeText={(v) => setValue('existing_conditions', v)}
            placeholder="Hypertension, Asthma..."
            hint="Comma-separated — used to pre-fill relevant forms"
          />
          <Input
            label="Allergies"
            value={form.allergies}
            onChangeText={(v) => setValue('allergies', v)}
            placeholder="Penicillin, Peanuts..."
          />
        </Animated.View>

        <Button label="Save Profile" onPress={handleSave} loading={isLoading} />
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
  heroContent: {
    paddingHorizontal: Spacing.lg,
  },
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
    lineHeight: Typography.fontSize.xxxl * 1.2,
  },
  logoutBtn: {
    position: 'absolute',
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.surface.highlight,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: theme.border.default,
  },
  logoutText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.accent,
    letterSpacing: 0.5,
  },

  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },

  // Avatar
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.surface.highlight,
    borderWidth: 1,
    borderColor: theme.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Typography.fontFamily.displayLight,
    fontSize: Typography.fontSize.xl,
    color: theme.text.accent,
  },
  avatarMeta: { flex: 1 },
  profileName: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.lg,
    color: theme.text.primary,
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
    marginTop: 3,
    letterSpacing: 0.3,
  },

  divider: {
    height: 1,
    backgroundColor: theme.border.subtle,
    marginBottom: Spacing.xl,
  },

  // Section labels
  sectionLabel: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
    letterSpacing: 2.5,
    marginBottom: 12,
  },

  // Biometrics
  biometricRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.xl,
  },
  biometricInput: { flex: 1 },

  // Chips
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.xl,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: theme.border.default,
    backgroundColor: theme.background.secondary,
  },
  chipActive: {
    backgroundColor: theme.surface.highlight,
    borderColor: theme.text.accent,
  },
  chipText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
    letterSpacing: 0.3,
  },
  chipTextActive: { color: theme.text.accent },
});
