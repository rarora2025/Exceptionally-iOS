import React from 'react';
import { View, StyleSheet, Pressable, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, T } from '../ui/kit';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { colors, font, radius, shadow } from '../theme';
import { useStore } from '../state/store';
import * as haptics from '../lib/haptics';
import { COMPOSER_CHIPS, HOME_FASCINATIONS, PROGRESS_CHECKLIST } from '../data/content';

export default function HomeScreen() {
  const { state, patch } = useStore();
  const hasDraft = !!state.problemDraft.trim();
  const pct = Math.round((PROGRESS_CHECKLIST.filter((p) => p.done).length / PROGRESS_CHECKLIST.length) * 100);
  const nextIdx = PROGRESS_CHECKLIST.findIndex((p) => !p.done && p.route);

  const send = () => {
    const t = state.problemDraft.trim();
    if (!t) return;
    haptics.tap();
    const id = 'c' + Date.now();
    patch({
      chats: [{ id, title: t.slice(0, 42), messages: [] }, ...state.chats],
      currentChatId: id,
      chatDraft: t,
      chatAutoSend: true,
      problemDraft: '',
      screen: 'chat',
    });
  };

  return (
    <Screen contentStyle={styles.wrap}>
      {/* composer */}
      <View style={[styles.composer, hasDraft && styles.composerActive]}>
        <T variant="cardTitle" style={styles.composerTitle}>
          What are you working through?
        </T>
        <TextInput
          value={state.problemDraft}
          onChangeText={(t) => patch({ problemDraft: t })}
          placeholder={state.problemDraft ? '' : 'Should I take the Head of Strategy offer?'}
          placeholderTextColor={colors.muted}
          multiline
          style={styles.composerInput}
        />
        <View style={styles.composerFoot}>
          {COMPOSER_CHIPS.map((label) => (
            <Pressable key={label} onPress={() => { haptics.select(); patch({ problemDraft: label }); }} style={styles.chip}>
              <Text style={styles.chipText}>{label}</Text>
            </Pressable>
          ))}
          <View style={{ flex: 1 }} />
          <Pressable onPress={send} style={[styles.send, { backgroundColor: hasDraft ? colors.ink : colors.surfaceSunken }]}>
            <Ionicons name="arrow-forward" size={18} color={hasDraft ? colors.onDark : colors.muted} />
          </Pressable>
        </View>
      </View>

      {/* My Fascinations */}
      <Pressable onPress={() => { haptics.tap(); patch({ screen: 'fascHub', fascFrom: 'home' }); }} style={styles.fascTile}>
        <Text style={styles.fascTileText}>My Fascinations</Text>
        <Ionicons name="arrow-forward" size={20} color={colors.accentInk} />
      </Pressable>
      <View style={styles.fascChips}>
        {HOME_FASCINATIONS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => { haptics.tap(); patch({ screen: 'fascBucket', fascBucket: f.key, fascFrom: 'home' }); }}
            style={styles.fascChip}
          >
            <Text style={styles.fascChipText}>{f.title}</Text>
          </Pressable>
        ))}
      </View>

      {/* checklist */}
      <View style={styles.checklist}>
        <View style={styles.checklistHead}>
          <T variant="label">Checklist</T>
          <Text style={styles.pct}>{pct}%</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${pct}%` }]} />
        </View>
        <View style={{ gap: 6, marginTop: 14 }}>
          {PROGRESS_CHECKLIST.map((p, i) => {
            const next = !p.done && i === nextIdx;
            const Row = p.route ? Pressable : View;
            return (
              <Row
                key={p.label}
                onPress={p.route ? () => { haptics.tap(); patch({ screen: p.route as any, fascFrom: 'home' }); } : undefined}
                style={[styles.checkRow, next && styles.checkRowNext]}
              >
                <View style={[styles.checkDot, p.done ? styles.checkDotDone : styles.checkDotOff]}>
                  {p.done ? <Text style={styles.checkMark}>✓</Text> : null}
                </View>
                <Text style={[styles.checkLabel, { color: p.done ? colors.ink : colors.inkSoft }]}>{p.label}</Text>
                {p.route && !p.done ? (
                  <Ionicons name="arrow-forward" size={15} color={next ? colors.accentInk : colors.muted} />
                ) : (
                  <Text style={styles.checkMeta}>{p.meta}</Text>
                )}
              </Row>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 42, paddingBottom: TAB_BAR_SPACE },

  composer: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 18,
    ...shadow.card,
  },
  composerActive: { borderWidth: 2, borderColor: colors.accent },
  composerTitle: { fontSize: 20 },
  composerInput: {
    marginTop: 12,
    minHeight: 44,
    fontFamily: font.medium,
    fontSize: 16,
    lineHeight: 22,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  composerFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
    paddingTop: 12,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
  },
  chipText: { fontFamily: font.bold, fontSize: 12.5, color: colors.inkSoft },
  send: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  fascTile: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    padding: 20,
    ...shadow.accent,
  },
  fascTileText: { fontFamily: font.displayBold, fontSize: 20, letterSpacing: -0.5, color: colors.accentInk },
  fascChips: { flexDirection: 'row', gap: 7, marginTop: 10 },
  fascChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  fascChipText: { fontFamily: font.bold, fontSize: 13, color: colors.inkSoft },

  checklist: {
    marginTop: 22,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 18,
    ...shadow.card,
  },
  checklistHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  pct: { fontFamily: font.display, fontSize: 22, color: colors.ink, letterSpacing: -0.5 },
  track: { marginTop: 12, height: 10, borderRadius: 10, backgroundColor: colors.surfaceSunken, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 10, backgroundColor: colors.accent },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 8, paddingHorizontal: 10, marginHorizontal: -10, borderRadius: radius.md },
  checkRowNext: { backgroundColor: colors.tintLime },
  checkDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  checkDotDone: { backgroundColor: colors.accent },
  checkDotOff: { borderWidth: 2, borderColor: colors.lineStrong },
  checkMark: { fontFamily: font.bold, fontSize: 11, color: colors.accentInk },
  checkLabel: { flex: 1, fontFamily: font.semi, fontSize: 14.5 },
  checkMeta: { fontFamily: font.bold, fontSize: 13, color: colors.muted },
});
