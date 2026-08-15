import React from 'react';
import { View, StyleSheet, Pressable, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, T, BackLink } from '../ui/kit';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { colors, font, radius, shadow } from '../theme';
import { useStore } from '../state/store';
import { FASC_BUCKETS } from '../data/content';
import * as haptics from '../lib/haptics';

export default function FascBucketScreen() {
  const { state, patch, go } = useStore();
  const bucket = FASC_BUCKETS.find((b) => b.key === state.fascBucket) || FASC_BUCKETS[0];
  const key = bucket.key;
  const list = state.fascLists[key] || [];
  const [custom, setCustom] = React.useState('');

  const b = bucket as { suggestions?: readonly string[]; prompt?: string };
  const suggestions: readonly string[] = b.suggestions ?? [];
  const prompt: string = b.prompt ?? bucket.intro;

  // Chips = curated suggestions plus any custom items the user added.
  const chips = [...suggestions, ...list.filter((i) => !suggestions.includes(i))];

  const setList = (next: string[]) => patch({ fascLists: { ...state.fascLists, [key]: next } });

  const toggle = (item: string) => {
    haptics.select();
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const addCustom = () => {
    const v = custom.trim();
    if (!v || list.includes(v)) {
      setCustom('');
      return;
    }
    haptics.select();
    setList([...list, v]);
    setCustom('');
  };

  const goDeeper = (item: string) => {
    haptics.tap();
    patch({ screen: 'fascInterview', fascSeed: item, fTurn: 0, fTranscript: '' });
  };

  return (
    <Screen contentStyle={styles.wrap}>
      <BackLink label="Fascinations" onPress={() => go('fascHub')} />
      <T variant="title" style={styles.h1}>
        {bucket.heading}
      </T>
      <T variant="body" style={styles.intro}>
        {prompt}
      </T>

      {/* pick / add */}
      <View style={styles.chipWrap}>
        {chips.map((c) => {
          const on = list.includes(c);
          return (
            <Pressable key={c} onPress={() => toggle(c)} style={[styles.chip, on && styles.chipOn]}>
              {on ? <Ionicons name="checkmark" size={14} color={colors.accentInk} style={{ marginRight: 5 }} /> : null}
              <Text style={[styles.chipText, on && { color: colors.accentInk }]}>{c}</Text>
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
          placeholder="Add your own…"
          placeholderTextColor={colors.muted}
          style={styles.addInput}
        />
        <Pressable onPress={addCustom} style={[styles.addBtn, !custom.trim() && { opacity: 0.4 }]} disabled={!custom.trim()}>
          <Ionicons name="add" size={22} color={colors.onDark} />
        </Pressable>
      </View>

      {/* go deeper */}
      {list.length ? (
        <>
          <T variant="label" style={{ marginTop: 30 }}>
            Go deep on one
          </T>
          <T variant="meta" style={{ marginTop: 6 }}>
            A short interview uncovers the real reason it pulls you in.
          </T>
          <View style={{ gap: 9, marginTop: 14 }}>
            {list.map((item) => {
              const done = state.fascDone.includes(item);
              return (
                <Pressable key={item} onPress={() => goDeeper(item)} style={styles.deepCard}>
                  <View style={[styles.deepDot, done && styles.deepDotDone]}>
                    {done ? <Ionicons name="checkmark" size={13} color={colors.accentInk} /> : null}
                  </View>
                  <Text style={styles.deepName}>{item}</Text>
                  <Text style={styles.deepCta}>{done ? 'Revisit' : 'Interview'}</Text>
                  <Ionicons name="arrow-forward" size={15} color={colors.ink} />
                </Pressable>
              );
            })}
          </View>
        </>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Tap a few above, or add your own, to get started.</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 12, paddingBottom: TAB_BAR_SPACE },
  h1: { marginTop: 16, fontSize: 27 },
  intro: { marginTop: 12, fontSize: 15.5, lineHeight: 22 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accentDeep },
  chipText: { fontFamily: font.bold, fontSize: 13.5, color: colors.inkSoft },

  addRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 12 },
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

  deepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  deepDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.lineStrong, alignItems: 'center', justifyContent: 'center' },
  deepDotDone: { backgroundColor: colors.accent, borderColor: colors.accentDeep },
  deepName: { flex: 1, fontFamily: font.displaySemi, fontSize: 17, letterSpacing: -0.3, color: colors.ink },
  deepCta: { fontFamily: font.bold, fontSize: 13, color: colors.link },

  empty: { marginTop: 26, padding: 20, borderRadius: radius.lg, backgroundColor: colors.surfaceSunken, alignItems: 'center' },
  emptyText: { fontFamily: font.medium, fontSize: 14, color: colors.muted, textAlign: 'center' },
});
