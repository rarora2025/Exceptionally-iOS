import React from 'react';
import { View, StyleSheet, Pressable, Text, TextInput, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { Screen, T, Button, Card, Avatar, BackLink } from '../ui/kit';
import { colors, font, radius, shadow } from '../theme';
import { useStore, initials, inviteLinkFor } from '../state/store';
import * as haptics from '../lib/haptics';
import { DIRECTORY, RELATIONSHIP_OPTIONS, suggestMessage } from '../data/onboarding';

export default function InviteScreen() {
  const { state, patch, go, addPerson } = useStore();
  const pq = (state.peopleQuery || '').trim().toLowerCase();
  const results = pq
    ? DIRECTORY.filter((p) => (p.name + ' ' + p.detail).toLowerCase().includes(pq))
    : [];

  const link = inviteLinkFor(state.suName);
  const fromPeople = state.inviteFrom === 'people';

  // Message composer state (local to the screen).
  const [relationship, setRelationship] = React.useState<string | null>(null);
  const [variant, setVariant] = React.useState(0);
  const [message, setMessage] = React.useState(suggestMessage(null, 0));
  const [copied, setCopied] = React.useState(false);

  const pickRelationship = (rel: string) => {
    haptics.select();
    const next = rel === relationship ? null : rel;
    setRelationship(next);
    setVariant(0);
    setMessage(suggestMessage(next, 0));
  };
  const regenerate = () => {
    haptics.select();
    const v = variant + 1;
    setVariant(v);
    setMessage(suggestMessage(relationship, v));
  };

  const shareText = `${message}\n\n${link}`;

  const copyLink = async () => {
    await Clipboard.setStringAsync(link);
    haptics.success();
    patch({ copied: true });
    setTimeout(() => patch({ copied: false }), 1800);
  };
  const copyMessage = async () => {
    await Clipboard.setStringAsync(shareText);
    haptics.success();
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const share = async () => {
    haptics.tap();
    try {
      await Share.share({ message: shareText });
    } catch {
      /* user dismissed */
    }
  };
  const ask = (p: { name: string; detail: string; tint: string }) => {
    if (state.askedPeople.includes(p.name)) return;
    haptics.select();
    patch({ askedPeople: [...state.askedPeople, p.name] });
    addPerson(p.name, p.detail, p.tint); // persists to Supabase when configured
  };

  return (
    <Screen contentStyle={styles.wrap}>
      {fromPeople ? <BackLink label="My people" onPress={() => go('people')} /> : null}
      <T variant="title" style={styles.h1}>
        Invite your people
      </T>

      {/* directory search */}
      <View style={styles.searchBlock}>
        <T variant="label">Find someone already on Exceptionally</T>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={state.peopleQuery}
            onChangeText={(t) => patch({ peopleQuery: t })}
            placeholder="Search by name or email"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            style={styles.searchInput}
          />
        </View>
      </View>

      {results.length > 0 ? (
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
      ) : null}

      {/* personal link */}
      <Card style={styles.linkCard} flat>
        <T variant="label" style={{ marginBottom: 9 }}>
          Your personal link
        </T>
        <View style={styles.linkWell}>
          <Text style={styles.linkText} numberOfLines={1}>
            {link}
          </Text>
        </View>
        <Button
          title={state.copied ? 'Copied' : 'Copy link'}
          variant={state.copied ? 'primary' : 'dark'}
          compact
          style={{ marginTop: 10 }}
          onPress={copyLink}
        />
      </Card>

      {/* share invite — relationship-tailored, editable message */}
      <View style={styles.msgCard}>
        <T variant="label">Who are you asking?</T>
        <View style={styles.relRow}>
          {RELATIONSHIP_OPTIONS.map((rel) => {
            const on = relationship === rel;
            return (
              <Pressable key={rel} onPress={() => pickRelationship(rel)} style={[styles.relChip, on && styles.relChipOn]}>
                <Text style={[styles.relText, on && { color: colors.accentInk }]}>{rel}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.msgHead}>
          <T variant="label" style={{ marginBottom: 0 }}>
            Your message
          </T>
          <Pressable onPress={regenerate} hitSlop={8} style={styles.regen}>
            <Ionicons name="refresh" size={13} color={colors.link} />
            <Text style={styles.regenText}>Regenerate</Text>
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

        <View style={styles.msgActions}>
          <Button
            title={copied ? 'Copied' : 'Copy'}
            variant="secondary"
            compact
            style={{ flex: 1 }}
            onPress={copyMessage}
          />
          <Button
            title="Share"
            variant="dark"
            compact
            style={{ flex: 1 }}
            left={<Ionicons name="share-outline" size={17} color={colors.onDark} />}
            onPress={share}
          />
        </View>
      </View>

      <Button
        title={fromPeople ? 'Done' : 'Next'}
        variant="dark"
        style={styles.cta}
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
  wrap: { flex: 1, paddingTop: 12, paddingBottom: 20 },
  h1: { marginTop: 4 },

  searchBlock: { marginTop: 24, gap: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  searchIcon: { fontSize: 18, color: colors.muted },
  searchInput: { flex: 1, fontFamily: font.semi, fontSize: 15, color: colors.ink },

  results: { marginTop: 10, gap: 6 },
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

  linkCard: { marginTop: 22, borderWidth: 1.5, borderColor: colors.line },
  linkWell: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  linkText: { fontFamily: font.bold, fontSize: 13.5, color: colors.ink },

  msgCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: radius.xl,
    backgroundColor: colors.bgWarm,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  relRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 },
  relChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
  },
  relChipOn: { backgroundColor: colors.accent, borderColor: colors.accentDeep },
  relText: { fontFamily: font.bold, fontSize: 12.5, color: colors.inkSoft },

  msgHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  regen: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  regenText: { fontFamily: font.bold, fontSize: 12.5, color: colors.link },
  msgInput: {
    marginTop: 10,
    minHeight: 96,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    padding: 14,
    fontFamily: font.medium,
    fontSize: 14.5,
    lineHeight: 21,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  msgActions: { flexDirection: 'row', gap: 8, marginTop: 12 },

  cta: { marginTop: 22 },
  laterBtn: { alignItems: 'center', paddingVertical: 14 },
  laterText: { fontFamily: font.bold, fontSize: 14.5, color: colors.muted },
});
