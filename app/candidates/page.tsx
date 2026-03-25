"use client";

import Link from "next/link";
import { Plus, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchCandidates } from "@/lib/db/service";
import type { DbCandidate } from "@/lib/db/types";

export default function CandidatesPage() {
  const { t, locale } = useI18n();
  const [candidates, setCandidates] = useState<DbCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates()
      .then(setCandidates)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-32 rounded-3xl bg-ink/5" />
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 rounded-2xl bg-ink/5" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <CardHeader
          title={t("candidates.title")}
          subtitle={t("candidates.subtitle")}
          action={
            <Link href="/candidates/new">
              <Button>
                <Plus className="h-4 w-4" />
                {t("candidates.new")}
              </Button>
            </Link>
          }
        />
      </Card>

      {candidates.length === 0 ? (
        <Card className="py-16 text-center">
          <UserCircle className="mx-auto h-12 w-12 text-ink/20" />
          <p className="mt-4 text-lg font-semibold text-ink/60">{t("candidates.noCandidates")}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {candidates.map((candidate) => (
            <Link key={candidate.id} href={`/candidates/${candidate.id}`}>
              <Card className="transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-moss/10 font-bold text-moss">
                    {candidate.full_name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{candidate.full_name}</p>
                    <p className="text-sm text-ink/60">{candidate.email}</p>
                    <p className="text-xs text-ink/50">
                      {locale === "de"
                        ? `Verfügbar in ${candidate.availability_weeks} Wochen - Projektzeit: ${candidate.total_project_months} Monate`
                        : `Available in ${candidate.availability_weeks} weeks - project time: ${candidate.total_project_months} months`}
                    </p>
                  </div>
                  <p className="text-xs text-ink/40">{new Date(candidate.created_at).toLocaleDateString(locale === "de" ? "de-DE" : "en-US")}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
