"use client";

import Link from "next/link";
import { Briefcase, FolderOpen, Users, Zap, Plus, Settings, Shield } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PERMISSIONS } from "@/lib/auth/roles";
import { getActivePostings } from "@/lib/mock-records";

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const { user, can } = useAuth();

  const activePostingCount = getActivePostings().length;

  const stats = [
    { icon: FolderOpen, label: t("dashboard.projectsCount", { count: 3 }), href: "/projects", color: "text-moss" },
    { icon: Briefcase, label: locale === "de" ? `${activePostingCount} aktive Ausschreibungen` : `${activePostingCount} active postings`, href: "/postings", color: "text-indigo-600" },
    { icon: Users, label: t("dashboard.candidatesCount", { count: 7 }), href: "/candidates", color: "text-rust" },
    { icon: Zap, label: t("dashboard.matchesCount", { count: 12 }), href: "/matching", color: "text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <section className="animate-rise rounded-3xl border border-ink/10 bg-fog/70 p-8 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rust">
              {t("common.dashboard")}
            </p>
            <h1 className="mt-2 font-heading text-4xl text-ink md:text-5xl">
              {t("dashboard.welcome", { name: user?.full_name ?? "" })}
            </h1>
          </div>
          <Badge variant="mock">Mock</Badge>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href}>
            <Card className="transition hover:shadow-lg hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <p className="font-heading text-2xl text-ink">{stat.label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </section>

      {/* Quick actions */}
      <Card>
        <CardHeader title={t("dashboard.quickActions")} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Link href="/projects/new">
            <Button variant="secondary" className="w-full justify-start">
              <Plus className="h-4 w-4" />
              {t("projects.new")}
            </Button>
          </Link>
          <Link href="/postings">
            <Button variant="secondary" className="w-full justify-start">
              <Briefcase className="h-4 w-4" />
              {locale === "de" ? "Ausschreibungen" : "Postings"}
            </Button>
          </Link>
          <Link href="/matching?mode=single">
            <Button variant="secondary" className="w-full justify-start">
              <Zap className="h-4 w-4" />
              {locale === "de" ? "Einzelmatching" : "Single matching"}
            </Button>
          </Link>
          <Link href="/matching?mode=batch">
            <Button variant="secondary" className="w-full justify-start">
              <Zap className="h-4 w-4" />
              {locale === "de" ? "Mehrfach-Matching" : "Batch matching"}
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="secondary" className="w-full justify-start">
              <Settings className="h-4 w-4" />
              {t("common.settings")}
            </Button>
          </Link>
          {can(PERMISSIONS.ADMIN_PANEL) && (
            <Link href="/admin">
              <Button variant="secondary" className="w-full justify-start">
                <Shield className="h-4 w-4" />
                {t("common.admin")}
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Recent activity placeholder */}
      <Card>
        <CardHeader title={t("dashboard.recentActivity")} />
        <div className="mt-4 space-y-3">
          <ActivityItem
            icon={<Zap className="h-4 w-4 text-amber-600" />}
            text={locale === "de" ? "Mehrfach-Matching: 10 Bewerber für Skillmapper MVP" : "Batch matching: 10 candidates for Skillmapper MVP"}
            detail={locale === "de" ? "3 geeignet, 4 bedingt geeignet - vor 2 Stunden" : "3 suitable, 4 partially suitable - 2 hours ago"}
          />
          <ActivityItem
            icon={<FolderOpen className="h-4 w-4 text-moss" />}
            text={locale === "de" ? "Neues Projekt: Frontend-Relaunch" : "New project: frontend relaunch"}
            detail={locale === "de" ? "Erstellt von Demo-Benutzer - vor 5 Stunden" : "Created by demo user - 5 hours ago"}
          />
          <ActivityItem
            icon={<Users className="h-4 w-4 text-rust" />}
            text={locale === "de" ? "Kandidat hinzugefügt: Anna Schmidt" : "Candidate added: Anna Schmidt"}
            detail={locale === "de" ? "CV hochgeladen - gestern" : "CV uploaded - yesterday"}
          />
        </div>
      </Card>
    </div>
  );
}

function ActivityItem({ icon, text, detail }: { icon: React.ReactNode; text: string; detail: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-ink/5 bg-fog/30 p-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-ink">{text}</p>
        <p className="text-xs text-ink/60">{detail}</p>
      </div>
    </div>
  );
}
