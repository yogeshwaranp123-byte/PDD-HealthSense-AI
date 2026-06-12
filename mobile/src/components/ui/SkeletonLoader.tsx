import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, Radius } from '../../utils/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

// A single shimmer block
export const SkeletonBlock: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = Radius.sm,
  style,
}) => {
  const translateX = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: 400,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View
      style={[
        styles.block,
        { width: width as any, height, borderRadius },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { transform: [{ translateX }] },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(245,240,232,0.06)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );
};

// A skeleton card matching the small horizontal card spec
export const SkeletonCard: React.FC = () => (
  <View style={styles.card}>
    <SkeletonBlock width={88} height={88} borderRadius={Radius.lg} style={{ borderRadius: Radius.lg }} />
    <View style={styles.cardContent}>
      <SkeletonBlock width="70%" height={14} />
      <SkeletonBlock width="40%" height={11} style={{ marginTop: 8 }} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  block: {
    backgroundColor: theme.background.tertiary,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    height: 88,
    borderRadius: Radius.lg,
    backgroundColor: theme.background.secondary,
    borderWidth: 1,
    borderColor: theme.border.subtle,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
    gap: 8,
  },
});
