"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

type Point = { x: number; y: number };
type Token = Point & { id: number; number: number; side: "ours" | "rival" };
type Route = { from: Point; to: Point };
type Board = { tokens: Token[]; ball: Point; routes: Route[] };

const phases = { Aut: "throw_in", "Rzut wolny": "free_kick", "Rzut rożny": "corner" } as const;
const modes = { Ofensywa: "offense", Defensywa: "defense" } as const;
const initial: Token[] = [{ id: 1, number: 1, x: 50, y: 88, side: "ours" }, { id: 2, number: 4, x: 24, y: 68, side: "ours" }, { id: 3, number: 5, x: 76, y: 68, side: "ours" }, { id: 4, number: 8, x: 18, y: 42, side: "ours" }, { id: 5, number: 10, x: 50, y: 45, side: "ours" }, { id: 6, number: 7, x: 82, y: 42, side: "ours" }, { id: 7, number: 9, x: 50, y: 18, side: "ours" }, { id: 8, number: 2, x: 28, y: 28, side: "rival" }, { id: 9, number: 3, x: 50, y: 31, side: "rival" }, { id: 10, number: 6, x: 72, y: 28, side: "rival" }];
const emptyBoard = (): Board => ({ tokens: initial, ball: { x: 42, y: 48 }, routes: [] });

