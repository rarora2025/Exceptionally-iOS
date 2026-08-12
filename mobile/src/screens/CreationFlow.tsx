import React from 'react';
import { View, StyleSheet, Text, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, T, Button, Avatar } from '../ui/kit';
import { colors, font, radius, shadow } from '../theme';
import { useStore } from '../state/store';
import { CREATION_QUESTIONS } from '../data/content';

/* ---- Landing (shared invite link) ---- */
export function CLandScreen() {
  const { go } = useStore();
  return (
    <Screen scroll={false} contentStyle={styles.wrap}>
      <View style={styles.asker}>
        <Avatar initials="N" tint={colors.accent} size={38} />
        <View>
          <Text style={styles.askerName}>Noah Reyes</Text>
          <Text style={styles.askerSub}>asked for your perspective on him</Text>
        </View>
      </View>

      <T variant="display" style={{ marginTop: 26, fontSize: 36 }}>
        Noah would love your help with something meaningful.
      </T>
      <View style={styles.rule} />
      <T variant="body" style={{ marginTop: 18 }}>
        He's using Exceptionally to better understand what is genuinely exceptional about him, and how he can put
        those qualities to work in his career.
      </T>
      <T variant="body" style={{ marginTop: 12 }}>
        You'll be guided through a short, interactive interview. Respond by voice or text, pause any time, and
        review everything before submitting.
      </T>

      <View style={{ flex: 1 }} />

      <View style={styles.stats}>
        <View>
          <Text style={styles.statNum}>5 min</Text>
          <Text style={styles.statLabel}>Typical length</Text>
        </View>
        <View>
          <Text style={styles.statNum}>Voice or text</Text>
          <Text style={styles.statLabel}>However you prefer</Text>
        </View>
      </View>
      <Button title="Begin interview" variant="dark" onPress={() => go('cIntro')} />
    </Screen>
  );
}

/* ---- Intro ---- */
export function CIntroScreen() {
  const { go } = useStore();
  return (
    <Screen scroll contentStyle={styles.wrap}>
      <T variant="title" style={{ marginTop: 12 }}>
        Before you begin.
      </T>
      <T variant="body" style={{ marginTop: 18 }}>
        We're interested in what you've personally seen that feels genuinely exceptional about him. How he sees
        things, approaches problems, makes things happen, or affects the people around him.
      </T>

      <View style={styles.comboCard}>
        <Text style={styles.comboLabel}>Look for the combination</Text>
        <Text style={styles.comboBody}>
          It's rarely one single trait. What makes someone exceptional is usually the mix. Think the athlete who's
          also brilliant at calculus, or the engineer everyone actually wants in the room. What combination makes
          Noah hard to replace?
        </Text>
      </View>

      <T variant="body" style={{ marginTop: 16 }}>
        We'll ask a few follow-ups to understand the moments behind what you share. Specific examples help, but
        begin wherever feels easiest.
      </T>
      <View style={{ flex: 1, minHeight: 16 }} />
      <Button title="Start" variant="dark" onPress={() => go('cInterview')} />
    </Screen>
  );
}

/* ---- Interview ---- */
export function CInterviewScreen() {
  const { state, patch, go } = useStore();
  const total = CREATION_QUESTIONS.length;
  const [answered, setAnswered] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const q = CREATION_QUESTIONS[Math.min(state.cTurn, total - 1)];

  const answer = () => {
    setDraft(q.canned);
    setAnswered(true);
  };
  const next = () => {
    setAnswered(false);
    setDraft('');
    if (state.cTurn + 1 >= total) patch({ screen: 'cReview' });
    else patch({ cTurn: state.cTurn + 1 });
  };

  return (
    <Screen scroll contentStyle={styles.wrap}>
      <View style={styles.dots}>
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} style={[styles.dot, i <= state.cTurn && styles.dotOn]} />
        ))}
      </View>
      <Text style={styles.turn}>Question {state.cTurn + 1} of {total}</Text>

      <View style={styles.qBubble}>
        <Text style={styles.qText}>{q.q}</Text>
      </View>

      {answered ? (
        <View style={styles.aBubble}>
          <Text style={styles.aText}>{draft}</Text>
        </View>
      ) : null}

      <View style={{ flex: 1, minHeight: 20 }} />

      {answered ? (
        <View style={{ flexDirection: 'row', gap: 9 }}>
          <Button title={state.cTurn + 1 >= total ? 'Review your story' : 'Next'} variant="dark" style={{ flex: 1 }} onPress={next} />
          <Button title="Redo" variant="secondary" compact onPress={() => setAnswered(false)} />
        </View>
      ) : (
        <View style={styles.recorder}>
          <Pressable onPress={answer} style={styles.mic}>
            <Ionicons name="mic" size={24} color={colors.accentInk} />
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={(t) => {
              setDraft(t);
              setAnswered(t.length > 0);
            }}
            placeholder="or type here"
            placeholderTextColor={colors.muted}
            multiline
            style={styles.typeField}
          />
        </View>
      )}
    </Screen>
  );
}

