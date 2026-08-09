import React from 'react';
import { View, StyleSheet, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { T, BackLink } from '../ui/kit';
import { colors, font, radius } from '../theme';
import { useStore } from '../state/store';
import { addChatMessage } from '../lib/db';

const AI_REPLY =
  'Good question. Based on your artifacts, the strongest thread is that you name the decision a group has not made and put it in writing. Want me to pull the two examples that prove it?';

export default function ChatScreen() {
  const { state, patch, go } = useStore();
  const scrollRef = React.useRef<ScrollView>(null);

  const send = () => {
    const text = state.chatDraft.trim();
    if (!text) return;
    patch({ chatLog: [...state.chatLog, { role: 'me', text }], chatDraft: '' });
    addChatMessage('me', text);
    setTimeout(() => {
      patch({ chatLog: [...state.chatLog, { role: 'me', text }, { role: 'ai', text: AI_REPLY }] });
      addChatMessage('ai', AI_REPLY);
    }, 600);
  };

  const empty = state.chatLog.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
            <View
              key={i}
              style={[styles.bubble, m.role === 'me' ? styles.me : styles.ai]}
            >
              <Text style={[styles.bubbleText, m.role === 'me' && { color: colors.onDark }]}>{m.text}</Text>
            </View>
          ))}
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
          <Pressable onPress={send} style={styles.send}>
            <Ionicons name="arrow-up" size={20} color={colors.onDark} />
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

  bubble: { maxWidth: '86%', padding: 14, borderRadius: 20 },
  me: { alignSelf: 'flex-end', backgroundColor: colors.ink, borderBottomRightRadius: 6 },
  ai: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderBottomLeftRadius: 6 },
  bubbleText: { fontFamily: font.medium, fontSize: 15.5, lineHeight: 23, color: colors.ink },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 9,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontFamily: font.medium,
    fontSize: 15.5,
    color: colors.ink,
  },
  send: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
});
