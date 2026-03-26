/**
 * API Route: POST /api/ai/extract-candidate
 *
 * Extracts structured candidate profile from CV/onepager using Gemini AI.
 * Persists the result to candidates.mapped_profile and updates extension_mode.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractCandidateProfile } from "@/lib/ai/extraction";
import { recordAiOperation } from "@/lib/ai/logging";
import { aiErrorResponse, toErrorMessage } from "@/lib/ai/http";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return aiErrorResponse("Unauthorized", 401, "AUTH_REQUIRED");
  }

  const body = await request.json();
  const { candidateId, documentType } = body as {
    candidateId?: string;
    documentType?: "cv" | "onepager" | "note" | "mixed";
  };

  if (!candidateId) {
    return aiErrorResponse("candidateId is required", 400, "CANDIDATE_ID_REQUIRED");
  }

  // Fetch the candidate
  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", candidateId)
    .single();

  if (candidateError || !candidate) {
    return aiErrorResponse("Candidate not found", 404, "CANDIDATE_NOT_FOUND");
  }

  if (!candidate.cv_raw_text || candidate.cv_raw_text.length < 50) {
    return aiErrorResponse(
      "Candidate cv_raw_text is too short for analysis (min 50 characters)",
      422,
      "CANDIDATE_TEXT_TOO_SHORT",
    );
  }

  // Fetch the user profile for created_by
  const { data: userProfile } = await supabase
    .from("users")
    .select("id")
    .eq("auth_uid", user.id)
    .single();

  try {
    const result = await extractCandidateProfile({
      candidateId: candidate.id,
      tenantId: candidate.tenant_id,
      createdByUserId: userProfile?.id ?? candidate.created_by ?? user.id,
      documentType: documentType ?? "cv",
      cvRawText: candidate.cv_raw_text,
      customAttributes: candidate.custom_attributes ?? undefined,
    });

    // Persist the AI extraction result to the candidate
    const updatePayload: Record<string, unknown> = {
      mapped_profile: result.data as unknown as Record<string, unknown>,
      extension_mode: "manual-ai-assisted",
    };

    // Also update structured fields from AI extraction
    if (result.data.header.location) {
      updatePayload.location = result.data.header.location;
    }
    if (result.data.header.availability_weeks !== null) {
      updatePayload.availability_weeks = result.data.header.availability_weeks;
    }
    if (result.data.header.total_project_months > 0) {
      updatePayload.total_project_months = result.data.header.total_project_months;
    }
    if (result.data.experiences.length > 0) {
      updatePayload.experiences = result.data.experiences;
    }

    const { error: updateError } = await supabase
      .from("candidates")
      .update(updatePayload)
      .eq("id", candidateId);

    if (updateError) {
      await recordAiOperation({
        supabase,
        tenantId: candidate.tenant_id,
        userId: userProfile?.id ?? null,
        operationType: "candidate_extraction",
        entityType: "candidate",
        entityId: candidateId,
        status: "error",
        metadata: result.metadata,
        errorMessage: updateError.message,
      });
      return aiErrorResponse("Failed to persist extraction result", 500, "CANDIDATE_PERSIST_FAILED", true, updateError.message);
    }

    await recordAiOperation({
      supabase,
      tenantId: candidate.tenant_id,
      userId: userProfile?.id ?? null,
      operationType: "candidate_extraction",
      entityType: "candidate",
      entityId: candidateId,
      status: result.data.summary.review_required ? "partial" : "success",
      metadata: result.metadata,
    });

    return NextResponse.json({
      success: true,
      candidateId,
      extraction: result.data,
      metadata: result.metadata,
    });
  } catch (err) {
    const message = toErrorMessage(err, "AI extraction failed");
    await recordAiOperation({
      supabase,
      tenantId: candidate.tenant_id,
      userId: userProfile?.id ?? null,
      operationType: "candidate_extraction",
      entityType: "candidate",
      entityId: candidateId,
      status: "error",
      errorMessage: message,
    });
    return aiErrorResponse(message, 500, "CANDIDATE_EXTRACTION_FAILED", true);
  }
}
