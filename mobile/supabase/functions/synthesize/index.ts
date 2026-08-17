// Edge Function: synthesize
// Turns one fascination signal into a single rich artifact (the card the user
// sees on their profile). One interest → one artifact.
//
// Deploy:  supabase functions deploy synthesize
// Body: { firstName, interest, signal: {...} }

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { cors, json, structured, obj } from '../_shared/openai.ts';
import { SYNTHESIZE_INTEREST_ARTIFACT_SYSTEM, buildSynthesizeInterestArtifactUser } from '../_shared/prompts.ts';

const SCHEMA = obj({
  title: { type: 'string' },
  one_liner: { type: 'string' },
  moat: { type: 'string', enum: ['energy', 'skills', 'context'] },
  confidence: { type: 'string', enum: ['early', 'emerging', 'strong'] },
  what_people_see: { type: 'string' },
  deeper_mechanism: { type: 'string' },
  shows_up_when: { type: 'string' },
  why_it_matters: { type: 'string' },
  evidence: { type: 'array', items: { type: 'string' } },
  ask_for_help: { type: 'array', items: { type: 'string' } },
  deeper_questions: { type: 'array', items: { type: 'string' } },
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { firstName = 'You', interest = 'this interest', signal } = await req.json().catch(() => ({}));
    const user = buildSynthesizeInterestArtifactUser(firstName, interest, JSON.stringify(signal ?? {}, null, 2));
    const artifact = await structured(SYNTHESIZE_INTEREST_ARTIFACT_SYSTEM, user, 'artifact', SCHEMA, 0.5);
    return json({ artifact });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
