import { suggestMessage } from '../data/onboarding';

// A small server / Supabase Edge Function that holds the model API key and
// returns a drafted message. Set this in mobile/.env once it's deployed. The
// key never ships in the app bundle this way.
const AI_ENDPOINT = process.env.EXPO_PUBLIC_AI_ENDPOINT ?? '';

export type InviteContext = {
  relationship: string | null; // "Friend" | "Colleague" | ... | a custom "Other" label
  senderName?: string;
  recipientName?: string;
};

// Draft the invite message. When AI_ENDPOINT is configured we ask the model for
// a fresh take (so "Regenerate" produces genuinely new wording each time). Until
// then we fall back to curated templates so the whole flow works end to end.
export async function generateInviteMessage(ctx: InviteContext, seed: number): Promise<string> {
  if (AI_ENDPOINT) {
    try {
      const res = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ctx, seed }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.message) return String(data.message).trim();
      }
    } catch {
      // network / server issue — fall back to a template below
    }
  }
  return suggestMessage(ctx.relationship, seed);
}
