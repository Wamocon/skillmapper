import type {
  AttributeExtension,
  BatchMatchEntry,
  CandidateProfile,
  CandidateSkill,
  InterviewQuestion,
  MatchResult,
  PostingAnalysis,
  Requirement,
} from "@/lib/mock-skillmapper";
import type { DbCandidate } from "@/lib/db/types";
import type { CandidateExtractionResult, ExtractedSkill, PostingExtractionResult } from "./extraction";
import type { InterviewQuestionSet } from "./interview";
import type { MultiMatchResult, SingleMatchResult } from "./matching";
import { getMatchRecommendation, getMustCoverage, needsHumanReview, normalizeMatchScore } from "./match-outcome";

type MatchResultLike = Pick<
  SingleMatchResult,
  "candidate_id" | "total_score" | "recommendation" | "overlaps" | "gaps" | "details" | "score_reasons"
>;

function mapExtensionAttributes(items: Array<{ name: string; value: string; source: string }>): AttributeExtension[] {
  return items.map((item) => ({
    name: item.name,
    value: item.value,
    source: item.source === "extracted" ? "ai-assisted" : "manual",
  }));
}

function mapSkill(skill: ExtractedSkill): CandidateSkill {
  return {
    id: skill.id,
    name: skill.name,
    category: skill.category,
    level: skill.level,
    years: skill.years,
    evidence: skill.evidence,
  };
}

export function toMockPostingAnalysis(
  extraction: PostingExtractionResult,
  postingLabel: string,
  roleTitle: string,
  extensionMode: "mock" | "manual-ai-assisted",
): PostingAnalysis {
  return {
    postingLabel,
    roleTitle,
    mapping: {
      sourceLabel: postingLabel,
      sourceType: "project",
      mocked: false,
      extractedCount: extraction.requirements.length,
    },
    header: {
      durationMonths: extraction.header.duration_months,
      industry: extraction.header.industry,
      maturityLevel: extraction.header.maturity_level,
      projectPhase: extraction.header.project_phase,
      conditions: extraction.header.conditions,
    },
    requirements: extraction.requirements.map((requirement): Requirement => ({
      id: requirement.id,
      name: requirement.name,
      category: requirement.category,
      mustHave: requirement.must_have,
      requirementType: requirement.requirement_type,
      targetLevel: requirement.target_level,
      weight: requirement.weight,
      evidence: requirement.evidence,
    })),
    additionalAttributes: extraction.extension_attributes.map((item) => `${item.name}: ${item.value}`),
    extensionMode,
    extensionAttributes: mapExtensionAttributes(extraction.extension_attributes),
  };
}

export function toMockCandidateProfile(
  extraction: CandidateExtractionResult,
  candidateName: string,
  extensionMode: "mock" | "manual-ai-assisted",
): CandidateProfile {
  return {
    mapping: {
      sourceLabel: candidateName,
      sourceType: "candidate",
      mocked: false,
      extractedCount: extraction.summary.total_skills,
    },
    header: {
      location: extraction.header.location || "Unknown",
      availabilityWeeks: extraction.header.availability_weeks ?? 0,
      totalProjectMonths: extraction.header.total_project_months,
      totalExperienceYears: extraction.header.total_experience_years,
    },
    hardSkills: extraction.hard_skills.map(mapSkill),
    softSkills: extraction.soft_skills.map(mapSkill),
    toolSkills: extraction.tool_skills.map(mapSkill),
    certifications: extraction.certifications.map(mapSkill),
    additionalAttributes: extraction.extension_attributes.map((item) => `${item.name}: ${item.value}`),
    extensionMode,
    extensionAttributes: mapExtensionAttributes(extraction.extension_attributes),
  };
}

function flattenSkills(profile: CandidateProfile): CandidateSkill[] {
  return [...profile.hardSkills, ...profile.softSkills, ...profile.toolSkills, ...profile.certifications];
}

/**
 * Reconstruct UI-ready match results from a persisted match_runs.summary JSON blob.
 * This is used to display stored match outcomes without re-running the AI.
 */
