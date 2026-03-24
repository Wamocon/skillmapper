## Plan: Skillmapper Konzept

Skillmapper wird als dokumenten- und interviewzentrierte Matching-Plattform konzipiert, die Ausschreibungen, Projektbeschreibungen und Bewerbungsunterlagen in ein standardisiertes Anforderungs- und Skillmodell überführt. Empfohlen ist ein modularer Greenfield-Aufbau mit Hybrid-Taxonomie, nachvollziehbarer KI-Extraktion, human-in-the-loop Freigaben und einer Architektur, die zunächst cloud- bzw. EU-hosted arbeiten kann, aber später on-prem optional bleibt.

**Steps**
1. Phase 1: Fachliches Zielmodell definieren. Gemeinsames kanonisches Datenmodell für Anforderungen, Skills, Evidenzen, Kandidatenprofile, Interviewfragen und Interviewbewertungen festlegen. Diese Phase blockiert alle Folgephasen, weil Extraktion, Matching und UI dieselbe Struktur nutzen müssen.
2. Phase 1: Standardisiertes Layout definieren. Zielschemas für Projektauswertung, Nutzwertanalyse, Kandidatenprofil, Matching-Ergebnis und Interviewauswertung festlegen. Diese Schemata bilden die Ausgabeoberfläche und zugleich die JSON-Zielstruktur für KI-Extraktion.
3. Phase 1: Hybrid-Taxonomie entwerfen. Eigenes Skill- und Anforderungsmodell mit Mapping auf ESCO/SFIA vorsehen. Muss-Have-, Soll-, Kann- und Kontextanforderungen inklusive Gewichtung, Seniorität, Domäne, Zertifizierungen, Sprachkenntnissen und Verfügbarkeit aufnehmen. Parallel mit Schritt 2 möglich, aber vor Matching-Design abschließen.
4. Phase 2: Dokumentenaufnahme spezifizieren. Upload- und Parsing-Pipeline für PDF, DOCX, XLSX, TXT, Notizen und optional Bild-/Scan-Dokumente definieren. Rohdatei, extrahierter Text, Struktursegmente, Metadaten und Quellenverweise getrennt speichern. Abhängig von Schritt 1.
5. Phase 2: Extraktionslogik je Dokumenttyp entwerfen. Für Ausschreibungen Anforderungen, Erwartungshaltungen, Projektkontext, Lieferobjekte und Prioritäten extrahieren. Für CVs und Onepager Skills, Erfahrungsdauer, Einsatzkontext, Projektnachweise, Rollen, Branchen und Aktualität extrahieren. Felder immer mit Quelle, Confidence und Review-Status zurückgeben. Abhängig von Schritt 4.
6. Phase 2: Human-in-the-loop definieren. Niedrige Confidence, widersprüchliche Aussagen, fehlende Kernangaben und kritische Matching-Auswirkungen in eine Review-Warteschlange leiten. Fachanwender müssen extrahierte Felder bestätigen, korrigieren oder verwerfen können. Parallel mit Schritt 5 möglich.
7. Phase 3: Matching-Engine spezifizieren. Kombination aus regelbasierter Muss-Have-Prüfung, gewichteter Nutzwertanalyse und semantischer Ähnlichkeit definieren. Score in Teilwerte zerlegen: Pflichtabdeckung, fachliche Tiefe, Kontextpassung, Erfahrungsniveau, Verfügbarkeit, Sprache, Domänenfit. Abhängig von Schritten 1 bis 6.
8. Phase 3: Gap- und Empfehlungssystem entwerfen. Überschneidungen, Defizite, unklare Behauptungen und Nachweislücken getrennt ausweisen. Empfehlungen in drei Klassen strukturieren: geeignet, bedingt geeignet mit Klärungsbedarf, nicht geeignet wegen kritischer Lücken. Abhängig von Schritt 7.
9. Phase 3: Interview-Fragebogenlogik definieren. Automatisch oder KI-gestützt Fragen aus Muss-Haves, Gaps, Widersprüchen und kritischen Skillbehauptungen erzeugen. Fragen nach Validierungsziel, erwarteter Evidenz, Follow-up-Hinweisen und Bewertungsrubrik strukturieren. Abhängig von Schritten 5 bis 8.
10. Phase 4: Interviewanalyse spezifizieren. Manuelle Notizen, Transkripte und Audio mit Zustimmung beider Seiten unterstützen. Gesprächsinhalte gegen CV-Aussagen, Projektanforderungen und Fragebogenrubriken spiegeln. Ergebnisfelder: Bestätigt, teilweise bestätigt, nicht belegt, widersprüchlich, auffällige Vertiefung. Abhängig von Schritt 9.
11. Phase 4: Governance und Compliance verankern. Rollenmodell, Einwilligungen, Löschfristen, Protokollierung, PII-Schutz, Bias-Kontrollen, Erklärbarkeit und menschliche Übersteuerbarkeit festschreiben. Für Audio/Interviewanalyse explizite Consent-Flows und revisionssichere Historie einplanen. Parallel mit Schritten 4 bis 10, aber vor Produktivbetrieb verbindlich.
12. Phase 4: Zielarchitektur festlegen. Backend bevorzugt Python/FastAPI wegen Parser- und KI-Ökosystem. Pipeline-Stufen: Ingestion, Parsing/OCR, Segmentierung, strukturierte Extraktion, Normalisierung, Matching, Fragebogenerstellung, Interviewanalyse, Review, Reporting. Speicherung in Blob Store plus Postgres/JSONB oder Dokumentenmodell, optional Vektorsuche für semantische Abgleiche. Abhängig von Schritten 4 bis 11.
13. Phase 5: UX-Konzept definieren. Kernansichten: Dashboard, Projektanalyse, Kandidatenakte, Matching-Vergleich, Review-Queue, Interviewleitfaden, Interviewanalyse, Audit-Historie. Jede KI-Aussage muss Quelle, Confidence und Bearbeitungsstatus anzeigen. Abhängig von Schritten 2 bis 12.
14. Phase 5: MVP-Schnitt festlegen. Erste Version auf PDF/DOCX/XLSX/TXT, Projektanalyse, CV-Extraktion, Matching, Gap-Darstellung, Fragebogenentwurf und Interviewnotizen/Transkripte begrenzen. Audioanalyse nur dann im MVP, wenn Consent-, Transkriptions- und Datenschutzpfad früh abgesichert werden können.
15. Phase 5: Bewertungs- und Teststrategie definieren. Golden Dataset mit realen anonymisierten Ausschreibungen, CVs und Interviews anlegen. Extraktionsgüte, Halluzinationsrate, Matching-Stabilität, Fragequalität und Interviewkonsistenz gegen manuell kuratierte Erwartungswerte prüfen. Abhängig von Schritten 5 bis 14.
16. Phase 6: Delivery-Roadmap planen. MVP, Erweiterung, Enterprise-Härtung und On-prem-Option in getrennte Releases schneiden. Nur nach abgeschlossener Test- und Governance-Definition priorisieren.

