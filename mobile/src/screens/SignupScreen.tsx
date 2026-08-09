import React from 'react';
import { View, StyleSheet, Pressable, Text, Alert } from 'react-native';
import { Screen, T, Button, Field, BackLink } from '../ui/kit';
import { colors, font } from '../theme';
import { useStore, suReady } from '../state/store';
import { useAuth } from '../state/auth';

export default function SignupScreen() {
  const { state, patch, go } = useStore();
  const { configured, signUp } = useAuth();
  const [busy, setBusy] = React.useState(false);
  const ready = suReady(state) && !busy;

  const submit = async () => {
    if (!suReady(state) || busy) return;
    if (!configured) {
      go('doors'); // mock mode until Supabase is configured
      return;
    }
    setBusy(true);
    const { error } = await signUp(state.suEmail, state.suPw, state.suName);
    setBusy(false);
    if (error) {
      Alert.alert('Could not create account', error);
      return;
    }
    go('doors');
  };

  return (
    <Screen contentStyle={styles.wrap}>
      <BackLink onPress={() => go('auth')} />
      <T variant="title" style={styles.h1}>
        Create your account
      </T>

      <View style={styles.form}>
        <Field
          label="Full name"
          placeholder="Jordan Reyes"
          value={state.suName}
          onChangeText={(t) => patch({ suName: t })}
          autoCapitalize="words"
        />
        <Field
          label="Email"
          placeholder="you@email.com"
          value={state.suEmail}
          onChangeText={(t) => patch({ suEmail: t })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          label="Password"
          placeholder="At least 8 characters"
          value={state.suPw}
          onChangeText={(t) => patch({ suPw: t })}
          secureTextEntry
        />
      </View>

      <View style={{ flex: 1, minHeight: 24 }} />

      <Button title={busy ? 'Creating account…' : 'Create account'} onPress={submit} disabled={!ready} />
      <T variant="meta" style={styles.terms}>
        By continuing you agree to our Terms and Privacy Policy.
      </T>
      <Pressable onPress={() => go('login')} style={styles.textBtn} hitSlop={8}>
        <Text style={styles.textBtnLabel}>I already have an account</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 12, paddingBottom: 12 },
  h1: { marginTop: 4 },
  form: { marginTop: 26, gap: 14 },
  terms: { textAlign: 'center', marginTop: 14 },
  textBtn: { alignItems: 'center', paddingVertical: 10, marginTop: 2 },
  textBtnLabel: { fontFamily: font.bold, fontSize: 15, color: colors.link },
});
