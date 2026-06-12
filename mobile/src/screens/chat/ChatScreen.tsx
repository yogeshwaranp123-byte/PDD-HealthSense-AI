import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Dimensions,
} from 'react-native';
import Animated, { FadeInDown, useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatService } from '../../services/endpoints';
import { theme, Typography, Spacing, Radius } from '../../utils/theme';

const { height } = Dimensions.get('window');
const HERO_H = 180;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Animated send button
const SendButton = ({ onPress, disabled }: { onPress: () => void; disabled: boolean }) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        style={[styles.sendBtn, disabled && styles.sendBtnDisabled]}
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => { scale.value = withSpring(0.93, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
        activeOpacity={1}
      >
        <Feather name="send" size={16} color={disabled ? theme.text.tertiary : theme.background.primary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const renderMessageContent = (content: string, isUser: boolean) => {
  if (isUser) {
    return (
      <Text style={[styles.bubbleText, styles.bubbleTextUser]}>
        {content}
      </Text>
    );
  }

  const lines = content.split('\n');
  return (
    <View style={styles.markdownContainer}>
      {lines.map((line, index) => {
        let isHeader = false;
        let isListItem = false;
        let cleanText = line.trim();

        if (cleanText.startsWith('#')) {
          isHeader = true;
          cleanText = cleanText.replace(/^#+\s*/, '');
        } else if (cleanText.startsWith('* ') || cleanText.startsWith('- ')) {
          isListItem = true;
          cleanText = cleanText.substring(2);
        } else if (/^\d+\.\s+/.test(cleanText)) {
          isListItem = true;
          const match = cleanText.match(/^(\d+\.\s+)/);
          if (match) {
            cleanText = cleanText.substring(match[1].length);
          }
        }

        if (line.trim() === '' && index !== lines.length - 1) {
          return <View key={index} style={{ height: 6 }} />;
        }

        const parts = cleanText.split('**');
        const renderedTextElements = parts.map((part, partIndex) => {
          const isBold = partIndex % 2 === 1;
          return (
            <Text
              key={partIndex}
              style={[
                isBold && { fontWeight: 'bold' },
                { color: theme.text.primary }
              ]}
            >
              {part}
            </Text>
          );
        });

        if (isHeader) {
          return (
            <Text
              key={index}
              style={[
                styles.markdownHeader,
                { marginTop: index > 0 ? 12 : 4, marginBottom: 6 }
              ]}
            >
              {renderedTextElements}
            </Text>
          );
        }

        if (isListItem) {
          return (
            <View key={index} style={styles.markdownListRow}>
              <Text style={styles.markdownBullet}>•</Text>
              <Text style={styles.markdownListText}>
                {renderedTextElements}
              </Text>
            </View>
          );
        }

        return (
          <Text key={index} style={styles.markdownParagraph}>
            {renderedTextElements}
          </Text>
        );
      })}
    </View>
  );
};

export const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Hello. I\'m your AI health assistant. I can answer general health questions and help you understand medical concepts. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    try {
      const reply = await chatService.sendMessage(input.trim());
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I couldn\'t process your request. Please check your connection and try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Compact hero header */}
      <View style={[styles.hero, { paddingTop: insets.top }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=80' }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={400}
        />
        <LinearGradient
          colors={['rgba(12,12,11,0.3)', theme.background.primary]}
          locations={[0, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.heroContent}>
          <View style={styles.aiIconWrap}>
            <Feather name="message-circle" size={18} color={theme.text.accent} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>AI Health Assistant</Text>
            <Text style={styles.heroSub}>For information only — not medical advice.</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.messages, { paddingBottom: Spacing.lg }]}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
              <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
                {item.role === 'assistant' && (
                  <View style={styles.aiBadge}>
                    <Feather name="cpu" size={8} color={theme.text.accent} />
                    <Text style={styles.aiBadgeText}>AI</Text>
                  </View>
                )}
                {renderMessageContent(item.content, item.role === 'user')}
                <Text style={[styles.timestamp, item.role === 'user' && styles.timestampUser]}>
                  {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </Animated.View>
          )}
          ListFooterComponent={
            isTyping ? (
              <View style={[styles.bubble, styles.bubbleAI]}>
                <View style={styles.typingRow}>
                  {[0, 1, 2].map((i) => (
                    <View key={i} style={[styles.typingDot, { opacity: 0.3 + i * 0.35 }]} />
                  ))}
                </View>
              </View>
            ) : null
          }
        />

        {/* Input row */}
        <View
          style={[
            styles.inputRow,
            { paddingBottom: Math.max(insets.bottom + 72, 80) },
          ]}
        >
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Ask a health question..."
            placeholderTextColor={theme.text.tertiary}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <SendButton onPress={sendMessage} disabled={!input.trim() || isTyping} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background.primary },
  flex: { flex: 1 },

  hero: {
    height: HERO_H,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: 12,
  },
  aiIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface.highlight,
    borderWidth: 1,
    borderColor: theme.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1 },
  heroTitle: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.xl,
    color: theme.text.primary,
    letterSpacing: -0.3,
  },
  heroSub: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 10,
    color: theme.text.tertiary,
    letterSpacing: 0.3,
    marginTop: 3,
  },

  messages: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },

  // Bubbles
  bubble: {
    maxWidth: '86%',
    borderRadius: Radius.xl,
    padding: 14,
    marginBottom: Spacing.sm,
  },
  bubbleUser: {
    backgroundColor: theme.text.accent,
    alignSelf: 'flex-end',
    borderBottomRightRadius: Radius.sm,
  },
  bubbleAI: {
    backgroundColor: theme.background.secondary,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: Radius.sm,
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: theme.surface.highlight,
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 7,
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  aiBadgeText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 9,
    color: theme.text.accent,
    letterSpacing: 1,
  },
  bubbleText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.base,
    color: theme.text.primary,
    lineHeight: Typography.fontSize.base * 1.65,
  },
  bubbleTextUser: { color: theme.background.primary },
  timestamp: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 9,
    color: theme.text.tertiary,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  timestampUser: { color: theme.background.primary + '99' },

  // Typing indicator
  typingRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    minHeight: 20,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.text.accent,
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: theme.border.subtle,
    gap: 10,
    backgroundColor: theme.background.primary,
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.background.secondary,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: theme.border.default,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.base,
    color: theme.text.primary,
    maxHeight: 120,
    lineHeight: Typography.fontSize.base * 1.5,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.text.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: {
    backgroundColor: theme.background.secondary,
    borderWidth: 1,
    borderColor: theme.border.default,
  },
  markdownContainer: {
    gap: 4,
  },
  markdownHeader: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.md,
    fontWeight: 'bold',
    color: theme.text.primary,
    lineHeight: Typography.fontSize.md * 1.4,
  },
  markdownParagraph: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.base,
    color: theme.text.primary,
    lineHeight: Typography.fontSize.base * 1.5,
    marginBottom: 4,
  },
  markdownListRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingLeft: 4,
    marginBottom: 3,
  },
  markdownBullet: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.base,
    color: theme.text.accent,
    lineHeight: Typography.fontSize.base * 1.4,
  },
  markdownListText: {
    flex: 1,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.base,
    color: theme.text.primary,
    lineHeight: Typography.fontSize.base * 1.5,
  },
});
