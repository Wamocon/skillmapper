"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";

interface BreadcrumbSegment {
  label: string;
  href: string;
}

/**
 * Maps path segments to translation keys for breadcrumb labels.
 */
const SEGMENT_LABELS: Record<string, TranslationKey> = {
  dashboard: "breadcrumb.dashboard",
  projects: "breadcrumb.projects",
  candidates: "breadcrumb.candidates",
  matching: "breadcrumb.matching",
  settings: "breadcrumb.settings",
  admin: "breadcrumb.admin",
  users: "breadcrumb.users",
  licenses: "breadcrumb.licenses",
  help: "breadcrumb.help",
  faq: "breadcrumb.faq",
  legal: "breadcrumb.legal",
  agb: "breadcrumb.agb",
  datenschutz: "breadcrumb.datenschutz",
  impressum: "breadcrumb.impressum",
  login: "breadcrumb.login",
  register: "breadcrumb.register",
  new: "breadcrumb.newProject",
  anleitung: "help.guideTitle",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const { t } = useI18n();

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs: BreadcrumbSegment[] = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const labelKey = SEGMENT_LABELS[segment];
    const label = labelKey ? t(labelKey) : segment.charAt(0).toUpperCase() + segment.slice(1);
    return { label, href };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 overflow-hidden text-sm text-ink/60">
      <Link href="/dashboard" className="flex flex-shrink-0 items-center gap-1 hover:text-ink transition">
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">{t("breadcrumb.home")}</span>
      </Link>
      {crumbs.map((crumb, index) => (
        <span key={crumb.href} className="flex min-w-0 items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-ink/30" />
          {index === crumbs.length - 1 ? (
            <span className="truncate font-semibold text-ink/80">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="truncate hover:text-ink transition">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
