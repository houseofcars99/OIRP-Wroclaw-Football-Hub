"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";

const initial = [
  {id:1,urgent:true,title:"Zbiórka przed meczem",body:"Lobby hotelowe, godz. 08:15. Zabierz biały komplet.",time:"dzisiaj · 07:10",read:false},
  {id:2,urgent:false,title:"Wspólne wyjście",body:"Po meczu spotykamy się o 20:30 przy recepcji.",time:"wczoraj · 18:40",read:false},
  {id:3,urgent:false,title:"Plan regeneracji",body:"Rozciąganie i basen dostępne od godz. 16:00.",time:"11 wrz · 13:15",read:true},
];

export default function MessagesPage(){
  const [messages,setMessages]=useState(initial);
  return <AppShell><PageHeader eyebrow="POWIADOMIENIA" title="Wiadomości" />
    <div className="filterRow"><button className="active">Wszystkie</button><button>Pilne</button><span>{messages.filter(x=>!x.read).length} nowe</span></div>
    <section className="messageList">{messages.map(m=><button key={m.id} className={`messageCard ${m.urgent?"urgent":""} ${m.read?"read":""}`} onClick={()=>setMessages(v=>v.map(x=>x.id===m.id?{...x,read:true}:x))}>
      <span className="messageIcon">{m.urgent?"!":"i"}</span><div><small>{m.urgent?"PILNE":"INFORMACJA"} · {m.time}</small><h2>{m.title}</h2><p>{m.body}</p></div>{!m.read&&<i/>}
    </button>)}</section>
  </AppShell>;
}
