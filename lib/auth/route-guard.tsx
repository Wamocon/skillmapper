"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";

const PUBLIC_PATH_PREFIXES = ["/", "/login", "/register", "/legal", "/anleitung", "/help"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function AuthRouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const publicPath = isPublicPath(pathname);

  useEffect(() => {
    if (isLoading || publicPath || user) {
      return;
    }

    const params = new URLSearchParams({ redirectTo: pathname });
    router.replace(`/login?${params.toString()}`);
  }, [isLoading, pathname, publicPath, router, user]);

  if (!publicPath && (isLoading || !user)) {
    return <div className="py-12 text-center text-sm text-ink/60">Authentifizierung wird geprüft...</div>;
  }

  return <>{children}</>;
}