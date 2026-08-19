import React from 'react';
import { View, StyleSheet, Text, TextInput, Pressable, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, T, Button, BackLink } from '../ui/kit';
import VoiceComposer from '../ui/VoiceComposer';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { colors, font, radius, shadow } from '../theme';
import { useStore } from '../state/store';
import { addFascInterview } from '../lib/db';
import {
  nextQuestion,
  extractSignal,
  synthesizeArtifact,
  answerQuality,
  Turn,
  Question,
  Artifact,
} from '../lib/interview';

const MIN_Q = 6;
const MAX_Q = 9;

type Phase = 'loading' | 'asking' | 'synthesizing' | 'result' | 'error';

export default function FascInterviewScreen() {
  const { state, patch, go } = useStore();
  const interest = state.fascSeed;
  const firstName = 'Noah'; // TODO: pull from the signed-in profile

  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [current, setCurrent] = React.useState<Question | null>(null);
  const [draft, setDraft] = React.useState('');
  const [phase, setPhase] = React.useState<Phase>('loading');
  const [artifact, setArtifact] = React.useState<Artifact | null>(null);
  const [errorMsg, setErrorMsg] = React.useState('');
  const pending = React.useRef<'question' | 'finish'>('question');

  const loadFirst = React.useCallback(async () => {
    pending.current = 'question';
    setPhase('loading');
    try {
      const q = await nextQuestion(interest, []);
      setCurrent(q);
      setPhase('asking');
    } catch {
      setErrorMsg('Could not reach the interviewer. Check your connection and try again.');
      setPhase('error');
    }
  }, [interest]);

  React.useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  const finish = React.useCallback(
    async (allTurns: Turn[]) => {
      pending.current = 'finish';
      setPhase('synthesizing');
      try {
        const signal = await extractSignal(firstName, interest, allTurns);
        const art = await synthesizeArtifact(firstName, interest, signal);
        setArtifact(art);
        setPhase('result');
      } catch {
        setErrorMsg('Could not shape your artifact. Your answers are safe, tap to try again.');
        setPhase('error');
      }
    },
    [firstName, interest],
  );

  const advance = React.useCallback(
    async (allTurns: Turn[]) => {
      pending.current = 'question';
      setCurrent(null);
      setPhase('loading');
      try {
        const q = await nextQuestion(interest, allTurns);
        setCurrent(q);
        setPhase('asking');
      } catch {
        setErrorMsg('Could not load the next question. Tap to try again.');
        setPhase('error');
      }
    },
    [interest],
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

  const save = () => {
    if (!artifact) return;
    addFascInterview({
      bucket: state.fascBucket,
      seed: interest,
      transcript: turns.map((t) => ({ q: t.question, a: t.answer })),
      result: artifact.one_liner,
    });
    const fascDone = state.fascDone.includes(interest) ? state.fascDone : [...state.fascDone, interest];
    const saved = {
      interest,
      lens: state.fascBucket,
      title: artifact.title,
      oneLiner: artifact.one_liner,
      whyItPulls: artifact.deeper_mechanism,
      evidence: artifact.evidence || [],
      deeper: artifact.deeper_questions || [],
    };
    patch({
      screen: 'fascTopics',
      fTurn: 0,
      fascSeed: '',
      fascDone,
      savedArtifacts: { ...state.savedArtifacts, [interest]: saved },
    });
  };

  /* ---------------- result ---------------- */
  if (phase === 'result' && artifact) {
    return (
      <Screen contentStyle={styles.wrap}>
        <BackLink label="Fascinations" onPress={() => go('fascHub')} />
        <View style={styles.resultBadge}>
          <Text style={styles.resultBadgeText}>New fascination artifact</Text>
        </View>
        <T variant="title" style={styles.h1}>
          {artifact.title}
        </T>
        <T variant="body" style={styles.resultBody}>
          {artifact.one_liner}
        </T>

        {artifact.deeper_mechanism ? (
          <View style={styles.pullsCard}>
            <Text style={styles.pullsLabel}>Why it pulls you</Text>
            <Text style={styles.pullsBody}>{artifact.deeper_mechanism}</Text>
          </View>
        ) : null}

        {artifact.evidence?.length ? (
          <>
            <Text style={styles.evLabel}>What you said</Text>
            <View style={{ gap: 9, marginTop: 10 }}>
              {artifact.evidence.map((e, i) => (
                <Text key={i} style={styles.evItem}>
                  {e}
                </Text>
              ))}
            </View>
          </>
        ) : null}

        <Button title="Save to profile" onPress={save} style={{ marginTop: 24 }} />
        <Button
          title="Talk this through"
          variant="secondary"
          style={{ marginTop: 10 }}
          onPress={() => patch({ screen: 'chat', chatDraft: `Help me make sense of my thinking on ${interest}.` })}
        />
      </Screen>
    );
  }

  /* ---------------- synthesizing ---------------- */
  if (phase === 'synthesizing') {
    return (
      <Screen scroll={false} contentStyle={[styles.wrap, styles.center]}>
        <ActivityIndicator color={colors.ink} />
        <T variant="heading" style={{ marginTop: 18, textAlign: 'center' }}>
          Finding what pulls you.
        </T>
        <T variant="meta" style={{ marginTop: 8, textAlign: 'center' }}>
          Reading back through everything you said.
        </T>
      </Screen>
    );
  }

  /* ---------------- error ---------------- */
  if (phase === 'error') {
    return (
      <Screen scroll={false} contentStyle={[styles.wrap, styles.center]}>
        <Ionicons name="cloud-offline-outline" size={30} color={colors.muted} />
        <T variant="body" style={{ marginTop: 14, textAlign: 'center', maxWidth: '88%' }}>
          {errorMsg}
        </T>
        <Button title="Try again" onPress={retry} style={{ marginTop: 22, minWidth: 180 }} />
        <Pressable onPress={() => go('fascHub')} style={{ paddingVertical: 14 }} hitSlop={8}>
          <Text style={styles.leaveText}>Leave</Text>
        </Pressable>
      </Screen>
    );
  }

  /* ---------------- interviewing (asking / loading) ---------------- */
  const answeredCount = turns.length;
  const progress = Math.min(answeredCount / MIN_Q, 1);

  return (
    <Screen scroll contentStyle={styles.wrap}>
      <BackLink label="Fascinations" onPress={() => go('fascHub')} />

      <View style={styles.track}>
        <View style={[styles.trackFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
      <Text style={styles.turnLabel}>
        Question {answeredCount + 1} · about {interest}
      </Text>

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

      <VoiceComposer
        value={draft}
        onChangeText={setDraft}
        onSubmit={submit}
        disabled={phase !== 'asking'}
      />
    </Screen>
  );
}

// Three pulsing dots shown while the next question is being written.
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
  answerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },

  leaveText: { fontFamily: font.bold, fontSize: 14.5, color: colors.muted },

  h1: { marginTop: 16, fontSize: 28 },
  resultBadge: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  resultBadgeText: { fontFamily: font.bold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.accentInk },
  resultBody: { marginTop: 14, fontSize: 16.5, lineHeight: 24, color: colors.inkSoft },

  pullsCard: { marginTop: 20, padding: 18, borderRadius: radius.lg, backgroundColor: colors.tintLime, borderWidth: 1.5, borderColor: colors.accentDeep },
  pullsLabel: { fontFamily: font.bold, fontSize: 11, letterSpacing: 0.7, textTransform: 'uppercase', color: colors.accentInk },
  pullsBody: { fontFamily: font.medium, fontSize: 15.5, lineHeight: 23, color: '#23231F', marginTop: 9 },

  evLabel: { fontFamily: font.bold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.muted, marginTop: 24 },
  evItem: { fontFamily: font.medium, fontSize: 15, lineHeight: 22, color: colors.inkSoft, paddingLeft: 14, borderLeftWidth: 2, borderLeftColor: colors.lineStrong },
});
