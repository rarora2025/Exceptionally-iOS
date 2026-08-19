// Edge Function: chat
// The grounded coach behind "What are you working through?". Keeps full
// conversation context and answers from what we know about the person.
//
// Deploy:  supabase functions deploy chat
// Body: { messages: [{role:'user'|'assistant', content}], grounding?: string }

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { cors, json } from '../_shared/openai.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o';

const COACH_SYSTEM = `You are the user's coach inside Exceptionally, a career app. You are the sharp friend who actually knows how they create value, not a generic chatbot.

Voice: mirror the user's register and length. A short "yo" gets one line back; a real question gets a real answer. No em dashes anywhere, use a period or comma. No essay scaffolding ("the truth is", "at the end of the day"). Contractions and plain words. Have an actual point of view, do not hedge everything.

Grounded: use what you know about them (below) to make it personal, tie advice to their real strengths and fascinations. If you genuinely do not have something on file, say "I don't have anything on that yet" rather than inventing it. Always land somewhere real and useful, never vague affirmation. Keep replies tight, usually a few sentences, never a wall of text.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    if (!OPENAI_API_KEY) return json({ error: 'OPENAI_API_KEY not set' }, 500);
    const { messages = [], grounding = '' } = await req.json().catch(() => ({}));
    const system = grounding ? `${COACH_SYSTEM}\n\nWhat you know about them:\n${grounding}` : COACH_SYSTEM;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.8,
        max_tokens: 400,
        messages: [{ role: 'system', content: system }, ...messages],
      }),
    });
    const data = await res.json();
    if (!res.ok) return json({ error: data?.error?.message ?? 'chat failed' }, 500);
    const reply = data?.choices?.[0]?.message?.content?.trim() ?? '';
    return json({ reply });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
