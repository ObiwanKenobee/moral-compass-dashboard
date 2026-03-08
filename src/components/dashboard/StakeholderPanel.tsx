import { useState } from "react";
import type { StakeholderImpact } from "@/data/decisions";
import { DIMENSIONS } from "@/data/decisions";

interface StakeholderPanelProps {
  stakeholders: StakeholderImpact[];
}

function getNetImpact(impacts: Record<string, number>): number {
  const values = Object.values(impacts);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function getNetColor(net: number): string {
  if (net >= 30) return "hsl(var(--positive))";
  if (net >= 0) return "hsl(var(--dim-economy))";
  if (net >= -30) return "hsl(25 90% 60%)";
  return "hsl(var(--negative))";
}

export function StakeholderPanel({ stakeholders }: StakeholderPanelProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = stakeholders[activeIdx];
  const net = getNetImpact(active.impacts);

  return (
    <div className="space-y-4">
      {/* Stakeholder tabs */}
      <div className="flex flex-wrap gap-2">
        {stakeholders.map((s, i) => {
          const sNet = getNetImpact(s.impacts);
          return (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-200 border ${
                i === activeIdx
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/50 text-muted-foreground hover:border-secondary"
              }`}
            >
              {s.stakeholder}
              <span
                className="ml-2 font-bold"
                style={{ color: getNetColor(sNet) }}
              >
                {sNet > 0 ? "+" : ""}{sNet}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active stakeholder detail */}
      <div className="bg-card border border-border rounded-xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h4 className="font-display text-base font-semibold text-foreground">{active.stakeholder}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{active.description}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-mono text-muted-foreground">Net Impact</p>
            <p className="text-xl font-mono font-bold" style={{ color: getNetColor(net) }}>
              {net > 0 ? "+" : ""}{net}
            </p>
          </div>
        </div>

        {/* Quote */}
        <blockquote className="border-l-2 border-primary/40 pl-4 mb-5">
          <p className="text-sm italic text-muted-foreground leading-relaxed">"{active.quote}"</p>
        </blockquote>

        {/* Impact breakdown */}
        <div className="grid grid-cols-3 gap-2">
          {DIMENSIONS.map((dim) => {
            const val = active.impacts[dim.key] ?? 0;
            return (
              <div
                key={dim.key}
                className="bg-muted/50 rounded-lg p-2.5 text-center"
              >
                <span className="text-base">{dim.icon}</span>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{dim.label}</p>
                <p
                  className="text-sm font-mono font-bold mt-0.5"
                  style={{ color: getNetColor(val) }}
                >
                  {val > 0 ? "+" : ""}{val}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
