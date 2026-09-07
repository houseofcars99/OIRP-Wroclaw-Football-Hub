"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";

export default function PredictionsPage(){
  const [home,setHome]=useState(2),[away,setAway]=useState(1),[saved,setSaved]=useState(false);
  return <main className="lineupShell"><PageHeader eyebrow="STREFA KIBICA" title="Typer meczowy" />
    <section className="predictionHero"><p>FAZA GRUPOWA · MECZ 01</p><div><span><b>O</b><strong>OIRP Wrocław</strong></span><div className="predictionInputs"><input value={home} min="0" onChange={e=>{setHome(+e.target.value);setSaved(false)}} type="number"/><i>:</i><input value={away} min="0" onChange={e=>{setAway(+e.target.value);setSaved(false)}} type="number"/></div><span><b>M</b><strong>Lawyers Madrid</strong></span></div><small>Typowanie zamyka się 12 września o 09:25</small><button className="primary wide" onClick={()=>setSaved(true)}>{saved?`Typ zapisany: ${home}:${away} ✓`:"Zapisz typ"}</button></section>
    <section className="pointsInfo"><div><strong>10</strong><span>pkt</span><p>dokładny wynik</p></div><div><strong>5</strong><span>pkt</span><p>zwycięzca lub remis</p></div></section>
    <Link className="publicLineupLink" href="/fan/lineup">Zobacz opublikowany skład →</Link>
    <section className="ranking"><p className="eyebrow">RANKING KIBICÓW</p>{[["1","Anna K.","35"],["2","Tomasz W.","30"],["3","Mateusz P.","25"]].map(r=><div key={r[0]}><span>{r[0]}</span><strong>{r[1]}</strong><b>{r[2]} pkt</b></div>)}</section>
  </main>;
}
