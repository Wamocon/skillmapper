"use client";

import Link from "next/link";
import { ArrowRight, Zap, Shield, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  const { locale } = useI18n();

  return (
    <div className="space-y-8" suppressHydrationWarning>
      {/* Hero */}
      <section className="animate-rise rounded-3xl border border-ink/10 bg-fog/70 p-8 shadow-panel md:p-12" suppressHydrationWarning>
        <div className="flex flex-wrap items-center justify-between gap-3" suppressHydrationWarning>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rust">
            {locale === "de" ? "Skill-Matching-Plattform" : "Skill matching platform"}
          </p>
          <Badge variant="mock">{locale === "de" ? "Mock-Modus" : "Mock mode"}</Badge>
        </div>
        <h1 className="mt-4 max-w-4xl font-heading text-5xl leading-tight text-ink md:text-7xl">
          {locale === "de"
            ? "Projekte und Kandidaten intelligent matchen."
            : "Match projects and candidates intelligently."}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink/80">
          {locale === "de"
            ? "Kompetenzkompass analysiert Projektanforderungen und Kandidatenprofile, erstellt automatische Mappings und liefert datenbasierte Matching-Scores inklusive Interviewleitfaden."
            : "Kompetenzkompass analyzes project requirements and candidate profiles, builds automated mappings, and delivers data-driven matching scores including interview guidance."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register">
            <Button size="lg">
              {locale === "de" ? "Kostenlos starten" : "Start for free"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">
              {locale === "de" ? "Anmelden" : "Log in"}
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="lg">
              {locale === "de" ? "Demo ansehen" : "View demo"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <Zap className="h-10 w-10 text-moss" />
            <h3 className="font-heading text-xl text-ink">{locale === "de" ? "Automatisches Matching" : "Automated matching"}</h3>
            <p className="text-sm text-ink/60">
              {locale === "de"
                ? "Projektanforderungen und Kandidaten-Skills werden automatisch extrahiert und verglichen."
                : "Project requirements and candidate skills are extracted and compared automatically."}
            </p>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <Shield className="h-10 w-10 text-rust" />
            <h3 className="font-heading text-xl text-ink">{locale === "de" ? "Rollen & Rechte" : "Roles & permissions"}</h3>
            <p className="text-sm text-ink/60">
              {locale === "de"
                ? "Mandantenfähig mit Admin-, Manager- und Benutzerrollen plus Row-Level Security."
                : "Tenant-ready with admin, manager, and user roles plus row-level security."}
            </p>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <Globe className="h-10 w-10 text-amber-600" />
            <h3 className="font-heading text-xl text-ink">{locale === "de" ? "Mehrsprachig" : "Multilingual"}</h3>
            <p className="text-sm text-ink/60">
              {locale === "de"
                ? "Vollständig in Deutsch und Englisch verfügbar. Weitere Sprachen sind geplant."
                : "Fully available in German and English. Additional languages are planned."}
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
