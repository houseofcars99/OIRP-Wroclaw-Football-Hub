-- OIRP Wroclaw Football Hub
-- Safe to run inside the existing Quick Race Passport Supabase project.
-- Every application object uses the fh_ prefix; no QR Passport table is changed.

create extension if not exists pgcrypto;

do $$ begin create type public.fh_app_role as enum ('admin', 'captain', 'staff', 'player', 'fan');
exception when duplicate_object then null; end $$;
do $$ begin create type public.fh_match_status as enum ('scheduled', 'live', 'finished', 'cancelled');
exception when duplicate_object then null; end $$;
do $$ begin create type public.fh_announcement_priority as enum ('normal', 'urgent');
exception when duplicate_object then null; end $$;

create table if not exists public.fh_teams (
  id uuid primary key default gen_random_uuid(), name text not null, short_name text not null,
  logo_path text, is_our_team boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.fh_profiles (
  id uuid primary key references auth.users(id) on delete cascade, first_name text not null,
  last_name text not null, display_name text not null, shirt_number integer check (shirt_number between 0 and 99),
  preferred_position text, avatar_path text, team_id uuid references public.fh_teams(id),
  onboarding_complete boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.fh_user_roles (
  user_id uuid references public.fh_profiles(id) on delete cascade, role public.fh_app_role not null,
  primary key (user_id, role)
);
create table if not exists public.fh_matches (
  id uuid primary key default gen_random_uuid(), home_team_id uuid not null references public.fh_teams(id),
  away_team_id uuid not null references public.fh_teams(id), kickoff_at timestamptz not null, venue text,
  status public.fh_match_status not null default 'scheduled', home_score integer not null default 0 check (home_score >= 0),
  away_score integer not null default 0 check (away_score >= 0), prediction_closes_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.fh_lineups (
  id uuid primary key default gen_random_uuid(), match_id uuid not null unique references public.fh_matches(id) on delete cascade,
  team_id uuid not null references public.fh_teams(id), formation text not null default '1-2-2',
  status text not null default 'draft' check (status in ('draft','published')), published_at timestamptz,
  updated_by uuid references public.fh_profiles(id), updated_at timestamptz not null default now()
);
create table if not exists public.fh_lineup_slots (
  id uuid primary key default gen_random_uuid(), lineup_id uuid not null references public.fh_lineups(id) on delete cascade,
  player_id uuid not null references public.fh_profiles(id), slot_type text not null check (slot_type in ('field','bench')),
  x numeric check (x between 0 and 100), y numeric check (y between 0 and 100), sort_order integer not null default 0,
  unique (lineup_id, player_id)
);
create table if not exists public.fh_tactics (
  id uuid primary key default gen_random_uuid(), team_id uuid not null references public.fh_teams(id), name text not null,
  phase text not null check (phase in ('throw_in','free_kick','corner')),
  mode text not null check (mode in ('offense','defense')), board jsonb not null default '{}', notes text,
  updated_by uuid references public.fh_profiles(id), updated_at timestamptz not null default now()
);
create table if not exists public.fh_announcements (
  id uuid primary key default gen_random_uuid(), team_id uuid references public.fh_teams(id), title text not null,
  body text not null, priority public.fh_announcement_priority not null default 'normal',
  published_at timestamptz not null default now(), created_by uuid references public.fh_profiles(id)
);
create table if not exists public.fh_announcement_receipts (
  announcement_id uuid references public.fh_announcements(id) on delete cascade,
  user_id uuid references public.fh_profiles(id) on delete cascade,
  response text check (response in ('read','attending','late','absent')),
  responded_at timestamptz not null default now(), primary key (announcement_id, user_id)
);
create table if not exists public.fh_predictions (
  id uuid primary key default gen_random_uuid(), match_id uuid not null references public.fh_matches(id) on delete cascade,
  fan_id uuid not null references public.fh_profiles(id) on delete cascade, home_score integer not null check (home_score >= 0),
  away_score integer not null check (away_score >= 0), points integer not null default 0 check (points in (0,5,10)),
  created_at timestamptz not null default now(), unique (match_id, fan_id)
);
create table if not exists public.fh_match_events (
  id uuid primary key default gen_random_uuid(), match_id uuid not null references public.fh_matches(id) on delete cascade,
  event_type text not null check (event_type in ('goal','comment','substitution','yellow_card','red_card','period')),
  team_id uuid references public.fh_teams(id), player_id uuid references public.fh_profiles(id),
  assist_player_id uuid references public.fh_profiles(id), minute integer check (minute >= 0),
  comment_key text, comment_text text, created_by uuid references public.fh_profiles(id),
  created_at timestamptz not null default now()
);
create table if not exists public.fh_push_subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.fh_profiles(id) on delete cascade,
  endpoint text not null unique, p256dh text not null, auth text not null, created_at timestamptz not null default now()
);

create index if not exists fh_profiles_team_idx on public.fh_profiles(team_id);
create index if not exists fh_matches_kickoff_idx on public.fh_matches(kickoff_at);
create index if not exists fh_match_events_match_idx on public.fh_match_events(match_id, created_at);
create index if not exists fh_announcements_team_idx on public.fh_announcements(team_id, published_at desc);

alter table public.fh_teams enable row level security;
alter table public.fh_profiles enable row level security;
alter table public.fh_user_roles enable row level security;
alter table public.fh_matches enable row level security;
alter table public.fh_lineups enable row level security;
alter table public.fh_lineup_slots enable row level security;
alter table public.fh_tactics enable row level security;
alter table public.fh_announcements enable row level security;
alter table public.fh_announcement_receipts enable row level security;
alter table public.fh_predictions enable row level security;
alter table public.fh_match_events enable row level security;
alter table public.fh_push_subscriptions enable row level security;

insert into storage.buckets (id, name, public) values ('football-avatars', 'football-avatars', false)
on conflict (id) do update set public = false;
insert into storage.buckets (id, name, public) values ('football-team-logos', 'football-team-logos', true)
on conflict (id) do update set public = true;

-- No permissive RLS policies are created yet. Until role-aware policies are installed,
-- only trusted server-side code using the service role can access these tables.
