import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing } from '../../utils/theme';

interface LoaderProps {
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message = 'Analysing...' }) => {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const pulse = (sv: typeof dot1, delay: number) => {
      sv.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }),
          withTiming(0.3, { duration: 500, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      );
    };
    pulse(dot1, 0);
    setTimeout(() => pulse(dot2, 0), 200);
    setTimeout(() => pulse(dot3, 0), 400);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={styles.container}>
      <View style={styles.dots}>
        <Animated.View style={[styles.dot, dot1Style]} />
        <Animated.View style={[styles.dot, dot2Style]} />
        <Animated.View style={[styles.dot, dot3Style]} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  message: {
    fontFamily: Typography.fontFamily.label,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
});
