-- Run once after schema.sql and rls.sql.
insert into public.fh_user_roles (user_id, role)
select p.id, 'admin'::public.fh_app_role from public.fh_profiles p join auth.users u on u.id=p.id
where lower(u.email)=lower('mpitek1@st.swps.edu.pl') on conflict (user_id, role) do nothing;

drop policy if exists "fh_roles_admin_manage" on public.fh_user_roles;
create policy "fh_roles_admin_manage" on public.fh_user_roles for all to authenticated using (public.fh_has_role('admin')) with check (public.fh_has_role('admin'));
drop policy if exists "fh_teams_admin_manage" on public.fh_teams;
create policy "fh_teams_admin_manage" on public.fh_teams for all to authenticated using (public.fh_has_role('admin')) with check (public.fh_has_role('admin'));
drop policy if exists "fh_matches_staff_manage" on public.fh_matches;
create policy "fh_matches_staff_manage" on public.fh_matches for all to authenticated using (public.fh_has_role('admin') or public.fh_has_role('staff')) with check (public.fh_has_role('admin') or public.fh_has_role('staff'));
drop policy if exists "fh_lineups_captain_manage" on public.fh_lineups;
create policy "fh_lineups_captain_manage" on public.fh_lineups for all to authenticated using (public.fh_has_role('admin') or public.fh_has_role('captain')) with check (public.fh_has_role('admin') or public.fh_has_role('captain'));
drop policy if exists "fh_slots_captain_manage" on public.fh_lineup_slots;
create policy "fh_slots_captain_manage" on public.fh_lineup_slots for all to authenticated using (public.fh_has_role('admin') or public.fh_has_role('captain')) with check (public.fh_has_role('admin') or public.fh_has_role('captain'));
drop policy if exists "fh_tactics_captain_manage" on public.fh_tactics;
create policy "fh_tactics_captain_manage" on public.fh_tactics for all to authenticated using (public.fh_has_role('admin') or public.fh_has_role('captain')) with check (public.fh_has_role('admin') or public.fh_has_role('captain'));
drop policy if exists "fh_announcements_admin_manage" on public.fh_announcements;
create policy "fh_announcements_admin_manage" on public.fh_announcements for all to authenticated using (public.fh_has_role('admin')) with check (public.fh_has_role('admin'));
drop policy if exists "fh_events_staff_manage" on public.fh_match_events;
create policy "fh_events_staff_manage" on public.fh_match_events for all to authenticated using (public.fh_has_role('admin') or public.fh_has_role('staff')) with check (public.fh_has_role('admin') or public.fh_has_role('staff'));
