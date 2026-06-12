import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Colors, Typography, Spacing, Radius } from '../../utils/theme';

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  hint?: string;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  hint,
}) => {
  const decrement = () => onChange(Math.max(min, Number((value - step).toFixed(4))));
  const increment = () => onChange(Math.min(max, Number((value + step).toFixed(4))));
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valueDisplay}>
          {typeof value === 'number' ? value.toFixed(step < 1 ? 3 : 0) : value}
          {unit ? ` ${unit}` : ''}
        </Text>
      </View>

      {hint && <Text style={styles.hint}>{hint}</Text>}

      {/* Track */}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: `${pct}%` }]} />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Text style={styles.rangeLbl}>{min}</Text>
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btn} onPress={decrement}>
            <Text style={styles.btnText}>−</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={increment}>
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.rangeLbl}>{max}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontFamily: Typography.fontFamily.label,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  valueDisplay: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
  },
  hint: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  track: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rangeLbl: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    width: 32,
  },
  btnRow: { flexDirection: 'row', gap: Spacing.sm },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 18,
    color: Colors.primary,
    lineHeight: 22,
  },
});
