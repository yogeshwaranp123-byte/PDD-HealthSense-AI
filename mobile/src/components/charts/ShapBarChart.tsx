import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, Typography, Spacing } from '../../utils/theme';

interface BarChartProps {
  data: Record<string, number>; // feature -> percentage
  title?: string;
}

export const ShapBarChart: React.FC<BarChartProps> = ({ data, title }) => {
  const entries = Object.entries(data).sort(([, a], [, b]) => b - a);
  const maxVal = Math.max(...entries.map(([, v]) => v), 1);
  const BAR_HEIGHT = 28;
  const LABEL_WIDTH = 160;
  const CHART_WIDTH = 200;
  const ROW_GAP = 14;
  const height = entries.length * (BAR_HEIGHT + ROW_GAP);

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      {entries.map(([feature, value], i) => {
        const barWidth = (value / maxVal) * CHART_WIDTH;
        const label = feature.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const color =
          i === 0 ? theme.text.accent : i === 1 ? '#D4C7AD' : '#8BA99B';

        return (
          <View key={feature} style={styles.row}>
            <Text style={styles.label} numberOfLines={1}>{label}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.bar, { width: `${(value / maxVal) * 100}%`, backgroundColor: color }]} />
            </View>
            <Text style={styles.value}>{value.toFixed(1)}%</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: Spacing.sm },
  title: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 10,
    color: theme.text.secondary,
    width: 130,
    marginRight: Spacing.sm,
    letterSpacing: 0.2,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: theme.border.subtle,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: Spacing.sm,
  },
  bar: {
    height: '100%',
    borderRadius: 3,
  },
  value: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 10,
    color: theme.text.accent,
    width: 42,
    textAlign: 'right',
  },
});
