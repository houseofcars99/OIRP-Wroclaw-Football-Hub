"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

type Team = { id: string; name: string };
type Match = { id: string; home_team_id: string; home_score: number; away_score: number; status: string; home_team: Team; away_team: Team };
type FeedEvent = { id: string; minute: number | null; team_id: string | null; comment_text: string | null; created_at: string };

export default function FanLiveFeed() {
  const [match, setMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<FeedEvent[]>([]);

  const load = useCallback(async () => {
    const sb = getSupabaseBrowserClient(); if (!sb) return;
    const matchResult = await sb.from("fh_matches").select("id,home_team_id,home_score,away_score,status,home_team:fh_teams!fh_matches_home_team_id_fkey(id,name),away_team:fh_teams!fh_matches_away_team_id_fkey(id,name)").order("kickoff_at").limit(1).maybeSingle();
    if (!matchResult.data) return;
    const current = matchResult.data as unknown as Match; setMatch(current);
    const eventResult = await sb.from("fh_match_events").select("id,minute,team_id,comment_text,created_at").eq("match_id", current.id).order("created_at", { ascending: false });
    setEvents(eventResult.data ?? []);
  }, []);

  useEffect(() => {
    void load(); const timer = window.setInterval(() => void load(), 10000);
    return () => window.clearInterval(timer);
  }, [load]);

  if (!match) return <section id="relacja" className="fanLive"><p className="eyebrow">RELACJA MECZOWA</p><p className="empty">Relacja pojawi się po rozpoczęciu meczu.</p></section>;
  return <section id="relacja" className="fanLive"><header><div><p className="eyebrow">RELACJA NA ŻYWO</p><h2>{match.home_team.name} <b>{match.home_score}:{match.away_score}</b> {match.away_team.name}</h2></div><span className={match.status === "live" ? "livePulse" : ""}>{match.status === "live" ? "● LIVE" : "MECZ"}</span></header><div className="fanTimeline">{events.length === 0 ? <p className="empty">Sztab nie opublikował jeszcze komentarzy.</p> : events.map((event) => <article key={event.id}><strong>{event.minute ?? 0}&apos;</strong><span><small>{event.team_id === match.home_team_id ? match.home_team.name : match.away_team.name}</small>{event.comment_text}</span></article>)}</div></section>;
}
