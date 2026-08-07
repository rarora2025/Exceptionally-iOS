import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, T, Avatar } from '../ui/kit';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { colors, font, radius, shadow } from '../theme';
import { useStore } from '../state/store';
import { SUPER_STRENGTHS, SELF_ARTIFACTS, EMOJI_OPTIONS, COLOR_OPTIONS } from '../data/content';

export default function ProfileScreen() {
  const { state, patch, go } = useStore();

  const openArtifact = (key: string) => patch({ screen: 'artifact', artifactKey: key });

  return (
    <Screen contentStyle={styles.wrap}>
      <View style={styles.head}>
        <Avatar initials="NR" tint={colors.accent} size={56} />
        <View style={{ flex: 1 }}>
          <T variant="heading" style={{ fontSize: 26 }}>
            Noah Reyes
          </T>
          <Text style={styles.count}>Built from 5 artifacts</Text>
        </View>
        <Pressable onPress={() => go('people')} style={styles.inviteBtn}>
          <Text style={styles.inviteText}>Invite</Text>
        </Pressable>
      </View>

      <T variant="label" style={styles.section}>
        Super strengths
      </T>
      <View style={{ gap: 8, marginTop: 12 }}>
        {SUPER_STRENGTHS.map((s) => (
          <Pressable key={s.key} onPress={() => openArtifact(s.key)} style={styles.strengthCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.strengthTitle}>{s.title}</Text>
              <View style={styles.strengthSource}>
                <Avatar initials={s.initials} tint={s.tint} size={22} />
                <Text style={styles.sourceText}>{s.source}</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={16} color={colors.ink} />
          </Pressable>
        ))}
      </View>

      <View style={styles.section2}>
        <T variant="label">Fascinations</T>
        <Pressable onPress={() => go('fascHub')} hitSlop={8}>
          <Text style={styles.viewAll}>View all →</Text>
        </Pressable>
      </View>
      <View style={{ gap: 8, marginTop: 12 }}>
        {SELF_ARTIFACTS.map((a) => {
          const style = state.fascStyle[a.key] || {};
          const emoji = style.emoji || a.defaultEmoji;
          const color = style.color || a.defaultColor;
          const open = state.fascPicker === a.key;
          return (
            <View key={a.key} style={styles.selfCard}>
              <View style={{ position: 'relative' }}>
                <Pressable
                  onPress={() => patch({ fascPicker: open ? null : a.key })}
                  style={[styles.tile, { backgroundColor: color }]}
                >
                  <Text style={styles.tileEmoji}>{emoji}</Text>
                </Pressable>
              </View>
              <Pressable style={styles.selfMain} onPress={() => openArtifact(a.key)}>
                <Text style={styles.selfTitle}>{a.title}</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.ink} />
              </Pressable>

              {open ? (
                <View style={styles.picker}>
                  <View style={styles.emojiGrid}>
                    {EMOJI_OPTIONS.map((e) => (
                      <Pressable
                        key={e}
                        onPress={() =>
                          patch({ fascStyle: { ...state.fascStyle, [a.key]: { ...style, emoji: e } } })
                        }
                        style={[styles.emojiBtn, { borderColor: emoji === e ? colors.ink : colors.line }]}
                      >
                        <Text style={{ fontSize: 18 }}>{e}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.colorRow}>
                    {COLOR_OPTIONS.map((c) => (
                      <Pressable
                        key={c}
                        onPress={() =>
                          patch({
                            fascStyle: { ...state.fascStyle, [a.key]: { ...style, color: c } },
                            fascPicker: null,
                          })
                        }
                        style={[styles.colorBtn, { backgroundColor: c, borderColor: color === c ? colors.ink : colors.line }]}
                      />
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 16, paddingBottom: TAB_BAR_SPACE },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  count: { fontFamily: font.semi, fontSize: 13.5, color: colors.muted, marginTop: 5 },
  inviteBtn: {
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radius.pill,
    paddingHorizontal: 15,
    paddingVertical: 9,
    backgroundColor: colors.surface,
  },
  inviteText: { fontFamily: font.bold, fontSize: 13, color: colors.ink },

  section: { marginTop: 30 },
  section2: { marginTop: 30, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  viewAll: { fontFamily: font.bold, fontSize: 13, color: colors.ink },

  strengthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 17,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  strengthTitle: { fontFamily: font.displaySemi, fontSize: 18.5, letterSpacing: -0.4, color: colors.ink, lineHeight: 22 },
  strengthSource: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  sourceText: { fontFamily: font.bold, fontSize: 12.5, color: colors.inkSoft },

  selfCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.card,
    flexWrap: 'wrap',
  },
  tile: { width: 54, height: 54, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  tileEmoji: { fontSize: 25 },
  selfMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 0 },
  selfTitle: { flex: 1, fontFamily: font.displaySemi, fontSize: 18.5, letterSpacing: -0.4, color: colors.ink, lineHeight: 22 },

  picker: {
    width: '100%',
    marginTop: 12,
    padding: 13,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    ...shadow.soft,
  },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  emojiBtn: { width: 34, height: 34, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  colorRow: { flexDirection: 'row', gap: 6, marginTop: 11, paddingTop: 11, borderTopWidth: 1.5, borderTopColor: colors.line },
  colorBtn: { flex: 1, height: 26, borderRadius: 8, borderWidth: 2 },
});
