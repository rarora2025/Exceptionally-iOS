// Turn raw Supabase / network error strings into short, human copy.
// Falls back to the original message when we don't recognise it.
export function humanizeAuthError(raw?: string | null): string | null {
  if (!raw) return null;
  const m = raw.toLowerCase();

  if (m.includes('network') || m.includes('fetch') || m.includes('connection') || m.includes('timeout'))
    return 'No connection. Check your internet and try again.';
  if (m.includes('invalid login') || m.includes('invalid credentials'))
    return "That email or password doesn't match. Give it another try.";
  if (m.includes('already registered') || m.includes('already exists') || m.includes('already been registered'))
    return 'An account with this email already exists. Try logging in instead.';
  if (m.includes('email not confirmed'))
    return 'Confirm your email first — check your inbox for the link.';
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Too many attempts. Wait a moment and try again.';
  if (m.includes('at least') || m.includes('password should') || m.includes('weak password'))
    return raw; // password-strength messages are already specific

  return raw;
}
