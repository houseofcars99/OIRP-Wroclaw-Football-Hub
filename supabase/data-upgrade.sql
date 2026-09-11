-- Persistent gatherings and production access policies.
-- Run once in Supabase SQL Editor after access-upgrade.sql.
create table if not exists public.fh_gatherings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_at timestamptz not null,
  place text not null,
  notes text,
  team_id uuid references public.fh_teams(id),
  created_by uuid references public.fh_profiles(id),
  created_at timestamptz not null default now()
);
create table if not exists public.fh_gathering_responses (
  gathering_id uuid references public.fh_gatherings(id) on delete cascade,
  user_id uuid references public.fh_profiles(id) on delete cascade,
  response text not null check (response in ('attending','late','absent')),
  responded_at timestamptz not null default now(),
  primary key (gathering_id,user_id)
);
alter table public.fh_gatherings enable row level security;
alter table public.fh_gathering_responses enable row level security;
drop policy if exists "fh_gatherings_team_read" on public.fh_gatherings;
create policy "fh_gatherings_team_read" on public.fh_gatherings for select to authenticated using (true);
drop policy if exists "fh_gatherings_admin_manage" on public.fh_gatherings;
create policy "fh_gatherings_admin_manage" on public.fh_gatherings for all to authenticated using (public.fh_has_role('admin')) with check (public.fh_has_role('admin'));
drop policy if exists "fh_gathering_responses_read" on public.fh_gathering_responses;
create policy "fh_gathering_responses_read" on public.fh_gathering_responses for select to authenticated using (user_id=auth.uid() or public.fh_has_role('admin'));
drop policy if exists "fh_gathering_responses_self" on public.fh_gathering_responses;
create policy "fh_gathering_responses_self" on public.fh_gathering_responses for insert to authenticated with check (user_id=auth.uid());
drop policy if exists "fh_gathering_responses_update_self" on public.fh_gathering_responses;
create policy "fh_gathering_responses_update_self" on public.fh_gathering_responses for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

drop policy if exists "fh_push_self" on public.fh_push_subscriptions;
create policy "fh_push_self" on public.fh_push_subscriptions for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists "fh_logo_admin_upload" on storage.objects;
create policy "fh_logo_admin_upload" on storage.objects for insert to authenticated with check (bucket_id='football-team-logos' and public.fh_has_role('admin'));

-- Exactly one team can be marked as our team. This keeps lineup selection unambiguous.
create unique index if not exists fh_teams_one_our_team_idx
  on public.fh_teams (is_our_team) where is_our_team = true;

-- Public match centre: supporters can read teams, fixtures and staff commentary.
drop policy if exists "fh_teams_public_read" on public.fh_teams;
create policy "fh_teams_public_read" on public.fh_teams for select to anon, authenticated using (true);
drop policy if exists "fh_matches_public_read" on public.fh_matches;
create policy "fh_matches_public_read" on public.fh_matches for select to anon, authenticated using (true);
drop policy if exists "fh_events_public_read" on public.fh_match_events;
create policy "fh_events_public_read" on public.fh_match_events for select to anon, authenticated using (true);

-- Players may view tactics, but only captain/admin policies allow changes.
drop policy if exists "fh_tactics_team_read" on public.fh_tactics;
create policy "fh_tactics_team_read" on public.fh_tactics for select to authenticated using (
  public.fh_has_role('player') or public.fh_has_role('captain') or public.fh_has_role('staff') or public.fh_has_role('admin')
);

-- Limited public player data used only for a captain-published lineup.
drop function if exists public.fh_get_public_lineup_players();
create or replace function public.fh_get_public_lineup_players(target_lineup_id uuid)
returns table (id uuid, display_name text, shirt_number integer, preferred_position text, first_name text, last_name text)
language sql stable security definer set search_path = public
as $$
  select distinct p.id, p.display_name, p.shirt_number, p.preferred_position, p.first_name, p.last_name
  from public.fh_profiles p
  join public.fh_lineup_slots s on s.player_id = p.id
  join public.fh_lineups l on l.id = s.lineup_id
  where l.status = 'published' and l.id = target_lineup_id;
$$;
revoke all on function public.fh_get_public_lineup_players(uuid) from public;
grant execute on function public.fh_get_public_lineup_players(uuid) to anon, authenticated;
