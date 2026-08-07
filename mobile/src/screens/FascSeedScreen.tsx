import React from 'react';
import { View, StyleSheet, Pressable, Text, TextInput } from 'react-native';
import { Screen, T, Button, BackLink } from '../ui/kit';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { colors, font, radius } from '../theme';
import { useStore } from '../state/store';

const SEED_CHIPS = ['AI agents', 'Pricing psychology', 'City planning', 'Decision rights'];

export default function FascSeedScreen() {
  const { state, patch, go } = useStore();
  const ready = !!state.fascSeed.trim();
  return (
    <Screen contentStyle={styles.wrap}>
      <BackLink label="Fascinations" onPress={() => go('fascHub')} />
      <T variant="title" style={styles.h1}>
        What have you gone deep on lately?
      </T>
      <T variant="body" style={styles.intro}>
        Something you read about, argued about, or kept thinking about when nobody was paying you to. Fifteen
        minutes of questions about it usually says more about how your mind works than a whole résumé does.
      </T>

      <TextInput
        value={state.fascSeed}
        onChangeText={(t) => patch({ fascSeed: t })}
        placeholder="AI agents, pricing psychology, city planning…"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <View style={styles.chips}>
        {SEED_CHIPS.map((c) => (
          <Pressable key={c} onPress={() => patch({ fascSeed: c })} style={styles.chip}>
            <Text style={styles.chipText}>{c}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ flex: 1, minHeight: 24 }} />

      <View style={styles.voiceNote}>
        <Text style={styles.voiceTitle}>Voice or text</Text>
        <Text style={styles.voiceSub}>However you prefer. Stop whenever you want.</Text>
      </View>
      <Button
        title="Begin interview"
        variant="dark"
        disabled={!ready}
        onPress={() => patch({ screen: 'fascInterview', fTurn: 0, fTranscript: '' })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 12, paddingBottom: TAB_BAR_SPACE },
  h1: { marginTop: 18, fontSize: 30 },
  intro: { marginTop: 12, fontSize: 15.5, lineHeight: 22 },
  input: {
    marginTop: 22,
    minHeight: 54,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    fontFamily: font.medium,
    fontSize: 15.5,
    color: colors.ink,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
  },
  chipText: { fontFamily: font.bold, fontSize: 13, color: colors.inkSoft },
  voiceNote: { paddingVertical: 14, borderTopWidth: 1.5, borderTopColor: colors.line, marginBottom: 14 },
  voiceTitle: { fontFamily: font.display, fontSize: 18, color: colors.ink, letterSpacing: -0.4 },
  voiceSub: { fontFamily: font.semi, fontSize: 12.5, color: colors.muted, marginTop: 2 },
});
