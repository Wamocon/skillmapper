"use client";

import { useI18n } from "@/lib/i18n/context";
import { Card, CardHeader } from "@/components/ui/card";

export default function AGBPage() {
  const { t, locale } = useI18n();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card padding="lg">
        <CardHeader
          title={t("legal.agb")}
          subtitle={t("legal.lastUpdated", { date: "24.03.2026" })}
        />
        <article className="prose prose-sm mt-6 max-w-none text-ink/80">
          {locale === "de" ? (
            <>
              <h3>§ 1 Geltungsbereich</h3>
              <p>Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der Skillmapper-Plattform (nachfolgend &quot;Plattform&quot;) durch den Nutzer. Die Plattform wird von der Skillmapper GmbH betrieben.</p>

              <h3>§ 2 Vertragsgegenstand</h3>
              <p>Die Plattform stellt Werkzeuge zur automatisierten Kompetenzanalyse und zum Matching von Projekten und Kandidaten bereit. Der Funktionsumfang richtet sich nach dem gewählten Lizenzmodell.</p>

              <h3>§ 3 Registrierung und Nutzerkonto</h3>
              <p>Für die Nutzung ist eine Registrierung erforderlich. Der Nutzer ist verpflichtet, wahrheitsgemäße Angaben zu machen und seine Zugangsdaten vor unbefugtem Zugriff zu schützen. Die Verifizierung der Telefonnummer ist Bestandteil des Registrierungsprozesses.</p>

              <h3>§ 4 Lizenzmodelle und Zahlungsbedingungen</h3>
              <p>Die Plattform bietet verschiedene Lizenzmodelle (Free, Starter, Professional, Enterprise) mit unterschiedlichem Funktionsumfang. Die Abrechnung erfolgt monatlich. Preisänderungen werden mit einer Frist von 30 Tagen mitgeteilt.</p>

              <h3>§ 5 Datenschutz</h3>
              <p>Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung und den geltenden Datenschutzgesetzen (DSGVO).</p>

              <h3>§ 6 Haftung</h3>
              <p>Die Ergebnisse des Skill-Mappings und Matchings stellen Empfehlungen dar und ersetzen keine eigenständige Prüfung. Eine Haftung für die Richtigkeit der automatisierten Auswertungen wird ausgeschlossen.</p>

              <h3>§ 7 Kündigung</h3>
              <p>Der Vertrag kann jederzeit zum Ende des laufenden Abrechnungszeitraums gekündigt werden. Bei Verstoß gegen diese AGB behält sich der Betreiber das Recht vor, das Nutzerkonto zu sperren.</p>

              <h3>§ 8 Schlussbestimmungen</h3>
              <p>Es gilt deutsches Recht. Gerichtsstand ist der Sitz des Betreibers. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
            </>
          ) : (
            <>
              <h3>Section 1 Scope</h3>
              <p>These Terms of Service apply to the use of the Skillmapper platform (hereinafter referred to as the &quot;platform&quot;) by the user. The platform is operated by Skillmapper GmbH.</p>

              <h3>Section 2 Subject Matter</h3>
              <p>The platform provides tools for automated competency analysis and matching between projects and candidates. The available functionality depends on the selected license plan.</p>

              <h3>Section 3 Registration and User Account</h3>
              <p>Registration is required to use the platform. The user must provide truthful information and protect their access credentials against unauthorized access. Phone verification is part of the registration process.</p>

              <h3>Section 4 License Plans and Payment Terms</h3>
              <p>The platform offers various license plans (Free, Starter, Professional, Enterprise) with different feature scopes. Billing is monthly. Price changes will be announced with 30 days' notice.</p>

              <h3>Section 5 Data Protection</h3>
              <p>Personal data is processed in accordance with our Privacy Policy and applicable data protection laws.</p>

              <h3>Section 6 Liability</h3>
              <p>The results of skill mapping and matching are recommendations and do not replace independent review. Liability for the accuracy of automated evaluations is excluded.</p>

              <h3>Section 7 Termination</h3>
              <p>The agreement may be terminated at any time effective at the end of the current billing period. In the event of a breach of these terms, the operator reserves the right to suspend the user account.</p>

              <h3>Section 8 Final Provisions</h3>
              <p>German law applies. The place of jurisdiction is the registered office of the operator. If individual provisions are invalid, the validity of the remaining provisions remains unaffected.</p>
            </>
          )}
        </article>
      </Card>
    </div>
  );
}
