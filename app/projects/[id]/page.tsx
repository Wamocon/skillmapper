"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Users, Zap, Briefcase, CircleDot } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillTree, mapRequirementNodes } from "@/components/skill-tree";
import { analyzeProject } from "@/lib/mock-skillmapper";
import { getMockProjectById, getMockRolesForProject, getMockPostingsForRole, getMockCandidateById } from "@/lib/mock-records";

const STATUS_VARIANT: Record<string, "success" | "warning" | "error" | "info" | "mock"> = {
  active: "success",
  draft: "warning",
  paused: "info",
  closed: "error",
  filled: "success",
};

export default function ProjectDetailPage() {
  const { t, locale } = useI18n();
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const project = getMockProjectById(projectId);
  const analysis = project ? analyzeProject(project.title, project.raw_text ?? project.description ?? "", project.extension_mode) : null;
  const roles = getMockRolesForProject(projectId);

  if (!project || !analysis) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
        <Card>
          <p className="text-sm text-ink/70">{locale === "de" ? "Projekt nicht gefunden." : "Project not found."}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
      </div>

      <Card padding="lg">
        <CardHeader title={project.title} subtitle={`${t("projects.sourceType")}: ${project.source_type}`} action={<Badge variant="success">{project.status}</Badge>} />
        <p className="mt-4 text-sm text-ink/70">{project.description}</p>
        <p className="mt-2 text-xs text-ink/40">{locale === "de" ? "Erstellt" : "Created"}: {new Date(project.created_at).toLocaleDateString(locale === "de" ? "de-DE" : "en-US")}</p>
      </Card>

      <Card>
        <CardHeader title={locale === "de" ? "Projekt-Kopfdaten und Rahmenbedingungen" : "Project header data and constraints"} />
        <ul className="mt-3 space-y-2 text-sm text-ink/80">
          <li>{locale === "de" ? "Dauer" : "Duration"}: {analysis.header.durationMonths} {locale === "de" ? "Monate" : "months"}</li>
          <li>{locale === "de" ? "Branche" : "Industry"}: {analysis.header.industry}</li>
          <li>{locale === "de" ? "Reifegrad" : "Maturity"}: {analysis.header.maturityLevel}</li>
          <li>{locale === "de" ? "Projektphase" : "Project phase"}: {analysis.header.projectPhase}</li>
          <li>{locale === "de" ? "Rahmenbedingungen" : "Constraints"}: {analysis.header.conditions.join(", ")}</li>
        </ul>
      </Card>

      {/* ── Roles & Postings ──────────────────────────────────────── */}
      <Card>
        <CardHeader
          title={locale === "de" ? "Rollen & Ausschreibungen" : "Roles & job postings"}
          subtitle={locale === "de" ? `${roles.length} Rollen in diesem Projekt` : `${roles.length} roles in this project`}
          action={
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-ink/40" />
            </div>
          }
        />

        {roles.length === 0 ? (
          <p className="mt-4 text-sm text-ink/50">{locale === "de" ? "Noch keine Rollen angelegt." : "No roles created yet."}</p>
        ) : (
          <div className="mt-4 space-y-4">
            {roles.map((role) => {
              const postings = getMockPostingsForRole(role.id);
              const assignedCandidate = role.assigned_candidate_id ? getMockCandidateById(role.assigned_candidate_id) : null;

              return (
                <div key={role.id} className="rounded-xl border border-ink/10 bg-fog/25 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-moss" />
                      <span className="font-semibold text-ink">{role.title}</span>
                    </div>
                    <Badge variant={role.fill_status === "filled" ? "success" : role.fill_status === "placeholder" ? "warning" : "info"}>
                      {role.fill_status === "filled"
                        ? locale === "de" ? "Besetzt" : "Filled"
                        : role.fill_status === "placeholder"
                          ? locale === "de" ? "Platzhalter" : "Placeholder"
                          : locale === "de" ? "Offen" : "Open"}
                    </Badge>
                  </div>

                  {role.description && <p className="mt-1 text-sm text-ink/60">{role.description}</p>}

                  {assignedCandidate && (
                    <p className="mt-2 text-xs text-ink/50">
                      {locale === "de" ? "Zugewiesen" : "Assigned"}: <Link href={`/candidates/${assignedCandidate.id}`} className="font-medium text-moss hover:underline">{assignedCandidate.full_name}</Link>
                    </p>
                  )}

                  {postings.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">{locale === "de" ? "Ausschreibungen" : "Job postings"}</p>
                      {postings.map((posting) => (
                        <Link
                          key={posting.id}
                          href={`/postings/${posting.id}`}
                          className="flex items-center justify-between rounded-lg border border-ink/5 bg-white p-3 transition hover:border-moss/30 hover:shadow-sm"
                        >
                          <div className="flex items-center gap-2">
                            <CircleDot className="h-3.5 w-3.5 text-ink/30" />
                            <span className="text-sm font-medium text-ink">{posting.title}</span>
                          </div>
                          <Badge variant={STATUS_VARIANT[posting.status] ?? "info"}>
                            {posting.status}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <SkillTree title={locale === "de" ? "Anforderungs-Skilltree (Muss rot / Kann blau)" : "Requirement skill tree (must-have red / optional blue)"} nodes={mapRequirementNodes(analysis.requirements)} />
      </Card>

      {project.raw_text && (
        <Card>
          <CardHeader title={locale === "de" ? "Projekttext" : "Project text"} action={<FileText className="h-5 w-5 text-ink/40" />} />
          <p className="mt-3 whitespace-pre-line rounded-lg bg-fog/40 p-4 text-sm text-ink/80">{project.raw_text}</p>
        </Card>
      )}

      <Card>
        <CardHeader title={locale === "de" ? "Erweiterung von Anforderungen" : "Requirement extension"} />
        <p className="mt-3 text-sm text-ink/75">{locale === "de" ? `Modus: ${project.extension_mode}. Attribute können zuerst gemockt und danach manuell + KI-gestützt erweitert werden.` : `Mode: ${project.extension_mode}. Attributes can be mocked first and then extended manually with AI assistance.`}</p>
        <p className="mt-2 text-sm text-ink/75">{locale === "de" ? "Empfohlene Zusatzattribute" : "Recommended additional attributes"}: {analysis.additionalAttributes.join(", ")}</p>
      </Card>

      <Card>
        <CardHeader title={locale === "de" ? "Aktionen" : "Actions"} />
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/postings?project=${projectId}`}>
            <Button>
              <Briefcase className="h-4 w-4" />
              {locale === "de" ? "Ausschreibungen verwalten" : "Manage postings"}
            </Button>
          </Link>
          <Button variant="secondary">{t("common.edit")}</Button>
        </div>
      </Card>
    </div>
  );
}
