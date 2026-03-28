"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ChevronRight, CircleDot, FolderOpen, Layers3, UserRound, Users, X, Zap } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { useNotifications } from "@/lib/notifications/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import { CandidatePicker } from "@/components/candidate-picker";
import { BatchResults } from "@/components/batch-results";
import { SkillTree, mapCandidateSkillNodes, mapRequirementNodes } from "@/components/skill-tree";
import {
  type BatchMatchEntry,
  type CandidateProfile,
  type InterviewQuestion,
  type MatchResult,
  type PostingAnalysis,
} from "@/lib/mock-skillmapper";
import {
  extractCandidateViaApi,
  extractPostingViaApi,
  generateInterviewQuestionsViaApi,
  runBatchMatchViaApi,
  runSingleMatchViaApi,
  AIRequestError,
} from "@/lib/ai/client";
import { fromStoredMatchSummary, toBatchEntries, toMockCandidateProfile, toMockInterviewQuestions, toMockMatchResult, toMockPostingAnalysis } from "@/lib/ai/ui-adapters";
import type { CandidateExtractionResult, PostingExtractionResult } from "@/lib/ai/extraction";
import {
  fetchActivePostings,
  fetchCandidateById,
  fetchCandidates,
  fetchMatchRunById,
  fetchPostingById,
  fetchProjectById,
  fetchRoleById,
  fetchInterviewSetsForMatchRun,
  fetchQuestionsForSet,
} from "@/lib/db/service";
import type { DbCandidate, DbJobPosting, DbProject, DbProjectRole } from "@/lib/db/types";

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

type MatchMode = "single" | "batch";
type View = "setup" | "single-results" | "batch-results";
type ActionFeedback = {
  type: "error" | "warning";
  title: string;
  detail: string;
};

function AIBadge({ label = "AI" }: { label?: string }) {
  return <Badge variant="info">{label}</Badge>;
}

