// Edge Function: interview-turn
// Given the interview so far, returns the single best next question for the
// fascination (interest) self-interview. Stateless: the app passes the running
// turns; this function plans the format + wrap-up window and asks the model.
//
// Deploy:  supabase functions deploy interview-turn
// Body: { interest, turns: [{question, answer, quality}], priorAsked: [] }

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { cors, json, structured, obj } from '../_shared/openai.ts';
import { INTERVIEW_SYSTEM_INTEREST, buildInterviewInterestUser, INTERVIEW_TYPES, fillInterviewTokens } from '../_shared/prompts.ts';

// Interest self-interview runs "deep" (pretty_close): 6–9 questions.
const MIN_Q = 6;
const MAX_Q = 9;

// Format variety, planned in code so the model only fills content: deep mode is
// open-led with an occasional tap as a change-up.
function planFormat(n: number): 'open' | 'choice' | 'binary' {
  if (n === 1) return 'open'; // opener is always the exact first question
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
};

const SCHEMA = obj({
  questionText: { type: 'string' },
  questionType: { type: 'string', enum: ['open_text', 'choice_then_explain'] },
  options: { type: 'array', items: { type: 'string' } },
  topic: { type: 'string' },
  isProbe: { type: 'boolean' },
  wrapUp: { type: 'boolean' },
  reason: { type: 'string' },
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { interest, turns = [], priorAsked = [] } = await req.json().catch(() => ({}));
    const answered = Array.isArray(turns) ? turns.length : 0;
    const questionNumber = answered + 1;

    // The very first question is fixed copy (verbatim), no model call needed.
    if (questionNumber === 1) {
      return json({
        questionText: fillInterviewTokens(INTERVIEW_TYPES.interest.firstQuestion, { subject: interest }),
        questionType: 'open_text',
        options: [],
        topic: 'opening',
        isProbe: false,
        wrapUp: false,
        reason: 'fixed opener',
      });
    }

    const canEnd = questionNumber > MIN_Q;
    const mustEnd = questionNumber >= MAX_Q;
    const format = planFormat(questionNumber);

    const user = buildInterviewInterestUser({
      interest: interest || 'this interest',
      turns,
      priorAsked,
      questionNumber,
      minQuestions: MIN_Q,
      maxQuestions: MAX_Q,
      canEnd,
      mustEnd,
      format,
    });

    const out = await structured<TurnOut>(
      INTERVIEW_SYSTEM_INTEREST,
      user,
      'interview_turn',
      SCHEMA,
      0.9,
    );
    return json(out);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
