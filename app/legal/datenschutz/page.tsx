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
          subtitle={t("legal.lastUpdated", { date: "30.03.2026" })}
        />
        <article className="prose prose-sm mt-6 max-w-none text-ink/80">
          {locale === "de" ? (
            <>
              <h3>1. Verantwortlicher</h3>
              <p>Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und anderer nationaler Datenschutzgesetze ist:</p>
              <p>Kompetenzkompass GmbH<br />Musterstraße 1<br />12345 Berlin<br />E-Mail: datenschutz@kompetenzkompass.de<br />Geschäftsführer: Max Mustermann</p>

              <h3>2. Überblick über die Datenverarbeitung</h3>
              <p>Diese Datenschutzerklärung gilt für die Website und Webanwendung Kompetenzkompass. Kompetenzkompass ist eine KI-gestützte Plattform für automatisierte Kompetenzanalyse und Skill-Matching zwischen Projekten und Kandidaten.</p>
              <p>Wir verarbeiten personenbezogene Daten grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Plattform sowie unserer Inhalte und Leistungen erforderlich ist.</p>

              <h3>3. Rechtsgrundlagen der Verarbeitung</h3>
              <p>Die Verarbeitung personenbezogener Daten erfolgt auf folgenden Rechtsgrundlagen:</p>
              <ul>
                <li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</li>
                <li>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</li>
                <li>Art. 6 Abs. 1 lit. c DSGVO (Rechtliche Verpflichtung)</li>
                <li>Art. 6 Abs. 1 lit. f DSGVO (Berechtigtes Interesse)</li>
              </ul>

              <h3>4. Hosting und Infrastruktur</h3>
              <p>Unsere Plattform wird über moderne Cloud-Infrastruktur bereitgestellt:</p>
              <p><strong>Vercel Inc.</strong> — Die Website und Webanwendung werden über Vercel gehostet. Dabei verarbeitet Vercel technisch notwendige Verbindungsdaten wie IP-Adresse, Zeitstempel und Browserinformationen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.</p>
              <p><strong>Supabase Inc.</strong> — Für Datenbank, Authentifizierung und Teile der Backend-Infrastruktur nutzen wir Supabase. Verarbeitet werden insbesondere Authentifizierungsdaten, Session-Informationen und Projektdaten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.</p>

              <h3>5. Erhobene Daten</h3>
              <p>Wir verarbeiten folgende personenbezogene Daten:</p>
              <ul>
                <li>Registrierungsdaten: Name, E-Mail-Adresse, Telefonnummer</li>
                <li>Nutzungsdaten: Projekte, Kandidatenprofile, Matching-Ergebnisse, Kommentare</li>
                <li>Technische Daten: IP-Adresse, Browser-Typ, Zugriffszeiten</li>
                <li>Session-Tokens und sicherheitsrelevante Authentifizierungsinformationen</li>
              </ul>

              <h3>6. Zweck der Verarbeitung</h3>
              <p>Die Datenverarbeitung dient insbesondere:</p>
              <ul>
                <li>Bereitstellung und Betrieb der Plattform</li>
                <li>Durchführung des KI-gestützten Skill-Matchings</li>
                <li>Extraktion und Analyse von Kompetenzprofilen</li>
                <li>Verifizierung der Telefonnummer</li>
                <li>Lizenz- und Abrechnungsverwaltung</li>
              </ul>

              <h3>7. KI-gestützte Datenverarbeitung</h3>
              <p>Kompetenzkompass nutzt KI-Dienste zur Extraktion von Kompetenzprofilen, zum Score-Matching und zur Generierung von Interviewleitfäden. Dabei gelten folgende Grundsätze:</p>
              <ul>
                <li>Profildaten werden zur KI-Analyse an den eingebundenen Dienst übertragen</li>
                <li>Die Verarbeitung dient ausschließlich der vom Nutzer ausgelösten Funktionalität</li>
                <li>Eine Verwendung der Daten zur allgemeinen Modellschulung erfolgt nicht</li>
                <li>Die KI-Ergebnisse stellen Empfehlungen dar und ersetzen keine eigenständige Prüfung</li>
              </ul>

              <h3>8. Datenweitergabe</h3>
              <p>Eine Übermittlung personenbezogener Daten an Dritte findet grundsätzlich nur statt, wenn:</p>
              <ul>
                <li>Sie Ihre ausdrückliche Einwilligung erteilt haben</li>
                <li>Die Weitergabe zur Vertragserfüllung erforderlich ist</li>
                <li>Eine rechtliche Verpflichtung besteht</li>
                <li>Berechtigte Interessen die Weitergabe erfordern</li>
              </ul>
              <p>Im Rahmen der Auftragsverarbeitung setzen wir insbesondere Vercel und Supabase ein.</p>

              <h3>9. Datensicherheit</h3>
              <p>Wir setzen technische und organisatorische Maßnahmen ein, um Ihre Daten zu schützen. Dazu gehören SSL/TLS-Verschlüsselung, Row-Level Security auf Datenbankebene und regelmäßige Sicherheitsaudits.</p>

              <h3>10. Cookies und lokale Speicherung</h3>
              <p>Die Plattform verwendet technisch notwendige Cookies für die Session-Verwaltung. Zusätzlich nutzt die Plattform lokale Browser-Speichertechnologien wie localStorage für Spracheinstellungen und Sitzungsdaten.</p>
              <p>Tracking-, Werbe- oder Analyse-Cookies werden derzeit nicht eingesetzt.</p>

              <h3>11. Speicherdauer und Datenlöschung</h3>
              <p>Personenbezogene Daten werden nur so lange gespeichert, wie dies für den jeweiligen Verarbeitungszweck erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.</p>

              <h3>12. Ihre Rechte</h3>
              <p>Ihnen stehen folgende Rechte gemäß DSGVO zu:</p>
              <ul>
                <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
                <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
                <li>Recht auf Löschung (Art. 17 DSGVO)</li>
                <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Recht auf Widerspruch (Art. 21 DSGVO)</li>
                <li>Recht auf Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
              </ul>
              <p>Wenden Sie sich an datenschutz@kompetenzkompass.de.</p>

              <h3>13. Beschwerderecht</h3>
              <p>Unbeschadet eines anderweitigen Rechtsbehelfs steht Ihnen das Recht auf Beschwerde bei einer Aufsichtsbehörde zu, wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten gegen die DSGVO verstößt.</p>

              <h3>14. Änderungen dieser Datenschutzerklärung</h3>
              <p>Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie stets den aktuellen rechtlichen Anforderungen anzupassen oder Änderungen unserer Leistungen umzusetzen.</p>
            </>
          ) : (
            <>
              <h3>1. Data Controller</h3>
              <p>The controller within the meaning of GDPR is:</p>
              <p>Kompetenzkompass GmbH<br />Musterstraße 1<br />12345 Berlin<br />Email: datenschutz@kompetenzkompass.de<br />Managing Director: Max Mustermann</p>

              <h3>2. Overview of Data Processing</h3>
              <p>This Privacy Policy applies to the website and web application Kompetenzkompass. Kompetenzkompass is an AI-powered platform for automated competency analysis and skill matching between projects and candidates.</p>
              <p>We process personal data only to the extent necessary to provide a functional platform and our content and services.</p>

              <h3>3. Legal Bases for Processing</h3>
              <p>Processing of personal data is carried out on the following legal bases:</p>
              <ul>
                <li>Art. 6 para. 1 lit. a GDPR (Consent)</li>
                <li>Art. 6 para. 1 lit. b GDPR (Performance of contract)</li>
                <li>Art. 6 para. 1 lit. c GDPR (Legal obligation)</li>
                <li>Art. 6 para. 1 lit. f GDPR (Legitimate interest)</li>
              </ul>

              <h3>4. Hosting and Infrastructure</h3>
              <p>Our platform is provided through modern cloud infrastructure:</p>
              <p><strong>Vercel Inc.</strong> — The website and web application are hosted via Vercel. Vercel processes technically necessary connection data such as IP address, timestamp, and browser information. Legal basis: Art. 6 para. 1 lit. f GDPR.</p>
              <p><strong>Supabase Inc.</strong> — For database, authentication, and parts of the backend infrastructure, we use Supabase. Authentication data, session information, and project data are processed. Legal basis: Art. 6 para. 1 lit. b GDPR.</p>

              <h3>5. Collected Data</h3>
              <p>We process the following personal data:</p>
              <ul>
                <li>Registration data: name, email address, phone number</li>
                <li>Usage data: projects, candidate profiles, matching results, comments</li>
                <li>Technical data: IP address, browser type, access times</li>
                <li>Session tokens and security-relevant authentication information</li>
              </ul>

              <h3>6. Purpose of Processing</h3>
              <p>Data processing serves the following purposes:</p>
              <ul>
                <li>Providing and operating the platform</li>
                <li>Performing AI-powered skill matching</li>
                <li>Extracting and analyzing competency profiles</li>
                <li>Phone number verification</li>
                <li>Managing licensing and billing</li>
              </ul>

              <h3>7. AI-Powered Data Processing</h3>
              <p>Kompetenzkompass uses AI services for competency profile extraction, score matching, and interview guide generation. The following principles apply:</p>
              <ul>
                <li>Profile data is transmitted to the integrated AI service for analysis</li>
                <li>Processing serves exclusively the functionality requested by the user</li>
                <li>Data is not used for general model training</li>
                <li>AI results are recommendations and do not replace independent review</li>
              </ul>

              <h3>8. Data Sharing</h3>
              <p>Personal data is shared with third parties only when:</p>
              <ul>
                <li>You have given your express consent</li>
                <li>Sharing is necessary for contract fulfillment</li>
                <li>There is a legal obligation</li>
                <li>Legitimate interests require sharing</li>
              </ul>
              <p>As part of commissioned processing, we use Vercel and Supabase in particular.</p>

              <h3>9. Data Security</h3>
              <p>We implement technical and organizational measures to protect your data, including SSL/TLS encryption, row-level security at database level, and regular security audits.</p>

              <h3>10. Cookies and Local Storage</h3>
              <p>The platform uses technically necessary cookies for session management. Additionally, the platform uses local browser storage technologies like localStorage for language settings and session data.</p>
              <p>Tracking, advertising, or analytics cookies are currently not used.</p>

              <h3>11. Data Retention and Deletion</h3>
              <p>Personal data is stored only as long as necessary for the respective processing purpose or as required by legal retention obligations.</p>

              <h3>12. Your Rights</h3>
              <p>You have the following rights under GDPR:</p>
              <ul>
                <li>Right of access (Art. 15 GDPR)</li>
                <li>Right to rectification (Art. 16 GDPR)</li>
                <li>Right to erasure (Art. 17 GDPR)</li>
                <li>Right to restriction of processing (Art. 18 GDPR)</li>
                <li>Right to data portability (Art. 20 GDPR)</li>
                <li>Right to object (Art. 21 GDPR)</li>
                <li>Right to withdraw consent (Art. 7 para. 3 GDPR)</li>
              </ul>
              <p>Please contact datenschutz@kompetenzkompass.de.</p>

              <h3>13. Right to Lodge a Complaint</h3>
              <p>Without prejudice to any other remedy, you have the right to lodge a complaint with a supervisory authority if you believe that the processing of your personal data violates the GDPR.</p>

              <h3>14. Changes to this Privacy Policy</h3>
              <p>We reserve the right to update this Privacy Policy to ensure compliance with current legal requirements or to reflect changes in our services.</p>
            </>
          )}
        </article>
      </Card>
    </div>
  );
}
