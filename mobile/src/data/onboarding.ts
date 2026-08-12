import { colors } from '../theme';

// Ported verbatim from the prototype (copy + data unchanged).

export const DOORS_STEPS = [
  {
    n: 1,
    title: 'Invite different perspectives',
    body: 'People who know you best share what they uniquely see in you.',
    dot: colors.accent,
  },
  {
    n: 2,
    title: 'Interview yourself',
    body: 'Short AI interviews uncover the topics and work that pull you in.',
    dot: colors.surface,
  },
  {
    n: 3,
    title: 'Put it to work',
    body: 'See what makes you exceptional, and build your career around it.',
    dot: colors.tintBlue,
  },
] as const;

export const ONBOARDING_GOALS = [
  'Applying to college',
  'Looking for a job',
  'Getting more out of the job I have',
] as const;

// Searchable directory for the invite screen.
export const DIRECTORY = [
  { name: 'David Okonkwo', detail: 'd.okonkwo@email.com', tint: colors.accent },
  { name: 'Priya Raman', detail: 'priya.raman@email.com', tint: colors.tintBlue },
  { name: 'Sam Whitfield', detail: 'sam.whitfield@email.com', tint: colors.tintPeach },
  { name: 'Elena Duarte', detail: 'elena.d@email.com', tint: colors.tintLilac },
] as const;

export const SUGGESTED_MESSAGE = [
  "Hi Maya, I'm using Exceptionally to understand what I do unusually well and how to build my career around it.",
  "I'd really value your perspective. It's a short AI interview and should take about five minutes. You can answer by voice or text.",
] as const;

// Relationship options for tailoring the suggested message.
export const RELATIONSHIP_OPTIONS = ['Friend', 'Colleague', 'Manager', 'Family'] as const;

// A couple of tones per relationship; "regenerate" cycles through them.
const MESSAGE_TEMPLATES: Record<string, string[]> = {
  Friend: [
    "Hey! I'm using Exceptionally to figure out what I'm actually good at and where to take my career. Would love your honest take — it's a short interview, about 5 minutes, by voice or text.",
    "Hi! Doing this thing called Exceptionally to understand my strengths. You know me well, so your perspective would mean a lot. Takes about 5 minutes, voice or text.",
  ],
  Colleague: [
    "Hi — I'm using Exceptionally to understand my strengths and how to build my career around them. I'd really value your perspective. It's a short 5-minute interview, by voice or text.",
    "Hi — we've worked closely, so I'd love your read on what I do well. I'm mapping my strengths with Exceptionally. Quick 5-minute interview, voice or text.",
  ],
  Manager: [
    "Hi — I'm using Exceptionally to better understand my strengths and where I add the most value. I'd really value your perspective. It's a quick 5-minute interview, by voice or text.",
    "Hi — you've seen my work up close, so your perspective would be really valuable. I'm mapping my strengths with Exceptionally. Takes about 5 minutes.",
  ],
  Family: [
    "Hi! I'm using Exceptionally to understand what makes me, well, me — and how to build a career around it. You've known me forever, so your take would mean a lot. Short 5-minute interview.",
    "Hey! I'm figuring out my strengths and what I'm drawn to. Would love your perspective — it's a short interview, about 5 minutes, by voice or text.",
  ],
};

const DEFAULT_MESSAGE =
  "Hi — I'm using Exceptionally to understand what I do unusually well and how to build my career around it. I'd really value your perspective. It's a short 5-minute interview, by voice or text.";

export const suggestMessage = (relationship: string | null, variant: number): string => {
  const list = relationship ? MESSAGE_TEMPLATES[relationship] : null;
  if (!list || list.length === 0) return DEFAULT_MESSAGE;
  return list[variant % list.length];
};
