"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Users, Briefcase, CircleDot, Plus, Pencil, Save, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { useNotifications } from "@/lib/notifications/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea, Select } from "@/components/ui/input";
import { SkillTree, mapRequirementNodes } from "@/components/skill-tree";
import { analyzeProject } from "@/lib/mock-skillmapper";
import { PERMISSIONS } from "@/lib/auth/roles";
import {
  fetchProjectById,
  fetchRolesForProject,
  fetchPostingsForRole,
  fetchCandidateById,
  createRole,
  updateRole,
  updateProject,
} from "@/lib/db/service";
import type { DbProject, DbProjectRole, DbJobPosting, DbCandidate } from "@/lib/db/types";

const SDLC_PHASES = [
  { value: "requirements", de: "Anforderungsanalyse", en: "Requirements" },
  { value: "design", de: "Design", en: "Design" },
  { value: "implementation", de: "Implementierung", en: "Implementation" },
  { value: "testing", de: "Testing", en: "Testing" },
  { value: "deployment", de: "Deployment", en: "Deployment" },
  { value: "maintenance", de: "Wartung", en: "Maintenance" },
];

const STATUS_VARIANT: Record<string, "success" | "warning" | "error" | "info" | "mock"> = {
  active: "success",
  draft: "warning",
  paused: "info",
  closed: "error",
  filled: "success",
};

