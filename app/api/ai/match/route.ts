/**
 * API Route: POST /api/ai/match
 *
 * Runs AI-powered matching between a posting and one or more candidates.
 * Persists match_runs to the database with the full AI evaluation.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runAISingleMatch, runAIMultiMatch } from "@/lib/ai/matching";
import { recordAiOperation } from "@/lib/ai/logging";
import { aiErrorResponse, toErrorMessage } from "@/lib/ai/http";

function normalizePersistedScore(score: unknown): number {
  if (typeof score !== "number" || Number.isNaN(score) || !Number.isFinite(score)) {
    return 0;
  }

  const rounded = Math.round(score * 100) / 100;
  return Math.max(0, Math.min(100, rounded));
}

function toPersistFailure(errorMessage: string) {
  if (errorMessage.includes("match_runs_score_check")) {
    return {
      message: "Failed to save match results",
      code: "MATCH_SCORE_OUT_OF_RANGE",
      detail: "One or more generated match scores were outside the valid 0-100 range while saving. The system now normalizes scores before persistence. Please run the matching again.",
    };
  }

  return {
    message: "Failed to persist match runs",
    code: "MATCH_BATCH_PERSIST_FAILED",
    detail: errorMessage,
  };
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return aiErrorResponse("Unauthorized", 401, "AUTH_REQUIRED");
  }

  const body = await request.json();
  const { postingId, candidateIds, mode } = body as {
    postingId?: string;
    candidateIds?: string[];
    mode?: "single" | "multi";
  };

  if (!postingId) {
    return aiErrorResponse("postingId is required", 400, "POSTING_ID_REQUIRED");
  }
  if (!candidateIds || candidateIds.length === 0) {
    return aiErrorResponse("candidateIds array is required", 400, "CANDIDATE_IDS_REQUIRED");
  }

  const matchingMode = mode ?? (candidateIds.length === 1 ? "single" : "multi");

  // Fetch posting with its mapped_profile (AI extraction result)
  const { data: posting, error: postingError } = await supabase
    .from("job_postings")
    .select("*")
    .eq("id", postingId)
    .single();

  if (postingError || !posting) {
    return aiErrorResponse("Posting not found", 404, "POSTING_NOT_FOUND");
  }

  if (!posting.mapped_profile) {
    return aiErrorResponse(
      "Posting has no mapped_profile. Run AI extraction first (POST /api/ai/extract-posting).",
      422,
      "POSTING_MAPPING_MISSING",
    );
  }

  // Fetch candidates with their mapped_profiles
  const { data: candidates, error: candidatesError } = await supabase
    .from("candidates")
    .select("*")
    .in("id", candidateIds);

  if (candidatesError || !candidates || candidates.length === 0) {
    return aiErrorResponse("No candidates found", 404, "CANDIDATES_NOT_FOUND");
  }

  // Check all candidates have mapped_profiles
  const unmapped = candidates.filter((c) => !c.mapped_profile);
  if (unmapped.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: "Some candidates have no mapped_profile. Run AI extraction first.",
        code: "CANDIDATE_MAPPING_MISSING",
        retriable: false,
        unmappedCandidateIds: unmapped.map((c) => c.id),
      },
      { status: 422 },
    );
  }

  // Fetch user profile for tenant_id
  const { data: userProfile } = await supabase
    .from("users")
    .select("id, tenant_id")
    .eq("auth_uid", user.id)
    .single();

  const tenantId = userProfile?.tenant_id ?? posting.tenant_id;

  try {
    const matchRunId = crypto.randomUUID();

    if (matchingMode === "single") {
      const result = await runAISingleMatch({
        matchRunId,
        tenantId,
        postingId,
        candidateIdSingle: candidateIds[0],
        postingAnalysisJson: JSON.stringify(posting.mapped_profile),
        candidateProfilesJson: JSON.stringify([candidates[0].mapped_profile]),
      });

      // Persist match run
      const { error: insertError } = await supabase.from("match_runs").insert({
        id: matchRunId,
        tenant_id: tenantId,
        project_id: posting.project_id,
        posting_id: postingId,
        candidate_id: candidateIds[0],
        score: normalizePersistedScore(result.data.total_score),
        summary: JSON.stringify({
          ...result.data,
          total_score: normalizePersistedScore(result.data.total_score),
        }),
      });

      if (insertError) {
        await recordAiOperation({
          supabase,
          tenantId,
          userId: userProfile?.id ?? null,
          operationType: "single_match",
          entityType: "match_run",
          entityId: matchRunId,
          status: "error",
          metadata: result.metadata,
          errorMessage: insertError.message,
        });
        const persistFailure = toPersistFailure(insertError.message);
        return aiErrorResponse(persistFailure.message, 500, persistFailure.code, true, persistFailure.detail);
      }

      await recordAiOperation({
        supabase,
        tenantId,
        userId: userProfile?.id ?? null,
        operationType: "single_match",
        entityType: "match_run",
        entityId: matchRunId,
        status: "success",
        metadata: result.metadata,
      });

      return NextResponse.json({
        success: true,
        matchRunId,
        mode: "single",
        result: result.data,
        metadata: result.metadata,
      });
    } else {
      // Multi-match
      const candidateProfilesJson = JSON.stringify(
        candidates.map((c) => ({
          candidate_id: c.id,
          ...(c.mapped_profile as Record<string, unknown>),
        })),
      );

      const result = await runAIMultiMatch({
        matchRunId,
        tenantId,
        postingId,
        postingAnalysisJson: JSON.stringify(posting.mapped_profile),
        candidateProfilesJson,
      });

      // Persist individual match runs for each candidate
      const matchInserts = result.data.individual_results.map((ir) => {
        const normalizedScore = normalizePersistedScore(ir.total_score);

        return {
          id: crypto.randomUUID(),
          tenant_id: tenantId,
          project_id: posting.project_id,
          posting_id: postingId,
          candidate_id: ir.candidate_id,
          score: normalizedScore,
          summary: JSON.stringify({
            ...ir,
            total_score: normalizedScore,
          }),
        };
      });

      if (matchInserts.length > 0) {
        const { error: insertError } = await supabase.from("match_runs").insert(matchInserts);
        if (insertError) {
          await recordAiOperation({
            supabase,
            tenantId,
            userId: userProfile?.id ?? null,
            operationType: "multi_match",
            entityType: "match_run",
            entityId: matchRunId,
            status: "error",
            metadata: result.metadata,
            errorMessage: insertError.message,
          });
          const persistFailure = toPersistFailure(insertError.message);
          return aiErrorResponse(persistFailure.message, 500, persistFailure.code, true, persistFailure.detail);
        }
      }

      await recordAiOperation({
        supabase,
        tenantId,
        userId: userProfile?.id ?? null,
        operationType: "multi_match",
        entityType: "match_run",
        entityId: matchRunId,
        status: "success",
        metadata: result.metadata,
      });

      return NextResponse.json({
        success: true,
        matchRunId,
        mode: "multi",
        result: result.data,
        metadata: result.metadata,
      });
    }
  } catch (err) {
    const message = toErrorMessage(err, "AI matching failed");
    await recordAiOperation({
      supabase,
      tenantId,
      userId: userProfile?.id ?? null,
      operationType: matchingMode === "single" ? "single_match" : "multi_match",
      entityType: "match_run",
      entityId: postingId,
      status: "error",
      errorMessage: message,
    });
    return aiErrorResponse(message, 500, "MATCHING_FAILED", true);
  }
}
