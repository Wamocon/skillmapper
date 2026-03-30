"use client";

import { useI18n } from "@/lib/i18n/context";
import { Card, CardHeader } from "@/components/ui/card";

export default function ImpressumPage() {
  const { t, locale } = useI18n();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card padding="lg">
        <CardHeader
          title={t("legal.impressum")}
          subtitle={t("legal.lastUpdated", { date: "30.03.2026" })}
        />
        <article className="prose prose-sm mt-6 max-w-none text-ink/80">
          <h3>{locale === "de" ? "Angaben gemäß § 5 TMG" : "Information pursuant to Section 5 TMG"}</h3>
          <p>
            Kompetenzkompass GmbH<br />
            Musterstraße 1<br />
            12345 Berlin<br />
            {locale === "de" ? "Deutschland" : "Germany"}
          </p>

          <h3>{locale === "de" ? "Kontakt" : "Contact"}</h3>
          <p>
            {locale === "de" ? "Telefon" : "Phone"}: +49 (0) 30 12345678<br />
            E-Mail: info@kompetenzkompass.de
          </p>

          <h3>{locale === "de" ? "Vertretungsberechtigter Geschäftsführer" : "Authorized Managing Director"}</h3>
          <p>Max Mustermann</p>

          <h3>{locale === "de" ? "Registereintrag" : "Commercial register entry"}</h3>
          <p>
            {locale === "de" ? "Sitz der Gesellschaft" : "Registered office"}: Berlin<br />
            {locale === "de" ? "Handelsregister" : "Commercial register"}: Amtsgericht Berlin-Charlottenburg<br />
            {locale === "de" ? "Registernummer" : "Registration number"}: HRB 123456
          </p>

          <h3>{locale === "de" ? "Umsatzsteuer-ID" : "VAT ID"}</h3>
          <p>
            {locale === "de" ? "Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:" : "VAT identification number pursuant to Section 27 a of the German VAT Act:"}<br />
            DE 123456789
          </p>

          <h3>{locale === "de" ? "Angaben zum Angebot" : "Service description"}</h3>
          <p>
            {locale === "de"
              ? "Kompetenzkompass ist eine webbasierte Software-as-a-Service-Plattform für KI-gestützte Kompetenzanalyse und Skill-Matching. Das Angebot richtet sich primär an Unternehmen, Personaldienstleister, Projektverantwortliche und gewerbliche Nutzer."
              : "Kompetenzkompass is a web-based Software-as-a-Service platform for AI-powered competency analysis and skill matching. The offering is primarily directed at companies, HR service providers, project managers, and commercial users."}
          </p>

          <h3>{locale === "de" ? "Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV" : "Responsible for content pursuant to Section 55 para. 2 RStV"}</h3>
          <p>
            Max Mustermann<br />
            Kompetenzkompass GmbH<br />
            Musterstraße 1<br />
            12345 Berlin
          </p>

          <h3>{locale === "de" ? "Streitschlichtung" : "Dispute resolution"}</h3>
          <p>
            {locale === "de"
              ? "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."
              : "The European Commission provides a platform for online dispute resolution (ODR). We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board."}
          </p>
        </article>
      </Card>
    </div>
  );
}
