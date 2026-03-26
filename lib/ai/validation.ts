import {
  clampNumber,
  dedupeByKey,
  normalizeCategory,
  normalizeFreeText,
  normalizeInterviewCategory,
  normalizeMaturity,
  normalizePhase,
  normalizePriority,
  normalizeRecommendation,
  normalizeRequirementType,
  normalizeSkillName,
  normalizeStringArray,
  roundTo,
} from "./normalization";
import {
  getMatchRecommendation,
  getRequirementScoreContribution,
  normalizeMatchScore,
} from "./match-outcome";
import type { PostingExtractionResult, CandidateExtractionResult, ExtractedRequirement, ExtractedSkill, ExtractedExperience } from "./extraction";
import type { MatchDetail, ScoreReason, SingleMatchResult } from "./matching";
import type { AIInterviewQuestion, InterviewQuestionSet, InterviewQuestionRubric } from "./interview";

export class AIValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIValidationError";
  }
}

function ensureObject(value: unknown, message: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AIValidationError(message);
  }
  return value as Record<string, unknown>;
}

function toIsoTimestamp(value: unknown): string {
  const normalized = normalizeFreeText(value);
  if (!normalized) return new Date().toISOString();
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function sanitizeRequirement(item: unknown, index: number): ExtractedRequirement {
  const source = ensureObject(item, `Requirement ${index + 1} is not an object.`);
  const requirementType = normalizeRequirementType(source.requirement_type);
  const name = normalizeSkillName(String(source.name ?? ""));

  if (!name) {
    throw new AIValidationError(`Requirement ${index + 1} is missing a normalized name.`);
  }

  const evidence = normalizeFreeText(source.evidence);
  if (!evidence) {
    throw new AIValidationError(`Requirement ${name} is missing grounded evidence.`);
  }

  return {
    id: normalizeFreeText(source.id) || `req-${index + 1}`,
    name,
    category: normalizeCategory(source.category),
    requirement_type: requirementType,
    must_have: requirementType === "must" || Boolean(source.must_have),
    target_level: Math.round(clampNumber(source.target_level, 1, 10, 6)),
    weight: Math.round(clampNumber(source.weight, 1, 100, requirementType === "must" ? 14 : 8)),
    evidence: evidence.slice(0, 180),
    confidence: roundTo(clampNumber(source.confidence, 0, 1, 0.7), 2),
    review_required: Boolean(source.review_required) || clampNumber(source.confidence, 0, 1, 0.7) < 0.7,
  };
}

function sanitizeExtensionAttribute(item: unknown): { name: string; value: string; source: "extracted" | "inferred"; evidence: string } | null {
  const source = ensureObject(item, "Extension attribute is not an object.");
  const name = normalizeFreeText(source.name);
  const value = normalizeFreeText(source.value);
  const evidence = normalizeFreeText(source.evidence);
  if (!name || !value || !evidence) return null;
  return {
    name,
    value,
    source: normalizeFreeText(source.source).toLowerCase() === "inferred" ? "inferred" : "extracted",
    evidence: evidence.slice(0, 180),
  };
}

function sanitizeSkill(item: unknown, index: number, fallbackCategory?: ExtractedSkill["category"]): ExtractedSkill {
  const source = ensureObject(item, `Skill ${index + 1} is not an object.`);
  const name = normalizeSkillName(String(source.name ?? ""));
  if (!name) {
    throw new AIValidationError(`Skill ${index + 1} is missing a normalized name.`);
  }

  const evidence = normalizeFreeText(source.evidence);
  if (!evidence) {
    throw new AIValidationError(`Skill ${name} is missing grounded evidence.`);
  }

  const years = roundTo(clampNumber(source.years, 0, 50, 0), 1);

  return {
    id: normalizeFreeText(source.id) || `skill-${index + 1}`,
    name,
    category: fallbackCategory ?? normalizeCategory(source.category),
    level: Math.round(clampNumber(source.level, 1, 10, years >= 4 ? 7 : years >= 2 ? 6 : 4)),
    years,
    evidence: evidence.slice(0, 180),
    confidence: roundTo(clampNumber(source.confidence, 0, 1, 0.7), 2),
    review_required: Boolean(source.review_required) || clampNumber(source.confidence, 0, 1, 0.7) < 0.7,
  };
}

function sanitizeExperience(item: unknown, index: number): ExtractedExperience {
  const source = ensureObject(item, `Experience ${index + 1} is not an object.`);
  const projectName = normalizeFreeText(source.project_name);
  const role = normalizeFreeText(source.role);
  const evidence = normalizeFreeText(source.evidence);

  if (!projectName || !role || !evidence) {
    throw new AIValidationError(`Experience ${index + 1} is missing project_name, role, or evidence.`);
  }

  return {
    project_name: projectName,
    duration_months: Math.round(clampNumber(source.duration_months, 1, 240, 6)),
    role,
    industry: normalizeFreeText(source.industry),
    evidence: evidence.slice(0, 180),
    review_required: Boolean(source.review_required),
  };
}

function buildDefaultScoreReasons(details: MatchDetail[]): ScoreReason[] {
  const mustMatched = details.filter((detail) => detail.requirement_type === "must" && detail.status === "matched").length;
  const mustGaps = details.filter((detail) => detail.requirement_type === "must" && detail.status === "gap").length;
  const optionalWins = details.filter((detail) => detail.requirement_type === "can" && detail.status === "matched").length;
  const partials = details.filter((detail) => detail.status === "partial").length;

  return [
    {
      key: "mustCoverage",
      title: "Coverage of critical requirements",
      detail: `${mustMatched} required criteria were fully met and ${mustGaps} remain unresolved.`,
      impact: mustGaps > 0 ? "negative" : "positive",
    },
    {
      key: "optionalStrengths",
      title: "Optional strengths",
      detail: `${optionalWins} optional requirements were matched strongly enough to improve overall fit.`,
      impact: optionalWins > 0 ? "positive" : "neutral",
    },
    {
      key: "partialCoverage",
      title: "Areas needing follow-up",
      detail: `${partials} criteria were only partially covered and should be verified in interview.`,
      impact: partials > 0 ? "neutral" : "positive",
    },
  ];
}

function buildFallbackRubric(goal: string): InterviewQuestionRubric {
  return {
    strong: `Provides specific evidence that clearly satisfies the goal: ${goal}.`,
    adequate: `Provides some relevant evidence for ${goal}, but without enough depth or consistency.`,
    weak: `Provides vague, generic, or weak evidence for ${goal}.`,
    no_answer: `Does not provide evidence that addresses ${goal}.`,
  };
}

function buildGapQuestions(matchResult: SingleMatchResult): AIInterviewQuestion[] {
  const mustGapDetails = matchResult.details.filter((detail) => detail.requirement_type === "must" && detail.status !== "matched");

  return mustGapDetails.map((detail, index) => ({
    id: `iq-gap-${index + 1}`,
    question: `Describe a concrete project situation where you had to prove ${detail.requirement_name} at the level required for this role. What was your exact contribution?`,
    goal: `Validate the unresolved requirement ${detail.requirement_name}.`,
    expected_evidence: `Concrete project example, role ownership, decisions taken, and measurable outcome connected to ${detail.requirement_name}.`,
    based_on: detail.requirement_id,
    priority: "high",
    category: "technical",
    follow_up_hint: `Probe for depth, recency, and evidence because the current match status is ${detail.status}.`,
    rubric: buildFallbackRubric(`Validate ${detail.requirement_name}`),
  }));
}

export function sanitizePostingExtraction(raw: unknown): PostingExtractionResult {
  const source = ensureObject(raw, "Posting extraction payload is not an object.");
  const requirements = dedupeByKey(
    (Array.isArray(source.requirements) ? source.requirements : []).map((item, index) => sanitizeRequirement(item, index)),
    (item) => `${item.category}:${item.name}`,
  );

  if (requirements.length < 2) {
    throw new AIValidationError("Posting extraction returned too few grounded requirements.");
  }

  const extensionAttributes = dedupeByKey(
    (Array.isArray(source.extension_attributes) ? source.extension_attributes : [])
      .map((item) => sanitizeExtensionAttribute(item))
      .filter((item): item is NonNullable<typeof item> => item !== null),
    (item) => `${item.name.toLowerCase()}:${item.value.toLowerCase()}`,
  );

  const mustCount = requirements.filter((item) => item.requirement_type === "must").length;
  const lowConfidenceCount = requirements.filter((item) => item.review_required).length;
  const weightSum = requirements.reduce((sum, item) => sum + item.weight, 0);

  return {
    project_id: normalizeFreeText(source.project_id),
    tenant_id: normalizeFreeText(source.tenant_id),
    posting_id: normalizeFreeText(source.posting_id),
    role_title: normalizeFreeText(source.role_title),
    source_type: normalizeFreeText(source.source_type) === "tender" ? "tender" : "project-brief",
    extracted_at: toIsoTimestamp(source.extracted_at),
    extraction_notes: normalizeFreeText(source.extraction_notes),
    header: {
      duration_months: Math.round(clampNumber(source.header && ensureObject(source.header, "Header is invalid.").duration_months, 1, 120, 6)),
      industry: normalizeFreeText(source.header && ensureObject(source.header, "Header is invalid.").industry) || "General",
      maturity_level: normalizeMaturity(source.header && ensureObject(source.header, "Header is invalid.").maturity_level),
      project_phase: normalizePhase(source.header && ensureObject(source.header, "Header is invalid.").project_phase),
      conditions: normalizeStringArray(source.header && ensureObject(source.header, "Header is invalid.").conditions, 10),
      review_flags: normalizeStringArray(source.header && ensureObject(source.header, "Header is invalid.").review_flags, 10),
    },
    requirements,
    extension_attributes: extensionAttributes,
    summary: {
      total_requirements: requirements.length,
      must_count: mustCount,
      can_count: requirements.length - mustCount,
      weight_sum: weightSum,
      low_confidence_count: lowConfidenceCount,
      review_required: lowConfidenceCount > 0,
    },
  };
}

export function sanitizeCandidateExtraction(raw: unknown): CandidateExtractionResult {
  const source = ensureObject(raw, "Candidate extraction payload is not an object.");
  const experiences = dedupeByKey(
    (Array.isArray(source.experiences) ? source.experiences : []).map((item, index) => sanitizeExperience(item, index)),
    (item) => `${item.project_name.toLowerCase()}:${item.role.toLowerCase()}`,
  );

  const hardSkills = dedupeByKey(
    (Array.isArray(source.hard_skills) ? source.hard_skills : []).map((item, index) => sanitizeSkill(item, index, "hard")),
    (item) => `${item.category}:${item.name}`,
  );
  const softSkills = dedupeByKey(
    (Array.isArray(source.soft_skills) ? source.soft_skills : []).map((item, index) => sanitizeSkill(item, index, "soft")),
    (item) => `${item.category}:${item.name}`,
  );
  const toolSkills = dedupeByKey(
    (Array.isArray(source.tool_skills) ? source.tool_skills : []).map((item, index) => sanitizeSkill(item, index, "tool")),
    (item) => `${item.category}:${item.name}`,
  );
  const certifications = dedupeByKey(
    (Array.isArray(source.certifications) ? source.certifications : []).map((item, index) => sanitizeSkill(item, index, "certification")),
    (item) => `${item.category}:${item.name}`,
  );

  const totalProjectMonthsFromExperience = experiences.reduce((sum, item) => sum + item.duration_months, 0);
  const requestedTotalProjectMonths = clampNumber(source.header && ensureObject(source.header, "Header is invalid.").total_project_months, 0, 600, totalProjectMonthsFromExperience);
  const totalProjectMonths = Math.max(requestedTotalProjectMonths, totalProjectMonthsFromExperience);
  const totalExperienceYears = roundTo(totalProjectMonths / 12, 1);
  const totalSkills = hardSkills.length + softSkills.length + toolSkills.length + certifications.length;

  if (totalSkills === 0 && experiences.length === 0) {
    throw new AIValidationError("Candidate extraction returned neither skills nor experience entries.");
  }

  return {
    candidate_id: normalizeFreeText(source.candidate_id),
    tenant_id: normalizeFreeText(source.tenant_id),
    created_by: normalizeFreeText(source.created_by),
    document_type: normalizeFreeText(source.document_type) || "cv",
    extracted_at: toIsoTimestamp(source.extracted_at),
    extraction_notes: normalizeFreeText(source.extraction_notes),
    header: {
      location: normalizeFreeText(source.header && ensureObject(source.header, "Header is invalid.").location),
      availability_weeks: source.header && ensureObject(source.header, "Header is invalid.").availability_weeks == null
        ? null
        : Math.round(clampNumber(ensureObject(source.header, "Header is invalid.").availability_weeks, 0, 104, 0)),
      total_project_months: totalProjectMonths,
      total_experience_years: totalExperienceYears,
      review_flags: normalizeStringArray(source.header && ensureObject(source.header, "Header is invalid.").review_flags, 10),
    },
    experiences,
    hard_skills: hardSkills,
    soft_skills: softSkills,
    tool_skills: toolSkills,
    certifications,
    extension_attributes: dedupeByKey(
      (Array.isArray(source.extension_attributes) ? source.extension_attributes : [])
        .map((item) => sanitizeExtensionAttribute(item))
        .filter((item): item is NonNullable<typeof item> => item !== null),
      (item) => `${item.name.toLowerCase()}:${item.value.toLowerCase()}`,
    ),
    summary: {
      total_skills: totalSkills,
      hard_count: hardSkills.length,
      soft_count: softSkills.length,
      tool_count: toolSkills.length,
      cert_count: certifications.length,
      experience_entries: experiences.length,
      low_confidence_count: [...hardSkills, ...softSkills, ...toolSkills, ...certifications].filter((item) => item.review_required).length,
      review_required: [...hardSkills, ...softSkills, ...toolSkills, ...certifications].some((item) => item.review_required),
    },
  };
}

export function sanitizeSingleMatch(
  raw: unknown,
  requirementSource: ExtractedRequirement[],
  candidateId: string,
): SingleMatchResult {
  const source = ensureObject(raw, "Single match payload is not an object.");
  const rawDetails = Array.isArray(source.details) ? source.details : [];
  const details: MatchDetail[] = requirementSource.map((requirement, index) => {
    const matched = rawDetails.find((item) => {
      const detail = ensureObject(item, `Match detail ${index + 1} is not an object.`);
      return normalizeFreeText(detail.requirement_id) === requirement.id
        || normalizeSkillName(String(detail.requirement_name ?? "")) === requirement.name;
    });

    const detail = matched ? ensureObject(matched, `Match detail ${index + 1} is not an object.`) : {};
    const status = normalizeFreeText(detail.status);
    const normalizedStatus: MatchDetail["status"] = status === "matched" || status === "partial" || status === "gap"
      ? status
      : "gap";
    const matchedSkillLevel = normalizedStatus === "gap" ? 0 : Math.round(clampNumber(detail.matched_skill_level, 0, 10, 0));
    const levelDelta = matchedSkillLevel - requirement.target_level;
    return {
      requirement_id: requirement.id,
      requirement_name: requirement.name,
      requirement_type: requirement.requirement_type,
      target_level: requirement.target_level,
      status: normalizedStatus,
      score_contribution: getRequirementScoreContribution(matchedSkillLevel, requirement.target_level, requirement.weight, normalizedStatus),
      matched_skill_id: normalizeFreeText(detail.matched_skill_id) || null,
      matched_skill_level: matchedSkillLevel,
      level_delta: levelDelta,
      evidence: normalizeFreeText(detail.evidence) || `No grounded comparison was returned for ${requirement.name}; treated conservatively as ${normalizedStatus}.`,
    };
  });

  const weightSum = requirementSource.reduce((sum, item) => sum + item.weight, 0) || 1;
  const totalScore = normalizeMatchScore((details.reduce((sum, item) => sum + item.score_contribution, 0) / weightSum) * 100);
  const recommendation = getMatchRecommendation(details, totalScore);

  const overlaps = details.filter((item) => item.status === "matched").map((item) => item.requirement_name);
  const gaps = details.filter((item) => item.status !== "matched").map((item) => item.requirement_name);
  const rawReasons = Array.isArray(source.score_reasons) ? source.score_reasons : [];
  const scoreReasons = dedupeByKey(
    rawReasons
      .map((item) => {
        const reason = ensureObject(item, "Score reason is not an object.");
        const title = normalizeFreeText(reason.title);
        const detail = normalizeFreeText(reason.detail);
        if (!title || !detail) return null;
        return {
          key: normalizeFreeText(reason.key) || title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+(.)/g, (_, char) => char.toUpperCase()).replace(/\s/g, ""),
          title,
          detail,
          impact: normalizeFreeText(reason.impact) === "positive" || normalizeFreeText(reason.impact) === "negative"
            ? (normalizeFreeText(reason.impact) as ScoreReason["impact"])
            : "neutral",
        } satisfies ScoreReason;
      })
      .filter((item): item is ScoreReason => item !== null),
    (item) => item.key,
  );

  return {
    match_run_id: normalizeFreeText(source.match_run_id),
    posting_id: normalizeFreeText(source.posting_id),
    tenant_id: normalizeFreeText(source.tenant_id),
    candidate_id: candidateId,
    matching_mode: "single",
    evaluated_at: toIsoTimestamp(source.evaluated_at),
    total_score: totalScore,
    recommendation: normalizeRecommendation(recommendation),
    overlaps,
    gaps,
    details,
    score_reasons: scoreReasons.length >= 2 ? scoreReasons : buildDefaultScoreReasons(details),
    evaluation_notes: normalizeFreeText(source.evaluation_notes) || `Deterministic post-processing applied to ${details.length} grounded requirement comparisons.`,
  };
}

