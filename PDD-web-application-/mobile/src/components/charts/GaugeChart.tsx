import React, { useEffect } from 'react';
import Svg, { Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../utils/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface GaugeChartProps {
  probability: number; // 0–100
  size?: number;
  strokeWidth?: number;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  probability,
  size = 220,
  strokeWidth = 18,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(probability / 100, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [probability]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const color =
    probability >= 70
      ? theme.semantic.danger
      : probability >= 40
      ? theme.semantic.warning
      : theme.semantic.success;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={theme.border.default}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Progress */}
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${cx}, ${cy}`}
        />
        {/* Center label */}
        <SvgText
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fontSize="32"
          fontWeight="300"
          fill={theme.text.primary}
        >
          {`${Math.round(probability)}%`}
        </SvgText>
        <SvgText
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          fontSize="11"
          fill={theme.text.tertiary}
        >
          RISK PROBABILITY
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