export default function ProjectDetailPage() {
  const { t, locale } = useI18n();
  const { can } = useAuth();
  const { push } = useNotifications();
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<DbProject | null>(null);
  const [roles, setRoles] = useState<DbProjectRole[]>([]);
  const [postingsByRole, setPostingsByRole] = useState<Record<string, DbJobPosting[]>>({});
  const [candidateById, setCandidateById] = useState<Record<string, DbCandidate>>({});
  const [loading, setLoading] = useState(true);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", phase: "", status: "", industry: "", durationMonths: "" });

  // New role form
  const [showNewRole, setShowNewRole] = useState(false);
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [savingRole, setSavingRole] = useState(false);

  const canEdit = can(PERMISSIONS.PROJECTS_EDIT);

  useEffect(() => {
    Promise.all([fetchProjectById(projectId), fetchRolesForProject(projectId)])
      .then(async ([projectData, roleData]) => {
        setProject(projectData);
        setRoles(roleData);

        const postingResults = await Promise.all(
          roleData.map(async (role) => ({
            roleId: role.id,
            postings: await fetchPostingsForRole(role.id),
          })),
        );

        const map: Record<string, DbJobPosting[]> = {};
        postingResults.forEach((r) => {
          map[r.roleId] = r.postings;
        });
        setPostingsByRole(map);

        const candidateIds = [...new Set(roleData.map((r) => r.assigned_candidate_id).filter(Boolean))] as string[];
        const candidates = await Promise.all(candidateIds.map((id) => fetchCandidateById(id)));
        const candidateMap: Record<string, DbCandidate> = {};
        candidates.forEach((candidate) => {
          if (candidate) candidateMap[candidate.id] = candidate;
        });
        setCandidateById(candidateMap);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  const analysis = useMemo(
    () =>
      project
        ? analyzeProject(
            project.title,
            project.raw_text ?? project.description ?? "",
            project.extension_mode,
          )
        : null,
    [project],
  );

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 rounded-3xl bg-ink/5" />
        <div className="h-64 rounded-3xl bg-ink/5" />
      </div>
    );
  }

  if (!project || !analysis) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
        <Card>
          <p className="text-sm text-ink/70">{locale === "de" ? "Projekt nicht gefunden." : "Project not found."}</p>
        </Card>
      </div>
    );
  }

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
            <Input label={t("projects.name")} value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} />
            <Textarea label={t("projects.description")} value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} className="h-24" />
            <div className="grid gap-4 sm:grid-cols-3">
              <Select label={locale === "de" ? "Phase (SDLC)" : "Phase (SDLC)"} value={editForm.phase} onChange={(e) => setEditForm((f) => ({ ...f, phase: e.target.value }))}>
                {SDLC_PHASES.map((p) => <option key={p.value} value={p.value}>{locale === "de" ? p.de : p.en}</option>)}
              </Select>
              <Select label="Status" value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
                <option value="draft">{locale === "de" ? "Entwurf" : "Draft"}</option>
                <option value="active">{locale === "de" ? "Aktiv" : "Active"}</option>
                <option value="archived">{locale === "de" ? "Archiviert" : "Archived"}</option>
              </Select>
              <Input label={locale === "de" ? "Branche" : "Industry"} value={editForm.industry} onChange={(e) => setEditForm((f) => ({ ...f, industry: e.target.value }))} />
            </div>
            <Input label={locale === "de" ? "Dauer (Monate)" : "Duration (months)"} value={editForm.durationMonths} onChange={(e) => setEditForm((f) => ({ ...f, durationMonths: e.target.value }))} />
            <div className="flex gap-3">
              <Button onClick={handleSaveProject}><Save className="h-4 w-4" />{locale === "de" ? "Speichern" : "Save"}</Button>
              <Button variant="secondary" onClick={() => setEditing(false)}><X className="h-4 w-4" />{locale === "de" ? "Abbrechen" : "Cancel"}</Button>
            </div>
          </div>
        ) : (
          <>
            <CardHeader title={project.title} subtitle={`${t("projects.sourceType")}: ${project.source_type}`} action={<Badge variant="success">{project.status}</Badge>} />
            <p className="mt-4 text-sm text-ink/70">{project.description}</p>
            <p className="mt-2 text-xs text-ink/40">{locale === "de" ? "Erstellt" : "Created"}: {new Date(project.created_at).toLocaleDateString(locale === "de" ? "de-DE" : "en-US")}</p>
          </>
        )}
      </Card>

      <Card>
        <CardHeader title={locale === "de" ? "Projekt-Kopfdaten und Rahmenbedingungen" : "Project header data and constraints"} />
        <ul className="mt-3 space-y-2 text-sm text-ink/80">
          <li>{locale === "de" ? "Dauer" : "Duration"}: {analysis.header.durationMonths} {locale === "de" ? "Monate" : "months"}</li>
          <li>{locale === "de" ? "Branche" : "Industry"}: {analysis.header.industry}</li>
          <li>{locale === "de" ? "Projektphase" : "Project phase"}: {analysis.header.projectPhase}</li>
          <li>{locale === "de" ? "Rahmenbedingungen" : "Constraints"}: {analysis.header.conditions.join(", ")}</li>
        </ul>
      </Card>

      {/* ── Roles & Postings ──────────────────────────────────────── */}
      <Card>
        <CardHeader
          title={locale === "de" ? "Rollen & Ausschreibungen" : "Roles & job postings"}
          subtitle={locale === "de" ? `${roles.length} Rollen in diesem Projekt` : `${roles.length} roles in this project`}
          action={
            <div className="flex items-center gap-2">
              {canEdit && (
                <Button variant="secondary" size="sm" onClick={() => setShowNewRole(true)}>
                  <Plus className="h-4 w-4" />
                  {locale === "de" ? "Neue Rolle" : "New role"}
                </Button>
              )}
              <Users className="h-5 w-5 text-ink/40" />
            </div>
          }
        />

        {/* New role form */}
        {showNewRole && (
          <div className="mt-4 rounded-xl border border-moss/30 bg-moss/5 p-4 space-y-3">
            <p className="text-sm font-semibold text-ink">{locale === "de" ? "Neue Rolle anlegen" : "Create new role"}</p>
            <Input
              label={locale === "de" ? "Rollenbezeichnung" : "Role title"}
              value={newRoleTitle}
              onChange={(e) => setNewRoleTitle(e.target.value)}
              placeholder={locale === "de" ? "z.B. Senior Developer" : "e.g. Senior Developer"}
              required
            />
            <Textarea
              label={locale === "de" ? "Beschreibung" : "Description"}
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              className="h-16"
            />
            <div className="flex gap-2">
              <Button size="sm" disabled={savingRole || !newRoleTitle.trim()} onClick={handleCreateRole}>
                {savingRole ? (locale === "de" ? "Speichern..." : "Saving...") : (locale === "de" ? "Rolle anlegen" : "Create role")}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => { setShowNewRole(false); setNewRoleTitle(""); setNewRoleDesc(""); }}>
                {locale === "de" ? "Abbrechen" : "Cancel"}
              </Button>
            </div>
          </div>
        )}

        {roles.length === 0 ? (
          <p className="mt-4 text-sm text-ink/50">{locale === "de" ? "Noch keine Rollen angelegt." : "No roles created yet."}</p>
        ) : (
          <div className="mt-4 space-y-4">
            {roles.map((role) => {
              const postings = postingsByRole[role.id] ?? [];
              const assignedCandidate = role.assigned_candidate_id ? candidateById[role.assigned_candidate_id] : null;

              return (
                <div key={role.id} className="rounded-xl border border-ink/10 bg-fog/25 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-moss" />
                      <span className="font-semibold text-ink">{role.title}</span>
                    </div>
                    <Badge variant={role.fill_status === "filled" ? "success" : role.fill_status === "placeholder" ? "warning" : "info"}>
                      {role.fill_status === "filled"
                        ? locale === "de" ? "Besetzt" : "Filled"
                        : role.fill_status === "placeholder"
                          ? locale === "de" ? "Platzhalter" : "Placeholder"
                          : locale === "de" ? "Offen" : "Open"}
                    </Badge>
                  </div>

                  {role.description && <p className="mt-1 text-sm text-ink/60">{role.description}</p>}

                  {assignedCandidate && (
                    <p className="mt-2 text-xs text-ink/50">
                      {locale === "de" ? "Zugewiesen" : "Assigned"}: <Link href={`/candidates/${assignedCandidate.id}`} className="font-medium text-moss hover:underline">{assignedCandidate.full_name}</Link>
                    </p>
                  )}

                  {postings.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">{locale === "de" ? "Ausschreibungen" : "Job postings"}</p>
                      {postings.map((posting) => (
                        <Link
                          key={posting.id}
                          href={`/postings/${posting.id}`}
                          className="flex items-center justify-between rounded-lg border border-ink/5 bg-white p-3 transition hover:border-moss/30 hover:shadow-sm"
                        >
                          <div className="flex items-center gap-2">
                            <CircleDot className="h-3.5 w-3.5 text-ink/30" />
                            <span className="text-sm font-medium text-ink">{posting.title}</span>
                          </div>
                          <Badge variant={STATUS_VARIANT[posting.status] ?? "info"}>
                            {posting.status}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <SkillTree title={locale === "de" ? "Anforderungs-Skilltree (Muss rot / Kann blau)" : "Requirement skill tree (must-have red / optional blue)"} nodes={mapRequirementNodes(analysis.requirements)} />
      </Card>

      {project.raw_text && (
        <Card>
          <CardHeader title={locale === "de" ? "Projekttext" : "Project text"} action={<FileText className="h-5 w-5 text-ink/40" />} />
          <p className="mt-3 whitespace-pre-line rounded-lg bg-fog/40 p-4 text-sm text-ink/80">{project.raw_text}</p>
        </Card>
      )}

      <Card>
        <CardHeader title={locale === "de" ? "Erweiterung von Anforderungen" : "Requirement extension"} />
        <p className="mt-3 text-sm text-ink/75">{locale === "de" ? `Modus: ${project.extension_mode}. Attribute können zuerst gemockt und danach manuell + KI-gestützt erweitert werden.` : `Mode: ${project.extension_mode}. Attributes can be mocked first and then extended manually with AI assistance.`}</p>
        <p className="mt-2 text-sm text-ink/75">{locale === "de" ? "Empfohlene Zusatzattribute" : "Recommended additional attributes"}: {analysis.additionalAttributes.join(", ")}</p>
      </Card>

      <Card>
        <CardHeader title={locale === "de" ? "Aktionen" : "Actions"} />
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/postings?project=${projectId}`}>
            <Button>
              <Briefcase className="h-4 w-4" />
              {locale === "de" ? "Ausschreibungen verwalten" : "Manage postings"}
            </Button>
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

  async function handleStartEdit() {
    if (!project) return;
    setEditForm({
      title: project.title,
      description: project.description ?? "",
      phase: project.phase,
      status: project.status,
      industry: project.industry,
      durationMonths: String(project.duration_months),
    });
    setEditing(true);
  }

  async function handleSaveProject() {
    if (!project) return;
    try {
      const updated = await updateProject(project.id, {
        title: editForm.title,
        description: editForm.description,
        phase: editForm.phase as DbProject["phase"],
        status: editForm.status as DbProject["status"],
        industry: editForm.industry,
        duration_months: Number(editForm.durationMonths) || project.duration_months,
      });
      setProject(updated);
      setEditing(false);
      push("success", locale === "de" ? "Gespeichert" : "Saved", locale === "de" ? "Projektdaten aktualisiert." : "Project data updated.");
    } catch {
      push("error", locale === "de" ? "Fehler" : "Error", locale === "de" ? "Speichern fehlgeschlagen." : "Save failed.");
    }
  }

  async function handleCreateRole() {
    if (!project || !newRoleTitle.trim()) return;
    setSavingRole(true);
    try {
      const role = await createRole({
        project_id: project.id,
        tenant_id: project.tenant_id,
        title: newRoleTitle.trim(),
        description: newRoleDesc.trim() || null,
        fill_status: "open",
        assigned_candidate_id: null,
        sort_order: roles.length,
      });
      setRoles((prev) => [...prev, role]);
      setPostingsByRole((prev) => ({ ...prev, [role.id]: [] }));
      setNewRoleTitle("");
      setNewRoleDesc("");
      setShowNewRole(false);
      push("success", locale === "de" ? "Rolle erstellt" : "Role created", role.title);
    } catch {
      push("error", locale === "de" ? "Fehler" : "Error", locale === "de" ? "Rolle konnte nicht angelegt werden." : "Could not create role.");
    } finally {
      setSavingRole(false);
    }
  }
}
