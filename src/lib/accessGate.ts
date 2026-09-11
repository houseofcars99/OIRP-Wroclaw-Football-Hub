export type AccessArea = "player" | "captain" | "staff";

export const accessConfig: Record<AccessArea, { cookie: string; label: string; fallbackPassword: string }> = {
  player: { cookie: "fh_player_access", label: "Centrum zawodnika", fallbackPassword: "zawodnik2026" },
  captain: { cookie: "fh_captain_access", label: "Panel kapitana", fallbackPassword: "kapitan2026" },
  staff: { cookie: "fh_staff_access", label: "Centrum meczu", fallbackPassword: "sztab2026" },
};

export function passwordFor(area: AccessArea) {
  const variables: Record<AccessArea, string | undefined> = {
    player: process.env.PLAYER_ACCESS_PASSWORD,
    captain: process.env.CAPTAIN_ACCESS_PASSWORD,
    staff: process.env.STAFF_ACCESS_PASSWORD,
  };
  return variables[area] || accessConfig[area].fallbackPassword;
}

export async function accessToken(area: AccessArea, password = passwordFor(area)) {
  const bytes = new TextEncoder().encode(`oirp-football-hub:${area}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function isAccessArea(value: unknown): value is AccessArea {
  return value === "player" || value === "captain" || value === "staff";
}