export default function TacticsPage() {
  const [phase, setPhase] = useState<keyof typeof phases>("Aut");
  const [mode, setMode] = useState<keyof typeof modes>("Ofensywa");
  const [tokens, setTokens] = useState(initial);
  const [ball, setBall] = useState<Point>({ x: 42, y: 48 });
  const [routes, setRoutes] = useState<Route[]>([]);
  const [notes, setNotes] = useState("");
  const [teamId, setTeamId] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const [tool, setTool] = useState<"move" | "route">("move");
  const [routeStart, setRouteStart] = useState<Point | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const sb = getSupabaseBrowserClient(); if (!sb) return;
    const { data: auth } = await sb.auth.getUser();
    const [teamResult, roleResult] = await Promise.all([
      sb.from("fh_teams").select("id").eq("is_our_team", true).limit(1).maybeSingle(),
      sb.from("fh_user_roles").select("role").eq("user_id", auth.user?.id ?? ""),
    ]);
    const editable = (roleResult.data ?? []).some((entry) => entry.role === "captain" || entry.role === "admin"); setCanEdit(editable);
    if (!teamResult.data) return setMessage("Administrator musi najpierw oznaczyć naszą drużynę.");
    setTeamId(teamResult.data.id);
    const result = await sb.from("fh_tactics").select("board,notes").eq("team_id", teamResult.data.id).eq("phase", phases[phase]).eq("mode", modes[mode]).order("updated_at", { ascending: false }).limit(1).maybeSingle();
    if (result.data) {
      const board = result.data.board as Board; setTokens(board.tokens ?? initial); setBall(board.ball ?? { x: 42, y: 48 }); setRoutes(board.routes ?? []); setNotes(result.data.notes ?? ""); setMessage("");
    } else { const board = emptyBoard(); setTokens(board.tokens); setBall(board.ball); setRoutes(board.routes); setNotes(""); }
  }, [mode, phase]);

  useEffect(() => { void load(); }, [load]);

  function drag(event: React.PointerEvent<HTMLButtonElement>, id: number) {
    if (!canEdit || tool !== "move") return; const pitch = event.currentTarget.parentElement?.getBoundingClientRect(); if (!pitch) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const move = (pointer: PointerEvent) => setTokens((current) => current.map((token) => token.id === id ? { ...token, x: Math.min(94, Math.max(6, (pointer.clientX - pitch.left) / pitch.width * 100)), y: Math.min(95, Math.max(5, (pointer.clientY - pitch.top) / pitch.height * 100)) } : token));
    const stop = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", stop);
  }

  function boardTap(event: React.PointerEvent<HTMLElement>) {
    if (!canEdit || tool !== "route" || event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect(); const point = { x: (event.clientX - rect.left) / rect.width * 100, y: (event.clientY - rect.top) / rect.height * 100 };
    if (!routeStart) setRouteStart(point); else { setRoutes((current) => [...current, { from: routeStart, to: point }]); setRouteStart(null); }
  }

  function moveBall(event: React.PointerEvent<HTMLButtonElement>) {
    if (!canEdit || tool !== "move") return; const pitch = event.currentTarget.parentElement?.getBoundingClientRect(); if (!pitch) return;
    const move = (pointer: PointerEvent) => setBall({ x: Math.min(96, Math.max(4, (pointer.clientX - pitch.left) / pitch.width * 100)), y: Math.min(96, Math.max(4, (pointer.clientY - pitch.top) / pitch.height * 100)) });
    const stop = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", stop);
  }

  async function save() {
    const sb = getSupabaseBrowserClient(); if (!sb || !teamId || !canEdit) return;
    const { data: auth } = await sb.auth.getUser(); const selector = sb.from("fh_tactics").select("id").eq("team_id", teamId).eq("phase", phases[phase]).eq("mode", modes[mode]).limit(1); const existing = await selector.maybeSingle();
    const values = { team_id: teamId, name: `${phase} · ${mode}`, phase: phases[phase], mode: modes[mode], board: { tokens, ball, routes }, notes, updated_by: auth.user?.id, updated_at: new Date().toISOString() };
    const result = existing.data ? await sb.from("fh_tactics").update(values).eq("id", existing.data.id) : await sb.from("fh_tactics").insert(values);
    setMessage(result.error ? result.error.message : "Taktyka zapisana i udostępniona zawodnikom.");
  }

  return <main className="lineupShell"><PageHeader eyebrow={canEdit ? "KAPITAN · TYLKO DRUŻYNA" : "ZAWODNIK · PODGLĄD"} title="Tablica taktyczna" />
    {message ? <p className="formMessage">{message}</p> : null}
    <div className="segmented">{Object.keys(phases).map((name) => <button className={phase === name ? "active" : ""} onClick={() => setPhase(name as keyof typeof phases)} key={name}>{name}</button>)}</div>
    <div className="tacticsToolbar"><div className="modeTabs">{Object.keys(modes).map((name) => <button className={mode === name ? "active" : ""} onClick={() => setMode(name as keyof typeof modes)} key={name}>{name}</button>)}</div>{canEdit ? <div className="boardTools"><button className={tool === "move" ? "active" : ""} onClick={() => setTool("move")}>Przesuwaj</button><button className={tool === "route" ? "active" : ""} onClick={() => setTool("route")}>Rysuj ruch</button></div> : null}</div>
    <p className="boardHint">{canEdit ? tool === "move" ? "Przeciągaj zawodników i piłkę." : routeStart ? "Dotknij miejsca końcowego strzałki." : "Dotknij początku i końca ruchu." : "Taktyka opublikowana przez kapitana."}</p>
    <section className={`pitch tacticsPitch tool-${tool}`} onPointerDown={boardTap}><div className="halfway"/><div className="centerCircle"/><div className="box top"/><div className="box bottom"/><svg className="routes" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><marker id="arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z"/></marker></defs>{routes.map((route, index) => <line key={`${route.from.x}-${route.to.x}-${index}`} x1={route.from.x} y1={route.from.y} x2={route.to.x} y2={route.to.y} markerEnd="url(#arrow)" />)}</svg>{tokens.map((token) => <button disabled={!canEdit} onPointerDown={(event) => drag(event, token.id)} className={`tacticDot ${token.side}`} style={{ left: `${token.x}%`, top: `${token.y}%` }} key={token.id}>{token.number}</button>)}<button disabled={!canEdit} aria-label="Piłka" className="tacticBall" style={{ left: `${ball.x}%`, top: `${ball.y}%` }} onPointerDown={moveBall}>⚽</button></section>
    {canEdit ? <><div className="boardActions"><button onClick={() => { setRoutes([]); setRouteStart(null); }}>Wyczyść strzałki</button><button onClick={() => { const board = emptyBoard(); setTokens(board.tokens); setBall(board.ball); setRoutes(board.routes); }}>Resetuj tablicę</button></div><section className="formCard compact"><label>INSTRUKCJA<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Opisz ustawienie i zadania zawodników…" /></label><button className="primary wide" onClick={() => void save()}>Zapisz taktykę</button></section></> : <section className="formCard compact"><label>INSTRUKCJA<textarea value={notes} readOnly /></label></section>}
  </main>;
}
