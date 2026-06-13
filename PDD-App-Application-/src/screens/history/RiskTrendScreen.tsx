import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePredictionStore } from '../../store/predictionStore';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { theme, Typography, Spacing, Radius, Disease, DiseaseKey } from '../../utils/theme';

const { height } = Dimensions.get('window');
const HERO_H = height * 0.28;

interface DataPoint {
  date: string;
  probability: number;
}

const MiniLineChart = ({ data, color }: { data: DataPoint[]; color: string }) => {
  if (data.length < 2) return null;
  const WIDTH = 280;
  const HEIGHT = 90;
  const PAD = 16;
  const maxY = 100;
  const minY = 0;

  const pts = data.map((d, i) => ({
    x: PAD + (i / (data.length - 1)) * (WIDTH - PAD * 2),
    y: PAD + (1 - (d.probability - minY) / (maxY - minY)) * (HEIGHT - PAD * 2),
    prob: d.probability,
    date: d.date,
  }));

  return (
    <View style={{ width: WIDTH, height: HEIGHT }}>
      {[25, 50, 75].map((v) => {
        const y = PAD + (1 - v / 100) * (HEIGHT - PAD * 2);
        return (
          <View
            key={v}
            style={{
              position: 'absolute',
              left: PAD,
              right: PAD,
              top: y,
              height: 0.5,
              backgroundColor: theme.border.subtle,
            }}
          />
        );
      })}
      {pts.map((pt, i) => (
        <View key={i}>
          {i > 0 && (
            <View
              style={{
                position: 'absolute',
                left: pts[i - 1].x,
                top: Math.min(pts[i - 1].y, pt.y),
                width: Math.abs(pt.x - pts[i - 1].x),
                height: Math.max(1.5, Math.abs(pt.y - pts[i - 1].y)),
                backgroundColor: color,
                opacity: 0.7,
                borderRadius: 1,
              }}
            />
          )}
          <View
            style={{
              position: 'absolute',
              left: pt.x - 4,
              top: pt.y - 4,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: color,
              borderWidth: 1.5,
              borderColor: theme.background.secondary,
            }}
          />
          <Text
            style={{
              position: 'absolute',
              left: pt.x - 14,
              top: pt.y - 20,
              fontSize: 9,
              fontFamily: Typography.fontFamily.mono,
              color: color,
              width: 28,
              textAlign: 'center',
            }}
          >
            {pt.prob}%
          </Text>
        </View>
      ))}
    </View>
  );
};

