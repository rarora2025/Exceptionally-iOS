import { colors } from '../theme';

// Ported verbatim from the prototype (copy + data unchanged).

export const DOORS_STEPS = [
  {
    n: 1,
    title: 'Invite different perspectives',
    body: 'A friend, family member, colleague, manager, classmate, anyone who has seen a real side of you.',
    dot: colors.accent,
  },
  {
    n: 2,
    title: 'Watch a pattern emerge',
    body: 'Each 5-minute AI interview looks for specific moments, effects, and comparisons.',
    dot: colors.surface,
  },
  {
    n: 3,
    title: 'Put it to work',
    body: 'Use the result to tell your story, evaluate roles, and decide where your strengths can compound.',
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
