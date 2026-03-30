"use client";

import { Fragment, useMemo, useState } from "react";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { clsx } from "clsx";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillTree, mapCandidateSkillNodes, mapRequirementNodes } from "@/components/skill-tree";
import type { BatchMatchEntry, MatchDetail, ProjectAnalysis } from "@/lib/mock-skillmapper";

// ─── Types ──────────────────────────────────────────────────────────────────

type SortColumn = "score" | "name" | "experience" | "availability" | "mustGaps";
type SortDir = "asc" | "desc";
type RecFilter = "all" | "geeignet" | "bedingt geeignet" | "nicht geeignet";

interface BatchResultsProps {
  projectTitle: string;
  projectAnalysis: ProjectAnalysis;
  entries: BatchMatchEntry[];
  onBack: () => void;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SortHeader({
  col,
  label,
  current,
  dir,
  onClick,
}: {
  col: SortColumn;
  label: string;
  current: SortColumn;
  dir: SortDir;
  onClick: (c: SortColumn) => void;
}) {
  const active = current === col;
  return (
    <th className="px-3 py-2 text-left">
      <button
        type="button"
        onClick={() => onClick(col)}
        className={clsx(
          "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition",
          active ? "text-moss" : "text-ink/50 hover:text-ink/70",
        )}
      >
        {label}
        {active ? (
          dir === "desc" ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronUp className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3" />
        )}
      </button>
    </th>
  );
}

function ScoreCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "green" | "yellow" | "red" | "neutral";
}) {
  const colorMap = {
    green: "border-moss/25 bg-moss/5 text-moss",
    yellow: "border-amber-300 bg-amber-50 text-amber-700",
    red: "border-rust/25 bg-rust/5 text-rust",
    neutral: "border-ink/10 bg-fog/30 text-ink/70",
  };
  return (
    <div className={clsx("rounded-xl border p-3 text-center", colorMap[color])}>
      <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
      <p className="mt-1 font-heading text-xl">{value}</p>
    </div>
  );
}

