import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen, T, Button, Wordmark } from '../ui/kit';
import { colors } from '../theme';
import { useStore, Screen as ScreenName } from '../state/store';

// Temporary landing for post-onboarding destinations. The full Home / Profile /
// Tools / Fascinations flows are ported in the next phase.
export default function Placeholder({ name }: { name: ScreenName }) {
  const { go } = useStore();
  const label = name[0].toUpperCase() + name.slice(1);
  return (
    <Screen scroll={false} contentStyle={styles.wrap}>
      <Wordmark />
      <View style={styles.center}>
        <View style={styles.badge}>
          <T variant="label" style={{ color: colors.accentInk }}>
            Onboarding complete
          </T>
        </View>
        <T variant="title" style={styles.h1}>
          {label}
        </T>
        <T variant="body" style={styles.sub}>
          You made it through the onboarding flow. This screen is a placeholder — the full {label} experience is
          next up.
        </T>
      </View>
      <Button title="Back to start" variant="secondary" onPress={() => go('auth')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 24, paddingBottom: 20 },
  center: { flex: 1, justifyContent: 'center', gap: 14 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  h1: {},
  sub: { maxWidth: '94%' },
});
