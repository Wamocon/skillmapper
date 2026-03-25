"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, CircleDot, FolderOpen, Layers3, UserRound, Users, Zap } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { useNotifications } from "@/lib/notifications/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import { MockBadge } from "@/components/mock-badge";
import { CandidatePicker } from "@/components/candidate-picker";
import { BatchResults } from "@/components/batch-results";
import { SkillTree, mapCandidateSkillNodes, mapRequirementNodes } from "@/components/skill-tree";
import {
  analyzeCandidate,
  analyzePosting,
  calculateMatch,
  generateInterviewQuestions,
  runBatchMatchForPosting,
  type BatchMatchEntry,
  type CandidateProfile,
  type InterviewQuestion,
  type MatchResult,
  type PostingAnalysis,
} from "@/lib/mock-skillmapper";
import {
  fetchActivePostings,
  fetchCandidates,
  fetchProjectById,
  fetchRoleById,
} from "@/lib/db/service";
import type { DbCandidate, DbJobPosting, DbProject, DbProjectRole } from "@/lib/db/types";

type MatchMode = "single" | "batch";
type View = "setup" | "single-results" | "batch-results";

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-fog/25 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">{label}</p>
      <p className="mt-1 font-heading text-2xl text-ink">{value}</p>
    </div>
  );
}

function RecommendationBadge({ recommendation }: { recommendation: MatchResult["recommendation"] }) {
  const { locale } = useI18n();

  if (recommendation === "geeignet") {
    return <Badge variant="success">{locale === "de" ? "Geeignet" : "Suitable"}</Badge>;
  }

  if (recommendation === "bedingt geeignet") {
    return <Badge variant="warning">{locale === "de" ? "Bedingt geeignet" : "Partially suitable"}</Badge>;
  }

  return <Badge variant="error">{locale === "de" ? "Nicht geeignet" : "Not suitable"}</Badge>;
}

