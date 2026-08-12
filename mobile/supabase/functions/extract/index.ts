// Edge Function: extract
// Converts one person's fascination-interview answers into a single structured
// "signal" (preserving the literal specifics). Feeds synthesize.
//
// Deploy:  supabase functions deploy extract
// Body: { firstName, interest, lines: [{label, value}] }

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { cors, json, structured, obj } from '../_shared/openai.ts';
import { EXTRACT_SYSTEM_INTEREST, buildExtractInterestUser } from '../_shared/prompts.ts';

const SCHEMA = obj({
  visible_behavior: { type: 'string' },
  deeper_mechanism: { type: 'string' },
  comparative_edge: { type: 'string' },
  fascination_candidates: { type: 'array', items: { type: 'string' } },
  superpower_tags: { type: 'array', items: { type: 'string' } },
  specificity_score: { type: 'integer', minimum: 1, maximum: 5 },
  confidence_weight: { type: 'number', minimum: 0, maximum: 1 },
  safe_to_surface: { type: 'boolean' },
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { firstName = 'You', interest = 'this interest', lines = [] } = await req.json().catch(() => ({}));
    const user = buildExtractInterestUser(firstName, interest, lines);
    const signal = await structured(EXTRACT_SYSTEM_INTEREST, user, 'signal', SCHEMA, 0.4);
    return json({ signal });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
