"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { useNotifications } from "@/lib/notifications/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewCandidatePage() {
  const { t, locale } = useI18n();
  const { push } = useNotifications();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    cvText: "",
    availabilityWeeks: "4",
    location: "",
    extensionMode: "manual-ai-assisted" as "manual-ai-assisted",
    customAttributes: "sprachlevel_de=C1\nreisebereitschaft=20%",
  });
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    push(
      "success",
      t("candidates.new"),
      locale === "de"
        ? `Kandidat "${form.fullName}" angelegt (Modus: ${form.extensionMode})`
        : `Candidate "${form.fullName}" created (mode: ${form.extensionMode})`,
    );
    setLoading(false);
    router.push("/candidates");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader title={t("candidates.new")} subtitle={t("candidates.subtitle")} />
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label={t("candidates.name")} required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
          <Input label={t("candidates.email")} type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={locale === "de" ? "Standort" : "Location"} value={form.location} onChange={(e) => update("location", e.target.value)} placeholder={locale === "de" ? "z.B. Berlin" : "e.g. Berlin"} />
            <Input
              label={locale === "de" ? "Verfügbarkeit (Wochen)" : "Availability (weeks)"}
              value={form.availabilityWeeks}
              onChange={(e) => update("availabilityWeeks", e.target.value)}
            />
          </div>

          <Select label={locale === "de" ? "Erweiterungsmodus (Nutzerdaten)" : "Extension mode (user data)"} value={form.extensionMode} onChange={(e) => update("extensionMode", e.target.value)}>
            <option value="manual-ai-assisted">{locale === "de" ? "Manuell + KI-gestützt" : "Manual + AI-assisted"}</option>
          </Select>

          <Textarea
            label={t("candidates.uploadCv")}
            value={form.cvText}
            onChange={(e) => update("cvText", e.target.value)}
            placeholder={locale === "de" ? "CV-Text einfügen oder Datei hochladen..." : "Paste CV text or upload a file..."}
            className="h-44"
          />

          <Textarea
            label={locale === "de" ? "Benutzerdefinierte Attribute (key=value je Zeile)" : "Custom attributes (key=value per line)"}
            value={form.customAttributes}
            onChange={(e) => update("customAttributes", e.target.value)}
            className="h-24"
          />

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-ink/80">{locale === "de" ? "Datei hochladen" : "Upload file"}</label>
            <input
              type="file"
              accept=".txt,.md,.csv"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const text = await file.text();
                  update("cvText", text);
                  if (!form.fullName) update("fullName", file.name.replace(/\.[^.]+$/, ""));
                }
              }}
              className="w-full rounded-xl border border-dashed border-ink/30 bg-fog/40 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading || !form.fullName.trim()}>
              {loading ? t("common.loading") : t("common.create")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
