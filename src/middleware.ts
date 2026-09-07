import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const roleRules: Array<[string, string[]]> = [
  ["/admin", ["admin"]],
  ["/staff", ["staff", "admin"]],
  ["/captain/lineup", ["captain", "admin"]],
  ["/captain/tactics", ["player", "captain", "staff", "admin"]],
  ["/player", ["player", "captain", "staff", "admin"]],
  ["/messages", ["player", "captain", "staff", "admin"]],
  ["/stats", ["player", "captain", "staff", "admin"]],
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;
  const supabase = createServerClient(url, key, { cookies: {
    getAll: () => request.cookies.getAll(),
    setAll: cookies => { cookies.forEach(({name,value}) => request.cookies.set(name,value)); response = NextResponse.next({request}); cookies.forEach(({name,value,options}) => response.cookies.set(name,value,options)); },
  }});
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  const rule = roleRules.find(([path]) => request.nextUrl.pathname.startsWith(path));
  if (rule) {
    const { data } = await supabase.from("fh_user_roles").select("role").eq("user_id", user.id);
    const roles = new Set((data ?? []).map(row => row.role));
    if (!rule[1].some(role => roles.has(role))) return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  return response;
}

export const config = { matcher: ["/profile/:path*", "/player/:path*", "/messages/:path*", "/matches/:path*", "/stats/:path*", "/captain/:path*", "/staff/:path*", "/admin/:path*"] };
