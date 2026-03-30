"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useNotifications } from "@/lib/notifications/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SDLC_PHASES = [
  { value: "requirements", de: "Anforderungsanalyse", en: "Requirements" },
  { value: "design", de: "Design", en: "Design" },
  { value: "implementation", de: "Implementierung", en: "Implementation" },
  { value: "testing", de: "Testing", en: "Testing" },
  { value: "deployment", de: "Deployment", en: "Deployment" },
  { value: "maintenance", de: "Wartung", en: "Maintenance" },
];

const PROJECT_STATUSES = [
  { value: "draft", de: "Entwurf", en: "Draft" },
  { value: "active", de: "Aktiv", en: "Active" },
  { value: "archived", de: "Archiviert", en: "Archived" },
];

const AVAILABLE_ATTRIBUTES = [
  "stakeholder_anzahl", "reiseanteil", "remote_anteil",
  "compliance_level", "sicherheitsstufe", "teamgroesse",
  "budget_rahmen", "agile_methodik", "ci_cd",
  "cloud_provider", "dokumentationssprache", "barrierefreiheit",
];

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
    phase: "requirements",
    status: "draft",
    extensionMode: "manual-ai-assisted" as "manual-ai-assisted",
  });
  const [selectedAttributes, setSelectedAttributes] = useState<Set<string>>(new Set());
  const [customAttrInput, setCustomAttrInput] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleAttribute(attr: string) {
    setSelectedAttributes((prev) => {
      const next = new Set(prev);
      if (next.has(attr)) next.delete(attr);
      else next.add(attr);
      return next;
    });
  }

  function addCustomAttribute() {
    const trimmed = customAttrInput.trim();
    if (trimmed && !selectedAttributes.has(trimmed) && !AVAILABLE_ATTRIBUTES.includes(trimmed)) {
      setSelectedAttributes((prev) => new Set(prev).add(trimmed));
      setCustomAttrInput("");
    }
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
            placeholder={locale === "de" ? "z.B. Kompetenzkompass MVP Ausschreibung" : "e.g. Kompetenzkompass MVP tender"}
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
            <Select label={locale === "de" ? "Projektphase (SDLC)" : "Project phase (SDLC)"} value={form.phase} onChange={(e) => update("phase", e.target.value)}>
              {SDLC_PHASES.map((p) => (
                <option key={p.value} value={p.value}>{locale === "de" ? p.de : p.en}</option>
              ))}
            </Select>
            <Select label={locale === "de" ? "Status" : "Status"} value={form.status} onChange={(e) => update("status", e.target.value)}>
              {PROJECT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{locale === "de" ? s.de : s.en}</option>
              ))}
            </Select>
          </div>

          <Select label={locale === "de" ? "Erweiterungsmodus (Attribute)" : "Extension mode (attributes)"} value={form.extensionMode} onChange={(e) => update("extensionMode", e.target.value)}>
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

          {/* Clickable custom attributes */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-ink/80">
              {locale === "de" ? "Benutzerdefinierte Attribute" : "Custom attributes"}
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ATTRIBUTES.map((attr) => (
                <button
                  key={attr}
                  type="button"
                  onClick={() => toggleAttribute(attr)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    selectedAttributes.has(attr)
                      ? "border-moss/40 bg-moss/10 text-moss"
                      : "border-ink/20 bg-white text-ink/60 hover:border-ink/30 hover:bg-fog/30"
                  }`}
                >
                  {selectedAttributes.has(attr) ? "✓ " : ""}{attr.replace(/_/g, " ")}
                </button>
              ))}
            </div>

            {/* Custom added attributes */}
            {[...selectedAttributes].filter((a) => !AVAILABLE_ATTRIBUTES.includes(a)).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {[...selectedAttributes].filter((a) => !AVAILABLE_ATTRIBUTES.includes(a)).map((attr) => (
                  <Badge key={attr} variant="info" className="gap-1">
                    {attr}
                    <button type="button" onClick={() => toggleAttribute(attr)} className="ml-1 hover:text-rust">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-2">
              <Input
                placeholder={locale === "de" ? "Eigenes Attribut hinzufügen..." : "Add custom attribute..."}
                value={customAttrInput}
                onChange={(e) => setCustomAttrInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAttribute(); } }}
              />
              <Button type="button" variant="secondary" size="sm" onClick={addCustomAttribute} disabled={!customAttrInput.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

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
