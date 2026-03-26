/**
 * API Route: POST /api/ai/interview-questions
 *
 * Generates targeted interview questions based on matching results using Gemini AI.
 * Persists the interview question set to the database.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAIInterviewQuestions } from "@/lib/ai/interview";
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
  const { matchRunId, targetQuestionCount } = body as {
    matchRunId?: string;
    targetQuestionCount?: number;
  };

  if (!matchRunId) {
    return aiErrorResponse("matchRunId is required", 400, "MATCH_RUN_ID_REQUIRED");
  }

  // Fetch the match run
  const { data: matchRun, error: matchError } = await supabase
    .from("match_runs")
    .select("*")
    .eq("id", matchRunId)
    .single();

  if (matchError || !matchRun) {
    return aiErrorResponse("Match run not found", 404, "MATCH_RUN_NOT_FOUND");
  }

  // Fetch posting mapped_profile
  const { data: posting } = await supabase
    .from("job_postings")
    .select("mapped_profile")
    .eq("id", matchRun.posting_id)
    .single();

  if (!posting?.mapped_profile) {
    return aiErrorResponse(
      "Posting mapped_profile not found. Run extraction first.",
      422,
      "POSTING_MAPPING_MISSING",
    );
  }

  // Fetch candidate mapped_profile
  const { data: candidate } = await supabase
    .from("candidates")
    .select("mapped_profile")
    .eq("id", matchRun.candidate_id)
    .single();

  if (!candidate?.mapped_profile) {
    return aiErrorResponse(
      "Candidate mapped_profile not found. Run extraction first.",
      422,
      "CANDIDATE_MAPPING_MISSING",
    );
  }

  // Fetch user profile
  const { data: userProfile } = await supabase
    .from("users")
    .select("id, tenant_id")
    .eq("auth_uid", user.id)
    .single();

  try {
    const interviewSetId = crypto.randomUUID();

    const result = await generateAIInterviewQuestions({
      interviewSetId,
      matchRunId,
      postingId: matchRun.posting_id,
      candidateId: matchRun.candidate_id,
      tenantId: userProfile?.tenant_id ?? matchRun.tenant_id,
      interviewerUserId: userProfile?.id ?? user.id,
      targetQuestionCount: targetQuestionCount ?? 10,
      matchResultJson: matchRun.summary ?? "{}",
      postingAnalysisJson: JSON.stringify(posting.mapped_profile),
      candidateProfileJson: JSON.stringify(candidate.mapped_profile),
    });

    // Persist the interview set to the interview_sets table
    const { error: setError } = await supabase.from("interview_sets").insert({
      id: interviewSetId,
      match_run_id: matchRunId,
      posting_id: matchRun.posting_id,
      candidate_id: matchRun.candidate_id,
      tenant_id: userProfile?.tenant_id ?? matchRun.tenant_id,
      interviewer_user_id: userProfile?.id ?? null,
      total_questions: result.data.total_questions,
      recommended_order: result.data.recommended_order,
      order_rationale: result.data.order_rationale,
      generation_notes: result.data.generation_notes,
    });

    if (setError) {
      await recordAiOperation({
        supabase,
        tenantId: userProfile?.tenant_id ?? matchRun.tenant_id,
        userId: userProfile?.id ?? null,
        operationType: "interview_generation",
        entityType: "interview_set",
        entityId: interviewSetId,
        status: "partial",
        metadata: result.metadata,
        errorMessage: setError.message,
      });
      // Table might not exist yet — return result without persistence
      return NextResponse.json({
        success: true,
        persisted: false,
        persistError: setError.message,
        interviewSetId,
        result: result.data,
        metadata: result.metadata,
      });
    }

    // Persist individual questions
    if (result.data.questions.length > 0) {
      const questionInserts = result.data.questions.map((q) => ({
        id: crypto.randomUUID(),
        interview_set_id: interviewSetId,
        sort_order: parseInt(q.id.replace("iq-", ""), 10) || 0,
        question: q.question,
        goal: q.goal,
        expected_evidence: q.expected_evidence,
        based_on: q.based_on,
        priority: q.priority,
        category: q.category,
        follow_up_hint: q.follow_up_hint || null,
        rubric: q.rubric ? JSON.stringify(q.rubric) : null,
      }));

      await supabase.from("interview_questions").insert(questionInserts);
    }

    await recordAiOperation({
      supabase,
      tenantId: userProfile?.tenant_id ?? matchRun.tenant_id,
      userId: userProfile?.id ?? null,
      operationType: "interview_generation",
      entityType: "interview_set",
      entityId: interviewSetId,
      status: "success",
      metadata: result.metadata,
    });

    return NextResponse.json({
      success: true,
      persisted: true,
      interviewSetId,
      result: result.data,
      metadata: result.metadata,
    });
  } catch (err) {
    const message = toErrorMessage(err, "AI interview question generation failed");
    await recordAiOperation({
      supabase,
      tenantId: userProfile?.tenant_id ?? matchRun.tenant_id,
      userId: userProfile?.id ?? null,
      operationType: "interview_generation",
      entityType: "interview_set",
      entityId: matchRunId,
      status: "error",
      errorMessage: message,
    });
    return aiErrorResponse(message, 500, "INTERVIEW_GENERATION_FAILED", true);
  }
}
