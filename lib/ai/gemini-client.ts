/**
 * Gemini AI client — centralized wrapper for Google Gemini API.
 * Adds schema-constrained generation, retry-on-invalid-output, and token telemetry.
 */

import { GoogleGenAI } from "@google/genai";

let _client: GoogleGenAI | null = null;
const DEFAULT_MODEL = "gemini-2.5-flash";

export interface AIGenerationMetadata {
  model: string;
  attempts: number;
  durationMs: number;
  promptTokens: number | null;
  responseTokens: number | null;
  totalTokens: number | null;
  finishReason: string | null;
}

export interface StructuredGenerationResult<T> {
  data: T;
  metadata: AIGenerationMetadata;
  rawText: string;
}

interface GenerateStructuredOptions<T> {
  responseJsonSchema?: unknown;
  validate?: (value: unknown) => T;
  maxAttempts?: number;
  temperature?: number;
}

function getClient(): GoogleGenAI {
  if (_client) return _client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set in environment variables.");
  _client = new GoogleGenAI({ apiKey });
  return _client;
}

function getModelName(): string {
  return process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
}

function getModelCandidates(): string[] {
  const configured = getModelName();
  return [...new Set([configured, DEFAULT_MODEL])];
}

function isUnavailableModelError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /model .*no longer available|status":"NOT_FOUND"|code":404/i.test(error.message);
}

function extractJsonText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith("```")) {
    const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match?.[1]) return match[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function toGenerationMetadata(response: unknown, model: string, attempts: number, durationMs: number): AIGenerationMetadata {
  const usage = response && typeof response === "object" && "usageMetadata" in response
    ? (response as { usageMetadata?: { promptTokenCount?: number; responseTokenCount?: number; totalTokenCount?: number } }).usageMetadata
    : undefined;
  const candidate = response && typeof response === "object" && "candidates" in response
    ? (response as { candidates?: Array<{ finishReason?: string }> }).candidates?.[0]
    : undefined;

  return {
    model,
    attempts,
    durationMs,
    promptTokens: usage?.promptTokenCount ?? null,
    responseTokens: usage?.responseTokenCount ?? null,
    totalTokens: usage?.totalTokenCount ?? null,
    finishReason: candidate?.finishReason ?? null,
  };
}

/**
 * Send a prompt to Gemini and get schema-constrained, validated JSON.
 */
export async function generateStructuredData<T>(
  systemInstruction: string,
  userPrompt: string,
  options: GenerateStructuredOptions<T> = {},
): Promise<StructuredGenerationResult<T>> {
  const client = getClient();
  const maxAttempts = options.maxAttempts ?? 3;
  let latestError: Error | null = null;
  const modelCandidates = getModelCandidates();

  for (const model of modelCandidates) {
    let retryPrompt = userPrompt;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const startedAt = Date.now();
      let response;

      try {
        response = await client.models.generateContent({
          model,
          contents: retryPrompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseJsonSchema: options.responseJsonSchema,
            temperature: options.temperature ?? 0.05,
          },
        });
      } catch (error) {
        latestError = error instanceof Error ? error : new Error("Gemini generation failed.");
        if (isUnavailableModelError(latestError)) {
          break;
        }
        throw latestError;
      }

      const rawText = response.text ?? "";
      const metadata = toGenerationMetadata(response, model, attempt, Date.now() - startedAt);

      if (!rawText.trim()) {
        latestError = new Error("Gemini returned an empty structured response.");
      } else {
        try {
          const parsed = JSON.parse(extractJsonText(rawText)) as unknown;
          const validated = options.validate ? options.validate(parsed) : (parsed as T);
          return { data: validated, metadata, rawText };
        } catch (error) {
          latestError = error instanceof Error ? error : new Error("Structured output parsing failed.");
        }
      }

      retryPrompt = [
        userPrompt,
        "",
        "The previous output was rejected.",
        `Validation failure: ${latestError.message}`,
        "Regenerate the full payload from scratch as strict JSON only.",
        "Do not add explanations, markdown, code fences, or placeholder text.",
      ].join("\n");
    }
  }

  throw latestError ?? new Error("Gemini structured generation failed after all retry attempts.");
}

export async function generateJSON<T>(
  systemInstruction: string,
  userPrompt: string,
  options: GenerateStructuredOptions<T> = {},
): Promise<T> {
  const result = await generateStructuredData(systemInstruction, userPrompt, options);
  return result.data;
}

/**
 * Send a prompt to Gemini and get a plain text response.
 */
export async function generateText(
  systemInstruction: string,
  userPrompt: string,
): Promise<string> {
  const client = getClient();
  let latestError: Error | null = null;

  for (const model of getModelCandidates()) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      return response.text ?? "";
    } catch (error) {
      latestError = error instanceof Error ? error : new Error("Gemini text generation failed.");
      if (!isUnavailableModelError(latestError)) {
        throw latestError;
      }
    }
  }

  throw latestError ?? new Error("Gemini text generation failed.");
}
