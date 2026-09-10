"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

type Team = { id: string; name: string };
type Player = { id: string; display_name: string };
type Match = { id: string; home_team_id: string; away_team_id: string; home_score: number; away_score: number; home_team: Team; away_team: Team };
type MatchEvent = { id: string; minute: number | null; comment_text: string | null; comment_key: string | null; team_id: string | null; player_id: string | null; assist_player_id: string | null; created_at: string };

const comments = [
  ["goal", "Goooooooool!"], ["great_pass", "Świetne podanie"], ["save", "Dobra interwencja"],
  ["recovery", "Przejęcie piłki"], ["shot", "Groźny strzał"], ["corner", "Rzut rożny"],
] as const;

export default function LivePage() {
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [side, setSide] = useState<"home" | "away">("home");
  const [player, setPlayer] = useState("");
  const [assist, setAssist] = useState("");
  const [minute, setMinute] = useState(1);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const sb = getSupabaseBrowserClient(); if (!sb) return;
    const matchResult = await sb.from("fh_matches").select("id,home_team_id,away_team_id,home_score,away_score,home_team:fh_teams!fh_matches_home_team_id_fkey(id,name),away_team:fh_teams!fh_matches_away_team_id_fkey(id,name)").order("kickoff_at").limit(1).maybeSingle();
    if (!matchResult.data) { setMessage("Najpierw dodaj mecz w panelu administratora."); return; }
    const current = matchResult.data as unknown as Match; setMatch(current);
    const [profileResult, eventResult] = await Promise.all([
      sb.from("fh_profiles").select("id,display_name").order("display_name"),
      sb.from("fh_match_events").select("id,minute,comment_text,comment_key,team_id,player_id,assist_player_id,created_at").eq("match_id", current.id).order("created_at", { ascending: false }),
    ]);
    setPlayers(profileResult.data ?? []); setEvents(eventResult.data ?? []);
    if (!player && profileResult.data?.[0]) setPlayer(profileResult.data[0].id);
  }, [player]);

  useEffect(() => { void load(); }, [load]);

  async function setScore(team: "home" | "away", delta: number) {
    if (!match) return; const sb = getSupabaseBrowserClient(); if (!sb) return;
    const field = team === "home" ? "home_score" : "away_score";
    const value = Math.max(0, (team === "home" ? match.home_score : match.away_score) + delta);
    const result = await sb.from("fh_matches").update({ [field]: value, status: "live" }).eq("id", match.id);
    if (result.error) return setMessage(result.error.message);
    setMatch({ ...match, [field]: value });
  }

  async function addEvent(key: string, text: string) {
    if (!match) return; const sb = getSupabaseBrowserClient(); if (!sb) return;
    const teamId = side === "home" ? match.home_team_id : match.away_team_id; const isGoal = key === "goal";
    const { data: auth } = await sb.auth.getUser();
    const result = await sb.from("fh_match_events").insert({ match_id: match.id, event_type: isGoal ? "goal" : "comment", team_id: teamId, player_id: player || null, assist_player_id: isGoal && assist ? assist : null, minute, comment_key: key, comment_text: text, created_by: auth.user?.id }).select("id,minute,comment_text,comment_key,team_id,player_id,assist_player_id,created_at").single();
    if (result.error) return setMessage(result.error.message);
    setEvents((current) => [result.data, ...current]); setMessage("Komentarz opublikowany w strefie kibica.");
    if (isGoal) await setScore(side, 1);
  }

  async function removeEvent(id: string) {
    const sb = getSupabaseBrowserClient(); if (!sb) return;
    const result = await sb.from("fh_match_events").delete().eq("id", id); if (result.error) return setMessage(result.error.message);
    setEvents((current) => current.filter((event) => event.id !== id));
  }

  const selectedTeam = side === "home" ? match?.home_team : match?.away_team;
  const playerName = (id: string | null) => players.find((entry) => entry.id === id)?.display_name;

  return <main className="lineupShell"><PageHeader eyebrow="SZTAB TECHNICZNY · LIVE" title="Centrum meczu" />
    {message ? <p className="formMessage">{message}</p> : null}
    {match ? <><section className="scoreCard"><div><small>{match.home_team.name}</small><button aria-label="Odejmij gola gospodarzom" onClick={() => void setScore("home", -1)}>−</button><strong>{match.home_score}</strong><button aria-label="Dodaj gola gospodarzom" onClick={() => void setScore("home", 1)}>+</button></div><span><b>LIVE</b><small>{minute}&apos; MINUTA</small></span><div><small>{match.away_team.name}</small><button aria-label="Odejmij gola gościom" onClick={() => void setScore("away", -1)}>−</button><strong>{match.away_score}</strong><button aria-label="Dodaj gola gościom" onClick={() => void setScore("away", 1)}>+</button></div></section>
      <div className="modeTabs"><button className={side === "home" ? "active" : ""} onClick={() => setSide("home")}>{match.home_team.name}</button><button className={side === "away" ? "active" : ""} onClick={() => setSide("away")}>{match.away_team.name}</button></div>
      <div className="liveSelectors"><label>MINUTA<input type="number" min={0} value={minute} onChange={(event) => setMinute(Math.max(0, Number(event.target.value)))} /></label><label>ZAWODNIK<select value={player} onChange={(event) => setPlayer(event.target.value)}><option value="">Bez zawodnika</option>{players.map((entry) => <option value={entry.id} key={entry.id}>{entry.display_name}</option>)}</select></label><label>ASYSTA<select value={assist} onChange={(event) => setAssist(event.target.value)}><option value="">Bez asysty</option>{players.map((entry) => <option value={entry.id} key={entry.id}>{entry.display_name}</option>)}</select></label></div>
      <p className="boardHint">Publikujesz dla: <strong>{selectedTeam?.name}</strong></p>
      <div className="commentGrid">{comments.map(([key, text]) => <button onClick={() => void addEvent(key, text)} key={key}>{text}</button>)}</div>
      <section className="timeline"><p className="eyebrow">RELACJA MECZOWA</p>{events.length === 0 ? <p className="empty">Wybierz komentarz, aby rozpocząć relację.</p> : events.map((event) => <article key={event.id}><span>{event.minute ?? 0}&apos;</span><div><strong>{event.team_id === match.home_team_id ? match.home_team.name : match.away_team.name}{playerName(event.player_id) ? ` · ${playerName(event.player_id)}` : ""}</strong><p>{event.comment_text}{playerName(event.assist_player_id) ? ` Asysta: ${playerName(event.assist_player_id)}.` : ""}</p></div><button aria-label="Usuń zdarzenie" onClick={() => void removeEvent(event.id)}>×</button></article>)}</section>
    </> : null}
  </main>;
}
