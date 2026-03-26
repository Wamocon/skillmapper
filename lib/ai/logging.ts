import type { SupabaseClient } from "@supabase/supabase-js";
import type { AIOperationType, AIEntityType } from "@/lib/db/types";
import type { AIGenerationMetadata } from "./gemini-client";

interface RecordAiOperationInput {
  supabase: SupabaseClient;
  tenantId: string;
  userId: string | null;
  operationType: AIOperationType;
  entityType: AIEntityType;
  entityId: string;
  status: "success" | "error" | "partial";
  metadata?: AIGenerationMetadata | null;
  errorMessage?: string | null;
}

export async function recordAiOperation(input: RecordAiOperationInput): Promise<void> {
  const { supabase, tenantId, userId, operationType, entityType, entityId, status, metadata, errorMessage } = input;

  try {
    await supabase.from("ai_extraction_log").insert({
      tenant_id: tenantId,
      user_id: userId,
      operation_type: operationType,
      entity_type: entityType,
      entity_id: entityId,
      model_used: metadata?.model ?? process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
      input_tokens: metadata?.promptTokens ?? null,
      output_tokens: metadata?.responseTokens ?? null,
      duration_ms: metadata?.durationMs ?? null,
      status,
      error_message: errorMessage ?? null,
    });
  } catch {
    // Telemetry must never break the user flow.
  }
}
