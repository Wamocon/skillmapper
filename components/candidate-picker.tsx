"use client";

import { useMemo, useState } from "react";
import { Search, X, MapPin, Clock, Briefcase, Check } from "lucide-react";
import { clsx } from "clsx";
import { useI18n } from "@/lib/i18n/context";
import type { DbCandidate } from "@/lib/db/types";

const SKILL_KEYWORDS = [
  "React",
  "TypeScript",
  "Next.js",
  "Supabase",
  "Tailwind",
  "Python",
  "Django",
  "Java",
  "Spring Boot",
  "Architektur",
  "Testing",
  "Scrum",
  "Agile",
  "AWS",
  "Docker",
  "PostgreSQL",
  "Kommunikation",
  "Machine Learning",
];

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return SKILL_KEYWORDS.filter((k) => lower.includes(k.toLowerCase()));
}

interface CandidateFilters {
  query: string;
  locations: string[];
  maxAvailabilityWeeks: number | null;
  minProjectMonths: number | null;
}

interface CandidatePickerProps {
  candidates: DbCandidate[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  disabled?: boolean;
}

export function CandidatePicker({ candidates, selectedIds, onSelectionChange, disabled }: CandidatePickerProps) {
  const { locale } = useI18n();
  const [filters, setFilters] = useState<CandidateFilters>({
    query: "",
    locations: [],
    maxAvailabilityWeeks: null,
    minProjectMonths: null,
  });

  const allLocations = useMemo(
    () => [...new Set(candidates.map((c) => c.location).filter((loc): loc is string => Boolean(loc)))].sort(),
    [candidates],
  );

  const filtered = useMemo(
    () =>
      candidates.filter((c) => {
        if (filters.query && !c.full_name.toLowerCase().includes(filters.query.toLowerCase())) return false;
        if (filters.locations.length > 0 && !filters.locations.includes(c.location ?? "")) return false;
        if (filters.maxAvailabilityWeeks !== null && c.availability_weeks > filters.maxAvailabilityWeeks) return false;
        if (filters.minProjectMonths !== null && c.total_project_months < filters.minProjectMonths) return false;
        return true;
      }),
    [candidates, filters],
  );

  function toggleLocation(loc: string) {
    setFilters((f) => ({
      ...f,
      locations: f.locations.includes(loc) ? f.locations.filter((l) => l !== loc) : [...f.locations, loc],
    }));
  }

  function toggleCandidate(id: string) {
    if (disabled) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  }

  function selectAll() {
    if (disabled) return;
    onSelectionChange(new Set(filtered.map((c) => c.id)));
  }

  function deselectAll() {
    if (disabled) return;
    onSelectionChange(new Set());
  }

  function resetFilters() {
    setFilters({ query: "", locations: [], maxAvailabilityWeeks: null, minProjectMonths: null });
  }

  const activeFilterCount =
    (filters.query ? 1 : 0) +
    filters.locations.length +
    (filters.maxAvailabilityWeeks !== null ? 1 : 0) +
    (filters.minProjectMonths !== null ? 1 : 0);

  return (
    <div className={clsx("space-y-3", disabled && "pointer-events-none opacity-60")}>
      {/* Filter Panel */}
      <div className="rounded-xl border border-ink/10 bg-fog/40 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Name search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              placeholder={locale === "de" ? "Name suchen..." : "Search name..."}
              value={filters.query}
              onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
              className="w-full rounded-xl border border-ink/20 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-moss/40"
            />
          </div>

          {/* Max availability */}
          <div>
            <input
              type="number"
              placeholder={locale === "de" ? "Max. Verfügbarkeit (Wochen)" : "Max availability (weeks)"}
              min={1}
              value={filters.maxAvailabilityWeeks ?? ""}
              onChange={(e) =>
                setFilters((f) => ({ ...f, maxAvailabilityWeeks: e.target.value ? Number(e.target.value) : null }))
              }
              className="w-full rounded-xl border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-moss/40"
            />
          </div>

          {/* Min project months */}
          <div>
            <input
              type="number"
              placeholder={locale === "de" ? "Min. Projektzeit (Monate)" : "Min project time (months)"}
              min={0}
              value={filters.minProjectMonths ?? ""}
              onChange={(e) =>
                setFilters((f) => ({ ...f, minProjectMonths: e.target.value ? Number(e.target.value) : null }))
              }
              className="w-full rounded-xl border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-moss/40"
            />
          </div>

          {/* Reset */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={resetFilters}
              className={clsx(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition",
                activeFilterCount > 0
                  ? "font-semibold text-rust hover:bg-rust/5"
                  : "text-ink/40 cursor-default",
              )}
              disabled={activeFilterCount === 0}
            >
              <X className="h-3.5 w-3.5" />
              {locale === "de" ? "Filter zurücksetzen" : "Reset filters"}
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-rust/10 px-1.5 py-0.5 text-xs text-rust">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Location chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="py-1 text-xs font-semibold text-ink/50">{locale === "de" ? "Standort:" : "Location:"}</span>
          {allLocations.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => toggleLocation(loc)}
              className={clsx(
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                filters.locations.includes(loc)
                  ? "border-moss/50 bg-moss/10 text-moss"
                  : "border-ink/20 bg-white text-ink/60 hover:border-moss/40 hover:text-ink",
              )}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Selection controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={selectAll} className="text-sm font-semibold text-moss hover:underline">
            {locale === "de" ? `Alle auswählen (${filtered.length})` : `Select all (${filtered.length})`}
          </button>
          {selectedIds.size > 0 && (
            <>
              <span className="text-ink/20">|</span>
              <button type="button" onClick={deselectAll} className="text-sm text-ink/60 hover:underline">
                {locale === "de" ? "Auswahl aufheben" : "Clear selection"}
              </button>
            </>
          )}
        </div>
        <p className="text-sm text-ink/60">
          <span className="font-semibold text-ink">{filtered.length}</span> {locale === "de" ? "Kandidaten gefunden" : "candidates found"}
          {selectedIds.size > 0 && (
            <span className="ml-2 font-semibold text-moss">· {selectedIds.size} {locale === "de" ? "ausgewählt" : "selected"}</span>
          )}
        </p>
      </div>

      {/* Candidate list */}
      <div className="max-h-[520px] space-y-1.5 overflow-y-auto rounded-xl border border-ink/10 bg-white p-2">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/50">{locale === "de" ? "Keine Kandidaten entsprechen den Filterkriterien." : "No candidates match the filter criteria."}</p>
        ) : (
          filtered.map((c) => {
            const selected = selectedIds.has(c.id);
            const expYears = (c.total_project_months / 12).toFixed(1);
            const keywords = extractKeywords(c.cv_raw_text ?? "");

            return (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => toggleCandidate(c.id)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") toggleCandidate(c.id);
                }}
                className={clsx(
                  "flex cursor-pointer select-none items-start gap-3 rounded-lg border p-3 transition",
                  selected ? "border-moss/40 bg-moss/5" : "border-ink/5 hover:border-ink/15 hover:bg-fog/30",
                )}
              >
                {/* Checkbox */}
                <div
                  className={clsx(
                    "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition",
                    selected ? "border-moss bg-moss" : "border-ink/30",
                  )}
                >
                  {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </div>

                {/* Avatar */}
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-moss/10 text-sm font-bold text-moss">
                  {c.full_name.charAt(0)}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-ink">{c.full_name}</p>
                    <span className="text-xs text-ink/40">{c.email}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink/55">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {c.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {locale === "de" ? `In ${c.availability_weeks}W verfügbar` : `Available in ${c.availability_weeks}w`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {expYears}J · {c.total_project_months}M
                    </span>
                  </div>
                  {keywords.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {keywords.slice(0, 5).map((s) => (
                        <span
                          key={s}
                          className="rounded-md border border-ink/15 bg-fog/70 px-1.5 py-0.5 text-xs text-ink/65"
                        >
                          {s}
                        </span>
                      ))}
                      {keywords.length > 5 && (
                        <span className="rounded-md border border-ink/10 px-1.5 py-0.5 text-xs text-ink/35">
                          +{keywords.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
