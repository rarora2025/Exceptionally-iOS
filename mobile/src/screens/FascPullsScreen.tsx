import React from 'react';
import {
  View,
  StyleSheet,
  Text,
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
import { pullsNext, synthesizePulls, answerQuality, Turn, Question } from '../lib/interview';
import * as haptics from '../lib/haptics';

// One required opener + one required negative turn are injected server-side, so
// the cap is a safety net; the backend sets wrapUp when both sides are clear.
const MAX_Q = 6;

type Phase = 'loading' | 'asking' | 'finding' | 'error';

// Single adaptive interview for the day-to-day / environments lenses. Surfaces
// the kinds of work (or cultures) you love and the ones you dislike, then hands
// off to the result screen. You can stop early once there is enough to save.
export default function FascPullsScreen() {
  const { state, patch, go } = useStore();
  const lens = state.fascBucket;
  const bucket = FASC_BUCKETS.find((b) => b.key === lens) || FASC_BUCKETS[1];
  const firstName = 'Noah';

  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [current, setCurrent] = React.useState<Question | null>(null);
  const [draft, setDraft] = React.useState('');
  const [phase, setPhase] = React.useState<Phase>('loading');
  const [errorMsg, setErrorMsg] = React.useState('');
  const pending = React.useRef<'question' | 'finish'>('question');
  const scrollRef = React.useRef<ScrollView>(null);

  const loadFirst = React.useCallback(async () => {
    pending.current = 'question';
    setPhase('loading');
    try {
      const q = await pullsNext(lens, []);
      haptics.select();
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
      if (!allTurns.length) return;
      pending.current = 'finish';
      setPhase('finding');
      try {
        const result = await synthesizePulls(lens, firstName, allTurns);
        haptics.success();
        patch({
          fascPulls: { ...state.fascPulls, [lens]: { ...result, saved: false } },
          screen: 'fascPullsResult',
        });
      } catch {
        setErrorMsg('Could not pull that together. Your answers are safe, tap to try again.');
        setPhase('error');
      }
    },
    [lens, patch, state.fascPulls],
  );

  const advance = React.useCallback(
    async (allTurns: Turn[]) => {
      pending.current = 'question';
      setCurrent(null);
      setPhase('loading');
      try {
        const q = await pullsNext(lens, allTurns);
        haptics.select();
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
            Reading back through what you said.
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

  const canSaveEarly = turns.length >= 2;

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
                <Text style={styles.helper}>Focus on the actions, not the title or the result.</Text>
              ) : null}
            </>
          )}
        </ScrollView>

        {/* chill early-stop */}
        {canSaveEarly ? (
          <Pressable onPress={() => finish(turns)} style={styles.saveEarly} hitSlop={8}>
            <Text style={styles.saveEarlyText}>Save what we have for now</Text>
            <Ionicons name="arrow-forward" size={13} color={colors.link} />
          </Pressable>
        ) : null}

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

  thread: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 10 },
  bubble: { maxWidth: '86%', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 20 },
  ai: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderBottomLeftRadius: 6, ...shadow.soft },
  me: { alignSelf: 'flex-end', backgroundColor: colors.tintLilac, borderBottomRightRadius: 6 },
  aiText: { fontFamily: font.medium, fontSize: 15.5, lineHeight: 22, color: colors.ink },
  meText: { fontFamily: font.semi, fontSize: 15.5, lineHeight: 22, color: colors.ink },
  helper: { alignSelf: 'flex-start', maxWidth: '86%', fontFamily: font.medium, fontSize: 13, lineHeight: 18, color: colors.muted, marginTop: -2, marginLeft: 4 },
  typing: { paddingVertical: 16 },
  tdot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.muted },

  saveEarly: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8 },
  saveEarlyText: { fontFamily: font.bold, fontSize: 13.5, color: colors.link },

  composer: { paddingHorizontal: 20 },

  retryBtn: { marginTop: 22, backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 30, paddingVertical: 14 },
  retryText: { fontFamily: font.bold, fontSize: 15, color: colors.accentInk },
});
