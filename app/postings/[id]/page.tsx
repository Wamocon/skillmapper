"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, FileText, FolderOpen, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillTree, mapRequirementNodes } from "@/components/skill-tree";
import { analyzePosting } from "@/lib/mock-skillmapper";
import { toMockPostingAnalysis } from "@/lib/ai/ui-adapters";
import type { PostingExtractionResult } from "@/lib/ai/extraction";
import { fetchPostingById, fetchProjectById, fetchRoleById, fetchMatchRunsForPosting, fetchCandidateById } from "@/lib/db/service";
import type { DbJobPosting, DbProject, DbProjectRole, DbMatchRun, DbCandidate } from "@/lib/db/types";

function safeParseSummary(summary: unknown): Record<string, unknown> | null {
  if (!summary) return null;
  if (typeof summary === "object" && summary !== null) return summary as Record<string, unknown>;
  if (typeof summary !== "string") return null;
  try {
    const parsed = JSON.parse(summary);
    return typeof parsed === "object" && parsed !== null ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "error" | "info" | "mock"> = {
  active: "success",
  draft: "warning",
  paused: "info",
  closed: "error",
  filled: "success",
};

const STATUS_LABEL_DE: Record<string, string> = {
  draft: "Entwurf",
  active: "Aktiv",
  paused: "Pausiert",
  closed: "Geschlossen",
  filled: "Besetzt",
};

export default function PostingDetailPage() {
  const { locale } = useI18n();
  const params = useParams();
  const router = useRouter();
  const postingId = params.id as string;

  const [posting, setPosting] = useState<DbJobPosting | null>(null);
  const [project, setProject] = useState<DbProject | null>(null);
  const [role, setRole] = useState<DbProjectRole | null>(null);
  const [matchRuns, setMatchRuns] = useState<Array<DbMatchRun & { candidateName: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPostingById(postingId)
      .then(async (p) => {
        setPosting(p);
        if (!p) return;
        const [proj, roleData, runs] = await Promise.all([
          fetchProjectById(p.project_id),
          fetchRoleById(p.role_id),
          fetchMatchRunsForPosting(p.id),
        ]);
        setProject(proj);
        setRole(roleData);

        // Enrich match runs with candidate names
        const candidateIds = [...new Set(runs.map((r) => r.candidate_id))];
        const candidateResults = await Promise.all(candidateIds.map((id) => fetchCandidateById(id)));
        const nameMap = new Map<string, string>();
        candidateResults.forEach((c) => { if (c) nameMap.set(c.id, c.full_name); });
        setMatchRuns(runs.map((r) => ({ ...r, candidateName: nameMap.get(r.candidate_id) ?? "Unknown" })));
      })
      .finally(() => setLoading(false));
  }, [postingId]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 rounded-3xl bg-ink/5" />
        <div className="h-64 rounded-3xl bg-ink/5" />
      </div>
    );
  }

  const analysis = posting && role
    ? posting.mapped_profile
      ? toMockPostingAnalysis(
        posting.mapped_profile as unknown as PostingExtractionResult,
        posting.title,
        role.title,
        posting.extension_mode,
      )
      : analyzePosting(posting.title, posting.raw_text ?? posting.description ?? "", role.title, posting.extension_mode)
    : null;

  if (!posting || !project || !analysis) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          {locale === "de" ? "Zurück" : "Back"}
        </Button>
        <Card>
          <p className="text-sm text-ink/70">{locale === "de" ? "Ausschreibung nicht gefunden." : "Posting not found."}</p>
        </Card>
      </div>
    );
  }

  const isMatchable = posting.status === "active";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          {locale === "de" ? "Zurück" : "Back"}
        </Button>
      </div>

      {/* Header */}
      <Card padding="lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <CardHeader
            title={posting.title}
            subtitle={posting.description ?? ""}
            action={
              <Badge variant={STATUS_VARIANT[posting.status] ?? "info"}>
                {locale === "de" ? STATUS_LABEL_DE[posting.status] ?? posting.status : posting.status}
              </Badge>
            }
          />
          <Badge variant={posting.mapped_profile ? "info" : "mock"}>{posting.mapped_profile ? "AI" : "Mock"}</Badge>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-ink/60">
          <span className="flex items-center gap-1"><FolderOpen className="h-4 w-4" /> <Link href={`/projects/${project.id}`} className="font-medium text-moss hover:underline">{project.title}</Link></span>
          {role && <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {role.title}</span>}
        </div>

        <p className="mt-2 text-xs text-ink/40">
          {locale === "de" ? "Erstellt" : "Created"}: {new Date(posting.created_at).toLocaleDateString(locale === "de" ? "de-DE" : "en-US")}
        </p>
      </Card>

      {/* Inherited project context */}
      <Card>
        <CardHeader
          title={locale === "de" ? "Vererbter Projektkontext" : "Inherited project context"}
          subtitle={locale === "de" ? "Diese Daten werden vom Projekt übernommen" : "This data is inherited from the project"}
        />
        <ul className="mt-3 space-y-2 text-sm text-ink/80">
          <li>{locale === "de" ? "Projekt" : "Project"}: <span className="font-medium">{project.title}</span></li>
          <li>{locale === "de" ? "Dauer" : "Duration"}: {analysis.header.durationMonths} {locale === "de" ? "Monate" : "months"}</li>
          <li>{locale === "de" ? "Branche" : "Industry"}: {analysis.header.industry}</li>
          <li>{locale === "de" ? "Projektphase" : "Project phase"}: {analysis.header.projectPhase}</li>
          <li>{locale === "de" ? "Rahmenbedingungen" : "Constraints"}: {analysis.header.conditions.join(", ")}</li>
          {posting.priority && <li>{locale === "de" ? "Priorität" : "Priority"}: <Badge variant={posting.priority === "high" ? "error" : posting.priority === "medium" ? "warning" : "info"}>{posting.priority === "high" ? (locale === "de" ? "Hoch" : "High") : posting.priority === "medium" ? (locale === "de" ? "Mittel" : "Medium") : (locale === "de" ? "Niedrig" : "Low")}</Badge></li>}
        </ul>
      </Card>

      {/* Skill requirements from the posting */}
      <Card>
        <SkillTree
          title={locale === "de" ? "Skill-Anforderungen der Ausschreibung (Muss rot / Kann blau)" : "Posting skill requirements (required red / optional blue)"}
          nodes={mapRequirementNodes(analysis.requirements)}
        />
      </Card>

      {/* Posting raw text */}
      {posting.raw_text && (
        <Card>
          <CardHeader
            title={locale === "de" ? "Ausschreibungstext" : "Posting text"}
            action={<FileText className="h-5 w-5 text-ink/40" />}
          />
          <p className="mt-3 whitespace-pre-line rounded-lg bg-fog/40 p-4 text-sm text-ink/80">{posting.raw_text}</p>
        </Card>
      )}

      {/* Extension info */}
      <Card>
        <CardHeader title={locale === "de" ? "Erweiterungsmodus" : "Extension mode"} />
        <p className="mt-3 text-sm text-ink/75">
          {locale === "de"
            ? `Modus: ${posting.extension_mode}. Attribute können zuerst gemockt und danach manuell + KI-gestützt erweitert werden.`
            : `Mode: ${posting.extension_mode}. Attributes can be mocked first and then extended manually with AI assistance.`}
        </p>
      </Card>

      {/* Match history */}
      <Card>
        <CardHeader
          title={locale === "de" ? "Matching-Ergebnisse" : "Match results"}
          subtitle={locale === "de" ? `${matchRuns.length} Matching-Läufe für diese Ausschreibung` : `${matchRuns.length} match runs for this posting`}
          action={<Zap className="h-5 w-5 text-amber-600" />}
        />
        {matchRuns.length === 0 ? (
          <p className="mt-4 text-sm text-ink/50">{locale === "de" ? "Noch keine Matching-Ergebnisse vorhanden." : "No match results yet."}</p>
        ) : (
          <div className="mt-4 space-y-2">
            {matchRuns.map((run) => {
              const summaryData = run.summary
                ? safeParseSummary(run.summary)
                : null;
              const recommendation = summaryData?.recommendation as string | undefined;

              return (
                <Link
                  key={run.id}
                  href={`/matching?matchRun=${run.id}`}
                  className="flex items-center justify-between rounded-xl border border-ink/10 bg-fog/25 p-4 transition hover:border-moss/30 hover:bg-white hover:shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-ink">{run.candidateName}</p>
                    <p className="mt-1 text-xs text-ink/50">
                      {new Date(run.created_at).toLocaleDateString(locale === "de" ? "de-DE" : "en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-heading text-xl text-ink">{run.score}%</span>
                    {recommendation && (
                      <Badge variant={recommendation === "geeignet" ? "success" : recommendation === "bedingt geeignet" ? "warning" : "error"}>
                        {recommendation === "geeignet"
                          ? locale === "de" ? "Geeignet" : "Suitable"
                          : recommendation === "bedingt geeignet"
                            ? locale === "de" ? "Bedingt" : "Partial"
                            : locale === "de" ? "Nicht geeignet" : "Not suitable"}
                      </Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader title={locale === "de" ? "Aktionen" : "Actions"} />
        <div className="mt-4 flex flex-wrap gap-3">
          {isMatchable ? (
            <>
              <Link href={`/matching?posting=${posting.id}&mode=single`}>
                <Button>
                  <Zap className="h-4 w-4" />
                  {locale === "de" ? "Einzelmatching" : "Single matching"}
                </Button>
              </Link>
              <Link href={`/matching?posting=${posting.id}&mode=batch`}>
                <Button variant="secondary">
                  <Zap className="h-4 w-4" />
                  {locale === "de" ? "Mehrfach-Matching" : "Batch matching"}
                </Button>
              </Link>
            </>
          ) : (
            <p className="text-sm text-ink/50">
              {locale === "de"
                ? "Matching ist nur für aktive Ausschreibungen verfügbar."
                : "Matching is only available for active postings."}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
