import { supabase } from './supabase';

export type ChatMsg = { role: 'me' | 'ai'; text: string };

// Send the full conversation to the grounded coach and get its reply.
export async function sendChat(messages: ChatMsg[], grounding = ''): Promise<string> {
  const mapped = messages.map((m) => ({
    role: m.role === 'me' ? 'user' : 'assistant',
    content: m.text,
  }));
  const { data, error } = await supabase.functions.invoke('chat', { body: { messages: mapped, grounding } });
  if (error) throw error;
  if (data && typeof data === 'object' && 'error' in data && (data as { error?: unknown }).error) {
    throw new Error(String((data as { error: unknown }).error));
  }
  return String((data as { reply?: string })?.reply ?? '').trim();
}
