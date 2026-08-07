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
  | 'chat'
  | 'artifact'
  | 'fascHub'
  | 'fascBucket'
  | 'fascSeed'
  | 'fascInterview'
  | 'fascResult'
  | 'toolRun'
  | 'transcript'
  | 'synthesis'
  | 'cLand'
  | 'cIntro'
  | 'cInterview'
  | 'cReview'
  | 'cDone';

export type Invite = { name: string; state: string };

export type ArtifactStyle = { emoji?: string; color?: string };

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

  // home
  problemDraft: string;
  notifsOn: boolean;
  // chat
  chatDraft: string;
  chatLog: { role: 'me' | 'ai'; text: string }[];
  // profile artifact editing
  fascStyle: Record<string, ArtifactStyle>;
  fascPicker: string | null;
  artifactKey: string; // which artifact detail is open
  // fascinations
  fascBucket: string;
  fascSeed: string;
  fTurn: number;
  fTranscript: string;
  // tools
  toolKey: string | null;
  toolPhase: 'idle' | 'running' | 'done';
  toolStep: number;
  toolPaste: string;
  toolLink: string;
  toolRole: string;
  toolHorizon: string;

  // synthesis (narrative builder)
  synthOutput: string;
  synthPicked: Record<string, boolean>;
  building: boolean;
  narrativeShown: boolean;
  // creation flow (someone interviews you)
  cTurn: number;
  reviewAction: string;
  attribution: string;
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

  problemDraft: '',
  notifsOn: false,
  chatDraft: '',
  chatLog: [],
  fascStyle: {},
  fascPicker: null,
  artifactKey: 'david',
  fascBucket: 'domains',
  fascSeed: 'AI agents',
  fTurn: 0,
  fTranscript: '',
  toolKey: null,
  toolPhase: 'idle',
  toolStep: 0,
  toolPaste: '',
  toolLink: '',
  toolRole: '',
  toolHorizon: 'Now',

  synthOutput: 'narrative',
  synthPicked: { david: true, maya: true, priya: true },
  building: false,
  narrativeShown: false,
  cTurn: 0,
  reviewAction: 'confirm',
  attribution: 'name',
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
