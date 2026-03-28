"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { BrandMark } from "@/components/layout/brand-mark";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink/10 bg-fog/50 mt-auto">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 text-xs text-ink/50 md:px-6">
        <div className="flex items-center gap-2">
          <BrandMark className="h-5 w-5 shrink-0" title="Kompetenzkompass Logo" />
          <p>&copy; {year} Kompetenzkompass. All rights reserved.</p>
        </div>
        <nav className="flex gap-4">
          <Link href="/legal/agb" className="hover:text-ink transition">
            {t("legal.agb")}
          </Link>
          <Link href="/legal/datenschutz" className="hover:text-ink transition">
            {t("legal.datenschutz")}
          </Link>
          <Link href="/legal/impressum" className="hover:text-ink transition">
            {t("legal.impressum")}
          </Link>
          <Link href="/help/faq" className="hover:text-ink transition">
            {t("common.faq")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
