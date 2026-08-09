import { supabase } from './supabase';

// ---- Row types (mirror supabase/schema.sql) ----
export type Profile = {
  id: string;
  full_name: string | null;
  handle: string | null;
  career_goal: string | null;
  onboarding_goal: string | null;
  avatar_color: string | null;
};

export type InviteRow = {
  id: string;
  name: string;
  email: string | null;
  tint: string | null;
  status: string;
};

export type ArtifactRow = {
  id: string;
  kind: string;
  source_name: string | null;
  lens: string | null;
  title: string;
  synthesis: string | null;
  combo: string | null;
  story: string | null;
  quote: string | null;
  saw: string[];
  pulls: string[];
  transcript: { q: string; a: string }[];
  tint: string | null;
  emoji: string | null;
  reaction: string | null;
  position: number;
};

export type FascInterviewRow = {
  id: string;
  bucket: string | null;
  seed: string | null;
  transcript: { q: string; a: string }[];
  result: string | null;
  created_at: string;
};

export type ChatRow = { id: string; role: 'me' | 'ai'; text: string; created_at: string };

const uid = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
};

// ---- profile ----
export async function getProfile(): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle();
  if (error) return null;
  return data as Profile | null;
}

export async function updateProfile(patch: Partial<Profile>): Promise<void> {
  const id = await uid();
  if (!id) return;
  await supabase.from('profiles').update(patch).eq('id', id);
}

// ---- invites ----
export async function listInvites(): Promise<InviteRow[]> {
  const { data } = await supabase.from('invites').select('*').order('created_at', { ascending: true });
  return (data as InviteRow[]) ?? [];
}

export async function addInvite(row: { name: string; email?: string; tint?: string; status?: string }): Promise<InviteRow | null> {
  const id = await uid();
  if (!id) return null;
  const { data } = await supabase
    .from('invites')
    .insert({ user_id: id, name: row.name, email: row.email ?? null, tint: row.tint ?? '#D6F24B', status: row.status ?? 'Invited' })
    .select()
    .maybeSingle();
  return (data as InviteRow) ?? null;
}

// ---- artifacts ----
export async function listArtifacts(): Promise<ArtifactRow[]> {
  const { data } = await supabase.from('artifacts').select('*').order('position', { ascending: true });
  return (data as ArtifactRow[]) ?? [];
}

export async function updateArtifact(id: string, patch: Partial<ArtifactRow>): Promise<void> {
  await supabase.from('artifacts').update(patch).eq('id', id);
}

export async function insertArtifacts(rows: Array<Omit<ArtifactRow, 'id'>>): Promise<void> {
  const id = await uid();
  if (!id) return;
  await supabase.from('artifacts').insert(rows.map((r) => ({ ...r, user_id: id })));
}

// ---- fascination interviews ----
export async function addFascInterview(row: { bucket: string; seed: string; transcript: { q: string; a: string }[]; result: string }): Promise<void> {
  const id = await uid();
  if (!id) return;
  await supabase.from('fascination_interviews').insert({ user_id: id, ...row });
}

export async function listFascInterviews(): Promise<FascInterviewRow[]> {
  const { data } = await supabase.from('fascination_interviews').select('*').order('created_at', { ascending: false });
  return (data as FascInterviewRow[]) ?? [];
}

// ---- tool runs ----
export async function addToolRun(row: { tool_key: string; inputs: unknown; result: unknown }): Promise<void> {
  const id = await uid();
  if (!id) return;
  await supabase.from('tool_runs').insert({ user_id: id, tool_key: row.tool_key, inputs: row.inputs, result: row.result });
}

// ---- chat ----
export async function listChat(): Promise<ChatRow[]> {
  const { data } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true });
  return (data as ChatRow[]) ?? [];
}

export async function addChatMessage(role: 'me' | 'ai', text: string): Promise<void> {
  const id = await uid();
  if (!id) return;
  await supabase.from('chat_messages').insert({ user_id: id, role, text });
}