function MatchDetailPanel({
  entry,
  projectAnalysis,
}: {
  entry: BatchMatchEntry;
  projectAnalysis: ProjectAnalysis;
}) {
  const { locale } = useI18n();
  const [showQuestions, setShowQuestions] = useState(false);

  const allCandidateSkills = [
    ...entry.candidateProfile.hardSkills,
    ...entry.candidateProfile.softSkills,
    ...entry.candidateProfile.toolSkills,
    ...entry.candidateProfile.certifications,
  ];

  function statusLabel(detail: MatchDetail) {
    if (detail.status === "matched") return locale === "de" ? "Treffer" : "Match";
    if (detail.status === "partial") return locale === "de" ? "Teilweise" : "Partial";
    return locale === "de" ? "Lücke" : "Gap";
  }

  return (
    <div className="space-y-4 py-2">
      {/* Score summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <ScoreCard
          label={locale === "de" ? "Match-Score" : "Match score"}
          value={`${entry.score}%`}
          color={entry.score >= 75 ? "green" : entry.score >= 50 ? "yellow" : "red"}
        />
        <ScoreCard
          label={locale === "de" ? "Empfehlung" : "Recommendation"}
          value={entry.recommendation === "geeignet" ? (locale === "de" ? "Geeignet" : "Suitable") : entry.recommendation === "bedingt geeignet" ? (locale === "de" ? "Bedingt geeignet" : "Partially suitable") : (locale === "de" ? "Nicht geeignet" : "Not suitable")}
          color={entry.recommendation === "geeignet" ? "green" : entry.recommendation === "bedingt geeignet" ? "yellow" : "red"}
        />
        <ScoreCard
          label={locale === "de" ? "Pflichtabdeckung" : "Must coverage"}
          value={`${entry.mustCoverage}%`}
          color={entry.mustCoverage === 100 ? "green" : entry.mustCoverage >= 60 ? "yellow" : "red"}
        />
        <ScoreCard
          label="Must-Gaps"
          value={String(entry.criticalGaps)}
          color={entry.criticalGaps === 0 ? "green" : "red"}
        />
        <ScoreCard label={locale === "de" ? "Lücken ges." : "Total gaps"} value={String(entry.totalGaps)} color="neutral" />
      </div>

      {entry.needsHumanReview && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">{locale === "de" ? "Menschliche Prüfung empfohlen" : "Human review recommended"}</p>
          <p className="mt-1 text-amber-800/80">
            {locale === "de"
              ? "Mindestens eine Pflichtanforderung ist nur teilweise belegt. Nutzen Sie die Begründungen und Interviewfragen, bevor Sie final entscheiden."
              : "At least one required criterion is only partially covered. Use the reasoning and interview prompts before making a final decision."}
          </p>
        </div>
      )}

      {/* Header comparison */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-ink/10 bg-white p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/50">{locale === "de" ? "Bewerber" : "Candidate"}</p>
          <ul className="space-y-1 text-sm text-ink/75">
            <li>{locale === "de" ? "Standort" : "Location"}: <span className="font-medium text-ink">{entry.location}</span></li>
            <li>{locale === "de" ? "Verfügbar" : "Available"}: <span className="font-medium text-ink">{locale === "de" ? `in ${entry.availabilityWeeks} Wochen` : `in ${entry.availabilityWeeks} weeks`}</span></li>
            <li>{locale === "de" ? "Projektzeit" : "Project time"}: <span className="font-medium text-ink">{entry.totalProjectMonths} {locale === "de" ? "Monate" : "months"}</span></li>
            <li>{locale === "de" ? "Erfahrung" : "Experience"}: <span className="font-medium text-ink">{entry.totalExperienceYears} {locale === "de" ? "Jahre" : "years"}</span></li>
          </ul>
        </div>
        <div className="rounded-xl border border-ink/10 bg-white p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/50">{locale === "de" ? "Projekt" : "Project"}</p>
          <ul className="space-y-1 text-sm text-ink/75">
            <li>{locale === "de" ? "Dauer" : "Duration"}: <span className="font-medium text-ink">{projectAnalysis.header.durationMonths} {locale === "de" ? "Monate" : "months"}</span></li>
            <li>{locale === "de" ? "Branche" : "Industry"}: <span className="font-medium text-ink">{projectAnalysis.header.industry}</span></li>
            <li>{locale === "de" ? "Phase" : "Phase"}: <span className="font-medium text-ink">{projectAnalysis.header.projectPhase}</span></li>
            <li>{locale === "de" ? "Reifegrad" : "Maturity"}: <span className="font-medium text-ink">{projectAnalysis.header.maturityLevel}</span></li>
          </ul>
        </div>
      </div>

      {/* Skill trees */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-ink/10 bg-white p-4">
          <SkillTree
            title={locale === "de" ? "Anforderungen (Muss rot / Kann blau)" : "Requirements (required red / optional blue)"}
            nodes={mapRequirementNodes(projectAnalysis.requirements)}
          />
        </div>
        <div className="rounded-xl border border-ink/10 bg-white p-4">
          <SkillTree title={locale === "de" ? "Bewerber-Skills (Skala 1–10)" : "Candidate skills (scale 1-10)"} nodes={mapCandidateSkillNodes(allCandidateSkills)} />
        </div>
      </div>

      {/* Requirements detail table */}
      <div className="rounded-xl border border-ink/10 bg-white p-4">
        <p className="mb-3 font-semibold text-ink">{locale === "de" ? "Anforderungen im Detail" : "Requirement details"}</p>
        <div className="space-y-1.5">
          {entry.matchResult.details.map((detail) => (
            <div
              key={detail.requirement.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-ink/5 bg-fog/25 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <span className="text-sm font-semibold text-ink">{detail.requirement.name}</span>
                <span className="ml-2 text-xs text-ink/45">
                  {detail.requirement.mustHave ? (locale === "de" ? "Muss" : "Required") : (locale === "de" ? "Kann" : "Optional")} · {detail.requirement.category} · {locale === "de" ? "Ziellevel" : "Target level"}{" "}
                  {detail.requirement.targetLevel}/10
                </span>
              </div>
              {detail.matchedSkill && (
                <span className="text-xs text-ink/60">{locale === "de" ? "Kandidat" : "Candidate"}: {detail.matchedSkill.level}/10</span>
              )}
              <Badge
                variant={
                  detail.status === "matched" ? "success" : detail.status === "partial" ? "warning" : "error"
                }
              >
                {statusLabel(detail)}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Interview questions toggle */}
      {entry.questions.length > 0 && (
        <div className="rounded-xl border border-ink/10 bg-white p-4">
          <button
            type="button"
            onClick={() => setShowQuestions((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <p className="font-semibold text-ink">
              {locale === "de" ? `Empfohlene Interviewfragen (${entry.questions.length})` : `Recommended interview questions (${entry.questions.length})`}
            </p>
            {showQuestions ? (
              <ChevronUp className="h-4 w-4 text-ink/40" />
            ) : (
              <ChevronDown className="h-4 w-4 text-ink/40" />
            )}
          </button>
          {showQuestions && (
            <ul className="mt-3 space-y-2">
              {entry.questions.map((q) => (
                <li key={q.id} className="rounded-lg border border-ink/5 bg-fog/25 p-3 text-sm">
                  <p className="font-semibold text-ink">{q.question}</p>
                  <p className="mt-0.5 text-xs text-ink/55">{locale === "de" ? "Ziel" : "Goal"}: {q.goal}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main BatchResults ────────────────────────────────────────────────────────

export function BatchResults({ projectTitle, projectAnalysis, entries, onBack }: BatchResultsProps) {
  const { locale } = useI18n();
  const [sortCol, setSortCol] = useState<SortColumn>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [recFilter, setRecFilter] = useState<RecFilter>("all");
  const [minScore, setMinScore] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      entries
        .filter((e) => {
          if (recFilter !== "all" && e.recommendation !== recFilter) return false;
          if (e.score < minScore) return false;
          return true;
        })
        .sort((a, b) => {
          let cmp = 0;
          switch (sortCol) {
            case "score":
              cmp = a.score - b.score;
              break;
            case "name":
              cmp = a.candidateName.localeCompare(b.candidateName);
              break;
            case "experience":
              cmp = a.totalExperienceYears - b.totalExperienceYears;
              break;
            case "availability":
              cmp = a.availabilityWeeks - b.availabilityWeeks;
              break;
            case "mustGaps":
              cmp = a.criticalGaps - b.criticalGaps;
              break;
          }
          return sortDir === "asc" ? cmp : -cmp;
        }),
    [entries, sortCol, sortDir, recFilter, minScore],
  );

  function toggleSort(col: SortColumn) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("desc");
    }
  }

  function toggleExpand(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  const recCounts = {
    geeignet: entries.filter((e) => e.recommendation === "geeignet").length,
    bedingt: entries.filter((e) => e.recommendation === "bedingt geeignet").length,
    nicht: entries.filter((e) => e.recommendation === "nicht geeignet").length,
  };

  const REC_TABS: { key: RecFilter; label: string }[] = [
    { key: "all", label: locale === "de" ? `Alle (${entries.length})` : `All (${entries.length})` },
    { key: "geeignet", label: locale === "de" ? `Geeignet (${recCounts.geeignet})` : `Suitable (${recCounts.geeignet})` },
    { key: "bedingt geeignet", label: locale === "de" ? `Bedingt geeignet (${recCounts.bedingt})` : `Partially suitable (${recCounts.bedingt})` },
    { key: "nicht geeignet", label: locale === "de" ? `Nicht geeignet (${recCounts.nicht})` : `Not suitable (${recCounts.nicht})` },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card padding="lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardHeader
              title={locale === "de" ? `Ergebnisse: ${projectTitle}` : `Results: ${projectTitle}`}
              subtitle={locale === "de" ? `${entries.length} Bewerber analysiert · ${projectAnalysis.header.industry} · ${projectAnalysis.header.durationMonths} Monate` : `${entries.length} candidates analyzed · ${projectAnalysis.header.industry} · ${projectAnalysis.header.durationMonths} months`}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onBack}>
              {locale === "de" ? "← Neue Auswahl" : "← New selection"}
            </Button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-moss/25 bg-moss/5 p-3 text-center">
            <p className="font-heading text-3xl text-moss">{recCounts.geeignet}</p>
            <p className="mt-0.5 text-xs font-semibold uppercase text-moss/70">{locale === "de" ? "Geeignet" : "Suitable"}</p>
          </div>
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-center">
            <p className="font-heading text-3xl text-amber-700">{recCounts.bedingt}</p>
            <p className="mt-0.5 text-xs font-semibold uppercase text-amber-600">{locale === "de" ? "Bedingt geeignet" : "Partially suitable"}</p>
          </div>
          <div className="rounded-xl border border-rust/25 bg-rust/5 p-3 text-center">
            <p className="font-heading text-3xl text-rust">{recCounts.nicht}</p>
            <p className="mt-0.5 text-xs font-semibold uppercase text-rust/70">{locale === "de" ? "Nicht geeignet" : "Not suitable"}</p>
          </div>
        </div>
      </Card>

      {/* Filter + sort bar */}
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          {/* Recommendation tabs */}
          <div className="flex overflow-hidden rounded-xl border border-ink/15">
            {REC_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setRecFilter(tab.key)}
                className={clsx(
                  "px-3 py-1.5 text-xs font-semibold transition",
                  recFilter === tab.key ? "bg-moss text-white" : "text-ink/60 hover:bg-ink/5",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Min score */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink/55">{locale === "de" ? "Min. Match-Score:" : "Min match score:"}</span>
            <input
              type="number"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => {
                const nextValue = Number(e.target.value);
                setMinScore(Number.isNaN(nextValue) ? 0 : Math.max(0, Math.min(100, nextValue)));
              }}
              className="w-16 rounded-lg border border-ink/20 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-moss/40"
            />
            <span className="text-xs text-ink/50">%</span>
          </div>

          <div className="ml-auto text-xs text-ink/45">
            {locale === "de" ? `${filtered.length} von ${entries.length} angezeigt` : `${filtered.length} of ${entries.length} shown`}
          </div>
        </div>
      </Card>

      {/* Results table */}
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10">
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-ink/45">#</th>
                <SortHeader col="name" label={locale === "de" ? "Bewerber" : "Candidate"} current={sortCol} dir={sortDir} onClick={toggleSort} />
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-ink/45">
                  {locale === "de" ? "Standort" : "Location"}
                </th>
                <SortHeader
                  col="availability"
                  label={locale === "de" ? "Verfügbar" : "Available"}
                  current={sortCol}
                  dir={sortDir}
                  onClick={toggleSort}
                />
                <SortHeader
                  col="experience"
                  label={locale === "de" ? "Erfahrung" : "Experience"}
                  current={sortCol}
                  dir={sortDir}
                  onClick={toggleSort}
                />
                <SortHeader col="score" label={locale === "de" ? "Match-Score" : "Match score"} current={sortCol} dir={sortDir} onClick={toggleSort} />
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-ink/45">
                  {locale === "de" ? "Empfehlung" : "Recommendation"}
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-ink/45">
                  {locale === "de" ? "Pflichtabdeckung" : "Must coverage"}
                </th>
                <SortHeader
                  col="mustGaps"
                  label="Must-Gaps"
                  current={sortCol}
                  dir={sortDir}
                  onClick={toggleSort}
                />
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-ink/45">
                  {locale === "de" ? "Lücken" : "Gaps"}
                </th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-sm text-ink/50">
                    {locale === "de" ? "Keine Ergebnisse entsprechen den Filterkriterien." : "No results match the filter criteria."}
                  </td>
                </tr>
              )}
              {filtered.map((entry, idx) => {
                const isExpanded = expandedId === entry.candidateId;
                return (
                  <Fragment key={entry.candidateId}>
                    <tr
                      onClick={() => toggleExpand(entry.candidateId)}
                      className={clsx(
                        "cursor-pointer border-b border-ink/5 transition",
                        isExpanded ? "bg-moss/5" : "hover:bg-fog/30",
                      )}
                    >
                      {/* Rank */}
                      <td className="px-3 py-3 text-xs text-ink/35">{idx + 1}</td>

                      {/* Name */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-moss/10 text-xs font-bold text-moss">
                            {entry.candidateName.charAt(0)}
                          </div>
                          <span className="font-semibold text-ink">{entry.candidateName}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-3 py-3 text-xs text-ink/65">{entry.location}</td>

                      {/* Availability */}
                      <td className="px-3 py-3 text-xs text-ink/65">{entry.availabilityWeeks}W</td>

                      {/* Experience */}
                      <td className="px-3 py-3 text-xs text-ink/65">
                        <span className="font-medium">{entry.totalExperienceYears}J</span>
                        <span className="ml-1 text-ink/40">/ {entry.totalProjectMonths}M</span>
                      </td>

                      {/* Score bar */}
                      <td className="px-3 py-3">
                        <div className="flex min-w-[90px] items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
                            <div
                              className={clsx(
                                "h-full rounded-full transition-all",
                                entry.score >= 75
                                  ? "bg-moss"
                                  : entry.score >= 50
                                    ? "bg-amber-500"
                                    : "bg-rust",
                              )}
                                style={{ width: `${Math.max(0, Math.min(100, entry.score))}%` }}
                            />
                          </div>
                          <span
                            className={clsx(
                              "text-xs font-bold tabular-nums",
                              entry.score >= 75
                                ? "text-moss"
                                : entry.score >= 50
                                  ? "text-amber-600"
                                  : "text-rust",
                            )}
                          >
                            {entry.score}%
                          </span>
                        </div>
                      </td>

                      {/* Recommendation */}
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={
                              entry.recommendation === "geeignet"
                                ? "success"
                                : entry.recommendation === "bedingt geeignet"
                                  ? "warning"
                                  : "error"
                            }
                          >
                            {entry.recommendation === "geeignet"
                              ? locale === "de" ? "Geeignet" : "Suitable"
                              : entry.recommendation === "bedingt geeignet"
                                ? locale === "de" ? "Bedingt geeignet" : "Partially suitable"
                                : locale === "de" ? "Nicht geeignet" : "Not suitable"}
                          </Badge>
                          {entry.needsHumanReview && <Badge variant="info">{locale === "de" ? "Prüfen" : "Review"}</Badge>}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-xs font-semibold tabular-nums text-ink/70">{entry.mustCoverage}%</td>

                      {/* Must-gaps */}
                      <td className="px-3 py-3">
                        <span
                          className={clsx(
                            "text-sm font-bold tabular-nums",
                            entry.criticalGaps > 0 ? "text-rust" : "text-moss",
                          )}
                        >
                          {entry.criticalGaps}
                        </span>
                      </td>

                      {/* Total gaps */}
                      <td className="px-3 py-3 text-xs text-ink/65 tabular-nums">{entry.totalGaps}</td>

                      {/* Expand toggle */}
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-ink/40 transition hover:bg-ink/5 hover:text-moss"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(entry.candidateId);
                          }}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr>
                        <td
                          colSpan={11}
                          className="border-b border-moss/10 bg-fog/20 px-6 py-4"
                        >
                          <MatchDetailPanel entry={entry} projectAnalysis={projectAnalysis} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
