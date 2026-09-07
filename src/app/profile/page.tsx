"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";

export default function ProfilePage() {
  const [photo, setPhoto] = useState<string>();
  const [saved, setSaved] = useState(false);
  return <main className="lineupShell"><PageHeader eyebrow="PIERWSZE LOGOWANIE" title="Profil zawodnika" />
    <section className="formCard">
      <label className="photoUpload"><span className="profilePhoto" style={photo ? {backgroundImage:`url(${photo})`} : undefined}>{photo ? "" : "MP"}</span><strong>Dodaj zdjęcie</strong><small>JPG lub PNG · kadr zostanie przycięty</small><input type="file" accept="image/*" onChange={e=>{const file=e.target.files?.[0];if(file)setPhoto(URL.createObjectURL(file));}} /></label>
      <div className="fieldGrid"><label>IMIĘ<input defaultValue="Mateusz" /></label><label>NAZWISKO<input defaultValue="Pitek" /></label></div>
      <label>NAZWA WYŚWIETLANA<input defaultValue="M. Pitek" /></label>
      <div className="fieldGrid"><label>NUMER<input type="number" min="0" max="99" defaultValue="1" /></label><label>POZYCJA<select defaultValue="BR"><option>BR</option><option>OB</option><option>PO</option><option>NA</option></select></label></div>
      <button className="primary wide" onClick={()=>setSaved(true)}>{saved ? "Profil zapisany ✓" : "Zapisz profil"}</button>
    </section>
  </main>;
}
