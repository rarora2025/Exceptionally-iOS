import { supabase, isSupabaseConfigured } from './supabase';
import { suggestMessage } from '../data/onboarding';

export type InviteContext = {
  relationship: string | null; // "Friend" | "Colleague" | ... | a custom "Other" label
  senderName?: string;
  recipientName?: string;
};

// Draft the invite message. Calls the `draft-message` Supabase Edge Function,
// which holds the OpenAI key server-side (see supabase/functions/draft-message).
// If the function isn't deployed yet (or errors), we fall back to curated
// templates so the flow always works. Deploy it and set OPENAI_API_KEY to make
// "Regenerate" produce genuinely fresh wording each time.
export async function generateInviteMessage(ctx: InviteContext, seed: number): Promise<string> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke('draft-message', {
        body: { ...ctx, seed },
      });
      if (!error && data?.message) return String(data.message).trim();
    } catch {
      // fall back to a template below
    }
  }
  return suggestMessage(ctx.relationship, seed);
}
