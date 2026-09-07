"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setMessage("Połączenie z Supabase nie zostało jeszcze dodane w Vercel."); return; }
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    setBusy(true); setMessage("");
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/profile` },
        });
    setBusy(false);
    if (result.error) { setMessage(result.error.message); return; }
    if (mode === "register" && !result.data.session) { setMessage("Sprawdź pocztę i potwierdź rejestrację."); return; }
    router.push("/profile");
  }

  return <main className="lineupShell"><PageHeader eyebrow="OIRP WROCŁAW" title={mode === "login" ? "Logowanie" : "Załóż konto"} />
    <form className="formCard" onSubmit={submit}>
      <label>E-MAIL<input name="email" type="email" autoComplete="email" required /></label>
      <label>HASŁO<input name="password" type="password" minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} required /></label>
      {message ? <p className="formMessage">{message}</p> : null}
      <button className="primary wide" disabled={busy}>{busy ? "Proszę czekać…" : mode === "login" ? "Zaloguj się" : "Utwórz konto"}</button>
      <button type="button" className="textButton" onClick={() => { setMode(mode === "login" ? "register" : "login"); setMessage(""); }}>
        {mode === "login" ? "Nie mam konta — rejestracja" : "Mam już konto — logowanie"}
      </button>
      <Link className="textLink" href="/">Wróć do podglądu aplikacji</Link>
    </form>
  </main>;
}
