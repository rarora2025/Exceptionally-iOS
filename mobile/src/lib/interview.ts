import { supabase, isSupabaseConfigured } from './supabase';

// Client for the interview edge functions (interview-turn / extract /
// synthesize). Key stays server-side; the app just invokes.

export type Turn = { question: string; answer: string; quality: string };

export type Question = {
  questionText: string;
  questionType: 'open_text' | 'choice_then_explain';
  options: string[];
  topic: string;
  isProbe: boolean;
  wrapUp: boolean;
  reason: string;
};

export type Artifact = {
  title: string;
  one_liner: string;
  moat: string;
  confidence: string;
  what_people_see: string;
  deeper_mechanism: string;
  shows_up_when: string;
  why_it_matters: string;
  evidence: string[];
  ask_for_help: string[];
};

// True when the backend is reachable in principle (Supabase configured). The
// functions still need to be deployed; calls throw if they aren't.
export const interviewAvailable = isSupabaseConfigured;

async function invoke<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) {
    if (__DEV__) console.warn(`[interview] ${fn}:`, error?.message ?? error);
    throw error;
  }
  if (data && typeof data === 'object' && 'error' in data && (data as { error?: unknown }).error) {
    throw new Error(String((data as { error: unknown }).error));
  }
  return data as T;
}

export function nextQuestion(interest: string, turns: Turn[], priorAsked: string[] = []): Promise<Question> {
  return invoke<Question>('interview-turn', { interest, turns, priorAsked });
}

export async function extractSignal(firstName: string, interest: string, turns: Turn[]): Promise<unknown> {
  const lines = turns.map((t) => ({ label: t.question, value: t.answer }));
  const { signal } = await invoke<{ signal: unknown }>('extract', { firstName, interest, lines });
  return signal;
}

export function synthesizeArtifact(firstName: string, interest: string, signal: unknown): Promise<Artifact> {
  return invoke<{ artifact: Artifact }>('synthesize', { firstName, interest, signal }).then((r) => r.artifact);
}

// Rough answer-quality tag for the interviewer's context (it weighs how much
// signal each turn carried). Length is a cheap proxy; the model does the rest.
export function answerQuality(text: string): string {
  const n = text.trim().length;
  if (n < 40) return 'brief';
  if (n < 140) return 'okay';
  return 'rich';
}
