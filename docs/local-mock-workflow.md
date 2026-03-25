# Local Mock Workflow

## Ziel / Goal

Ein lokal lauffähiger End-to-End-Prototyp, der den kompletten Kompetenzkompass-Ablauf sichtbar macht, auch ohne Supabase-Anbindung.

A locally runnable end-to-end prototype that demonstrates the full Kompetenzkompass workflow, even without Supabase.

## Aktueller Ablauf / Current workflow

1. Projekt anlegen und strukturiert mappen (Kopfdaten, Rahmenbedingungen).
2. Rollen (Projektmitglieder/Positionen) im Projekt definieren.
3. Ausschreibungen (Job Postings) pro Rolle erstellen, mit eigenen Skill-Anforderungen.
4. Ausschreibungen erben den Projektkontext (Branche, Dauer, Reifegrad, Phase, Rahmenbedingungen).
5. Im Matching Hub eine aktive Ausschreibung wählen und Matching-Modus bestimmen.
6. Kandidat einzeln oder mehrere Kandidaten im Stapel gegen die Ausschreibung matchen.
7. Im Einzelmatching: Score-Begründung, Skillvergleich und Interviewfragen anzeigen.
8. Im Mehrfach-Matching: Ergebnisliste sortieren, filtern und Kandidaten-Drilldown öffnen.
9. Anforderungsabgleich: Ziel-Level vs. Ist-Level je Anforderung mit Evidenz.

## Mappingstruktur (Projekt)

- Kopfdaten: Dauer, Branche, Reifegrad, Projektphase
- Rahmenbedingungen
- Rollen: Titel, Beschreibung, Besetzungsstatus (offen / Platzhalter / besetzt)

## Mappingstruktur (Ausschreibung)

- Erbt Projektkontext automatisch
- Anforderungen in Kategorien:
  - Tool-Kenntnisse
  - Hard Skills
  - Soft Skills
  - Zertifizierungen
- Einstufung je Anforderung:
  - Pflicht (rot)
  - Optional (blau)
- Statusmodell: Entwurf → Aktiv → Pausiert → Geschlossen / Besetzt
- Eigener Ausschreibungstext (Upload oder manuelle Eingabe)

## Mappingstruktur (Bewerber)

- Kopfdaten: Name, Kontakt, Standort, Verfügbarkeit
- Skills in Kategorien:
  - Tool-Kenntnisse
  - Hard Skills
  - Soft Skills
  - Zertifizierungen
- Erfahrung:
  - Zeit je Erfahrungseintrag
  - Gesamtprojektzeit
  - Abgeleitete Gesamterfahrung in Jahren

## UX-Prinzipien

- Ausschreibungswahl ist der zentrale Einstiegspunkt für beide Matching-Modi.
- Moduswahl passiert direkt nach der Ausschreibungswahl im Matching Hub.
- Komplexität ist auf dem ersten Blick versteckt (Score-Hero zuerst).
- Details werden per Klick durch Accordion-Elemente aufgeklappt.
- Kompetenzrad zeigt visuellen Vergleich mit Hover-Tooltips.
- Mapping-Tabelle zeigt Ziel/Ist/Differenz klar nebeneinander.
- Interviewfragen und Metadaten sind standardmäßig zugeklappt.

## Erweiterbare Attribute

Die App unterstützt bereits zwei Modi für Attributerweiterung:

- `mock`
- `manual-ai-assisted`

Diese Modi gelten für:

- Erweiterung der Ausschreibungsanforderungen
- Erweiterung der gesammelten Nutzerdaten

## Mock-Kennzeichnung

Alle abgeleiteten Daten sind mit MOCK gekennzeichnet und dürfen nicht als produktive Bewertungsbasis genutzt werden.

## Geplante Ablösung der Mocks

- Echte Parser für PDF/DOCX/XLSX.
- Serverseitige Persistenz mit Supabase.
- Regel- und evidenzbasierte Interviewanalyse mit Audit-Trail.
