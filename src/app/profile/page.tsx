"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function ProfilePage() {
  const router = useRouter();
  const [photo, setPhoto] = useState<string>();
  const [photoFile, setPhotoFile] = useState<File>();
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string>();
  const [initialProfile, setInitialProfile] = useState<Record<string, string | number | null>>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace("/login"); return; }
      setUserId(data.user.id);
      const { data: profile } = await supabase.from("fh_profiles").select("*").eq("id", data.user.id).maybeSingle();
      if (profile) setInitialProfile(profile);
      setLoading(false);
    });
  }, [router]);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !userId) { setSaved(true); setMessage("Tryb demonstracyjny — dodaj zmienne Supabase w Vercel."); return; }
    const data = new FormData(event.currentTarget);
    let avatarPath = typeof initialProfile?.avatar_path === "string" ? initialProfile.avatar_path : undefined;
    if (photoFile) {
      avatarPath = `${userId}/avatar-${Date.now()}.${photoFile.name.split(".").pop() ?? "jpg"}`;
      const upload = await supabase.storage.from("football-avatars").upload(avatarPath, photoFile, { upsert: true });
      if (upload.error) { setMessage(upload.error.message); return; }
    }
    const result = await supabase.from("fh_profiles").upsert({
      id: userId, first_name: data.get("firstName"), last_name: data.get("lastName"),
      display_name: data.get("displayName"), shirt_number: Number(data.get("number")),
      preferred_position: data.get("position"), avatar_path: avatarPath, onboarding_complete: true,
    });
    if (result.error) { setMessage(result.error.message); return; }
    setSaved(true); setMessage("Profil został zapisany.");
  }

  if (loading) return <main className="lineupShell"><p className="empty">Ładowanie profilu…</p></main>;
  return <main className="lineupShell"><PageHeader eyebrow="PIERWSZE LOGOWANIE" title="Profil zawodnika" />
    <form className="formCard" onSubmit={saveProfile}>
      <label className="photoUpload"><span className="profilePhoto" style={photo ? {backgroundImage:`url(${photo})`} : undefined}>{photo ? "" : "MP"}</span><strong>Dodaj zdjęcie</strong><small>JPG lub PNG · kadr zostanie przycięty</small><input type="file" accept="image/*" onChange={e=>{const file=e.target.files?.[0];if(file){setPhotoFile(file);setPhoto(URL.createObjectURL(file));}}} /></label>
      <div className="fieldGrid"><label>IMIĘ<input name="firstName" defaultValue={String(initialProfile?.first_name ?? "Mateusz")} required /></label><label>NAZWISKO<input name="lastName" defaultValue={String(initialProfile?.last_name ?? "Pitek")} required /></label></div>
      <label>NAZWA WYŚWIETLANA<input name="displayName" defaultValue={String(initialProfile?.display_name ?? "M. Pitek")} required /></label>
      <div className="fieldGrid"><label>NUMER<input name="number" type="number" min="0" max="99" defaultValue={String(initialProfile?.shirt_number ?? "1")} required /></label><label>POZYCJA<select name="position" defaultValue={String(initialProfile?.preferred_position ?? "BR")}><option>BR</option><option>OB</option><option>PO</option><option>NA</option></select></label></div>
      {message ? <p className="formMessage">{message}</p> : null}
      <button className="primary wide">{saved ? "Profil zapisany ✓" : "Zapisz profil"}</button>
    </form>
  </main>;
}
