import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withSpring,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme, Typography, Spacing, Radius } from '../../utils/theme';
import { Button } from '../../components/ui/Button';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    category: 'AI SCREENING',
    title: 'Clinical precision in your pocket.',
    subtitle:
      'Five AI-powered models trained on clinical datasets predict disease likelihood with medical-grade accuracy.',
    icon: 'activity' as const,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '2',
    category: 'EXPLAINABILITY',
    title: 'Understand every result, completely.',
    subtitle:
      'Every prediction includes SHAP-based feature analysis. You see exactly why the model reached its conclusion.',
    icon: 'bar-chart-2' as const,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '3',
    category: 'LONGITUDINAL',
    title: 'Track your health across time.',
    subtitle:
      'Risk trend graphs show how your health indicators evolve across multiple assessments over time.',
    icon: 'trending-up' as const,
    image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1200&q=80',
  },
];

const SLIDE_W = width;

export const OnboardingScreen = ({ navigation }: any) => {
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<Animated.FlatList<any>>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const insets = useSafeAreaInsets();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => navigation.replace('Login');

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / SLIDE_W));
        }}
        renderItem={({ item }) => (
          <View style={{ width: SLIDE_W, height }}>
            {/* Full-bleed image */}
            <Image
              source={{ uri: item.image }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
              transition={400}
            />
            {/* Gradient overlay */}
            <LinearGradient
              colors={['transparent', 'transparent', theme.background.primary]}
              locations={[0, 0.4, 1]}
              style={StyleSheet.absoluteFillObject}
            />

            {/* Skip button */}
            <TouchableOpacity
              style={[styles.skipBtn, { top: insets.top + 16 }]}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>SKIP</Text>
            </TouchableOpacity>

            {/* Bottom content */}
            <View style={[styles.slideContent, { paddingBottom: insets.bottom + 160 }]}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      {/* Dots + CTA overlay */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => {
            const dotStyle = useAnimatedStyle(() => {
              const inputRange = [(i - 1) * SLIDE_W, i * SLIDE_W, (i + 1) * SLIDE_W];
              const w = interpolate(scrollX.value, inputRange, [6, 20, 6], Extrapolation.CLAMP);
              const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolation.CLAMP);
              return { width: w, opacity };
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, dotStyle]}
              />
            );
          })}
        </View>

        <Button
          label={currentIndex === SLIDES.length - 1 ? 'Begin' : 'Continue'}
          onPress={handleNext}
        />

        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>Create an account</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  slideContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
  },
  category: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.accent,
    letterSpacing: 3,
    marginBottom: 14,
  },
  title: {
    fontFamily: Typography.fontFamily.displayLight,
    fontSize: Typography.fontSize.display,
    color: theme.text.primary,
    letterSpacing: -1,
    lineHeight: Typography.fontSize.display * 1.15,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.md,
    color: theme.text.secondary,
    lineHeight: Typography.fontSize.md * 1.65,
  },
  skipBtn: {
    position: 'absolute',
    right: Spacing.lg,
  },
  skipText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
    letterSpacing: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    gap: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    height: 2,
    borderRadius: 1,
    backgroundColor: theme.text.accent,
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  registerText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
    letterSpacing: 1,
  },
});
