import { NextResponse } from "next/server";
import { accessConfig, accessToken, isAccessArea, passwordFor } from "@/lib/accessGate";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { area?: unknown; password?: unknown } | null;
  if (!body || !isAccessArea(body.area) || typeof body.password !== "string") return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  if (body.password !== passwordFor(body.area)) return NextResponse.json({ error: "Nieprawidłowe hasło." }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(accessConfig[body.area].cookie, await accessToken(body.area), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
  return response;
}
