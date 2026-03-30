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
          subtitle={t("legal.lastUpdated", { date: "30.03.2026" })}
        />
        <article className="prose prose-sm mt-6 max-w-none text-ink/80">
          {locale === "de" ? (
            <>
              <h3>§ 1 Geltungsbereich</h3>
              <p>(1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend &quot;AGB&quot;) der Kompetenzkompass GmbH, Musterstraße 1, 12345 Berlin (nachfolgend &quot;Anbieter&quot;), gelten für alle Verträge über die Nutzung der Software-as-a-Service-Plattform Kompetenzkompass (nachfolgend &quot;Plattform&quot;), die über die Website kompetenzkompass.de bereitgestellt wird.</p>
              <p>(2) Die Plattform richtet sich an Unternehmen, Personaldienstleister, Projektverantwortliche und sonstige gewerbliche Nutzer (nachfolgend &quot;Auftraggeber&quot;) sowie deren Benutzer (nachfolgend &quot;Nutzer&quot;). Es handelt sich um ein B2B-Angebot.</p>
              <p>(3) Abweichende, entgegenstehende oder ergänzende AGB des Auftraggebers werden nicht Vertragsbestandteil, es sei denn, der Anbieter stimmt deren Geltung ausdrücklich schriftlich zu.</p>
              <p>(4) Die Plattform wird laufend weiterentwickelt. Soweit einzelne Funktionen im Rahmen einer Pilot-, Test- oder Einführungsphase bereitgestellt werden, behält sich der Anbieter vor, den Funktionsumfang in diesen Bereichen zu ändern, zu erweitern oder einzuschränken.</p>

              <h3>§ 2 Vertragsschluss</h3>
              <p>(1) Die Darstellung der Plattform und ihrer Funktionen auf der Website stellt kein verbindliches Angebot dar, sondern eine Aufforderung zur Abgabe eines Angebots.</p>
              <p>(2) Der Auftraggeber gibt ein verbindliches Angebot zum Abschluss eines Nutzungsvertrages ab, indem er den Registrierungsprozess auf der Plattform abschließt und diese AGB akzeptiert.</p>
              <p>(3) Der Vertrag kommt zustande, wenn der Anbieter das Angebot durch Freischaltung des Zugangs annimmt.</p>

              <h3>§ 3 Leistungsbeschreibung</h3>
              <p>(1) Der Anbieter stellt dem Auftraggeber die Plattform Kompetenzkompass als Software-as-a-Service (SaaS) über das Internet zur Verfügung. Die Plattform ist eine KI-gestützte Lösung für automatisierte Kompetenzanalyse und Skill-Matching zwischen Projekten und Kandidaten.</p>
              <p>(2) Die Plattform umfasst insbesondere folgende Funktionsbereiche:</p>
              <ul>
                <li>Erfassung und Verwaltung von Projektanforderungen und Rollen</li>
                <li>Erstellung und Verwaltung von Ausschreibungen mit Skill-Anforderungen</li>
                <li>Analyse von Kandidatenprofilen mit KI-gestützter Extraktion</li>
                <li>Einzel- und Mehrfach-Matching mit erklärbaren Scores</li>
                <li>Kompetenzrad-Visualisierung und Anforderungsabgleich</li>
                <li>KI-generierte Interviewleitfäden</li>
                <li>Rollenbasiertes Berechtigungssystem und Mandantenfähigkeit</li>
              </ul>
              <p>(3) Der Funktionsumfang richtet sich nach dem gewählten Lizenzmodell (Free, Starter, Professional, Enterprise).</p>

              <h3>§ 4 Nutzungsrechte</h3>
              <p>(1) Der Anbieter räumt dem Auftraggeber für die Dauer des Vertragsverhältnisses ein einfaches, nicht übertragbares und nicht unterlizenzierbares Recht ein, die Plattform im Rahmen dieser AGB vertragsgemäß zu nutzen.</p>
              <p>(2) Alle Rechte an der Plattform, einschließlich der zugrundeliegenden Software, Algorithmen und Benutzeroberflächengestaltung, verbleiben beim Anbieter. Vom Auftraggeber eingestellte Inhalte verbleiben im Eigentum des Auftraggebers.</p>

              <h3>§ 5 Pflichten des Auftraggebers</h3>
              <p>(1) Der Auftraggeber ist verpflichtet, Zugangsdaten geheim zu halten und vor dem Zugriff unbefugter Dritter zu schützen.</p>
              <p>(2) Die Nutzer verpflichten sich, die Plattform ausschließlich für zulässige geschäftliche Zwecke zu nutzen, keine rechtswidrigen Inhalte hochzuladen und keine Sicherheitsmechanismen der Plattform zu umgehen.</p>
              <p>(3) Der Auftraggeber stellt den Anbieter von Ansprüchen Dritter frei, die auf einer rechtswidrigen Nutzung der Plattform beruhen.</p>

              <h3>§ 6 Vergütung und Zahlungsbedingungen</h3>
              <p>(1) Die Vergütung richtet sich nach dem gewählten Lizenzmodell. Die Abrechnung erfolgt monatlich.</p>
              <p>(2) Alle Preise verstehen sich zuzüglich der jeweils geltenden gesetzlichen Umsatzsteuer.</p>
              <p>(3) Preisänderungen werden mit einer Frist von 30 Tagen mitgeteilt.</p>

              <h3>§ 7 Gewährleistung</h3>
              <p>(1) Der Anbieter gewährleistet, dass die Plattform im Wesentlichen den beschriebenen Funktionen entspricht.</p>
              <p>(2) Mängel hat der Auftraggeber unverzüglich nach Entdeckung unter möglichst genauer Beschreibung zu melden.</p>

              <h3>§ 8 Haftung</h3>
              <p>(1) Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit sowie für vorsätzliche oder grob fahrlässige Pflichtverletzungen.</p>
              <p>(2) Bei leicht fahrlässiger Verletzung einer wesentlichen Vertragspflicht ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden beschränkt.</p>
              <p>(3) Die Ergebnisse des Skill-Matchings und der KI-gestützten Analysen stellen Empfehlungen dar und ersetzen keine eigenständige Prüfung. Eine Haftung für die inhaltliche Richtigkeit von KI-generierten Ausgaben ist ausgeschlossen.</p>
              <p>(4) Die Haftung nach dem Produkthaftungsgesetz bleibt unberührt.</p>

              <h3>§ 9 Datenschutz</h3>
              <p>(1) Der Anbieter verarbeitet personenbezogene Daten im Einklang mit der DSGVO und dem BDSG.</p>
              <p>(2) Einzelheiten zur Datenverarbeitung ergeben sich aus der Datenschutzerklärung.</p>
              <p>(3) Soweit der Anbieter im Auftrag personenbezogene Daten verarbeitet, kann ein gesonderter Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO abgeschlossen werden.</p>

              <h3>§ 10 Vertraulichkeit</h3>
              <p>(1) Die Parteien verpflichten sich, alle im Rahmen des Vertragsverhältnisses erlangten vertraulichen Informationen vertraulich zu behandeln.</p>
              <p>(2) Vom Auftraggeber hochgeladene Projektdaten, Kandidatenprofile und Matching-Ergebnisse werden ausschließlich für die vertragliche Leistungserbringung verwendet.</p>
              <p>(3) Soweit KI-Dienste eingebunden sind, erfolgt deren Nutzung ausschließlich zur Erbringung der angeforderten Funktionen. Eine Nutzung hochgeladener Inhalte zur allgemeinen Schulung eigener Modelle erfolgt nicht.</p>

              <h3>§ 11 Vertragslaufzeit und Kündigung</h3>
              <p>(1) Der Vertrag wird auf unbestimmte Zeit geschlossen, sofern nicht individuell eine feste Laufzeit vereinbart wird.</p>
              <p>(2) Der Vertrag kann jederzeit zum Ende des laufenden Abrechnungszeitraums gekündigt werden.</p>
              <p>(3) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.</p>
              <p>(4) Nach Beendigung des Vertrages wird der Zugang gesperrt. Der Auftraggeber erhält die Möglichkeit, seine Daten zu exportieren.</p>

              <h3>§ 12 Änderungen dieser AGB</h3>
              <p>(1) Der Anbieter ist berechtigt, diese AGB mit Wirkung für die Zukunft zu ändern, sofern dies für den Auftraggeber zumutbar ist.</p>
              <p>(2) Der Anbieter wird den Auftraggeber über Änderungen in Textform informieren. Der Auftraggeber kann den Änderungen innerhalb einer angemessenen Frist widersprechen.</p>

              <h3>§ 13 Schlussbestimmungen</h3>
              <p>(1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG).</p>
              <p>(2) Sofern der Auftraggeber Kaufmann ist, ist ausschließlicher Gerichtsstand für alle Streitigkeiten Berlin.</p>
              <p>(3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
              <p>(4) Mündliche Nebenabreden bestehen nicht. Änderungen bedürfen der Textform.</p>
            </>
          ) : (
            <>
              <h3>Section 1 — Scope</h3>
              <p>(1) These General Terms and Conditions (hereinafter &quot;GTC&quot;) of Kompetenzkompass GmbH, Musterstraße 1, 12345 Berlin (hereinafter &quot;Provider&quot;), apply to all contracts regarding the use of the Software-as-a-Service platform Kompetenzkompass (hereinafter &quot;Platform&quot;), provided via the website kompetenzkompass.de.</p>
              <p>(2) The Platform is directed at companies, HR service providers, project managers, and other commercial users (hereinafter &quot;Client&quot;) and their users (hereinafter &quot;Users&quot;). This is a B2B offering.</p>
              <p>(3) Deviating, conflicting, or supplementary terms of the Client do not become part of the contract unless the Provider expressly agrees in writing.</p>
              <p>(4) The Platform is continuously being developed. Where features are provided as part of a pilot or introductory phase, the Provider reserves the right to modify, extend, or limit the scope of functionality.</p>

              <h3>Section 2 — Contract Formation</h3>
              <p>(1) The presentation of the Platform and its features on the website does not constitute a binding offer but an invitation to submit an offer.</p>
              <p>(2) The Client submits a binding offer by completing the registration process on the Platform and accepting these GTC.</p>
              <p>(3) The contract is concluded when the Provider accepts the offer by activating the access.</p>

              <h3>Section 3 — Service Description</h3>
              <p>(1) The Provider makes the Platform Kompetenzkompass available to the Client as Software-as-a-Service (SaaS) via the internet. The Platform is an AI-powered solution for automated competency analysis and skill matching between projects and candidates.</p>
              <p>(2) The Platform includes the following core functionalities:</p>
              <ul>
                <li>Capture and management of project requirements and roles</li>
                <li>Creation and management of job postings with skill requirements</li>
                <li>Analysis of candidate profiles with AI-powered extraction</li>
                <li>Single and batch matching with explainable scores</li>
                <li>Competency wheel visualization and requirement comparison</li>
                <li>AI-generated interview guides</li>
                <li>Role-based permission system and multi-tenancy</li>
              </ul>
              <p>(3) The scope of functionality depends on the selected license plan (Free, Starter, Professional, Enterprise).</p>

              <h3>Section 4 — Usage Rights</h3>
              <p>(1) The Provider grants the Client a simple, non-transferable, and non-sublicensable right to use the Platform for the duration of the contractual relationship.</p>
              <p>(2) All rights to the Platform, including the underlying software, algorithms, and user interface design, remain with the Provider. Content uploaded by the Client remains the property of the Client.</p>

              <h3>Section 5 — Client Obligations</h3>
              <p>(1) The Client is obligated to keep access credentials confidential and protect them from unauthorized access.</p>
              <p>(2) Users agree to use the Platform exclusively for lawful business purposes, not to upload illegal content, and not to circumvent security mechanisms.</p>
              <p>(3) The Client indemnifies the Provider against third-party claims arising from unlawful use of the Platform.</p>

              <h3>Section 6 — Remuneration and Payment</h3>
              <p>(1) Remuneration is based on the selected license plan. Billing is monthly.</p>
              <p>(2) All prices are exclusive of applicable statutory value-added tax.</p>
              <p>(3) Price changes will be announced with 30 days&apos; notice.</p>

              <h3>Section 7 — Warranty</h3>
              <p>(1) The Provider warrants that the Platform substantially corresponds to the described functionalities.</p>
              <p>(2) Defects must be reported by the Client immediately upon discovery with as precise a description as possible.</p>

              <h3>Section 8 — Liability</h3>
              <p>(1) The Provider is liable without limitation for damages arising from injury to life, body, or health, as well as for intentional or grossly negligent breaches of duty.</p>
              <p>(2) In the case of slightly negligent breach of a material contractual obligation, liability is limited to the foreseeable, contract-typical damage.</p>
              <p>(3) The results of skill matching and AI-powered analyses are recommendations and do not replace independent review. Liability for the accuracy of AI-generated outputs is excluded.</p>
              <p>(4) Liability under the Product Liability Act remains unaffected.</p>

              <h3>Section 9 — Data Protection</h3>
              <p>(1) The Provider processes personal data in accordance with the GDPR and the BDSG.</p>
              <p>(2) Details of data processing are set out in the Privacy Policy.</p>
              <p>(3) Where the Provider processes personal data on behalf of the Client, a separate data processing agreement pursuant to Art. 28 GDPR may be concluded.</p>

              <h3>Section 10 — Confidentiality</h3>
              <p>(1) The parties agree to treat all confidential information obtained during the contractual relationship as confidential.</p>
              <p>(2) Project data, candidate profiles, and matching results uploaded by the Client are used exclusively for contractual service delivery.</p>
              <p>(3) Where AI services are integrated, their use is solely for providing the requested functions. Uploaded content is not used for general model training.</p>

              <h3>Section 11 — Term and Termination</h3>
              <p>(1) The contract is concluded for an indefinite period unless a fixed term is individually agreed.</p>
              <p>(2) The contract may be terminated at any time effective at the end of the current billing period.</p>
              <p>(3) The right to extraordinary termination for good cause remains unaffected.</p>
              <p>(4) After termination, access will be deactivated. The Client will be given the opportunity to export their data.</p>

              <h3>Section 12 — Amendments to these GTC</h3>
              <p>(1) The Provider is entitled to amend these GTC with effect for the future, provided this is reasonable for the Client.</p>
              <p>(2) The Provider will inform the Client of changes in text form. The Client may object within a reasonable period.</p>

              <h3>Section 13 — Final Provisions</h3>
              <p>(1) The law of the Federal Republic of Germany applies, excluding the UN Convention on Contracts for the International Sale of Goods (CISG).</p>
              <p>(2) If the Client is a merchant, the exclusive place of jurisdiction for all disputes is Berlin.</p>
              <p>(3) If individual provisions of these GTC are invalid, the validity of the remaining provisions remains unaffected.</p>
              <p>(4) No oral side agreements exist. Amendments require text form.</p>
            </>
          )}
        </article>
      </Card>
    </div>
  );
}
