"use client";

import Link from "next/link";
import { Briefcase, CircleDot, FolderOpen } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MockBadge } from "@/components/mock-badge";
import {
  MOCK_JOB_POSTINGS,
  MOCK_PROJECTS,
  getMockProjectById,
  getMockRoleById,
} from "@/lib/mock-records";

const STATUS_VARIANT: Record<string, "success" | "warning" | "error" | "info" | "mock"> = {
  active: "success",
  draft: "warning",
  paused: "info",
  closed: "error",
  filled: "success",
};

export default function PostingsPage() {
  const { locale } = useI18n();
  const searchParams = useSearchParams();
  const filterProjectId = searchParams.get("project");

  const postings = filterProjectId
    ? MOCK_JOB_POSTINGS.filter((p) => p.project_id === filterProjectId)
    : MOCK_JOB_POSTINGS;

  const filterProject = filterProjectId ? getMockProjectById(filterProjectId) : null;

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <CardHeader
          title={locale === "de" ? "Ausschreibungen" : "Job postings"}
          subtitle={
            filterProject
              ? locale === "de"
                ? `${postings.length} Ausschreibungen für „${filterProject.title}"`
                : `${postings.length} postings for "${filterProject.title}"`
              : locale === "de"
                ? `${postings.length} Ausschreibungen über alle Projekte`
                : `${postings.length} postings across all projects`
          }
          action={<MockBadge />}
        />

        {filterProject && (
          <div className="mt-3">
            <Link href="/postings">
              <Button variant="ghost" size="sm">
                {locale === "de" ? "× Filter aufheben" : "× Clear filter"}
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
            const project = getMockProjectById(posting.project_id);
            const role = getMockRoleById(posting.role_id);

            return (
              <Link key={posting.id} href={`/postings/${posting.id}`}>
                <Card className="h-full transition hover:shadow-lg hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CircleDot className="h-4 w-4 text-moss" />
                      <h3 className="font-semibold text-ink leading-snug">{posting.title}</h3>
                    </div>
                    <Badge variant={STATUS_VARIANT[posting.status] ?? "info"}>
                      {posting.status}
                    </Badge>
                  </div>

                  {posting.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-ink/60">{posting.description}</p>
                  )}

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
