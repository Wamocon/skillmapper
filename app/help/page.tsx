"use client";

import Link from "next/link";
import { HelpCircle, BookOpen, Mail, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardHeader } from "@/components/ui/card";

export default function HelpPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <CardHeader title={t("help.title")} subtitle={t("help.subtitle")} />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/help/faq">
          <Card className="transition hover:shadow-lg hover:-translate-y-0.5 h-full">
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <HelpCircle className="h-10 w-10 text-moss" />
              <h3 className="font-heading text-xl text-ink">{t("help.faqTitle")}</h3>
              <p className="text-sm text-ink/60">Antworten auf häufig gestellte Fragen</p>
            </div>
          </Card>
        </Link>

        <Link href="/anleitung">
          <Card className="transition hover:shadow-lg hover:-translate-y-0.5 h-full">
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <BookOpen className="h-10 w-10 text-rust" />
              <h3 className="font-heading text-xl text-ink">{t("help.guideTitle")}</h3>
              <p className="text-sm text-ink/60">{t("help.guideSubtitle")}</p>
            </div>
          </Card>
        </Link>

        <Link href="/matching">
          <Card className="transition hover:shadow-lg hover:-translate-y-0.5 h-full">
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <Zap className="h-10 w-10 text-amber-600" />
              <h3 className="font-heading text-xl text-ink">Matching-Modi</h3>
              <p className="text-sm text-ink/60">Einzelmatching oder Mehrfach-Matching direkt im Matching Hub starten</p>
            </div>
          </Card>
        </Link>

        <Card className="h-full">
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <Mail className="h-10 w-10 text-amber-600" />
            <h3 className="font-heading text-xl text-ink">{t("help.contactTitle")}</h3>
            <p className="text-sm text-ink/60">{t("help.contactText")}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
