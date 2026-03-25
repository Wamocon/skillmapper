# Kompetenzkompass — KI-Prompts

Dieser Ordner enthält die KI-Prompts für die vier Hauptprozessschritte der Kompetenzkompass-Plattform. Die Prompts sind als Vorlagen konzipiert: Platzhalter in `{{GROSSBUCHSTABEN}}` werden zur Laufzeit mit echten Datenbankwerten aus Supabase befüllt.

## Prozessübersicht

```
[1] Projektanlage         →  01-project-posting-extraction.prompt.md
[2] Kandidatenanlage      →  02-candidate-extraction.prompt.md
[3] Kompetenzkompass-Vergleich →  03-kompetenzkompass-matching.prompt.md
[4] Interviewfragen       →  04-interview-questions.prompt.md
```

## Datenfluss

```
Rohtextblock (Ausschreibung / Projektbeschreibung)
  └─▶ [Prompt 01] → PostingAnalysis (JSON)
                          │
Rohtextblock (CV / Onepager)
  └─▶ [Prompt 02] → CandidateProfile (JSON)
                          │
                    ┌─────┴─────┐
                    ▼           ▼
             [Prompt 03] Kompetenzkompass-Vergleich
                    │
                    ▼
             MatchResult (JSON)
                    │
             [Prompt 04] Interviewfragen-Erstellung
                    │
                    ▼
             InterviewQuestionSet (JSON)
```

## Platzhalter-Übersicht

| Platzhalter                | Supabase-Quelle                          | Beschreibung                              |
|----------------------------|------------------------------------------|-------------------------------------------|
| `{{PROJECT_ID}}`           | `projects.id`                            | UUID des Projekts                         |
| `{{POSTING_ID}}`           | `job_postings.id`                        | UUID der Ausschreibung                    |
| `{{CANDIDATE_ID}}`         | `candidates.id`                          | UUID des Kandidaten                       |
| `{{TENANT_ID}}`            | `tenants.id`                             | UUID des Mandanten                        |
| `{{ROLE_TITLE}}`           | `project_roles.title`                    | Titel der Rolle                           |
| `{{SOURCE_TYPE}}`          | `projects.source_type`                   | `"tender"` oder `"project-brief"`         |
| `{{RAW_TEXT}}`             | `job_postings.raw_text` / `projects.raw_text` | Rohtextblock der Ausschreibung / des Projekts |
| `{{CV_RAW_TEXT}}`          | `candidates.cv_raw_text`                 | Rohtextblock des CVs / Onepapers          |
| `{{CUSTOM_ATTRIBUTES_JSON}}` | `*.custom_attributes`                  | JSONB-Feld aus dem jeweiligen Datensatz   |
| `{{DOCUMENT_TYPE}}`        | Aus Upload-Metadaten                     | `"cv"`, `"onepager"`, `"note"`, `"mixed"` |
| `{{MATCH_RUN_ID}}`         | `match_runs.id`                          | UUID des Match-Runs                       |
| `{{MATCHING_MODE}}`        | Aus UI-Aufruf                            | `"single"` oder `"multi"`                |
| `{{POSTING_ANALYSIS_JSON}}`| Ausgabe von Prompt 01 / `job_postings.mapped_profile` | Strukturiertes Ausschreibungsprofil |
| `{{CANDIDATE_PROFILES_JSON}}`| Ausgabe von Prompt 02 / `candidates.mapped_profile` | Ein oder mehrere Kandidatenprofile |
| `{{MATCH_RESULT_JSON}}`    | Ausgabe von Prompt 03 / `match_runs.summary` | Matching-Ergebnis                  |
| `{{CANDIDATE_PROFILE_JSON}}`| Ausgabe von Prompt 02                  | Kandidatenprofil für Prompt 04            |
| `{{INTERVIEW_SET_ID}}`     | Aus Interview-Set-Tabelle                | UUID des Interview-Fragensets             |
| `{{INTERVIEWER_USER_ID}}`  | `users.id`                              | UUID des Interviewers                     |
| `{{TARGET_QUESTION_COUNT}}`| Aus UI-Einstellung                       | Gewünschte Fragenanzahl (empf. 8–15)      |
| `{{CREATED_BY_USER_ID}}`   | `users.id`                              | UUID des erstellenden Benutzers           |
| `{{CANDIDATE_ID_SINGLE}}`  | `candidates.id`                          | Nur im Single-Modus von Prompt 03         |

## TypeScript-Typ-Mapping

| Prompt | Ausgabe-Typ (aus `lib/mock-skillmapper.ts`) |
|--------|---------------------------------------------|
| 01     | `ProjectAnalysis` / `PostingAnalysis`       |
| 02     | `CandidateProfile`                          |
| 03     | `MatchResult` / Array von `MatchResult`     |
| 04     | `InterviewQuestion[]`                       |

## Sicherheits- und Datenschutzhinweise

- Alle Prompts enthalten explizite Datenschutzregeln (kein PII in evidence-Feldern, kein Name in Ausgaben).
- Halluzination ist in allen Prompts verboten — alle Aussagen müssen evidence-basiert sein.
- `review_required: true` markiert Felder für menschliche Überprüfung (Human-in-the-loop).
- Der KI-Score ersetzt keine menschliche Entscheidung (Zusage / Absage).
