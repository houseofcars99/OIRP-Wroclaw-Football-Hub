import Link from "next/link";

const modules = [
  ["Skład meczowy", "Ustaw szóstkę, ławkę i formację", "/captain/lineup", "01"],
  ["Taktyka", "Stałe fragmenty: atak i obrona", "/captain/tactics", "02"],
  ["Centrum meczu", "Wynik, statystyki i relacja live", "/staff/live", "03"],
  ["Mój profil", "Zdjęcie, numer i pozycja", "/profile", "04"],
  ["Strefa kibica", "Typowanie i ranking", "/fan/predictions", "05"],
] as const;

export default function Home() {
  return (
    <main className="shell">
      <header className="topbar">
        <div className="brandMark">O</div>
        <div><p className="eyebrow">OIRP WROCŁAW</p><h1>Football Hub</h1></div>
        <Link className="avatar" aria-label="Logowanie i profil" href="/login">MP</Link>
      </header>

      <section className="hero">
        <p className="eyebrow">MISTRZOSTWA ŚWIATA PRAWNIKÓW</p>
        <h2>Jedna drużyna.<br/><span>Jeden plan.</span></h2>
        <div className="nextMatch">
          <div><small>NAJBLIŻSZY MECZ</small><strong>OIRP Wrocław <b>—</b> Lawyers Madrid</strong></div>
          <time>09:30<small>12 WRZ</small></time>
        </div>
      </section>

      <section className="modules" aria-label="Moduły aplikacji">
        {modules.map(([title, description, href, number]) => (
          <Link className="module" href={href} key={title}>
            <span className="moduleNumber">{number}</span>
            <div><h3>{title}</h3><p>{description}</p></div>
            <span className="arrow">→</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
