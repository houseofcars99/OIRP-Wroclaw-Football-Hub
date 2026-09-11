-- Run once after schema.sql and rls.sql.
insert into public.fh_user_roles (user_id, role)
select p.id, 'admin'::public.fh_app_role from public.fh_profiles p join auth.users u on u.id=p.id
where lower(u.email)=lower('mpitek1@st.swps.edu.pl') on conflict (user_id, role) do nothing;

drop policy if exists "fh_roles_admin_manage" on public.fh_user_roles;
create policy "fh_roles_admin_manage" on public.fh_user_roles for all to authenticated using (public.fh_has_role('admin')) with check (public.fh_has_role('admin'));
drop policy if exists "fh_roles_read_self" on public.fh_user_roles;
create policy "fh_roles_read_self" on public.fh_user_roles for select to authenticated using (user_id = auth.uid() or public.fh_has_role('admin') or public.fh_has_role('captain'));
drop policy if exists "fh_profiles_captain_update" on public.fh_profiles;
create policy "fh_profiles_captain_update" on public.fh_profiles for update to authenticated using (public.fh_has_role('admin') or public.fh_has_role('captain')) with check (public.fh_has_role('admin') or public.fh_has_role('captain'));
drop policy if exists "fh_teams_admin_manage" on public.fh_teams;
create policy "fh_teams_admin_manage" on public.fh_teams for all to authenticated using (public.fh_has_role('admin') or public.fh_has_role('captain')) with check (public.fh_has_role('admin') or public.fh_has_role('captain'));
drop policy if exists "fh_matches_staff_manage" on public.fh_matches;
create policy "fh_matches_staff_manage" on public.fh_matches for all to authenticated using (public.fh_has_role('admin') or public.fh_has_role('staff') or public.fh_has_role('captain')) with check (public.fh_has_role('admin') or public.fh_has_role('staff') or public.fh_has_role('captain'));
drop policy if exists "fh_lineups_captain_manage" on public.fh_lineups;
create policy "fh_lineups_captain_manage" on public.fh_lineups for all to authenticated using (public.fh_has_role('admin') or public.fh_has_role('captain')) with check (public.fh_has_role('admin') or public.fh_has_role('captain'));
drop policy if exists "fh_slots_captain_manage" on public.fh_lineup_slots;
create policy "fh_slots_captain_manage" on public.fh_lineup_slots for all to authenticated using (public.fh_has_role('admin') or public.fh_has_role('captain')) with check (public.fh_has_role('admin') or public.fh_has_role('captain'));
drop policy if exists "fh_tactics_captain_manage" on public.fh_tactics;
create policy "fh_tactics_captain_manage" on public.fh_tactics for all to authenticated using (public.fh_has_role('admin') or public.fh_has_role('captain')) with check (public.fh_has_role('admin') or public.fh_has_role('captain'));
drop policy if exists "fh_announcements_admin_manage" on public.fh_announcements;
create policy "fh_announcements_admin_manage" on public.fh_announcements for all to authenticated using (public.fh_has_role('admin') or public.fh_has_role('captain')) with check (public.fh_has_role('admin') or public.fh_has_role('captain'));
drop policy if exists "fh_events_staff_manage" on public.fh_match_events;
create policy "fh_events_staff_manage" on public.fh_match_events for all to authenticated using (public.fh_has_role('admin') or public.fh_has_role('staff')) with check (public.fh_has_role('admin') or public.fh_has_role('staff'));

create or replace function public.fh_captain_update_player(target_user_id uuid, new_first_name text, new_last_name text, new_shirt_number integer, new_position text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (public.fh_has_role('admin') or public.fh_has_role('captain')) then raise exception 'Brak uprawnień kapitana'; end if;
  if trim(new_first_name) = '' or trim(new_last_name) = '' or new_shirt_number not between 0 and 99 then raise exception 'Nieprawidłowe dane zawodnika'; end if;
  update public.fh_profiles set first_name=trim(new_first_name), last_name=trim(new_last_name), display_name=left(trim(new_first_name),1)||'. '||trim(new_last_name), shirt_number=new_shirt_number, preferred_position=new_position where id=target_user_id;
end; $$;
revoke all on function public.fh_captain_update_player(uuid,text,text,integer,text) from public;
grant execute on function public.fh_captain_update_player(uuid,text,text,integer,text) to authenticated;

create or replace function public.fh_captain_delete_player(target_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (public.fh_has_role('admin') or public.fh_has_role('captain')) then raise exception 'Brak uprawnień kapitana'; end if;
  if target_user_id = auth.uid() then raise exception 'Nie można usunąć własnego konta'; end if;
  delete from public.fh_lineup_slots where player_id=target_user_id;
  update public.fh_lineups set updated_by=null where updated_by=target_user_id;
  update public.fh_tactics set updated_by=null where updated_by=target_user_id;
  update public.fh_announcements set created_by=null where created_by=target_user_id;
  update public.fh_match_events set player_id=null where player_id=target_user_id;
  update public.fh_match_events set assist_player_id=null where assist_player_id=target_user_id;
  update public.fh_match_events set created_by=null where created_by=target_user_id;
  if to_regclass('public.fh_gatherings') is not null then
    execute 'update public.fh_gatherings set created_by=null where created_by=$1' using target_user_id;
  end if;
  delete from public.fh_profiles where id=target_user_id;
end; $$;
revoke all on function public.fh_captain_delete_player(uuid) from public;
grant execute on function public.fh_captain_delete_player(uuid) to authenticated;
