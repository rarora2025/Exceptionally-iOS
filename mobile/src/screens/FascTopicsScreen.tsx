import React from 'react';
import { View, StyleSheet, Text, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, T, BackLink } from '../ui/kit';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { colors, font, radius, shadow } from '../theme';
import { useStore } from '../state/store';
import { FASC_BUCKETS } from '../data/content';
import * as haptics from '../lib/haptics';

export default function FascTopicsScreen() {
  const { state, patch, go } = useStore();
  const lens = state.fascBucket;
  const bucket = FASC_BUCKETS.find((b) => b.key === lens) || FASC_BUCKETS[0];
  const topics = state.fascTopics[lens] || [];
  const [custom, setCustom] = React.useState('');

  const setTopics = (next: { title: string; note: string }[]) =>
    patch({ fascTopics: { ...state.fascTopics, [lens]: next } });

  const addCustom = () => {
    const v = custom.trim();
    if (!v || topics.some((t) => t.title.toLowerCase() === v.toLowerCase())) {
      setCustom('');
      return;
    }
    haptics.select();
    setTopics([...topics, { title: v, note: 'Added by you' }]);
    setCustom('');
  };

  const goDeeper = (title: string) => {
    haptics.tap();
    patch({ screen: 'fascInterview', fascSeed: title, fTurn: 0, fTranscript: '' });
  };

  return (
    <Screen contentStyle={styles.wrap}>
      <BackLink label="Fascinations" onPress={() => go('fascHub')} />
      <T variant="title" style={styles.h1}>
        {topics.length ? 'What came up' : bucket.heading}
      </T>
      <T variant="body" style={styles.sub}>
        From your interview. Pick one to go deep on, and the next interview finds the real reason underneath it.
      </T>

      <View style={{ gap: 10, marginTop: 20 }}>
        {topics.map((t) => {
          const done = state.fascDone.includes(t.title);
          return (
            <Pressable key={t.title} onPress={() => goDeeper(t.title)} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{t.title}</Text>
                {t.note ? <Text style={styles.cardNote}>{t.note}</Text> : null}
              </View>
              <View style={[styles.cta, done && styles.ctaDone]}>
                <Text style={[styles.ctaText, done && { color: colors.accentInk }]}>
                  {done ? 'Revisit' : 'Go deep'}
                </Text>
                <Ionicons name="arrow-forward" size={14} color={done ? colors.accentInk : colors.ink} />
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.addRow}>
        <TextInput
          value={custom}
          onChangeText={setCustom}
          onSubmitEditing={addCustom}
          returnKeyType="done"
          placeholder="Add one we missed…"
          placeholderTextColor={colors.muted}
          style={styles.addInput}
        />
        <Pressable onPress={addCustom} style={[styles.addBtn, !custom.trim() && { opacity: 0.4 }]} disabled={!custom.trim()}>
          <Ionicons name="add" size={22} color={colors.onDark} />
        </Pressable>
      </View>

      <Pressable onPress={() => patch({ screen: 'fascDiscover' })} style={styles.retake} hitSlop={8}>
        <Ionicons name="refresh" size={14} color={colors.link} />
        <Text style={styles.retakeText}>Redo the discovery interview</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 12, paddingBottom: TAB_BAR_SPACE },
  h1: { marginTop: 16, fontSize: 28 },
  sub: { marginTop: 12, fontSize: 15.5, lineHeight: 22 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  cardTitle: { fontFamily: font.displaySemi, fontSize: 17.5, letterSpacing: -0.3, color: colors.ink },
  cardNote: { fontFamily: font.medium, fontSize: 13.5, lineHeight: 19, color: colors.inkSoft, marginTop: 5 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, paddingVertical: 9, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.lineStrong, backgroundColor: colors.surface },
  ctaDone: { backgroundColor: colors.accent, borderColor: colors.accentDeep },
  ctaText: { fontFamily: font.bold, fontSize: 12.5, color: colors.ink },

  addRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 16 },
  addInput: {
    flex: 1,
    height: 50,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    fontFamily: font.semi,
    fontSize: 15,
    color: colors.ink,
  },
  addBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },

  retake: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 18 },
  retakeText: { fontFamily: font.bold, fontSize: 14, color: colors.link },
});
