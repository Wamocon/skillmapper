import type { CandidateExtractionResult, PostingExtractionResult } from "./extraction";
import type { InterviewQuestionSet } from "./interview";
import type { MultiMatchResult, SingleMatchResult } from "./matching";
import type { AIGenerationMetadata } from "./gemini-client";

type ApiErrorPayload = {
  error?: string;
  code?: string;
  detail?: string | null;
  retriable?: boolean;
  unmappedCandidateIds?: string[];
};

export class AIRequestError extends Error {
  code: string | null;
  detail: string | null;
  retriable: boolean;
  unmappedCandidateIds: string[];

  constructor(message: string, payload?: ApiErrorPayload) {
    super(message);
    this.name = "AIRequestError";
    this.code = payload?.code ?? null;
    this.detail = payload?.detail ?? null;
    this.retriable = Boolean(payload?.retriable);
    this.unmappedCandidateIds = payload?.unmappedCandidateIds ?? [];
  }
}

async function postJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({}))) as T & ApiErrorPayload;
  if (!response.ok) {
    throw new AIRequestError(payload.error ?? "AI request failed", payload);
  }

  return payload;
}

export async function extractPostingViaApi(postingId: string): Promise<{ extraction: PostingExtractionResult; metadata?: AIGenerationMetadata }> {
  return postJson<{ extraction: PostingExtractionResult; metadata?: AIGenerationMetadata }>("/api/ai/extract-posting", { postingId });
}

export async function extractCandidateViaApi(
  candidateId: string,
  documentType: "cv" | "onepager" | "note" | "mixed" = "cv",
): Promise<{ extraction: CandidateExtractionResult; metadata?: AIGenerationMetadata }> {
  return postJson<{ extraction: CandidateExtractionResult; metadata?: AIGenerationMetadata }>("/api/ai/extract-candidate", { candidateId, documentType });
}

export async function runSingleMatchViaApi(
  postingId: string,
  candidateId: string,
): Promise<{ matchRunId: string; result: SingleMatchResult; metadata?: AIGenerationMetadata }> {
  return postJson<{ matchRunId: string; result: SingleMatchResult; metadata?: AIGenerationMetadata }>("/api/ai/match", {
    postingId,
    candidateIds: [candidateId],
    mode: "single",
  });
}

export async function runBatchMatchViaApi(
  postingId: string,
  candidateIds: string[],
): Promise<{ matchRunId: string; result: MultiMatchResult; metadata?: AIGenerationMetadata }> {
  return postJson<{ matchRunId: string; result: MultiMatchResult; metadata?: AIGenerationMetadata }>("/api/ai/match", {
    postingId,
    candidateIds,
    mode: "multi",
  });
}

export async function generateInterviewQuestionsViaApi(
  matchRunId: string,
  targetQuestionCount = 8,
): Promise<{ interviewSetId: string; result: InterviewQuestionSet; metadata?: AIGenerationMetadata }> {
  return postJson<{ interviewSetId: string; result: InterviewQuestionSet; metadata?: AIGenerationMetadata }>("/api/ai/interview-questions", {
    matchRunId,
    targetQuestionCount,
  });
}
