// Shared OpenAI client for the interview edge functions. The API key lives here
// as a Supabase secret (OPENAI_API_KEY) and never ships in the app. Uses
// structured outputs (json_schema) so every job returns validated JSON.

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
// gpt-4o-class or better: the prompts were tuned and acceptance-graded on gpt-4o.
const MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o';

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

// Call OpenAI with a system + user prompt and a strict JSON schema. Returns the
// parsed object. Retries transient failures a few times.
export async function structured<T>(
  system: string,
  user: string,
  schemaName: string,
  schema: Record<string, unknown>,
  temperature = 0.8,
): Promise<T> {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
  let lastErr: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: MODEL,
          temperature,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: { name: schemaName, strict: true, schema },
          },
        }),
      });
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`OpenAI ${res.status}`);
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
        continue;
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error('empty completion');
      return JSON.parse(content) as T;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  throw lastErr ?? new Error('OpenAI request failed');
}

// Helper: build a strict object schema (all keys required, no extras).
export function obj(properties: Record<string, unknown>): Record<string, unknown> {
  return {
    type: 'object',
    additionalProperties: false,
    required: Object.keys(properties),
    properties,
  };
}
