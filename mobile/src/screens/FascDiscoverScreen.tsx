import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { T } from '../ui/kit';
import VoiceComposer from '../ui/VoiceComposer';
import { colors, font, radius, shadow } from '../theme';
import { useStore } from '../state/store';
import { FASC_BUCKETS } from '../data/content';
import { discoverNext, discoverTopics, answerQuality, Turn, Question } from '../lib/interview';
import * as haptics from '../lib/haptics';

const MIN_Q = 3;
const MAX_Q = 5;

type Phase = 'loading' | 'asking' | 'finding' | 'error';

export default function FascDiscoverScreen() {
  const { state, patch, go } = useStore();
  const lens = state.fascBucket;
  const bucket = FASC_BUCKETS.find((b) => b.key === lens) || FASC_BUCKETS[0];
  const firstName = 'Noah';

  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [current, setCurrent] = React.useState<Question | null>(null);
  const [list, setList] = React.useState<string[]>([]);
  const [draft, setDraft] = React.useState('');
  const [phase, setPhase] = React.useState<Phase>('loading');
  const [errorMsg, setErrorMsg] = React.useState('');
  const pending = React.useRef<'question' | 'finish'>('question');
  const scrollRef = React.useRef<ScrollView>(null);

  const applyQuestion = (q: Question) => {
    haptics.select(); // interviewer poses a question
    setCurrent(q);
    if (q.listSoFar?.length) setList(q.listSoFar);
    setPhase('asking');
  };

  const loadFirst = React.useCallback(async () => {
    pending.current = 'question';
    setPhase('loading');
    try {
      applyQuestion(await discoverNext(lens, []));
    } catch {
      setErrorMsg('Could not reach the interviewer. Check your connection and try again.');
      setPhase('error');
    }
  }, [lens]);

  React.useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  const finish = React.useCallback(
    async (allTurns: Turn[]) => {
      pending.current = 'finish';
      setPhase('finding');
      try {
        const topics = await discoverTopics(lens, firstName, allTurns);
        haptics.success();
        patch({ fascTopics: { ...state.fascTopics, [lens]: topics }, screen: 'fascTopics' });
      } catch {
        setErrorMsg('Could not pull that together. Your answers are safe, tap to try again.');
        setPhase('error');
      }
    },
    [lens, patch, state.fascTopics],
  );

  const advance = React.useCallback(
    async (allTurns: Turn[]) => {
      pending.current = 'question';
      setCurrent(null);
      setPhase('loading');
      try {
        applyQuestion(await discoverNext(lens, allTurns));
      } catch {
        setErrorMsg('Could not load the next question. Tap to try again.');
        setPhase('error');
      }
    },
    [lens],
  );

  const submit = () => {
    const a = draft.trim();
    if (!a || !current) return;
    haptics.tap();
    const turn: Turn = { question: current.questionText, answer: a, quality: answerQuality(a) };
    const allTurns = [...turns, turn];
    setTurns(allTurns);
    setDraft('');
    if (current.wrapUp || allTurns.length >= MAX_Q) finish(allTurns);
    else advance(allTurns);
  };

  const retry = () => {
    if (pending.current === 'finish') finish(turns);
    else if (turns.length === 0) loadFirst();
    else advance(turns);
  };

  if (phase === 'finding') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.ink} />
          <T variant="heading" style={{ marginTop: 18, textAlign: 'center' }}>
            One sec.
          </T>
          <T variant="meta" style={{ marginTop: 8, textAlign: 'center' }}>
            Reading back through your list.
          </T>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={30} color={colors.muted} />
          <T variant="body" style={{ marginTop: 14, textAlign: 'center', maxWidth: '82%' }}>
            {errorMsg}
          </T>
          <Pressable onPress={retry} style={styles.retryBtn}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
          <Pressable onPress={() => go('fascBucket')} style={{ paddingVertical: 14 }} hitSlop={8}>
            <Text style={styles.pause}>Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* header */}
        <View style={styles.header}>
          <Pressable onPress={() => go('fascBucket')} hitSlop={8} style={styles.headerBack}>
            <Ionicons name="arrow-back" size={20} color={colors.muted} />
            <Text style={styles.headerTitle}>{bucket.title}</Text>
          </Pressable>
          <Pressable onPress={() => go('fascBucket')} hitSlop={8}>
            <Text style={styles.pause}>Pause</Text>
          </Pressable>
        </View>

        {/* your list so far */}
        {list.length ? (
          <View style={styles.listBlock}>
            <View style={styles.listHead}>
              <Text style={styles.listLabel}>Your list so far</Text>
              {list.length >= 2 ? (
                <Pressable onPress={() => finish(turns)} style={styles.saveBtn} hitSlop={8}>
                  <Text style={styles.saveText}>Save these</Text>
                  <Ionicons name="arrow-forward" size={13} color={colors.accentInk} />
                </Pressable>
              ) : null}
            </View>
            <View style={styles.chipWrap}>
              {list.map((item) => (
                <View key={item} style={styles.chip}>
                  <Text style={styles.chipText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* thread */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.thread}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {turns.map((t, i) => (
            <React.Fragment key={i}>
              <View style={[styles.bubble, styles.ai]}>
                <Text style={styles.aiText}>{t.question}</Text>
              </View>
              <View style={[styles.bubble, styles.me]}>
                <Text style={styles.meText}>{t.answer}</Text>
              </View>
            </React.Fragment>
          ))}

          {phase === 'loading' || !current ? (
            <View style={[styles.bubble, styles.ai, styles.typing]}>
              <ThinkingDots />
            </View>
          ) : (
            <>
              <View style={[styles.bubble, styles.ai]}>
                <Text style={styles.aiText}>{current.questionText}</Text>
              </View>
              {turns.length === 0 ? (
                <Text style={styles.helper}>Name as many as come to mind, for any reason.</Text>
              ) : null}
            </>
          )}
        </ScrollView>

        {/* composer */}
        <View style={styles.composer}>
          <VoiceComposer value={draft} onChangeText={setDraft} onSubmit={submit} disabled={phase !== 'asking'} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ThinkingDots() {
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
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
      {[d0, d1, d2].map((d, i) => (
        <Animated.View key={i} style={[styles.tdot, { opacity: d, transform: [{ scale: d }] }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },
  headerBack: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: font.bold, fontSize: 15, color: colors.ink },
  pause: { fontFamily: font.bold, fontSize: 14.5, color: colors.muted },

  listBlock: { paddingHorizontal: 20, paddingBottom: 8 },
  listHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  listLabel: { fontFamily: font.bold, fontSize: 10.5, letterSpacing: 0.7, textTransform: 'uppercase', color: colors.accentInk },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.accent, ...shadow.soft },
  saveText: { fontFamily: font.bold, fontSize: 12, color: colors.accentInk },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 9 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.lineStrong },
  chipText: { fontFamily: font.bold, fontSize: 12.5, color: colors.inkSoft },

  thread: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 10 },
  bubble: { maxWidth: '86%', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 20 },
  ai: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderBottomLeftRadius: 6, ...shadow.soft },
  me: { alignSelf: 'flex-end', backgroundColor: colors.tintLilac, borderBottomRightRadius: 6 },
  aiText: { fontFamily: font.medium, fontSize: 15.5, lineHeight: 22, color: colors.ink },
  meText: { fontFamily: font.semi, fontSize: 15.5, lineHeight: 22, color: colors.ink },
  helper: { alignSelf: 'flex-start', maxWidth: '86%', fontFamily: font.medium, fontSize: 13, lineHeight: 18, color: colors.muted, marginTop: -2, marginLeft: 4 },
  typing: { paddingVertical: 16 },
  tdot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.muted },

  composer: { paddingHorizontal: 20 },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 130,
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

  retryBtn: { marginTop: 22, backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 30, paddingVertical: 14 },
  retryText: { fontFamily: font.bold, fontSize: 15, color: colors.accentInk },
});
