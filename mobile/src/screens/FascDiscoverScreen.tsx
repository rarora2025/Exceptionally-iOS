import React from 'react';
import { View, StyleSheet, Text, TextInput, Pressable, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, T, Button, BackLink } from '../ui/kit';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { colors, font, radius, shadow } from '../theme';
import { useStore } from '../state/store';
import { FASC_BUCKETS } from '../data/content';
import { discoverNext, discoverTopics, answerQuality, Turn, Question } from '../lib/interview';

const MIN_Q = 4;
const MAX_Q = 6;

type Phase = 'loading' | 'asking' | 'finding' | 'error';

export default function FascDiscoverScreen() {
  const { state, patch, go } = useStore();
  const lens = state.fascBucket;
  const bucket = FASC_BUCKETS.find((b) => b.key === lens) || FASC_BUCKETS[0];
  const firstName = 'Noah'; // TODO: from the signed-in profile

  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [current, setCurrent] = React.useState<Question | null>(null);
  const [draft, setDraft] = React.useState('');
  const [phase, setPhase] = React.useState<Phase>('loading');
  const [errorMsg, setErrorMsg] = React.useState('');
  const pending = React.useRef<'question' | 'finish'>('question');

  const loadFirst = React.useCallback(async () => {
    pending.current = 'question';
    setPhase('loading');
    try {
      const q = await discoverNext(lens, []);
      setCurrent(q);
      setPhase('asking');
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
        patch({ fascTopics: { ...state.fascTopics, [lens]: topics }, screen: 'fascTopics' });
      } catch {
        setErrorMsg('Could not pull out your topics. Your answers are safe, tap to try again.');
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
        const q = await discoverNext(lens, allTurns);
        setCurrent(q);
        setPhase('asking');
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
      <Screen scroll={false} contentStyle={[styles.wrap, styles.center]}>
        <ActivityIndicator color={colors.ink} />
        <T variant="heading" style={{ marginTop: 18, textAlign: 'center' }}>
          One sec.
        </T>
        <T variant="meta" style={{ marginTop: 8, textAlign: 'center' }}>
          Reading back through what you said.
        </T>
      </Screen>
    );
  }

  if (phase === 'error') {
    return (
      <Screen scroll={false} contentStyle={[styles.wrap, styles.center]}>
        <Ionicons name="cloud-offline-outline" size={30} color={colors.muted} />
        <T variant="body" style={{ marginTop: 14, textAlign: 'center', maxWidth: '88%' }}>
          {errorMsg}
        </T>
        <Button title="Try again" onPress={retry} style={{ marginTop: 22, minWidth: 180 }} />
        <Pressable onPress={() => go('fascBucket')} style={{ paddingVertical: 14 }} hitSlop={8}>
          <Text style={styles.leaveText}>Back</Text>
        </Pressable>
      </Screen>
    );
  }

  const progress = Math.min(turns.length / MIN_Q, 1);
  return (
    <Screen scroll contentStyle={styles.wrap}>
      <BackLink label={bucket.title} onPress={() => go('fascBucket')} />

      <View style={styles.track}>
        <View style={[styles.trackFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
      <Text style={styles.turnLabel}>Question {turns.length + 1}</Text>

      {phase === 'loading' || !current ? (
        <View style={styles.qBubble}>
          <View style={styles.dot} />
          <ThinkingDots />
        </View>
      ) : (
        <View style={styles.qBubble}>
          <View style={styles.dot} />
          <Text style={styles.qText}>{current.questionText}</Text>
        </View>
      )}

      <View style={{ flex: 1, minHeight: 16 }} />

      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder="Answer in a sentence or two…"
        placeholderTextColor={colors.muted}
        multiline
        editable={phase === 'asking'}
        style={styles.answerInput}
      />
      <Button
        title={current?.wrapUp ? 'See my topics' : 'Continue'}
        variant="dark"
        disabled={phase !== 'asking' || !draft.trim()}
        onPress={submit}
        style={{ marginTop: 12 }}
      />
    </Screen>
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
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', height: 28 }}>
      {[d0, d1, d2].map((d, i) => (
        <Animated.View key={i} style={[styles.tdot, { opacity: d, transform: [{ scale: d }] }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 12, paddingBottom: TAB_BAR_SPACE },
  center: { alignItems: 'center', justifyContent: 'center' },

  track: { marginTop: 18, height: 6, borderRadius: 3, backgroundColor: colors.surfaceSunken, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 3, backgroundColor: colors.accent },
  turnLabel: { fontFamily: font.bold, fontSize: 12.5, color: colors.muted, marginTop: 12 },

  qBubble: { flexDirection: 'row', gap: 12, marginTop: 20, alignItems: 'flex-start' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent, marginTop: 9 },
  qText: { flex: 1, fontFamily: font.displaySemi, fontSize: 22, lineHeight: 28, letterSpacing: -0.5, color: colors.ink },
  tdot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.muted },

  answerInput: {
    minHeight: 96,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    padding: 15,
    fontFamily: font.medium,
    fontSize: 15.5,
    lineHeight: 22,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  leaveText: { fontFamily: font.bold, fontSize: 14.5, color: colors.muted },
});
