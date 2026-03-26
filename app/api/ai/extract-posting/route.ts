/**
 * API Route: POST /api/ai/extract-posting
 *
 * Extracts structured requirements from a job posting's raw text using Gemini AI.
 * Persists the result to job_postings.mapped_profile and updates extension_mode.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractPostingAnalysis } from "@/lib/ai/extraction";
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
  const { postingId } = body as { postingId?: string };

  if (!postingId) {
    return aiErrorResponse("postingId is required", 400, "POSTING_ID_REQUIRED");
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("id, tenant_id")
    .eq("auth_uid", user.id)
    .single();

  // Fetch the posting with its project context
  const { data: posting, error: postingError } = await supabase
    .from("job_postings")
    .select("*")
    .eq("id", postingId)
    .single();

  if (postingError || !posting) {
    return aiErrorResponse("Posting not found", 404, "POSTING_NOT_FOUND");
  }

  if (!posting.raw_text || posting.raw_text.length < 50) {
    return aiErrorResponse(
      "Posting raw_text is too short for analysis (min 50 characters)",
      422,
      "POSTING_TEXT_TOO_SHORT",
    );
  }

  // Fetch the role title
  const { data: role } = await supabase
    .from("project_roles")
    .select("title")
    .eq("id", posting.role_id)
    .single();

  // Fetch the project for source_type
  const { data: project } = await supabase
    .from("projects")
    .select("source_type")
    .eq("id", posting.project_id)
    .single();

  try {
    const result = await extractPostingAnalysis({
      projectId: posting.project_id,
      tenantId: posting.tenant_id,
      postingId: posting.id,
      roleTitle: role?.title ?? "Unbekannte Rolle",
      sourceType: (project?.source_type as "tender" | "project-brief") ?? "project-brief",
      rawText: posting.raw_text,
      customAttributes: posting.custom_attributes ?? undefined,
    });

    // Persist the AI extraction result to the posting
    const { error: updateError } = await supabase
      .from("job_postings")
      .update({
        mapped_profile: result.data as unknown as Record<string, unknown>,
        extension_mode: "manual-ai-assisted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", postingId);

    if (updateError) {
      await recordAiOperation({
        supabase,
        tenantId: posting.tenant_id,
        userId: userProfile?.id ?? null,
        operationType: "posting_extraction",
        entityType: "job_posting",
        entityId: postingId,
        status: "error",
        metadata: result.metadata,
        errorMessage: updateError.message,
      });
      return aiErrorResponse("Failed to persist extraction result", 500, "POSTING_PERSIST_FAILED", true, updateError.message);
    }

    await recordAiOperation({
      supabase,
      tenantId: posting.tenant_id,
      userId: userProfile?.id ?? null,
      operationType: "posting_extraction",
      entityType: "job_posting",
      entityId: postingId,
      status: result.data.summary.review_required ? "partial" : "success",
      metadata: result.metadata,
    });

    return NextResponse.json({
      success: true,
      postingId,
      extraction: result.data,
      metadata: result.metadata,
    });
  } catch (err) {
    const message = toErrorMessage(err, "AI extraction failed");
    await recordAiOperation({
      supabase,
      tenantId: posting.tenant_id,
      userId: userProfile?.id ?? null,
      operationType: "posting_extraction",
      entityType: "job_posting",
      entityId: postingId,
      status: "error",
      errorMessage: message,
    });
    return aiErrorResponse(message, 500, "POSTING_EXTRACTION_FAILED", true);
  }
}
