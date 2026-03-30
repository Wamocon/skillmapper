"use client";

import Link from "next/link";
import { Briefcase, CircleDot, FolderOpen, Plus, Filter, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { useNotifications } from "@/lib/notifications/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { PERMISSIONS } from "@/lib/auth/roles";
import { fetchPostings, fetchProjectById, fetchRoleById, fetchProjects, fetchRolesForProject, createPosting } from "@/lib/db/service";
import type { DbJobPosting, DbProject, DbProjectRole, PostingPriority } from "@/lib/db/types";

const STATUS_VARIANT: Record<string, "success" | "warning" | "error" | "info"> = {
  active: "success",
  draft: "warning",
  paused: "info",
  closed: "error",
  filled: "success",
};

const STATUS_LABEL_DE: Record<string, string> = {
  draft: "Entwurf",
  active: "Aktiv",
  paused: "Pausiert",
  closed: "Geschlossen",
  filled: "Besetzt",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "border-l-4 border-l-rust",
  medium: "border-l-4 border-l-amber-500",
  low: "border-l-4 border-l-ink/20",
};

const PRIORITY_BADGE: Record<string, "error" | "warning" | "info"> = {
  high: "error",
  medium: "warning",
  low: "info",
};

export function PostingsClientPage() {
  const { locale } = useI18n();
  const { can } = useAuth();
  const { push } = useNotifications();
  const searchParams = useSearchParams();
  const filterProjectId = searchParams.get("project");

  const [postings, setPostings] = useState<DbJobPosting[]>([]);
  const [filterProject, setFilterProject] = useState<DbProject | null>(null);
  const [projectCache, setProjectCache] = useState<Record<string, DbProject>>({});
  const [roleCache, setRoleCache] = useState<Record<string, DbProjectRole>>({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterIndustry, setFilterIndustry] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");

  // New posting form
  const [showNewForm, setShowNewForm] = useState(false);
  const [allProjects, setAllProjects] = useState<DbProject[]>([]);
  const [newFormRoles, setNewFormRoles] = useState<DbProjectRole[]>([]);
  const [newForm, setNewForm] = useState({
    title: "", description: "", projectId: "", roleId: "",
    status: "draft", priority: "medium" as PostingPriority,
    durationMonths: "6", industry: "",
  });
  const [saving, setSaving] = useState(false);

  const canCreate = can(PERMISSIONS.PROJECTS_CREATE);

  useEffect(() => {
    Promise.all([
      fetchPostings(filterProjectId ?? undefined),
      filterProjectId ? fetchProjectById(filterProjectId) : Promise.resolve(null),
    ]).then(([data, proj]) => {
      setPostings(data);
      setFilterProject(proj);
      const uniqueProjectIds = [...new Set(data.map((p) => p.project_id))];
      const uniqueRoleIds = [...new Set(data.map((p) => p.role_id))];
      Promise.all([
        ...uniqueProjectIds.map((id) => fetchProjectById(id)),
        ...uniqueRoleIds.map((id) => fetchRoleById(id)),
      ]).then((results) => {
        const pCache: Record<string, DbProject> = {};
        const rCache: Record<string, DbProjectRole> = {};
        results.forEach((item) => {
          if (!item) return;
          if ("source_type" in item) pCache[item.id] = item as DbProject;
          else rCache[item.id] = item as DbProjectRole;
        });
        setProjectCache(pCache);
        setRoleCache(rCache);
      });
    }).finally(() => setLoading(false));

    fetchProjects().then(setAllProjects).catch(() => {});
  }, [filterProjectId]);

  // When project is selected in new form, load its roles
  useEffect(() => {
    if (newForm.projectId) {
      fetchRolesForProject(newForm.projectId).then(setNewFormRoles).catch(() => setNewFormRoles([]));
    } else {
      setNewFormRoles([]);
    }
  }, [newForm.projectId]);

  const industries = useMemo(() => [...new Set(postings.map((p) => p.industry).filter(Boolean))], [postings]);

  const filteredPostings = useMemo(() => {
    return postings.filter((p) => {
      if (filterStatus && p.status !== filterStatus) return false;
      if (filterIndustry && p.industry !== filterIndustry) return false;
      if (filterPriority && (p.priority ?? "medium") !== filterPriority) return false;
      return true;
    });
  }, [postings, filterStatus, filterIndustry, filterPriority]);

  const hasFilters = filterStatus || filterIndustry || filterPriority;

  async function handleCreatePosting(e: React.FormEvent) {
    e.preventDefault();
    if (!newForm.title.trim() || !newForm.projectId || !newForm.roleId) return;
    setSaving(true);
    try {
      const project = allProjects.find((p) => p.id === newForm.projectId);
      const created = await createPosting({
        title: newForm.title.trim(),
        description: newForm.description.trim() || null,
        project_id: newForm.projectId,
        role_id: newForm.roleId,
        tenant_id: project?.tenant_id ?? "",
        raw_text: null,
        status: newForm.status as DbJobPosting["status"],
        extension_mode: "manual-ai-assisted",
        custom_attributes: null,
        mapped_profile: null,
        created_by: "",
        priority: newForm.priority,
        duration_months: Number(newForm.durationMonths) || 6,
        industry: newForm.industry,
        phase: project?.phase ?? "requirements",
        constraints: [],
        additional_attributes: [],
      });
      setPostings((prev) => [created, ...prev]);
      setShowNewForm(false);
      setNewForm({ title: "", description: "", projectId: "", roleId: "", status: "draft", priority: "medium", durationMonths: "6", industry: "" });
      push("success", locale === "de" ? "Ausschreibung erstellt" : "Posting created", created.title);
    } catch {
      push("error", locale === "de" ? "Fehler" : "Error", locale === "de" ? "Ausschreibung konnte nicht erstellt werden." : "Could not create posting.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 rounded-3xl bg-ink/5" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-2xl bg-ink/5" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <CardHeader
          title={locale === "de" ? "Ausschreibungen" : "Job postings"}
          subtitle={
            filterProject
              ? locale === "de"
                ? `${filteredPostings.length} Ausschreibungen für "${filterProject.title}"`
                : `${filteredPostings.length} postings for "${filterProject.title}"`
              : locale === "de"
                ? `${filteredPostings.length} Ausschreibungen über alle Projekte`
                : `${filteredPostings.length} postings across all projects`
          }
          action={
            <div className="flex items-center gap-2">
              {canCreate && (
                <Button size="sm" onClick={() => setShowNewForm(true)}>
                  <Plus className="h-4 w-4" />
                  {locale === "de" ? "Neue Ausschreibung" : "New posting"}
                </Button>
              )}
            </div>
          }
        />

        {filterProject && (
          <div className="mt-3">
            <Link href="/postings">
              <Button variant="ghost" size="sm">
                {locale === "de" ? "\u00d7 Filter aufheben" : "\u00d7 Clear filter"}
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Filter bar */}
      <Card padding="sm">
        <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
          <Filter className="hidden h-4 w-4 text-ink/40 lg:block" />
          <Select label="" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full sm:w-auto sm:min-w-[140px]">
            <option value="">{locale === "de" ? "Alle Status" : "All statuses"}</option>
            <option value="active">{locale === "de" ? "Aktiv" : "Active"}</option>
            <option value="draft">{locale === "de" ? "Entwurf" : "Draft"}</option>
            <option value="paused">{locale === "de" ? "Pausiert" : "Paused"}</option>
            <option value="closed">{locale === "de" ? "Geschlossen" : "Closed"}</option>
            <option value="filled">{locale === "de" ? "Besetzt" : "Filled"}</option>
          </Select>
          <Select label="" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="w-full sm:w-auto sm:min-w-[140px]">
            <option value="">{locale === "de" ? "Alle Prioritäten" : "All priorities"}</option>
            <option value="high">{locale === "de" ? "Hoch" : "High"}</option>
            <option value="medium">{locale === "de" ? "Mittel" : "Medium"}</option>
            <option value="low">{locale === "de" ? "Niedrig" : "Low"}</option>
          </Select>
          {industries.length > 0 && (
            <Select label="" value={filterIndustry} onChange={(e) => setFilterIndustry(e.target.value)} className="w-full sm:w-auto sm:min-w-[140px]">
              <option value="">{locale === "de" ? "Alle Branchen" : "All industries"}</option>
              {industries.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
            </Select>
          )}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={() => { setFilterStatus(""); setFilterIndustry(""); setFilterPriority(""); }}>
              <X className="h-3 w-3" />
              {locale === "de" ? "Filter zurücksetzen" : "Clear filters"}
            </Button>
          )}
        </div>
      </Card>

      {/* New posting form */}
      {showNewForm && (
        <Card>
          <CardHeader title={locale === "de" ? "Neue Ausschreibung erstellen" : "Create new posting"} />
          <form onSubmit={handleCreatePosting} className="mt-4 space-y-4">
            <Input label={locale === "de" ? "Titel" : "Title"} required value={newForm.title} onChange={(e) => setNewForm((f) => ({ ...f, title: e.target.value }))} />
            <Textarea label={locale === "de" ? "Beschreibung" : "Description"} value={newForm.description} onChange={(e) => setNewForm((f) => ({ ...f, description: e.target.value }))} className="h-20" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label={locale === "de" ? "Projekt" : "Project"} required value={newForm.projectId} onChange={(e) => setNewForm((f) => ({ ...f, projectId: e.target.value, roleId: "" }))}>
                <option value="">{locale === "de" ? "-- Projekt wählen --" : "-- Select project --"}</option>
                {allProjects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </Select>
              <Select label={locale === "de" ? "Rolle" : "Role"} required value={newForm.roleId} onChange={(e) => setNewForm((f) => ({ ...f, roleId: e.target.value }))} disabled={!newForm.projectId}>
                <option value="">{locale === "de" ? "-- Rolle wählen --" : "-- Select role --"}</option>
                {newFormRoles.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Select label="Status" value={newForm.status} onChange={(e) => setNewForm((f) => ({ ...f, status: e.target.value }))}>
                <option value="draft">{locale === "de" ? "Entwurf" : "Draft"}</option>
                <option value="active">{locale === "de" ? "Aktiv" : "Active"}</option>
              </Select>
              <Select label={locale === "de" ? "Priorität" : "Priority"} value={newForm.priority} onChange={(e) => setNewForm((f) => ({ ...f, priority: e.target.value as PostingPriority }))}>
                <option value="high">{locale === "de" ? "Hoch" : "High"}</option>
                <option value="medium">{locale === "de" ? "Mittel" : "Medium"}</option>
                <option value="low">{locale === "de" ? "Niedrig" : "Low"}</option>
              </Select>
              <Input label={locale === "de" ? "Dauer (Monate)" : "Duration (months)"} value={newForm.durationMonths} onChange={(e) => setNewForm((f) => ({ ...f, durationMonths: e.target.value }))} />
            </div>
            <Input label={locale === "de" ? "Branche" : "Industry"} value={newForm.industry} onChange={(e) => setNewForm((f) => ({ ...f, industry: e.target.value }))} />
            <div className="flex gap-3">
              <Button type="submit" disabled={saving || !newForm.title.trim() || !newForm.projectId || !newForm.roleId}>
                {saving ? (locale === "de" ? "Erstellen..." : "Creating...") : (locale === "de" ? "Erstellen" : "Create")}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowNewForm(false)}>
                {locale === "de" ? "Abbrechen" : "Cancel"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {filteredPostings.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-sm text-ink/50">
            {locale === "de" ? "Keine Ausschreibungen vorhanden." : "No postings found."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPostings.map((posting) => {
            const project = projectCache[posting.project_id] ?? null;
            const role = roleCache[posting.role_id] ?? null;
            const priority = posting.priority ?? "medium";
            const isActive = posting.status === "active";

            return (
              <Link key={posting.id} href={`/postings/${posting.id}`}>
                <Card className={`h-full transition hover:shadow-lg hover:-translate-y-0.5 ${PRIORITY_COLORS[priority] ?? ""} ${isActive ? "ring-1 ring-moss/20" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CircleDot className={`h-4 w-4 ${isActive ? "text-moss" : "text-ink/30"}`} />
                      <h3 className="font-semibold text-ink leading-snug">{posting.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={PRIORITY_BADGE[priority] ?? "info"} className="text-[10px]">
                        {priority === "high" ? (locale === "de" ? "Hoch" : "High") : priority === "medium" ? (locale === "de" ? "Mittel" : "Med") : (locale === "de" ? "Niedrig" : "Low")}
                      </Badge>
                      <Badge variant={STATUS_VARIANT[posting.status] ?? "info"} className={isActive ? "animate-pulse" : ""}>
                        {locale === "de" ? STATUS_LABEL_DE[posting.status] ?? posting.status : posting.status}
                      </Badge>
                    </div>
                  </div>

                  {posting.description && <p className="mt-2 line-clamp-2 text-sm text-ink/60">{posting.description}</p>}

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/50">
                    {project && (
                      <span className="flex items-center gap-1">
                        <FolderOpen className="h-3 w-3" /> {project.title}
                      </span>
                    )}
                    {role && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" /> {role.title}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-ink/35">
                    {posting.duration_months} {locale === "de" ? "Monate" : "months"} · {posting.industry}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
