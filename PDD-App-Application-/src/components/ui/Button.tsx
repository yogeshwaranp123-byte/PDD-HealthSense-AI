import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { theme, Typography, Spacing, Radius } from '../../utils/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = true,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const variantStyle = (styles as any)[variant];
  const sizeStyle = (styles as any)[`size_${size}`];
  const labelVariantStyle = (styles as any)[`label_${variant}`];
  const labelSizeStyle = (styles as any)[`labelSize_${size}`];

  const baseStyle = [styles.base, variantStyle, sizeStyle, fullWidth && styles.fullWidth, (disabled || loading) && styles.disabled, style];

  return (
    <AnimatedTouchable
      style={[animatedStyle, ...baseStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.background.primary : theme.text.accent}
          size="small"
        />
      ) : (
        <Text style={[styles.label, labelVariantStyle, labelSizeStyle, textStyle]}>
          {label}
        </Text>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.xl,
  },
  fullWidth: { width: '100%' },

  // Variants
  primary: { backgroundColor: theme.text.accent },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.border.strong,
  },
  danger: { backgroundColor: theme.semantic.danger },
  ghost: { backgroundColor: 'transparent' },

  // Sizes
  size_sm: { paddingVertical: 10, paddingHorizontal: Spacing.md, minHeight: 40 },
  size_md: { paddingVertical: 16, paddingHorizontal: Spacing.lg, minHeight: 56 },
  size_lg: { paddingVertical: 18, paddingHorizontal: Spacing.xl, minHeight: 60 },

  disabled: { opacity: 0.4 },

  // Labels
  label: {
    fontFamily: Typography.fontFamily.label,
    letterSpacing: 0.3,
  },
  label_primary: { color: theme.background.primary },
  label_outline: { color: theme.text.accent },
  label_danger: { color: theme.text.primary },
  label_ghost: { color: theme.text.accent },

  labelSize_sm: { fontSize: Typography.fontSize.sm },
  labelSize_md: { fontSize: Typography.fontSize.base },
  labelSize_lg: { fontSize: Typography.fontSize.md },
});
