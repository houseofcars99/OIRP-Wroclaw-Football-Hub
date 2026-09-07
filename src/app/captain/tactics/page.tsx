"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";

const phases = ["Aut", "Rzut wolny", "Rzut rożny"];
const dots = [{n:1,x:50,y:82},{n:4,x:28,y:63},{n:5,x:72,y:63},{n:8,x:25,y:34},{n:10,x:58,y:38},{n:9,x:78,y:18}];

export default function TacticsPage(){
  const [phase,setPhase]=useState("Aut"); const [mode,setMode]=useState("Ofensywa"); const [saved,setSaved]=useState(false);
  return <main className="lineupShell"><PageHeader eyebrow="TYLKO DRUŻYNA" title="Tablica taktyczna" />
    <div className="segmented">{phases.map(x=><button className={phase===x?"active":""} onClick={()=>{setPhase(x);setSaved(false)}} key={x}>{x}</button>)}</div>
    <div className="modeTabs"><button className={mode==="Ofensywa"?"active":""} onClick={()=>setMode("Ofensywa")}>Ofensywa</button><button className={mode==="Defensywa"?"active":""} onClick={()=>setMode("Defensywa")}>Defensywa</button></div>
    <section className="pitch tacticsPitch"><div className="halfway"/><div className="centerCircle"/>{dots.map(d=><button className="tacticDot" style={{left:`${d.x}%`,top:`${d.y}%`}} key={d.n}>{d.n}</button>)}<span className="ball" style={{left:"42%",top:"42%"}}>●</span><span className="routeArrow">➜</span></section>
    <section className="formCard compact"><label>NAZWA WARIANTU<input defaultValue={`${phase} A · ${mode}`} /></label><label>INSTRUKCJA<textarea defaultValue="Krótko do zawodnika nr 10, ruch napastnika za plecy obrońcy." /></label><button className="primary wide" onClick={()=>setSaved(true)}>{saved?"Taktyka zapisana ✓":"Zapisz taktykę"}</button></section>
  </main>;
}
