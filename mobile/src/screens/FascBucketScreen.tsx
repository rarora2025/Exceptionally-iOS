import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Screen, T, BackLink } from '../ui/kit';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { colors, font, radius, shadow } from '../theme';
import { useStore } from '../state/store';
import { FASC_BUCKETS } from '../data/content';

export default function FascBucketScreen() {
  const { state, patch, go } = useStore();
  const bucket = FASC_BUCKETS.find((b) => b.key === state.fascBucket) || FASC_BUCKETS[0];

  const explore = (seed: string) =>
    patch({ screen: 'fascSeed', fascSeed: seed, fTurn: 0, fTranscript: '' });

  return (
    <Screen contentStyle={styles.wrap}>
      <BackLink label="Fascinations" onPress={() => go('fascHub')} />
      <T variant="title" style={styles.h1}>
        {bucket.heading}
      </T>
      <T variant="body" style={styles.intro}>
        {bucket.intro}
      </T>

      <View style={{ gap: 10, marginTop: 18 }}>
        {bucket.items.map((it) => {
          const questions = 'points' in it ? (it as any).points : null;
          const love = 'love' in it ? (it as any).love : null;
          const avoid = 'avoid' in it ? (it as any).avoid : null;
          return (
            <View key={it.title} style={[styles.card, { backgroundColor: it.tint }]}>
              <View style={styles.cardHead}>
                <View style={styles.iconTile}>
                  <Text style={styles.iconEmoji}>{it.emoji}</Text>
                </View>
                <Text style={styles.cardTitle}>{it.title}</Text>
              </View>

              <Text style={styles.eyebrow}>Why it pulls you</Text>
              <Text style={styles.why}>{it.why}</Text>

              {questions ? (
                <View style={{ marginTop: 14 }}>
                  <Text style={styles.eyebrow}>Deeper questions</Text>
                  <View style={{ gap: 7, marginTop: 8 }}>
                    {questions.map((q: string) => (
                      <Text key={q} style={styles.question}>
                        {q}
                      </Text>
                    ))}
                  </View>
                </View>
              ) : null}

              {love ? (
                <View style={styles.pairs}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.eyebrow, { color: colors.ink }]}>You love</Text>
                    <View style={{ gap: 6, marginTop: 8 }}>
                      {love.map((l: string) => (
                        <Text key={l} style={styles.pairText}>
                          {l}
                        </Text>
                      ))}
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eyebrow}>You avoid</Text>
                    <View style={{ gap: 6, marginTop: 8 }}>
                      {avoid.map((a: string) => (
                        <Text key={a} style={[styles.pairText, { color: colors.inkSoft }]}>
                          {a}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
              ) : null}

              <Pressable onPress={() => explore(it.title)} style={styles.exploreBtn}>
                <Text style={styles.exploreText}>Explore this more →</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 12, paddingBottom: TAB_BAR_SPACE },
  h1: { marginTop: 16, fontSize: 27 },
  intro: { marginTop: 12, fontSize: 15.5, lineHeight: 22 },

  card: { padding: 16, borderRadius: radius.lg, ...shadow.soft },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 18 },
  cardTitle: { flex: 1, fontFamily: font.displayBold, fontSize: 19, letterSpacing: -0.5, color: colors.ink },

  eyebrow: { fontFamily: font.bold, fontSize: 10.5, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.muted, marginTop: 14 },
  why: { fontFamily: font.medium, fontSize: 14.5, lineHeight: 21, color: '#3A3A35', marginTop: 7 },
  question: { fontFamily: font.medium, fontSize: 14, lineHeight: 20, color: '#3A3A35', paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: 'rgba(0,0,0,0.12)' },

  pairs: { flexDirection: 'row', gap: 14, marginTop: 6 },
  pairText: { fontFamily: font.medium, fontSize: 13.5, lineHeight: 19, color: '#3A3A35' },

  exploreBtn: { marginTop: 15, paddingTop: 12, borderTopWidth: 2, borderTopColor: 'rgba(12,12,12,0.12)', alignItems: 'flex-end' },
  exploreText: { fontFamily: font.bold, fontSize: 14, color: colors.ink },
});
