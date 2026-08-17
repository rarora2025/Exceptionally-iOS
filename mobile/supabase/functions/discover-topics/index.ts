// Edge Function: discover-topics
// Reads a short discovery interview and returns 3-6 concrete candidate topics
// the person is drawn to in a lens, each ready to go deeper on later.
//
// Deploy:  supabase functions deploy discover-topics
// Body: { firstName, lens, lines: [{label, value}] }

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { cors, json, structured, obj } from '../_shared/openai.ts';
import { DISCOVER_TOPICS_SYSTEM, buildDiscoverTopicsUser } from '../_shared/prompts.ts';

const SCHEMA = obj({
  topics: {
    type: 'array',
    items: obj({
      title: { type: 'string' },
      note: { type: 'string' },
    }),
  },
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { firstName = 'You', lens = 'domains', lines = [] } = await req.json().catch(() => ({}));
    const user = buildDiscoverTopicsUser(firstName, lens, lines);
    const out = await structured<{ topics: { title: string; note: string }[] }>(
      DISCOVER_TOPICS_SYSTEM(lens),
      user,
      'topics',
      SCHEMA,
      0.5,
    );
    return json(out);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
