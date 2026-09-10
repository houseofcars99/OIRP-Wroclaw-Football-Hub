"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { formatDateTime } from "@/lib/format";
type Gathering={id:string;title:string;starts_at:string;place:string;notes:string|null};
export default function PlayerPage(){
 const [gathering,setGathering]=useState<Gathering|null>(null),[answer,setAnswer]=useState(""),[message,setMessage]=useState("");
 useEffect(()=>{const sb=getSupabaseBrowserClient();if(!sb)return;void (async()=>{const {data:g,error}=await sb.from("fh_gatherings").select("id,title,starts_at,place,notes").gte("starts_at",new Date().toISOString()).order("starts_at").limit(1).maybeSingle();if(error){setMessage("Zbiórki wymagają uruchomienia migracji data-upgrade.sql.");return}setGathering(g);if(g){const {data:{user}}=await sb.auth.getUser();const {data:r}=await sb.from("fh_gathering_responses").select("response").eq("gathering_id",g.id).eq("user_id",user?.id).maybeSingle();if(r)setAnswer(r.response)}})()},[]);
 async function respond(response:string){const sb=getSupabaseBrowserClient();if(!sb||!gathering)return;const {data:{user}}=await sb.auth.getUser();if(!user)return;const result=await sb.from("fh_gathering_responses").upsert({gathering_id:gathering.id,user_id:user.id,response,responded_at:new Date().toISOString()});if(result.error){setMessage(result.error.message);return}setAnswer(response);setMessage("Odpowiedź zapisana.")}
 const options:[[string,string],[string,string],[string,string]]=[["attending","Będę"],["late","Spóźnię się"],["absent","Nie będzie mnie"]];
 return <AppShell><PageHeader eyebrow="STREFA ZAWODNIKA" title="Centrum drużyny"/>{gathering?<><section className="alertCard urgent"><span>!</span><div><small>NAJBLIŻSZA ZBIÓRKA · {formatDateTime(gathering.starts_at)}</small><h2>{gathering.title}</h2><p>{gathering.place}{gathering.notes?` · ${gathering.notes}`:""}</p></div></section><div className="responseBar">{options.map(([value,label])=><button key={value} className={answer===value?"active":""} onClick={()=>void respond(value)}>{label}</button>)}</div></>:<section className="alertCard"><span>✓</span><div><small>BRAK NOWYCH ZBIÓREK</small><h2>Wszystko sprawdzone</h2><p>Administrator nie zaplanował kolejnej zbiórki.</p></div></section>}{message&&<p className="formMessage">{message}</p>}<section className="quickGrid"><Link href="/captain/lineup"><span>7/7</span><h3>Skład</h3><p>Ustawienie na mecz</p></Link><Link href="/captain/tactics"><span>06</span><h3>Taktyki</h3><p>Stałe fragmenty</p></Link><Link href="/messages"><span>!</span><h3>Komunikaty</h3><p>Wiadomości drużynowe</p></Link><Link href="/matches"><span>03</span><h3>Mecze</h3><p>Terminarz turnieju</p></Link></section></AppShell>
}
