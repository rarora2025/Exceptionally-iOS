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
import { T } from '../ui/kit';
import { colors, font, radius, shadow } from '../theme';
import { useStore, ChatThread } from '../state/store';
import { sendChat, ChatMsg } from '../lib/chat';
import { SUPER_STRENGTHS } from '../data/content';
import * as haptics from '../lib/haptics';

function Bubble({ role, text }: { role: 'me' | 'ai'; text: string }) {
  const anim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
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

function TypingDots() {
  const d = [React.useRef(new Animated.Value(0.3)).current, React.useRef(new Animated.Value(0.3)).current, React.useRef(new Animated.Value(0.3)).current];
  React.useEffect(() => {
    const loops = d.map((v, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 160),
        Animated.timing(v, { toValue: 1, duration: 340, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.3, duration: 340, useNativeDriver: true }),
      ])),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <View style={[styles.bubble, styles.ai, styles.typing]}>
      {d.map((v, i) => (
        <Animated.View key={i} style={[styles.tdot, { opacity: v, transform: [{ scale: v }] }]} />
      ))}
    </View>
  );
}

export default function ChatScreen() {
  const { state, patch, go } = useStore();
  const scrollRef = React.useRef<ScrollView>(null);
  const [thinking, setThinking] = React.useState(false);
  const [streaming, setStreaming] = React.useState<string | null>(null);
  const [error, setError] = React.useState('');
  const [renaming, setRenaming] = React.useState(false);
  const [renameText, setRenameText] = React.useState('');

  const chats = state.chats;
  const current = chats.find((c) => c.id === state.currentChatId) || chats[0];
  const messages = current?.messages ?? [];
  const hasDraft = !!state.chatDraft.trim();
  const busy = thinking || streaming !== null;

  const grounding = React.useMemo(() => {
    const arts = Object.values(state.savedArtifacts);
    return [
      'The person is Noah Reyes.',
      'Super strengths people see in them: ' + SUPER_STRENGTHS.map((s) => s.title).join('; ') + '.',
      arts.length ? 'Fascinations they explored: ' + arts.map((a) => a.title).join('; ') + '.' : '',
    ].filter(Boolean).join('\n');
  }, [state.savedArtifacts]);

  const setCurrent = (updater: (t: ChatThread) => ChatThread) =>
    patch({ chats: state.chats.map((c) => (c.id === current.id ? updater(c) : c)) });

  const newChat = () => {
    if (busy) return;
    haptics.tap();
    const id = 'c' + Date.now();
    patch({ chats: [{ id, title: 'New chat', messages: [] }, ...state.chats], currentChatId: id, chatDraft: '' });
    setError('');
  };

  const openChat = (id: string) => {
    if (busy) return;
    haptics.select();
    patch({ currentChatId: id });
    setError('');
  };

  const startRename = () => {
    setRenameText(current.title === 'New chat' ? '' : current.title);
    setRenaming(true);
  };
  const commitRename = () => {
    const t = renameText.trim();
    if (t) setCurrent((c) => ({ ...c, title: t }));
    setRenaming(false);
  };

  // Typewriter-reveal the reply into a local streaming bubble, then commit the
  // finished message to the thread. withUser already holds every prior message
  // plus the user's turn, so we replace the thread's messages wholesale.
  const reveal = (full: string, withUser: ChatMsg[]) => {
    let i = 0;
    setStreaming('');
    const run = () => {
      i = Math.min(full.length, i + 2);
      setStreaming(full.slice(0, i));
      if (i < full.length) {
        setTimeout(run, 14);
      } else {
        setStreaming(null);
        patch({
          chats: state.chats.map((c) =>
            c.id === current.id ? { ...c, messages: [...withUser, { role: 'ai', text: full }] } : c,
          ),
        });
      }
    };
    run();
  };

  const send = async () => {
    const text = state.chatDraft.trim();
    if (!text || busy) return;
    haptics.tap();
    const withUser: ChatMsg[] = [...messages, { role: 'me', text }];
    const title = messages.length === 0 ? text.slice(0, 42) : current.title;
    setCurrent((c) => ({ ...c, title, messages: withUser }));
    patch({ chatDraft: '' });
    setThinking(true);
    setError('');
    try {
      const reply = await sendChat(withUser, grounding);
      setThinking(false);
      if (reply) reveal(reply, withUser);
    } catch {
      setThinking(false);
      setError('Could not reach your coach. Check your connection and try again.');
    }
  };

  // Arrived from the Home composer with a message to send — fire it once.
  React.useEffect(() => {
    if (state.chatAutoSend && state.chatDraft.trim()) {
      patch({ chatAutoSend: false });
      send();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pastChats = chats.filter((c) => c.id !== current.id && c.messages.length > 0);
  const empty = messages.length === 0 && !busy;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <Pressable onPress={() => go('home')} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.muted} />
          </Pressable>
          {renaming ? (
            <TextInput
              value={renameText}
              onChangeText={setRenameText}
              onSubmitEditing={commitRename}
              onBlur={commitRename}
              autoFocus
              placeholder="Name this chat"
              placeholderTextColor={colors.muted}
              style={styles.renameInput}
            />
          ) : (
            <Pressable onPress={startRename} hitSlop={6} style={styles.titleWrap}>
              <Text style={styles.chatTitle} numberOfLines={1}>
                {current.title}
              </Text>
              <Ionicons name="pencil" size={12} color={colors.muted} />
            </Pressable>
          )}
          <Pressable onPress={newChat} hitSlop={8} style={styles.newBtn}>
            <Ionicons name="create-outline" size={17} color={colors.ink} />
            <Text style={styles.newText}>New</Text>
          </Pressable>
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
              <T variant="heading">
                What are you working through?
              </T>
              <T variant="body" style={{ marginTop: 10 }}>
                Ask about a role, a decision, or how to tell your story. Your coach answers from your real strengths
                and fascinations.
              </T>

              {pastChats.length ? (
                <View style={{ marginTop: 26 }}>
                  <Text style={styles.recentLabel}>Recent</Text>
                  <View style={{ gap: 8, marginTop: 10 }}>
                    {pastChats.slice(0, 6).map((c) => (
                      <Pressable key={c.id} onPress={() => openChat(c.id)} style={styles.recentRow}>
                        <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.muted} />
                        <Text style={styles.recentText} numberOfLines={1}>
                          {c.title}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}

          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} text={m.text} />
          ))}
          {thinking ? <TypingDots /> : null}
          {streaming !== null ? <Bubble key="stream" role="ai" text={streaming || ' '} /> : null}
          {error ? <Text style={styles.err}>{error}</Text> : null}
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
            disabled={!hasDraft || busy}
            style={[styles.send, { backgroundColor: hasDraft && !busy ? colors.ink : colors.disabled }]}
          >
            <Ionicons name="arrow-up" size={20} color={hasDraft && !busy ? colors.onDark : colors.disabledInk} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerBack: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: font.bold, fontSize: 15, color: colors.muted },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.surface, ...shadow.soft },
  newText: { fontFamily: font.bold, fontSize: 13.5, color: colors.ink },
  titleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 8 },
  chatTitle: { fontFamily: font.bold, fontSize: 15, color: colors.ink, maxWidth: '82%' },
  renameInput: { flex: 1, marginHorizontal: 8, textAlign: 'center', fontFamily: font.bold, fontSize: 15, color: colors.ink, borderBottomWidth: 1.5, borderBottomColor: colors.accent, paddingVertical: 2 },

  list: { paddingHorizontal: 20, paddingVertical: 12, gap: 12, flexGrow: 1 },
  emptyState: { flex: 1, justifyContent: 'center', paddingBottom: 40 },
  spark: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  recentLabel: { fontFamily: font.bold, fontSize: 10.5, letterSpacing: 0.7, textTransform: 'uppercase', color: colors.muted },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderRadius: radius.md, backgroundColor: colors.surface, ...shadow.soft },
  recentText: { flex: 1, fontFamily: font.semi, fontSize: 14.5, color: colors.ink },

  bubble: { maxWidth: '86%', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 20 },
  me: { alignSelf: 'flex-end', backgroundColor: colors.ink, borderBottomRightRadius: 6 },
  ai: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderBottomLeftRadius: 6, ...shadow.soft },
  bubbleText: { fontFamily: font.medium, fontSize: 15.5, lineHeight: 23, color: colors.ink },
  typing: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 16 },
  tdot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.muted },
  err: { fontFamily: font.semi, fontSize: 13.5, color: colors.danger, alignSelf: 'center', textAlign: 'center', maxWidth: '85%' },

  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 9, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 },
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
  },
  send: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
