import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Screen, T, Button, BackLink, Avatar } from '../ui/kit';
import { TAB_BAR_SPACE } from '../ui/TabBar';
import { colors, font, radius, shadow } from '../theme';
import { useStore, initials } from '../state/store';

// Fallback for mock mode (before Supabase hydration populates state.people).
const FALLBACK_PEOPLE = [
  { name: 'David Okonkwo', detail: 'd.okonkwo@email.com', tint: colors.accent, status: 'Answered' },
  { name: 'Maya Fischer', detail: 'maya.fischer@email.com', tint: colors.tintBlue, status: 'Answered' },
  { name: 'Priya Raman', detail: 'priya.raman@email.com', tint: colors.tintPeach, status: 'Joined' },
  { name: 'Sam Whitfield', detail: 'sam.whitfield@email.com', tint: colors.tintLilac, status: 'Invited' },
];

const statusStyle = (s: string) => {
  if (s === 'Answered') return { bg: colors.accent, fg: colors.accentInk };
  if (s === 'Joined') return { bg: colors.tintBlue, fg: colors.link };
  return { bg: colors.surfaceSunken, fg: colors.inkSoft };
};

export default function PeopleScreen() {
  const { state, patch, go } = useStore();
  const people = state.people.length ? state.people : FALLBACK_PEOPLE;
  return (
    <Screen contentStyle={styles.wrap}>
      <BackLink label="Profile" onPress={() => go('profile')} />
      <View style={styles.head}>
        <T variant="title">My people</T>
        <Text style={styles.count}>{people.length} invited</Text>
      </View>

      <View style={{ gap: 8, marginTop: 20 }}>
        {people.map((p) => {
          const st = statusStyle(p.status);
          return (
            <View key={p.name} style={styles.row}>
              <Avatar initials={initials(p.name)} tint={p.tint} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.detail}>{p.detail}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: st.bg }]}>
                <Text style={[styles.badgeText, { color: st.fg }]}>{p.status}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <Button
        title="Invite someone new"
        variant="dark"
        style={{ marginTop: 22 }}
        onPress={() => patch({ screen: 'invite', inviteFrom: 'people' })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 12, paddingBottom: TAB_BAR_SPACE },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 14 },
  count: { fontFamily: font.bold, fontSize: 13.5, color: colors.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: radius.md, backgroundColor: colors.surface, ...shadow.soft },
  name: { fontFamily: font.bold, fontSize: 14.5, color: colors.ink },
  detail: { fontFamily: font.medium, fontSize: 12.5, color: colors.muted, marginTop: 1 },
  badge: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill },
  badgeText: { fontFamily: font.bold, fontSize: 12 },
});
