"use client";

import Link from "next/link";
import { Plus, FolderOpen, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchProjects } from "@/lib/db/service";
import type { DbProject } from "@/lib/db/types";

const STATUS_VARIANTS: Record<string, "success" | "warning" | "default"> = {
  active: "success",
  draft: "warning",
  archived: "default",
};

export default function ProjectsPage() {
  const { t, locale } = useI18n();
  const [projects, setProjects] = useState<DbProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 rounded-3xl bg-ink/5" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-3xl bg-ink/5" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <CardHeader
          title={t("projects.title")}
          subtitle={t("projects.subtitle")}
          action={
            <Link href="/projects/new">
              <Button>
                <Plus className="h-4 w-4" />
                {t("projects.new")}
              </Button>
            </Link>
          }
        />
      </Card>

      {projects.length === 0 ? (
        <Card className="py-16 text-center">
          <FolderOpen className="mx-auto h-12 w-12 text-ink/20" />
          <p className="mt-4 text-lg font-semibold text-ink/60">{t("projects.noProjects")}</p>
          <p className="text-sm text-ink/40">{t("projects.createFirst")}</p>
          <Link href="/projects/new" className="mt-4 inline-block">
            <Button>{t("projects.new")}</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="h-full transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-moss" />
                    <Badge variant={STATUS_VARIANTS[project.status] ?? "default"}>
                      {t(`projects.${project.status}` as "projects.status")}
                    </Badge>
                  </div>
                  <button type="button" className="rounded-lg p-1 text-ink/40 hover:bg-ink/5 hover:text-ink">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <Link href={`/projects/${project.id}`} className="mt-3 block font-heading text-xl text-ink hover:text-moss">
                  {project.title}
                </Link>
                <p className="mt-1 line-clamp-2 text-sm text-ink/60">{project.description}</p>
                <p className="mt-2 text-xs text-ink/50">
                  {project.industry} - {project.duration_months} {locale === "de" ? "Monate" : "months"} - {project.phase}
                </p>
                <p className="mt-3 text-xs text-ink/40">{new Date(project.created_at).toLocaleDateString(locale === "de" ? "de-DE" : "en-US")}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <Link href={`/postings?project=${project.id}`}>
                    <Button size="sm">{locale === "de" ? "Ausschreibungen" : "Postings"}</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
