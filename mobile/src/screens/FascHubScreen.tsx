import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, T, BackLink } from '../ui/kit';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { colors, font, radius, shadow } from '../theme';
import { useStore } from '../state/store';
import * as haptics from '../lib/haptics';
import { FASC_BUCKETS } from '../data/content';

export default function FascHubScreen() {
  const { state, patch, go } = useStore();
  return (
    <Screen contentStyle={styles.wrap}>
      <BackLink
        label={state.fascFrom === 'home' ? 'Home' : 'Profile'}
        onPress={() => go(state.fascFrom === 'home' ? 'home' : 'profile')}
      />
      <T variant="title" style={styles.h1}>
        Interview yourself
      </T>

      <View style={{ gap: 10, marginTop: 22 }}>
        {FASC_BUCKETS.map((b) => {
          const topics = state.fascTopics[b.key] || [];
          const done = topics.filter((t) => state.fascDone.includes(t.title)).length;
          const meta =
            topics.length === 0 ? 'Tap to start' : `${topics.length} found${done ? ` · ${done} explored` : ''}`;
          return (
            <Pressable
              key={b.key}
              onPress={() => { haptics.tap(); patch({ screen: topics.length ? 'fascTopics' : 'fascBucket', fascBucket: b.key }); }}
              style={styles.card}
            >
              <View style={[styles.tile, { backgroundColor: b.tint }]}>
                <Text style={styles.emoji}>{b.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{b.title}</Text>
                <Text style={styles.count}>{meta}</Text>
                <Text style={styles.blurb}>{b.blurb}</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={colors.ink} />
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 12, paddingBottom: TAB_BAR_SPACE },
  h1: { marginTop: 18, fontSize: 31 },
  sub: { marginTop: 12, fontSize: 15, lineHeight: 22 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  tile: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 21 },
  title: { fontFamily: font.displayBold, fontSize: 19, letterSpacing: -0.5, color: colors.ink },
  count: { fontFamily: font.bold, fontSize: 12.5, color: colors.inkSoft, marginTop: 6 },
  blurb: { fontFamily: font.medium, fontSize: 13.5, lineHeight: 20, color: colors.inkSoft, marginTop: 8 },
});
