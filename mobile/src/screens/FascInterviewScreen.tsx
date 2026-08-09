import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, T, Button, BackLink } from '../ui/kit';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { colors, font, radius, shadow } from '../theme';
import { useStore } from '../state/store';
import { addFascInterview } from '../lib/db';
import { FASC_QUESTIONS } from '../data/content';

const RESULT_TEXT =
  'You keep circling who gets to make the call. Not the technology, the accountability: when people hand a decision to an agent versus when they refuse to, and who ends up answering for it.';

// Combines the seeded interview and its result. While fTurn is within range we
// show the current question and a canned answer; after the last turn, the result.
export default function FascInterviewScreen() {
  const { state, patch, go } = useStore();
  const total = FASC_QUESTIONS.length;
  const [answered, setAnswered] = React.useState(false);

  const done = state.fTurn >= total;

  if (done) {
    return (
      <Screen contentStyle={styles.wrap}>
        <BackLink label="Fascinations" onPress={() => go('fascHub')} />
        <View style={styles.resultBadge}>
          <Text style={styles.resultBadgeText}>New fascination artifact</Text>
        </View>
        <T variant="title" style={styles.h1}>
          {state.fascSeed}
        </T>
        <T variant="body" style={styles.resultBody}>
          You keep circling who gets to make the call. Not the technology, the accountability: when people hand a
          decision to an agent versus when they refuse to, and who ends up answering for it.
        </T>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteMark}>"</Text>
          <Text style={styles.quoteText}>
            Accuracy cannot be what is doing the work. People refuse things the model is measurably better at.
          </Text>
        </View>

        <Button
          title="Save to profile"
          onPress={() => {
            addFascInterview({
              bucket: state.fascBucket,
              seed: state.fascSeed,
              transcript: FASC_QUESTIONS.map((q) => ({ q: q.q, a: q.canned })),
              result: RESULT_TEXT,
            });
            patch({ screen: 'profile', fTurn: 0 });
          }}
          style={{ marginTop: 22 }}
        />
        <Button
          title="Talk this through"
          variant="secondary"
          style={{ marginTop: 10 }}
          onPress={() => patch({ screen: 'chat', chatDraft: `Help me make sense of my thinking on ${state.fascSeed}.` })}
        />
      </Screen>
    );
  }

  const q = FASC_QUESTIONS[state.fTurn];

  const next = () => {
    setAnswered(false);
    patch({ fTurn: state.fTurn + 1 });
  };

  return (
    <Screen scroll contentStyle={styles.wrap}>
      <BackLink label="Fascinations" onPress={() => go('fascHub')} />

      <View style={styles.progressRow}>
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} style={[styles.pip, i <= state.fTurn && styles.pipOn]} />
        ))}
      </View>
      <Text style={styles.turnLabel}>
        Question {state.fTurn + 1} of {total} · about {state.fascSeed}
      </Text>

      <View style={styles.qBubble}>
        <View style={styles.dot} />
        <Text style={styles.qText}>{q.q}</Text>
      </View>

      {answered ? (
        <View style={styles.aBubble}>
          <Text style={styles.aText}>{q.canned}</Text>
        </View>
      ) : null}

      <View style={{ flex: 1, minHeight: 20 }} />

      {answered ? (
        <Button title={state.fTurn + 1 === total ? 'See what emerged' : 'Next question'} variant="dark" onPress={next} />
      ) : (
        <Pressable style={styles.answerBtn} onPress={() => setAnswered(true)}>
          <Ionicons name="mic" size={18} color={colors.accentInk} />
          <Text style={styles.answerText}>Answer with an example</Text>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 12, paddingBottom: TAB_BAR_SPACE },

  progressRow: { flexDirection: 'row', gap: 6, marginTop: 18 },
  pip: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.surfaceSunken },
  pipOn: { backgroundColor: colors.accent },
  turnLabel: { fontFamily: font.bold, fontSize: 12.5, color: colors.muted, marginTop: 12 },

  qBubble: { flexDirection: 'row', gap: 12, marginTop: 20, alignItems: 'flex-start' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent, marginTop: 8 },
  qText: { flex: 1, fontFamily: font.displaySemi, fontSize: 22, lineHeight: 28, letterSpacing: -0.5, color: colors.ink },

  aBubble: {
    alignSelf: 'flex-end',
    marginTop: 18,
    maxWidth: '90%',
    backgroundColor: colors.ink,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    padding: 15,
  },
  aText: { fontFamily: font.medium, fontSize: 15, lineHeight: 22, color: colors.onDark },

  answerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    height: 56,
    ...shadow.accent,
  },
  answerText: { fontFamily: font.bold, fontSize: 16, color: colors.accentInk },

  h1: { marginTop: 16, fontSize: 30, textTransform: 'capitalize' },
  resultBadge: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  resultBadgeText: { fontFamily: font.bold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.accentInk },
  resultBody: { marginTop: 14, fontSize: 16.5, lineHeight: 24, color: colors.inkSoft },
  quoteCard: { marginTop: 20, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20, ...shadow.card },
  quoteMark: { fontFamily: font.display, fontSize: 44, color: colors.accent, height: 30, lineHeight: 44 },
  quoteText: { fontFamily: font.semi, fontSize: 16.5, lineHeight: 24, color: colors.ink, marginTop: 6 },
});