function SingleMatchResults({
  postingTitle,
  candidateName,
  postingAnalysis,
  candidateProfile,
  matchResult,
  questions,
  onBack,
}: {
  postingTitle: string;
  candidateName: string;
  postingAnalysis: PostingAnalysis;
  candidateProfile: CandidateProfile;
  matchResult: MatchResult;
  questions: InterviewQuestion[];
  onBack: () => void;
}) {
  const { locale } = useI18n();
  const allCandidateSkills = [
    ...candidateProfile.hardSkills,
    ...candidateProfile.softSkills,
    ...candidateProfile.toolSkills,
    ...candidateProfile.certifications,
  ];

  const criticalGaps = matchResult.details.filter((detail) => detail.requirement.mustHave && detail.status === "gap").length;

  return (
    <div className="space-y-5">
      <Card padding="lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <CardHeader
            title={locale === "de" ? `Einzelmatching: ${candidateName}` : `Single matching: ${candidateName}`}
            subtitle={`${postingTitle} · ${matchResult.totalScore}% Score`}
            action={<RecommendationBadge recommendation={matchResult.recommendation} />}
          />
          <div className="flex items-center gap-3">
            <MockBadge />
            <Button variant="secondary" onClick={onBack}>
              {locale === "de" ? "Zurück zur Auswahl" : "Back to selection"}
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <SummaryStat label="Score" value={`${matchResult.totalScore}%`} />
          <SummaryStat label={locale === "de" ? "Pflicht-Lücken" : "Must-have gaps"} value={criticalGaps} />
          <SummaryStat label={locale === "de" ? "Treffer" : "Matches"} value={matchResult.overlaps.length} />
          <SummaryStat label={locale === "de" ? "Lücken" : "Gaps"} value={matchResult.gaps.length} />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SkillTree title={locale === "de" ? "Anforderungen der Ausschreibung" : "Posting requirements"} nodes={mapRequirementNodes(postingAnalysis.requirements)} />
        </Card>
        <Card>
          <SkillTree title={locale === "de" ? "Bewerber-Skills" : "Candidate skills"} nodes={mapCandidateSkillNodes(allCandidateSkills)} />
        </Card>
      </div>

      <Card>
        <CardHeader title={locale === "de" ? "Warum dieser Score?" : "Why this score?"} />
        <div className="mt-4 space-y-2">
          {matchResult.scoreReasons
            .filter((reason) => !reason.key.startsWith("detail-"))
            .map((reason) => (
              <div
                key={reason.key}
                className="rounded-xl border border-ink/10 bg-fog/25 p-4"
              >
                <p className="font-semibold text-ink">{reason.title}</p>
                <p className="mt-1 text-sm text-ink/65">{reason.detail}</p>
              </div>
            ))}
        </div>
      </Card>

      <Card>
        <CardHeader title={locale === "de" ? "Anforderungsabgleich" : "Requirement comparison"} subtitle={locale === "de" ? "Ziellevel, Istlevel und Status pro Anforderung" : "Target level, current level, and status for each requirement"} />
        <div className="mt-4 space-y-2">
          {matchResult.details.map((detail) => (
            <div
              key={detail.requirement.id}
              className="rounded-xl border border-ink/10 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink">{detail.requirement.name}</p>
                    <Badge variant={detail.requirement.mustHave ? "error" : "info"}>
                      {detail.requirement.mustHave ? (locale === "de" ? "Pflicht" : "Required") : (locale === "de" ? "Optional" : "Optional")}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink/50">
                    {detail.requirement.category} · {locale === "de" ? "Ziellevel" : "Target level"} {detail.requirement.targetLevel}/10
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {detail.matchedSkill && (
                    <span className="text-sm text-ink/60">
                      {locale === "de" ? "Kandidat" : "Candidate"}: {detail.matchedSkill.level}/10
                    </span>
                  )}
                  <Badge
                    variant={
                      detail.status === "matched"
                        ? "success"
                        : detail.status === "partial"
                          ? "warning"
                          : "error"
                    }
                  >
                    {detail.status === "matched"
                      ? locale === "de" ? "Treffer" : "Match"
                      : detail.status === "partial"
                        ? locale === "de" ? "Teilweise" : "Partial"
                        : locale === "de" ? "Lücke" : "Gap"}
                  </Badge>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink/65">{detail.requirement.evidence}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title={locale === "de" ? "Interviewfragen" : "Interview questions"} subtitle={locale === "de" ? "Automatisch aus Treffern und Lücken abgeleitet" : "Automatically derived from matches and gaps"} />
        <div className="mt-4 space-y-2">
          {questions.map((question) => (
            <div key={question.id} className="rounded-xl border border-ink/10 bg-fog/25 p-4">
              <p className="font-semibold text-ink">{question.question}</p>
              <p className="mt-1 text-sm text-ink/60">{locale === "de" ? "Ziel" : "Goal"}: {question.goal}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function MatchingPage() {
  const searchParams = useSearchParams();
  const { locale } = useI18n();
  const { push } = useNotifications();

  const initialMode = searchParams.get("mode");
  const initialPostingId = searchParams.get("posting") ?? "";
  const [selectedPostingId, setSelectedPostingId] = useState(initialPostingId);
  const [mode, setMode] = useState<MatchMode | null>(initialMode === "single" || initialMode === "batch" ? initialMode : null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(searchParams.get("candidate") ?? "");
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set());
  const [view, setView] = useState<View>("setup");
  const [loading, setLoading] = useState(false);

  const [singlePostingAnalysis, setSinglePostingAnalysis] = useState<PostingAnalysis | null>(null);
  const [singleCandidateProfile, setSingleCandidateProfile] = useState<CandidateProfile | null>(null);
  const [singleMatchResult, setSingleMatchResult] = useState<MatchResult | null>(null);
  const [singleQuestions, setSingleQuestions] = useState<InterviewQuestion[]>([]);

  const [batchPostingAnalysis, setBatchPostingAnalysis] = useState<PostingAnalysis | null>(null);
  const [batchResults, setBatchResults] = useState<BatchMatchEntry[]>([]);

  const [activePostings, setActivePostings] = useState<DbJobPosting[]>([]);
  const [candidates, setCandidates] = useState<DbCandidate[]>([]);
  const [projectById, setProjectById] = useState<Record<string, DbProject>>({});
  const [roleById, setRoleById] = useState<Record<string, DbProjectRole>>({});

  useEffect(() => {
    Promise.all([fetchActivePostings(), fetchCandidates()]).then(async ([postings, dbCandidates]) => {
      setActivePostings(postings);
      setCandidates(dbCandidates);

      const projectIds = [...new Set(postings.map((p) => p.project_id))];
      const roleIds = [...new Set(postings.map((p) => p.role_id))];

      const [projects, roles] = await Promise.all([
        Promise.all(projectIds.map((id) => fetchProjectById(id))),
        Promise.all(roleIds.map((id) => fetchRoleById(id))),
      ]);

      const pMap: Record<string, DbProject> = {};
      const rMap: Record<string, DbProjectRole> = {};
      projects.forEach((p) => {
        if (p) pMap[p.id] = p;
      });
      roles.forEach((r) => {
        if (r) rMap[r.id] = r;
      });

      setProjectById(pMap);
      setRoleById(rMap);
    });
  }, []);

  const selectedPosting: DbJobPosting | null = useMemo(
    () => activePostings.find((p) => p.id === selectedPostingId) ?? null,
    [activePostings, selectedPostingId],
  );
  const selectedRole = selectedPosting ? roleById[selectedPosting.role_id] ?? null : null;
  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedCandidateId) ?? null;

  const canRunSingle = Boolean(selectedPosting && selectedCandidate);
  const canRunBatch = Boolean(selectedPosting) && selectedCandidateIds.size > 0;

  async function handleRunSingle() {
    if (!selectedPosting || !selectedCandidate || !selectedRole) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 450));

    const pAnalysis = analyzePosting(
      selectedPosting.title,
      selectedPosting.raw_text ?? selectedPosting.description ?? "",
      selectedRole.title,
      selectedPosting.extension_mode,
    );
    const candidateProfile = analyzeCandidate(
      selectedCandidate.full_name,
      selectedCandidate.cv_raw_text ?? "",
      selectedCandidate.extension_mode,
    );
    const candidateSkills = [
      ...candidateProfile.hardSkills,
      ...candidateProfile.softSkills,
      ...candidateProfile.toolSkills,
      ...candidateProfile.certifications,
    ];
    const matchResult = calculateMatch(pAnalysis.requirements, candidateSkills);
    const interviewQuestions = generateInterviewQuestions(matchResult);

    setSinglePostingAnalysis(pAnalysis);
    setSingleCandidateProfile(candidateProfile);
    setSingleMatchResult(matchResult);
    setSingleQuestions(interviewQuestions);
    setView("single-results");
    setLoading(false);

    push(
      "success",
      locale === "de" ? "Einzelmatching abgeschlossen" : "Single matching completed",
      `${selectedCandidate.full_name} · ${matchResult.totalScore}%`,
    );
  }

  async function handleRunBatch() {
    if (!selectedPosting || !selectedRole) return;

    setLoading(true);
    const candidatesForBatch = candidates.filter((candidate) => selectedCandidateIds.has(candidate.id)).map((candidate) => ({
      id: candidate.id,
      name: candidate.full_name,
      location: candidate.location ?? "Unknown",
      availabilityWeeks: candidate.availability_weeks,
      totalProjectMonths: candidate.total_project_months,
      cvText: candidate.cv_raw_text ?? "",
      extensionMode: candidate.extension_mode,
    }));

    await new Promise((resolve) => setTimeout(resolve, Math.min(1200, candidatesForBatch.length * 70)));

    const result = runBatchMatchForPosting(
      selectedPosting.title,
      selectedPosting.raw_text ?? selectedPosting.description ?? "",
      selectedRole.title,
      selectedPosting.extension_mode,
      candidatesForBatch,
    );

    setBatchPostingAnalysis(result.postingAnalysis);
    setBatchResults(result.entries);
    setView("batch-results");
    setLoading(false);

    push(
      "success",
      locale === "de" ? "Mehrfach-Matching abgeschlossen" : "Batch matching completed",
      locale === "de" ? `${result.entries.length} Bewerber analysiert` : `${result.entries.length} candidates analyzed`,
    );
  }

  if (view === "single-results" && selectedPosting && selectedCandidate && singlePostingAnalysis && singleCandidateProfile && singleMatchResult) {
    return (
      <SingleMatchResults
        postingTitle={selectedPosting.title}
        candidateName={selectedCandidate.full_name}
        postingAnalysis={singlePostingAnalysis}
        candidateProfile={singleCandidateProfile}
        matchResult={singleMatchResult}
        questions={singleQuestions}
        onBack={() => setView("setup")}
      />
    );
  }

  if (view === "batch-results" && selectedPosting && batchPostingAnalysis && batchResults.length > 0) {
    return (
      <BatchResults
        projectTitle={selectedPosting.title}
        projectAnalysis={batchPostingAnalysis}
        entries={batchResults}
        onBack={() => setView("setup")}
      />
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <Card padding="lg">
        <CardHeader
          title={locale === "de" ? "Matching Hub" : "Matching hub"}
          subtitle={
            locale === "de"
              ? "Wählen Sie eine aktive Ausschreibung und starten Sie Einzel- oder Mehrfach-Matching gegen die dort definierten Anforderungen."
              : "Select an active posting and start single or batch matching against the requirements defined there."
          }
          action={<MockBadge />}
        />
      </Card>

      {/* Step 1: Select posting */}
      <Card>
        <CardHeader
          title={locale === "de" ? "1. Ausschreibung wählen" : "1. Select posting"}
          subtitle={
            locale === "de"
              ? "Die Ausschreibung enthält die Skill-Anforderungen und erbt den Projektkontext."
              : "The posting contains the skill requirements and inherits the project context."
          }
        />
        {activePostings.length === 0 ? (
          <p className="mt-4 text-sm text-ink/50">{locale === "de" ? "Keine aktiven Ausschreibungen vorhanden." : "No active postings available."}</p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activePostings.map((posting) => {
              const isActive = posting.id === selectedPostingId;
              const project = projectById[posting.project_id];

              return (
                <button
                  key={posting.id}
                  type="button"
                  onClick={() => {
                    setSelectedPostingId(posting.id);
                    setSelectedCandidateId("");
                    setSelectedCandidateIds(new Set());
                    setView("setup");
                  }}
                  className={
                    isActive
                      ? "rounded-2xl border border-moss/40 bg-moss/5 p-4 text-left ring-2 ring-moss/20"
                      : "rounded-2xl border border-ink/10 bg-white p-4 text-left transition hover:border-ink/20 hover:bg-fog/20"
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <CircleDot className={isActive ? "h-5 w-5 text-moss" : "h-5 w-5 text-ink/35"} />
                    {isActive && <Badge variant="success">{locale === "de" ? "Ausgewählt" : "Selected"}</Badge>}
                  </div>
                  <p className="mt-3 font-semibold text-ink">{posting.title}</p>
                  {posting.description && <p className="mt-1 line-clamp-2 text-sm text-ink/60">{posting.description}</p>}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/55">
                    {project && <span className="rounded-full border border-ink/10 bg-fog/40 px-2 py-1"><FolderOpen className="mr-1 inline h-3 w-3" />{project.title}</span>}
                    <span className="rounded-full border border-ink/10 bg-fog/40 px-2 py-1">{posting.industry}</span>
                    <span className="rounded-full border border-ink/10 bg-fog/40 px-2 py-1">{posting.duration_months} {locale === "de" ? "Monate" : "months"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* Step 2: Select mode */}
      {selectedPosting && (
        <Card>
          <CardHeader
            title={locale === "de" ? "2. Modus wählen" : "2. Select mode"}
            subtitle={
              locale === "de"
                ? "Nach der Auswahl der Ausschreibung in den Einzel- oder Batch-Ablauf wechseln."
                : "After selecting the posting, switch into the single or batch workflow."
            }
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode("single")}
              className={
                mode === "single"
                  ? "rounded-2xl border border-moss/40 bg-moss/5 p-5 text-left ring-2 ring-moss/20"
                  : "rounded-2xl border border-ink/10 bg-white p-5 text-left transition hover:border-ink/20 hover:bg-fog/20"
              }
            >
              <div className="flex items-center gap-3">
                <UserRound className="h-5 w-5 text-moss" />
                <p className="font-semibold text-ink">{locale === "de" ? "Einzelmatching" : "Single matching"}</p>
              </div>
              <p className="mt-2 text-sm text-ink/65">
                {locale === "de"
                  ? "Einen Kandidaten gegen die Ausschreibung vergleichen, inklusive Detailanalyse und Interviewfragen."
                  : "Compare one candidate against the posting, including detailed analysis and interview questions."}
              </p>
            </button>
            <button
              type="button"
              onClick={() => setMode("batch")}
              className={
                mode === "batch"
                  ? "rounded-2xl border border-moss/40 bg-moss/5 p-5 text-left ring-2 ring-moss/20"
                  : "rounded-2xl border border-ink/10 bg-white p-5 text-left transition hover:border-ink/20 hover:bg-fog/20"
              }
            >
              <div className="flex items-center gap-3">
                <Layers3 className="h-5 w-5 text-rust" />
                <p className="font-semibold text-ink">{locale === "de" ? "Mehrfach-Matching" : "Batch matching"}</p>
              </div>
              <p className="mt-2 text-sm text-ink/65">
                {locale === "de"
                  ? "Mehrere Kandidaten in einem Lauf gegen die Ausschreibung analysieren, sortieren und vergleichen."
                  : "Analyze, sort, and compare multiple candidates against the posting in one run."}
              </p>
            </button>
          </div>
        </Card>
      )}

      {/* Step 3: Single candidate selection */}
      {selectedPosting && mode === "single" && (
        <Card>
          <CardHeader
            title={locale === "de" ? "3. Kandidat für Einzelmatching wählen" : "3. Select candidate for single matching"}
            subtitle={
              locale === "de"
                ? "Ein Bewerber wird gegen die Anforderungen der Ausschreibung analysiert."
                : "One candidate is analyzed against the posting requirements."
            }
          />
          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
            <div className="space-y-4">
              <Select
                label={locale === "de" ? "Kandidat auswählen" : "Select candidate"}
                value={selectedCandidateId}
                onChange={(event) => setSelectedCandidateId(event.target.value)}
              >
                <option value="">{locale === "de" ? "-- Kandidat auswählen --" : "-- Select candidate --"}</option>
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.full_name} · {candidate.location}
                  </option>
                ))}
              </Select>
              <div className="rounded-2xl border border-ink/10 bg-fog/25 p-4 text-sm text-ink/65">
                {locale === "de"
                  ? "Einzelmatching eignet sich für Tiefenanalysen inklusive Gap-Prüfung, Skillabgleich und Interviewleitfaden."
                  : "Single matching is suited for deep analysis including gap checks, skill comparison, and interview guidance."}
              </div>
            </div>
            {selectedCandidate ? (
              <div className="rounded-2xl border border-ink/10 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">{locale === "de" ? "Vorschau" : "Preview"}</p>
                <h3 className="mt-2 font-heading text-2xl text-ink">{selectedCandidate.full_name}</h3>
                <p className="mt-1 text-sm text-ink/60">{selectedCandidate.email}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink/55">
                  <span className="rounded-full border border-ink/10 bg-fog/40 px-2 py-1">{selectedCandidate.location}</span>
                  <span className="rounded-full border border-ink/10 bg-fog/40 px-2 py-1">
                    {locale === "de" ? `in ${selectedCandidate.availability_weeks} Wochen` : `in ${selectedCandidate.availability_weeks} weeks`}
                  </span>
                  <span className="rounded-full border border-ink/10 bg-fog/40 px-2 py-1">
                    {selectedCandidate.total_project_months} {locale === "de" ? "Projektmonate" : "project months"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-ink/20 bg-fog/15 p-5 text-sm text-ink/50">
                {locale === "de" ? "Wählen Sie einen Kandidaten aus, um den Einzelvergleich vorzubereiten." : "Select a candidate to prepare the single comparison."}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Step 3: Batch candidate selection */}
      {selectedPosting && mode === "batch" && (
        <Card>
          <CardHeader
            title={locale === "de" ? "3. Kandidaten für Mehrfach-Matching wählen" : "3. Select candidates for batch matching"}
            subtitle={
              locale === "de"
                ? "Filter, Multiselect und Stapel-Analyse gegen die Ausschreibung."
                : "Filtering, multi-select, and batch analysis against the posting."
            }
            action={<Badge variant="info">{selectedCandidateIds.size} {locale === "de" ? "ausgewählt" : "selected"}</Badge>}
          />
          <div className="mt-5">
            <CandidatePicker
              candidates={candidates}
              selectedIds={selectedCandidateIds}
              onSelectionChange={setSelectedCandidateIds}
              disabled={loading}
            />
          </div>
        </Card>
      )}

      {/* Sticky action bar */}
      {(canRunSingle || canRunBatch) && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-ink/10 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:left-64">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-ink">{selectedPosting?.title}</p>
              <p className="text-sm text-ink/55">
                {mode === "single"
                  ? selectedCandidate
                    ? (locale === "de" ? `Einzelmatching bereit für ${selectedCandidate.full_name}` : `Single matching ready for ${selectedCandidate.full_name}`)
                    : (locale === "de" ? "Einzelmatching vorbereiten" : "Prepare single matching")
                  : locale === "de"
                    ? `${selectedCandidateIds.size} Bewerber für Mehrfach-Matching ausgewählt`
                    : `${selectedCandidateIds.size} candidates selected for batch matching`}
              </p>
            </div>
            <Button
              size="lg"
              disabled={loading || (mode === "single" ? !canRunSingle : !canRunBatch)}
              onClick={mode === "single" ? handleRunSingle : handleRunBatch}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {locale === "de" ? "Analysiere..." : "Analyzing..."}
                </>
              ) : (
                <>
                  {mode === "single" ? <Zap className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                  {mode === "single"
                    ? (locale === "de" ? "Einzelmatching starten" : "Start single matching")
                    : (locale === "de" ? "Mehrfach-Matching starten" : "Start batch matching")}
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
