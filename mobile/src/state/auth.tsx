import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, clearStoredSession } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

type AuthResult = { error: string | null };

type AuthCtx = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  configured: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp = useCallback<AuthCtx['signUp']>(async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    return { error: error?.message ?? null };
  }, []);

  const signIn = useCallback<AuthCtx['signIn']>(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { error: error?.message ?? null };
  }, []);

  const signInWithGoogle = useCallback<AuthCtx['signInWithGoogle']>(async () => {
    // Adaptive: in Expo Go this returns an exp:// proxy URL that Expo Go can
    // handle; in a standalone/dev build it uses the app's `exceptionally://`
    // scheme. Both must be allow-listed in Supabase → Auth → URL Configuration.
    const redirectTo = AuthSession.makeRedirectUri({ path: 'auth-callback' });
    if (__DEV__) console.log('[auth] google redirectTo =', redirectTo);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) return { error: error.message };
    if (!data?.url) return { error: 'Could not start Google sign-in.' };

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success' || !result.url) {
      return { error: result.type === 'cancel' ? null : 'Google sign-in was dismissed.' };
    }
    // Exchange the returned code for a session.
    const url = new URL(result.url);
    const code = url.searchParams.get('code');
    if (code) {
      const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
      return { error: exErr?.message ?? null };
    }
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    // Drive logout ourselves so it's instant and can't be blocked by the
    // network. supabase.auth.signOut() makes a request to revoke the token even
    // for scope:'local', and on a flaky/offline connection it can hang on an
    // internal auth lock or throw — either way it may never clear the stored
    // session, leaving the user auto-logged-in on the next launch. So:
    //   1. Clear the in-memory session → the Router routes to auth immediately.
    //   2. Wipe the persisted session directly and unconditionally.
    //   3. Fire the server-side revoke best-effort, never awaiting it (local
    //      scope keeps the user's other devices signed in).
    setSession(null);
    await clearStoredSession();
    supabase.auth.signOut({ scope: 'local' }).catch(() => {});
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      configured: isSupabaseConfigured,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
    }),
    [session, loading, signUp, signIn, signInWithGoogle, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAuth = (): AuthCtx => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
