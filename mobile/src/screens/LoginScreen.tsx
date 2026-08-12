import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Screen, T, Button, Field, BackLink, ErrorBanner } from '../ui/kit';
import { colors, font } from '../theme';
import { useStore, liReady } from '../state/store';
import { useAuth } from '../state/auth';
import { humanizeAuthError } from '../lib/errors';

export default function LoginScreen() {
  const { state, patch, go } = useStore();
  const { configured, signIn } = useAuth();
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const ready = liReady(state) && !busy;

  const submit = async () => {
    if (!liReady(state) || busy) return;
    setErr(null);
    if (!configured) {
      go('home'); // mock mode
      return;
    }
    setBusy(true);
    const { error } = await signIn(state.liEmail, state.liPw);
    setBusy(false);
    if (error) {
      setErr(humanizeAuthError(error));
      return;
    }
    // session listener + Router gate will route to home
  };

  return (
    <Screen contentStyle={styles.wrap}>
      <BackLink onPress={() => go('auth')} />
      <T variant="title" style={styles.h1}>
        Welcome back
      </T>

      <View style={styles.form}>
        <Field
          label="Email"
          placeholder="you@email.com"
          value={state.liEmail}
          onChangeText={(t) => {
            patch({ liEmail: t });
            if (err) setErr(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          label="Password"
          placeholder="••••••••"
          value={state.liPw}
          onChangeText={(t) => {
            patch({ liPw: t });
            if (err) setErr(null);
          }}
          secureTextEntry
        />
        <Pressable hitSlop={8} style={styles.forgot}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>
      </View>

      <ErrorBanner message={err} onDismiss={() => setErr(null)} style={{ marginTop: 18 }} />

      <View style={{ flex: 1, minHeight: 24 }} />

      <Button title={busy ? 'Logging in…' : 'Log in'} onPress={submit} disabled={!ready} />
      <Pressable onPress={() => go('signup')} style={styles.textBtn} hitSlop={8}>
        <Text style={styles.textBtnLabel}>Create an account</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 12, paddingBottom: 12 },
  h1: { marginTop: 4 },
  form: { marginTop: 26, gap: 14 },
  forgot: { alignSelf: 'flex-start', paddingVertical: 2 },
  forgotText: { fontFamily: font.bold, fontSize: 14, color: colors.link },
  textBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 6 },
  textBtnLabel: { fontFamily: font.bold, fontSize: 15, color: colors.link },
});
