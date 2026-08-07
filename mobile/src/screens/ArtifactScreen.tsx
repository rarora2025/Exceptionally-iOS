import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, T, BackLink, Avatar } from '../ui/kit';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { colors, font, radius, shadow } from '../theme';
import { useStore, initials } from '../state/store';
import { ARTIFACTS } from '../data/content';

export default function ArtifactScreen() {
  const { state, patch, go } = useStore();
  const a = ARTIFACTS[state.artifactKey] || ARTIFACTS.david;
  const [reaction, setReaction] = React.useState<'up' | 'down' | null>(null);

  const back = () => go('profile');

  return (
    <Screen contentStyle={styles.wrap}>
      <BackLink label="Profile" onPress={back} />

      <View style={styles.lensRow}>
        <Avatar initials={initials(a.author)} tint={a.tint} size={30} />
        <T variant="label" style={{ marginBottom: 0 }}>
          {a.lens}
        </T>
      </View>
      <T variant="title" style={styles.title}>
        {a.title}
      </T>
      <T variant="body" style={styles.synthesis}>
        {a.synthesis}
      </T>

      <View style={styles.comboRow}>
        <View style={styles.comboPill}>
          <Text style={styles.comboText}>{a.combo}</Text>
        </View>
      </View>

      <T variant="label" style={styles.h}>
        What they saw
      </T>
      <View style={{ gap: 10, marginTop: 12 }}>
        {a.saw.map((s, i) => (
          <View key={i} style={styles.sawRow}>
            <View style={styles.sawDot} />
            <Text style={styles.sawText}>{s}</Text>
          </View>
        ))}
      </View>

      <T variant="label" style={styles.h}>
        The story
      </T>
      <T variant="body" style={styles.story}>
        {a.story}
      </T>

      <View style={styles.quoteCard}>
        <Text style={styles.quoteMark}>"</Text>
        <Text style={styles.quoteText}>{a.quote}</Text>
        <Text style={styles.quoteAuthor}>— {a.author}</Text>
      </View>

      {/* feedback controls */}
      <View style={styles.feedback}>
        <Text style={styles.feedbackLabel}>Does this land?</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={() => setReaction(reaction === 'up' ? null : 'up')}
            style={[styles.reactBtn, reaction === 'up' && styles.reactOn]}
          >
            <Ionicons name="thumbs-up" size={18} color={reaction === 'up' ? colors.accentInk : colors.inkSoft} />
          </Pressable>
          <Pressable
            onPress={() => setReaction(reaction === 'down' ? null : 'down')}
            style={[styles.reactBtn, reaction === 'down' && styles.reactDown]}
          >
            <Ionicons name="thumbs-down" size={18} color={colors.inkSoft} />
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={() => patch({ screen: 'chat', chatDraft: `Help me use "${a.title}" to tell my story.` })}
        style={styles.talk}
      >
        <Ionicons name="chatbubble-ellipses" size={18} color={colors.onDark} />
        <Text style={styles.talkText}>Talk through this</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 12, paddingBottom: TAB_BAR_SPACE },
  lensRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  title: { marginTop: 14, fontSize: 30 },
  synthesis: { marginTop: 14, fontSize: 16.5, lineHeight: 24, color: colors.inkSoft },

  comboRow: { flexDirection: 'row', marginTop: 16 },
  comboPill: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  comboText: { fontFamily: font.bold, fontSize: 12.5, color: colors.accentInk },

  h: { marginTop: 28 },
  sawRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  sawDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.ink, marginTop: 8 },
  sawText: { flex: 1, fontFamily: font.medium, fontSize: 15.5, lineHeight: 22, color: colors.ink },

  story: { marginTop: 12, fontSize: 16, lineHeight: 24, color: colors.inkSoft },

  quoteCard: {
    marginTop: 22,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 20,
    ...shadow.card,
  },
  quoteMark: { fontFamily: font.display, fontSize: 44, color: colors.accent, height: 34, lineHeight: 44 },
  quoteText: { fontFamily: font.semi, fontSize: 17, lineHeight: 25, color: colors.ink, marginTop: 4 },
  quoteAuthor: { fontFamily: font.bold, fontSize: 13.5, color: colors.muted, marginTop: 12 },

  feedback: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  feedbackLabel: { fontFamily: font.semi, fontSize: 15, color: colors.inkSoft },
  reactBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactOn: { backgroundColor: colors.accent, borderColor: colors.accentDeep },
  reactDown: { backgroundColor: colors.surfaceSunken },

  talk: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.dark,
    borderRadius: radius.pill,
    height: 56,
    ...shadow.dark,
  },
  talkText: { fontFamily: font.bold, fontSize: 16, color: colors.onDark },
});
