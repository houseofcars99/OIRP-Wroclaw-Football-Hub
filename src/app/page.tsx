import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";

const modules = [
  ["Centrum zawodnika", "Wiadomości, mecze i odprawa", "/player", "01"],
  ["Skład meczowy", "Ustaw szóstkę, ławkę i formację", "/captain/lineup", "02"],
  ["Taktyka", "Stałe fragmenty: atak i obrona", "/captain/tactics", "03"],
  ["Centrum meczu", "Wynik, statystyki i relacja live", "/staff/live", "04"],
  ["Strefa kibica", "Typowanie i ranking", "/fan/predictions", "05"],
  ["Panel admina", "Drużyny, mecze, role i komunikaty", "/admin", "06"],
] as const;

export default function Home() {
  return (
    <main className="shell">
      <header className="topbar">
        <Image className="brandLogo" src="/oirp-lawyers-logo.webp" width={58} height={58} alt="Reprezentacja Prawników Polska" priority />
        <div><p className="eyebrow">OIRP WROCŁAW</p><h1>Football Hub</h1></div>
        <Link className="avatar" aria-label="Logowanie i profil" href="/login">MP</Link>
      </header>

      <section className="hero fifaHero">
        <p className="eyebrow">MISTRZOSTWA ŚWIATA PRAWNIKÓW</p>
        <h2>Gotowi<br/><span>do gry.</span></h2>
        <div className="nextMatch">
          <div><small>NAJBLIŻSZY MECZ</small><strong>OIRP Wrocław <b>—</b> Lawyers Madrid</strong></div>
          <time>09:30<small>12 WRZ</small></time>
        </div>
      </section>

      <section className="modules fifaTiles" aria-label="Moduły aplikacji">
        {modules.map(([title, description, href, number]) => (
          <Link className="module" href={href} key={title}>
            <span className="moduleNumber">{number}</span>
            <div><h3>{title}</h3><p>{description}</p></div>
            <span className="arrow">→</span>
          </Link>
        ))}
      </section>
      <BottomNav />
    </main>
  );
}
