"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Start", icon: "⌂" },
  { href: "/player", label: "Drużyna", icon: "●" },
  { href: "/matches", label: "Mecze", icon: "⚽" },
  { href: "/messages", label: "Wiadomości", icon: "!" },
  { href: "/profile", label: "Profil", icon: "○" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return <nav className="bottomNav" aria-label="Główna nawigacja">
    {links.map(link => <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : ""}>
      <span aria-hidden="true">{link.icon}</span><small>{link.label}</small>
    </Link>)}
  </nav>;
}
