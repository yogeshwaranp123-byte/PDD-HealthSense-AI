import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { theme, Spacing, Radius } from '../../utils/theme';

interface ScreenHeaderProps {
  onBack?: () => void;
  right?: React.ReactNode;
  children?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  onBack,
  right,
  children,
}) => (
  <View style={styles.header}>
    <View style={styles.left}>
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtnOuter}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.8}
        >
          <BlurView intensity={40} tint="dark" style={styles.backBtn}>
            <Feather name="arrow-left" size={18} color={theme.text.primary} />
          </BlurView>
        </TouchableOpacity>
      )}
    </View>
    <View style={styles.center}>{children}</View>
    <View style={styles.right}>{right ?? null}</View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  left: { width: 40, alignItems: 'flex-start' },
  right: { minWidth: 40, alignItems: 'flex-end', flexShrink: 0 },
  center: { flex: 1, paddingHorizontal: Spacing.sm },
  backBtnOuter: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border.default,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface.glass,
  },
});
