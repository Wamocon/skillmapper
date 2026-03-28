"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Globe,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { useNotifications } from "@/lib/notifications/context";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/layout/brand-mark";

export function Navbar() {
  const { t, locale, setLocale } = useI18n();
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-fog/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Logo */}
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 min-w-0">
          <BrandMark className="h-8 w-8 shrink-0" />
          <span className="font-heading text-lg sm:text-2xl text-ink truncate">Kompetenzkompass</span>
          <Badge variant="mock" className="hidden sm:inline-flex">Mock</Badge>
        </Link>

        {/* Desktop nav */}
        {isAuthenticated && !isAuthPage && (
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="/dashboard" current={pathname}>
              {t("common.dashboard")}
            </NavLink>
            <NavLink href="/projects" current={pathname}>
              {t("common.projects")}
            </NavLink>
            <NavLink href="/postings" current={pathname}>
              {locale === "de" ? "Ausschreibungen" : "Postings"}
            </NavLink>
            <NavLink href="/candidates" current={pathname}>
              {t("common.candidates")}
            </NavLink>
            <NavLink href="/matching" current={pathname}>
              {t("common.matching")}
            </NavLink>
            <NavLink href="/help" current={pathname}>
              {t("common.help")}
            </NavLink>
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Language toggle */}
          <button
            type="button"
            onClick={() => setLocale(locale === "de" ? "en" : "de")}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-ink/70 transition hover:bg-ink/5"
            title={t("common.language")}
          >
            <Globe className="h-4 w-4" />
            <span className="uppercase">{locale}</span>
          </button>

          {isAuthenticated && (
            <>
              {/* Notifications */}
              <Link
                href="/notifications"
                className="relative rounded-lg p-1.5 text-ink/70 transition hover:bg-ink/5"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rust text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              <Link
                href="/settings"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink/70 transition hover:bg-ink/5"
              >
                <User className="h-4 w-4" />
                <span className="hidden md:inline">{user?.full_name}</span>
              </Link>

              <button
                type="button"
                onClick={logout}
                className="rounded-lg p-1.5 text-ink/50 transition hover:bg-ink/5 hover:text-rust"
                title={t("common.logout")}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}

          {!isAuthenticated && !isAuthPage && (
            <Link
              href="/login"
              className="rounded-xl bg-moss px-4 py-2 text-sm font-semibold text-white transition hover:bg-moss/90"
            >
              {t("common.login")}
            </Link>
          )}

          {/* Mobile hamburger */}
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-1.5 text-ink/70 transition hover:bg-ink/5 md:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isAuthenticated && mobileOpen && (
        <nav className="border-t border-ink/10 bg-fog/95 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <MobileNavLink href="/dashboard" onClick={() => setMobileOpen(false)}>
              {t("common.dashboard")}
            </MobileNavLink>
            <MobileNavLink href="/projects" onClick={() => setMobileOpen(false)}>
              {t("common.projects")}
            </MobileNavLink>
            <MobileNavLink href="/postings" onClick={() => setMobileOpen(false)}>
              {locale === "de" ? "Ausschreibungen" : "Postings"}
            </MobileNavLink>
            <MobileNavLink href="/candidates" onClick={() => setMobileOpen(false)}>
              {t("common.candidates")}
            </MobileNavLink>
            <MobileNavLink href="/matching" onClick={() => setMobileOpen(false)}>
              {t("common.matching")}
            </MobileNavLink>
            <MobileNavLink href="/admin" onClick={() => setMobileOpen(false)}>
              {t("common.admin")}
            </MobileNavLink>
            <MobileNavLink href="/help" onClick={() => setMobileOpen(false)}>
              {t("common.help")}
            </MobileNavLink>
            <MobileNavLink href="/settings" onClick={() => setMobileOpen(false)}>
              {t("common.settings")}
            </MobileNavLink>
          </div>
        </nav>
      )}
    </header>
  );
}

function NavLink({ href, current, children }: { href: string; current: string; children: React.ReactNode }) {
  const isActive = current === href || current.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        isActive ? "bg-moss/10 text-moss" : "text-ink/70 hover:bg-ink/5 hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-lg px-3 py-2 text-sm font-medium text-ink/70 transition hover:bg-ink/5 hover:text-ink"
    >
      {children}
    </Link>
  );
}
