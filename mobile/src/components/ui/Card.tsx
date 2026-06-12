import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme, Typography, Spacing, Radius } from '../../utils/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  title?: string;
  accent?: string;
}

export const Card: React.FC<CardProps> = ({ children, style, title, accent }) => (
  <View style={[styles.card, style]}>
    {accent && <View style={[styles.accent, { backgroundColor: accent }]} />}
    {title && <Text style={styles.title}>{title}</Text>}
    {children}
  </View>
);

interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = theme.background.primary,
  bgColor = theme.text.accent,
  size = 'md',
}) => (
  <View style={[styles.badge, { backgroundColor: bgColor }, size === 'sm' && styles.badgeSm]}>
    <Text style={[styles.badgeText, { color }, size === 'sm' && styles.badgeTextSm]}>
      {label}
    </Text>
  </View>
);

interface DividerProps {
  style?: ViewStyle;
}
export const Divider: React.FC<DividerProps> = ({ style }) => (
  <View style={[styles.divider, style]} />
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.background.secondary,
    borderRadius: Radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  accent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  title: {
    fontFamily: Typography.fontFamily.label,
    fontSize: Typography.fontSize.base,
    color: theme.text.primary,
    marginBottom: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  badgeSm: { paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    letterSpacing: 0.5,
  },
  badgeTextSm: { fontSize: 9 },
  divider: {
    height: 0.5,
    backgroundColor: theme.border.subtle,
    marginVertical: Spacing.md,
  },
});
