import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { createClient } from '@supabase/supabase-js';

// Public config — anon key is safe to ship in a client (protected by RLS).
// Values come from mobile/.env as EXPO_PUBLIC_* (auto-loaded by Expo).
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured && __DEV__) {
  console.warn(
    '[supabase] Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Create mobile/.env with your project URL and anon key.',
  );
}

// Fall back to a syntactically-valid placeholder when unconfigured so
// createClient() doesn't throw at import time (mock mode still runs the app).
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Keep the session token fresh while the app is in the foreground.
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

// Remove the persisted session directly from storage. supabase.auth.signOut()
// makes a network call and can throw before it clears storage (e.g. offline),
// which would otherwise auto-restore the session on next launch. This uses the
// exact storage key the client was configured with, so it stays correct if the
// project or key format changes.
export async function clearStoredSession(): Promise<void> {
  try {
    const key = (supabase.auth as unknown as { storageKey?: string }).storageKey;
    const explicit = key ? [key, `${key}-code-verifier`] : [];
    // Fallback sweep: remove any Supabase auth-token keys (`sb-<ref>-auth-token`)
    // in case the client's storageKey isn't reachable — guarantees an offline
    // sign-out won't be restored on the next launch.
    const all = await AsyncStorage.getAllKeys();
    const swept = all.filter((k) => k.startsWith('sb-') && k.includes('-auth-token'));
    const toRemove = Array.from(new Set([...explicit, ...swept]));
    if (toRemove.length) await AsyncStorage.multiRemove(toRemove);
  } catch {
    // best effort — the in-memory session is already cleared by the caller
  }
}
