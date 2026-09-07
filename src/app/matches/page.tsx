import Link from "next/link";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";

const matches=[
  {date:"12 WRZ · 09:30",home:"OIRP Wrocław",away:"Lawyers Madrid",place:"Boisko Centralne",status:"NASTĘPNY"},
  {date:"12 WRZ · 15:10",home:"Lawyers Berlin",away:"OIRP Wrocław",place:"Boisko 2",status:"ZAPLANOWANY"},
  {date:"13 WRZ · 11:20",home:"OIRP Wrocław",away:"Lex Roma",place:"Boisko Centralne",status:"ZAPLANOWANY"},
];
export default function MatchesPage(){return <AppShell><PageHeader eyebrow="TURNIEJ" title="Terminarz" />
  <div className="filterRow"><button className="active">Nasze mecze</button><button>Wszystkie</button><span>Faza grupowa</span></div>
  <section className="matchList">{matches.map((m,i)=><article key={m.date}><div className="matchMeta"><span>{m.status}</span><time>{m.date}</time></div><div className="matchTeams"><strong>{m.home}</strong><b>—</b><strong>{m.away}</strong></div><p>{m.place}</p><div className="matchLinks"><Link href="/captain/lineup">Skład</Link><Link href="/fan/predictions">Typuj wynik</Link>{i===0&&<Link href="/staff/live">Relacja live</Link>}</div></article>)}</section>
 </AppShell>}
