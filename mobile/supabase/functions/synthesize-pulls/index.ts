// Edge Function: synthesize-pulls
// Reads a single "pulls" interview (day-to-day work OR work environments) and
// returns the kinds of work/culture the person loves — each with the real
// reason it pulls them — plus the ones they strongly dislike / find draining.
//
// Deploy:  supabase functions deploy synthesize-pulls
// Body: { firstName, lens, lines: [{label, value}] }

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { cors, json, structured, obj } from '../_shared/openai.ts';
import { SYNTH_PULLS_SYSTEM, buildSynthPullsUser } from '../_shared/prompts.ts';

const SCHEMA = obj({
  pulls: {
    type: 'array',
    items: obj({
      title: { type: 'string' },
      why: { type: 'string' },
      love: { type: 'array', items: { type: 'string' } },
    }),
  },
  dislikes: {
    type: 'array',
    items: obj({
      title: { type: 'string' },
      note: { type: 'string' },
    }),
  },
});

type PullsOut = {
  pulls: { title: string; why: string; love: string[] }[];
  dislikes: { title: string; note: string }[];
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { firstName = 'You', lens = 'work', lines = [] } = await req.json().catch(() => ({}));
    const out = await structured<PullsOut>(
      SYNTH_PULLS_SYSTEM(lens),
      buildSynthPullsUser(firstName, lens, lines),
      'pulls_result',
      SCHEMA,
      0.5,
    );
    return json(out);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
