import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

// The prototype drives everything off a single mutable `state` object and a
// `screen` string that acts as a state machine. We preserve that exact model.

export type Screen =
  | 'auth'
  | 'signup'
  | 'login'
  | 'doors'
  | 'invite'
  | 'people'
  | 'home'
  | 'profile'
  | 'tools'
  | 'chat';

export type Invite = { name: string; state: string };

export interface AppState {
  screen: Screen;
  // onboarding goal (doors)
  goal: string | null;
  // career goal (tools) — kept for later flows
  careerGoal: string | null;
  // signup form
  suName: string;
  suEmail: string;
  suPw: string;
  // login form
  liEmail: string;
  liPw: string;
  // invite / people
  peopleQuery: string;
  askedPeople: string[];
  inviteFrom: 'onboarding' | 'people';
  invites: Invite[];
  copied: boolean;
  msgCopied: boolean;
}

export const initialState: AppState = {
  screen: 'auth',
  goal: null,
  careerGoal: null,
  suName: '',
  suEmail: '',
  suPw: '',
  liEmail: '',
  liPw: '',
  peopleQuery: '',
  askedPeople: [],
  inviteFrom: 'onboarding',
  invites: [
    { name: 'David Okonkwo', state: 'Answered' },
    { name: 'Maya Fischer', state: 'Opened' },
    { name: 'Priya Raman', state: 'Sent' },
  ],
  copied: false,
  msgCopied: false,
};

type Ctx = {
  state: AppState;
  patch: (p: Partial<AppState>) => void;
  set: <K extends keyof AppState>(key: K, value: AppState[K]) => void;
  go: (screen: Screen) => void;
};

const StoreContext = createContext<Ctx | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);

  const patch = useCallback((p: Partial<AppState>) => setState((s) => ({ ...s, ...p })), []);
  const set = useCallback(
    <K extends keyof AppState>(key: K, value: AppState[K]) => setState((s) => ({ ...s, [key]: value })),
    [],
  );
  const go = useCallback((screen: Screen) => setState((s) => ({ ...s, screen })), []);

  const value = useMemo(() => ({ state, patch, set, go }), [state, patch, set, go]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = (): Ctx => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};

// ---- derived helpers (ported from the prototype's render()) ----

export const initials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

export const inviteHandle = (suName: string): string => {
  const rawName = (suName || '').trim() || 'Noah Reyes';
  return (
    rawName
      .toLowerCase()
      .replace(/[^a-z ]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .join('-') + '-4k2'
  );
};

export const inviteLinkFor = (suName: string): string => 'exceptionally.app/' + inviteHandle(suName);

export const suReady = (s: AppState): boolean =>
  !!((s.suName || '').trim() && (s.suEmail || '').includes('@') && (s.suPw || '').length >= 8);

export const liReady = (s: AppState): boolean =>
  !!((s.liEmail || '').includes('@') && (s.liPw || '').length >= 1);
