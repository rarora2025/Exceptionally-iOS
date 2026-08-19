// Edge Function: transcribe
// Takes a base64-encoded audio clip and returns the transcript (OpenAI). Lets
// people answer interview questions by voice. Key stays server-side.
//
// Deploy:  supabase functions deploy transcribe
// Body: { audio: base64 string, mimeType?: string }

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { cors, json } from '../_shared/openai.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const MODEL = Deno.env.get('OPENAI_TRANSCRIBE_MODEL') ?? 'gpt-4o-transcribe';

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    if (!OPENAI_API_KEY) return json({ error: 'OPENAI_API_KEY not set' }, 500);
    const { audio, mimeType = 'audio/m4a' } = await req.json().catch(() => ({}));
    if (!audio) return json({ error: 'no audio' }, 400);

    const ext = mimeType.includes('wav') ? 'wav' : mimeType.includes('mp4') ? 'mp4' : 'm4a';
    const form = new FormData();
    form.append('file', new Blob([b64ToBytes(audio)], { type: mimeType }), `audio.${ext}`);
    form.append('model', MODEL);

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) return json({ error: data?.error?.message ?? 'transcription failed' }, 500);
    return json({ text: (data?.text ?? '').trim() });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
