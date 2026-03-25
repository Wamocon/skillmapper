"use client";

import Link from "next/link";
import { Briefcase, CircleDot, FolderOpen } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MockBadge } from "@/components/mock-badge";
import { fetchPostings, fetchProjectById, fetchRoleById } from "@/lib/db/service";
import type { DbJobPosting, DbProject, DbProjectRole } from "@/lib/db/types";

const STATUS_VARIANT: Record<string, "success" | "warning" | "error" | "info" | "mock"> = {
  active: "success",
  draft: "warning",
  paused: "info",
  closed: "error",
  filled: "success",
};

export function PostingsClientPage() {
  const { locale } = useI18n();
  const searchParams = useSearchParams();
  const filterProjectId = searchParams.get("project");

  const [postings, setPostings] = useState<DbJobPosting[]>([]);
  const [filterProject, setFilterProject] = useState<DbProject | null>(null);
  const [projectCache, setProjectCache] = useState<Record<string, DbProject>>({});
  const [roleCache, setRoleCache] = useState<Record<string, DbProjectRole>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchPostings(filterProjectId ?? undefined),
      filterProjectId ? fetchProjectById(filterProjectId) : Promise.resolve(null),
    ]).then(([data, proj]) => {
      setPostings(data);
      setFilterProject(proj);
      // Pre-fetch project and role details for cards
      const uniqueProjectIds = [...new Set(data.map((p) => p.project_id))];
      const uniqueRoleIds = [...new Set(data.map((p) => p.role_id))];
      Promise.all([
        ...uniqueProjectIds.map((id) => fetchProjectById(id)),
        ...uniqueRoleIds.map((id) => fetchRoleById(id)),
      ]).then((results) => {
        const pCache: Record<string, DbProject> = {};
        const rCache: Record<string, DbProjectRole> = {};
        results.forEach((item) => {
          if (!item) return;
          if ("source_type" in item) pCache[item.id] = item as DbProject;
          else rCache[item.id] = item as DbProjectRole;
        });
        setProjectCache(pCache);
        setRoleCache(rCache);
      });
    }).finally(() => setLoading(false));
  }, [filterProjectId]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 rounded-3xl bg-ink/5" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-2xl bg-ink/5" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <CardHeader
          title={locale === "de" ? "Ausschreibungen" : "Job postings"}
          subtitle={
            filterProject
              ? locale === "de"
                ? `${postings.length} Ausschreibungen fuer "${filterProject.title}"`
                : `${postings.length} postings for "${filterProject.title}"`
              : locale === "de"
                ? `${postings.length} Ausschreibungen ueber alle Projekte`
                : `${postings.length} postings across all projects`
          }
          action={<MockBadge />}
        />

        {filterProject && (
          <div className="mt-3">
            <Link href="/postings">
              <Button variant="ghost" size="sm">
                {locale === "de" ? "\u00d7 Filter aufheben" : "\u00d7 Clear filter"}
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {postings.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-sm text-ink/50">
            {locale === "de" ? "Keine Ausschreibungen vorhanden." : "No postings found."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {postings.map((posting) => {
            const project = projectCache[posting.project_id] ?? null;
            const role = roleCache[posting.role_id] ?? null;

            return (
              <Link key={posting.id} href={`/postings/${posting.id}`}>
                <Card className="h-full transition hover:shadow-lg hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CircleDot className="h-4 w-4 text-moss" />
                      <h3 className="font-semibold text-ink leading-snug">{posting.title}</h3>
                    </div>
                    <Badge variant={STATUS_VARIANT[posting.status] ?? "info"}>{posting.status}</Badge>
                  </div>

                  {posting.description && <p className="mt-2 line-clamp-2 text-sm text-ink/60">{posting.description}</p>}

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/50">
                    {project && (
                      <span className="flex items-center gap-1">
                        <FolderOpen className="h-3 w-3" /> {project.title}
                      </span>
                    )}
                    {role && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" /> {role.title}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-ink/35">
                    {posting.duration_months} {locale === "de" ? "Monate" : "months"} · {posting.industry}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
