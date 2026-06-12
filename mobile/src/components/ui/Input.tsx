import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  KeyboardTypeOptions,
} from 'react-native';
import { theme, Typography, Spacing, Radius } from '../../utils/theme';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  hint?: string;
  style?: ViewStyle;
  multiline?: boolean;
  numberOfLines?: number;
  rightElement?: React.ReactNode;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  hint,
  style,
  multiline = false,
  numberOfLines = 1,
  rightElement,
  autoCapitalize = 'sentences',
}) => {
  const [focused, setFocused] = useState(false);
  const isNumeric = keyboardType === 'numeric' || keyboardType === 'number-pad' || keyboardType === 'decimal-pad';

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputWrapperFocused,
          !!error && styles.inputWrapperError,
        ]}
      >
        <TextInput
          style={[styles.input, isNumeric && styles.inputMono, multiline && styles.multiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.text.tertiary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCapitalize={autoCapitalize}
        />
        {rightElement}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background.secondary,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: theme.border.default,
    paddingHorizontal: Spacing.md,
  },
  inputWrapperFocused: {
    borderColor: theme.border.strong,
  },
  inputWrapperError: { borderColor: theme.semantic.danger },
  input: {
    flex: 1,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.md,
    color: theme.text.primary,
    paddingVertical: 16,
  },
  inputMono: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.base,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top', paddingTop: 14 },
  error: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.semantic.danger,
    marginTop: 4,
  },
  hint: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
    marginTop: 4,
  },
});
