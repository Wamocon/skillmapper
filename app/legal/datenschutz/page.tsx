"use client";

import { useI18n } from "@/lib/i18n/context";
import { Card, CardHeader } from "@/components/ui/card";

export default function DatenschutzPage() {
  const { t, locale } = useI18n();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card padding="lg">
        <CardHeader
          title={t("legal.datenschutz")}
          subtitle={t("legal.lastUpdated", { date: "24.03.2026" })}
        />
        <article className="prose prose-sm mt-6 max-w-none text-ink/80">
          {locale === "de" ? (
            <>
              <h3>1. Verantwortlicher</h3>
              <p>Verantwortlicher im Sinne der DSGVO ist die Kompetenzkompass GmbH, Musterstraße 1, 12345 Berlin, E-Mail: datenschutz@kompetenzkompass.de</p>

              <h3>2. Erhobene Daten</h3>
              <p>Wir verarbeiten folgende personenbezogene Daten:</p>
              <ul>
                <li>Registrierungsdaten: Name, E-Mail-Adresse, Telefonnummer</li>
                <li>Nutzungsdaten: Projekte, Kandidatenprofile, Matching-Ergebnisse</li>
                <li>Technische Daten: IP-Adresse, Browser-Typ, Zugriffszeiten</li>
              </ul>

              <h3>3. Zweck der Verarbeitung</h3>
              <p>Die Datenverarbeitung dient:</p>
              <ul>
                <li>Bereitstellung und Betrieb der Plattform</li>
                <li>Durchführung des Skill-Matchings</li>
                <li>Verifizierung der Telefonnummer via WhatsApp/SMS</li>
                <li>Lizenz- und Abrechnungsverwaltung</li>
              </ul>

              <h3>4. Rechtsgrundlagen</h3>
              <p>Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. a (Einwilligung), lit. b (Vertragserfüllung) und lit. f (berechtigtes Interesse) DSGVO.</p>

              <h3>5. Datenweitergabe</h3>
              <p>Eine Weitergabe an Dritte erfolgt nur im Rahmen der Vertragserfüllung (z.B. Zahlungsdienstleister) oder bei gesetzlicher Verpflichtung. Die Telefonverifizierung erfolgt über einen spezialisierten Dienstleister.</p>

              <h3>6. Datensicherheit</h3>
              <p>Wir setzen technische und organisatorische Maßnahmen ein, um Ihre Daten zu schützen. Dazu gehören Verschlüsselung, Row-Level Security auf Datenbankebene und regelmäßige Sicherheitsaudits.</p>

              <h3>7. Ihre Rechte</h3>
              <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Wenden Sie sich an datenschutz@kompetenzkompass.de.</p>

              <h3>8. Cookies</h3>
              <p>Die Plattform verwendet technisch notwendige Cookies für die Session-Verwaltung. Analytische Cookies werden nur mit Ihrer Einwilligung eingesetzt.</p>
            </>
          ) : (
            <>
              <h3>1. Data Controller</h3>
              <p>The controller within the meaning of GDPR is Kompetenzkompass GmbH, Musterstraße 1, 12345 Berlin, email: datenschutz@kompetenzkompass.de</p>

              <h3>2. Collected Data</h3>
              <p>We process the following personal data:</p>
              <ul>
                <li>Registration data: name, email address, phone number</li>
                <li>Usage data: projects, candidate profiles, matching results</li>
                <li>Technical data: IP address, browser type, access times</li>
              </ul>

              <h3>3. Purpose of Processing</h3>
              <p>Data processing serves the following purposes:</p>
              <ul>
                <li>Providing and operating the platform</li>
                <li>Performing skill matching</li>
                <li>Verifying phone numbers via WhatsApp/SMS</li>
                <li>Managing licensing and billing</li>
              </ul>

              <h3>4. Legal Bases</h3>
              <p>Processing is carried out based on Art. 6 para. 1 lit. a (consent), lit. b (performance of contract), and lit. f (legitimate interest) GDPR.</p>

              <h3>5. Data Sharing</h3>
              <p>Data is shared with third parties only as part of contract fulfillment (e.g. payment providers) or where legally required. Phone verification is performed through a specialized service provider.</p>

              <h3>6. Data Security</h3>
              <p>We implement technical and organizational measures to protect your data. These include encryption, row-level security at database level, and regular security audits.</p>

              <h3>7. Your Rights</h3>
              <p>You have the right to access, rectification, deletion, restriction of processing, data portability, and objection. Please contact datenschutz@kompetenzkompass.de.</p>

              <h3>8. Cookies</h3>
              <p>The platform uses technically necessary cookies for session management. Analytical cookies are only used with your consent.</p>
            </>
          )}
        </article>
      </Card>
    </div>
  );
}
