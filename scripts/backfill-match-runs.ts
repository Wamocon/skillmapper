import { config as loadDotenv } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { getMatchRecommendation, normalizeMatchScore } from "../lib/ai/match-outcome";

loadDotenv({ path: ".env.local", quiet: true });
loadDotenv({ quiet: true });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const schema = process.env.BACKFILL_SCHEMA ?? process.env.NEXT_PUBLIC_DB_SCHEMA ?? "public";
const isDryRun = process.argv.includes("--dry-run");
const batchSize = 200;

if (!url || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  db: { schema },
  auth: { persistSession: false, autoRefreshToken: false },
});

type MatchDetailLike = {
  requirement_type?: unknown;
  status?: unknown;
  evidence?: unknown;
};

type MatchSummaryLike = {
  total_score?: unknown;
  recommendation?: unknown;
  details?: MatchDetailLike[];
  [key: string]: unknown;
};

function normalizeDetail(detail: MatchDetailLike) {
  return {
    requirement_type: detail.requirement_type === "must" ? "must" : "can",
    status: detail.status === "matched" || detail.status === "partial" || detail.status === "gap" ? detail.status : "gap",
    evidence: typeof detail.evidence === "string" ? detail.evidence : "",
  } as const;
}

function tryParseSummary(summary: string | null): MatchSummaryLike | null {
  if (!summary) return null;

  try {
    const parsed = JSON.parse(summary) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    return parsed as MatchSummaryLike;
  } catch {
    return null;
  }
}

function normalizeSummary(summary: MatchSummaryLike | null, normalizedScore: number): string | null {
  if (!summary) return null;

  const nextSummary: MatchSummaryLike = {
    ...summary,
    total_score: normalizedScore,
  };

  if (Array.isArray(summary.details)) {
    const normalizedDetails = summary.details.map(normalizeDetail);
    nextSummary.recommendation = getMatchRecommendation(normalizedDetails, normalizedScore);
  }

  return JSON.stringify(nextSummary);
}

async function run() {
  console.log(`Backfilling match_runs in schema: ${schema}${isDryRun ? " (dry run)" : ""}`);

  let from = 0;
  let inspected = 0;
  let updated = 0;
  let unchanged = 0;

  while (true) {
    const { data, error } = await supabase
      .from("match_runs")
      .select("id, score, summary")
      .order("created_at", { ascending: false })
      .range(from, from + batchSize - 1);

    if (error) {
      throw error;
    }

    const rows = data ?? [];
    if (rows.length === 0) {
      break;
    }

    for (const row of rows) {
      inspected += 1;

      const normalizedScore = normalizeMatchScore(row.score);
      const parsedSummary = tryParseSummary(row.summary);
      const normalizedSummary = normalizeSummary(parsedSummary, normalizedScore);

      const shouldUpdateScore = Number(row.score) !== normalizedScore;
      const shouldUpdateSummary = normalizedSummary !== null && normalizedSummary !== row.summary;

      if (!shouldUpdateScore && !shouldUpdateSummary) {
        unchanged += 1;
        continue;
      }

      updated += 1;

      if (isDryRun) {
        console.log(`Would update match_run ${row.id}: score ${row.score} -> ${normalizedScore}${shouldUpdateSummary ? ", summary normalized" : ""}`);
        continue;
      }

      const { error: updateError } = await supabase
        .from("match_runs")
        .update({
          score: normalizedScore,
          ...(shouldUpdateSummary ? { summary: normalizedSummary } : {}),
        })
        .eq("id", row.id);

      if (updateError) {
        throw updateError;
      }
    }

    if (rows.length < batchSize) {
      break;
    }

    from += batchSize;
  }

  console.log(`Inspected: ${inspected}`);
  console.log(`Updated: ${updated}`);
  console.log(`Unchanged: ${unchanged}`);
}

run().catch((error) => {
  console.error("Match run backfill failed", error);
  process.exit(1);
});