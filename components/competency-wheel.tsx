"use client";

import { useState } from "react";
import type { MatchDetail } from "@/lib/mock-skillmapper";

interface CompetencyWheelProps {
  details: MatchDetail[];
  size?: number;
}

const CATEGORY_LABEL: Record<string, string> = {
  hard: "Hard Skill",
  soft: "Soft Skill",
  tool: "Tool",
  certification: "Zertifikat",
};

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildPolygonPath(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ") + " Z";
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export function CompetencyWheel({ details, size = 400 }: CompetencyWheelProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const trimmed = details.slice(0, 14); // max 14 axes for readability
  const N = trimmed.length;

  if (N < 3) {
    return (
      <p className="rounded-xl border border-ink/10 bg-fog/30 p-4 text-sm text-ink/60">
        Mindestens 3 Anforderungen erforderlich.
      </p>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const maxR = (size / 2) * 0.60;
  const labelR = (size / 2) * 0.82;
  const RINGS = [2, 4, 6, 8, 10];

  const angles = trimmed.map((_, i) => (360 / N) * i);

  // Requirement polygon (target levels)
  const reqPoints = trimmed.map((d, i) => {
    const r = maxR * Math.max(0.06, d.requirement.targetLevel / 10);
    return polarToXY(cx, cy, r, angles[i]);
  });

  // Candidate polygon (actual levels)
  const candPoints = trimmed.map((d, i) => {
    const level = d.matchedSkill?.level ?? 0;
    const r = maxR * Math.max(0.03, level / 10);
    return polarToXY(cx, cy, r, angles[i]);
  });

  const statusColor = (status: MatchDetail["status"]) => {
    if (status === "matched") return { stroke: "#294f3f", fill: "rgba(41,79,63,0.15)", label: "#294f3f" };
    if (status === "partial") return { stroke: "#d97706", fill: "rgba(217,119,6,0.15)", label: "#d97706" };
    return { stroke: "#9a3412", fill: "rgba(154,52,18,0.12)", label: "#9a3412" };
  };

  const hoveredDetail = hovered !== null ? trimmed[hovered] : null;
  const level = hoveredDetail?.matchedSkill?.level ?? 0;
  const targetLevel = hoveredDetail?.requirement.targetLevel ?? 0;
  const delta = level - targetLevel;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-5 rounded border-2 border-dashed border-moss/60 bg-moss/5" />
          <span className="text-ink/70">Anforderung (Ziel)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-5 rounded border-2 border-moss bg-moss/20" />
          <span className="text-ink/70">Bewerber (Ist)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-moss inline-block" />
          <span className="text-ink/70">Erfüllt</span>
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block ml-2" />
          <span className="text-ink/70">Teilweise</span>
          <span className="h-2.5 w-2.5 rounded-full bg-rust inline-block ml-2" />
          <span className="text-ink/70">Fehlt</span>
        </div>
      </div>

      {/* SVG Wheel */}
      <div className="relative w-full" style={{ maxWidth: size }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width="100%"
          preserveAspectRatio="xMidYMid meet"
          className="overflow-visible"
        >
          {/* Grid rings */}
          {RINGS.map((ring) => {
            const pts = angles.map((angle) => {
              const r = maxR * (ring / 10);
              return polarToXY(cx, cy, r, angle);
            });
            return (
              <polygon
                key={ring}
                points={pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
                fill="none"
                strokeWidth="0.8"
                stroke="rgba(18,38,32,0.09)"
              />
            );
          })}

          {/* Ring level labels */}
          {RINGS.map((ring) => {
            const pos = polarToXY(cx, cy, maxR * (ring / 10), 0);
            return (
              <text
                key={`rl-${ring}`}
                x={pos.x + 4}
                y={pos.y - 3}
                fontSize={8}
                fill="rgba(18,38,32,0.35)"
                textAnchor="start"
              >
                {ring}
              </text>
            );
          })}

          {/* Axis lines */}
          {trimmed.map((_, i) => {
            const outer = polarToXY(cx, cy, maxR, angles[i]);
            return (
              <line
                key={`ax-${i}`}
                x1={cx}
                y1={cy}
                x2={outer.x.toFixed(2)}
                y2={outer.y.toFixed(2)}
                stroke="rgba(18,38,32,0.10)"
                strokeWidth="1"
              />
            );
          })}

          {/* Requirement polygon (dashed, target) */}
          <path
            d={buildPolygonPath(reqPoints)}
            fill="rgba(41,79,63,0.05)"
            stroke="#294f3f"
            strokeWidth="1.8"
            strokeDasharray="5 3"
            opacity="0.65"
          />

          {/* Candidate polygon (filled) */}
          <path
            d={buildPolygonPath(candPoints)}
            fill="rgba(41,79,63,0.18)"
            stroke="#294f3f"
            strokeWidth="2"
            opacity="0.85"
          />

          {/* Axis nodes & labels */}
          {trimmed.map((d, i) => {
            const labelPos = polarToXY(cx, cy, labelR, angles[i]);
            const nodePos = polarToXY(cx, cy, maxR, angles[i]);
            const colors = statusColor(d.status);
            const isHov = hovered === i;
            const label = truncate(d.requirement.name, 9);
            const isLeft = labelPos.x < cx - 10;
            const isRight = labelPos.x > cx + 10;

            return (
              <g
                key={`node-${i}`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Axis hit area */}
                <line
                  x1={cx} y1={cy}
                  x2={nodePos.x.toFixed(2)}
                  y2={nodePos.y.toFixed(2)}
                  stroke="transparent"
                  strokeWidth="16"
                />
                {/* Node dot */}
                <circle
                  cx={nodePos.x}
                  cy={nodePos.y}
                  r={isHov ? 5 : 3.5}
                  fill={colors.stroke}
                  opacity={isHov ? 1 : 0.7}
                />
                {/* Label background */}
                <rect
                  x={isLeft ? labelPos.x - 52 : isRight ? labelPos.x : labelPos.x - 26}
                  y={labelPos.y - 9}
                  width={52}
                  height={18}
                  rx={5}
                  fill={isHov ? colors.stroke : "rgba(245,240,231,0.92)"}
                  stroke={colors.stroke}
                  strokeWidth={isHov ? 0 : 1}
                  opacity={0.95}
                />
                {/* Label text */}
                <text
                  x={isLeft ? labelPos.x - 26 : isRight ? labelPos.x + 26 : labelPos.x}
                  y={labelPos.y + 3.5}
                  textAnchor="middle"
                  fontSize={isHov ? 9 : 8}
                  fontWeight={isHov ? "700" : "500"}
                  fill={isHov ? "#f5f0e7" : colors.label}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Center */}
          <circle cx={cx} cy={cy} r={3} fill="#294f3f" opacity={0.25} />
        </svg>
      </div>

      {/* Hover detail panel */}
      <div
        className={`w-full rounded-xl border transition-all duration-200 ${
          hoveredDetail
            ? "border-ink/15 bg-white/80 p-4 shadow-panel"
            : "border-transparent bg-transparent p-4 opacity-0 pointer-events-none"
        }`}
        style={{ minHeight: "80px" }}
      >
        {hoveredDetail && (
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-ink">{hoveredDetail.requirement.name}</p>
              <p className="mt-0.5 text-xs text-ink/55">
                {hoveredDetail.requirement.mustHave ? "Pflichtanforderung" : "Optionale Anforderung"} ·{" "}
                {CATEGORY_LABEL[hoveredDetail.requirement.category] ?? hoveredDetail.requirement.category} ·{" "}
                Gewicht: {hoveredDetail.requirement.weight}
              </p>
              {hoveredDetail.matchedSkill && (
                <p className="mt-1 text-xs text-ink/60">
                  {hoveredDetail.matchedSkill.years} {hoveredDetail.matchedSkill.years === 1 ? "Jahr" : "Jahre"} Erfahrung erfasst
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-ink/55">Ziel</p>
                <p className="font-heading text-2xl text-ink">{hoveredDetail.requirement.targetLevel}</p>
                <p className="text-xs text-ink/40">/ 10</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-ink/55">Ist</p>
                <p
                  className={`font-heading text-2xl ${
                    level >= targetLevel ? "text-moss" : level > 0 ? "text-amber-600" : "text-rust"
                  }`}
                >
                  {level}
                </p>
                <p className="text-xs text-ink/40">/ 10</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-ink/55">Differenz</p>
                <p
                  className={`font-heading text-2xl ${
                    delta >= 0 ? "text-moss" : delta >= -2 ? "text-amber-600" : "text-rust"
                  }`}
                >
                  {delta >= 0 ? `+${delta}` : delta}
                </p>
                <p className="text-xs text-ink/40">Level</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
