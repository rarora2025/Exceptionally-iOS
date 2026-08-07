import React from 'react';
import { View, StyleSheet, Pressable, Text, TextInput } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Screen, T, Button, Card, Avatar, BackLink } from '../ui/kit';
import { colors, font, radius, shadow } from '../theme';
import { useStore, initials, inviteLinkFor } from '../state/store';
import { DIRECTORY, SUGGESTED_MESSAGE } from '../data/onboarding';

export default function InviteScreen() {
  const { state, patch, go } = useStore();
  const pq = (state.peopleQuery || '').trim().toLowerCase();
  const results = pq
    ? DIRECTORY.filter((p) => (p.name + ' ' + p.detail).toLowerCase().includes(pq))
    : [];

  const link = inviteLinkFor(state.suName);
  const fromPeople = state.inviteFrom === 'people';

  const copyLink = async () => {
    await Clipboard.setStringAsync(link);
    patch({ copied: true });
    setTimeout(() => patch({ copied: false }), 1800);
  };
  const copyMsg = async () => {
    await Clipboard.setStringAsync(SUGGESTED_MESSAGE.join('\n\n'));
    patch({ msgCopied: true });
    setTimeout(() => patch({ msgCopied: false }), 1800);
  };
  const ask = (name: string) =>
    patch({ askedPeople: state.askedPeople.includes(name) ? state.askedPeople : [...state.askedPeople, name] });

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
                <Pressable
                  onPress={() => ask(p.name)}
                  style={[styles.askBtn, asked && styles.askBtnOn]}
                >
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
        <View style={styles.linkBtns}>
          <Button
            title={state.copied ? 'Copied' : 'Copy link'}
            variant={state.copied ? 'primary' : 'dark'}
            compact
            style={{ flex: 1 }}
            onPress={copyLink}
          />
          <Button title="Messages" variant="secondary" compact style={{ flex: 1 }} onPress={copyLink} />
        </View>
      </Card>

      {/* suggested message */}
      <View style={styles.msgCard}>
        <View style={styles.msgHead}>
          <T variant="label">Suggested message</T>
          <Pressable onPress={copyMsg} hitSlop={8}>
            <Text style={styles.msgCopy}>{state.msgCopied ? 'Copied' : 'Copy'}</Text>
          </Pressable>
        </View>
        <View style={styles.bubble}>
          {SUGGESTED_MESSAGE.map((line, i) => (
            <Text key={i} style={[styles.bubbleText, i > 0 && { marginTop: 10 }]}>
              {line}
            </Text>
          ))}
        </View>
      </View>

      <Button
        title={fromPeople ? 'Done' : 'Next'}
        variant="dark"
        style={styles.cta}
        onPress={() => go(fromPeople ? 'people' : 'home')}
      />
      <Pressable onPress={() => patch({ screen: 'cLand', cTurn: 0 })} style={styles.previewBtn} hitSlop={8}>
        <Text style={styles.previewText}>Preview what your people see →</Text>
      </Pressable>
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
  linkBtns: { flexDirection: 'row', gap: 8, marginTop: 10 },

  msgCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: radius.xl,
    backgroundColor: colors.bgWarm,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  msgHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  msgCopy: { fontFamily: font.bold, fontSize: 13, color: colors.link },
  bubble: {
    marginTop: 12,
    backgroundColor: colors.tintBlue,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    padding: 15,
  },
  bubbleText: { fontFamily: font.medium, fontSize: 14.5, lineHeight: 21, color: colors.ink },

  cta: { marginTop: 22 },
  previewBtn: { alignItems: 'center', paddingVertical: 14 },
  previewText: { fontFamily: font.bold, fontSize: 14.5, color: colors.link },
});
