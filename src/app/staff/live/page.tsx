"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";

const comments=["Goooooooool!","Świetne podanie","Dobra interwencja","Przejęcie piłki","Groźny strzał","Rzut rożny"];
type Event={id:number;team:string;text:string};
export default function LivePage(){
  const [ours,setOurs]=useState(0),[theirs,setTheirs]=useState(0),[side,setSide]=useState("OIRP Wrocław");
  const [events,setEvents]=useState<Event[]>([]);
  const add=(text:string)=>setEvents(v=>[{id:Date.now(),team:side,text},...v]);
  return <main className="lineupShell"><PageHeader eyebrow="SZTAB TECHNICZNY · LIVE" title="Centrum meczu" />
    <section className="scoreCard"><div><small>OIRP WROCŁAW</small><button onClick={()=>setOurs(Math.max(0,ours-1))}>−</button><strong>{ours}</strong><button onClick={()=>setOurs(ours+1)}>+</button></div><span><b>12:48</b><small>1. POŁOWA</small></span><div><small>LAWYERS MADRID</small><button onClick={()=>setTheirs(Math.max(0,theirs-1))}>−</button><strong>{theirs}</strong><button onClick={()=>setTheirs(theirs+1)}>+</button></div></section>
    <div className="modeTabs"><button className={side==="OIRP Wrocław"?"active":""} onClick={()=>setSide("OIRP Wrocław")}>Nasza drużyna</button><button className={side!=="OIRP Wrocław"?"active":""} onClick={()=>setSide("Lawyers Madrid")}>Rywal</button></div>
    <div className="commentGrid">{comments.map(c=><button onClick={()=>{add(c);if(c.startsWith("Goooo")){if(side==="OIRP Wrocław")setOurs(ours+1);else setTheirs(theirs+1);}}} key={c}>{c}</button>)}</div>
    <section className="timeline"><p className="eyebrow">RELACJA MECZOWA</p>{events.length===0?<p className="empty">Wybierz gotowy komentarz, aby rozpocząć relację.</p>:events.map(e=><article key={e.id}><span>13&apos;</span><div><strong>{e.team}</strong><p>{e.text}</p></div><button onClick={()=>setEvents(v=>v.filter(x=>x.id!==e.id))}>×</button></article>)}</section>
  </main>;
}
