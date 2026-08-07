import React from 'react';
import { View, StyleSheet, Pressable, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, T, Button, BackLink } from '../ui/kit';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { colors, font, radius, shadow } from '../theme';
import { useStore } from '../state/store';
import { TOOLS, TOOL_STEPS, tagBg } from '../data/content';

export default function ToolRunScreen() {
  const { state, patch, go } = useStore();
  const tool = TOOLS.find((t) => t.key === state.toolKey) || TOOLS[0];

  const ready =
    tool.needs === 'paste'
      ? state.toolPaste.trim().length > 20 || state.toolLink.trim().length > 6
      : tool.needs === 'role'
      ? !!state.toolRole.trim()
      : true;

  // running animation
  React.useEffect(() => {
    if (state.toolPhase !== 'running') return;
    if (state.toolStep >= TOOL_STEPS.length - 1) {
      const done = setTimeout(() => patch({ toolPhase: 'done' }), 700);
      return () => clearTimeout(done);
    }
    const t = setTimeout(() => patch({ toolStep: state.toolStep + 1 }), 700);
    return () => clearTimeout(t);
  }, [state.toolPhase, state.toolStep]);

  const run = () => {
    if (ready) patch({ toolPhase: 'running', toolStep: 0 });
  };

  return (
    <Screen contentStyle={styles.wrap}>
      <BackLink label="Tools" onPress={() => patch({ screen: 'tools', toolPhase: 'idle' })} />
      <T variant="title" style={styles.h1}>
        {tool.name}
      </T>
      <T variant="body" style={styles.blurb}>
        {tool.blurb}
      </T>

      <View style={styles.inputChips}>
        {tool.inputs.map((label) => (
          <View key={label} style={styles.inputChip}>
            <Ionicons name="document-text-outline" size={13} color={colors.inkSoft} />
            <Text style={styles.inputChipText}>{label}</Text>
          </View>
        ))}
      </View>

      {/* per-tool inputs */}
      {state.toolPhase === 'idle' && tool.needs === 'paste' ? (
        <TextInput
          value={state.toolLink}
          onChangeText={(t) => patch({ toolLink: t })}
          placeholder="Paste a job link"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          style={styles.field}
        />
      ) : null}
      {state.toolPhase === 'idle' && tool.needs === 'role' ? (
        <View>
          <TextInput
            value={state.toolRole}
            onChangeText={(t) => patch({ toolRole: t })}
            placeholder="Target role, e.g. Head of Strategy"
            placeholderTextColor={colors.muted}
            style={styles.field}
          />
          <View style={styles.roleChips}>
            {['Head of Strategy', 'Founding PM', 'Chief of Staff'].map((r) => (
              <Pressable key={r} onPress={() => patch({ toolRole: r })} style={styles.roleChip}>
                <Text style={styles.roleChipText}>{r}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
      {state.toolPhase === 'idle' && tool.needs === 'horizon' ? (
        <View style={styles.horizons}>
          {['Now', '6 months', 'A year'].map((h) => {
            const on = state.toolHorizon === h;
            return (
              <Pressable key={h} onPress={() => patch({ toolHorizon: h })} style={[styles.horizon, on && styles.horizonOn]}>
                <Text style={[styles.horizonText, on && { color: colors.accentInk }]}>{h}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {/* phases */}
      {state.toolPhase === 'idle' ? (
        <Button title={tool.runLabel} variant="dark" disabled={!ready} style={{ marginTop: 22 }} onPress={run} />
      ) : null}

      {state.toolPhase === 'running' ? (
        <View style={styles.running}>
          <View style={styles.track}>
            <View style={[styles.trackFill, { width: `${Math.round(((state.toolStep + 1) / TOOL_STEPS.length) * 100)}%` }]} />
          </View>
          <View style={styles.runRow}>
            <View style={styles.pulseDot} />
            <Text style={styles.runText}>{TOOL_STEPS[Math.min(state.toolStep, TOOL_STEPS.length - 1)]}</Text>
          </View>
        </View>
      ) : null}

      {state.toolPhase === 'done' ? (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.resultLabel}>{tool.resultLabel}</Text>
          <View style={{ gap: 8, marginTop: 12 }}>
            {tool.rows.map((r, i) => (
              <View key={r.title} style={styles.resultRow}>
                <Text style={styles.rowN}>{'0' + (i + 1)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{r.title}</Text>
                  <Text style={styles.rowNote}>{r.note}</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: tagBg(r.tag) }]}>
                  <Text style={styles.tagText}>{r.tag}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.whyCard}>
            <Text style={styles.whyEyebrow}>Why these</Text>
            <Text style={styles.whyText}>{tool.why}</Text>
          </View>

          <Button
            title="Talk through the results"
            variant="dark"
            style={{ marginTop: 18 }}
            onPress={() => patch({ screen: 'chat', chatDraft: tool.chatPrompt })}
          />
          <Button title="Run again" variant="secondary" style={{ marginTop: 10 }} onPress={() => patch({ toolPhase: 'idle', toolStep: 0 })} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 12, paddingBottom: TAB_BAR_SPACE },
  h1: { marginTop: 14, fontSize: 29 },
  blurb: { marginTop: 12, fontSize: 15, lineHeight: 22 },

  inputChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 16 },
  inputChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
  },
  inputChipText: { fontFamily: font.semi, fontSize: 12.5, color: colors.inkSoft },

  field: {
    marginTop: 18,
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    fontFamily: font.medium,
    fontSize: 15.5,
    color: colors.ink,
  },
  roleChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  roleChip: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.lineStrong, backgroundColor: colors.surface },
  roleChipText: { fontFamily: font.bold, fontSize: 12.5, color: colors.inkSoft },

  horizons: { flexDirection: 'row', gap: 8, marginTop: 18 },
  horizon: { flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.lineStrong, backgroundColor: colors.surface },
  horizonOn: { backgroundColor: colors.accent, borderColor: colors.accentDeep },
  horizonText: { fontFamily: font.bold, fontSize: 14, color: colors.inkSoft },

  running: { marginTop: 26 },
  track: { height: 10, borderRadius: 10, backgroundColor: colors.surfaceSunken, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 10, backgroundColor: colors.accent },
  runRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  pulseDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent },
  runText: { fontFamily: font.bold, fontSize: 14.5, color: colors.inkSoft },

  resultLabel: { fontFamily: font.bold, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.muted },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: radius.md, backgroundColor: colors.surface, ...shadow.card },
  rowN: { fontFamily: font.display, fontSize: 15, color: colors.muted },
  rowTitle: { fontFamily: font.semi, fontSize: 15.5, color: colors.ink },
  rowNote: { fontFamily: font.medium, fontSize: 12.5, lineHeight: 18, color: colors.inkSoft, marginTop: 3 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, minWidth: 34, alignItems: 'center' },
  tagText: { fontFamily: font.bold, fontSize: 12, color: colors.ink },

  whyCard: { marginTop: 16, padding: 16, borderRadius: radius.lg, backgroundColor: colors.surfaceSunken },
  whyEyebrow: { fontFamily: font.bold, fontSize: 10.5, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.muted },
  whyText: { fontFamily: font.medium, fontSize: 14.5, lineHeight: 21, color: colors.ink, marginTop: 8 },
});
