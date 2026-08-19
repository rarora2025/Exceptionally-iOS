import { supabase } from './supabase';

// Read a local recording file (file:// uri) into a base64 string, without
// needing expo-file-system — fetch the uri, then FileReader the blob.
async function uriToBase64(uri: string): Promise<string> {
  const res = await fetch(uri);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('could not read recording'));
    reader.onloadend = () => {
      const s = (reader.result as string) || '';
      resolve(s.includes(',') ? s.split(',')[1] : s);
    };
    reader.readAsDataURL(blob);
  });
}

// Send a recording to the `transcribe` edge function and get the text back.
export async function transcribeAudio(uri: string, mimeType = 'audio/m4a'): Promise<string> {
  const audio = await uriToBase64(uri);
  const { data, error } = await supabase.functions.invoke('transcribe', { body: { audio, mimeType } });
  if (error) throw error;
  if (data && typeof data === 'object' && 'error' in data && (data as { error?: unknown }).error) {
    throw new Error(String((data as { error: unknown }).error));
  }
  return String((data as { text?: string })?.text ?? '').trim();
}
