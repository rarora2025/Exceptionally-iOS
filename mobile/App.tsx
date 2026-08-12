import React from 'react';
import { View, ActivityIndicator, StyleSheet, LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { StoreProvider } from './src/state/store';
import { AuthProvider } from './src/state/auth';
import Router from './src/Router';
import { colors } from './src/theme';

// Supabase's background token-refresh logs a raw "Network request failed" to the
// dev console when connectivity is flaky (very common in the iOS Simulator).
// Real connectivity problems are surfaced in-app via ErrorBanner and an
// offline-safe sign-out, so silence just this benign dev-only LogBox overlay.
if (__DEV__) LogBox.ignoreLogs(['Network request failed']);

export default function App() {
  const [loaded] = useFonts({
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {loaded ? (
        <AuthProvider>
          <StoreProvider>
            <Router />
          </StoreProvider>
        </AuthProvider>
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.ink} />
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
