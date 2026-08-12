import React from 'react';
import { View, StyleSheet, Pressable, Text, TextInput, Share, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { Screen, T, Button, BackLink } from '../ui/kit';
import { colors, font, radius } from '../theme';
import { useStore, inviteLinkFor } from '../state/store';
import * as haptics from '../lib/haptics';
import { RELATIONSHIP_OPTIONS, suggestMessage } from '../data/onboarding';
import { generateInviteMessage } from '../lib/ai';

const CHIPS = [...RELATIONSHIP_OPTIONS, 'Other'] as const;

export default function InviteScreen() {
  const { state, go } = useStore();
  const link = inviteLinkFor(state.suName);
  const fromPeople = state.inviteFrom === 'people';

  const [relationship, setRelationship] = React.useState<string | null>(null);
  const [other, setOther] = React.useState('');
  const [seed, setSeed] = React.useState(0);
  const [message, setMessage] = React.useState(suggestMessage(null, 0));
  const [busy, setBusy] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [linkCopied, setLinkCopied] = React.useState(false);

  const effectiveRel = relationship === 'Other' ? other.trim() || null : relationship;

  const pickRelationship = (rel: string) => {
    haptics.select();
    const next = rel === relationship ? null : rel;
    setRelationship(next);
    setSeed(0);
    const r = next === 'Other' ? other.trim() || null : next;
    setMessage(suggestMessage(r, 0));
  };

  const regenerate = async () => {
    if (busy) return;
    haptics.select();
    const next = seed + 1;
    setSeed(next);
    setBusy(true);
    const msg = await generateInviteMessage({ relationship: effectiveRel, senderName: state.suName }, next);
    setMessage(msg);
    setBusy(false);
  };

  const shareText = `${message}\n\n${link}`;

  const share = async () => {
    haptics.tap();
    try {
      await Share.share({ message: shareText });
    } catch {
      /* dismissed */
    }
  };
  const copyMessage = async () => {
    await Clipboard.setStringAsync(shareText);
    haptics.success();
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  const copyLink = async () => {
    await Clipboard.setStringAsync(link);
    haptics.success();
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1600);
  };

  return (
    <Screen contentStyle={styles.wrap}>
      {fromPeople ? <BackLink label="My people" onPress={() => go('people')} /> : null}
      <T variant="title" style={styles.h1}>
        Invite your people
      </T>
      <T variant="meta" style={styles.sub}>
        Pick who you're asking and we'll draft the note. Edit it however you like.
      </T>

      {/* relationship — one scrollable line, with a custom "Other" */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
      >
        {CHIPS.map((rel) => {
          const on = relationship === rel;
          return (
            <Pressable key={rel} onPress={() => pickRelationship(rel)} style={[styles.chip, on && styles.chipOn]}>
              <Text style={[styles.chipText, on && { color: colors.accentInk }]}>{rel}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {relationship === 'Other' ? (
        <TextInput
          value={other}
          onChangeText={setOther}
          placeholder="Who are they to you? (e.g. mentor, teammate)"
          placeholderTextColor={colors.muted}
          style={styles.otherInput}
          autoFocus
        />
      ) : null}

      {/* message */}
      <View style={styles.msgHead}>
        <T variant="label" style={{ marginBottom: 0 }}>
          Your message
        </T>
        <Pressable onPress={regenerate} hitSlop={8} style={styles.regen} disabled={busy}>
          <Ionicons name="sparkles" size={13} color={colors.link} />
          <Text style={styles.regenText}>{busy ? 'Writing…' : 'Regenerate'}</Text>
        </Pressable>
      </View>
      <TextInput
        value={message}
        onChangeText={setMessage}
        multiline
        style={styles.msgInput}
        placeholder="Write a note…"
        placeholderTextColor={colors.muted}
      />

      <View style={styles.actions}>
        <Button
          title={copied ? 'Copied' : 'Copy'}
          variant="secondary"
          compact
          style={{ flex: 1 }}
          onPress={copyMessage}
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

      {/* compact link row */}
      <Pressable onPress={copyLink} style={styles.linkRow}>
        <Ionicons name="link" size={15} color={colors.muted} />
        <Text style={styles.linkText} numberOfLines={1}>
          {link}
        </Text>
        <Text style={styles.linkCopy}>{linkCopied ? 'Copied' : 'Copy'}</Text>
      </Pressable>

      <View style={{ flex: 1, minHeight: 8 }} />

      <Button
        title={fromPeople ? 'Done' : 'Next'}
        variant="primary"
        onPress={() => go(fromPeople ? 'people' : 'home')}
      />
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
  sub: { marginTop: 8, maxWidth: '94%' },

  chipScroll: { marginTop: 20, marginHorizontal: -24, flexGrow: 0 },
  chipRow: { paddingHorizontal: 24, gap: 8 },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accentDeep },
  chipText: { fontFamily: font.bold, fontSize: 13.5, color: colors.inkSoft },

  otherInput: {
    marginTop: 10,
    height: 50,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    paddingHorizontal: 14,
    fontFamily: font.semi,
    fontSize: 15,
    color: colors.ink,
  },

  msgHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  regen: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  regenText: { fontFamily: font.bold, fontSize: 12.5, color: colors.link },
  msgInput: {
    marginTop: 10,
    minHeight: 128,
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

  actions: { flexDirection: 'row', gap: 9, marginTop: 12 },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 14,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
  },
  linkText: { flex: 1, fontFamily: font.semi, fontSize: 13, color: colors.inkSoft },
  linkCopy: { fontFamily: font.bold, fontSize: 12.5, color: colors.link },

  laterBtn: { alignItems: 'center', paddingVertical: 13 },
  laterText: { fontFamily: font.bold, fontSize: 14.5, color: colors.muted },
});
