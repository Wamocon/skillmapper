import { clampNumber, roundTo } from "./normalization";
import type { MatchDetail } from "./matching";

export type MatchRecommendation = "geeignet" | "bedingt geeignet" | "nicht geeignet";

export function normalizeMatchScore(score: unknown): number {
  const numericScore = typeof score === "number" ? score : Number(score);
  return roundTo(clampNumber(numericScore, 0, 100, 0), 1);
}

export function getRequirementScoreContribution(
  matchedSkillLevel: number,
  targetLevel: number,
  requirementWeight: number,
  status: MatchDetail["status"],
): number {
  const statusFactor = status === "matched" ? 1 : status === "partial" ? 0.6 : 0;
  const boundedRatio = Math.min(1, matchedSkillLevel / Math.max(targetLevel, 1));

  return roundTo(boundedRatio * requirementWeight * statusFactor, 1);
}

export function getMustCoverage(details: Array<Pick<MatchDetail, "requirement_type" | "status">>): number {
  const mustRequirements = details.filter((detail) => detail.requirement_type === "must");
  if (mustRequirements.length === 0) {
    return 100;
  }

  const coveredMustRequirements = mustRequirements.filter((detail) => detail.status === "matched" || detail.status === "partial").length;
  return Math.round((coveredMustRequirements / mustRequirements.length) * 100);
}

export function getMatchRecommendation(
  details: Array<Pick<MatchDetail, "requirement_type" | "status">>,
  totalScore: number,
): MatchRecommendation {
  const mustGapCount = details.filter((detail) => detail.requirement_type === "must" && detail.status === "gap").length;
  const mustPartialCount = details.filter((detail) => detail.requirement_type === "must" && detail.status === "partial").length;

  if (mustGapCount > 0) {
    return "nicht geeignet";
  }

  if (mustPartialCount === 0 && totalScore >= 75) {
    return "geeignet";
  }

  if (totalScore >= 50) {
    return "bedingt geeignet";
  }

  return "nicht geeignet";
}

export function needsHumanReview(details: Array<Pick<MatchDetail, "requirement_type" | "status" | "evidence">>): boolean {
  return details.some((detail) =>
    (detail.requirement_type === "must" && detail.status === "partial")
    || detail.evidence.toLowerCase().includes("no grounded comparison"),
  );
}