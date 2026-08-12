import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { T, BackLink } from '../ui/kit';
import { colors, font, radius, shadow } from '../theme';
import { useStore } from '../state/store';
import { addChatMessage } from '../lib/db';
import * as haptics from '../lib/haptics';

const AI_REPLY =
  'Good question. Based on your artifacts, the strongest thread is that you name the decision a group has not made and put it in writing. Want me to pull the two examples that prove it?';

// A chat bubble that fades and slides up as it arrives.
function Bubble({ role, text }: { role: 'me' | 'ai'; text: string }) {
  const anim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim]);
  return (
    <Animated.View
      style={[
        styles.bubble,
        role === 'me' ? styles.me : styles.ai,
        { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] },
      ]}
    >
      <Text style={[styles.bubbleText, role === 'me' && { color: colors.onDark }]}>{text}</Text>
    </Animated.View>
  );
}

// Three gently pulsing dots while the assistant is composing a reply.
function TypingDots() {
  const d0 = React.useRef(new Animated.Value(0.3)).current;
  const d1 = React.useRef(new Animated.Value(0.3)).current;
  const d2 = React.useRef(new Animated.Value(0.3)).current;
  React.useEffect(() => {
    const dots = [d0, d1, d2];
    const loops = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(d, { toValue: 1, duration: 340, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.3, duration: 340, useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [d0, d1, d2]);
  return (
    <View style={[styles.bubble, styles.ai, styles.typing]}>
      {[d0, d1, d2].map((d, i) => (
        <Animated.View key={i} style={[styles.typingDot, { opacity: d, transform: [{ scale: d }] }]} />
      ))}
    </View>
  );
}

export default function ChatScreen() {
  const { state, patch, go } = useStore();
  const scrollRef = React.useRef<ScrollView>(null);
  const [thinking, setThinking] = React.useState(false);
  const hasDraft = !!state.chatDraft.trim();

  const send = () => {
    const text = state.chatDraft.trim();
    if (!text || thinking) return;
    haptics.tap();
    const withMine = [...state.chatLog, { role: 'me' as const, text }];
    patch({ chatLog: withMine, chatDraft: '' });
    addChatMessage('me', text);
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      patch({ chatLog: [...withMine, { role: 'ai', text: AI_REPLY }] });
      addChatMessage('ai', AI_REPLY);
    }, 1100);
  };

  const empty = state.chatLog.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <BackLink label="Home" onPress={() => go('home')} />
        </View>

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {empty ? (
            <View style={styles.emptyState}>
              <View style={styles.spark}>
                <Ionicons name="sparkles" size={22} color={colors.accentInk} />
              </View>
              <T variant="heading" style={{ marginTop: 16 }}>
                Think it through with everything people saw in you.
              </T>
              <T variant="body" style={{ marginTop: 10 }}>
                Ask about a role, a decision, or how to tell your story. Answers pull from your real artifacts.
              </T>
            </View>
          ) : null}

          {state.chatLog.map((m, i) => (
            <Bubble key={i} role={m.role} text={m.text} />
          ))}
          {thinking ? <TypingDots /> : null}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            value={state.chatDraft}
            onChangeText={(t) => patch({ chatDraft: t })}
            placeholder="Ask anything"
            placeholderTextColor={colors.muted}
            multiline
            style={styles.input}
          />
          <Pressable
            onPress={send}
            disabled={!hasDraft || thinking}
            style={[styles.send, { backgroundColor: hasDraft && !thinking ? colors.ink : colors.disabled }]}
          >
            <Ionicons name="arrow-up" size={20} color={hasDraft && !thinking ? colors.onDark : colors.disabledInk} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 24, paddingTop: 8 },
  list: { paddingHorizontal: 24, paddingVertical: 16, gap: 12, flexGrow: 1 },
  emptyState: { flex: 1, justifyContent: 'center', paddingBottom: 60 },
  spark: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },

  bubble: { maxWidth: '86%', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 20 },
  me: { alignSelf: 'flex-end', backgroundColor: colors.ink, borderBottomRightRadius: 6 },
  ai: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderBottomLeftRadius: 6, ...shadow.soft },
  bubbleText: { fontFamily: font.medium, fontSize: 15.5, lineHeight: 23, color: colors.ink },

  typing: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 16 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.muted },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 9,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 6,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 132,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 13 : 8,
    paddingBottom: Platform.OS === 'ios' ? 13 : 8,
    fontFamily: font.medium,
    fontSize: 15.5,
    lineHeight: 21,
    color: colors.ink,
    textAlignVertical: 'center',
  },
  send: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
