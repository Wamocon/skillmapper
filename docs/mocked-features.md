# Mocked Features Register

## Zweck / Purpose

Transparente Liste, welche Implementierungen aktuell simuliert sind.
Transparent list of which implementations are currently simulated.

## Aktiv gemockt / Actively mocked

1. Dokumentextraktion für PDF, DOCX, XLSX.
2. Projektanalyse mit Kopfdaten-Mapping (Dauer, Branche, Phase nach SDLC, Rahmenbedingungen).
3. **Rollen-Management**: Projektmitglieder/Positionen mit Besetzungsstatus (offen, Platzhalter, besetzt).
4. **Ausschreibungen (Job Postings)**: Ausschreibungen pro Rolle mit eigenem Anforderungsprofil, Statusmodell und vererbtem Projektkontext.
5. Kategorisiertes Requirement-Mapping (Tools, Hard Skills, Soft Skills, Zertifizierungen).
6. Must/Can-Klassifizierung der Anforderungen (Pflicht/Optional).
7. Kandidatenprofil-Mapping im einheitlichen Schema inkl. Erfahrungsaggregation.
8. Matchscore-Berechnung inklusive kritischer Must-Gap-Erkennung.
9. Score-Begründungsliste mit Impact-Klassifizierung (positiv/neutral/negativ).
10. **Matching Hub mit Ausschreibungswahl** und Moduswechsel zwischen Einzelmatching und Mehrfach-Matching.
11. Batch-Ergebnisliste mit Filterung, Sortierung und Drilldown.
12. Fragebogen-Generierung.
13. Interviewauswertung.
14. Erweiterungsmodi für Attribute (`mock`, `manual-ai-assisted`).

## Sichtbarkeit im Produkt

- UI-Badges mit `Mock` zeigen simulierte Ergebnisse.
- Pflichtanforderungen erscheinen als roter `Pflicht`-Badge, optionale als blauer `Optional`-Badge.
- Score-Begründung zeigt gewichtete Punkte pro Anforderung mit Abweichungen.
- Kompetenzrad (Radar-Chart) visualisiert Anforderungsprofil vs. Bewerberprofil.
- Mapping-Tabelle zeigt Ziel-Level vs. Ist-Level je Anforderung.
- Ergebnistexte enthalten Hinweise auf MOCK-Herkunft.
- Rollen zeigen Besetzungsstatus (Offen / Platzhalter / Besetzt).
- Ausschreibungen zeigen Status-Badge (Entwurf / Aktiv / Pausiert / Geschlossen / Besetzt).

## Nicht gemockt (real lokal) / Not mocked (real local)

1. Frontend-Workflow und User-Interaktionen.
2. Lokale Zustandsverwaltung und Eingabevalidierung.
3. Dateiupload-Interaktion.
4. Visualisierung der Ergebnisse inkl. Kompetenzrad und Accordion-UX.
5. Rollen- und Ausschreibungsverwaltung im Projektkontext.

## Ersetzungsreihenfolge / Replacement priority

1. Requirement- und Skill-Mapping durch echte Extraktionsservices ersetzen.
2. Matchscore-Logik mit konfigurierbarer Gewichtung und Tests absichern.
3. Interviewanalyse durch evidenzbasierte Pipeline ersetzen.
4. Supabase-Persistenz und Auth aktivieren.
5. Rollen- und Ausschreibungsverwaltung mit vollständiger CRUD-Persistenz.
