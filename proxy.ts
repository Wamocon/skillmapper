import { createServerClient } from "@supabase/ssr";
import type { SetAllCookies } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getDbSchema, getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/config";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/legal",
  "/anleitung",
  "/help",
  "/_next",
  "/favicon",
  "/api/health",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function createLoginRedirect(request: NextRequest, pathname: string) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", pathname);
  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (!isPublicPath(pathname) && pathname !== "/") {
      return createLoginRedirect(request, pathname);
    }

    return response;
  }

  try {
    const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      db: { schema: getDbSchema() },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!session && !isPublicPath(pathname) && pathname !== "/") {
      return createLoginRedirect(request, pathname);
    }
  } catch {
    if (!isPublicPath(pathname) && pathname !== "/") {
      return createLoginRedirect(request, pathname);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};