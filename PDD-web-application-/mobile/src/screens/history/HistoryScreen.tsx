import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePredictionStore, Prediction } from '../../store/predictionStore';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { SkeletonCard } from '../../components/ui/SkeletonLoader';
import { theme, Typography, Spacing, Radius, Disease, DiseaseKey } from '../../utils/theme';

const { height } = Dimensions.get('window');
const HERO_H = height * 0.32;

const FILTER_OPTIONS = ['All', 'Diabetes', 'Kidney', "Parkinson's", 'Lung Cancer', 'Thyroid'];
const DISEASE_KEY_MAP: Record<string, DiseaseKey> = {
  'All': 'diabetes',
  'Diabetes': 'diabetes',
  'Kidney': 'kidney',
  "Parkinson's": 'parkinsons',
  'Lung Cancer': 'lung_cancer',
  'Thyroid': 'thyroid',
};

export const HistoryScreen = ({ navigation }: any) => {
  const { history, fetchHistory, isLoading } = usePredictionStore();
  const [filter, setFilter] = useState('All');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered =
    filter === 'All'
      ? history
      : history.filter((h) => h.disease === DISEASE_KEY_MAP[filter]);

  const groupByDate = (preds: Prediction[]) => {
    const groups: Record<string, Prediction[]> = {};
    preds.forEach((p) => {
      const date = p.created_at
        ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Recent';
      if (!groups[date]) groups[date] = [];
      groups[date].push(p);
    });
    return groups;
  };

  const grouped = groupByDate(filtered);

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Hero */}
      <View style={[styles.hero, { height: HERO_H + insets.top }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80' }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={400}
        />
        <LinearGradient
          colors={['transparent', theme.background.primary]}
          locations={[0.2, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Top scrim — back button always readable */}
        <LinearGradient
          colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.1)', 'transparent']}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={{ paddingTop: Math.max(insets.top, 44) }}>
          <ScreenHeader
            onBack={undefined}
            right={
              <TouchableOpacity
                onPress={() => navigation.navigate('RiskTrend')}
                style={styles.headerBtn}
                activeOpacity={0.7}
              >
                <Feather name="trending-up" size={14} color={theme.text.accent} />
                <Text style={styles.headerBtnText}>Trends</Text>
              </TouchableOpacity>
            }
          />
        </View>
        <View style={[styles.heroContent, { paddingBottom: Spacing.xl }]}>
          <Text style={styles.heroCategory}>RECORDS</Text>
          <Text style={styles.heroHeadline}>Prediction{'\n'}History</Text>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {FILTER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.filterChip, filter === opt && styles.filterChipActive]}
            onPress={() => setFilter(opt)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === opt && styles.filterTextActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading skeletons */}
        {isLoading && history.length === 0 && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Feather name="clock" size={40} color={theme.text.tertiary} />
            </View>
            <Text style={styles.emptyTitle}>No predictions yet</Text>
            <Text style={styles.emptySubtitle}>Start an analysis from the dashboard to see results here.</Text>
          </View>
        )}

        {/* Grouped predictions */}
        {Object.entries(grouped).map(([date, preds]) => (
          <View key={date}>
            <Text style={styles.dateLabel}>{date}</Text>
            {preds.map((pred, i) => {
              const d = Disease[pred.disease as DiseaseKey];
              const isPositive = pred.result === 'positive';
              return (
                <Animated.View key={pred.id} entering={FadeInDown.delay(i * 60).springify()}>
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('Result', { prediction: pred })}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.cardAccent, { backgroundColor: d?.color ?? theme.text.accent }]} />
                    <View style={styles.cardBody}>
                      <View style={styles.cardRow}>
                        <Text style={styles.diseaseName}>{d?.label ?? pred.disease}</Text>
                        <View style={[styles.resultPill, { backgroundColor: isPositive ? theme.semantic.danger + '18' : theme.semantic.success + '18' }]}>
                          <Text style={[styles.resultPillText, { color: isPositive ? theme.semantic.danger : theme.semantic.success }]}>
                            {isPositive ? 'HIGH RISK' : 'LOW RISK'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.cardMeta}>
                        <Text style={styles.metaText}>{pred.probability}% probability</Text>
                        <Text style={styles.metaDot}>·</Text>
                        <Text style={styles.metaText}>{pred.confidence} confidence</Text>
                      </View>
                    </View>
                    <Feather name="chevron-right" size={16} color={theme.text.tertiary} style={{ marginRight: 14 }} />
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        ))}
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
  headerBtn: {
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
  headerBtnText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.accent,
    letterSpacing: 0.5,
  },

  // Filter chips
  filterScroll: { maxHeight: 56, marginBottom: 4 },
  filterRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: theme.border.default,
    backgroundColor: theme.background.secondary,
  },
  filterChipActive: {
    backgroundColor: theme.surface.highlight,
    borderColor: theme.text.accent,
  },
  filterText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
    letterSpacing: 0.5,
  },
  filterTextActive: { color: theme.text.accent },

  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },

  dateLabel: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  // Cards
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background.secondary,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: theme.border.subtle,
    marginBottom: 8,
    overflow: 'hidden',
    minHeight: 72,
  },
  cardAccent: {
    width: 3,
    alignSelf: 'stretch',
    opacity: 0.6,
  },
  cardBody: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  diseaseName: {
    fontFamily: Typography.fontFamily.label,
    fontSize: Typography.fontSize.base,
    color: theme.text.primary,
  },
  resultPill: {
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  resultPillText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 10,
    color: theme.text.tertiary,
  },
  metaDot: {
    color: theme.text.tertiary,
    fontSize: 10,
  },

  // Empty state
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
