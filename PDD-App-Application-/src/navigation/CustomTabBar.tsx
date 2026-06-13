import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../utils/theme';

const TAB_ICON_MAP: Record<string, keyof typeof Feather.glyphMap> = {
  Home:      'home',
  Predict:   'activity',
  Chat:      'message-circle',
  Hospitals: 'map-pin',
  Profile:   'user',
};

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const TAB_H = 68;
  const totalH = TAB_H + Math.max(insets.bottom, 0);

  return (
    <View style={[styles.container, { height: totalH }]}>
      <BlurView
        intensity={60}
        tint="dark"
        style={[StyleSheet.absoluteFillObject, styles.blur]}
      />
      <View style={[styles.topBorder]} />
      <View style={[styles.tabRow, { paddingBottom: Math.max(insets.bottom, 4) }]}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const iconName = TAB_ICON_MAP[route.name] ?? 'circle';

          const indicatorWidth = useSharedValue(isFocused ? 16 : 0);
          const indicatorOpacity = useSharedValue(isFocused ? 1 : 0);

          React.useEffect(() => {
            indicatorWidth.value = withSpring(isFocused ? 16 : 0, {
              damping: 20,
              stiffness: 200,
            });
            indicatorOpacity.value = withSpring(isFocused ? 1 : 0, {
              damping: 20,
              stiffness: 200,
            });
          }, [isFocused]);

          const indicatorStyle = useAnimatedStyle(() => ({
            width: indicatorWidth.value,
            opacity: indicatorOpacity.value,
          }));

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <Feather
                name={iconName}
                size={22}
                color={isFocused ? theme.text.accent : theme.text.tertiary}
                style={styles.icon}
              />
              <Animated.View style={[styles.indicator, indicatorStyle]} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.background.primary,
  },
  blur: {
    backgroundColor: theme.background.secondary + 'CC',
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: theme.border.subtle,
  },
  tabRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  icon: {},
  indicator: {
    height: 2,
    borderRadius: 1,
    backgroundColor: theme.text.accent,
  },
});
