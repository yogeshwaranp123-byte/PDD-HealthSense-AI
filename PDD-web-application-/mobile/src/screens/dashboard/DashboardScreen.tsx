import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withDelay,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { usePredictionStore } from '../../store/predictionStore';
import { theme, Typography, Spacing, Radius, Disease, DiseaseKey } from '../../utils/theme';

const { width, height } = Dimensions.get('window');
const HERO_H = height * 0.58;
const DISEASE_KEYS = Object.keys(Disease) as DiseaseKey[];

const HERO_IMAGE = 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=1200&q=80';

// Small horizontal card
const PredictionCard = ({ pred, index, onPress }: any) => {
  const d = Disease[pred.disease as DiseaseKey];
  const isPositive = pred.result === 'positive';

  const animStyle = useAnimatedStyle(() => ({
    opacity: withDelay(index * 60, withSpring(1)),
    transform: [
      {
        translateY: withDelay(
          index * 60,
          withSpring(0, { damping: 20, stiffness: 200 })
        ),
      },
    ],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <TouchableOpacity
        style={styles.historyCard}
        onPress={onPress}
        activeOpacity={1}
      >
        <View style={[styles.historyAccent, { backgroundColor: d?.color ?? theme.text.accent }]} />
        <View style={styles.historyCardBody}>
          <Text style={styles.historyDisease}>{d?.label ?? pred.disease}</Text>
          <Text style={styles.historyDate}>
            {pred.created_at ? new Date(pred.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent'}
          </Text>
        </View>
        <View style={styles.historyRight}>
          <View style={[styles.resultPill, { backgroundColor: isPositive ? theme.semantic.danger + '22' : theme.semantic.success + '22' }]}>
            <Text style={[styles.resultPillText, { color: isPositive ? theme.semantic.danger : theme.semantic.success }]}>
              {isPositive ? 'HIGH RISK' : 'LOW RISK'}
            </Text>
          </View>
          <Text style={styles.historyProb}>{pred.probability}%</Text>
        </View>
        <Feather name="chevron-right" size={16} color={theme.text.tertiary} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export const DashboardScreen = ({ navigation }: any) => {
  const { profile, fetchProfile } = useUserStore();
  const { history, fetchHistory } = usePredictionStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const insets = useSafeAreaInsets();

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useEffect(() => {
    fetchProfile();
    fetchHistory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchHistory()]);
    setRefreshing(false);
  };

  const recentPredictions = history.slice(0, 5);
  const firstName = profile?.name?.split(' ')[0] ?? 'Doctor';

  // Parallax: hero image moves at 40% of scroll speed
  const heroImageStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, HERO_H],
          [0, HERO_H * 0.4],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  // Sticky header fade in after scrolling past hero
  const stickyHeaderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [HERO_H - 80, HERO_H - 20],
      [0, 1],
      Extrapolation.CLAMP
    ),
    pointerEvents: scrollY.value > HERO_H - 80 ? 'auto' : 'none',
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Sticky compact header */}
      <Animated.View style={[styles.stickyHeader, { paddingTop: insets.top }, stickyHeaderStyle]}>
        <Text style={styles.stickyTitle}>HealthSense</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.avatarSmall}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarSmallText}>
            {(profile?.name ?? 'U').charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.text.accent}
          />
        }
      >
        {/* Hero */}
        <View style={[styles.hero, { height: HERO_H }]}>
          <Animated.View style={[StyleSheet.absoluteFillObject, heroImageStyle]}>
            <Image
              source={{ uri: HERO_IMAGE }}
              style={[StyleSheet.absoluteFillObject, { height: HERO_H * 1.5 }]}
              contentFit="cover"
              transition={400}
            />
          </Animated.View>

          {/* Bottom-up gradient */}
          <LinearGradient
            colors={['transparent', 'transparent', theme.background.primary]}
            locations={[0, 0.35, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Top-down scrim so wordmark/avatar always readable */}
          <LinearGradient
            colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.15)', 'transparent']}
            locations={[0, 0.3, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Top row */}
          <View style={[styles.heroTop, { paddingTop: Math.max(insets.top, 44) + 12 }]}>
            <View style={styles.wordmarkRow}>
              <Text style={styles.wordmarkLetter}>H</Text>
              <Text style={styles.wordmarkSub}>EALTHSENSE</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={styles.avatar}
              activeOpacity={0.8}
            >
              <Text style={styles.avatarText}>
                {(profile?.name ?? 'U').charAt(0).toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom left content */}
          <View style={styles.heroBottom}>
            <Text style={styles.heroCategory}>HEALTH OVERVIEW</Text>
            <Text style={styles.heroHeadline}>
              {`Good ${getTimeOfDay()},\n${firstName}.`}
            </Text>
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>QUICK ACCESS</Text>
          <View style={styles.quickGrid}>
            {[
              { icon: 'activity', label: 'New Assessment', sub: 'Start a screening', onPress: () => navigation.navigate('Predict', { disease: 'diabetes' }) },
              { icon: 'clock', label: 'History', sub: 'Past results', onPress: () => navigation.navigate('Predict', { screen: 'HistoryList' }) },
              { icon: 'map-pin', label: 'Hospitals', sub: 'Nearby care', onPress: () => navigation.navigate('Hospitals') },
              { icon: 'message-circle', label: 'Ask AI', sub: 'Health questions', onPress: () => navigation.navigate('Chat') },
            ].map((item, i) => (
              <QuickCard key={i} {...item} index={i} />
            ))}
          </View>
        </View>

        {/* ── Health Summary ── */}
        {history.length > 0 && (
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.section}>
            <Text style={styles.sectionLabel}>YOUR SUMMARY</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                {(['positive', 'negative'] as const).map((type) => {
                  const count = history.filter((h) => h.result === type).length;
                  const isRisk = type === 'positive';
                  return (
                    <View key={type} style={styles.summaryItem}>
                      <Text style={[styles.summaryCount, { color: isRisk ? theme.semantic.danger : theme.semantic.success }]}>
                        {count}
                      </Text>
                      <Text style={styles.summaryLabel}>{isRisk ? 'High Risk' : 'Low Risk'}</Text>
                      <Text style={styles.summaryMeta}>assessments</Text>
                    </View>
                  );
                })}
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryCount, { color: theme.text.accent }]}>{history.length}</Text>
                  <Text style={styles.summaryLabel}>Total</Text>
                  <Text style={styles.summaryMeta}>screenings</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* ── Disease Modules ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DISEASE MODULES</Text>
          <View style={styles.moduleGrid}>
            {DISEASE_KEYS.map((key, i) => {
              const d = Disease[key];
              return (
                <Animated.View key={key} entering={FadeInDown.delay(i * 80).springify()}>
                  <TouchableOpacity
                    style={styles.moduleCard}
                    onPress={() => navigation.navigate('Predict', { disease: key })}
                    activeOpacity={0.85}
                  >
                    <Image
                      source={{ uri: d.image }}
                      style={styles.moduleImage}
                      contentFit="cover"
                      transition={300}
                    />
                    <LinearGradient
                      colors={['transparent', theme.background.secondary]}
                      locations={[0.3, 1]}
                      style={StyleSheet.absoluteFill}
                    />
                    {/* Tag */}
                    <View style={styles.moduleTagContainer}>
                      <View style={styles.moduleTag}>
                        <Text style={styles.moduleTagText}>{d.time}</Text>
                      </View>
                    </View>
                    {/* Bottom content */}
                    <View style={styles.moduleContent}>
                      <View style={styles.moduleIconRow}>
                        <Feather name={d.icon as any} size={14} color={d.color} />
                      </View>
                      <Text style={styles.moduleName}>{d.label}</Text>
                      <Text style={styles.moduleMeta}>{d.params} parameters</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* ── Recent Predictions ── */}
        {recentPredictions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>RECENT</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Predict', { screen: 'HistoryList' })}>
                <Text style={styles.seeAll}>View all</Text>
              </TouchableOpacity>
            </View>
            {recentPredictions.map((pred, index) => (
              <PredictionCard
                key={pred.id}
                pred={pred}
                index={index}
                onPress={() => navigation.navigate('Result', { prediction: pred })}
              />
            ))}
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
};

// Quick action card with spring press
const QuickCard = ({ icon, label, sub, onPress, index }: any) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View
      style={[styles.quickCard, animStyle]}
      entering={FadeInDown.delay(index * 50).springify()}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={1}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
        style={styles.quickCardInner}
      >
        <View style={styles.quickIconWrap}>
          <Feather name={icon} size={18} color={theme.text.accent} />
        </View>
        <Text style={styles.quickLabel}>{label}</Text>
        <Text style={styles.quickSub}>{sub}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background.primary },
  scroll: { flex: 1 },

  // Sticky header
  stickyHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: 12,
    backgroundColor: theme.background.primary + 'EE',
    borderBottomWidth: 0.5,
    borderBottomColor: theme.border.subtle,
  },
  stickyTitle: {
    fontFamily: Typography.fontFamily.displayLight,
    fontSize: Typography.fontSize.xl,
    color: theme.text.primary,
    letterSpacing: -0.5,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.surface.highlight,
    borderWidth: 1,
    borderColor: theme.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xxs,
    color: theme.text.accent,
  },

  // Hero
  hero: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 0,
  },
  wordmarkLetter: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: Typography.fontSize.xxl,
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  wordmarkSub: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 3,
    marginLeft: 2,
    marginBottom: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.60)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Typography.fontFamily.displayBold,
    fontSize: Typography.fontSize.base,
    color: '#FFFFFF',
  },
  heroBottom: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  heroCategory: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.accent,
    letterSpacing: 3,
    marginBottom: 10,
  },
  heroHeadline: {
    fontFamily: Typography.fontFamily.displayLight,
    fontSize: Typography.fontSize.display,
    color: theme.text.primary,
    letterSpacing: -1,
    lineHeight: Typography.fontSize.display * 1.2,
  },

  // Sections
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
    letterSpacing: 3,
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.accent,
    letterSpacing: 0.5,
  },

  // Quick grid
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickCard: {
    width: (width - Spacing.lg * 2 - 10) / 2,
    borderRadius: Radius.xl,
    backgroundColor: theme.background.secondary,
    borderWidth: 1,
    borderColor: theme.border.subtle,
    overflow: 'hidden',
  },
  quickCardInner: {
    padding: 20,
  },
  quickIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: theme.surface.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickLabel: {
    fontFamily: Typography.fontFamily.label,
    fontSize: Typography.fontSize.base,
    color: theme.text.primary,
    marginBottom: 4,
  },
  quickSub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
  },

  // Summary card
  summaryCard: {
    backgroundColor: theme.background.secondary,
    borderRadius: Radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.border.subtle,
  },
  summaryCount: {
    fontFamily: Typography.fontFamily.displayLight,
    fontSize: Typography.fontSize.xxl,
    letterSpacing: -1,
  },
  summaryLabel: {
    fontFamily: Typography.fontFamily.label,
    fontSize: Typography.fontSize.xs,
    color: theme.text.secondary,
    marginTop: 4,
  },
  summaryMeta: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 10,
    color: theme.text.tertiary,
    marginTop: 2,
  },

  // Module cards 2-column grid
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moduleCard: {
    width: (width - Spacing.lg * 2 - 10) / 2,
    height: 200,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: theme.background.secondary,
    borderWidth: 1,
    borderColor: theme.border.subtle,
    justifyContent: 'flex-end',
  },
  moduleImage: {
    ...StyleSheet.absoluteFillObject as any,
    height: 200,
  },
  moduleTagContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  moduleTag: {
    backgroundColor: theme.surface.highlight,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  moduleTagText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 10,
    color: theme.text.accent,
    letterSpacing: 0.5,
  },
  moduleContent: {
    padding: 16,
  },
  moduleIconRow: {
    marginBottom: 6,
  },
  moduleName: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.lg,
    color: theme.text.primary,
    marginBottom: 2,
  },
  moduleMeta: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 10,
    color: theme.text.tertiary,
    letterSpacing: 0.3,
  },

  // History cards (small horizontal)
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    borderRadius: Radius.lg,
    backgroundColor: theme.background.secondary,
    borderWidth: 1,
    borderColor: theme.border.subtle,
    marginBottom: 8,
    overflow: 'hidden',
    paddingRight: 14,
  },
  historyAccent: {
    width: 3,
    alignSelf: 'stretch',
    marginRight: 14,
    opacity: 0.7,
  },
  historyCardBody: {
    flex: 1,
  },
  historyDisease: {
    fontFamily: Typography.fontFamily.label,
    fontSize: Typography.fontSize.base,
    color: theme.text.primary,
    marginBottom: 4,
  },
  historyDate: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 10,
    color: theme.text.tertiary,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 4,
    marginLeft: 12,
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
  historyProb: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.secondary,
  },
});
