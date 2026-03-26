/**
 * AI Interview — Generate targeted interview questions from matching results.
 * Replaces mock `generateInterviewQuestions` with real Gemini AI generation.
 */

import { generateStructuredData, type StructuredGenerationResult } from "./gemini-client";
import type { SingleMatchResult } from "./matching";
import {
  buildInterviewQuestionsPrompt,
  type InterviewQuestionsInput,
} from "./prompts";
import { interviewQuestionSetJsonSchema } from "./schemas";
import { sanitizeInterviewQuestionSet } from "./validation";

// ─── Output types ───────────────────────────────────────────────────────────

export interface InterviewQuestionRubric {
  strong: string;
  adequate: string;
  weak: string;
  no_answer: string;
}

export interface AIInterviewQuestion {
  id: string;
  question: string;
  goal: string;
  expected_evidence: string;
  based_on: string;
  priority: "high" | "medium" | "low";
  category: "technical" | "behavioral" | "motivational" | "contextual";
  follow_up_hint: string;
  rubric?: InterviewQuestionRubric;
}

export interface InterviewQuestionSet {
  interview_set_id: string;
  match_run_id: string;
  posting_id: string;
  candidate_id: string;
  tenant_id: string;
  interviewer_user_id: string;
  generated_at: string;
  total_questions: number;
  recommended_order: string[];
  order_rationale: string;
  questions: AIInterviewQuestion[];
  generation_notes: string;
}

export interface InterviewGenerationResult<T> extends StructuredGenerationResult<T> {}

// ─── Main function ──────────────────────────────────────────────────────────

/**
 * Generate targeted interview questions based on matching results using Gemini AI.
 * Replaces mock `generateInterviewQuestions`.
 */
export async function generateAIInterviewQuestions(
  input: InterviewQuestionsInput,
): Promise<InterviewGenerationResult<InterviewQuestionSet>> {
  const matchResult = JSON.parse(input.matchResultJson) as SingleMatchResult;
  const { system, user } = buildInterviewQuestionsPrompt(input);
  const result = await generateStructuredData<InterviewQuestionSet>(system, user, {
    responseJsonSchema: interviewQuestionSetJsonSchema,
    validate: (value) => sanitizeInterviewQuestionSet(value, matchResult, input.targetQuestionCount),
  });

  // Ensure IDs from input
  result.data.interview_set_id = input.interviewSetId;
  result.data.match_run_id = input.matchRunId;
  result.data.posting_id = input.postingId;
  result.data.candidate_id = input.candidateId;
  result.data.tenant_id = input.tenantId;
  result.data.interviewer_user_id = input.interviewerUserId;

  return result;
}