export const RiskTrendScreen = ({ navigation }: any) => {
  const { history } = usePredictionStore();
  const insets = useSafeAreaInsets();

  const trendsByDisease: Record<string, DataPoint[]> = {};
  history.forEach((p) => {
    if (!trendsByDisease[p.disease]) trendsByDisease[p.disease] = [];
    trendsByDisease[p.disease].push({
      date: p.created_at
        ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        : 'N/A',
      probability: p.probability,
    });
  });

  const trendEntries = Object.entries(trendsByDisease).filter(([, pts]) => pts.length >= 2);

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Hero */}
      <View style={[styles.hero, { height: HERO_H + insets.top }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1200&q=80' }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={400}
        />
        <LinearGradient
          colors={['transparent', theme.background.primary]}
          locations={[0.2, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={{ paddingTop: insets.top }}>
          <ScreenHeader onBack={() => navigation.goBack()} />
        </View>
        <View style={[styles.heroContent, { paddingBottom: Spacing.xl }]}>
          <Text style={styles.heroCategory}>ANALYTICS</Text>
          <Text style={styles.heroHeadline}>Risk Trends</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {trendEntries.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Feather name="trending-up" size={40} color={theme.text.tertiary} />
            </View>
            <Text style={styles.emptyTitle}>Not enough data</Text>
            <Text style={styles.emptySubtitle}>
              Run at least 2 predictions for the same disease to see risk trends.
            </Text>
          </View>
        ) : (
          trendEntries.map(([disease, points], idx) => {
            const d = Disease[disease as DiseaseKey];
            const color = d?.color ?? theme.text.accent;
            const latest = points[points.length - 1];
            const first = points[0];
            const delta = latest.probability - first.probability;
            const isRising = delta > 5;
            const isFalling = delta < -5;

            return (
              <Animated.View key={disease} entering={FadeInDown.delay(idx * 80).springify()}>
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View>
                      <View style={styles.diseaseRow}>
                        <Feather name={d?.icon as any ?? 'activity'} size={12} color={color} />
                        <Text style={styles.diseaseName}>{d?.label ?? disease}</Text>
                      </View>
                      <Text style={styles.pointsCount}>{points.length} assessments recorded</Text>
                    </View>
                    <View style={styles.deltaContainer}>
                      <Feather
                        name={delta > 0 ? 'arrow-up' : delta < 0 ? 'arrow-down' : 'minus'}
                        size={14}
                        color={delta > 0 ? theme.semantic.danger : delta < 0 ? theme.semantic.success : theme.text.tertiary}
                      />
                      <Text style={[styles.delta, { color: delta > 0 ? theme.semantic.danger : delta < 0 ? theme.semantic.success : theme.text.tertiary }]}>
                        {Math.abs(delta).toFixed(1)}%
                      </Text>
                      <Text style={styles.deltaLabel}>vs first</Text>
                    </View>
                  </View>

                  <View style={styles.chartWrapper}>
                    <MiniLineChart data={points} color={color} />
                  </View>

                  <View style={styles.xLabels}>
                    {points.map((pt, i) => (
                      <Text key={i} style={styles.xLabel} numberOfLines={1}>{pt.date}</Text>
                    ))}
                  </View>

                  <View style={[styles.trendBadge, {
                    backgroundColor: isRising ? theme.semantic.danger + '15' : isFalling ? theme.semantic.success + '15' : theme.surface.highlight,
                    borderColor: isRising ? theme.semantic.danger + '40' : isFalling ? theme.semantic.success + '40' : theme.border.subtle,
                  }]}>
                    <Feather
                      name={isRising ? 'alert-circle' : isFalling ? 'check-circle' : 'minus-circle'}
                      size={12}
                      color={isRising ? theme.semantic.danger : isFalling ? theme.semantic.success : theme.text.tertiary}
                    />
                    <Text style={[styles.trendBadgeText, {
                      color: isRising ? theme.semantic.danger : isFalling ? theme.semantic.success : theme.text.tertiary,
                    }]}>
                      {isRising
                        ? 'Risk increasing — consider consulting a doctor'
                        : isFalling
                        ? 'Risk decreasing — keep it up'
                        : 'Risk stable across assessments'}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background.primary },
  hero: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  heroContent: { paddingHorizontal: Spacing.lg },
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
  },

  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },

  card: {
    backgroundColor: theme.background.secondary,
    borderRadius: Radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border.subtle,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  diseaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  diseaseName: {
    fontFamily: Typography.fontFamily.label,
    fontSize: Typography.fontSize.base,
    color: theme.text.primary,
  },
  pointsCount: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 10,
    color: theme.text.tertiary,
    letterSpacing: 0.3,
  },
  deltaContainer: { alignItems: 'flex-end', gap: 2 },
  delta: {
    fontFamily: Typography.fontFamily.displayLight,
    fontSize: Typography.fontSize.xl,
    letterSpacing: -0.5,
  },
  deltaLabel: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 9,
    color: theme.text.tertiary,
  },
  chartWrapper: {
    alignItems: 'center',
    backgroundColor: theme.background.tertiary,
    borderRadius: Radius.lg,
    paddingVertical: 8,
    marginBottom: 8,
  },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  xLabel: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 9,
    color: theme.text.tertiary,
    flex: 1,
    textAlign: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  trendBadgeText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 10,
    flex: 1,
    letterSpacing: 0.2,
  },

  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.xl,
    color: theme.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.sm,
    color: theme.text.tertiary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.sm * 1.65,
  },
});
