"use client";

import Link from "next/link";
import { Briefcase, ChevronRight, FolderOpen, Users, Zap, Plus, Settings, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PERMISSIONS } from "@/lib/auth/roles";
import { fetchDashboardActivity, fetchDashboardCounts, type DashboardActivityItem } from "@/lib/db/service";

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const { user, can, isLoading } = useAuth();

  const [counts, setCounts] = useState({ projects: 0, candidates: 0, activePostings: 0, recentMatches: 0 });
  const [activity, setActivity] = useState<DashboardActivityItem[]>([]);

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    fetchDashboardCounts().then(setCounts).catch(() => {});
    fetchDashboardActivity().then(setActivity).catch(() => setActivity([]));
  }, [isLoading, user]);

  const stats = [
    { icon: FolderOpen, label: t("dashboard.projectsCount", { count: counts.projects }), href: "/projects", color: "text-moss" },
    { icon: Briefcase, label: locale === "de" ? `${counts.activePostings} aktive Ausschreibungen` : `${counts.activePostings} active postings`, href: "/postings", color: "text-indigo-600" },
    { icon: Users, label: t("dashboard.candidatesCount", { count: counts.candidates }), href: "/candidates", color: "text-rust" },
    { icon: Zap, label: t("dashboard.matchesCount", { count: counts.recentMatches }), href: "/matching", color: "text-amber-600" },
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

      {/* Recent activity */}
      <Card>
        <CardHeader title={t("dashboard.recentActivity")} />
        <div className="mt-4 space-y-3">
          {activity.length === 0 ? (
            <div className="rounded-lg border border-ink/5 bg-fog/30 p-4 text-sm text-ink/60">
              {locale === "de" ? "Noch keine Aktivitäten vorhanden." : "No recent activity yet."}
            </div>
          ) : (
            activity.map((item) => (
              <ActivityItem
                key={item.id}
                href={item.href}
                isStale={Boolean(item.isStale)}
                icon={item.type === "match"
                  ? <Zap className="h-4 w-4 text-amber-600" />
                  : item.type === "project"
                    ? <FolderOpen className="h-4 w-4 text-moss" />
                    : item.type === "posting"
                      ? <Briefcase className="h-4 w-4 text-indigo-600" />
                      : <Users className="h-4 w-4 text-rust" />}
                text={localizeActivityTitle(item, locale)}
                detail={localizeActivityDetail(item, locale)}
              />
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function localizeActivityTitle(item: DashboardActivityItem, locale: "de" | "en") {
  if (locale === "en") {
    return item.title;
  }

  if (item.type === "match") {
    return item.title.replace("Match run for", "Matching für");
  }
  if (item.type === "project") {
    return item.title.replace("Project created:", "Projekt erstellt:");
  }
  if (item.type === "posting") {
    return item.title.replace("Posting updated:", "Ausschreibung aktualisiert:");
  }

  return item.title.replace("Candidate added:", "Kandidat hinzugefügt:");
}

function localizeActivityDetail(item: DashboardActivityItem, locale: "de" | "en") {
  const timeLabel = formatRelativeTime(item.created_at, locale);

  const localizedDetail = item.isStale
    ? (locale === "de"
      ? "Verknüpfte Daten wurden verändert oder sind nicht mehr vollständig verfügbar"
      : "Linked data has changed or is no longer fully available")
    : item.detail;

  if (locale === "en") {
    return `${localizedDetail} - ${timeLabel}`;
  }

  return `${localizedDetail
    .replace("score", "Score")
    .replace("New project record added", "Neuer Projektdatensatz hinzugefügt")
    .replace("Candidate profile is available for review", "Kandidatenprofil ist zur Prüfung verfügbar")
    .replace("Status:", "Status:")
  } - ${timeLabel}`;
}

function formatRelativeTime(value: string, locale: "de" | "en") {
  const timestamp = new Date(value).getTime();
  const now = Date.now();
  const diffMinutes = Math.round((timestamp - now) / 60000);
  const absMinutes = Math.abs(diffMinutes);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (absMinutes < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
}

function ActivityItem({
  icon,
  text,
  detail,
  href,
  isStale,
}: {
  icon: React.ReactNode;
  text: string;
  detail: string;
  href: string;
  isStale: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-lg border border-ink/5 bg-fog/30 p-3 transition hover:border-moss/20 hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss/40"
      aria-label={`${text} - ${detail}`}
    >
      <div className="mt-0.5">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{text}</p>
        <p className="text-xs text-ink/60">{detail}</p>
        {isStale && <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">Fallback navigation</p>}
      </div>
      <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink/30 transition group-hover:text-moss" />
    </Link>
  );
}
