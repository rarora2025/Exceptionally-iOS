import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, T, Button, BackLink } from '../ui/kit';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { colors, font, radius, shadow } from '../theme';
import { useStore } from '../state/store';
import { FASC_BUCKETS } from '../data/content';
import * as haptics from '../lib/haptics';

const COPY: Record<string, { title: string; sub: string; loves: string; drains: string }> = {
  work: {
    title: 'What work pulls you',
    sub: 'The kinds of day-to-day work you naturally love — and the work you want less of.',
    loves: 'Work you love',
    drains: 'Work that drains you',
  },
  places: {
    title: 'Where you enjoy working',
    sub: 'The cultures that make work feel rewarding — and the ones you would rather avoid.',
    loves: 'Cultures you enjoy',
    drains: 'Cultures that drain you',
  },
};

export default function FascPullsResultScreen() {
  const { state, patch, go } = useStore();
  const lens = state.fascBucket;
  const bucket = FASC_BUCKETS.find((b) => b.key === lens) || FASC_BUCKETS[1];
  const data = state.fascPulls[lens];
  const copy = COPY[lens] || COPY.work;

  if (!data) {
    return (
      <Screen contentStyle={styles.wrap}>
        <BackLink label="Fascinations" onPress={() => go('fascHub')} />
        <T variant="title" style={styles.h1}>
          {bucket.heading}
        </T>
        <Button title="Start the interview" onPress={() => patch({ screen: 'fascPulls' })} style={{ marginTop: 24 }} />
      </Screen>
    );
  }

  const { pulls, dislikes, saved } = data;

  const save = () => {
    haptics.success();
    patch({ fascPulls: { ...state.fascPulls, [lens]: { ...data, saved: true } } });
  };

  const explore = (title: string) => {
    haptics.tap();
    patch({ screen: 'fascInterview', fascSeed: title, fTurn: 0, fTranscript: '' });
  };

  return (
    <Screen contentStyle={styles.wrap}>
      <BackLink label="Fascinations" onPress={() => go('fascHub')} />
      <T variant="title" style={styles.h1}>
        {copy.title}
      </T>
      <T variant="body" style={styles.sub}>
        {copy.sub}
      </T>

      {!saved ? (
        <View style={styles.confirm}>
          <Ionicons name="sparkles" size={15} color={colors.accentInk} />
          <Text style={styles.confirmText}>Does this capture it? Save it, or run it again below.</Text>
        </View>
      ) : null}

      {pulls.length ? <Text style={styles.section}>{copy.loves}</Text> : null}
      <View style={{ gap: 12, marginTop: 12 }}>
        {pulls.map((p) => (
          <View key={p.title} style={styles.card}>
            <Text style={styles.cardTitle}>{p.title}</Text>
            <Text style={styles.whyLabel}>Why it pulls you</Text>
            <Text style={styles.whyBody}>{p.why}</Text>
            {p.love?.length ? (
              <View style={styles.chips}>
                {p.love.map((l) => (
                  <View key={l} style={styles.chip}>
                    <Text style={styles.chipText}>{l}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            <Pressable onPress={() => explore(p.title)} style={styles.explore} hitSlop={6}>
              <Text style={styles.exploreText}>Explore this more</Text>
              <Ionicons name="arrow-forward" size={13} color={colors.link} />
            </Pressable>
          </View>
        ))}
      </View>

      {dislikes.length ? (
        <>
          <Text style={[styles.section, { marginTop: 26 }]}>{copy.drains}</Text>
          <View style={{ gap: 10, marginTop: 12 }}>
            {dislikes.map((d) => (
              <View key={d.title} style={styles.dislikeCard}>
                <Text style={styles.dislikeTitle}>{d.title}</Text>
                <Text style={styles.dislikeNote}>{d.note}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      {!saved ? (
        <Button title="Save to Fascinations" onPress={save} style={{ marginTop: 26 }} />
      ) : null}

      <Pressable onPress={() => patch({ screen: 'fascBucket' })} style={styles.retake} hitSlop={8}>
        <Ionicons name="refresh" size={14} color={colors.link} />
        <Text style={styles.retakeText}>Redo the interview</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 12, paddingBottom: TAB_BAR_SPACE },
  h1: { marginTop: 16, fontSize: 28 },
  sub: { marginTop: 12, fontSize: 15.5, lineHeight: 22, color: colors.inkSoft },

  confirm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 18,
    padding: 13,
    borderRadius: radius.md,
    backgroundColor: colors.tintLime,
    borderWidth: 1.5,
    borderColor: colors.accentDeep,
  },
  confirmText: { flex: 1, fontFamily: font.semi, fontSize: 13.5, lineHeight: 19, color: colors.accentInk },

  section: { fontFamily: font.bold, fontSize: 11, letterSpacing: 0.7, textTransform: 'uppercase', color: colors.muted, marginTop: 26 },

  card: { padding: 17, borderRadius: radius.lg, backgroundColor: colors.surface, ...shadow.card },
  cardTitle: { fontFamily: font.displaySemi, fontSize: 18.5, letterSpacing: -0.3, color: colors.ink },
  whyLabel: { fontFamily: font.bold, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.accentInk, marginTop: 12 },
  whyBody: { fontFamily: font.medium, fontSize: 15, lineHeight: 22, color: colors.inkSoft, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 13 },
  chip: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.surfaceSunken },
  chipText: { fontFamily: font.bold, fontSize: 12, color: colors.inkSoft },
  explore: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 14, alignSelf: 'flex-start' },
  exploreText: { fontFamily: font.bold, fontSize: 13, color: colors.link },

  dislikeCard: { padding: 15, borderRadius: radius.lg, backgroundColor: colors.surfaceSunken },
  dislikeTitle: { fontFamily: font.displaySemi, fontSize: 16, letterSpacing: -0.2, color: colors.ink },
  dislikeNote: { fontFamily: font.medium, fontSize: 14, lineHeight: 20, color: colors.inkSoft, marginTop: 5 },

  retake: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 20 },
  retakeText: { fontFamily: font.bold, fontSize: 14, color: colors.link },
});
