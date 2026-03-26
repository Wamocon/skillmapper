/**
 * AI Matching — Competency comparison between postings and candidates.
 * Replaces mock `calculateMatch` with real Gemini AI evaluation.
 * Supports both single and multi (batch) matching modes.
 */

import { generateStructuredData, type StructuredGenerationResult } from "./gemini-client";
import type { CandidateExtractionResult, PostingExtractionResult } from "./extraction";
import { buildMatchingPrompt, type MatchingInput } from "./prompts";
import { singleMatchJsonSchema } from "./schemas";
import { sanitizeSingleMatch } from "./validation";
import { getMustCoverage } from "./match-outcome";

// ─── Output types ───────────────────────────────────────────────────────────

export interface MatchDetail {
  requirement_id: string;
  requirement_name: string;
  requirement_type: "must" | "can";
  target_level: number;
  status: "matched" | "partial" | "gap";
  score_contribution: number;
  matched_skill_id: string | null;
  matched_skill_level: number;
  level_delta: number;
  evidence: string;
}

export interface ScoreReason {
  key: string;
  title: string;
  detail: string;
  impact: "positive" | "neutral" | "negative";
}

export interface SingleMatchResult {
  match_run_id: string;
  posting_id: string;
  tenant_id: string;
  candidate_id: string;
  matching_mode: "single";
  evaluated_at: string;
  total_score: number;
  recommendation: "geeignet" | "bedingt geeignet" | "nicht geeignet";
  overlaps: string[];
  gaps: string[];
  details: MatchDetail[];
  score_reasons: ScoreReason[];
  evaluation_notes: string;
}

export interface MultiMatchResult {
  match_run_id: string;
  posting_id: string;
  tenant_id: string;
  matching_mode: "multi";
  evaluated_at: string;
  comparison_table: Array<{
    rank: number;
    candidate_id: string;
    total_score: number;
    recommendation: "geeignet" | "bedingt geeignet" | "nicht geeignet";
    must_coverage: number;
    key_differentiator: string;
  }>;
  individual_results: Array<{
    candidate_id: string;
    total_score: number;
    recommendation: "geeignet" | "bedingt geeignet" | "nicht geeignet";
    overlaps: string[];
    gaps: string[];
    details: MatchDetail[];
    score_reasons: ScoreReason[];
  }>;
  evaluation_notes: string;
}

export interface MatchGenerationResult<T> extends StructuredGenerationResult<T> {}

function parsePostingAnalysis(json: string): PostingExtractionResult {
  return JSON.parse(json) as PostingExtractionResult;
}

function parseCandidateProfiles(json: string): CandidateExtractionResult[] {
  const parsed = JSON.parse(json) as unknown;
  return Array.isArray(parsed) ? (parsed as CandidateExtractionResult[]) : [];
}

function buildMultiMatchResult(
  input: Omit<MatchingInput, "matchingMode">,
  postingAnalysis: PostingExtractionResult,
  candidates: CandidateExtractionResult[],
  singleResults: SingleMatchResult[],
): MultiMatchResult {
  const comparisonTable = singleResults
    .map((result) => {
      const mustRequirements = result.details.filter((detail) => detail.requirement_type === "must");
      const mustCoverage = getMustCoverage(mustRequirements);
      const strongestReason = result.score_reasons.find((reason) => reason.impact === "positive")?.title
        ?? result.overlaps[0]
        ?? "Balanced overall fit";

      return {
        candidate_id: result.candidate_id,
        total_score: result.total_score,
        recommendation: result.recommendation,
        must_coverage: mustCoverage,
        key_differentiator: strongestReason,
      };
    })
    .sort((left, right) => right.total_score - left.total_score)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const individualResults = comparisonTable.map((entry) => {
    const result = singleResults.find((item) => item.candidate_id === entry.candidate_id);
    if (!result) {
      throw new Error(`Missing single-match result for candidate ${entry.candidate_id}.`);
    }

    return {
      candidate_id: result.candidate_id,
      total_score: result.total_score,
      recommendation: result.recommendation,
      overlaps: result.overlaps,
      gaps: result.gaps,
      details: result.details,
      score_reasons: result.score_reasons,
    };
  });

  return {
    match_run_id: input.matchRunId,
    posting_id: input.postingId,
    tenant_id: input.tenantId,
    matching_mode: "multi",
    evaluated_at: new Date().toISOString(),
    comparison_table: comparisonTable,
    individual_results: individualResults,
    evaluation_notes: `Evaluated ${candidates.length} candidates against ${postingAnalysis.requirements.length} grounded requirements with deterministic score normalization.`,
  };
}

// ─── Main matching functions ────────────────────────────────────────────────

/**
 * Run a single candidate match against a posting using Gemini AI.
 */
export async function runAISingleMatch(
  input: Omit<MatchingInput, "matchingMode">,
): Promise<MatchGenerationResult<SingleMatchResult>> {
  const postingAnalysis = parsePostingAnalysis(input.postingAnalysisJson);
  const { system, user } = buildMatchingPrompt({
    ...input,
    matchingMode: "single",
  });
  const result = await generateStructuredData<SingleMatchResult>(system, user, {
    responseJsonSchema: singleMatchJsonSchema,
    validate: (value) => sanitizeSingleMatch(value, postingAnalysis.requirements, input.candidateIdSingle ?? ""),
  });

  // Ensure IDs from input
  result.data.match_run_id = input.matchRunId;
  result.data.posting_id = input.postingId;
  result.data.tenant_id = input.tenantId;
  if (input.candidateIdSingle) {
    result.data.candidate_id = input.candidateIdSingle;
  }

  return result;
}

/**
 * Run a multi-candidate match against a posting using Gemini AI.
 */
export async function runAIMultiMatch(
  input: Omit<MatchingInput, "matchingMode">,
): Promise<MatchGenerationResult<MultiMatchResult>> {
  const postingAnalysis = parsePostingAnalysis(input.postingAnalysisJson);
  const candidates = parseCandidateProfiles(input.candidateProfilesJson);

  if (candidates.length === 0) {
    throw new Error("Batch matching requires at least one candidate profile.");
  }

  const singleResults = await Promise.all(
    candidates.map(async (candidate, index) => {
      const singleInput = {
        ...input,
        matchRunId: `${input.matchRunId}-c${index + 1}`,
        candidateIdSingle: candidate.candidate_id,
        candidateProfilesJson: JSON.stringify([candidate]),
      };
      return runAISingleMatch(singleInput);
    }),
  );

  return {
    data: buildMultiMatchResult(input, postingAnalysis, candidates, singleResults.map((item) => item.data)),
    metadata: {
      model: singleResults[0]?.metadata.model ?? process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
      attempts: singleResults.reduce((sum, item) => sum + item.metadata.attempts, 0),
      durationMs: singleResults.reduce((sum, item) => sum + item.metadata.durationMs, 0),
      promptTokens: singleResults.reduce((sum, item) => sum + (item.metadata.promptTokens ?? 0), 0),
      responseTokens: singleResults.reduce((sum, item) => sum + (item.metadata.responseTokens ?? 0), 0),
      totalTokens: singleResults.reduce((sum, item) => sum + (item.metadata.totalTokens ?? 0), 0),
      finishReason: singleResults.some((item) => item.metadata.finishReason === "STOP") ? "STOP" : null,
    },
    rawText: JSON.stringify(singleResults.map((item) => item.data)),
  };
}
