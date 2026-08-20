import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Screen, T, Button, BackLink } from '../ui/kit';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { colors, font, radius } from '../theme';
import { useStore } from '../state/store';
import { FASC_BUCKETS } from '../data/content';

// Intro / explainer for a lens (invite-flow style). Leads into the discovery
// interview, or back to already-surfaced topics.
export default function FascBucketScreen() {
  const { state, patch, go } = useStore();
  const bucket = FASC_BUCKETS.find((b) => b.key === state.fascBucket) || FASC_BUCKETS[0];
  const isPulls = bucket.key !== 'domains';
  const hasResult = isPulls
    ? (state.fascPulls[bucket.key]?.pulls?.length ?? 0) > 0
    : (state.fascTopics[bucket.key] || []).length > 0;
  const startInterview = () => patch({ screen: isPulls ? 'fascPulls' : 'fascDiscover' });
  const seeResult = () => patch({ screen: isPulls ? 'fascPullsResult' : 'fascTopics' });

  return (
    <Screen scroll={false} contentStyle={styles.wrap}>
      <BackLink label="Fascinations" onPress={() => go('fascHub')} />

      <View style={styles.hero}>
        <View style={[styles.tile, { backgroundColor: bucket.tint }]}>
          <Text style={styles.emoji}>{bucket.emoji}</Text>
        </View>
        <T variant="title" style={styles.h1}>
          {bucket.heading}
        </T>
        <View style={styles.rule} />
        <T variant="body" style={styles.body}>
          {bucket.intro}
        </T>
      </View>

      <View style={{ flex: 1 }} />

      <View style={styles.stats}>
        <View>
          <Text style={styles.statNum}>~4 min</Text>
          <Text style={styles.statLabel}>{isPulls ? 'One short interview' : 'To surface your topics'}</Text>
        </View>
        <View>
          <Text style={styles.statNum}>{isPulls ? 'Both sides' : 'Then go deep'}</Text>
          <Text style={styles.statLabel}>{isPulls ? 'What you love and dislike' : 'On the ones that matter'}</Text>
        </View>
      </View>

      {hasResult ? (
        <>
          <Button title="Start over" variant="dark" onPress={startInterview} />
          <Button
            title={isPulls ? 'See your results' : 'See your topics'}
            variant="secondary"
            style={{ marginTop: 10 }}
            onPress={seeResult}
          />
        </>
      ) : (
        <Button title="Start interview" variant="dark" onPress={startInterview} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 12, paddingBottom: TAB_BAR_SPACE },
  hero: { marginTop: 8 },
  tile: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 26 },
  h1: { marginTop: 18, fontSize: 30 },
  rule: { width: 46, height: 3, backgroundColor: colors.ink, marginTop: 20, borderRadius: 2 },
  body: { marginTop: 18, fontSize: 16, lineHeight: 24 },

  stats: { flexDirection: 'row', gap: 26, paddingVertical: 16, borderTopWidth: 1.5, borderTopColor: colors.line, marginBottom: 14 },
  statNum: { fontFamily: font.display, fontSize: 18, color: colors.ink, letterSpacing: -0.4 },
  statLabel: { fontFamily: font.semi, fontSize: 12.5, color: colors.muted, marginTop: 2 },
});