**Relevant files**
- d:/Testprojekt/Skillmapper/docs/product-concept.md — Zieldokument für Fachkonzept, Rollen, Prozesse, Business-Regeln und Scope.
- d:/Testprojekt/Skillmapper/docs/domain-model.md — Kanonisches Datenmodell für Anforderungen, Skills, Evidenzen, Matches und Interviewbewertungen.
- d:/Testprojekt/Skillmapper/docs/scoring-model.md — Matchinglogik, Gewichtung, Nutzwertanalyse, Explainability und Score-Zerlegung.
- d:/Testprojekt/Skillmapper/docs/interview-framework.md — Fragebogengenerierung, Bewertungsrubriken, Consent-Regeln, Auswertungslogik.
- d:/Testprojekt/Skillmapper/docs/architecture.md — Zielarchitektur, Pipeline-Stufen, Schnittstellen, Speicher- und Betriebsmodell.
- d:/Testprojekt/Skillmapper/docs/privacy-and-governance.md — Datenschutz, Rollenmodell, Audit, Bias- und Retention-Regeln.
- d:/Testprojekt/Skillmapper/docs/mvp-roadmap.md — Lieferphasen, Abhängigkeiten, Risiken und Verifikationspunkte.

**Verification**
1. Fachliche Walkthroughs mit Beispiel-Ausschreibung, Beispiel-CV und Beispiel-Interview durchführen und prüfen, ob alle Pflichtinformationen in die Zielschemas überführt werden können.
2. Für 20 bis 30 Beispieldokumente je Dokumenttyp testen, ob Parsing, Segmentierung und strukturierte Extraktion reproduzierbar und mit Quellenzitaten möglich sind.
3. Matching-Ergebnisse manuell gegen eine Referenz-Nutzwertanalyse vergleichen und Abweichungen pro Teilscore nachvollziehen.
4. Prüfen, ob jede KI-Aussage eine Quelle, Confidence, Versionsbezug und menschliche Übersteuerung besitzt.
5. Datenschutz-Review für Consent, Audioverarbeitung, Löschkonzept, Zugriffsrechte und On-prem-Option durchführen.
6. MVP-Grenzen gegen Aufwand, Risiko und Time-to-Value challengen und alles außerhalb des MVP explizit aus dem ersten Release ausschließen.

**Decisions**
- Zielgruppe ist beides: interne Recruiting-/Fachbereichsteams und Personalberatungen. Mandantenfähigkeit und rollenbasierte Sichtbarkeit sollten daher früh mitgedacht werden.
- Standard ist Hybrid: internes Datenmodell mit Mapping auf ESCO/SFIA, um eigene Flexibilität und spätere Interoperabilität zu kombinieren.
- Datenschutz-Zielbild ist zunächst cloud- bzw. EU-hosted mit späterer on-prem-Option. Architektur, Logging und Modellzugriffe dürfen diese Option nicht verbauen.
- Interviewanalyse soll manuelle Notizen, Transkripte und Audioaufnahmen unterstützen. Audio nur mit expliziter Einwilligung beider Seiten und klaren Retention-Regeln.
- Matching-Score darf keine Blackbox sein. Teilbewertungen, Quellenhinweise und Gap-Begründungen sind Pflichtbestandteile.
- Im Scope enthalten sind strukturierte Extraktion, Vergleich, Interviewvorbereitung und Interviewauswertung. Nicht im ersten Schnitt enthalten sind ATS-Integrationen, vollautomatische Absagen/Zusagen und autonome Endentscheidungen ohne menschliche Freigabe.

**Further Considerations**
1. Empfehlung: Audioanalyse als optionale Ausbaustufe behandeln, falls Datenschutz- und Transkriptionspfad im MVP zu viel Komplexität erzeugt.
2. Empfehlung: Für die erste Taxonomie mit einem begrenzten Skill-Katalog pro Zielbranche starten statt sofort universell zu modellieren.
3. Empfehlung: Explainability und Review-Queue nicht als spätere Komfortfunktion behandeln, sondern als Kernbestandteil des Produkts.
