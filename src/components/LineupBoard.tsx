"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Player = { id: number; shortName: string; number: number; role: string; initials: string };
type Spot = { playerId: number; x: number; y: number };

const players: Player[] = [
  { id: 1, shortName: "M. Pitek", number: 1, role: "BR", initials: "MP" },
  { id: 2, shortName: "K. Nowak", number: 4, role: "OB", initials: "KN" },
  { id: 3, shortName: "P. Wójcik", number: 5, role: "OB", initials: "PW" },
  { id: 4, shortName: "A. Zieliński", number: 8, role: "PO", initials: "AZ" },
  { id: 5, shortName: "T. Mazur", number: 10, role: "PO", initials: "TM" },
  { id: 6, shortName: "J. Kaczmarek", number: 9, role: "NA", initials: "JK" },
  { id: 7, shortName: "D. Lis", number: 12, role: "BR", initials: "DL" },
  { id: 8, shortName: "B. Król", number: 6, role: "OB", initials: "BK" },
  { id: 9, shortName: "R. Dudek", number: 7, role: "PO", initials: "RD" },
  { id: 10, shortName: "S. Pawlak", number: 11, role: "NA", initials: "SP" },
  { id: 11, shortName: "M. Urban", number: 14, role: "PO", initials: "MU" },
];

const formations: Record<string, Omit<Spot, "playerId">[]> = {
  "1–2–2": [{x:50,y:88},{x:26,y:66},{x:74,y:66},{x:30,y:34},{x:70,y:34},{x:50,y:14}],
  "2–2–1": [{x:50,y:88},{x:30,y:65},{x:70,y:65},{x:30,y:40},{x:70,y:40},{x:50,y:14}],
  "1–3–1": [{x:50,y:88},{x:50,y:68},{x:20,y:44},{x:50,y:44},{x:80,y:44},{x:50,y:14}],
  "2–1–2": [{x:50,y:88},{x:30,y:66},{x:70,y:66},{x:50,y:45},{x:28,y:18},{x:72,y:18}],
};

export default function LineupBoard() {
  const [formation, setFormation] = useState("1–2–2");
  const [spots, setSpots] = useState<Spot[]>(() => formations["1–2–2"].map((p, i) => ({...p, playerId: players[i].id})));
  const [published, setPublished] = useState(false);
  const starters = useMemo(() => new Set(spots.map(s => s.playerId)), [spots]);
  const bench = players.filter(p => !starters.has(p.id)).slice(0, 5);

  function changeFormation(value: string) {
    setFormation(value);
    setSpots(current => formations[value].map((p, i) => ({...p, playerId: current[i]?.playerId ?? players[i].id})));
    setPublished(false);
  }

  function movePlayer(event: React.PointerEvent<HTMLButtonElement>, index: number) {
    const pitch = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!pitch) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const move = (pointer: PointerEvent) => {
      const x = Math.min(92, Math.max(8, ((pointer.clientX - pitch.left) / pitch.width) * 100));
      const y = Math.min(94, Math.max(6, ((pointer.clientY - pitch.top) / pitch.height) * 100));
      setSpots(current => current.map((spot, i) => i === index ? {...spot, x, y} : spot));
      setPublished(false);
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  }

  return (
    <main className="lineupShell">
      <header className="lineupHeader">
        <Link href="/" className="back">←</Link>
        <div><p className="eyebrow">KAPITAN · MECZ 01</p><h1>Skład meczowy</h1></div>
        <span className={published ? "status live" : "status"}>{published ? "OPUBLIKOWANY" : "ROBOCZY"}</span>
      </header>

      <div className="formationBar">
        <label>FORMACJA<select value={formation} onChange={e => changeFormation(e.target.value)}>
          {Object.keys(formations).map(name => <option key={name}>{name}</option>)}
        </select></label>
        <span>6 / 6 NA BOISKU</span>
      </div>

      <section className="pitch" aria-label="Interaktywne ustawienie zawodników">
        <div className="halfway"/><div className="centerCircle"/><div className="box top"/><div className="box bottom"/>
        {spots.map((spot, index) => {
          const player = players.find(p => p.id === spot.playerId)!;
          return (
            <button key={player.id} className="playerToken" style={{left:`${spot.x}%`, top:`${spot.y}%`}} onPointerDown={e => movePlayer(e, index)}>
              <span className="photo">{player.initials}<i>{player.number}</i></span>
              <strong>{player.shortName}</strong><small>{player.role}</small>
            </button>
          );
        })}
      </section>

      <section className="bench">
        <div className="sectionTitle"><div><p className="eyebrow">ŁAWKA REZERWOWYCH</p><h2>Zmiany</h2></div><span>{bench.length} / 5</span></div>
        <div className="benchList">{bench.map(player => <div className="benchPlayer" key={player.id}><span className="photo small">{player.initials}<i>{player.number}</i></span><strong>{player.shortName}</strong><small>{player.role}</small></div>)}</div>
      </section>

      <div className="actions"><button className="secondary" onClick={() => setPublished(false)}>Zapisz roboczo</button><button className="primary" onClick={() => setPublished(true)}>Opublikuj skład</button></div>
    </main>
  );
}
