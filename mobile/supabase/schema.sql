-- Exceptionally — full data model + Row-Level Security
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run (idempotent-ish): uses "if not exists" and "drop policy if exists".

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  full_name    text,
  handle       text unique,
  career_goal  text,                       -- 'discover' | 'apply' | 'stuck' | null
  onboarding_goal text,                    -- 'Applying to college' | ...
  avatar_color text default '#D6F24B',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- invites (people the user asked to interview about them)
-- ---------------------------------------------------------------------------
create table if not exists public.invites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  email      text,
  tint       text default '#D6F24B',
  status     text not null default 'Invited',  -- Invited | Joined | Answered
  created_at timestamptz not null default now()
);
create index if not exists invites_user_idx on public.invites (user_id);

-- ---------------------------------------------------------------------------
-- artifacts (synthesized cards: super strengths, fascinations, submissions)
-- ---------------------------------------------------------------------------
create table if not exists public.artifacts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  kind        text not null,               -- 'strength' | 'fascination'
  source_name text,                        -- interviewer name, or 'You'
  lens        text,
  title       text not null,
  synthesis   text,
  combo       text,
  story       text,
  quote       text,
  saw         jsonb default '[]'::jsonb,    -- string[]
  pulls       jsonb default '[]'::jsonb,    -- string[]
  transcript  jsonb default '[]'::jsonb,    -- {q,a}[]
  tint        text default '#D6F24B',
  emoji       text,
  reaction    text,                         -- up | down | null
  position    int default 0,
  created_at  timestamptz not null default now()
);
create index if not exists artifacts_user_idx on public.artifacts (user_id);

-- ---------------------------------------------------------------------------
-- fascination_interviews (seeded self-interviews)
-- ---------------------------------------------------------------------------
create table if not exists public.fascination_interviews (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  bucket     text,                          -- domains | work | places
  seed       text,
  transcript jsonb default '[]'::jsonb,     -- {q,a}[]
  result     text,
  created_at timestamptz not null default now()
);
create index if not exists fasc_user_idx on public.fascination_interviews (user_id);

-- ---------------------------------------------------------------------------
-- tool_runs (tool inputs + generated results)
-- ---------------------------------------------------------------------------
create table if not exists public.tool_runs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  tool_key   text not null,
  inputs     jsonb default '{}'::jsonb,
  result     jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists tool_runs_user_idx on public.tool_runs (user_id);

-- ---------------------------------------------------------------------------
-- chat_messages
-- ---------------------------------------------------------------------------
create table if not exists public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null,                 -- 'me' | 'ai'
  text       text not null,
  created_at timestamptz not null default now()
);
create index if not exists chat_user_idx on public.chat_messages (user_id);

-- ---------------------------------------------------------------------------
-- Row-Level Security: each user can only touch their own rows.
-- ---------------------------------------------------------------------------
alter table public.profiles               enable row level security;
alter table public.invites                enable row level security;
alter table public.artifacts              enable row level security;
alter table public.fascination_interviews enable row level security;
alter table public.tool_runs              enable row level security;
alter table public.chat_messages          enable row level security;

-- profiles: keyed by id (= auth.uid())
drop policy if exists "profiles self" on public.profiles;
create policy "profiles self" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- helper: same owner policy for the user_id tables
drop policy if exists "invites self" on public.invites;
create policy "invites self" on public.invites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "artifacts self" on public.artifacts;
create policy "artifacts self" on public.artifacts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "fasc self" on public.fascination_interviews;
create policy "fasc self" on public.fascination_interviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tool_runs self" on public.tool_runs;
create policy "tool_runs self" on public.tool_runs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "chat self" on public.chat_messages;
create policy "chat self" on public.chat_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Auto-create a profile row when a new user signs up.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at maintenance for profiles
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
