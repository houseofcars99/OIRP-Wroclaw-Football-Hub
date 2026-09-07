"use client";

import Link from "next/link";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";

export default function PlayerPage() {
  const [answer, setAnswer] = useState("Będę");
  return <AppShell><PageHeader eyebrow="STREFA ZAWODNIKA" title="Centrum drużyny" />
    <section className="alertCard urgent"><span>!</span><div><small>PILNE · DZISIAJ</small><h2>Zbiórka przed meczem</h2><p>Lobby hotelowe, godz. 08:15. Zabierz biały komplet.</p></div></section>
    <div className="responseBar" aria-label="Potwierdzenie obecności">{["Będę","Spóźnię się","Nie będzie mnie"].map(x=><button key={x} className={answer===x?"active":""} onClick={()=>setAnswer(x)}>{x}</button>)}</div>
    <section className="matchSummary"><div><p className="eyebrow">NAJBLIŻSZY MECZ · 12 WRZ</p><h2>OIRP Wrocław <b>vs</b> Lawyers Madrid</h2><span>09:30 · Boisko Centralne</span></div><strong>01</strong></section>
    <section className="quickGrid">
      <Link href="/captain/lineup"><span>6/6</span><h3>Skład</h3><p>Zobacz ustawienie na mecz</p></Link>
      <Link href="/captain/tactics"><span>06</span><h3>Taktyki</h3><p>Stałe fragmenty i warianty</p></Link>
      <Link href="/messages"><span>2</span><h3>Komunikaty</h3><p>Jedna pilna wiadomość</p></Link>
      <Link href="/stats"><span>12</span><h3>Statystyki</h3><p>Gole, asysty i występy</p></Link>
    </section>
  </AppShell>;
}
