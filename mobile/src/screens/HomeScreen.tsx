import React from 'react';
import { View, StyleSheet, Pressable, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, T } from '../ui/kit';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { colors, font, radius, shadow } from '../theme';
import { useStore } from '../state/store';
import * as haptics from '../lib/haptics';
import { COMPOSER_CHIPS } from '../data/content';
import BucketCarousel from '../ui/BucketCarousel';

export default function HomeScreen() {
  const { state, patch } = useStore();
  const hasDraft = !!state.problemDraft.trim();

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
      <BucketCarousel />
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
});
