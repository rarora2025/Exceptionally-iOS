import React from 'react';
import { View, StyleSheet, Pressable, Text, TextInput, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { Screen, T, Button, Avatar, BackLink } from '../ui/kit';
import { colors, font, radius, shadow } from '../theme';
import { useStore, initials, inviteLinkFor } from '../state/store';
import * as haptics from '../lib/haptics';
import { DIRECTORY } from '../data/onboarding';

const DEFAULT_MSG =
  "Hi! I'm using Exceptionally to figure out what I'm genuinely good at and where to take my career. Your take would really help. It's a short interview, about 5 minutes, by voice or text.";

export default function InviteScreen() {
  const { state, patch, go, addPerson } = useStore();
  const link = inviteLinkFor(state.suName);
  const fromPeople = state.inviteFrom === 'people';

  const [message, setMessage] = React.useState(DEFAULT_MSG);
  const [editing, setEditing] = React.useState(false);
  const [linkCopied, setLinkCopied] = React.useState(false);

  const pq = (state.peopleQuery || '').trim().toLowerCase();
  const results = pq
    ? DIRECTORY.filter((p) => (p.name + ' ' + p.detail).toLowerCase().includes(pq))
    : [];

  const share = async () => {
    haptics.tap();
    try {
      await Share.share({ message: `${message}\n\n${link}` });
    } catch {
      /* dismissed */
    }
  };
  const copyLink = async () => {
    await Clipboard.setStringAsync(link);
    haptics.success();
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1600);
  };
  const ask = (p: { name: string; detail: string; tint: string }) => {
    if (state.askedPeople.includes(p.name)) return;
    haptics.select();
    patch({ askedPeople: [...state.askedPeople, p.name] });
    addPerson(p.name, p.detail, p.tint);
  };

  return (
    <Screen contentStyle={styles.wrap}>
      {fromPeople ? <BackLink label="My people" onPress={() => go('people')} /> : null}
      <T variant="title" style={styles.h1}>
        Invite your people
      </T>

      {/* add friends already on the app */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={17} color={colors.muted} />
        <TextInput
          value={state.peopleQuery}
          onChangeText={(t) => patch({ peopleQuery: t })}
          placeholder="Add friends already on Exceptionally"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          style={styles.searchInput}
        />
      </View>

      {results.length ? (
        <View style={styles.results}>
          {results.map((p) => {
            const asked = state.askedPeople.includes(p.name);
            return (
              <View key={p.name} style={styles.resultRow}>
                <Avatar initials={initials(p.name)} tint={p.tint} size={34} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{p.name}</Text>
                  <Text style={styles.resultDetail}>{p.detail}</Text>
                </View>
                <Pressable onPress={() => ask(p)} style={[styles.askBtn, asked && styles.askBtnOn]}>
                  <Text style={styles.askText}>{asked ? 'Asked' : 'Ask'}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={styles.searchHint}>Search by name or email to send someone an interview.</Text>
      )}

      <View style={{ flex: 1, minHeight: 16 }} />

      {/* editable message (only when Edit message is tapped) */}
      {editing ? (
        <TextInput
          value={message}
          onChangeText={setMessage}
          multiline
          autoFocus
          style={styles.msgInput}
          placeholder="Write your invite message…"
          placeholderTextColor={colors.muted}
        />
      ) : null}

      {/* your unique link */}
      <Pressable onPress={copyLink} style={styles.linkRow}>
        <Ionicons name="link" size={15} color={colors.muted} />
        <View style={{ flex: 1 }}>
          <Text style={styles.linkLabel}>Your unique link</Text>
          <Text style={styles.linkText} numberOfLines={1}>
            {link}
          </Text>
        </View>
        <Text style={styles.linkCopy}>{linkCopied ? 'Copied' : 'Copy'}</Text>
      </Pressable>

      <View style={styles.actions}>
        <Button
          title={editing ? 'Done' : 'Edit message'}
          variant="secondary"
          compact
          style={{ flex: 1 }}
          onPress={() => setEditing((e) => !e)}
        />
        <Button
          title="Share invite"
          variant="dark"
          compact
          style={{ flex: 1.4 }}
          left={<Ionicons name="share-outline" size={17} color={colors.onDark} />}
          onPress={share}
        />
      </View>

      {!fromPeople ? (
        <Pressable onPress={() => go('home')} style={styles.laterBtn} hitSlop={8}>
          <Text style={styles.laterText}>I'll come back to this later</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 12, paddingBottom: 16 },
  h1: { marginTop: 4 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 22,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
  },
  searchInput: { flex: 1, fontFamily: font.semi, fontSize: 15, color: colors.ink },
  searchHint: { fontFamily: font.medium, fontSize: 13.5, color: colors.muted, marginTop: 12, paddingHorizontal: 4 },

  results: { marginTop: 12, gap: 7 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 11,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  resultName: { fontFamily: font.bold, fontSize: 14.5, color: colors.ink },
  resultDetail: { fontFamily: font.medium, fontSize: 12.5, color: colors.muted, marginTop: 1 },
  askBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  askBtnOn: { backgroundColor: colors.accent, borderColor: colors.accentDeep },
  askText: { fontFamily: font.bold, fontSize: 13, color: colors.ink },

  msgInput: {
    minHeight: 110,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
    padding: 15,
    fontFamily: font.medium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
    textAlignVertical: 'top',
  },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSunken,
  },
  linkLabel: { fontFamily: font.bold, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.muted },
  linkText: { fontFamily: font.bold, fontSize: 13.5, color: colors.ink, marginTop: 2 },
  linkCopy: { fontFamily: font.bold, fontSize: 12.5, color: colors.link },

  actions: { flexDirection: 'row', gap: 9, marginTop: 12 },

  laterBtn: { alignItems: 'center', paddingVertical: 13 },
  laterText: { fontFamily: font.bold, fontSize: 14.5, color: colors.muted },
});
