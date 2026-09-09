"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";

const ranking=[["AK","Anna K.",35],["TW","Tomasz W.",30],["MP","Mateusz P.",25],["JK","Jan K.",20]] as const;
export default function PredictionsPage(){
 const [home,setHome]=useState(2),[away,setAway]=useState(1),[saved,setSaved]=useState(false);
 const change=(side:"home"|"away",delta:number)=>{if(side==="home")setHome(v=>Math.max(0,v+delta));else setAway(v=>Math.max(0,v+delta));setSaved(false)};
 return <main className="lineupShell fanShell"><PageHeader eyebrow="STREFA KIBICA" title="Match Center"/>
  <section className="fanBanner"><div><span>FAZA GRUPOWA · MECZ 01</span><h1>Typuj. Kibicuj.<br/><b>Zdobywaj punkty.</b></h1></div><Image src="/oirp-lawyers-logo.webp" alt="Reprezentacja Prawników Polska" width={170} height={170} priority/></section>
  <nav className="fanNav"><button className="active">Typer</button><Link href="/fan/lineup">Skład</Link><button>Relacja</button><button>Ranking</button></nav>
  <section className="matchPrediction"><header><span>12 WRZEŚNIA · 09:30</span><strong>Typowanie zamyka się za <b>2 dni 08:25</b></strong></header><div className="versus">
   <div className="fanTeam"><span className="crest ours"><Image src="/oirp-lawyers-logo.webp" alt="OIRP Wrocław" width={82} height={82}/></span><strong>OIRP Wrocław</strong><small>POLSKA</small></div>
   <div className="scorePicker"><button onClick={()=>change("home",1)}>+</button><strong>{home}</strong><button onClick={()=>change("home",-1)}>−</button><i>:</i><button onClick={()=>change("away",1)}>+</button><strong>{away}</strong><button onClick={()=>change("away",-1)}>−</button></div>
   <div className="fanTeam"><span className="crest rival">LM</span><strong>Lawyers Madrid</strong><small>HISZPANIA</small></div>
  </div><button className="fanSave" onClick={()=>setSaved(true)}>{saved?`TYP ${home}:${away} ZAPISANY ✓`:"ZAPISZ SWÓJ TYP"}</button></section>
  <div className="scoringStrip"><span><b>10</b><small>PKT · DOKŁADNY WYNIK</small></span><i/><span><b>5</b><small>PKT · ZWYCIĘZCA LUB REMIS</small></span><Link href="/fan/lineup">ZOBACZ SKŁAD →</Link></div>
  <section className="fanRanking"><header><div><p className="eyebrow">KLASYFIKACJA</p><h2>Ranking kibiców</h2></div><span>Po 3 meczach</span></header><div className="podium">{ranking.slice(0,3).map((r,i)=><article className={`place place-${i+1}`} key={r[1]}><span>{r[0]}</span><i>{i+1}</i><strong>{r[1]}</strong><b>{r[2]} pkt</b></article>)}</div><div className="rankRows">{ranking.map((r,i)=><div key={r[1]}><span>{i+1}</span><i>{r[0]}</i><strong>{r[1]}</strong><b>{r[2]} pkt</b></div>)}</div></section>
 </main>
}
