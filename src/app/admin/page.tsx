"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { formatDateTime, initials } from "@/lib/format";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import "./admin.css";

type Profile = { id: string; first_name: string; last_name: string; display_name: string };
type Gathering = { id: string; title: string; starts_at: string; place: string; confirmed?: number };
type Team = { id: string; name: string; short_name: string; logo_path: string | null; is_our_team: boolean };
type Match = { id: string; kickoff_at: string; venue: string | null };

const tabs = ["Pulpit", "Zbiórki", "Wiadomości", "Mecze", "Użytkownicy"];
const roleLabels: Record<string, string> = { admin: "Administrator", captain: "Kapitan", staff: "Sztab", player: "Zawodnik", fan: "Kibic" };

export default function AdminPage() {
  const [tab, setTab] = useState("Pulpit");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Record<string, string[]>>({});
  const [meetings, setMeetings] = useState<Gathering[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  const load = useCallback(async () => {
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    const [profileResult, roleResult, gatheringResult, responseResult, teamResult, matchResult] = await Promise.all([
      sb.from("fh_profiles").select("id,first_name,last_name,display_name").order("last_name"),
      sb.from("fh_user_roles").select("user_id,role"),
      sb.from("fh_gatherings").select("id,title,starts_at,place").order("starts_at", { ascending: false }),
      sb.from("fh_gathering_responses").select("gathering_id,response"),
      sb.from("fh_teams").select("id,name,short_name,logo_path,is_our_team").order("name"),
      sb.from("fh_matches").select("id,kickoff_at,venue").order("kickoff_at", { ascending: false }),
    ]);
    if (profileResult.data) setProfiles(profileResult.data);
    if (roleResult.data) {
      const map: Record<string, string[]> = {};
      roleResult.data.forEach((entry) => { map[entry.user_id] = [...(map[entry.user_id] ?? []), entry.role]; });
      setRoles(map);
    }
    if (gatheringResult.data) {
      const counts: Record<string, number> = {};
      (responseResult.data ?? []).filter((entry) => entry.response === "attending").forEach((entry) => { counts[entry.gathering_id] = (counts[entry.gathering_id] ?? 0) + 1; });
      setMeetings(gatheringResult.data.map((entry) => ({ ...entry, confirmed: counts[entry.id] ?? 0 })));
    }
    if (teamResult.data) setTeams(teamResult.data);
    if (matchResult.data) setMatches(matchResult.data);
    if (gatheringResult.error) setNotice("Uruchom supabase/data-upgrade.sql, aby aktywować zbiórki.");
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function addMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const sb = getSupabaseBrowserClient(); if (!sb) return;
    const data = new FormData(form); const { data: auth } = await sb.auth.getUser();
    const result = await sb.from("fh_gatherings").insert({ title: data.get("title"), starts_at: data.get("date"), place: data.get("place"), notes: data.get("notes"), created_by: auth.user?.id });
    if (result.error) return setNotice(`Nie zapisano zbiórki: ${result.error.message}`);
    form.reset(); setNotice("Zbiórka zapisana w Supabase."); await load();
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const sb = getSupabaseBrowserClient(); if (!sb) return;
    const data = new FormData(form); const { data: auth } = await sb.auth.getUser();
    const result = await sb.from("fh_announcements").insert({ title: data.get("title"), body: data.get("body"), priority: data.get("priority"), created_by: auth.user?.id });
    setNotice(result.error ? `Nie wysłano: ${result.error.message}` : "Komunikat zapisany i opublikowany."); if (!result.error) form.reset();
  }

  async function addTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const sb = getSupabaseBrowserClient(); if (!sb) return;
    const data = new FormData(form); const logo = data.get("logo") as File; let logoPath: string | null = null;
    if (logo?.size) {
      logoPath = `${crypto.randomUUID()}-${logo.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;
      const upload = await sb.storage.from("football-team-logos").upload(logoPath, logo);
      if (upload.error) return setNotice(`Nie zapisano logo: ${upload.error.message}`);
    }
    const result = await sb.from("fh_teams").insert({ name: data.get("name"), short_name: data.get("shortName"), logo_path: logoPath, is_our_team: data.get("ourTeam") === "on" });
    if (result.error) return setNotice(`Nie dodano drużyny: ${result.error.message}`);
    form.reset(); setNotice("Drużyna została dodana."); await load();
  }

  async function addMatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const sb = getSupabaseBrowserClient(); if (!sb) return;
    const data = new FormData(form); if (data.get("homeTeam") === data.get("awayTeam")) return setNotice("Wybierz dwie różne drużyny.");
    const result = await sb.from("fh_matches").insert({ home_team_id: data.get("homeTeam"), away_team_id: data.get("awayTeam"), kickoff_at: data.get("kickoff"), prediction_closes_at: data.get("kickoff"), venue: data.get("venue") });
    if (result.error) return setNotice(`Nie dodano meczu: ${result.error.message}`);
    form.reset(); setNotice("Mecz dodany. Kapitan może już ustawić skład."); await load();
  }

  async function changeRole(userId: string, role: string) {
    const sb = getSupabaseBrowserClient(); if (!sb) return;
    const removed = await sb.from("fh_user_roles").delete().eq("user_id", userId); if (removed.error) return setNotice(removed.error.message);
    const saved = await sb.from("fh_user_roles").insert({ user_id: userId, role });
    setNotice(saved.error ? `Nie zmieniono roli: ${saved.error.message}` : "Rola użytkownika została zmieniona."); await load();
  }

  const confirmed = meetings[0]?.confirmed ?? 0;
  const teamOptions = teams.map((team) => <option value={team.id} key={team.id}>{team.name}</option>);

  return <AppShell>
    <PageHeader eyebrow="CENTRUM DOWODZENIA" title="Panel administratora" />
    <div className="adminIdentity"><span>ADMIN</span><div><strong>Panel zespołu</strong><small>Dane zsynchronizowane z Supabase</small></div><i>● ONLINE</i></div>
    <div className="segmented adminTabs">{tabs.map((name) => <button className={tab === name ? "active" : ""} onClick={() => { setTab(name); setNotice(""); }} key={name}>{name}</button>)}</div>
    {loading ? <p className="empty">Pobieranie danych…</p> : null}
    {tab === "Pulpit" ? <><section className="adminHero"><div><small>NAJBLIŻSZA ZBIÓRKA</small><h2>{meetings[0]?.title ?? "Brak zaplanowanej zbiórki"}</h2><p>{meetings[0] ? `${formatDateTime(meetings[0].starts_at)} · ${meetings[0].place}` : "Dodaj ją w panelu Zbiórki"}</p></div><strong>{confirmed}/{profiles.length}<small>potwierdzonych</small></strong></section><section className="adminCommandGrid"><button onClick={() => setTab("Zbiórki")}><i>01</i><span><strong>Zbiórki</strong><small>Utwórz i sprawdź obecność</small></span><b>→</b></button><button onClick={() => setTab("Wiadomości")}><i>02</i><span><strong>Wiadomości</strong><small>Wyślij komunikat</small></span><b>→</b></button><Link href="/captain/lineup"><i>03</i><span><strong>Skład</strong><small>Ustal 7 zawodników i ławkę</small></span><b>→</b></Link><Link href="/captain/tactics"><i>04</i><span><strong>Taktyka</strong><small>Ustaw stałe fragmenty</small></span><b>→</b></Link></section><div className="adminStatus"><span><b>{profiles.length}</b> kont</span><span><b>{meetings.length}</b> zbiórek</span><span><b>{matches.length}</b> meczów</span></div></> : null}
    {tab === "Zbiórki" ? <><form className="formCard adminForm" onSubmit={addMeeting}><div className="fieldGrid"><label>NAZWA ZBIÓRKI<input name="title" required /></label><label>DATA I GODZINA<input name="date" type="datetime-local" required /></label></div><label>MIEJSCE<input name="place" required /></label><label>INFORMACJE<textarea name="notes" placeholder="Strój, transport, dodatkowe uwagi" /></label><button className="primary wide">Utwórz zbiórkę</button></form><section className="meetingList">{meetings.map((meeting) => <article key={meeting.id}><div><small>{formatDateTime(meeting.starts_at)}</small><h3>{meeting.title}</h3><p>{meeting.place}</p></div><strong>{meeting.confirmed}/{profiles.length}<small>potwierdzonych</small></strong></article>)}</section></> : null}
    {tab === "Wiadomości" ? <form className="formCard adminForm" onSubmit={sendMessage}><div className="fieldGrid"><label>PRIORYTET<select name="priority"><option value="urgent">Pilny</option><option value="normal">Zwykły</option></select></label><label>ODBIORCY<select disabled><option>Wszyscy zawodnicy</option></select></label></div><label>TYTUŁ<input name="title" required /></label><label>TREŚĆ<textarea name="body" required /></label><button className="primary wide">Opublikuj komunikat</button></form> : null}
    {tab === "Mecze" ? <div className="adminMatchGrid"><form className="formCard adminForm" onSubmit={addTeam}><h2>Dodaj drużynę</h2><label>PEŁNA NAZWA<input name="name" required /></label><label>SKRÓT<input name="shortName" maxLength={5} required /></label><label>LOGO<input name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" /></label><label className="checkLabel"><input name="ourTeam" type="checkbox" /> To jest nasza drużyna</label><button className="secondary wide">Dodaj drużynę</button></form><form className="formCard adminForm" onSubmit={addMatch}><h2>Dodaj mecz</h2><div className="fieldGrid"><label>GOSPODARZ<select name="homeTeam" required defaultValue=""><option value="" disabled>Wybierz</option>{teamOptions}</select></label><label>GOŚĆ<select name="awayTeam" required defaultValue=""><option value="" disabled>Wybierz</option>{teamOptions}</select></label></div><label>DATA I GODZINA<input name="kickoff" type="datetime-local" required /></label><label>OBIEKT<input name="venue" required /></label><button className="primary wide" disabled={teams.length < 2}>Dodaj mecz</button>{teams.length < 2 ? <small>Najpierw dodaj co najmniej dwie drużyny.</small> : null}</form></div> : null}
    {tab === "Użytkownicy" ? <section className="adminList userRoles">{profiles.map((profile) => <article key={profile.id}><span>{initials(profile.first_name, profile.last_name)}</span><div><strong>{profile.display_name}</strong><small>{(roles[profile.id] ?? []).map((role) => roleLabels[role] ?? role).join(" · ") || "Oczekuje na rolę"}</small></div><select aria-label={`Rola ${profile.display_name}`} value={roles[profile.id]?.[0] ?? ""} onChange={(event) => void changeRole(profile.id, event.target.value)}><option value="" disabled>Nadaj rolę</option>{Object.entries(roleLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></article>)}</section> : null}
    {notice ? <p className="adminNotice">{notice}</p> : null}
  </AppShell>;
}
