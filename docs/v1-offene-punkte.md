# Kompetenzkompass V1 — Offene Punkte und fehlende Funktionalitäten

Stand: 30.03.2026

## Noch nicht produktiv implementiert

### Authentifizierung & Session
- **Supabase Auth Integration**: Die aktuelle Session-Verwaltung nutzt localStorage mit einem Default-Benutzer. In Produktion muss Supabase Auth mit JWT-Validierung, serverseitigen Cookies und echter E-Mail/Passwort-Anmeldung eingebunden werden.
- **Passwort-Zurücksetzen**: Link auf der Login-Seite existiert, Funktionalität ist nicht implementiert.
- **Telefon-Verifizierung**: Registrierungsformular enthält Verifizierung per Code, der Versand-Flow (SMS/WhatsApp) ist noch nicht angebunden.

### Kandidaten-Erstellung
- **Datenbankanbindung bei Neuanlage**: Das Formular unter `/candidates/new` zeigt eine Erfolgsmeldung, persistiert aber nicht in Supabase. Die `handleSubmit`-Funktion muss gegen den echten `createCandidate`-Service ausgetauscht werden.
- **PDF/DOCX-Upload**: Nur TXT/MD/CSV werden unterstützt. PDF- und DOCX-Parsing ist nicht integriert.

### Lizenzierung & Zahlungen
- **Zahlungsprozess**: Die Lizenzseite zeigt Pläne an, aber kein Zahlungs-Gateway (z.B. Stripe) ist angebunden.
- **Plan-Ladung aus DB**: Der aktuelle Plan ist hardcoded (`"starter"`), nicht aus der Mandanten-Subscription geladen.
- **Nutzungslimits-Enforcement**: Projekt-/Benutzer-Limits werden in der UI angezeigt, aber nicht serverseitig durchgesetzt.

### Admin-Bereich
- **Benutzerverwaltung**: Die Admin-Benutzerseite existiert, Funktionalität zum Einladen/Deaktivieren/Rollenändern ist noch nicht vollständig.

### Benachrichtigungen
- **Push/E-Mail**: Benachrichtigungen funktionieren nur im Frontend (In-App Toasts). E-Mail- oder Push-Benachrichtigungen sind nicht implementiert.

### Daten & Analyse
- **mock-skillmapper.ts / mock-records.ts**: Diese Dateien enthalten Fallback-Logik für die Keyword-basierte Extraktion (wenn kein AI-Mapping vorliegt). Die Typen aus `mock-skillmapper.ts` werden weiterhin als zentrale UI-Typen verwendet (MatchResult, CandidateProfile, PostingAnalysis etc.). Die Dateien sollten in V2 in `lib/types/` oder `lib/skillmapper/` umbenannt werden, um die Benennung zu bereinigen.
- **Seed-Daten**: `supabase/seed.sql` und `scripts/seed.mjs` enthalten Testdaten mit `extension_mode: "mock"`. Diese werden nur für die Entwicklungsumgebung benötigt.

### Sicherheit
- **RLS-Policies**: Basis-Policies sind definiert, müssen aber auf Edge Cases geprüft werden (z.B. Cross-Tenant-Zugriff).
- **Rate Limiting**: Kein API-Rate-Limiting implementiert.
- **CSRF-Schutz**: Verlässt sich auf Next.js-Standardmechanismen.

### UX-Verbesserungen
- **Datenexport**: Keine Export-Funktion (CSV/PDF) für Matching-Ergebnisse.
- **Abnahme-Workflow**: Kein formaler Freigabe-/Abnahme-Workflow für Matching-Empfehlungen.

## Bereinigte Bereiche (V1-Finalisierung)

- ✅ Alle Mock-Badges und -Labels aus der UI entfernt
- ✅ Adapter-Funktionen von `toMock*` auf produktive Namen umbenannt
- ✅ `MockBadge`-Komponente wird nicht mehr verwendet (kann entfernt werden)
- ✅ Extension-Mode-Defaults auf `manual-ai-assisted` umgestellt
- ✅ Session-Management von "Mock"-Terminologie bereinigt
- ✅ Anleitung-Seite aktualisiert (keine Mock-Hinweise mehr)
- ✅ README aktualisiert
- ✅ AGB, Datenschutz und Impressum erweitert und aktualisiert (Vorbild: ustafix.app)
- ✅ Badge-Variant-Typ bereinigt (kein "mock" mehr)
- ✅ Übersetzungs-Keys bereinigt
