"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, UserCircle, Zap, Pencil, Save, X, MessageSquare, Archive, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { useNotifications } from "@/lib/notifications/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea, Select } from "@/components/ui/input";
import { SkillTree, mapCandidateSkillNodes } from "@/components/skill-tree";
import { analyzeCandidate } from "@/lib/mock-skillmapper";
import { toCandidateProfile } from "@/lib/ai/ui-adapters";
import type { CandidateExtractionResult } from "@/lib/ai/extraction";
import { PERMISSIONS } from "@/lib/auth/roles";
import {
  fetchCandidateById,
  fetchMatchRunsForCandidate,
  fetchPostingById,
  updateCandidate,
  fetchCommentsForCandidate,
  createCandidateComment,
  updateCandidateComment,
  archiveCandidateComment,
} from "@/lib/db/service";
import type { DbCandidate, DbMatchRun, DbCandidateComment } from "@/lib/db/types";

function safeParseSummary(summary: unknown): Record<string, unknown> | null {
  if (!summary) return null;
  if (typeof summary === "object" && summary !== null) return summary as Record<string, unknown>;
  if (typeof summary !== "string") return null;
  try {
    const parsed = JSON.parse(summary);
    return typeof parsed === "object" && parsed !== null ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export default function CandidateDetailPage() {
  const { t, locale } = useI18n();
  const { user, can } = useAuth();
  const { push } = useNotifications();
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;

  const [candidate, setCandidate] = useState<DbCandidate | null>(null);
  const [matchRuns, setMatchRuns] = useState<Array<DbMatchRun & { postingTitle: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", email: "", location: "", availability_weeks: "", total_project_months: "" });

  // Comments
  const [comments, setComments] = useState<DbCandidateComment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [newCommentSection, setNewCommentSection] = useState("general");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const canEdit = can(PERMISSIONS.CANDIDATES_EDIT);

  useEffect(() => {
    (async () => {
      try {
        const candidateData = await fetchCandidateById(candidateId);
        setCandidate(candidateData);

        if (candidateData) {
          const [runs, commentsData] = await Promise.all([
            fetchMatchRunsForCandidate(candidateId),
            fetchCommentsForCandidate(candidateId),
          ]);
          const postingIds = [...new Set(runs.map((r) => r.posting_id))];
          const postingResults = await Promise.all(postingIds.map((id) => fetchPostingById(id)));
          const titleMap = new Map<string, string>();
          postingResults.forEach((p) => { if (p) titleMap.set(p.id, p.title); });
          setMatchRuns(runs.map((r) => ({ ...r, postingTitle: titleMap.get(r.posting_id) ?? "Unknown posting" })));
          setComments(commentsData);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [candidateId]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 rounded-3xl bg-ink/5" />
        <div className="h-56 rounded-3xl bg-ink/5" />
      </div>
    );
  }

  const profile = candidate
    ? candidate.mapped_profile
      ? toCandidateProfile(
        candidate.mapped_profile as unknown as CandidateExtractionResult,
        candidate.full_name,
        candidate.extension_mode,
      )
      : analyzeCandidate(candidate.full_name, candidate.cv_raw_text ?? "", candidate.extension_mode)
    : null;

  if (!candidate || !profile) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
        <Card>
          <p className="text-sm text-ink/70">{locale === "de" ? "Bewerberprofil nicht gefunden." : "Candidate profile not found."}</p>
        </Card>
      </div>
    );
  }

  const allSkills = [...profile.hardSkills, ...profile.softSkills, ...profile.toolSkills, ...profile.certifications];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
      </div>

      <Card padding="lg">
        {editing ? (
          <div className="space-y-4">
            <Input label={locale === "de" ? "Name" : "Name"} value={editForm.full_name} onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="E-Mail" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
              <Input label={locale === "de" ? "Standort" : "Location"} value={editForm.location} onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label={locale === "de" ? "Verfügbar in Wochen" : "Available in weeks"} type="number" value={editForm.availability_weeks} onChange={(e) => setEditForm((f) => ({ ...f, availability_weeks: e.target.value }))} />
              <Input label={locale === "de" ? "Projektmonate gesamt" : "Total project months"} type="number" value={editForm.total_project_months} onChange={(e) => setEditForm((f) => ({ ...f, total_project_months: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSaveCandidate}><Save className="h-4 w-4" />{locale === "de" ? "Speichern" : "Save"}</Button>
              <Button variant="secondary" onClick={() => setEditing(false)}><X className="h-4 w-4" />{locale === "de" ? "Abbrechen" : "Cancel"}</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-moss/10 text-2xl font-bold text-moss">
              {candidate.full_name.charAt(0)}
            </div>
            <div>
              <h1 className="font-heading text-xl text-ink sm:text-3xl">{candidate.full_name}</h1>
              <p className="text-sm text-ink/60">{candidate.email}</p>
              <p className="text-xs text-ink/50">{locale === "de" ? `${candidate.location} - Verfügbar in ${candidate.availability_weeks} Wochen` : `${candidate.location} - Available in ${candidate.availability_weeks} weeks`}</p>
            </div>
            <Badge variant={candidate.mapped_profile ? "info" : "warning"}>{candidate.mapped_profile ? "AI" : (locale === "de" ? "Ausstehend" : "Pending")}</Badge>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title={locale === "de" ? "Einheitliches Bewerberprofil" : "Unified candidate profile"} />
        <ul className="mt-3 space-y-2 text-sm text-ink/75">
          <li>{locale === "de" ? "Kopfdaten: Name, E-Mail, Standort, Verfügbarkeit" : "Header data: name, email, location, availability"}</li>
          <li>{locale === "de" ? "Projektzeit gesamt" : "Total project time"}: {profile.header.totalProjectMonths} {locale === "de" ? "Monate" : "months"}</li>
          <li>{locale === "de" ? "Berechnete Erfahrung" : "Calculated experience"}: {profile.header.totalExperienceYears} {locale === "de" ? "Jahre" : "years"}</li>
          <li>{locale === "de" ? "Soft Skills" : "Soft skills"}: {profile.softSkills.length}</li>
          <li>{locale === "de" ? "Hard Skills" : "Hard skills"}: {profile.hardSkills.length}</li>
          <li>{locale === "de" ? "Toolkenntnisse" : "Tool skills"}: {profile.toolSkills.length}</li>
          <li>{locale === "de" ? "Zertifizierungen" : "Certifications"}: {profile.certifications.length}</li>
        </ul>
      </Card>

      <Card>
        <SkillTree title={locale === "de" ? "Bewerber-Skilltree (Skala 1-10)" : "Candidate skill tree (scale 1-10)"} nodes={mapCandidateSkillNodes(allSkills)} />
      </Card>

      {candidate.cv_raw_text && (
        <Card>
          <CardHeader title={locale === "de" ? "CV / Profil" : "CV / Profile"} action={<UserCircle className="h-5 w-5 text-ink/40" />} />
          <p className="mt-3 whitespace-pre-line rounded-lg bg-fog/40 p-4 text-sm text-ink/80">{candidate.cv_raw_text}</p>
        </Card>
      )}

      <Card>
        <CardHeader title={locale === "de" ? "Weitere Pflichtfelder im Benutzerprofil" : "Additional required profile fields"} />
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/75">
          <li>{locale === "de" ? "Sprachlevel je Sprache (z.B. Deutsch C1, Englisch B2)" : "Language proficiency per language (e.g. German C1, English B2)"}</li>
          <li>{locale === "de" ? "Vertrags- und Einsatzmodell (Freelance, Festanstellung, Teilzeit)" : "Contract and engagement model (freelance, permanent, part-time)"}</li>
          <li>{locale === "de" ? "Führungs- und Mentoring-Erfahrung" : "Leadership and mentoring experience"}</li>
          <li>{locale === "de" ? "Branchenpräferenzen und No-Go-Domänen" : "Industry preferences and excluded domains"}</li>
          <li>{locale === "de" ? "Reisebereitschaft und Onsite-Quote" : "Travel willingness and onsite ratio"}</li>
          <li>{locale === "de" ? "Tagessatz/Gehaltsband" : "Daily rate / salary band"}</li>
        </ul>
      </Card>

      <Card>
        <CardHeader title={locale === "de" ? "Erweiterung von Bewerberdaten" : "Candidate data extension"} />
        <p className="mt-3 text-sm text-ink/75">{locale === "de" ? `Modus: ${candidate.extension_mode === "manual-ai-assisted" ? "Manuell + KI-gestützt" : "Standard"}. Profildaten werden manuell erfasst und KI-gestützt erweitert.` : `Mode: ${candidate.extension_mode === "manual-ai-assisted" ? "Manual + AI-assisted" : "Standard"}. Profile data is captured manually and extended with AI assistance.`}</p>
        <p className="mt-2 text-sm text-ink/75">{locale === "de" ? "Vorschläge" : "Suggestions"}: {profile.additionalAttributes.join(", ")}</p>
      </Card>

      {/* Match history for this candidate */}
      <Card>
        <CardHeader
          title={locale === "de" ? "Matching-Ergebnisse" : "Match results"}
          subtitle={locale === "de" ? `${matchRuns.length} Matching-Läufe für diesen Kandidaten` : `${matchRuns.length} match runs for this candidate`}
          action={<Zap className="h-5 w-5 text-amber-600" />}
        />
        {matchRuns.length === 0 ? (
          <p className="mt-4 text-sm text-ink/50">{locale === "de" ? "Noch keine Matching-Ergebnisse vorhanden." : "No match results yet."}</p>
        ) : (
          <div className="mt-4 space-y-2">
            {matchRuns.map((run) => {
              const summaryData = run.summary
                ? safeParseSummary(run.summary)
                : null;
              const recommendation = summaryData?.recommendation as string | undefined;

              return (
                <Link
                  key={run.id}
                  href={`/matching?matchRun=${run.id}`}
                  className="flex items-center justify-between rounded-xl border border-ink/10 bg-fog/25 p-4 transition hover:border-moss/30 hover:bg-white hover:shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-ink">{run.postingTitle}</p>
                    <p className="mt-1 text-xs text-ink/50">
                      {new Date(run.created_at).toLocaleDateString(locale === "de" ? "de-DE" : "en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-heading text-xl text-ink">{run.score}%</span>
                    {recommendation && (
                      <Badge variant={recommendation === "geeignet" ? "success" : recommendation === "bedingt geeignet" ? "warning" : "error"}>
                        {recommendation === "geeignet"
                          ? locale === "de" ? "Geeignet" : "Suitable"
                          : recommendation === "bedingt geeignet"
                            ? locale === "de" ? "Bedingt" : "Partial"
                            : locale === "de" ? "Nicht geeignet" : "Not suitable"}
                      </Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      {/* Comments section */}
      <Card>
        <CardHeader
          title={locale === "de" ? "Kommentare" : "Comments"}
          subtitle={locale === "de" ? `${comments.filter((c) => c.status === "active").length} aktive Kommentare` : `${comments.filter((c) => c.status === "active").length} active comments`}
          action={<MessageSquare className="h-5 w-5 text-ink/40" />}
        />

        {/* New comment */}
        <div className="mt-4 space-y-3">
          <div className="flex gap-3">
            <Select label="" value={newCommentSection} onChange={(e) => setNewCommentSection(e.target.value)} className="w-auto min-w-[150px]">
              <option value="general">{locale === "de" ? "Allgemein" : "General"}</option>
              <option value="skills">{locale === "de" ? "Skills" : "Skills"}</option>
              <option value="experience">{locale === "de" ? "Erfahrung" : "Experience"}</option>
              <option value="matching">{locale === "de" ? "Matching" : "Matching"}</option>
              <option value="interview">{locale === "de" ? "Interview" : "Interview"}</option>
            </Select>
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder={locale === "de" ? "Kommentar schreiben..." : "Write a comment..."}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="h-16"
            />
          </div>
          <Button size="sm" disabled={!newCommentText.trim()} onClick={handleAddComment}>
            <MessageSquare className="h-4 w-4" />
            {locale === "de" ? "Kommentar hinzufügen" : "Add comment"}
          </Button>
        </div>

        {/* Show/hide archived */}
        {comments.some((c) => c.status === "archived") && (
          <button type="button" onClick={() => setShowArchived(!showArchived)} className="mt-3 text-xs text-ink/50 hover:text-ink">
            {showArchived
              ? (locale === "de" ? "Archivierte ausblenden" : "Hide archived")
              : (locale === "de" ? `Archivierte anzeigen (${comments.filter((c) => c.status === "archived").length})` : `Show archived (${comments.filter((c) => c.status === "archived").length})`)}
          </button>
        )}

        {/* Comment list */}
        <div className="mt-4 space-y-3">
          {comments
            .filter((c) => showArchived || c.status === "active")
            .map((comment) => (
              <div key={comment.id} className={`rounded-xl border p-4 ${comment.status === "archived" ? "border-ink/5 bg-ink/5 opacity-60" : "border-ink/10 bg-fog/25"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-semibold text-ink">{comment.author_name}</span>
                    <span className="ml-2 text-xs text-ink/40">
                      {new Date(comment.created_at).toLocaleDateString(locale === "de" ? "de-DE" : "en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {comment.edited_at && (
                      <span className="ml-2 text-xs text-ink/30 flex items-center gap-1 inline-flex">
                        <Clock className="h-3 w-3" />
                        {locale === "de" ? "bearbeitet" : "edited"} {new Date(comment.edited_at).toLocaleDateString(locale === "de" ? "de-DE" : "en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="info" className="text-[10px]">{comment.section}</Badge>
                    {comment.status === "archived" && <Badge variant="warning" className="text-[10px]">{locale === "de" ? "Archiviert" : "Archived"}</Badge>}
                  </div>
                </div>

                {editingCommentId === comment.id ? (
                  <div className="mt-2 space-y-2">
                    <Textarea value={editingCommentText} onChange={(e) => setEditingCommentText(e.target.value)} className="h-16" />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                        <Save className="h-3 w-3" />{locale === "de" ? "Speichern" : "Save"}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setEditingCommentId(null)}>
                        {locale === "de" ? "Abbrechen" : "Cancel"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mt-2 text-sm text-ink/75 whitespace-pre-wrap">{comment.text}</p>
                    {comment.status === "active" && (
                      <div className="mt-2 flex gap-2">
                        <button type="button" onClick={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.text); }} className="text-xs text-moss hover:underline">
                          <Pencil className="h-3 w-3 inline mr-1" />{locale === "de" ? "Bearbeiten" : "Edit"}
                        </button>
                        <button type="button" onClick={() => handleArchiveComment(comment.id)} className="text-xs text-amber-600 hover:underline">
                          <Archive className="h-3 w-3 inline mr-1" />{locale === "de" ? "Archivieren" : "Archive"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
        </div>
      </Card>

      <Card>
        <CardHeader title={locale === "de" ? "Aktionen" : "Actions"} />
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/matching?mode=single&candidate=${candidateId}`}>
            <Button>{locale === "de" ? "Einzelmatching vorbereiten" : "Prepare single matching"}</Button>
          </Link>
          {canEdit && (
            <Button variant="secondary" onClick={handleStartEdit}>
              <Pencil className="h-4 w-4" />
              {t("common.edit")}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );

  function handleStartEdit() {
    if (!candidate) return;
    setEditForm({
      full_name: candidate.full_name,
      email: candidate.email ?? "",
      location: candidate.location ?? "",
      availability_weeks: String(candidate.availability_weeks),
      total_project_months: String(candidate.total_project_months),
    });
    setEditing(true);
  }

  async function handleSaveCandidate() {
    if (!candidate) return;
    try {
      const updated = await updateCandidate(candidate.id, {
        full_name: editForm.full_name,
        email: editForm.email || null,
        location: editForm.location || null,
        availability_weeks: Number(editForm.availability_weeks) || candidate.availability_weeks,
        total_project_months: Number(editForm.total_project_months) || candidate.total_project_months,
      });
      setCandidate(updated);
      setEditing(false);
      push("success", locale === "de" ? "Gespeichert" : "Saved", locale === "de" ? "Kandidatendaten aktualisiert." : "Candidate data updated.");
    } catch {
      push("error", locale === "de" ? "Fehler" : "Error", locale === "de" ? "Speichern fehlgeschlagen." : "Save failed.");
    }
  }

  async function handleAddComment() {
    if (!candidate || !newCommentText.trim()) return;
    try {
      const comment = await createCandidateComment({
        candidate_id: candidate.id,
        tenant_id: candidate.tenant_id,
        section: newCommentSection,
        text: newCommentText.trim(),
        author_name: user?.full_name ?? "Unknown",
        author_id: user?.id ?? "",
        status: "active",
      });
      setComments((prev) => [...prev, comment]);
      setNewCommentText("");
      push("success", locale === "de" ? "Kommentar hinzugefügt" : "Comment added", "");
    } catch {
      push("error", locale === "de" ? "Fehler" : "Error", locale === "de" ? "Kommentar konnte nicht gespeichert werden." : "Could not save comment.");
    }
  }

  async function handleEditComment(commentId: string) {
    if (!editingCommentText.trim()) return;
    try {
      const updated = await updateCandidateComment(commentId, editingCommentText.trim());
      setComments((prev) => prev.map((c) => c.id === commentId ? updated : c));
      setEditingCommentId(null);
      push("success", locale === "de" ? "Kommentar aktualisiert" : "Comment updated", "");
    } catch {
      push("error", locale === "de" ? "Fehler" : "Error", locale === "de" ? "Bearbeitung fehlgeschlagen." : "Edit failed.");
    }
  }

  async function handleArchiveComment(commentId: string) {
    try {
      await archiveCandidateComment(commentId);
      setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, status: "archived" as const, edited_at: new Date().toISOString() } : c));
      push("success", locale === "de" ? "Kommentar archiviert" : "Comment archived", "");
    } catch {
      push("error", locale === "de" ? "Fehler" : "Error", locale === "de" ? "Archivierung fehlgeschlagen." : "Archive failed.");
    }
  }
}
