"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

function StepCard({
  step,
  title,
  detail,
}: {
  step: string;
  title: string;
  detail: string;
}) {
  return (
    <article className="rounded-xl border border-ink/10 bg-white/75 p-4 shadow-panel">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rust">{step}</p>
      <h3 className="mt-2 font-heading text-2xl text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink/75">{detail}</p>
    </article>
  );
}

export default function AnleitungPage() {
  const { locale } = useI18n();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-10">
      <section className="rounded-3xl border border-ink/10 bg-fog/70 p-5 shadow-panel sm:p-8 md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rust">{locale === "de" ? "Nutzungsanleitung" : "User guide"}</p>
        <h1 className="mt-3 font-heading text-3xl text-ink sm:text-5xl md:text-6xl">{locale === "de" ? "So nutzt du Kompetenzkompass mit strukturiertem Mapping" : "How to use Kompetenzkompass with structured mapping"}</h1>
        <p className="mt-4 max-w-3xl text-lg text-ink/80">
          {locale === "de"
            ? "Diese Seite zeigt den Workflow mit Projekt-, Rollen- und Ausschreibungs-Schema, Kompetenzrad-Visualisierung sowie begründetem Score-Matching (Pflicht/Optional-Logik). Kandidaten werden gegen einzelne Ausschreibungen gematcht, die ihrerseits Projektkontext erben. Einzelmatching und Mehrfach-Matching teilen sich denselben Ausschreibungskontext."
            : "This page shows the workflow with project, role, and job posting schemas, competency wheel visualization, and explainable score matching (required/optional logic). Candidates are matched against individual job postings which inherit project context. Single matching and batch matching share the same posting context."}
        </p>
        <Link href="/" className="mt-6 inline-block rounded-xl bg-moss px-4 py-2 font-semibold text-white hover:bg-moss/90">
          {locale === "de" ? "Zur App zurück" : "Back to the app"}
        </Link>
      </section>

      <section className="mt-8 rounded-2xl border border-ink/10 bg-white/75 p-6 shadow-panel">
        <h2 className="font-heading text-3xl">{locale === "de" ? "Workflow-Visualisierung" : "Workflow visualization"}</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
          <div className="rounded-lg bg-fog/70 p-3 text-center text-sm font-semibold">{locale === "de" ? "Projekt + Rollen" : "Project + roles"}</div>
          <div className="text-center text-2xl text-moss">-&gt;</div>
          <div className="rounded-lg bg-fog/70 p-3 text-center text-sm font-semibold">{locale === "de" ? "Ausschreibungen erstellen" : "Create job postings"}</div>
          <div className="text-center text-2xl text-moss">-&gt;</div>
          <div className="rounded-lg bg-fog/70 p-3 text-center text-sm font-semibold">{locale === "de" ? "Ausschreibungswahl + Moduswahl" : "Posting selection + mode"}</div>
          <div className="text-center text-2xl text-moss">-&gt;</div>
          <div className="rounded-lg bg-fog/70 p-3 text-center text-sm font-semibold">{locale === "de" ? "Einzel- oder Mehrfach-Matching" : "Single or batch matching"}</div>
          <div className="text-center text-2xl text-moss">-&gt;</div>
          <div className="rounded-lg bg-fog/70 p-3 text-center text-sm font-semibold">{locale === "de" ? "Detailanalyse / Ergebnisliste" : "Detailed analysis / result list"}</div>
          <div className="text-center text-2xl text-moss">-&gt;</div>
          <div className="rounded-lg bg-fog/70 p-3 text-center text-sm font-semibold">{locale === "de" ? "Interview Check" : "Interview check"}</div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <StepCard
          step="Step 1"
          title={locale === "de" ? "Projekt und Rollen erfassen" : "Capture project and roles"}
          detail={locale === "de" ? "Neben Titel und Text werden Dauer, Branche, Projektphase (nach SDLC: Anforderungsanalyse, Design, Implementierung, Testing, Deployment, Wartung) und Rahmenbedingungen erfasst. Für jedes Projekt werden Rollen (z.\u00A0B. Frontend-Entwickler, QA Lead) angelegt, die mit Kandidaten besetzt werden können. Rollen können direkt in der Projektansicht angelegt und Felder dort inline bearbeitet werden." : "In addition to title and text, duration, industry, project phase (SDLC: Requirements, Design, Implementation, Testing, Deployment, Maintenance), and constraints are captured. Roles (e.g. frontend developer, QA lead) are created per project and can be filled with candidates. Roles can be created directly in the project view and fields can be edited inline."}
        />
        <StepCard
          step="Step 2"
          title={locale === "de" ? "Ausschreibungen mit Skill-Anforderungen erstellen" : "Create job postings with skill requirements"}
          detail={locale === "de" ? "Jede Rolle kann eine oder mehrere Ausschreibungen enthalten. Ausschreibungen erben den Projektkontext, enthalten aber eigene Detail-Anforderungen (Tools, Hard Skills, Soft Skills, Zertifizierungen) mit Pflicht/Optional-Klassifikation. Jede Ausschreibung durchläuft einen Status: Entwurf → Aktiv → Pausiert → Geschlossen → Besetzt. Ausschreibungen haben eine Priorität (Hoch, Mittel, Niedrig), die farblich hervorgehoben wird. Neue Ausschreibungen können direkt auf der Ausschreibungen-Seite erstellt werden. Filter für Status, Priorität und Branche sind verfügbar." : "Each role can have one or more job postings. Postings inherit project context but contain their own detailed requirements (tools, hard skills, soft skills, certifications) with required/optional classification. Each posting follows a status lifecycle: draft → active → paused → closed → filled. Postings have a priority (High, Medium, Low) displayed with color coding. New postings can be created directly on the postings page. Filters for status, priority, and industry are available."}
        />
        <StepCard
          step="Step 3"
          title={locale === "de" ? "Ausschreibung wählen und Matching-Modus festlegen" : "Select posting and choose matching mode"}
          detail={locale === "de" ? "Im Matching-Hub wählt man eine aktive Ausschreibung statt eines Projekts. Danach wird zwischen Einzelmatching und Mehrfach-Matching gewechselt. Einzelmatching fokussiert die Tiefenanalyse eines Kandidaten, Mehrfach-Matching analysiert ganze Bewerberstapel im selben Ausschreibungskontext." : "In the matching hub, you select an active posting instead of a project. Then you switch between single matching and batch matching. Single matching focuses on deep analysis of one candidate, while batch matching analyzes whole candidate stacks in the same posting context."}
        />
        <StepCard
          step="Step 4"
          title={locale === "de" ? "Bewerberprofil einheitlich mappen und auswerten" : "Map and evaluate candidate profile consistently"}
          detail={locale === "de" ? "Kopfdaten, Skills nach Kategorien und Erfahrung in Zeit werden einheitlich aufbereitet. Je nach Modus entsteht daraus entweder eine Detailanalyse oder eine sortierbare Ergebnisliste mit Drilldown. Pflicht-Gaps der Ausschreibung blockieren die Gesamtempfehlung." : "Header data, categorized skills, and time-based experience are normalized consistently. Depending on the mode, this becomes either a detailed analysis or a sortable result list with drilldown. Required gaps from the posting block the overall recommendation."}
        />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <StepCard
          step="Step 5"
          title={locale === "de" ? "Erweiterungsmodus nutzen" : "Use extension mode"}
          detail={locale === "de" ? "Attribute für Anforderungen und Nutzerdaten werden manuell erfasst und KI-gestützt erweitert." : "Attributes for requirements and user data are captured manually and extended with AI assistance."}
        />
        <StepCard
          step="Step 6"
          title={locale === "de" ? "Ergebnis konsumieren" : "Consume results"}
          detail={locale === "de" ? "Im Einzelmatching sehen Sie direkte Score-Begründung, Skillabgleich und Interviewfragen. Im Mehrfach-Matching erhalten Sie Filter, Sortierung, Rangliste und Detailanalyse pro Kandidat." : "In single matching, you see direct score justification, skill comparison, and interview questions. In batch matching, you get filters, sorting, ranking, and detailed analysis per candidate."}
        />
      </section>

      <section className="mt-8 rounded-2xl border border-ink/10 bg-white/75 p-6 shadow-panel">
        <h2 className="font-heading text-3xl">{locale === "de" ? "Kompetenzrad und Score-Interpretation" : "Competency wheel and score interpretation"}</h2>
        <div className="mt-4 space-y-3">
          <p className="text-sm text-ink/75">{locale === "de" ? "Das Kompetenzrad (Radar-Chart) zeigt das Anforderungsprofil als gestrichelte Linie und das Bewerberprofil als gefüllte Fläche. Hover über eine Achse zeigt Ziel-Level, Ist-Level und Differenz." : "The competency wheel (radar chart) shows the requirement profile as a dashed line and the candidate profile as a filled area. Hovering over an axis shows target level, current level, and delta."}</p>
          <div className="h-3 overflow-hidden rounded-full bg-ink/10">
            <div className="h-full w-[78%] rounded-full bg-moss" />
          </div>
          <p className="text-sm text-ink/75">{locale === "de" ? "Beispiel: 78% bedeutet gute Passung ohne kritische Pflicht-Gaps. Unter 50% signalisiert der Prototyp eine deutliche Lücke." : "Example: 78% indicates a good fit without critical required gaps. Below 50%, the prototype signals a substantial gap."}</p>
          <p className="text-sm text-ink/75">{locale === "de" ? "Der Score-Bereich \"Warum dieser Score?\" zeigt eine begründete Liste mit positiven Treffern, Abweichungen und fehlenden Anforderungen." : "The \"Why this score?\" section shows an explained list of positive matches, deviations, and missing requirements."}</p>
          <p className="text-sm text-ink/75">{locale === "de" ? "Der Anforderungsabgleich zeigt jede Anforderung mit Ziel vs. Ist, aufklappbar mit Evidenz und Score-Beitrag pro Anforderung." : "The requirement comparison shows each requirement with target vs. actual, expandable with evidence and score contribution per requirement."}</p>
          <p className="text-sm text-ink/75">{locale === "de" ? "Mehrfach-Matching erweitert diesen Ablauf um ausschreibungsseitige Filterung, Multiselect, Ergebnistabelle und Detail-Drilldown pro Bewerber." : "Batch matching extends this workflow with posting-side filtering, multi-select, result tables, and per-candidate drilldown."}</p>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-ink/10 bg-fog/70 p-6 shadow-panel">
        <h2 className="font-heading text-3xl">{locale === "de" ? "Hinweise" : "Notes"}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-ink/80">
          <li>{locale === "de" ? "Extraktionen, Scores und Interviewbewertungen werden KI-gestützt erstellt." : "Extractions, scores, and interview assessments are generated with AI assistance."}</li>
          <li>{locale === "de" ? "Die Datenstruktur nutzt produktive Persistenz (Supabase mit Row-Level Security)." : "The data structure uses production persistence (Supabase with Row-Level Security)."}</li>
          <li>{locale === "de" ? "Die Plattform wird kontinuierlich weiterentwickelt." : "The platform is being continuously developed."}</li>
        </ul>
      </section>
    </main>
  );
}
