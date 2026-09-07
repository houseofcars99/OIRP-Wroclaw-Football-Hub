"use client";

import { FormEvent, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";

type Team={name:string;short:string};
export default function AdminPage(){
 const [tab,setTab]=useState("Komunikaty"),[sent,setSent]=useState(false),[teams,setTeams]=useState<Team[]>([{name:"OIRP Wrocław",short:"OIRP"},{name:"Lawyers Madrid",short:"MAD"},{name:"Lex Roma",short:"ROM"}]);
 function addTeam(e:FormEvent<HTMLFormElement>){e.preventDefault();const d=new FormData(e.currentTarget);setTeams(v=>[...v,{name:String(d.get("name")),short:String(d.get("short"))}]);e.currentTarget.reset()}
 return <AppShell><PageHeader eyebrow="ADMINISTRACJA" title="Panel admina" />
  <div className="segmented adminTabs">{["Komunikaty","Drużyny","Mecze","Role"].map(x=><button className={tab===x?"active":""} onClick={()=>setTab(x)} key={x}>{x}</button>)}</div>
  {tab==="Komunikaty"&&<form className="formCard" onSubmit={e=>{e.preventDefault();setSent(true)}}><div className="fieldGrid"><label>PRIORYTET<select><option>Pilny</option><option>Zwykły</option></select></label><label>ODBIORCY<select><option>Wszyscy zawodnicy</option><option>Sztab</option><option>Wszyscy</option></select></label></div><label>TYTUŁ<input defaultValue="Zbiórka przed meczem" required/></label><label>TREŚĆ<textarea defaultValue="Lobby hotelowe, godz. 08:15. Zabierz biały komplet." required/></label><label className="checkLabel"><input type="checkbox" defaultChecked/> Wyślij także powiadomienie push</label><button className="primary wide">{sent?"Komunikat wysłany ✓":"Opublikuj komunikat"}</button></form>}
  {tab==="Drużyny"&&<><form className="formCard compact" onSubmit={addTeam}><div className="fieldGrid"><label>NAZWA<input name="name" required/></label><label>SKRÓT<input name="short" maxLength={4} required/></label></div><label className="logoUpload">LOGO DRUŻYNY<input type="file" accept="image/*"/></label><button className="primary wide">Dodaj drużynę</button></form><section className="adminList">{teams.map(t=><article key={t.name}><span>{t.short.slice(0,1)}</span><div><strong>{t.name}</strong><small>{t.short}</small></div><button>Edytuj</button></article>)}</section></>}
  {tab==="Mecze"&&<form className="formCard"><div className="fieldGrid"><label>GOSPODARZ<select><option>OIRP Wrocław</option><option>Lawyers Madrid</option></select></label><label>GOŚĆ<select><option>Lawyers Madrid</option><option>Lex Roma</option></select></label></div><div className="fieldGrid"><label>DATA I GODZINA<input type="datetime-local"/></label><label>BOISKO<input placeholder="Boisko Centralne"/></label></div><button className="primary wide">Dodaj mecz</button></form>}
  {tab==="Role"&&<section className="adminList">{[["M. Pitek","Kapitan · Zawodnik"],["T. Mazur","Sztab · Zawodnik"],["Anna K.","Kibic"]].map(x=><article key={x[0]}><span>{x[0].split(" ").map(y=>y[0]).join("")}</span><div><strong>{x[0]}</strong><small>{x[1]}</small></div><button>Zmień</button></article>)}</section>}
 </AppShell>
}
