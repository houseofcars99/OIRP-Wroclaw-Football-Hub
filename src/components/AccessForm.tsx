"use client";

import { FormEvent, useState } from "react";
import type { AccessArea } from "@/lib/accessGate";

export default function AccessForm({ area, label, nextPath }: { area: AccessArea; label: string; nextPath: string }) {
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); const data = new FormData(event.currentTarget);
    const response = await fetch("/api/access", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ area, password: data.get("password") }) });
    const result = await response.json(); setBusy(false);
    if (!response.ok) return setError(result.error ?? "Nie udało się odblokować strefy.");
    window.location.assign(nextPath);
  }
  return <form className="formCard accessCard" onSubmit={submit}><label>HASŁO DOSTĘPU<input name="password" type="password" autoComplete="current-password" autoFocus required /></label>{error ? <p className="formMessage">{error}</p> : null}<button className="primary wide" disabled={busy}>{busy ? "Sprawdzanie…" : `Wejdź: ${label}`}</button></form>;
}
