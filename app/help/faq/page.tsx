"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardHeader } from "@/components/ui/card";
import type { TranslationKey } from "@/lib/i18n/translations";

const FAQ_ITEMS: { q: TranslationKey; a: TranslationKey }[] = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
  { q: "faq.q5", a: "faq.a5" },
  { q: "faq.q6", a: "faq.a6" },
  { q: "faq.q7", a: "faq.a7" },
];

export default function FAQPage() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card padding="lg">
        <CardHeader title={t("help.faqTitle")} />
      </Card>

      <div className="space-y-2">
        {FAQ_ITEMS.map((item, index) => (
          <Card key={item.q} padding="sm">
            <button
              type="button"
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <p className="font-semibold text-ink">{t(item.q)}</p>
              {openIndex === index ? (
                <ChevronUp className="h-5 w-5 flex-shrink-0 text-ink/40" />
              ) : (
                <ChevronDown className="h-5 w-5 flex-shrink-0 text-ink/40" />
              )}
            </button>
            {openIndex === index && (
              <p className="mt-3 text-sm text-ink/70 border-t border-ink/10 pt-3">
                {t(item.a)}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