export function fromStoredMatchSummary(summary: Record<string, unknown>): {
  matchResult: MatchResult;
  postingAnalysis: PostingAnalysis | null;
} {
  const s = summary as Record<string, unknown>;
  const totalScore = normalizeMatchScore(Number(s.total_score ?? 0));
  const details = Array.isArray(s.details) ? s.details : [];
  const recommendation = getMatchRecommendation(details, totalScore);

  const matchResult: MatchResult = {
    mocked: false,
    totalScore,
    recommendation,
    overlaps: Array.isArray(s.overlaps) ? s.overlaps as string[] : [],
    gaps: Array.isArray(s.gaps) ? s.gaps as string[] : [],
    details: details.map((detail: Record<string, unknown>) => ({
      requirement: {
        id: String(detail.requirement_id ?? ""),
        name: String(detail.requirement_name ?? ""),
        category: (String((detail as Record<string, unknown>).category ?? "hard")) as "hard" | "soft" | "tool" | "certification",
        mustHave: detail.requirement_type === "must",
        requirementType: String(detail.requirement_type ?? "can") as "must" | "can",
        targetLevel: Number(detail.target_level ?? 0),
        weight: Number((detail as Record<string, unknown>).weight ?? 1),
        evidence: String(detail.evidence ?? ""),
      },
      status: String(detail.status ?? "gap") as "matched" | "partial" | "gap",
      scoreContribution: Number(detail.score_contribution ?? 0),
      matchedSkill: detail.matched_skill_id
        ? {
            id: String(detail.matched_skill_id),
            name: String(detail.requirement_name ?? ""),
            category: "hard" as const,
            level: Number(detail.matched_skill_level ?? 0),
            years: 0,
            evidence: "",
          }
        : undefined,
      levelDelta: Number(detail.level_delta ?? 0),
    })),
    scoreReasons: Array.isArray(s.score_reasons)
      ? (s.score_reasons as Array<Record<string, unknown>>).map((reason) => ({
          key: String(reason.key ?? ""),
          title: String(reason.title ?? ""),
          detail: String(reason.detail ?? ""),
          impact: String(reason.impact ?? "neutral") as "positive" | "neutral" | "negative",
        }))
      : [],
  };

  return { matchResult, postingAnalysis: null };
}

export function toMockMatchResult(result: MatchResultLike, postingAnalysis: PostingAnalysis, candidateProfile: CandidateProfile): MatchResult {
  const candidateSkills = flattenSkills(candidateProfile);
  const normalizedScore = normalizeMatchScore(result.total_score);
  const normalizedRecommendation = getMatchRecommendation(result.details, normalizedScore);

  return {
    mocked: false,
    totalScore: normalizedScore,
    recommendation: normalizedRecommendation,
    overlaps: result.overlaps,
    gaps: result.gaps,
    details: result.details.map((detail) => {
      const requirement = postingAnalysis.requirements.find((item) => item.id === detail.requirement_id || item.name === detail.requirement_name)
        ?? postingAnalysis.requirements[0];
      const matchedSkill = detail.matched_skill_id
        ? candidateSkills.find((skill) => skill.id === detail.matched_skill_id)
        : candidateSkills.find((skill) => skill.name === detail.requirement_name);

      return {
        requirement,
        status: detail.status,
        scoreContribution: detail.score_contribution,
        matchedSkill,
        levelDelta: detail.level_delta,
      };
    }),
    scoreReasons: result.score_reasons.map((reason) => ({
      key: reason.key,
      title: reason.title,
      detail: reason.detail,
      impact: reason.impact,
    })),
  };
}

export function toMockInterviewQuestions(result: InterviewQuestionSet): InterviewQuestion[] {
  return result.questions.map((question) => ({
    id: question.id,
    question: question.question,
    goal: question.goal,
    expectedEvidence: question.expected_evidence,
    basedOn: question.based_on,
  }));
}

export function toBatchEntries(
  result: MultiMatchResult,
  postingAnalysis: PostingAnalysis,
  candidates: DbCandidate[],
  profiles: Record<string, CandidateProfile>,
): BatchMatchEntry[] {
  return result.individual_results.map((entry) => {
    const candidate = candidates.find((item) => item.id === entry.candidate_id);
    const profile = profiles[entry.candidate_id];

    if (!candidate || !profile) {
      throw new Error(`Missing candidate profile adapter for ${entry.candidate_id}.`);
    }

    const matchResult = toMockMatchResult(entry, postingAnalysis, profile);

    return {
      candidateId: candidate.id,
      candidateName: candidate.full_name,
      location: profile.header.location,
      availabilityWeeks: profile.header.availabilityWeeks,
      totalExperienceYears: profile.header.totalExperienceYears,
      totalProjectMonths: profile.header.totalProjectMonths,
      score: matchResult.totalScore,
      recommendation: matchResult.recommendation,
      mustCoverage: getMustCoverage(entry.details),
      needsHumanReview: needsHumanReview(entry.details),
      criticalGaps: entry.details.filter((detail) => detail.requirement_type === "must" && detail.status === "gap").length,
      totalGaps: entry.gaps.length,
      totalOverlaps: entry.overlaps.length,
      matchResult,
      candidateProfile: profile,
      questions: [],
    };
  });
}
