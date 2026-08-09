import React from 'react';
import { View, StyleSheet, Pressable, Text, Alert } from 'react-native';
import { Screen, T, Button, Wordmark } from '../ui/kit';
import { colors, font } from '../theme';
import { useStore } from '../state/store';
import { useAuth } from '../state/auth';

const GoogleBadge = () => (
  <View style={styles.gBadge}>
    <Text style={styles.gLetter}>G</Text>
  </View>
);

export default function AuthScreen() {
  const { go } = useStore();
  const { configured, signInWithGoogle } = useAuth();
  const [busy, setBusy] = React.useState(false);

  const google = async () => {
    if (!configured) {
      go('doors'); // mock mode
      return;
    }
    setBusy(true);
    const { error } = await signInWithGoogle();
    setBusy(false);
    if (error) Alert.alert('Google sign-in failed', error);
    // on success, the session gate routes to home
  };

  return (
    <Screen scroll={false} contentStyle={styles.wrap}>
      <Wordmark />

      <View style={styles.hero}>
        <T variant="display">Discover what makes you exceptional.</T>
        <View style={styles.rule} />
        <T variant="body" style={styles.sub}>
          Ask the people who know you best. Find the strengths they uniquely value in you, then build your
          career around them.
        </T>
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ gap: 10 }}>
        <Button title={busy ? 'Connecting…' : 'Sign up with Google'} variant="dark" left={<GoogleBadge />} onPress={google} />
        <Button title="Sign up with email" variant="secondary" onPress={() => go('signup')} />
        <Pressable onPress={() => go('login')} style={styles.textBtn} hitSlop={8}>
          <Text style={styles.textBtnLabel}>I already have an account</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 24, paddingBottom: 16 },
  hero: { marginTop: 64 },
  rule: { width: 46, height: 3, backgroundColor: colors.ink, marginTop: 24, borderRadius: 2 },
  sub: { marginTop: 20, maxWidth: '92%' },
  textBtn: { alignItems: 'center', paddingVertical: 14 },
  textBtnLabel: { fontFamily: font.bold, fontSize: 15.5, color: colors.link },
  gBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gLetter: { fontFamily: font.display, fontSize: 13, color: colors.ink },
});
