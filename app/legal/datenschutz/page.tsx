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
              <p>WAMOCON GmbH<br />Mergenthalerallee 79 - 81<br />65760 Eschborn<br />Telefon: +49 6196 5838311<br />E-Mail: info@wamocon.com<br />Projektkontakt: info@kompetenzkompass.app<br />Geschäftsführer: Dipl.-Ing. Waleri Moretz<br />Handelsregister: Eschborn HRB 123666<br />USt-ID: DE344930486</p>

              <h3>2. Überblick über die Datenverarbeitung</h3>
              <p>Diese Datenschutzerklärung gilt für die Website und Webanwendung Kompetenzkompass. Kompetenzkompass ist eine digitale Plattform für Kompetenzanalyse, Skill-Matching, Projektdokumentation und Teamkoordination.</p>
              <p>Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Plattform sowie unserer Inhalte und Leistungen erforderlich ist. Die Verarbeitung personenbezogener Daten erfolgt regelmäßig nur nach Einwilligung des Nutzers oder auf einer anderen gesetzlichen Grundlage.</p>

              <h3>3. Rechtsgrundlagen der Verarbeitung</h3>
              <p>Die Verarbeitung personenbezogener Daten erfolgt auf folgenden Rechtsgrundlagen:</p>
              <ul>
                <li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</li>
                <li>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung oder vorvertragliche Maßnahmen)</li>
                <li>Art. 6 Abs. 1 lit. c DSGVO (Rechtliche Verpflichtung)</li>
                <li>Art. 6 Abs. 1 lit. f DSGVO (Berechtigtes Interesse)</li>
              </ul>

              <h3>4. Hosting und Infrastruktur</h3>
              <p>Unsere Plattform wird über moderne Cloud-Infrastruktur bereitgestellt. Wir nutzen insbesondere folgende Dienste:</p>
              <p><strong>Vercel Inc.</strong> — Hosting der Website und Webanwendung; Verarbeitung technisch notwendiger Verbindungsdaten (z. B. IP-Adresse, Zeitstempel, Browserinformationen). Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.</p>
              <p><strong>Supabase Inc.</strong> — Datenbank, Authentifizierung, Dateispeicher und Teile der Backend-Infrastruktur; Verarbeitung insbesondere von Authentifizierungsdaten, Session-Informationen, Projektdaten und gespeicherten Medien. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.</p>
              <p><strong>OpenAI, L.L.C.</strong> — Für KI-gestützte Funktionen können Texteingaben und daraus abgeleitete Inhalte verarbeitet werden. Die Verarbeitung erfolgt zur Bereitstellung der angeforderten Funktionen. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO und, soweit erforderlich, Art. 6 Abs. 1 lit. a DSGVO.</p>

              <h3>5. Registrierung und Authentifizierung</h3>
              <p>Für die Nutzung von Kompetenzkompass ist eine Registrierung erforderlich. Dabei werden insbesondere folgende Daten verarbeitet:</p>
              <ul>
                <li>E-Mail-Adresse</li>
                <li>Vor- und Nachname</li>
                <li>Passwort in gehashter Form</li>
                <li>Projektrolle innerhalb eines Projekts</li>
                <li>Session-Tokens und sicherheitsrelevante Authentifizierungsinformationen</li>
              </ul>
              <p>Die Authentifizierung erfolgt über Supabase Auth. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.</p>

              <h3>6. Datenverarbeitung auf der Plattform</h3>
              <p>Im Rahmen der Nutzung von Kompetenzkompass werden insbesondere folgende Kategorien personenbezogener und projektbezogener Daten verarbeitet:</p>
              <ul>
                <li>Projektstammdaten</li>
                <li>Anforderungen, Skill-Daten und Matching-Ergebnisse</li>
                <li>Kommentare, Rückfragen und Arbeitsanweisungen</li>
                <li>Statusverläufe und Fortschrittsdokumentationen</li>
                <li>Projektmitgliedschaften, Einladungen und Benachrichtigungseinstellungen</li>
              </ul>
              <p>Diese Daten werden zur Vertragserfüllung, Teamkoordination und nachvollziehbaren Projektdokumentation verarbeitet. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.</p>

              <h3>7. KI-gestützte Datenverarbeitung</h3>
              <p>Kompetenzkompass bietet KI-gestützte Funktionen zur Strukturierung, Auswertung und Aufbereitung von Inhalten. Dabei gelten folgende Grundsätze:</p>
              <ul>
                <li>Daten werden verschlüsselt an eingebundene KI-Dienste übertragen</li>
                <li>Die Verarbeitung dient ausschließlich der vom Nutzer ausgelösten Funktion</li>
                <li>Eine Nutzung zur allgemeinen Modellschulung durch uns erfolgt nicht</li>
                <li>KI-Ergebnisse sind Empfehlungen und ersetzen keine eigenständige Prüfung</li>
              </ul>

              <h3>8. Cookies und lokale Speicherung</h3>
              <p>Kompetenzkompass verwendet technisch notwendige Cookies und ähnliche Technologien, soweit dies für Anmeldung, Sitzungsverwaltung, Sicherheit und den Betrieb der Plattform erforderlich ist.</p>
              <p>Zusätzlich nutzt die Plattform lokale Browser-Speichertechnologien wie localStorage, IndexedDB und Service-Worker-Caches, um Spracheinstellungen, Offline-Daten und Synchronisationszustände lokal zu speichern.</p>
              <p>Tracking-, Werbe- oder Analyse-Cookies werden derzeit nicht eingesetzt.</p>

              <h3>9. Kontaktaufnahme</h3>
              <p>Wenn Sie uns per E-Mail kontaktieren, werden die von Ihnen mitgeteilten Daten verarbeitet, um Ihre Anfrage zu bearbeiten und für Anschlussfragen bereitzuhalten. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO; bei vertragsbezogenen Anfragen zusätzlich Art. 6 Abs. 1 lit. b DSGVO.</p>

              <h3>10. Webanalyse</h3>
              <p>Derzeit setzt Kompetenzkompass keine Webanalyse-, Tracking- oder Marketing-Tools ein. Sollte sich dies ändern, erfolgt die Verarbeitung nur auf Basis der jeweils erforderlichen gesetzlichen Grundlage.</p>

              <h3>11. SSL- bzw. TLS-Verschlüsselung</h3>
              <p>Diese Website und Webanwendung nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL- bzw. TLS-Verschlüsselung.</p>

              <h3>12. Weitergabe von Daten an Dritte</h3>
              <p>Eine Übermittlung personenbezogener Daten an Dritte findet grundsätzlich nur statt, wenn:</p>
              <ul>
                <li>Sie Ihre ausdrückliche Einwilligung erteilt haben</li>
                <li>Die Weitergabe zur Vertragserfüllung erforderlich ist</li>
                <li>Eine rechtliche Verpflichtung besteht</li>
                <li>Berechtigte Interessen die Weitergabe erfordern und keine überwiegenden Schutzinteressen entgegenstehen</li>
              </ul>
              <p>Im Rahmen der Auftragsverarbeitung setzen wir insbesondere Vercel, Supabase und KI-Dienste ein.</p>

              <h3>13. Speicherdauer und Datenlöschung</h3>
              <p>Personenbezogene Daten werden nur so lange gespeichert, wie dies für den jeweiligen Verarbeitungszweck erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.</p>
              <ul>
                <li>Kontodaten werden mit Löschung des Benutzerkontos gelöscht, sofern keine gesetzlichen Pflichten entgegenstehen.</li>
                <li>Projekt- und Matching-Daten werden grundsätzlich bis zur Löschung des jeweiligen Projekts oder Kontos gespeichert.</li>
                <li>Lokal gespeicherte Offline-Daten verbleiben auf dem Gerät, bis sie synchronisiert oder durch den Nutzer entfernt werden.</li>
              </ul>

              <h3>14. Rechte der betroffenen Personen</h3>
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
              <p>Wenden Sie sich an info@wamocon.com oder info@kompetenzkompass.app.</p>

              <h3>15. Beschwerderecht bei einer Aufsichtsbehörde</h3>
              <p>Unbeschadet eines anderweitigen verwaltungsrechtlichen oder gerichtlichen Rechtsbehelfs steht Ihnen das Recht auf Beschwerde bei einer Aufsichtsbehörde zu, wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten gegen die DSGVO verstößt.</p>

              <h3>16. Änderungen dieser Datenschutzerklärung</h3>
              <p>Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie stets den aktuellen rechtlichen Anforderungen anzupassen oder Änderungen unserer Leistungen umzusetzen. Für Ihren erneuten Besuch gilt dann die jeweils aktuelle Fassung.</p>
            </>
          ) : (
            <>
              <h3>1. Data Controller</h3>
              <p>The controller within the meaning of GDPR is:</p>
              <p>WAMOCON GmbH<br />Mergenthalerallee 79 - 81<br />65760 Eschborn<br />Phone: +49 6196 5838311<br />Email: info@wamocon.com<br />Project contact: info@kompetenzkompass.app<br />Managing Director: Dipl.-Ing. Waleri Moretz<br />Commercial register: Eschborn HRB 123666<br />VAT ID: DE344930486</p>

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

              <h3>16. Changes to this Privacy Policy</h3>
              <p>We reserve the right to update this Privacy Policy to ensure compliance with current legal requirements or to reflect changes in our services. The latest version applies when you revisit this page.</p>
            </>
          )}
        </article>
      </Card>
    </div>
  );
}
