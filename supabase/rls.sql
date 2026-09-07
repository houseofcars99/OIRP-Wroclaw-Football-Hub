-- Run after schema.sql in the shared QR Passport Supabase project.
create or replace function public.fh_has_role(required_role public.fh_app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.fh_user_roles where user_id = auth.uid() and role = required_role) $$;
grant execute on function public.fh_has_role(public.fh_app_role) to authenticated, anon;

create policy "fh_profiles_read_authenticated" on public.fh_profiles for select to authenticated using (true);
create policy "fh_profiles_insert_self" on public.fh_profiles for insert to authenticated with check (id = auth.uid());
create policy "fh_profiles_update_self" on public.fh_profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "fh_roles_read_self" on public.fh_user_roles for select to authenticated using (user_id = auth.uid() or public.fh_has_role('admin'));
create policy "fh_teams_public_read" on public.fh_teams for select to anon, authenticated using (true);
create policy "fh_matches_public_read" on public.fh_matches for select to anon, authenticated using (true);
create policy "fh_published_lineups_public_read" on public.fh_lineups for select to anon, authenticated using (status = 'published' or public.fh_has_role('captain') or public.fh_has_role('staff') or public.fh_has_role('admin'));
create policy "fh_published_slots_public_read" on public.fh_lineup_slots for select to anon, authenticated using (
  exists (select 1 from public.fh_lineups l where l.id = lineup_id and l.status = 'published')
  or public.fh_has_role('captain') or public.fh_has_role('staff') or public.fh_has_role('admin')
);
create policy "fh_events_public_read" on public.fh_match_events for select to anon, authenticated using (true);
create policy "fh_tactics_team_read" on public.fh_tactics for select to authenticated using (
  public.fh_has_role('player') or public.fh_has_role('captain') or public.fh_has_role('staff') or public.fh_has_role('admin')
);
create policy "fh_announcements_team_read" on public.fh_announcements for select to authenticated using (true);
create policy "fh_receipts_self" on public.fh_announcement_receipts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "fh_predictions_self" on public.fh_predictions for all to authenticated using (fan_id = auth.uid()) with check (fan_id = auth.uid());

create policy "fh_avatar_insert_self" on storage.objects for insert to authenticated with check (
  bucket_id = 'football-avatars' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "fh_avatar_update_self" on storage.objects for update to authenticated using (
  bucket_id = 'football-avatars' and (storage.foldername(name))[1] = auth.uid()::text
) with check (bucket_id = 'football-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "fh_avatar_read_authenticated" on storage.objects for select to authenticated using (bucket_id = 'football-avatars');
