"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { useNotifications } from "@/lib/notifications/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewProjectPage() {
  const { t, locale } = useI18n();
  const { push } = useNotifications();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    sourceType: "tender" as "tender" | "project-brief",
    rawText: "",
    durationMonths: "6",
    industry: "",
    maturity: "pilot",
    phase: "delivery",
    extensionMode: "mock" as "mock" | "manual-ai-assisted",
    customAttributes: "stakeholder_anzahl=3\nreiseanteil=20%",
  });
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    push(
      "success",
      t("projects.new"),
      locale === "de"
        ? `Projekt "${form.title}" erstellt (Modus: ${form.extensionMode})`
        : `Project "${form.title}" created (mode: ${form.extensionMode})`,
    );
    setLoading(false);
    router.push("/projects");
  }

  async function handleFileUpload(file?: File) {
    if (!file) return;
    const text = await file.text();
    update("rawText", text);
    if (!form.title) update("title", file.name.replace(/\.[^.]+$/, ""));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader title={t("projects.new")} subtitle={t("projects.subtitle")} />

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label={t("projects.name")}
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder={locale === "de" ? "z.B. Skillmapper MVP Ausschreibung" : "e.g. Skillmapper MVP tender"}
          />

          <Select label={t("projects.sourceType")} value={form.sourceType} onChange={(e) => update("sourceType", e.target.value)}>
            <option value="tender">{t("projects.tender")}</option>
            <option value="project-brief">{t("projects.brief")}</option>
          </Select>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={locale === "de" ? "Dauer (Monate)" : "Duration (months)"} value={form.durationMonths} onChange={(e) => update("durationMonths", e.target.value)} />
            <Input label={locale === "de" ? "Branche" : "Industry"} value={form.industry} onChange={(e) => update("industry", e.target.value)} placeholder={locale === "de" ? "z.B. HR-Tech" : "e.g. HR tech"} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select label={locale === "de" ? "Reifegrad" : "Maturity"} value={form.maturity} onChange={(e) => update("maturity", e.target.value)}>
              <option value="idea">{locale === "de" ? "Idee" : "Idea"}</option>
              <option value="pilot">Pilot</option>
              <option value="rollout">Rollout</option>
              <option value="scale">Scale</option>
            </Select>
            <Select label={locale === "de" ? "Projektphase" : "Project phase"} value={form.phase} onChange={(e) => update("phase", e.target.value)}>
              <option value="discovery">Discovery</option>
              <option value="delivery">Delivery</option>
              <option value="stabilization">{locale === "de" ? "Stabilisierung" : "Stabilization"}</option>
            </Select>
          </div>

          <Select label={locale === "de" ? "Erweiterungsmodus (Attribute)" : "Extension mode (attributes)"} value={form.extensionMode} onChange={(e) => update("extensionMode", e.target.value)}>
            <option value="mock">Mock</option>
            <option value="manual-ai-assisted">{locale === "de" ? "Manuell + KI-gestützt" : "Manual + AI-assisted"}</option>
          </Select>

          <Textarea label={t("projects.description")} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder={locale === "de" ? "Kurze Projektbeschreibung..." : "Short project description..."} className="h-24" />

          <Textarea
            label={locale === "de" ? "Projekttext / Ausschreibungstext" : "Project text / tender text"}
            value={form.rawText}
            onChange={(e) => update("rawText", e.target.value)}
            placeholder={locale === "de" ? "Vollständigen Text einfügen oder Datei hochladen..." : "Paste the full text or upload a file..."}
            className="h-40"
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
              onChange={(e) => {
                const file = e.target.files?.[0];
                void handleFileUpload(file);
              }}
              className="w-full rounded-xl border border-dashed border-ink/30 bg-fog/40 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading || !form.title.trim()}>
              {loading ? t("common.loading") : t("common.create")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