function ActionFeedbackBanner({ feedback, onDismiss }: { feedback: ActionFeedback; onDismiss: () => void }) {
  const isError = feedback.type === "error";

  return (
    <div className="fixed inset-x-0 bottom-24 z-40 px-4">
      <div className="mx-auto max-w-3xl">
        <div className={isError
          ? "flex items-start gap-3 rounded-2xl border border-rust/30 bg-white/95 p-4 shadow-2xl backdrop-blur"
          : "flex items-start gap-3 rounded-2xl border border-amber-300 bg-white/95 p-4 shadow-2xl backdrop-blur"}
        >
          <div className={isError ? "rounded-full bg-rust/10 p-2 text-rust" : "rounded-full bg-amber-100 p-2 text-amber-700"}>
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">{feedback.title}</p>
            <p className="mt-1 text-sm leading-6 text-ink/70 whitespace-pre-wrap break-words">{feedback.detail}</p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg p-1 text-ink/45 transition hover:bg-ink/5 hover:text-ink"
            aria-label="Dismiss message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

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
  onRerun,
}: {
  postingTitle: string;
  candidateName: string;
  postingAnalysis: PostingAnalysis;
  candidateProfile: CandidateProfile;
  matchResult: MatchResult;
  questions: InterviewQuestion[];
  onBack: () => void;
  onRerun: () => void;
}) {
  const { locale } = useI18n();
  const allCandidateSkills = [
    ...candidateProfile.hardSkills,
    ...candidateProfile.softSkills,
    ...candidateProfile.toolSkills,
    ...candidateProfile.certifications,
  ];

  const criticalGaps = matchResult.details.filter((detail) => detail.requirement.mustHave && detail.status === "gap").length;
  const mustRequirements = matchResult.details.filter((detail) => detail.requirement.mustHave);
  const mustCoverage = mustRequirements.length === 0
    ? 100
    : Math.round((mustRequirements.filter((detail) => detail.status === "matched" || detail.status === "partial").length / mustRequirements.length) * 100);
  const needsReview = matchResult.details.some((detail) => detail.requirement.mustHave && detail.status === "partial");

  return (
    <div className="space-y-5">
      <Card padding="lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <CardHeader
            title={locale === "de" ? `Einzelmatching: ${candidateName}` : `Single matching: ${candidateName}`}
            subtitle={`${postingTitle} · ${matchResult.totalScore}% ${locale === "de" ? "Match-Score" : "match score"}`}
            action={<RecommendationBadge recommendation={matchResult.recommendation} />}
          />
          <div className="flex flex-wrap items-center gap-3">
            <AIBadge />
            <Button variant="secondary" onClick={onRerun}>
              {locale === "de" ? "Erneut berechnen" : "Run again"}
            </Button>
            <Button variant="secondary" onClick={onBack}>
              {locale === "de" ? "Zurück zur Auswahl" : "Back to selection"}
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <SummaryStat label={locale === "de" ? "Match-Score" : "Match score"} value={`${matchResult.totalScore}%`} />
          <SummaryStat label={locale === "de" ? "Pflichtabdeckung" : "Must coverage"} value={`${mustCoverage}%`} />
          <SummaryStat label={locale === "de" ? "Pflicht-Lücken" : "Must-have gaps"} value={criticalGaps} />
          <SummaryStat label={locale === "de" ? "Treffer" : "Matches"} value={matchResult.overlaps.length} />
          <SummaryStat label={locale === "de" ? "Lücken" : "Gaps"} value={matchResult.gaps.length} />
        </div>

        {needsReview && (
          <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">{locale === "de" ? "Menschliche Prüfung empfohlen" : "Human review recommended"}</p>
            <p className="mt-1 text-amber-800/80">
              {locale === "de"
                ? "Mindestens eine Pflichtanforderung ist nur teilweise erfüllt. Nutzen Sie die Detailbegründungen und Interviewfragen vor einer finalen Entscheidung."
                : "At least one required criterion is only partially covered. Use the detailed reasons and interview prompts before making a final decision."}
            </p>
          </div>
        )}
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
  const initialMatchRunId = searchParams.get("matchRun") ?? "";
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
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(null);

  const [activePostings, setActivePostings] = useState<DbJobPosting[]>([]);
  const [candidates, setCandidates] = useState<DbCandidate[]>([]);
  const [projectById, setProjectById] = useState<Record<string, DbProject>>({});
  const [roleById, setRoleById] = useState<Record<string, DbProjectRole>>({});

  async function ensurePostingExtraction(posting: DbJobPosting, role: DbProjectRole, forceRefresh = false): Promise<PostingExtractionResult> {
    if (!forceRefresh && posting.mapped_profile) {
      return posting.mapped_profile as unknown as PostingExtractionResult;
    }

    const response = await extractPostingViaApi(posting.id);
    setActivePostings((current) => current.map((item) => item.id === posting.id
      ? {
        ...item,
        mapped_profile: response.extraction as unknown as Record<string, unknown>,
        extension_mode: "manual-ai-assisted",
      }
      : item));

    return response.extraction;
  }

  async function ensureCandidateExtraction(candidate: DbCandidate, forceRefresh = false): Promise<CandidateExtractionResult> {
    if (!forceRefresh && candidate.mapped_profile) {
      return candidate.mapped_profile as unknown as CandidateExtractionResult;
    }

    const response = await extractCandidateViaApi(candidate.id);
    setCandidates((current) => current.map((item) => item.id === candidate.id
      ? {
        ...item,
        mapped_profile: response.extraction as unknown as Record<string, unknown>,
        extension_mode: "manual-ai-assisted",
        location: response.extraction.header.location || item.location,
        availability_weeks: response.extraction.header.availability_weeks ?? item.availability_weeks,
        total_project_months: response.extraction.header.total_project_months || item.total_project_months,
      }
      : item));

    return response.extraction;
  }

  function formatAIError(error: unknown): { title: string; detail: string } {
    if (error instanceof AIRequestError) {
      if (error.unmappedCandidateIds.length > 0) {
        return {
          title: locale === "de" ? "Fehlende KI-Profile" : "Missing AI profiles",
          detail: locale === "de"
            ? `Vor dem Matching fehlen Profile für ${error.unmappedCandidateIds.length} Kandidaten.`
            : `Profiles are missing for ${error.unmappedCandidateIds.length} candidates before matching.`,
        };
      }

      return {
        title: error.message,
        detail: error.code === "MATCH_SCORE_OUT_OF_RANGE"
          ? (locale === "de"
            ? "Ein oder mehrere Scores lagen beim Speichern außerhalb des gültigen Bereichs von 0 bis 100. Das ist ein Server-seitiges Qualitätsproblem im Matching-Workflow, nicht ein Bedienfehler. Bitte führen Sie das Matching erneut aus."
            : "One or more scores fell outside the valid 0 to 100 range while saving. This is a server-side quality issue in the matching workflow, not a user error. Please run the matching again.")
          : error.detail ?? (error.retriable
          ? (locale === "de" ? "Der Vorgang kann erneut ausgeführt werden." : "The operation can be retried.")
          : (locale === "de" ? "Bitte prüfen Sie die Quelldaten." : "Please review the source data.")),
      };
    }

    return {
      title: locale === "de" ? "AI-Vorgang fehlgeschlagen" : "AI operation failed",
      detail: error instanceof Error ? error.message : (locale === "de" ? "Unbekannter Fehler" : "Unknown error"),
    };
  }

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

  useEffect(() => {
    setActionFeedback(null);
  }, [selectedPostingId, selectedCandidateId, selectedCandidateIds, mode]);

  // Load stored match results when ?matchRun=<id> is present
  useEffect(() => {
    if (!initialMatchRunId) return;

    (async () => {
      try {
        setLoading(true);
        const matchRun = await fetchMatchRunById(initialMatchRunId);
        if (!matchRun || !matchRun.summary) {
          setActionFeedback({
            type: "error",
            title: locale === "de" ? "Ergebnis nicht gefunden" : "Result not found",
            detail: locale === "de"
              ? "Dieses Matching-Ergebnis ist nicht mehr verfügbar."
              : "This match result is no longer available.",
          });
          return;
        }

        const summaryData = safeParseSummary(matchRun.summary);
        if (!summaryData) {
          setActionFeedback({
            type: "error",
            title: locale === "de" ? "Ergebnis nicht lesbar" : "Result not readable",
            detail: locale === "de"
              ? "Das gespeicherte Matching-Ergebnis hat kein strukturiertes Format."
              : "The stored match result does not have a structured format.",
          });
          return;
        }
        const { matchResult } = fromStoredMatchSummary(summaryData);

        // Load related entities for context
        const [posting, candidate] = await Promise.all([
          fetchPostingById(matchRun.posting_id),
          fetchCandidateById(matchRun.candidate_id),
        ]);

        if (!posting || !candidate) {
          setActionFeedback({
            type: "warning",
            title: locale === "de" ? "Ergebnisvorschau" : "Result preview",
            detail: locale === "de"
              ? "Einige verknüpfte Daten sind nicht mehr vollständig verfügbar."
              : "Some linked data is no longer fully available.",
          });
        }

        // Load interview questions if they exist for this match run
        let questions: InterviewQuestion[] = [];
        try {
          const sets = await fetchInterviewSetsForMatchRun(initialMatchRunId);
          if (sets.length > 0) {
            const rawQuestions = await fetchQuestionsForSet(sets[0].id);
            const questionSet = {
              interview_set_id: sets[0].id,
              match_run_id: sets[0].match_run_id,
              posting_id: sets[0].posting_id,
              candidate_id: sets[0].candidate_id,
              tenant_id: sets[0].tenant_id,
              interviewer_user_id: sets[0].interviewer_user_id ?? "",
              generated_at: sets[0].created_at,
              total_questions: sets[0].total_questions,
              recommended_order: sets[0].recommended_order,
              order_rationale: sets[0].order_rationale ?? "",
              generation_notes: sets[0].generation_notes ?? "",
              questions: rawQuestions.map((q) => ({
                id: q.id,
                question: q.question,
                goal: q.goal,
                expected_evidence: q.expected_evidence,
                based_on: q.based_on,
                priority: q.priority,
                category: q.category,
                follow_up_hint: q.follow_up_hint ?? "",
                rubric: q.rubric
                  ? { strong: q.rubric.strong ?? "", adequate: q.rubric.adequate ?? "", weak: q.rubric.weak ?? "", no_answer: q.rubric.no_answer ?? "" }
                  : undefined,
              })),
            };
            questions = toMockInterviewQuestions(questionSet);
          }
        } catch {
          // Interview questions are optional
        }

        // Build posting analysis from stored data or DB
        let postingAnalysis: PostingAnalysis | null = null;
        if (posting?.mapped_profile) {
          const role = await fetchRoleById(posting.role_id);
          postingAnalysis = toMockPostingAnalysis(
            posting.mapped_profile as unknown as PostingExtractionResult,
            posting.title,
            role?.title ?? "",
            "manual-ai-assisted",
          );
        }

        // Build candidate profile from DB
        let candidateProfile: CandidateProfile | null = null;
        if (candidate?.mapped_profile) {
          candidateProfile = toMockCandidateProfile(
            candidate.mapped_profile as unknown as CandidateExtractionResult,
            candidate.full_name,
            "manual-ai-assisted",
          );
        }

        setSinglePostingAnalysis(postingAnalysis ?? {
          postingLabel: posting?.title ?? "Posting",
          roleTitle: "",
          mapping: { sourceLabel: "", sourceType: "project", mocked: true, extractedCount: 0 },
          header: { durationMonths: 0, industry: "", maturityLevel: "pilot", projectPhase: "delivery", conditions: [] },
          requirements: matchResult.details.map((d) => d.requirement),
          additionalAttributes: [],
          extensionMode: "mock",
          extensionAttributes: [],
        });
        setSingleCandidateProfile(candidateProfile ?? {
          mapping: { sourceLabel: candidate?.full_name ?? "", sourceType: "candidate", mocked: true, extractedCount: 0 },
          header: { location: candidate?.location ?? "", availabilityWeeks: 0, totalProjectMonths: 0, totalExperienceYears: 0 },
          hardSkills: [],
          softSkills: [],
          toolSkills: [],
          certifications: [],
          additionalAttributes: [],
          extensionMode: "mock",
          extensionAttributes: [],
        });
        setSingleMatchResult(matchResult);
        setSingleQuestions(questions);
        setView("single-results");

        if (posting) {
          setSelectedPostingId(posting.id);
          setActivePostings((prev) => prev.some((p) => p.id === posting.id) ? prev : [...prev, posting]);
        }
        if (candidate) {
          setSelectedCandidateId(candidate.id);
          setCandidates((prev) => prev.some((c) => c.id === candidate.id) ? prev : [...prev, candidate]);
        }
      } catch {
        setActionFeedback({
          type: "error",
          title: locale === "de" ? "Ladefehler" : "Load error",
          detail: locale === "de"
            ? "Die gespeicherten Matching-Ergebnisse konnten nicht geladen werden."
            : "The stored match results could not be loaded.",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [initialMatchRunId]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedPosting: DbJobPosting | null = useMemo(
    () => activePostings.find((p) => p.id === selectedPostingId) ?? null,
    [activePostings, selectedPostingId],
  );
  const selectedRole = selectedPosting ? roleById[selectedPosting.role_id] ?? null : null;
  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedCandidateId) ?? null;

  const canRunSingle = Boolean(selectedPosting && selectedCandidate);
  const canRunBatch = Boolean(selectedPosting) && selectedCandidateIds.size > 0;

  async function handleRunSingle(forceRefresh = false) {
    if (!selectedPosting || !selectedCandidate || !selectedRole) return;

    try {
      setLoading(true);
      setActionFeedback(null);

      const [postingExtraction, candidateExtraction] = await Promise.all([
        ensurePostingExtraction(selectedPosting, selectedRole, forceRefresh),
        ensureCandidateExtraction(selectedCandidate, forceRefresh),
      ]);

      const postingAnalysis = toMockPostingAnalysis(
        postingExtraction,
        selectedPosting.title,
        selectedRole.title,
        "manual-ai-assisted",
      );
      const candidateProfile = toMockCandidateProfile(
        candidateExtraction,
        selectedCandidate.full_name,
        "manual-ai-assisted",
      );

      const matchResponse = await runSingleMatchViaApi(selectedPosting.id, selectedCandidate.id);
      const matchResult = toMockMatchResult(matchResponse.result, postingAnalysis, candidateProfile);

      let interviewQuestions: InterviewQuestion[] = [];
      try {
        const interviewResponse = await generateInterviewQuestionsViaApi(matchResponse.matchRunId, 8);
        interviewQuestions = toMockInterviewQuestions(interviewResponse.result);
      } catch (questionError) {
        const warning = formatAIError(questionError);
        push("warning", warning.title, warning.detail);
      }

      setSinglePostingAnalysis(postingAnalysis);
      setSingleCandidateProfile(candidateProfile);
      setSingleMatchResult(matchResult);
      setSingleQuestions(interviewQuestions);
      setView("single-results");

      push(
        "success",
        locale === "de" ? "Einzelmatching abgeschlossen" : "Single matching completed",
        `${selectedCandidate.full_name} · ${matchResult.totalScore}%`,
      );
    } catch (error) {
      const formatted = formatAIError(error);
      setActionFeedback({ type: "error", title: formatted.title, detail: formatted.detail });
    } finally {
      setLoading(false);
    }
  }

  async function handleRunBatch(forceRefresh = false) {
    if (!selectedPosting || !selectedRole) return;

    const selectedBatchCandidates = candidates.filter((candidate) => selectedCandidateIds.has(candidate.id));

    try {
      setLoading(true);
      setActionFeedback(null);
      const postingExtraction = await ensurePostingExtraction(selectedPosting, selectedRole, forceRefresh);
      const postingAnalysis = toMockPostingAnalysis(
        postingExtraction,
        selectedPosting.title,
        selectedRole.title,
        "manual-ai-assisted",
      );

      const extractedCandidates = await Promise.all(
        selectedBatchCandidates.map(async (candidate) => ({
          candidate,
          extraction: await ensureCandidateExtraction(candidate, forceRefresh),
        })),
      );

      const profileMap = Object.fromEntries(
        extractedCandidates.map(({ candidate, extraction }) => [
          candidate.id,
          toMockCandidateProfile(extraction, candidate.full_name, "manual-ai-assisted"),
        ]),
      ) as Record<string, CandidateProfile>;

      const matchResponse = await runBatchMatchViaApi(
        selectedPosting.id,
        selectedBatchCandidates.map((candidate) => candidate.id),
      );

      setBatchPostingAnalysis(postingAnalysis);
      setBatchResults(toBatchEntries(matchResponse.result, postingAnalysis, selectedBatchCandidates, profileMap));
      setView("batch-results");

      push(
        "success",
        locale === "de" ? "Mehrfach-Matching abgeschlossen" : "Batch matching completed",
        locale === "de"
          ? `${selectedBatchCandidates.length} Bewerber analysiert`
          : `${selectedBatchCandidates.length} candidates analyzed`,
      );
    } catch (error) {
      const formatted = formatAIError(error);
      setActionFeedback({ type: "error", title: formatted.title, detail: formatted.detail });
    } finally {
      setLoading(false);
    }
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
        onRerun={() => void handleRunSingle(true)}
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
      {actionFeedback && <ActionFeedbackBanner feedback={actionFeedback} onDismiss={() => setActionFeedback(null)} />}

      <Card padding="lg">
        <CardHeader
          title={locale === "de" ? "Matching Hub" : "Matching hub"}
          subtitle={
            locale === "de"
              ? "Wählen Sie eine aktive Ausschreibung und starten Sie Einzel- oder Mehrfach-Matching gegen die dort definierten Anforderungen."
              : "Select an active posting and start single or batch matching against the requirements defined there."
          }
          action={<AIBadge label={locale === "de" ? "AI-gestützt" : "AI-backed"} />}
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
              onClick={() => {
                if (mode === "single") {
                  void handleRunSingle();
                  return;
                }

                void handleRunBatch();
              }}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {locale === "de" ? "Analysiere..." : "Analyzing..."}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  {mode === "single" ? <Zap className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                  {mode === "single"
                    ? (locale === "de" ? "Einzelmatching starten" : "Start single matching")
                    : (locale === "de" ? "Mehrfach-Matching starten" : "Start batch matching")}
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