/* ---- Review ---- */
const REVIEW_ACTIONS = [
  { key: 'confirm', label: 'Yes, that is him' },
  { key: 'mostly', label: 'Mostly' },
  { key: 'off', label: 'Something is off' },
];
const ATTRIBUTIONS = [
  { key: 'name', label: 'From Maya Fischer', dot: colors.accent },
  { key: 'anon', label: 'Anonymous', dot: colors.surfaceSunken },
];

export function CReviewScreen() {
  const { state, patch, go } = useStore();
  return (
    <Screen contentStyle={styles.wrap}>
      <T variant="title" style={{ marginTop: 12 }}>
        Review your story.
      </T>

      <View style={styles.reviewCard}>
        <View style={{ padding: 20 }}>
          <Text style={styles.reviewTitle}>The one who finds what matters and what to do next</Text>
          <Text style={styles.reviewBody}>
            You described Noah as someone who sees the real problem inside a confusing situation, reorganises it
            around what matters, and builds a practical path to a decision.
          </Text>
          <Text style={styles.reviewEyebrow}>What you repeatedly saw</Text>
          {[
            'He identifies the underlying issue rather than the surface symptom.',
            'He gives complicated situations a structure other people can follow.',
            'He does not stop at analysis, he proposes a way forward.',
          ].map((s) => (
            <Text key={s} style={styles.reviewLine}>{s}</Text>
          ))}
          <Text style={styles.reviewEyebrow}>In your words</Text>
          <Text style={styles.reviewQuote}>"He stops the back-and-forth and writes down what each person is assuming."</Text>
        </View>
        <View style={styles.reviewFoot}>
          <Text style={styles.reviewFootText}>This is the artifact sent to Noah</Text>
        </View>
      </View>

      <View style={styles.feedbackCard}>
        <Text style={styles.feedbackTitle}>Does this look right?</Text>
        <Text style={styles.feedbackSub}>You can change it before it is sent.</Text>
        <View style={styles.feedbackRow}>
          {REVIEW_ACTIONS.map((a) => {
            const on = state.reviewAction === a.key;
            return (
              <Pressable key={a.key} onPress={() => patch({ reviewAction: a.key })} style={[styles.pill, on && styles.pillOn]}>
                <Text style={[styles.pillText, on && { color: colors.accentInk }]}>{a.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.attrCard}>
        <Text style={styles.attrEyebrow}>Noah sees this as</Text>
        <View style={{ gap: 8, marginTop: 12 }}>
          {ATTRIBUTIONS.map((a) => {
            const on = state.attribution === a.key;
            return (
              <Pressable key={a.key} onPress={() => patch({ attribution: a.key })} style={[styles.attrRow, on && styles.attrRowOn]}>
                <View style={[styles.attrDot, { backgroundColor: on ? a.dot : colors.surface }]} />
                <Text style={styles.attrLabel}>{a.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Button title="Send to Noah" variant="dark" style={{ marginTop: 16 }} onPress={() => go('cDone')} />
    </Screen>
  );
}

/* ---- Done ---- */
export function CDoneScreen() {
  const { patch } = useStore();
  return (
    <Screen scroll={false} contentStyle={[styles.wrap, { paddingTop: 120 }]}>
      <View style={styles.check}>
        <Text style={styles.checkMark}>✓</Text>
      </View>
      <T variant="display" style={{ marginTop: 26, fontSize: 38 }}>
        Sent. Thanks, Maya.
      </T>
      <View style={styles.ctaCard}>
        <Text style={styles.ctaTitle}>Want to know what your people would say?</Text>
        <Button
          title="Start yours"
          variant="dark"
          style={{ marginTop: 16 }}
          onPress={() => patch({ screen: 'auth', cTurn: 0 })}
        />
      </View>
      <View style={{ flex: 1 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 22, paddingBottom: 20 },
  asker: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  askerName: { fontFamily: font.bold, fontSize: 14, color: colors.ink },
  askerSub: { fontFamily: font.medium, fontSize: 13, color: colors.muted },
  rule: { width: 46, height: 3, backgroundColor: colors.ink, marginTop: 24, borderRadius: 2 },
  stats: { flexDirection: 'row', gap: 26, paddingVertical: 16, borderTopWidth: 1.5, borderTopColor: colors.line, marginBottom: 12 },
  statNum: { fontFamily: font.display, fontSize: 18, color: colors.ink, letterSpacing: -0.4 },
  statLabel: { fontFamily: font.semi, fontSize: 12.5, color: colors.muted, marginTop: 2 },

  comboCard: { marginTop: 20, padding: 18, borderRadius: radius.lg, backgroundColor: colors.tintLime, borderWidth: 1.5, borderColor: colors.accentDeep },
  comboLabel: { fontFamily: font.bold, fontSize: 11, letterSpacing: 0.7, textTransform: 'uppercase', color: colors.accentInk },
  comboBody: { fontFamily: font.medium, fontSize: 15.5, lineHeight: 23, color: '#23231F', marginTop: 9 },

  dots: { flexDirection: 'row', gap: 6, marginTop: 8 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.surfaceSunken },
  dotOn: { backgroundColor: colors.accent },
  turn: { fontFamily: font.bold, fontSize: 12.5, color: colors.muted, marginTop: 14 },
  qBubble: { alignSelf: 'flex-start', maxWidth: '90%', marginTop: 20, padding: 18, borderRadius: 22, borderBottomLeftRadius: 6, backgroundColor: colors.surfaceSunken },
  qText: { fontFamily: font.displaySemi, fontSize: 20, lineHeight: 26, letterSpacing: -0.4, color: colors.ink },
  aBubble: { alignSelf: 'flex-end', maxWidth: '92%', marginTop: 16, padding: 15, borderRadius: 22, borderBottomRightRadius: 6, backgroundColor: colors.tintBlue },
  aText: { fontFamily: font.medium, fontSize: 15.5, lineHeight: 23, color: colors.ink },
  recorder: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  mic: { width: 66, height: 66, borderRadius: 33, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', ...shadow.accent },
  typeField: { flex: 1, minHeight: 66, borderRadius: 22, borderWidth: 1.5, borderColor: colors.lineStrong, backgroundColor: colors.surface, paddingHorizontal: 16, paddingTop: 14, fontFamily: font.medium, fontSize: 15, color: colors.ink },

  reviewCard: { marginTop: 22, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface, ...shadow.card },
  reviewTitle: { fontFamily: font.displayBold, fontSize: 25, lineHeight: 27, letterSpacing: -0.7, color: colors.ink },
  reviewBody: { fontFamily: font.medium, fontSize: 15.5, lineHeight: 23, color: '#23231F', marginTop: 14 },
  reviewEyebrow: { fontFamily: font.bold, fontSize: 10.5, letterSpacing: 0.7, textTransform: 'uppercase', color: colors.muted, marginTop: 18 },
  reviewLine: { fontFamily: font.medium, fontSize: 15, lineHeight: 21, color: '#3A3A35', marginTop: 9 },
  reviewQuote: { fontFamily: font.medium, fontSize: 15, lineHeight: 22, color: colors.inkSoft, marginTop: 12, paddingLeft: 14, borderLeftWidth: 2, borderLeftColor: colors.lineStrong },
  reviewFoot: { paddingVertical: 11, paddingHorizontal: 20, backgroundColor: colors.surfaceSunken },
  reviewFootText: { fontFamily: font.bold, fontSize: 12.5, color: colors.inkSoft },

  feedbackCard: { marginTop: 11, padding: 20, borderRadius: radius.lg, backgroundColor: '#E9EEFC' },
  feedbackTitle: { fontFamily: font.displayBold, fontSize: 20, letterSpacing: -0.5, color: colors.ink },
  feedbackSub: { fontFamily: font.medium, fontSize: 13.5, color: '#3A3A35', marginTop: 7 },
  feedbackRow: { flexDirection: 'row', gap: 7, marginTop: 15 },
  pill: { flex: 1, alignItems: 'center', paddingVertical: 11, paddingHorizontal: 6, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.lineStrong, backgroundColor: colors.surface },
  pillOn: { backgroundColor: colors.accent, borderColor: colors.accentDeep },
  pillText: { fontFamily: font.bold, fontSize: 12.5, color: colors.ink },

  attrCard: { marginTop: 11, padding: 20, borderRadius: radius.lg, backgroundColor: colors.surfaceSunken },
  attrEyebrow: { fontFamily: font.bold, fontSize: 11, letterSpacing: 0.7, textTransform: 'uppercase', color: colors.muted },
  attrRow: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, borderRadius: radius.md, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.surface },
  attrRowOn: { borderColor: colors.ink },
  attrDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.ink },
  attrLabel: { fontFamily: font.bold, fontSize: 14.5, color: colors.ink },

  check: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  checkMark: { fontFamily: font.bold, fontSize: 28, color: colors.accentInk },
  ctaCard: { marginTop: 34, padding: 22, borderRadius: radius.lg, backgroundColor: colors.surface, ...shadow.card },
  ctaTitle: { fontFamily: font.displayBold, fontSize: 23, lineHeight: 26, letterSpacing: -0.6, color: colors.ink },
});
