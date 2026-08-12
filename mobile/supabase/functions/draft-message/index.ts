// Supabase Edge Function: draft-message
// Drafts a short, natural invite message with OpenAI. The API key lives here as
// a Supabase secret (OPENAI_API_KEY) and never ships in the app.
//
// Deploy:   supabase functions deploy draft-message
// Set key:  supabase secrets set OPENAI_API_KEY=sk-...   (or via the dashboard)
//
// The app calls this via supabase.functions.invoke('draft-message', { body }).

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM = [
  'You write short, warm, natural invite messages someone sends to a friend, colleague, manager, or family member.',
  'The sender is asking the recipient to answer a few quick interview questions about them for an app called Exceptionally that helps people discover what they are genuinely great at.',
  'Rules: first person, from the sender. 2 to 4 sentences. Sound like a real person texting, not marketing.',
  'Mention it takes about 5 minutes and can be done by voice or text. No em dashes. Do not include the link (the app appends it).',
  'Vary the wording noticeably each time you are asked.',
].join(' ');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { relationship, senderName, seed } = await req.json().catch(() => ({}));
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not set' }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
    const who = relationship ? `their ${String(relationship).toLowerCase()}` : 'someone who knows them well';
    const user = `Draft invite number ${seed ?? 0}. The recipient is ${who}.${
      senderName ? ` The sender's name is ${senderName}.` : ''
    } Give a fresh take, different from previous drafts.`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 1,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: user },
        ],
      }),
    });
    const data = await res.json();
    const message = data?.choices?.[0]?.message?.content?.trim() ?? '';
    return new Response(JSON.stringify({ message }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
