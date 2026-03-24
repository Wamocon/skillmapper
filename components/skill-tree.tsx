"use client";

import { useState } from "react";
import type { CandidateSkill, Requirement, RequirementType } from "@/lib/mock-skillmapper";

type SkillTreeNode = {
  id: string;
  name: string;
  level: number;
  category: string;
  requirementType?: RequirementType;
  subtitle?: string;
};

interface SkillTreeProps {
  title: string;
  nodes: SkillTreeNode[];
  emptyText?: string;
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bar: string; dot: string }> = {
  hard: { label: "Hard Skills", color: "text-moss", bar: "bg-moss", dot: "bg-moss" },
  soft: { label: "Soft Skills", color: "text-rust", bar: "bg-rust", dot: "bg-rust" },
  tool: { label: "Tools", color: "text-blue-600", bar: "bg-blue-500", dot: "bg-blue-500" },
  certification: { label: "Zertifikate", color: "text-amber-600", bar: "bg-amber-500", dot: "bg-amber-500" },
};

function LevelRing({ level, maxLevel = 10, color }: { level: number; maxLevel?: number; color: string }) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, level / maxLevel));
  const dashOffset = circumference * (1 - progress);
  return (
    <svg width={36} height={36} viewBox="0 0 36 36" className="shrink-0">
      <circle cx={18} cy={18} r={radius} fill="none" stroke="rgba(18,38,32,0.08)" strokeWidth={3} />
      <circle
        cx={18}
        cy={18}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform="rotate(-90 18 18)"
        className={color}
      />
      <text x={18} y={22} textAnchor="middle" fontSize={9} fontWeight="700" fill="currentColor" className={color}>
        {level}
      </text>
    </svg>
  );
}

function SkillNode({ node }: { node: SkillTreeNode }) {
  const [hovered, setHovered] = useState(false);
  const config = CATEGORY_CONFIG[node.category] ?? CATEGORY_CONFIG.hard;
  const isMust = node.requirementType === "must";
  const isCan = node.requirementType === "can";

  return (
    <li
      className={`relative flex items-center gap-3 rounded-xl border p-3 transition-all duration-150 ${
        hovered ? "border-ink/20 bg-white/80 shadow-sm" : "border-ink/8 bg-fog/20"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <LevelRing level={node.level} color={config.color} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-sm font-semibold text-ink">{node.name}</p>
          {isMust && (
            <span className="rounded-full border border-rust/30 bg-rust/10 px-1.5 py-0.5 text-xs font-bold text-rust">
              Pflicht
            </span>
          )}
          {isCan && (
            <span className="rounded-full border border-blue-300/50 bg-blue-50 px-1.5 py-0.5 text-xs font-bold text-blue-600">
              Optional
            </span>
          )}
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
          <div
            className={`h-full rounded-full transition-all duration-500 ${config.bar}`}
            style={{ width: `${Math.max(4, node.level * 10)}%` }}
          />
        </div>
        {hovered && node.subtitle && (
          <p className="mt-1 text-xs text-ink/50">{node.subtitle}</p>
        )}
      </div>
    </li>
  );
}

export function SkillTree({ title, nodes, emptyText = "Keine Skills vorhanden." }: SkillTreeProps) {
  if (nodes.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="font-heading text-2xl text-ink">{title}</h3>
        <p className="rounded-xl border border-ink/10 bg-fog/30 p-3 text-sm text-ink/70">{emptyText}</p>
      </div>
    );
  }

  // Group by category
  const grouped: Record<string, SkillTreeNode[]> = {};
  for (const node of nodes) {
    if (!grouped[node.category]) grouped[node.category] = [];
    grouped[node.category].push(node);
  }
  const categoryOrder = ["hard", "soft", "tool", "certification"];
  const sortedCategories = [
    ...categoryOrder.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !categoryOrder.includes(c)),
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-2xl text-ink">{title}</h3>
      {sortedCategories.map((cat) => {
        const config = CATEGORY_CONFIG[cat] ?? { label: cat, color: "text-ink/60", bar: "bg-ink/40", dot: "bg-ink/40" };
        return (
          <div key={cat}>
            <div className="mb-2 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${config.dot}`} />
              <p className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>{config.label}</p>
            </div>
            <ul className="space-y-1.5">
              {grouped[cat].map((node) => (
                <SkillNode key={node.id} node={node} />
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function mapRequirementNodes(requirements: Requirement[]): SkillTreeNode[] {
  return requirements.map((requirement) => ({
    id: requirement.id,
    name: requirement.name,
    level: requirement.targetLevel,
    category: requirement.category,
    requirementType: requirement.requirementType,
    subtitle: `Gewicht ${requirement.weight} · ${requirement.evidence}`,
  }));
}

export function mapCandidateSkillNodes(skills: CandidateSkill[]): SkillTreeNode[] {
  return skills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    level: skill.level,
    category: skill.category,
    subtitle: `${skill.years} ${skill.years === 1 ? "Jahr" : "Jahre"} Erfahrung · ${skill.evidence}`,
  }));
}
