create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'captain', 'staff', 'player', 'fan');
create type public.match_status as enum ('scheduled', 'live', 'finished', 'cancelled');
create type public.announcement_priority as enum ('normal', 'urgent');

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text not null,
  logo_path text,
  is_our_team boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  display_name text not null,
  shirt_number integer check (shirt_number between 0 and 99),
  preferred_position text,
  avatar_path text,
  team_id uuid references public.teams(id),
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid references public.profiles(id) on delete cascade,
  role public.app_role not null,
  primary key (user_id, role)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  home_team_id uuid not null references public.teams(id),
  away_team_id uuid not null references public.teams(id),
  kickoff_at timestamptz not null,
  venue text,
  status public.match_status not null default 'scheduled',
  home_score integer not null default 0,
  away_score integer not null default 0,
  prediction_closes_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.lineups (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches(id) on delete cascade,
  team_id uuid not null references public.teams(id),
  formation text not null default '1-2-2',
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create table public.lineup_slots (
  id uuid primary key default gen_random_uuid(),
  lineup_id uuid not null references public.lineups(id) on delete cascade,
  player_id uuid not null references public.profiles(id),
  slot_type text not null check (slot_type in ('field','bench')),
  x numeric check (x between 0 and 100),
  y numeric check (y between 0 and 100),
  sort_order integer not null default 0,
  unique (lineup_id, player_id)
);

create table public.tactics (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id),
  name text not null,
  phase text not null check (phase in ('throw_in','free_kick','corner')),
  mode text not null check (mode in ('offense','defense')),
  board jsonb not null default '{}',
  notes text,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id),
  title text not null,
  body text not null,
  priority public.announcement_priority not null default 'normal',
  published_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  fan_id uuid not null references public.profiles(id) on delete cascade,
  home_score integer not null check (home_score >= 0),
  away_score integer not null check (away_score >= 0),
  points integer not null default 0 check (points in (0,5,10)),
  created_at timestamptz not null default now(),
  unique (match_id, fan_id)
);

create table public.match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  event_type text not null check (event_type in ('goal','comment','substitution','yellow_card','red_card','period')),
  team_id uuid references public.teams(id),
  player_id uuid references public.profiles(id),
  assist_player_id uuid references public.profiles(id),
  minute integer check (minute >= 0),
  comment_key text,
  comment_text text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.teams enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.matches enable row level security;
alter table public.lineups enable row level security;
alter table public.lineup_slots enable row level security;
alter table public.tactics enable row level security;
alter table public.announcements enable row level security;
alter table public.predictions enable row level security;
alter table public.match_events enable row level security;
