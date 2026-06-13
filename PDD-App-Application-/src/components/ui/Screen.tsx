import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ScrollView,
  ScrollViewProps,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../utils/theme';

type ScreenProps =
  | ({
      preset?: 'fixed';
      children: React.ReactNode;
      style?: ViewStyle;
      contentStyle?: ViewStyle;
      edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
    })
  | ({
      preset: 'scroll';
      children: React.ReactNode;
      style?: ViewStyle;
      contentStyle?: ViewStyle;
      edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
      scrollProps?: Omit<ScrollViewProps, 'contentContainerStyle' | 'children'>;
    });

export function Screen(props: ScreenProps) {
  const insets = useSafeAreaInsets();
  const edges = props.edges ?? ['top', 'bottom', 'left', 'right'];

  const baseContent: ViewStyle = {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  };

  // If we're not consuming a safe edge, we should add inset padding ourselves.
  if (!edges.includes('top')) baseContent.paddingTop = Spacing.lg + insets.top;
  if (!edges.includes('bottom')) baseContent.paddingBottom = Spacing.lg + insets.bottom;
  if (!edges.includes('left')) baseContent.paddingLeft = Spacing.lg + insets.left;
  if (!edges.includes('right')) baseContent.paddingRight = Spacing.lg + insets.right;

  if (props.preset === 'scroll') {
    return (
      <SafeAreaView edges={edges} style={[styles.safe, props.style]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          {...props.scrollProps}
          contentContainerStyle={[baseContent, props.contentStyle]}
        >
          {props.children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={edges} style={[styles.safe, props.style]}>
      <View style={[baseContent, props.contentStyle]}>{props.children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
});

