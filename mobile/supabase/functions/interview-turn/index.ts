// Edge Function: interview-turn
// Returns the single best next question for a self-interview. Two modes:
//   mode "discover" (+ lens) — a short interview that SURFACES a handful of
//     candidate topics in a lens (industries / work / environments).
//   mode "interest" (default, + interest) — the deeper root-cause interview
//     about ONE chosen topic.
// Stateless: the app passes the running turns; this plans the format + wrap
// window and asks the model. The first question is fixed verbatim copy.
//
// Deploy:  supabase functions deploy interview-turn
// Body: { mode?, interest?, lens?, turns:[{question,answer,quality}], priorAsked:[] }

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { cors, json, structured, obj } from '../_shared/openai.ts';
import {
  INTERVIEW_SYSTEM_INTEREST,
  buildInterviewInterestUser,
  INTERVIEW_TYPES,
  fillInterviewTokens,
  DISCOVER_SYSTEM,
  buildDiscoverUser,
  DISCOVER_LENSES,
  PULLS_SYSTEM,
  buildPullsUser,
  PULLS_LENSES,
} from '../_shared/prompts.ts';

// Deeper interest interview runs longer; discovery is short (breadth).
// pulls: one required opener + one required negative turn, adaptive between.
const RANGE = { interest: { min: 6, max: 9 }, discover: { min: 4, max: 6 }, pulls: { min: 5, max: 6 } };
// In pulls mode, question #NEG_AT is the fixed negative-turn opener.
const NEG_AT = 4;

function planFormat(n: number): 'open' | 'choice' | 'binary' {
  if (n === 1) return 'open';
  if (n % 4 === 0) return 'choice';
  if (n % 5 === 0) return 'binary';
  return 'open';
}

type TurnOut = {
  questionText: string;
  questionType: 'open_text' | 'choice_then_explain';
  options: string[];
  topic: string;
  isProbe: boolean;
  wrapUp: boolean;
  reason: string;
  listSoFar: string[];
};

const SCHEMA = obj({
  questionText: { type: 'string' },
  questionType: { type: 'string', enum: ['open_text', 'choice_then_explain'] },
  options: { type: 'array', items: { type: 'string' } },
  topic: { type: 'string' },
  isProbe: { type: 'boolean' },
  wrapUp: { type: 'boolean' },
  reason: { type: 'string' },
  listSoFar: { type: 'array', items: { type: 'string' } },
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const body = await req.json().catch(() => ({}));
    const { mode = 'interest', interest, lens = 'domains', turns = [], priorAsked = [] } = body;
    const discover = mode === 'discover';
    const pulls = mode === 'pulls';
    const answered = Array.isArray(turns) ? turns.length : 0;
    const questionNumber = answered + 1;
    const { min, max } = pulls ? RANGE.pulls : discover ? RANGE.discover : RANGE.interest;

    // Fixed, verbatim questions — no model call. Q1 is the opener for every
    // mode; in pulls mode Q#NEG_AT is the required negative-turn opener.
    if (questionNumber === 1) {
      const first = pulls
        ? (PULLS_LENSES[lens] ?? PULLS_LENSES.work).positiveOpener
        : discover
          ? (DISCOVER_LENSES[lens] ?? DISCOVER_LENSES.domains).firstQuestion
          : fillInterviewTokens(INTERVIEW_TYPES.interest.firstQuestion, { subject: interest });
      return json({
        questionText: first,
        questionType: 'open_text',
        options: [],
        topic: 'opening',
        isProbe: false,
        wrapUp: false,
        reason: 'fixed opener',
        listSoFar: [],
      });
    }
    if (pulls && questionNumber === NEG_AT) {
      return json({
        questionText: (PULLS_LENSES[lens] ?? PULLS_LENSES.work).negativeOpener,
        questionType: 'open_text',
        options: [],
        topic: 'negative-turn',
        isProbe: false,
        wrapUp: false,
        reason: 'required negative turn',
        listSoFar: [],
      });
    }

    const canEnd = questionNumber > min;
    const mustEnd = questionNumber >= max;
    const format = planFormat(questionNumber);

    const system = pulls ? PULLS_SYSTEM(lens) : discover ? DISCOVER_SYSTEM(lens) : INTERVIEW_SYSTEM_INTEREST;
    const user = pulls
      ? buildPullsUser({ lens, turns, priorAsked, questionNumber, minQuestions: min, maxQuestions: max, phase: questionNumber > NEG_AT ? 'negative' : 'positive', canEnd, mustEnd })
      : discover
        ? buildDiscoverUser({ lens, turns, priorAsked, questionNumber, minQuestions: min, maxQuestions: max, canEnd, mustEnd, format })
        : buildInterviewInterestUser({ interest: interest || 'this interest', turns, priorAsked, questionNumber, minQuestions: min, maxQuestions: max, canEnd, mustEnd, format });

    const out = await structured<TurnOut>(system, user, 'interview_turn', SCHEMA, 0.9);
    return json(out);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
