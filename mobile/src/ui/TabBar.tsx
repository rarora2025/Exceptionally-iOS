import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, shadow } from '../theme';
import { useStore, Screen } from '../state/store';

const HOME_GROUP: Screen[] = ['home', 'chat', 'people', 'fascHub', 'fascBucket', 'fascSeed', 'fascInterview', 'fascResult'];
const PROFILE_GROUP: Screen[] = ['profile', 'artifact'];
const TOOLS_GROUP: Screen[] = ['tools', 'toolRun'];

const TABS: { key: Screen; label: string; icon: string; group: Screen[] }[] = [
  { key: 'home', label: 'Home', icon: 'home', group: HOME_GROUP },
  { key: 'profile', label: 'Profile', icon: 'person', group: PROFILE_GROUP },
  { key: 'tools', label: 'Tools', icon: 'construct', group: TOOLS_GROUP },
];

export const TAB_BAR_SPACE = 108;

export default function TabBar() {
  const { state, go } = useStore();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 14) }]}>
      <View style={styles.bar}>
        {TABS.map((t) => {
          const on = t.group.includes(state.screen);
          return (
            <Pressable key={t.key} onPress={() => go(t.key)} style={[styles.tab, on && styles.tabOn]}>
              <Ionicons name={(on ? t.icon : `${t.icon}-outline`) as any} size={22} color={on ? colors.accentInk : colors.muted} />
              {on ? <Text style={styles.label}>{t.label}</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 7,
    ...shadow.tab,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
  },
  tabOn: { backgroundColor: colors.accent, paddingHorizontal: 20 },
  label: { fontFamily: font.bold, fontSize: 15, color: colors.accentInk },
});