export function sanitizeInterviewQuestionSet(
  raw: unknown,
  matchResult: SingleMatchResult,
  targetQuestionCount: number,
): InterviewQuestionSet {
  const source = ensureObject(raw, "Interview question payload is not an object.");
  const bannedPatterns = [/five-year plan/i, /five year plan/i, /strengths and weaknesses/i, /st[aä]rken.*schw[aä]chen/i];
  const modelQuestions = (Array.isArray(source.questions) ? source.questions : [])
    .map((item, index) => {
      const question = ensureObject(item, `Interview question ${index + 1} is not an object.`);
      const prompt = normalizeFreeText(question.question);
      if (!prompt || bannedPatterns.some((pattern) => pattern.test(prompt))) return null;

      return {
        id: normalizeFreeText(question.id) || `iq-${index + 1}`,
        question: prompt,
        goal: normalizeFreeText(question.goal) || "Validate a requirement with grounded evidence.",
        expected_evidence: normalizeFreeText(question.expected_evidence) || "Concrete, recent evidence with scope, ownership, and measurable outcome.",
        based_on: normalizeFreeText(question.based_on) || `req-${index + 1}`,
        priority: normalizePriority(question.priority),
        category: normalizeInterviewCategory(question.category),
        follow_up_hint: normalizeFreeText(question.follow_up_hint),
        rubric: (() => {
          const rubric = question.rubric && typeof question.rubric === "object" ? (question.rubric as Record<string, unknown>) : null;
          if (!rubric) return buildFallbackRubric(normalizeFreeText(question.goal));
          return {
            strong: normalizeFreeText(rubric.strong) || buildFallbackRubric(normalizeFreeText(question.goal)).strong,
            adequate: normalizeFreeText(rubric.adequate) || buildFallbackRubric(normalizeFreeText(question.goal)).adequate,
            weak: normalizeFreeText(rubric.weak) || buildFallbackRubric(normalizeFreeText(question.goal)).weak,
            no_answer: normalizeFreeText(rubric.no_answer) || buildFallbackRubric(normalizeFreeText(question.goal)).no_answer,
          } satisfies InterviewQuestionRubric;
        })(),
      } satisfies AIInterviewQuestion;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const gapQuestions = buildGapQuestions(matchResult);
  const mergedQuestions = dedupeByKey<AIInterviewQuestion>([...gapQuestions, ...modelQuestions], (item) => `${item.based_on}:${item.question.toLowerCase()}`)
    .sort((left, right) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[left.priority] - priorityOrder[right.priority];
    })
    .slice(0, Math.max(3, targetQuestionCount));

  if (mergedQuestions.length === 0) {
    throw new AIValidationError("Interview generation returned no usable grounded questions.");
  }

  const orderedQuestions: AIInterviewQuestion[] = mergedQuestions.map((question, index) => ({ ...question, id: `iq-${index + 1}` }));

  return {
    interview_set_id: normalizeFreeText(source.interview_set_id),
    match_run_id: normalizeFreeText(source.match_run_id),
    posting_id: normalizeFreeText(source.posting_id),
    candidate_id: normalizeFreeText(source.candidate_id),
    tenant_id: normalizeFreeText(source.tenant_id),
    interviewer_user_id: normalizeFreeText(source.interviewer_user_id),
    generated_at: toIsoTimestamp(source.generated_at),
    total_questions: orderedQuestions.length,
    recommended_order: orderedQuestions.map((question) => question.id),
    order_rationale: normalizeFreeText(source.order_rationale) || "Critical gaps first, then partial coverage, then broader context and motivation.",
    questions: orderedQuestions,
    generation_notes: normalizeFreeText(source.generation_notes) || `Generated ${orderedQuestions.length} interview questions with deterministic gap coverage safeguards.`,
  };
}
