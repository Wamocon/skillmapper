"use client";

import { useI18n } from "@/lib/i18n/context";
import { Card, CardHeader } from "@/components/ui/card";

export default function ImpressumPage() {
  const { t, locale } = useI18n();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="legal-card-wrapper">
      <Card padding="lg">
        <span className="legal-kicker">Rechtliches</span>
        <CardHeader
          title={t("legal.impressum")}
          subtitle={t("legal.lastUpdated", { date: "30.03.2026" })}
        />
        <article className="legal-article mt-6 max-w-none">
          <h3>{locale === "de" ? "Angaben gemäß § 5 TMG" : "Information pursuant to Section 5 TMG"}</h3>
          <p>
            WAMOCON GmbH<br />
            Mergenthalerallee 79 - 81<br />
            65760 Eschborn<br />
            {locale === "de" ? "Deutschland" : "Germany"}
          </p>

          <h3>{locale === "de" ? "Kontakt" : "Contact"}</h3>
          <p>
            {locale === "de" ? "Telefon" : "Phone"}: +49 6196 5838311<br />
            E-Mail: info@wamocon.com<br />
            {locale === "de" ? "Projektkontakt Kompetenzkompass" : "Project contact Kompetenzkompass"}: info@kompetenzkompass.app
          </p>

          <h3>{locale === "de" ? "Vertretungsberechtigter Geschäftsführer" : "Authorized Managing Director"}</h3>
          <p>Dipl.-Ing. Waleri Moretz</p>

          <h3>{locale === "de" ? "Registereintrag" : "Commercial register entry"}</h3>
          <p>
            {locale === "de" ? "Sitz der Gesellschaft" : "Registered office"}: Eschborn<br />
            {locale === "de" ? "Handelsregister" : "Commercial register"}: Eschborn HRB 123666<br />
            {locale === "de" ? "Umsatzsteuer-Identifikationsnummer" : "VAT identification number"}: DE344930486
          </p>

          <h3>{locale === "de" ? "Angaben zum Angebot" : "Service description"}</h3>
          <p>
            {locale === "de"
              ? "Kompetenzkompass ist eine webbasierte Software-as-a-Service-Plattform für KI-gestützte Kompetenzanalyse und Skill-Matching. Das Angebot richtet sich primär an Unternehmen, Personaldienstleister, Projektverantwortliche und sonstige gewerbliche Projektbeteiligte."
              : "Kompetenzkompass is a web-based Software-as-a-Service platform for AI-powered competency analysis and skill matching. The offering is primarily directed at companies, HR service providers, project managers, and other commercial project stakeholders."}
          </p>

          <h3>{locale === "de" ? "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV" : "Responsible for content pursuant to Section 18 para. 2 MStV"}</h3>
          <p>
            Dipl.-Ing. Waleri Moretz<br />
            WAMOCON GmbH<br />
            Mergenthalerallee 79 - 81<br />
            65760 Eschborn
          </p>

          <h3>{locale === "de" ? "Streitschlichtung" : "Dispute resolution"}</h3>
          <p>
            {locale === "de"
              ? "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."
              : "The European Commission provides a platform for online dispute resolution (ODR): https://ec.europa.eu/consumers/odr/. We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board."}
          </p>
        </article>
      </Card>
      </div>
    </div>
  );
}
