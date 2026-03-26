"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, UserCircle, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillTree, mapCandidateSkillNodes } from "@/components/skill-tree";
import { analyzeCandidate } from "@/lib/mock-skillmapper";
import { toMockCandidateProfile } from "@/lib/ai/ui-adapters";
import type { CandidateExtractionResult } from "@/lib/ai/extraction";
import { fetchCandidateById, fetchMatchRunsForCandidate, fetchPostingById } from "@/lib/db/service";
import type { DbCandidate, DbMatchRun } from "@/lib/db/types";

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

export default function CandidateDetailPage() {
  const { t, locale } = useI18n();
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;

  const [candidate, setCandidate] = useState<DbCandidate | null>(null);
  const [matchRuns, setMatchRuns] = useState<Array<DbMatchRun & { postingTitle: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const candidateData = await fetchCandidateById(candidateId);
        setCandidate(candidateData);

        if (candidateData) {
          const runs = await fetchMatchRunsForCandidate(candidateId);
          const postingIds = [...new Set(runs.map((r) => r.posting_id))];
          const postingResults = await Promise.all(postingIds.map((id) => fetchPostingById(id)));
          const titleMap = new Map<string, string>();
          postingResults.forEach((p) => { if (p) titleMap.set(p.id, p.title); });
          setMatchRuns(runs.map((r) => ({ ...r, postingTitle: titleMap.get(r.posting_id) ?? "Unknown posting" })));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [candidateId]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 rounded-3xl bg-ink/5" />
        <div className="h-56 rounded-3xl bg-ink/5" />
      </div>
    );
  }

  const profile = candidate
    ? candidate.mapped_profile
      ? toMockCandidateProfile(
        candidate.mapped_profile as unknown as CandidateExtractionResult,
        candidate.full_name,
        candidate.extension_mode,
      )
      : analyzeCandidate(candidate.full_name, candidate.cv_raw_text ?? "", candidate.extension_mode)
    : null;

  if (!candidate || !profile) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
        <Card>
          <p className="text-sm text-ink/70">{locale === "de" ? "Bewerberprofil nicht gefunden." : "Candidate profile not found."}</p>
        </Card>
      </div>
    );
  }

  const allSkills = [...profile.hardSkills, ...profile.softSkills, ...profile.toolSkills, ...profile.certifications];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
      </div>

      <Card padding="lg">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-moss/10 text-2xl font-bold text-moss">
            {candidate.full_name.charAt(0)}
          </div>
          <div>
            <h1 className="font-heading text-3xl text-ink">{candidate.full_name}</h1>
            <p className="text-sm text-ink/60">{candidate.email}</p>
            <p className="text-xs text-ink/50">{locale === "de" ? `${candidate.location} - Verfügbar in ${candidate.availability_weeks} Wochen` : `${candidate.location} - Available in ${candidate.availability_weeks} weeks`}</p>
          </div>
          <Badge variant={candidate.mapped_profile ? "info" : "mock"}>{candidate.mapped_profile ? "AI" : "Mock"}</Badge>
        </div>
      </Card>

      <Card>
        <CardHeader title={locale === "de" ? "Einheitliches Bewerberprofil" : "Unified candidate profile"} />
        <ul className="mt-3 space-y-2 text-sm text-ink/75">
          <li>{locale === "de" ? "Kopfdaten: Name, E-Mail, Standort, Verfügbarkeit" : "Header data: name, email, location, availability"}</li>
          <li>{locale === "de" ? "Projektzeit gesamt" : "Total project time"}: {profile.header.totalProjectMonths} {locale === "de" ? "Monate" : "months"}</li>
          <li>{locale === "de" ? "Berechnete Erfahrung" : "Calculated experience"}: {profile.header.totalExperienceYears} {locale === "de" ? "Jahre" : "years"}</li>
          <li>{locale === "de" ? "Soft Skills" : "Soft skills"}: {profile.softSkills.length}</li>
          <li>{locale === "de" ? "Hard Skills" : "Hard skills"}: {profile.hardSkills.length}</li>
          <li>{locale === "de" ? "Toolkenntnisse" : "Tool skills"}: {profile.toolSkills.length}</li>
          <li>{locale === "de" ? "Zertifizierungen" : "Certifications"}: {profile.certifications.length}</li>
        </ul>
      </Card>

      <Card>
        <SkillTree title={locale === "de" ? "Bewerber-Skilltree (Skala 1-10)" : "Candidate skill tree (scale 1-10)"} nodes={mapCandidateSkillNodes(allSkills)} />
      </Card>

      {candidate.cv_raw_text && (
        <Card>
          <CardHeader title={locale === "de" ? "CV / Profil" : "CV / Profile"} action={<UserCircle className="h-5 w-5 text-ink/40" />} />
          <p className="mt-3 whitespace-pre-line rounded-lg bg-fog/40 p-4 text-sm text-ink/80">{candidate.cv_raw_text}</p>
        </Card>
      )}

      <Card>
        <CardHeader title={locale === "de" ? "Weitere Pflichtfelder im Benutzerprofil" : "Additional required profile fields"} />
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/75">
          <li>{locale === "de" ? "Sprachlevel je Sprache (z.B. Deutsch C1, Englisch B2)" : "Language proficiency per language (e.g. German C1, English B2)"}</li>
          <li>{locale === "de" ? "Vertrags- und Einsatzmodell (Freelance, Festanstellung, Teilzeit)" : "Contract and engagement model (freelance, permanent, part-time)"}</li>
          <li>{locale === "de" ? "Führungs- und Mentoring-Erfahrung" : "Leadership and mentoring experience"}</li>
          <li>{locale === "de" ? "Branchenpräferenzen und No-Go-Domänen" : "Industry preferences and excluded domains"}</li>
          <li>{locale === "de" ? "Reisebereitschaft und Onsite-Quote" : "Travel willingness and onsite ratio"}</li>
          <li>{locale === "de" ? "Tagessatz/Gehaltsband" : "Daily rate / salary band"}</li>
        </ul>
      </Card>

      <Card>
        <CardHeader title={locale === "de" ? "Erweiterung von Bewerberdaten" : "Candidate data extension"} />
        <p className="mt-3 text-sm text-ink/75">{locale === "de" ? `Modus: ${candidate.extension_mode}. Profildaten können zuerst gemockt, danach manuell + KI-gestützt erweitert werden.` : `Mode: ${candidate.extension_mode}. Profile data can be mocked first and then extended manually with AI assistance.`}</p>
        <p className="mt-2 text-sm text-ink/75">{locale === "de" ? "Vorschläge" : "Suggestions"}: {profile.additionalAttributes.join(", ")}</p>
      </Card>

      {/* Match history for this candidate */}
      <Card>
        <CardHeader
          title={locale === "de" ? "Matching-Ergebnisse" : "Match results"}
          subtitle={locale === "de" ? `${matchRuns.length} Matching-Läufe für diesen Kandidaten` : `${matchRuns.length} match runs for this candidate`}
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
                    <p className="font-semibold text-ink">{run.postingTitle}</p>
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

      <Card>
        <CardHeader title={locale === "de" ? "Aktionen" : "Actions"} />
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/matching?mode=single&candidate=${candidateId}`}>
            <Button>{locale === "de" ? "Einzelmatching vorbereiten" : "Prepare single matching"}</Button>
          </Link>
          <Button variant="secondary">{t("common.edit")}</Button>
        </div>
      </Card>
    </div>
  );
}
