import React from 'react';
import { View, StyleSheet, Pressable, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Screen, T, Avatar } from '../ui/kit';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { colors, font, radius, shadow } from '../theme';
import { useStore } from '../state/store';
import { useAuth } from '../state/auth';
import * as haptics from '../lib/haptics';
import { SUPER_STRENGTHS, EMOJI_OPTIONS, COLOR_OPTIONS } from '../data/content';

export default function ProfileScreen() {
  const { state, patch, go } = useStore();
  const { configured, signOut } = useAuth();
  const [pfpOpen, setPfpOpen] = React.useState(false);

  const toggleNotifs = async () => {
    haptics.tap();
    if (state.notifsOn) {
      patch({ notifsOn: false });
      return;
    }
    try {
      const cur = await Notifications.getPermissionsAsync();
      let granted = cur.granted;
      if (!granted && cur.canAskAgain) granted = (await Notifications.requestPermissionsAsync()).granted;
      if (granted) {
        haptics.success();
        patch({ notifsOn: true });
      } else {
        Alert.alert('Notifications are off', 'Turn them on for Exceptionally in Settings to get reminders and updates.');
      }
    } catch {
      Alert.alert('Could not enable notifications', 'Please try again.');
    }
  };

  const openArtifact = (key: string) => { haptics.tap(); patch({ screen: 'artifact', artifactKey: key }); };
  const pfpColor = state.pfpColor || colors.accent;

  return (
    <Screen contentStyle={styles.wrap}>
      <View style={styles.head}>
        <Pressable onPress={() => { haptics.select(); setPfpOpen((o) => !o); }}>
          <View style={[styles.pfp, { backgroundColor: pfpColor }]}>
            {state.pfpEmoji ? (
              <Text style={styles.pfpEmoji}>{state.pfpEmoji}</Text>
            ) : (
              <Text style={styles.pfpInitials}>NR</Text>
            )}
            <View style={styles.pfpBadge}>
              <Ionicons name="pencil" size={10} color={colors.onDark} />
            </View>
          </View>
        </Pressable>
        <View style={{ flex: 1 }}>
          <T variant="heading" numberOfLines={1} style={{ fontSize: 24 }}>
            Noah Reyes
          </T>
        </View>
        <Pressable onPress={toggleNotifs} hitSlop={6} style={[styles.bell, state.notifsOn && styles.bellOn]}>
          <Ionicons name={state.notifsOn ? 'notifications' : 'notifications-outline'} size={18} color={colors.ink} />
        </Pressable>
        <Pressable onPress={() => { haptics.tap(); go('people'); }} style={styles.inviteBtn}>
          <Text style={styles.inviteText}>Invite</Text>
        </Pressable>
      </View>

      {pfpOpen ? (
        <View style={styles.pfpPicker}>
          <View style={styles.emojiGrid}>
            <Pressable
              onPress={() => patch({ pfpEmoji: '' })}
              style={[styles.emojiBtn, { borderColor: state.pfpEmoji === '' ? colors.ink : colors.line }]}
            >
              <Text style={styles.abcText}>NR</Text>
            </Pressable>
            {EMOJI_OPTIONS.map((e) => (
              <Pressable
                key={e}
                onPress={() => { haptics.select(); patch({ pfpEmoji: e }); }}
                style={[styles.emojiBtn, { borderColor: state.pfpEmoji === e ? colors.ink : colors.line }]}
              >
                <Text style={{ fontSize: 18 }}>{e}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map((c) => (
              <Pressable
                key={c}
                onPress={() => { haptics.select(); patch({ pfpColor: c }); }}
                style={[styles.colorBtn, { backgroundColor: c, borderColor: pfpColor === c ? colors.ink : colors.line }]}
              />
            ))}
          </View>
        </View>
      ) : null}

      <Pressable onPress={() => { haptics.tap(); go('synthesis'); }} style={styles.buildCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.buildTitle}>Build my narrative</Text>
          <Text style={styles.buildSub}>See your profile come together as one picture</Text>
        </View>
        <Ionicons name="arrow-forward" size={18} color={colors.accentInk} />
      </Pressable>

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

      {configured ? (
        <Pressable
          onPress={async () => {
            await signOut();
            go('auth');
          }}
          style={styles.signOut}
          hitSlop={8}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 16, paddingBottom: TAB_BAR_SPACE },
  head: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  bell: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadow.soft },
  bellOn: { backgroundColor: colors.accent },

  pfp: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  pfpEmoji: { fontSize: 27 },
  pfpInitials: { fontFamily: font.displaySemi, fontSize: 20, color: colors.accentInk },
  pfpBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  pfpPicker: {
    marginTop: 14,
    padding: 13,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    ...shadow.soft,
  },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  emojiBtn: { width: 36, height: 36, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  abcText: { fontFamily: font.bold, fontSize: 12, color: colors.inkSoft },
  colorRow: { flexDirection: 'row', gap: 6, marginTop: 11, paddingTop: 11, borderTopWidth: 1.5, borderTopColor: colors.line },
  colorBtn: { flex: 1, height: 26, borderRadius: 8, borderWidth: 2 },

  inviteBtn: {
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radius.pill,
    paddingHorizontal: 15,
    paddingVertical: 9,
    backgroundColor: colors.surface,
  },
  inviteText: { fontFamily: font.bold, fontSize: 13, color: colors.ink },

  buildCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    ...shadow.accent,
  },
  buildTitle: { fontFamily: font.displayBold, fontSize: 19, letterSpacing: -0.5, color: colors.accentInk },
  buildSub: { fontFamily: font.semi, fontSize: 13, color: colors.accentInk, marginTop: 4, opacity: 0.75 },

  section: { marginTop: 30 },

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

  signOut: { alignItems: 'center', paddingVertical: 18, marginTop: 20 },
  signOutText: { fontFamily: font.bold, fontSize: 14.5, color: colors.muted },
});
