import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
const rows=[["M. Pitek","BR","2","0","0"],["J. Kaczmarek","NA","2","4","1"],["T. Mazur","PO","2","2","3"],["A. Zieliński","PO","2","1","2"],["K. Nowak","OB","2","0","1"]];
export default function StatsPage(){return <AppShell><PageHeader eyebrow="DRUŻYNA" title="Statystyki" />
  <section className="statHero"><div><small>MECZE</small><strong>2</strong></div><div><small>GOLE</small><strong>9</strong></div><div><small>ASYSTY</small><strong>7</strong></div></section>
  <section className="statsTable"><div className="statsHead"><span>Zawodnik</span><span>M</span><span>G</span><span>A</span></div>{rows.map(r=><div key={r[0]}><span><i>{r[1]}</i><strong>{r[0]}</strong></span><b>{r[2]}</b><b>{r[3]}</b><b>{r[4]}</b></div>)}</section>
 </AppShell>}
